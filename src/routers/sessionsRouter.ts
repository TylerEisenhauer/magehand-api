import express from 'express'
// import {body, param, query} from 'express-validator'
import messagesController from '../controllers/sessionController'

let sessionRouter = express.Router()

sessionRouter.post('/', messagesController.addSession)

export default sessionRouter