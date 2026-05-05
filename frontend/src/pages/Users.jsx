import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || "https://backend-team-view-production.up.railway.app/api";

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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <p>Loading users...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'Admin') {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <div style={styles.errorContent}>
            <span style={styles.errorIcon}>🔒</span>
            <h2>Access Denied</h2>
            <p>Only administrators can view this page.</p>
            <button onClick={goBack} style={styles.btnPrimary}>← Back to Dashboard</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h2 style={styles.greeting}>👥 User Management</h2>
            <p style={styles.headerSubtext}>Manage team members and their roles</p>
          </div>
          <button onClick={goBack} style={styles.backButton}>← Back to Dashboard</button>
        </div>
      </header>

      {error && <div style={styles.errorAlert}>{error}</div>}

      <main style={styles.main}>
        {users.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>👤</div>
            <h3>No users found</h3>
            <p>Start inviting team members to collaborate</p>
          </div>
        ) : (
          <>
            <div style={styles.statsBar}>
              <div style={styles.stat}>
                <span style={styles.statValue}>{users.length}</span>
                <span style={styles.statLabel}>Total Users</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statValue}>{users.filter(u => u.role === 'Admin').length}</span>
                <span style={styles.statLabel}>Admins</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statValue}>{users.filter(u => u.role === 'Member').length}</span>
                <span style={styles.statLabel}>Members</span>
              </div>
            </div>

            {/* Desktop View - Table */}
            <div style={styles.desktopView}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={{...styles.th, textAlign: 'left'}}>Name</th>
                      <th style={{...styles.th, textAlign: 'left'}}>Email</th>
                      <th style={{...styles.th, textAlign: 'center'}}>Current Role</th>
                      <th style={{...styles.th, textAlign: 'center'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, idx) => (
                      <tr key={u._id} style={{...styles.tableRow, background: idx % 2 === 0 ? 'white' : 'var(--light)'}}>
                        <td style={styles.td}>
                          <strong>{u.name}</strong>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.email}>{u.email}</span>
                        </td>
                        <td style={{...styles.td, textAlign: 'center'}}>
                          <span style={{
                            ...styles.roleBadge,
                            background: u.role === 'Admin' ? '#fee2e2' : '#dcfce7',
                            color: u.role === 'Admin' ? '#991b1b' : '#166534'
                          }}>
                            {u.role === 'Admin' ? '👑' : '👤'} {u.role}
                          </span>
                        </td>
                        <td style={{...styles.td, textAlign: 'center'}}>
                          {u._id === user.id ? (
                            <span style={styles.yourAccount}>Your account</span>
                          ) : (
                            <select 
                              value={u.role} 
                              onChange={(e) => changeRole(u._id, e.target.value)}
                              style={styles.roleSelect}
                            >
                              <option value="Member">Make Member</option>
                              <option value="Admin">Make Admin</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View - Cards */}
            <div style={styles.mobileView}>
              <div style={styles.cardGrid}>
                {users.map(u => (
                  <div key={u._id} style={styles.userCard}>
                    <div style={styles.cardHeader}>
                      <div>
                        <strong style={styles.cardName}>{u.name}</strong>
                        <p style={styles.cardEmail}>{u.email}</p>
                      </div>
                      <span style={{
                        ...styles.roleBadge,
                        background: u.role === 'Admin' ? '#fee2e2' : '#dcfce7',
                        color: u.role === 'Admin' ? '#991b1b' : '#166534'
                      }}>
                        {u.role === 'Admin' ? '👑' : '👤'} {u.role}
                      </span>
                    </div>
                    <div style={styles.cardFooter}>
                      {u._id === user.id ? (
                        <span style={styles.yourAccount}>Your account</span>
                      ) : (
                        <select 
                          value={u.role} 
                          onChange={(e) => changeRole(u._id, e.target.value)}
                          style={styles.roleSelect}
                        >
                          <option value="Member">Make Member</option>
                          <option value="Admin">Make Admin</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--light)',
  },

  /* Header */
  header: {
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
    color: 'white',
    padding: 'clamp(1.25rem, 5vw, 2rem)',
    marginBottom: '2rem',
    borderRadius: '0 0 1rem 1rem',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
    maxWidth: '1400px',
    margin: '0 auto',
    flexWrap: 'wrap',
  },
  greeting: {
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: '700',
    margin: 0,
    marginBottom: '0.5rem',
  },
  headerSubtext: {
    fontSize: '0.95rem',
    opacity: 0.9,
    margin: 0,
  },
  backButton: {
    padding: '0.625rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
  },

  /* Error Alert */
  errorAlert: {
    background: '#fee2e2',
    border: '2px solid #fecaca',
    color: '#991b1b',
    padding: '1rem',
    borderRadius: '0.5rem',
    marginBottom: '1.5rem',
    maxWidth: '1400px',
    margin: '0 auto 1.5rem',
    fontWeight: '600',
  },

  /* Main */
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 clamp(0.5rem, 3vw, 1.5rem)',
    marginBottom: '2rem',
  },

  /* Stats Bar */
  statsBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  stat: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  statValue: {
    display: 'block',
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--primary)',
    marginBottom: '0.5rem',
  },
  statLabel: {
    display: 'block',
    fontSize: '0.85rem',
    color: 'var(--gray)',
    fontWeight: '500',
  },

  /* Table View (Desktop) */
  desktopView: {
    display: 'block',
  },
  tableWrapper: {
    background: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
    color: 'white',
  },
  th: {
    padding: '1rem',
    fontWeight: '600',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableRow: {
    transition: 'all 0.3s ease',
    borderBottom: '1px solid var(--border)',
  },
  td: {
    padding: '1rem',
    verticalAlign: 'middle',
  },
  email: {
    color: 'var(--gray)',
    fontSize: '0.9rem',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  roleSelect: {
    padding: '0.5rem 0.75rem',
    border: '2px solid var(--border)',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
  },
  yourAccount: {
    color: 'var(--gray)',
    fontSize: '0.85rem',
    fontStyle: 'italic',
  },

  /* Mobile View - Cards */
  mobileView: {
    display: 'none',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  },
  userCard: {
    background: 'white',
    border: '2px solid var(--border)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    transition: 'all 0.3s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid var(--border)',
    gap: '0.75rem',
  },
  cardName: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '1rem',
    color: 'var(--dark)',
  },
  cardEmail: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'var(--gray)',
  },
  cardFooter: {
    marginTop: '1rem',
  },

  /* Empty State */
  emptyState: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: '3rem 1rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },

  /* Error Container */
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '1rem',
  },
  errorContent: {
    background: 'white',
    padding: '2rem',
    borderRadius: '0.75rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  errorIcon: {
    fontSize: '2rem',
    marginBottom: '1rem',
    display: 'block',
  },

  /* Loading */
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
  loadingSpinner: {
    textAlign: 'center',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid var(--light)',
    borderTop: '4px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem',
  },

  /* Buttons */
  btnPrimary: {
    padding: '0.75rem 1.5rem',
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
  },

  /* Responsive */
  '@media (max-width: 768px)': {
    desktopView: {
      display: 'none',
    },
    mobileView: {
      display: 'block',
    },
    headerContent: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  },
}

/* Add animation styles */
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @media (max-width: 768px) {
      select, input {
        font-size: 16px;
      }
    }
  `
  document.head.appendChild(style)
}
