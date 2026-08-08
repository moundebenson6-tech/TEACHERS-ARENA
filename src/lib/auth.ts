import jwt from 'jsonwebtoken'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'dev_secret'

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (err) {
    return null
  }
}

export async function getUserFromReq(req: any) {
  const auth = req.headers?.authorization || ''
  const m = auth.match(/^Bearer (.+)$/)
  if (!m) return null
  const token = m[1]
  const data = verifyToken(token)
  if (!data || !data.userId) return null
  const user = await prisma.user.findUnique({ where: { id: Number(data.userId) } })
  return user
}
