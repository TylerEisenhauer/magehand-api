import amqp from 'amqplib'

import { ISession } from '../types/mongoose'

export async function sendSessionsToQueue(sessions: ISession[]) {
    try {
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
                const isReminder = session.messageId ? true : false
                await session.updateOne({ $set: { reminderSent: isReminder } })
            })

            await channel.waitForConfirms()

            await conn.close()
        }
    } catch (e) {
        console.log(e)
    }
}