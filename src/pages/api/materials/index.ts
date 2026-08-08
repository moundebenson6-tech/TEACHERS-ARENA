import type { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromReq } from '../../../lib/auth'
import { prisma } from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const user = await getUserFromReq(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const { title, description, priceCents, fileKey, tags } = req.body
  if (!title || !fileKey) return res.status(400).json({ error: 'Missing required fields' })

  const material = await prisma.material.create({ data: { title, description: description || undefined, priceCents: Number(priceCents) || 0, fileKey, uploaderId: user.id, tags: tags || undefined, status: 'pending' } })
  return res.json({ material })
}
