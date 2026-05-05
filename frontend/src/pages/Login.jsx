import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || "https://backend-team-view-production.up.railway.app/api";

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
      const path = isSignup ? '/auth/signup' : '/auth/login'
      const url = `${API_URL}${path}`
      const body = isSignup ? { name, email, password } : { email, password }
      const res = await axios.post(url, body)
      localStorage.setItem('token', res.data.token)
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user))
      }
      nav('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Left Side - Info */}
        <div style={styles.infoSection}>
          <div style={styles.infoBadge}>
            <span style={{ fontSize: '3rem' }}>🚀</span>
          </div>
          <h2 style={styles.infoTitle}>TeamFlow</h2>
          <p style={styles.infoSubtitle}>Streamline Your Team's Workflow</p>
          <ul style={styles.features}>
            <li style={styles.featureItem}>✨ Organize projects effortlessly</li>
            <li style={styles.featureItem}>👥 Collaborate with your team</li>
            <li style={styles.featureItem}>📊 Track progress in real-time</li>
            <li style={styles.featureItem}>🎯 Stay on top of deadlines</li>
          </ul>
        </div>

        {/* Right Side - Form */}
        <div style={styles.formSection}>
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p style={styles.formSubtitle}>
              {isSignup 
                ? 'Join TeamFlow and start collaborating' 
                : 'Sign in to your account'}
            </p>

            {error && (
              <div style={styles.errorBox}>
                <span>⚠️</span>
                <div>
                  <strong style={{ display: 'block' }}>Error</strong>
                  <span style={{ fontSize: '0.9rem' }}>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={submit} style={styles.form}>
              {isSignup && (
                <div style={styles.formGroup}>
                  <label htmlFor="name" style={styles.label}>Full Name</label>
                  <input 
                    id="name"
                    type="text"
                    value={name} 
                    onChange={e=>setName(e.target.value)} 
                    placeholder="John Doe"
                    style={styles.input}
                    required
                  />
                </div>
              )}

              <div style={styles.formGroup}>
                <label htmlFor="email" style={styles.label}>Email Address</label>
                <input 
                  id="email"
                  type="email" 
                  value={email} 
                  onChange={e=>setEmail(e.target.value)} 
                  placeholder="you@example.com"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="password" style={styles.label}>Password</label>
                <input 
                  id="password"
                  type='password' 
                  value={password} 
                  onChange={e=>setPassword(e.target.value)} 
                  placeholder="••••••••"
                  style={styles.input}
                  required
                />
              </div>

              <button 
                type='submit' 
                disabled={loading}
                style={{
                  ...styles.submitButton,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '⏳ ' + (isSignup ? 'Creating...' : 'Signing in...') : (isSignup ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <div style={styles.divider}>
              <span>or</span>
            </div>

            <button 
              type="button" 
              onClick={()=>setIsSignup(s=>!s)} 
              style={styles.toggleButton}
            >
              {isSignup 
                ? "Already have an account? Sign in instead" 
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  wrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem',
    maxWidth: '900px',
    width: '100%',
    alignItems: 'center',
  },
  infoSection: {
    textAlign: 'center',
    padding: '2rem',
  },
  infoBadge: {
    marginBottom: '1.5rem',
    animation: 'float 3s ease-in-out infinite',
  },
  infoTitle: {
    fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
    fontWeight: '800',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  infoSubtitle: {
    fontSize: '1.1rem',
    color: 'var(--gray)',
    marginBottom: '2rem',
  },
  features: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  featureItem: {
    fontSize: '0.95rem',
    color: 'var(--dark)',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    background: 'var(--light)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  formSection: {
    display: 'flex',
    justifyContent: 'center',
  },
  formCard: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: 'clamp(1.5rem, 5vw, 2.5rem)',
    boxShadow: '0 10px 40px rgba(99, 102, 241, 0.1)',
    border: '1px solid var(--border)',
    width: '100%',
    maxWidth: '400px',
  },
  formTitle: {
    fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: 'var(--dark)',
  },
  formSubtitle: {
    fontSize: '0.95rem',
    color: 'var(--gray)',
    marginBottom: '1.5rem',
  },
  errorBox: {
    display: 'flex',
    gap: '0.75rem',
    padding: '1rem',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '0.5rem',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    color: '#991b1b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontWeight: '500',
    color: 'var(--dark)',
    fontSize: '0.95rem',
  },
  input: {
    padding: '0.75rem',
    border: '2px solid var(--border)',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    width: '100%',
  },
  submitButton: {
    padding: '0.875rem',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '0.5rem',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'var(--gray)',
    fontSize: '0.85rem',
    margin: '1rem 0',
    textAlign: 'center',
    '&::before': {
      content: '""',
      flex: 1,
      height: '1px',
      background: 'var(--border)',
    }
  },
  toggleButton: {
    background: 'transparent',
    color: 'var(--primary)',
    border: '2px solid var(--primary)',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%',
  },
}
