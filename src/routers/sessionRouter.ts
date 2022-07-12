import express from 'express'
import messagesController from '../controllers/sessionController'

let sessionRouter = express.Router()

sessionRouter.get('/:id', messagesController.getSessionById)
sessionRouter.post('/', messagesController.addSession)
sessionRouter.post('/:messageId', messagesController.addParticipant)
sessionRouter.patch('/:sessionId', messagesController.updateSession)
sessionRouter.delete('/:messageId/:participantId', messagesController.removeParticipant)

export default sessionRouter