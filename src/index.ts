import auth from './auth/auth'
import connect from './connect'
import express from 'express'
import { config } from 'dotenv-flow'
import loginRouter from './routers/loginRouter'
import settingsRouter from './routers/settingsRouter'
import usersRouter from './routers/usersRouter'
import sessionRouter from './routers/sessionsRouter'
import { startWorker } from './worker'

config()
connect(process.env.MONGO_CONNECTION)

startWorker()

const app = express()
app.use(express.json())

app.use('/api/login', loginRouter)
app.use('/api/users', auth.enforceRole('admin'), usersRouter)
app.use('/api/settings', auth.enforceRole('admin'), settingsRouter)
app.use('/api/session', auth.enforceRole('admin'), sessionRouter)
app.use('/api/', (req, res) => {
    res.send('MageHand API')
})

app.listen(3000)