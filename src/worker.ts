import amqp from 'amqplib'
import { DateTime } from 'luxon'

import Campaign, { ICampaign } from './types/mongoose/campaign'
import Session, { ISession } from './types/mongoose/session'

export async function startWorker() {
    await processSessions()
    setInterval(async () => {
        await processSessions()
    }, 1000 * 60)
}

async function processSessions() {
    try {
        const startDate = DateTime.now()
        const endDate = startDate.plus({ hours: 6 })

        const sessions: ISession[] = await Session.find({
            date: { $gte: startDate, $lte: endDate },
            reminderSent: false,
            cancelled: false
        })

        if (sessions) {
            const connectionString = process.env.QUEUE_CONNECTION
            const queueName = process.env.SESSION_QUEUE_NAME

            const conn = await amqp.connect(connectionString)

            const channel = await conn.createConfirmChannel()

            const exchange = await channel.assertExchange(`${queueName}-delayed`, 'x-delayed-message', {
                autoDelete: true,
                durable: true,
                arguments: {
                    'x-delayed-type': 'direct'
                }
            })

            const queue = await channel.assertQueue(queueName, {
                durable: true
            })

            await channel.bindQueue(queueName, exchange.exchange, queueName)

            sessions.map(async session => {
                channel.publish(exchange.exchange, queue.queue, Buffer.from(JSON.stringify(session)), {
                    headers: {
                        'x-delay': 0
                    },
                    persistent: true
                })
                await session.updateOne({ $set: { reminderSent: true } })
            })

            await channel.waitForConfirms()

            await conn.close()
        }
    } catch (e) {
        console.log(e)
    }
}

async function processCampaigns() {
    const currentDate = DateTime.now()

    const campaigns: ICampaign[] = await Campaign.find({
        ended: false,
        $or: [
            { scheduledThrough: null },
            { scheduledThrough: { $lte: currentDate } }
        ]
    })

    campaigns.map(async campaign => {
        const nextOccurance = calculateNextOccurance(currentDate, campaign)
        const sessionNumber = campaign.nextSessionNumber ?? campaign.initialSessionNumber ?? 0

        const session: ISession = await Session.create({
            campaign: campaign.id,
            cancelled: false,
            channel: campaign.channel,
            date: nextOccurance.toJSDate(),
            description: campaign.description,
            guild: campaign.guild,
            location: campaign.location,
            name: `${campaign.name} - Session ${sessionNumber}`,
            participants: [],
            reminderSent: false
        })

        await campaign.updateOne({
            $set: {
                scheduledThrough: session.date,
                nextSessionNumber: sessionNumber + 1
            }
        })
    })
}

export function calculateNextOccurance(currentDate: DateTime, campaign: ICampaign) {
    if (campaign.frequency.occurs === 'advancedScheduling') {
        const currentDayOfWeek = currentDate.weekday
        const nextDayOfWeek = campaign.frequency.daysOfWeek.slice().sort().find(x => x >= currentDayOfWeek) ?? campaign.frequency.daysOfWeek.slice().sort()[0]

        let nextOccurance: DateTime =
            nextDayOfWeek >= currentDayOfWeek ?
                currentDate.plus({ days: nextDayOfWeek - currentDayOfWeek }) :
                currentDate.plus({ days: (7 + nextDayOfWeek) - currentDayOfWeek })


        const monthlyOccuranceNumber = Math.ceil(nextOccurance.day / 7)
        const nextMonthlyOccuranceNumber = campaign.frequency.weekNumbers.slice().sort().find(x => x >= monthlyOccuranceNumber) ?? campaign.frequency.weekNumbers.slice().sort()[0]

        if (monthlyOccuranceNumber !== nextMonthlyOccuranceNumber) {
            if (monthlyOccuranceNumber < nextMonthlyOccuranceNumber) {
                nextOccurance = nextOccurance.plus({ weeks: nextMonthlyOccuranceNumber - monthlyOccuranceNumber })
            } else {
                nextOccurance = nextOccurance.plus({ weeks: nextMonthlyOccuranceNumber + 1 })
            }
        }

        const parsedTime = DateTime.fromISO(campaign.frequency.time)
        return DateTime.local(nextOccurance.year, nextOccurance.month, nextOccurance.day, parsedTime.hour, parsedTime.minute, {
            zone: campaign.frequency.timezone || 'America/Chicago'
        })
    } else if (campaign.frequency.occurs === 'weekly') {
        const lastSession = campaign.scheduledThrough || campaign.startDate
        
        return DateTime.fromJSDate(lastSession, { zone: campaign.frequency.timezone || 'America/Chicago' }).plus({ weeks: campaign.frequency.weeksBetween + 1 })
    }
}
