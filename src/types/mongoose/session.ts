import mongoose, {Schema, Document} from 'mongoose'

export interface ISession extends Document {
    campaign?: string
    cancelled: boolean
    channel: string
    date: Date
    description: string
    guild: string
    location: string
    messageId?: string
    name: string
    owner: string
    participants: string[]
    reminderSent: boolean
}

const SessionSchema: Schema = new Schema({
    campaign: {type: String, required: false},
    cancelled: {type: Boolean, required: true},
    channel: {type: String, required: true},
    date: {type: Date, required: true},
    description: {type: String, required: true},
    guild: {type: String, required: true},
    location: {type: String, required: true},
    messageId: {type: String, required: false},
    name: {type: String, required: true},
    owner: {type: String, required: true},
    participants: {type: [String], required: false},
    reminderSent: {type: Boolean, required: true}
})

export default mongoose.model<ISession>('Session', SessionSchema)
