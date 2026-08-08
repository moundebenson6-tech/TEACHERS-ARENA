import React, { useState } from 'react'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [msg, setMsg] = useState('')

  async function submit(e: any) {
    e.preventDefault()
    if (!file) return setMsg('Select a file')
    // request presigned url
    const token = localStorage.getItem('token')
    const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: file.name, contentType: file.type }) })
    const data = await res.json()
    if (!res.ok) return setMsg(data.error || 'Could not get upload url')

    // upload directly to S3
    await fetch(data.url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })

    // create material record
    const createRes = await fetch('/api/materials', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ title, description: desc, priceCents: 500, fileKey: data.key }) })
    const createData = await createRes.json()
    if (createRes.ok) {
      setMsg('Uploaded and submitted for review')
      window.location.href = '/'
    } else {
      setMsg(createData.error || 'Error creating material')
    }
  }

  return (
    <main style={{padding: '2rem'}}>
      <h1>Upload Material</h1>
      <form onSubmit={submit}>
        <div><label>Title <input value={title} onChange={e=>setTitle(e.target.value)} /></label></div>
        <div><label>Description <textarea value={desc} onChange={e=>setDesc(e.target.value)} /></label></div>
        <div><label>File <input type="file" onChange={e=>setFile(e.target.files ? e.target.files[0] : null)} /></label></div>
        <button type="submit">Upload</button>
      </form>
      <div>{msg}</div>
    </main>
  )
}
