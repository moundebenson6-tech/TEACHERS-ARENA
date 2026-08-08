import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // List approved materials
    const materials = await prisma.material.findMany({ where: { status: 'approved' } })
    return res.json({ materials })
  }

  if (req.method === 'POST') {
    const { title, description, priceCents, fileKey, uploaderId, tags } = req.body
    if (!title || !fileKey || !uploaderId) return res.status(400).json({ error: 'Missing required fields' })

    const material = await prisma.material.create({
      data: {
        title,
        description: description || undefined,
        priceCents: Number(priceCents) || 0,
        fileKey,
        uploaderId: Number(uploaderId),
        tags: tags || undefined,
        status: 'pending'
      }
    })
    return res.json({ material })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
