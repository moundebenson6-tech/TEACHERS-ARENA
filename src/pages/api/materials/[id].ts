import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Missing id' })
  const material = await prisma.material.findUnique({ where: { id: Number(id) } })
  if (!material) return res.status(404).json({ error: 'Not found' })
  // Only return approved materials publicly
  if (material.status !== 'approved') return res.status(403).json({ error: 'Material is not approved' })
  return res.json({ material })
}
