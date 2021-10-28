import express from 'express'
import {body} from 'express-validator'
import loginController from '../controllers/loginController'

let loginRouter = express.Router()

loginRouter.post('/', [
        body('username').isString(),
        body('password').isString()
    ],
    loginController.login
)

export default loginRouter