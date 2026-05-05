import React from 'react'
import { Outlet } from 'react-router-dom'

export default function App(){
  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: 'clamp(1rem, 5vw, 2rem)'
    }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>🚀 TeamFlow</h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--gray)', margin: 0 }}>
          Collaborate smarter. Deliver faster.
        </p>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
