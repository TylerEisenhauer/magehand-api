import mongoose, {Schema, Document} from 'mongoose'

export interface ISession extends Document {
    cancelled: boolean
    channel: string
    date: Date
    description: string
    guild: string
    location: string
    name: string
    participants: string[]
    reminderSent: boolean
}

const SessionSchema: Schema = new Schema({
    cancelled: {type: Boolean, required: true},
    channel: {type: String, required: true},
    date: {type: Date, required: true},
    description: {type: String, required: true},
    guild: {type: String, required: true},
    location: {type: String, required: true},
    name: {type: String, required: true},
    participants: {type: Array.of(String), required: false},
    reminderSent: {type: Boolean, required: true}
})

export default mongoose.model<ISession>('Session', SessionSchema)