import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/db'
import bcrypt from 'bcryptjs'
import { signToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(400).json({ error: 'User not found' })

  const ok = await bcrypt.compare(password, user.passwordHash || '')
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  const token = signToken({ userId: user.id })
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, isApproved: user.isApproved, discountPercent: user.discountPercent } })
}
