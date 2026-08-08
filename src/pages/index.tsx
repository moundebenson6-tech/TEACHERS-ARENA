import React from 'react'

export default function Home() {
  return (
    <main style={{padding: '2rem', fontFamily: 'sans-serif'}}>
      <h1>Teachers Arena</h1>
      <p>Upload, moderate, and sell learning materials. Teachers get a discount after approval.</p>
      <p>This branch is a scaffold. Run <code>pnpm install</code> or <code>npm install</code>, set env vars from <code>.env.example</code>, then run <code>npx prisma migrate dev</code> to create the DB.</p>
    </main>
  )
}
