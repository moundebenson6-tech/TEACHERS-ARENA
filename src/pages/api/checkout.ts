import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/db'
import { stripe } from '../../lib/stripe'
import { getUserFromReq } from '../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const user = await getUserFromReq(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const { materialId, currency = 'usd', successUrl, cancelUrl } = req.body
  if (!materialId || !successUrl || !cancelUrl) return res.status(400).json({ error: 'Missing required fields' })

  const material = await prisma.material.findUnique({ where: { id: Number(materialId) } })
  if (!material) return res.status(404).json({ error: 'Material not found' })
  if (material.status !== 'approved') return res.status(403).json({ error: 'Material not available for purchase' })

  const discountPercent = user.isApproved ? user.discountPercent : 0
  const priceCents = material.priceCents
  const discountAmount = Math.round((priceCents * (discountPercent || 0)) / 100)
  const finalAmount = Math.max(0, priceCents - discountAmount)

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency,
          product_data: { name: material.title },
          unit_amount: finalAmount
        },
        quantity: 1
      }],
      payment_intent_data: {
        metadata: {
          materialId: String(material.id),
          buyerId: String(user.id),
          originalPriceCents: String(priceCents),
          discountAppliedCents: String(discountAmount)
        }
      },
      success_url: successUrl,
      cancel_url: cancelUrl
    })

    return res.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe error', err)
    return res.status(500).json({ error: 'Could not create checkout session' })
  }
}
