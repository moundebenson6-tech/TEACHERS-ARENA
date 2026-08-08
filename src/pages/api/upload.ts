import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/db'
import { getPresignedUploadUrl } from '../../lib/s3'
import { getUserFromReq } from '../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { filename, contentType } = req.body
  if (!filename || !contentType) return res.status(400).json({ error: 'Missing filename or contentType' })

  // attach requester id in case we need to verify later
  const key = `uploads/${Date.now()}-${filename}`
  try {
    const url = await getPresignedUploadUrl(key, contentType)
    return res.json({ url, key })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Could not create presigned URL' })
  }
}
