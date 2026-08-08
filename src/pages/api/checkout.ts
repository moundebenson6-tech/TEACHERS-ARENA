import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/db'
import { stripe } from '../../lib/stripe'

// Create a PaymentIntent for a material. This endpoint should be secured in production.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { materialId, buyerId, currency = 'usd' } = req.body
  if (!materialId || !buyerId) return res.status(400).json({ error: 'Missing materialId or buyerId' })

  const material = await prisma.material.findUnique({ where: { id: Number(materialId) } })
  if (!material) return res.status(404).json({ error: 'Material not found' })
  if (material.status !== 'approved') return res.status(403).json({ error: 'Material not available for purchase' })

  const buyer = await prisma.user.findUnique({ where: { id: Number(buyerId) } })
  if (!buyer) return res.status(404).json({ error: 'Buyer not found' })

  const discountPercent = buyer.isApproved ? buyer.discountPercent : 0
  const priceCents = material.priceCents
  const discountAmount = Math.round((priceCents * (discountPercent || 0)) / 100)
  const finalAmount = Math.max(0, priceCents - discountAmount)

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency,
      metadata: {
        materialId: String(material.id),
        buyerId: String(buyer.id),
        originalPriceCents: String(priceCents),
        discountAppliedCents: String(discountAmount)
      }
    })

    return res.json({ clientSecret: paymentIntent.client_secret })
  } catch (err: any) {
    console.error('Stripe error', err)
    return res.status(500).json({ error: 'Could not create payment intent' })
  }
}
