import type { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromReq } from '../../../lib/auth'
import { scanMaterial } from '../../../lib/virus'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const user = await getUserFromReq(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
  const { materialId } = req.body
  if (!materialId) return res.status(400).json({ error: 'Missing materialId' })

  const result = await scanMaterial(Number(materialId))
  return res.json({ ok: true, result })
}
