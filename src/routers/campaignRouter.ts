import express from 'express'
import campaignController from '../controllers/campaignController'

let campaignRouter = express.Router()

campaignRouter.get('/:id', campaignController.getCampaignById)
campaignRouter.get('/owner/:id', campaignController.getCampaignsByOwner)
campaignRouter.post('/', campaignController.addCampaign)
campaignRouter.patch('/:id', campaignController.updateCampaign)
campaignRouter.delete('/:id', campaignController.deleteCampaign)

export default campaignRouter