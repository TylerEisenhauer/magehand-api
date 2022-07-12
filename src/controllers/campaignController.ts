import express from 'express'
import { DateTime } from 'luxon'
import mongoose from 'mongoose'

import { calculateNextSessionOccurrance, sendSessionsToQueue } from '../helpers'
import Campaign, { ICampaign } from '../types/mongoose/campaign'
import Session, { ISession } from '../types/mongoose/session'

const getCampaignById = async (req: express.Request, res: express.Response) => {
    const { id } = req.params
    let campaign: ICampaign

    if (mongoose.Types.ObjectId.isValid(id)) {
        campaign = await Campaign.findById(id)
    }

    if (campaign) {
        return res.send(campaign).status(200)
    }
    return res.sendStatus(404)
}

const getCampaignsByOwner = async (req: express.Request, res: express.Response) => {
    const { id } = req.params

    const campaigns: ICampaign[] = await Campaign.find({ owner: id })

    if (campaigns) {
        return res.send(campaigns).status(200)
    }
    return res.sendStatus(404)
}

const addCampaign = async (req: express.Request, res: express.Response) => {
    try {
        const campaign: ICampaign = {
            ended: false,
            ...req.body,
            nextSessionNumber: req.body.initialSessionNumber || 0,
        }
        const firstSessionDate = calculateNextSessionOccurrance(DateTime.now(), campaign).toJSDate()

        const newCampaign: ICampaign = await Campaign.create({
            ...campaign,
            scheduledThrough: firstSessionDate
        })

        const session: ISession = await Session.create({
            campaign: newCampaign.id,
            cancelled: false,
            channel: newCampaign.channel,
            date: newCampaign.scheduledThrough,
            description: newCampaign.description,
            guild: newCampaign.guild,
            location: newCampaign.location,
            name: `${newCampaign.name} - Session ${newCampaign.nextSessionNumber}`,
            owner: newCampaign.owner,
            participants: [],
            reminderSent: false
        })

        await sendSessionsToQueue([session])

        return res.send(campaign).status(201)
    } catch (e) {
        console.log(e)
        return res.sendStatus(500)
    }
}

const updateCampaign = async (req: express.Request, res: express.Response) => {
    const { id } = req.params
    const updatedFields: ICampaign = {
        ...req.body
    }

    return res.send(await Campaign.findOneAndUpdate({ _id: id }, updatedFields, { new: true })).status(201)
}

const deleteCampaign = async (req: express.Request, res: express.Response) => {
    const { id } = req.params

    const deletedCampaign = await Campaign.findOneAndDelete({ _id: id })
    if (deletedCampaign) {
        return res.sendStatus(204)
    }

    return res.sendStatus(404)
}

export default {
    addCampaign,
    deleteCampaign,
    getCampaignById,
    getCampaignsByOwner,
    updateCampaign
}