import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '../../lib/stripe'
import { prisma } from '../../lib/db'
import { getPresignedDownloadUrl } from '../../lib/s3'

export const config = { api: { bodyParser: false } }

async function rawBody(req: NextApiRequest) {
  return await new Promise<Buffer>((resolve, reject) => {
    const chunks: any[] = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', (err) => reject(err))
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const sig = req.headers['stripe-signature'] as string | undefined
  const buf = await rawBody(req)
  let event
  try {
    event = stripe.webhooks.constructEvent(buf, sig || '', process.env.STRIPE_WEBHOOK_SECRET || '')
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as any
    const metadata = intent.metadata || {}
    const materialId = Number(metadata.materialId)
    const buyerId = Number(metadata.buyerId)
    const originalPriceCents = Number(metadata.originalPriceCents || 0)
    const discountAppliedCents = Number(metadata.discountAppliedCents || 0)

    // Create purchase, generate download token and presigned URL
    try {
      const crypto = await import('crypto')
      const downloadToken = crypto.randomUUID()

      const purchase = await prisma.purchase.create({
        data: {
          buyerId,
          materialId,
          pricePaidCents: Number(intent.amount_received || intent.amount || 0),
          discountApplied: discountAppliedCents,
          stripePaymentId: intent.id,
          downloadToken
        }
      })

      // Generate presigned download URL
      const material = await prisma.material.findUnique({ where: { id: materialId } })
      if (material) {
        const url = await getPresignedDownloadUrl(material.fileKey, 60 * 60) // 1 hour
        // Optionally: you could email the buyer the url, or store it in DB. For now we log it.
        console.log('Presigned download URL for purchase', purchase.id, url)
      }

      return res.json({ received: true })
    } catch (err) {
      console.error('Error creating purchase', err)
      return res.status(500).json({ error: 'Server error' })
    }
  }

  // Return a response for all other events
  res.json({ received: true })
}
