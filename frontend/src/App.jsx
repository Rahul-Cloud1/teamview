import React from 'react'
import { Outlet } from 'react-router-dom'

export default function App(){
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#333' }}>🚀 TeamFlow</h1>
      <Outlet />
    </div>
  )
}
