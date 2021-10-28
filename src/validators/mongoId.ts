import mongoose from 'mongoose'

export const mongoIdValidator = (value: string) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid mongo id')
    }
    return true
}