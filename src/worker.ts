import { DateTime } from 'luxon'

import { calculateNextSessionOccurrance } from './helpers'
import { sendSessionsToQueue } from './helpers/sendSessionsToQueue'
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
            $or: [
                {
                    date: { $gte: startDate, $lte: endDate },
                    reminderSent: false,
                    cancelled: false
                },
                {
                    cancelled: false,
                    messageId: null
                }
            ]

        })

        if (sessions) {
            sendSessionsToQueue(sessions)
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
                { scheduledThrough: { $lte: currentDate.minus({ hour: 12 }) } } // wait 12 hours so the next session isn't scheduled during the currently running one
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
                owner: campaign.owner,
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
