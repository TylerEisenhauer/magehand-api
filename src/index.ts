import './config'

import express from 'express'

import { enforceRole } from './auth/'
import connect from './connect'
import {
    campaignRouter,
    loginRouter,
    sessionRouter,
    settingsRouter,
    usersRouter
} from './routers'
import { startWorker } from './worker'

connect(process.env.MONGO_CONNECTION)

startWorker()

const app = express()
app.use(express.json())

app.use('/api/login', loginRouter)
app.use('/api/users', enforceRole('admin'), usersRouter)
app.use('/api/settings', enforceRole('admin'), settingsRouter)
app.use('/api/session', enforceRole('admin'), sessionRouter)
app.use('/api/campaign', enforceRole('admin'), campaignRouter)
app.use('/api/', (req, res) => {
    res.send('MageHand API')
})

app.listen(3000)