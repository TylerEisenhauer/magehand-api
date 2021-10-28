import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcrypt'

export interface IUser extends Document{
    username: string
    password: string
    roles: string[]
}

const UserSchema: Schema = new Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    roles: {type: Array.of(String), required: true}
})

UserSchema.pre<IUser>('save', async function(next) {
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

export default mongoose.model<IUser>('User', UserSchema)