import express from 'express'
import mongoose from 'mongoose'
import Campaign, { ICampaign } from '../types/mongoose/campaign'

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
    const campaign: ICampaign = {
        ended: false,
        ...req.body,
        nextSessionNumber: req.body.initialSessionNumber || 0,
    }

    return res.send(await Campaign.create(campaign)).status(201)
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