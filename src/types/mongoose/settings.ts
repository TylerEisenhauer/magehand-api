import mongoose, {Schema, Document} from 'mongoose'

export interface ISettings extends Document{
    guildId: string,
    testSetting: boolean
}

const SettingsSchema: Schema = new Schema({
    guildId: {type: String, required: true},
    testSetting: {type: Boolean, required: true}
})

export default mongoose.model<ISettings>('Settings', SettingsSchema)

