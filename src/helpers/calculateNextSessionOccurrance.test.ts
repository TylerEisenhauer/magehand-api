// @ts-nocheck
import { DateTime } from 'luxon'
import { ICampaign } from '../types/mongoose/campaign'
import { calculateNextSessionOccurrance } from './calculateNextSessionOccurrance'

describe('Calculate Next Session Date', () => {
    describe('Advanced Scheduling', () => {
        test('Obey Start Date', () => {
            const currentDate = DateTime.local(2022, 2, 7)
            const campaign: Partial<ICampaign> = {
                startDate: DateTime.local(2022, 7, 13).toJSDate(),
                occurs: {
                    frequency: 'advanced',
                    daysOfWeek: [3],
                    weekNumbers: [1, 2, 3],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 7, 13, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Schedule following week', () => {
            const currentDate = DateTime.local(2022, 6, 9)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 8, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'advanced',
                    daysOfWeek: [3],
                    weekNumbers: [1, 2, 3],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 15, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Skip consecutive weeks not specified', () => {
            const currentDate = DateTime.local(2022, 6, 16)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 15, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'advanced',
                    daysOfWeek: [3],
                    weekNumbers: [1, 2, 3],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 7, 6, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Skip nonconsecutive weeks not specified', () => {
            const currentDate = DateTime.local(2022, 6, 2)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 1, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'advanced',
                    daysOfWeek: [3],
                    weekNumbers: [1, 3],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 15, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Handle 4 Occurance Months', () => {
            const currentDate = DateTime.local(2022, 7, 21)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 7, 20, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'advanced',
                    daysOfWeek: [3],
                    weekNumbers: [1, 2, 3],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 8, 3, 19, 30, { zone: 'America/Chicago' })
    
            expect(result).toEqual(expected)
        })
        test('Handle 5 Occurance Months', () => {
            const currentDate = DateTime.local(2022, 7, 23)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 7, 22, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'advanced',
                    daysOfWeek: [5],
                    weekNumbers: [1, 2, 3],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 8, 5, 19, 30, { zone: 'America/Chicago' })
    
            expect(result).toEqual(expected)
        })
        test('Leap year consecutive sessions', () => {
            const currentDate = DateTime.local(2024, 2, 23)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2024, 2, 22, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'advanced',
                    daysOfWeek: [4],
                    weekNumbers: [1, 2, 3, 4, 5],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2024, 2, 29, 19, 30, { zone: 'America/Chicago' })
    
            expect(result).toEqual(expected)
        })
        test('Leap year skip sessions when 4 occurances', () => {
            const currentDate = DateTime.local(2024, 2, 17)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2024, 2, 16, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'advanced',
                    daysOfWeek: [5],
                    weekNumbers: [1, 2, 3],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2024, 3, 1, 19, 30, { zone: 'America/Chicago' })
    
            expect(result).toEqual(expected)
        })
        test('Leap year skip sessions when 5 occurances', () => {
            const currentDate = DateTime.local(2024, 2, 16)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2024, 2, 15, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'advanced',
                    daysOfWeek: [4],
                    weekNumbers: [1, 2, 3],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2024, 3, 7, 19, 30, { zone: 'America/Chicago' })
    
            expect(result).toEqual(expected)
        })
        test('Handle only first week of month', () => {
            const currentDate = DateTime.local(2022, 7, 7)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 7, 6, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'advanced',
                    daysOfWeek: [3],
                    weekNumbers: [1],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 8, 3, 19, 30, { zone: 'America/Chicago' })
    
            expect(result).toEqual(expected)
        })
        test('Skip multiple weeks', () => {
            const currentDate = DateTime.local(2022, 6, 2)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 1, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'advanced',
                    daysOfWeek: [3],
                    weekNumbers: [1, 5],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 29, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Schedule first session in month', () => {
            const currentDate = DateTime.local(2022, 6, 30)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 29, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'advanced',
                    daysOfWeek: [3],
                    weekNumbers: [1, 5],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 7, 6, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Skip consecutive weeks when crossing month', () => {
            const currentDate = DateTime.local(2022, 6, 30)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 29, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'advanced',
                    daysOfWeek: [3],
                    weekNumbers: [4, 5],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 7, 27, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Handle multiple days in same week', () => {
            const currentDate = DateTime.local(2022, 6, 2)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 1, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'advanced',
                    daysOfWeek: [3, 5],
                    weekNumbers: [1, 2, 3],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 3, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Handle multiple days in same week, crossing into the next', () => {
            const currentDate = DateTime.local(2022, 6, 4)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 3, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'advanced',
                    daysOfWeek: [3, 5],
                    weekNumbers: [1, 2, 3],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 8, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Handle multiple days in same week, crossing into the next after last day of week', () => {
            const currentDate = DateTime.local(2022, 6, 6)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 5, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'advanced',
                    daysOfWeek: [1, 7],
                    weekNumbers: [1, 2, 3],
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 6, 19, 30, { zone: 'America/Chicago' })

            expect(result).toEqual(expected)
        })
        test('Handle non default timezone', () => {
            const currentDate = DateTime.local(2022, 6, 6)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 5, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'advanced',
                    daysOfWeek: [1, 7],
                    weekNumbers: [1, 2, 3],
                    time: '19:30',
                    timezone: 'America/New_York'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 6, 19, 30, { zone: 'America/New_York' })
    
            expect(result).toEqual(expected)
        })
    })
    describe('Weekly Scheduling', () => {
        test('Obey Start Date', () => {
            const currentDate = DateTime.local(2022, 2, 2)
            const campaign: Partial<ICampaign> = {
                startDate: DateTime.local(2022, 7, 13, { zone: 'America/Chicago' }).toJSDate(),
                occurs: {
                    frequency: 'weekly',
                    weeksBetween: 0,
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 7, 13, 19, 30, { zone: 'America/Chicago' })
    
            expect(result).toEqual(expected)
        })
        test('Handle weekly', () => {
            const currentDate = DateTime.local(2022, 6, 2)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 1, 19, 30, { zone: 'America/Chicago' }).toJSDate(),
                occurs: {
                    frequency: 'weekly',
                    weeksBetween: 0,
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 8, 19, 30, { zone: 'America/Chicago' })
    
            expect(result).toEqual(expected)
        })
        test('Handle biweekly', () => {
            const currentDate = DateTime.local(2022, 6, 2)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 1, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'weekly',
                    weeksBetween: 1,
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 15, 19, 30, { zone: 'America/Chicago' })
    
            expect(result).toEqual(expected)
        })
        test('Handle every 3rd week', () => {
            const currentDate = DateTime.local(2022, 6, 2)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 1, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'weekly',
                    weeksBetween: 2,
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 22, 19, 30, { zone: 'America/Chicago' })
    
            expect(result).toEqual(expected)
        })
        test('Handle every 4th week', () => {
            const currentDate = DateTime.local(2022, 6, 2)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 1, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'weekly',
                    weeksBetween: 3,
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 6, 29, 19, 30, { zone: 'America/Chicago' })
    
            expect(result).toEqual(expected)
        })
        test('Handle crossing month', () => {
            const currentDate = DateTime.local(2022, 6, 23)
            const campaign: Partial<ICampaign> = {
                scheduledThrough: DateTime.local(2022, 6, 22, 19, 30).toJSDate(),
                occurs: {
                    frequency: 'weekly',
                    weeksBetween: 1,
                    time: '19:30',
                    timezone: 'America/Chicago'
                }
            }
            const result = calculateNextSessionOccurrance(currentDate, campaign)
            const expected = DateTime.local(2022, 7, 6, 19, 30, { zone: 'America/Chicago' })
    
            expect(result).toEqual(expected)
        })
    })
})