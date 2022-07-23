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
                const firstDayInMonth = DateTime.local(calcFromDate.year, calcFromDate.month, 1)
                const adjustment = nextDayOfWeek >= firstDayInMonth.weekday ? nextDayOfWeek - firstDayInMonth.weekday : nextDayOfWeek - firstDayInMonth.weekday + 7
                const firstTargetDayInMonth = firstDayInMonth.plus({ days: adjustment })
                const occurancesInMonth = firstTargetDayInMonth.day + 28 > firstTargetDayInMonth.daysInMonth ? 4 : 5
                
                nextOccurance = nextOccurance.plus({weeks: occurancesInMonth - monthlyOccuranceNumber + 1})
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