import express from 'express'
import {body} from 'express-validator'
import usersController from '../controllers/usersController'
import User from '../types/mongoose/user'

let usersRouter = express.Router()

usersRouter.post('/', [
        body('username')
            .isString()
            .custom((value: string) => {
                return User.countDocuments({username: value}).then((count) => {
                    if (count !== 0) return Promise.reject('User Already Exists')
                })
            }),
        body('password').isString()
    ],
    usersController.createUser
)

usersRouter.delete('/', [
        body('username')
            .isString()
            .custom((value: string) => {
                return User.countDocuments({username: value}).then((count) => {
                    if (count == 0) return Promise.reject('User Doesn\'t Exist')
                })
            })
    ],
    usersController.deleteUser
)

export default usersRouter