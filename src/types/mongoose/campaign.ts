import mongoose, { Schema, Document } from 'mongoose'

export interface ICampaign extends Document {
    startDate: Date
    scheduledThrough?: Date
    ended: boolean
    channel: string
    frequency: {
        occurs: 'advancedScheduling' | 'weekly'
        daysOfWeek?: number[]
        weekNumbers?: number[]
        weeksBetween?: number
        time: string,
        timezone: string
    }
    description: string
    guild: string
    location: string
    name: string
    initialSessionNumber: number
    nextSessionNumber: number
}

const CampaignSchema: Schema = new Schema({
    startDate: { type: Date, required: true },
    scheduledThrough: { type: Date, required: false },
    ended: { type: Boolean, required: true },
    channel: { type: String, required: true },
    frequency: {
        occurs: { type: String, enum: ['advancedScheduling', 'weekly'], required: true },
        daysOfWeek: { type: [Number], required: true },
        weekNumbers: { type: [Number], required: false },
        time: { type: String, required: false },
        timezone: { type: String, required: false }
    },
    description: { type: String, required: true },
    guild: { type: String, required: true },
    location: { type: String, required: true },
    name: { type: String, required: true },
    initialSessionNumber: { type: Number, required: false },
    sessionNumber: { type: Number, required: false }
})

export default mongoose.model<ICampaign>('Campaign', CampaignSchema)
