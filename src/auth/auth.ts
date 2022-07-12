import jwt from 'jsonwebtoken'
import express from 'express'

const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    try {
        await jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch (e) {
        return res.sendStatus(403)
    }
}

const enforceRole = (role: string) => {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) return res.sendStatus(401)
        try {
            const parsed = await jwt.verify(token, process.env.JWT_SECRET) as any
            if (role) {
                if (!parsed.roles.includes(role)) return res.sendStatus(403)
            }
            next()
        } catch (e) {
            return res.sendStatus(403)
        }
    }
}

export {
    authenticateToken,
    enforceRole
}