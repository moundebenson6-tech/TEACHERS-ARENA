import React, { useState } from 'react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')

  async function submit(e: any) {
    e.preventDefault()
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) })
    const data = await res.json()
    if (res.ok) {
      localStorage.setItem('token', data.token)
      setMsg('Registered and logged in')
      window.location.href = '/'
    } else {
      setMsg(data.error || 'Error')
    }
  }

  return (
    <main style={{padding: '2rem'}}>
      <h1>Register</h1>
      <form onSubmit={submit}>
        <div><label>Email <input value={email} onChange={e=>setEmail(e.target.value)} /></label></div>
        <div><label>Name <input value={name} onChange={e=>setName(e.target.value)} /></label></div>
        <div><label>Password <input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label></div>
        <button type="submit">Register</button>
      </form>
      <div>{msg}</div>
    </main>
  )
}
