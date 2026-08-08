import React, { useEffect, useState } from 'react'

export default function AdminPage() {
  const [materials, setMaterials] = useState<any[]>([])
  const [msg, setMsg] = useState('')

  useEffect(()=>{ fetchPending() }, [])
  async function fetchPending() {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/admin/list', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (res.ok) setMaterials(data.materials)
    else setMsg(data.error || 'Error')
  }

  async function act(materialId: number, approve: boolean) {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/admin/approve', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ materialId, approve }) })
    const data = await res.json()
    if (res.ok) fetchPending()
    else setMsg(data.error || 'Error')
  }

  return (
    <main style={{padding: '2rem'}}>
      <h1>Admin — Pending Materials</h1>
      <div>{msg}</div>
      <ul>
        {materials.map(m => (
          <li key={m.id} style={{marginBottom: '1rem'}}>
            <strong>{m.title}</strong> by {m.uploader.email} — {m.fileKey}
            <div>
              <button onClick={()=>act(m.id, true)}>Approve</button>
              <button onClick={()=>act(m.id, false)}>Reject</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
