import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/db'
import bcrypt from 'bcryptjs'
import { signToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, password, name } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(400).json({ error: 'User already exists' })

  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { email, passwordHash: hash, name: name || undefined, role: 'teacher' } })
  const token = signToken({ userId: user.id })
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
}
