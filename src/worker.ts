import amqp from 'amqplib'
import { DateTime } from 'luxon'
import { calculateNextSessionOccurrance } from './helpers'

import Campaign, { ICampaign } from './types/mongoose/campaign'
import Session, { ISession } from './types/mongoose/session'

export async function startWorker() {
    await processCampaigns()
    await processSessions()

    setInterval(async () => {
        await processCampaigns()
        await processSessions()
    }, 1000 * 10)
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
    try {
        const currentDate = DateTime.now()

        const campaigns: ICampaign[] = await Campaign.find({
            ended: false,
            $or: [
                { scheduledThrough: null },
                { scheduledThrough: { $lte: currentDate } }
            ]
        })

        campaigns.map(async campaign => {
            const nextOccurance = calculateNextSessionOccurrance(currentDate, campaign)
            const sessionNumber = campaign.nextSessionNumber || 0

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
    } catch (e) {
        console.log(e)
    }
}
