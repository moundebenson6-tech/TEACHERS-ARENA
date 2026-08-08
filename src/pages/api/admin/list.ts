import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/db'
import { getUserFromReq } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // list pending materials for admins
    const user = await getUserFromReq(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })

    const materials = await prisma.material.findMany({ where: { status: 'pending' }, include: { uploader: true } })
    return res.json({ materials })
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
