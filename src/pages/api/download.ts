// ensure download token is unique by DB constraint, lookup and return presigned url
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/db'
import { getPresignedDownloadUrl } from '../../lib/s3'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const { token } = req.query
  if (!token || typeof token !== 'string') return res.status(400).json({ error: 'Missing token' })
  const purchase = await prisma.purchase.findUnique({ where: { downloadToken: token }, include: { material: true } })
  if (!purchase) return res.status(404).json({ error: 'Invalid token' })
  const url = await getPresignedDownloadUrl(purchase.material.fileKey, 60 * 60)
  return res.json({ url, expiresIn: 3600 })
}
