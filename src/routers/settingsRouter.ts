import express from 'express'
import {body, param, query} from 'express-validator'
import settingsController from '../controllers/settingsController'

let settingsRouter = express.Router()

settingsRouter.get('/:guildId',
    param('guildId').isNumeric(),
    settingsController.getSettings
)

settingsRouter.post('/:guildId', [
        param('guildId').isNumeric(),
        body('testSetting').isBoolean()
    ],
    settingsController.createSettings
)

settingsRouter.patch('/:guildId', [
        param('guildId').isNumeric(),
        body('testSetting').optional().isBoolean()
    ],
    settingsController.updateSettings
)

settingsRouter.delete('/:guildId', 
    param('guildId').isNumeric(),
    settingsController.deleteSettings
)

export default settingsRouter