import express from 'express'
import connect from './connect'
import { config } from 'dotenv-flow'
import loginRouter from './routers/loginRouter'
import usersRouter from './routers/usersRouter'
import auth from './auth/auth'

config()
connect(process.env.MONGO_CONNECTION)

const app = express()
app.use(express.json())

app.use('/api/login', loginRouter)
app.use('/api/users', auth.enforceRole('admin'), usersRouter)
app.use('/api/', (req, res) => {
    res.send('MageHand API')
})

app.listen(3000)