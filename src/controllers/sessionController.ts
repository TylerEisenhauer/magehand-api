import express from 'express'
import mongoose from 'mongoose'
import Session, { ISession } from '../types/mongoose/session'

const getSessionById = async (req: express.Request, res: express.Response) => {
    const { id } = req.params
    let session: ISession

    if (mongoose.Types.ObjectId.isValid(id)) {
        session = await Session.findById(id)
    } else {
        session = await Session.findOne({ messageId: id })
    }

    if (session) {
        return res.send(session).status(200)
    }
    return res.sendStatus(404)
}

const addSession = async (req: express.Request, res: express.Response) => {
    const session: ISession = {
        cancelled: false,
        participants: [],
        reminderSent: false,
        ...req.body
    }

    return res.send(await Session.create(session)).status(201)
}

const updateSession = async (req: express.Request, res: express.Response) => {
    const { sessionId } = req.params
    const updatedFields: ISession = {
        ...req.body
    }

    return res.send(await Session.findOneAndUpdate({ _id: sessionId }, updatedFields, { new: true })).status(201)
}

const addParticipant = async (req: express.Request, res: express.Response) => {
    const { messageId } = req.params
    const { participantId } = req.body

    const session = await Session.findOneAndUpdate({ messageId }, { $addToSet: { participants: participantId } }, { new: true })
    if (session) {
        return res.send(session).status(200)
    }
    return res.sendStatus(404)
}

const removeParticipant = async (req: express.Request, res: express.Response) => {
    const { messageId, participantId } = req.params

    const session = await Session.findOneAndUpdate({ messageId }, { $pull: { participants: participantId } }, { new: true })

    if (session) {
        return res.send(session).status(200)
    }
    return res.sendStatus(404)
}

export default {
    getSessionById,
    addSession,
    updateSession,
    addParticipant,
    removeParticipant
}