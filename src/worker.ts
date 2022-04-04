import amqp from 'amqplib'
import { DateTime } from 'luxon'
import Session, { ISession } from './types/mongoose/session'

export async function startWorker() {
    await processSessions()
    setInterval(async () => {
        await processSessions()
    }, 1000 * 10)
}

async function processSessions() {
    try {
        const startDate = DateTime.now()
        const endDate = startDate.plus({ hours: 6 })
        console.log(startDate.toJSDate().toString())
        console.log(endDate.toJSDate().toString())

        const sessions: ISession[] = await Session.find({
            date: { $gte: startDate, $lte: endDate },
            reminderSent: false,
            cancelled: false
        })

        console.log(sessions)

        if (sessions) {
            const connectionString = process.env.QUEUE_CONNECTION
            const queueName = process.env.SESSION_QUEUE_NAME

            const conn = await amqp.connect(connectionString)

            const channel = await conn.createConfirmChannel()

            const exchange = await channel.assertExchange(`${queueName}-delayed`, 'x-delayed-message', {
                autoDelete: true,
                durable: true,
                arguments: {
                    'x-delayed-type': 'direct'
                }
            })

            const queue = await channel.assertQueue(queueName, {
                durable: true
            })

            await channel.bindQueue(queueName, exchange.exchange, queueName)

            sessions.map(async session => {
                channel.publish(exchange.exchange, queue.queue, Buffer.from(JSON.stringify(session)), {
                    headers: {
                        'x-delay': 0
                    },
                    persistent: true
                })
                await session.updateOne({ $set: { reminderSent: true } })
            })

            await channel.waitForConfirms()

            await conn.close()
        }
    } catch (e) {
        console.log(e)
    }
}
