import mongoose, { Schema, Document } from 'mongoose'

export interface ICampaign extends Document {
    channel: string
    description: string
    ended: boolean
    occurs: {
        daysOfWeek?: number[]
        frequency: 'advanced' | 'weekly'
        time: string,
        timezone: string
        weekNumbers?: number[]
        weeksBetween?: number
    }
    guild: string
    location: string
    name: string
    nextSessionNumber: number
    owner: string
    scheduledThrough?: Date
    startDate: Date
}

const CampaignSchema: Schema = new Schema({
    channel: { type: String, required: true },
    description: { type: String, required: true },
    ended: { type: Boolean, required: true },
    occurs: {
        daysOfWeek: { type: [Number], required: true },
        frequency: { type: String, enum: ['advanced', 'weekly'], required: true },
        time: { type: String, required: false },
        timezone: { type: String, required: false },
        weekNumbers: { type: [Number], required: false },
        weeksBetween: { type: Number, required: false }
    },
    guild: { type: String, required: true },
    location: { type: String, required: true },
    name: { type: String, required: true },
    owner: { type: String, required: true },
    scheduledThrough: { type: Date, required: false },
    nextSessionNumber: { type: Number, required: false },
    startDate: { type: Date, required: true }
})

export default mongoose.model<ICampaign>('Campaign', CampaignSchema)
