// @ts-nocheck
import { DateTime } from 'luxon'
import { ICampaign } from './types/mongoose/campaign'
import { calculateNextOccurance } from './worker'

describe('Calculate Next Session Date', () => {
    describe('Advanced Scheduling', () => {
        test('Schedule following week', () => {
            const currentDate = DateTime.local(2022, 6, 9)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 8, 19, 30).toJSDate(),
                frequency: {
                    occurs: 'advancedScheduling',
                    daysOfWeek: [3],
                    weekNumbers: [1, 2, 3],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextOccurance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 15, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Skip consecutive weeks not specified', () => {
            const currentDate = DateTime.local(2022, 6, 16)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 15, 19, 30).toJSDate(),
                frequency: {
                    occurs: 'advancedScheduling',
                    daysOfWeek: [3],
                    weekNumbers: [1, 2, 3],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextOccurance(currentDate, campaign)
            const expected = DateTime.local(2022, 7, 6, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Skip nonconsecutive weeks not specified', () => {
            const currentDate = DateTime.local(2022, 6, 2)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 1, 19, 30).toJSDate(),
                frequency: {
                    occurs: 'advancedScheduling',
                    daysOfWeek: [3],
                    weekNumbers: [1, 3],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextOccurance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 15, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Skip multiple weeks', () => {
            const currentDate = DateTime.local(2022, 6, 2)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 1, 19, 30).toJSDate(),
                frequency: {
                    occurs: 'advancedScheduling',
                    daysOfWeek: [3],
                    weekNumbers: [1, 5],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextOccurance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 29, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Schedule first session in month', () => {
            const currentDate = DateTime.local(2022, 6, 30)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 29, 19, 30).toJSDate(),
                frequency: {
                    occurs: 'advancedScheduling',
                    daysOfWeek: [3],
                    weekNumbers: [1, 5],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextOccurance(currentDate, campaign)
            const expected = DateTime.local(2022, 7, 6, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Skip consecutive weeks when crossing month', () => {
            const currentDate = DateTime.local(2022, 6, 30)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 29, 19, 30).toJSDate(),
                frequency: {
                    occurs: 'advancedScheduling',
                    daysOfWeek: [3],
                    weekNumbers: [4, 5],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextOccurance(currentDate, campaign)
            const expected = DateTime.local(2022, 7, 27, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Handle multiple days in same week', () => {
            const currentDate = DateTime.local(2022, 6, 2)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 1, 19, 30).toJSDate(),
                frequency: {
                    occurs: 'advancedScheduling',
                    daysOfWeek: [3, 5],
                    weekNumbers: [1, 2, 3],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextOccurance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 3, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Handle multiple days in same week, crossing into the next', () => {
            const currentDate = DateTime.local(2022, 6, 4)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 3, 19, 30).toJSDate(),
                frequency: {
                    occurs: 'advancedScheduling',
                    daysOfWeek: [3, 5],
                    weekNumbers: [1, 2, 3],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextOccurance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 8, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Handle multiple days in same week, crossing into the next after last day of week', () => {
            const currentDate = DateTime.local(2022, 6, 6)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 5, 19, 30).toJSDate(),
                frequency: {
                    occurs: 'advancedScheduling',
                    daysOfWeek: [1, 7],
                    weekNumbers: [1, 2, 3],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextOccurance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 6, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Handle non default timezone', () => {
            const currentDate = DateTime.local(2022, 6, 6)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 5, 19, 30).toJSDate(),
                frequency: {
                    occurs: 'advancedScheduling',
                    daysOfWeek: [1, 7],
                    weekNumbers: [1, 2, 3],
                    time: '19:30',
                    timezone: 'America/New_York'
                }
            }
            const result = calculateNextOccurance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 6, 19, 30, { zone: 'America/New_York' })
    
            expect(result).toEqual(expected)
        })
    })
    describe('Weekly Scheduling', () => {
        test('Handle weekly', () => {
            const currentDate = DateTime.local(2022, 6, 2)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 1, 19, 30, { zone: 'America/Chicago' }).toJSDate(),
                frequency: {
                    occurs: 'weekly',
                    weeksBetween: 0,
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextOccurance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 8, 19, 30, { zone: 'America/Chicago' })
    
            expect(result).toEqual(expected)
        })
        test('Handle biweekly', () => {
            const currentDate = DateTime.local(2022, 6, 2)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 1, 19, 30).toJSDate(),
                frequency: {
                    occurs: 'weekly',
                    weeksBetween: 1,
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextOccurance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 15, 19, 30, { zone: 'America/Chicago' })
    
            expect(result).toEqual(expected)
        })
        test('Handle every 3rd week', () => {
            const currentDate = DateTime.local(2022, 6, 2)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 1, 19, 30).toJSDate(),
                frequency: {
                    occurs: 'weekly',
                    weeksBetween: 2,
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextOccurance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 22, 19, 30, { zone: 'America/Chicago' })
    
            expect(result).toEqual(expected)
        })
        test('Handle every 4th week', () => {
            const currentDate = DateTime.local(2022, 6, 2)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 1, 19, 30).toJSDate(),
                frequency: {
                    occurs: 'weekly',
                    weeksBetween: 3,
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextOccurance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 29, 19, 30, { zone: 'America/Chicago' })
    
            expect(result).toEqual(expected)
        })
        test('Handle crossing month', () => {
            const currentDate = DateTime.local(2022, 6, 23)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 22, 19, 30).toJSDate(),
                frequency: {
                    occurs: 'weekly',
                    weeksBetween: 1,
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextOccurance(currentDate, campaign)
            const expected = DateTime.local(2022, 7, 6, 19, 30, { zone: 'America/Chicago' })
    
            expect(result).toEqual(expected)
        })
    })
})