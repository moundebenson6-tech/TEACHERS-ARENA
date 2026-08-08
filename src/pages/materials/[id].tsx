import React, { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export default function MaterialPage({}) {
  const [material, setMaterial] = useState<any>(null)
  const [msg, setMsg] = useState('')

  useEffect(()=>{ const id = window.location.pathname.split('/').pop(); fetchMaterial(id) }, [])

  async function fetchMaterial(id: any) {
    const res = await fetch(`/api/materials/${id}`)
    const data = await res.json()
    if (res.ok) setMaterial(data.material)
    else setMsg(data.error || 'Error')
  }

  async function buy() {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ materialId: material.id, successUrl: window.location.origin + '/purchase-success', cancelUrl: window.location.href }) })
    const data = await res.json()
    if (res.ok && data.url) { window.location.href = data.url }
    else setMsg(data.error || 'Could not create checkout')
  }

  if (!material) return <main style={{padding:'2rem'}}><div>{msg || 'Loading...'}</div></main>
  return (
    <main style={{padding:'2rem'}}>
      <h1>{material.title}</h1>
      <p>{material.description}</p>
      <p>Price: ${(material.priceCents/100).toFixed(2)}</p>
      <button onClick={buy}>Buy</button>
      <div>{msg}</div>
    </main>
  )
}
