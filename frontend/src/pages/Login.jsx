import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nav = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const url = isSignup ? '/api/auth/signup' : '/api/auth/login'
      const body = isSignup ? { name, email, password } : { email, password }
      const res = await axios.post(url, body)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      nav('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>{isSignup ? 'Create Account' : 'Log In'}</h2>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      <form onSubmit={submit}>
        {isSignup && (
          <div>
            <label>Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} required/>
          </div>
        )}
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        </div>
        <div>
          <label>Password</label>
          <input type='password' value={password} onChange={e=>setPassword(e.target.value)} required/>
        </div>
        <button type='submit' disabled={loading}>{loading ? 'Loading...' : (isSignup ? 'Sign Up' : 'Log In')}</button>
      </form>
      <p style={{ marginTop: 15, textAlign: 'center' }}>
        <button type="button" onClick={()=>setIsSignup(s=>!s)} style={{ background: 'transparent', color: '#007bff', textDecoration: 'underline' }}>
          {isSignup ? 'Have an account? Log in' : "Don't have an account? Sign up"}
        </button>
      </p>
    </div>
  )
}
