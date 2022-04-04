import express from 'express'
import Session, { ISession } from '../types/mongoose/session'

const addSession = async (req: express.Request, res: express.Response) => {
    const session: ISession = {
        cancelled: false,
        participants: [],
        reminderSent: false,
        ...req.body
    }

    return res.send(await Session.create(session)).status(201)
}

export default {
    addSession
}