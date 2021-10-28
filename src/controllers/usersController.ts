import express from 'express'
import User from '../types/mongoose/user'
import {validationResult} from 'express-validator'

const createUser = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }

    const user = {
        ...req.body
    }

    await User.create(user)

    res.sendStatus(201)
}

const deleteUser = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }

    const user = {
        ...req.body
    }

    await User.deleteOne({username: user.username})

    res.sendStatus(204)
}

export default {
    createUser,
    deleteUser
}