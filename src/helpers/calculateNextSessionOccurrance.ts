import { DateTime } from 'luxon'

import { ICampaign } from '../types/mongoose'

export function calculateNextSessionOccurrance(currentDate: DateTime, campaign: ICampaign) {
    if (campaign.occurs.frequency === 'advanced') {
        const calcFromDate = DateTime.fromJSDate(campaign.startDate) > currentDate ? DateTime.fromJSDate(campaign.startDate) : currentDate
        const currentDayOfWeek = calcFromDate.weekday
        const nextDayOfWeek = campaign.occurs.daysOfWeek.slice().sort().find(x => x >= currentDayOfWeek) || campaign.occurs.daysOfWeek.slice().sort()[0]

        let nextOccurance: DateTime =
            nextDayOfWeek >= currentDayOfWeek ?
                calcFromDate.plus({ days: nextDayOfWeek - currentDayOfWeek }) :
                calcFromDate.plus({ days: (7 + nextDayOfWeek) - currentDayOfWeek })

        const monthlyOccuranceNumber = Math.ceil(nextOccurance.day / 7)
        const nextMonthlyOccuranceNumber = campaign.occurs.weekNumbers.slice().sort().find(x => x >= monthlyOccuranceNumber) || campaign.occurs.weekNumbers.slice().sort()[0]

        if (monthlyOccuranceNumber !== nextMonthlyOccuranceNumber) {
            if (monthlyOccuranceNumber < nextMonthlyOccuranceNumber) {
                nextOccurance = nextOccurance.plus({ weeks: nextMonthlyOccuranceNumber - monthlyOccuranceNumber })
            } else {
                do {
                    nextOccurance = nextOccurance.plus({ weeks: 1 })
                } while (Math.ceil(nextOccurance.day / 7) > nextMonthlyOccuranceNumber)
            }
        }

        const parsedTime = DateTime.fromISO(campaign.occurs.time)
        return DateTime.local(nextOccurance.year, nextOccurance.month, nextOccurance.day, parsedTime.hour, parsedTime.minute, {
            zone: campaign.occurs.timezone || 'America/Chicago'
        })
    } else if (campaign.occurs.frequency === 'weekly') {
        if (!campaign.scheduledThrough) {
            const startDate = DateTime.fromJSDate(campaign.startDate)
            const parsedTime = DateTime.fromISO(campaign.occurs.time)
            return DateTime.local(startDate.year, startDate.month, startDate.day, parsedTime.hour, parsedTime.minute, { zone: campaign.occurs.timezone || 'America/Chicago' })
        }

        return DateTime.fromJSDate(campaign.scheduledThrough, { zone: campaign.occurs.timezone || 'America/Chicago' }).plus({ weeks: campaign.occurs.weeksBetween + 1 })
    }
}