// Placeholder: request a presigned upload URL from the server and upload directly to S3
import type { NextApiRequest, NextApiResponse } from 'next'
import { getPresignedUploadUrl } from '../../lib/s3'
import { randomUUID } from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { filename, contentType } = req.body
  if (!filename || !contentType) return res.status(400).json({ error: 'Missing filename or contentType' })

  // Generate a key and return a presigned URL for upload
  const key = `uploads/${Date.now()}-${randomUUID()}-${filename}`
  try {
    const url = await getPresignedUploadUrl(key, contentType)
    return res.json({ url, key })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Could not create presigned URL' })
  }
}
