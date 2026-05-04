import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: API_URL })
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export default function Users(){
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const nav = useNavigate()

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    if (u.role !== 'Admin') {
      nav('/dashboard')
      return
    }
    setUser(u)
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const res = await api.get('/auth/users')
      setUsers(res.data)
    } catch (err) {
      setError('Failed to load users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const changeRole = async (userId, newRole) => {
    try {
      await api.patch(`/auth/users/${userId}/role`, { role: newRole })
      setError('')
      loadUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change role')
    }
  }

  const goBack = () => nav('/dashboard')

  if (loading) return <div>Loading...</div>
  if (!user || user.role !== 'Admin') return <div>Access Denied</div>

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <button onClick={goBack} style={{ background: '#6c757d' }}>← Back to Dashboard</button>
      </div>

      <h2>User Management</h2>
      {error && <div style={{ color: 'red', marginBottom: 10, padding: 10, background: '#ffe0e0', borderRadius: 4 }}>{error}</div>}

      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: 10, textAlign: 'left' }}>Name</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Email</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Current Role</th>
              <th style={{ padding: 10, textAlign: 'center' }}>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: 10 }}>{u.name}</td>
                <td style={{ padding: 10 }}>{u.email}</td>
                <td style={{ padding: 10 }}>
                  <span style={{ padding: '4px 8px', background: u.role === 'Admin' ? '#ff6b6b' : '#4CAF50', color: 'white', borderRadius: 4, fontSize: 12 }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: 10, textAlign: 'center' }}>
                  {u._id === user.id ? (
                    <span style={{ color: '#999', fontSize: 12 }}>Your account</span>
                  ) : (
                    <select 
                      value={u.role} 
                      onChange={(e) => changeRole(u._id, e.target.value)}
                      style={{ padding: '5px 10px' }}
                    >
                      <option value="Member">Member</option>
                      <option value="Admin">Admin</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
