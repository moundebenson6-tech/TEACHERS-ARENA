import React, { useEffect, useState } from 'react'

export default function MaterialsList() {
  const [materials, setMaterials] = useState<any[]>([])

  useEffect(()=>{ fetchList() }, [])
  async function fetchList() {
    const res = await fetch('/api/materials')
    const data = await res.json()
    if (res.ok) setMaterials(data.materials)
  }

  return (
    <main style={{padding:'2rem'}}>
      <h1>Materials</h1>
      <ul>
        {materials.map(m => (
          <li key={m.id}><a href={`/materials/${m.id}`}>{m.title}</a> — ${(m.priceCents/100).toFixed(2)}</li>
        ))}
      </ul>
    </main>
  )
}
