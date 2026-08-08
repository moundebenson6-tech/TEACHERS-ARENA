// Protect and require admin role
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/db'
import { getUserFromReq } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const user = await getUserFromReq(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })

  const { materialId, approve, rejectionReason, autoApproveUploader = true, discountPercent = 10 } = req.body
  if (!materialId) return res.status(400).json({ error: 'Missing materialId' })

  const material = await prisma.material.findUnique({ where: { id: Number(materialId) }, include: { uploader: true } })
  if (!material) return res.status(404).json({ error: 'Material not found' })

  if (approve) {
    await prisma.material.update({ where: { id: material.id }, data: { status: 'approved', approvedAt: new Date() } })
    if (autoApproveUploader && !material.uploader.isApproved) {
      await prisma.user.update({ where: { id: material.uploader.id }, data: { isApproved: true, discountPercent: Number(discountPercent) } })
    }
    return res.json({ ok: true })
  } else {
    await prisma.material.update({ where: { id: material.id }, data: { status: 'rejected', rejectionReason: rejectionReason || 'Rejected by admin' } })
    return res.json({ ok: true })
  }
}
