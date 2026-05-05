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

export default function Dashboard(){
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedProjectData, setSelectedProjectData] = useState(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', assignee: '' })
  const [projectForm, setProjectForm] = useState({ name: '', description: '' })
  const [newMemberId, setNewMemberId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const nav = useNavigate()

  useEffect(()=>{
    if (!localStorage.getItem('token')) return nav('/')
    try {
      const userStr = localStorage.getItem('user') || '{}'
      const u = userStr === 'undefined' ? {} : JSON.parse(userStr)
      setUser(u)
    } catch (err) {
      console.error('Failed to parse user from storage:', err)
      setUser({})
    }
    loadProjects()
    loadTasks()
    loadAllUsers()
  }, [])

  useEffect(() => {
    if (selectedProject && projects.length > 0) {
      const proj = projects.find(p => p._id === selectedProject)
      setSelectedProjectData(proj)
    }
  }, [selectedProject, projects])

  const loadProjects = async ()=>{
    try{
      const res = await api.get('/projects')
      setProjects(Array.isArray(res.data) ? res.data : [])
    }catch(err){
      setError('Failed to load projects')
      console.error(err)
      setProjects([])
    }finally{
      setLoading(false)
    }
  }

  const loadTasks = async ()=>{
    try{
      const res = await api.get('/tasks')
      setTasks(Array.isArray(res.data) ? res.data : [])
    }catch(err){
      console.error(err)
      setTasks([])
    }
  }

  const loadAllUsers = async () => {
    try {
      const res = await api.get('/auth/list')
      setAllUsers(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
      setAllUsers([])
    }
  }

  const createProject = async e => {
    e.preventDefault()
    if (!projectForm.name.trim()) {
      setError('Project name is required')
      return
    }
    try{
      const res = await api.post('/projects', projectForm)
      if (res.data && res.data._id) {
        setProjectForm({ name: '', description: '' })
        setShowProjectForm(false)
        setSelectedProject(res.data._id)
        loadProjects()
        setError('')
      } else {
        setError('Invalid response from server')
      }
    }catch(err){
      console.error('Create project error:', err)
      setError(err.response?.data?.message || err.message || 'Failed to create project')
    }
  }

  const deleteProject = async (projectId) => {
    if (!window.confirm('Delete this project?')) return
    try {
      await api.delete(`/projects/${projectId}`)
      if (selectedProject === projectId) setSelectedProject(null)
      loadProjects()
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project')
    }
  }

  const createTask = async e => {
    e.preventDefault()
    if (!selectedProject) {
      setError('Select a project first')
      return
    }
    try{
      if (editingTask) {
        await api.patch(`/tasks/${editingTask._id}`, { ...taskForm, project: selectedProject })
      } else {
        await api.post('/tasks', { ...taskForm, project: selectedProject })
      }
      setTaskForm({ title: '', description: '', dueDate: '', assignee: '' })
      setShowTaskForm(false)
      setEditingTask(null)
      loadTasks()
      setError('')
    }catch(err){
      setError(err.response?.data?.message || 'Failed to create task')
    }
  }

  const updateTask = async (taskId, status) => {
    try{
      await api.patch(`/tasks/${taskId}`, { status })
      loadTasks()
    }catch(err){
      setError('Failed to update task')
    }
  }

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${taskId}`)
      loadTasks()
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task')
    }
  }

  const startEditTask = (task) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignee: task.assignee?._id || ''
    })
    setShowTaskForm(true)
  }

  const cancelEdit = () => {
    setEditingTask(null)
    setTaskForm({ title: '', description: '', dueDate: '', assignee: '' })
    setShowTaskForm(false)
  }

  const addMember = async (e) => {
    e.preventDefault()
    if (!selectedProject || !newMemberId) return
    try {
      await api.post(`/projects/${selectedProject}/members`, { memberId: newMemberId })
      setNewMemberId('')
      setShowMemberForm(false)
      loadProjects()
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member')
    }
  }

  const removeMember = async (projectId, memberId) => {
    if (!window.confirm('Remove this member?')) return
    try {
      await api.delete(`/projects/${projectId}/members/${memberId}`)
      loadProjects()
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    nav('/')
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const filteredTasks = selectedProject 
    ? tasks.filter(t => t.project && t.project._id === selectedProject)
    : []
  
  const overdueTasks = filteredTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date())
  const tasksByStatus = {
    'Todo': filteredTasks.filter(t => t.status === 'Todo'),
    'In Progress': filteredTasks.filter(t => t.status === 'In Progress'),
    'Done': filteredTasks.filter(t => t.status === 'Done')
  }

  const availableMembers = selectedProjectData 
    ? allUsers.filter(u => !selectedProjectData.members?.some(m => m && m._id === u._id))
    : []

  return (
    <div style={styles.container}>
      {/* Modern Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h2 style={styles.greeting}>Welcome, <span style={{ color: 'var(--primary)' }}>{user?.name}</span></h2>
            <p style={styles.headerSubtext}>Manage your projects and tasks</p>
          </div>
          <div style={styles.headerActions}>
            <span style={styles.role}>{user?.role}</span>
            {user?.role === 'Admin' && (
              <button onClick={() => nav('/users')} style={styles.navButton}>👥 Users</button>
            )}
            <button onClick={logout} style={{ ...styles.navButton, background: 'var(--danger)' }}>↪️ Logout</button>
          </div>
        </div>
      </header>

      {error && <div style={styles.errorAlert}>{error}</div>}

      <div style={styles.mainLayout}>
        {/* Sidebar - Projects */}
        <aside style={{
          ...styles.sidebar,
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}>
          <div style={styles.sidebarHeader}>
            <h3 style={{ margin: 0 }}>📋 Projects</h3>
            <button 
              onClick={() => setShowProjectForm(!showProjectForm)} 
              style={styles.btnAdd}
              title="Create new project"
            >
              +
            </button>
          </div>

          {showProjectForm && (
            <form onSubmit={createProject} style={styles.formBox}>
              <input 
                placeholder="Project name" 
                value={projectForm.name} 
                onChange={e=>setProjectForm({...projectForm, name: e.target.value})} 
                style={styles.input}
                required
              />
              <textarea 
                placeholder="Description" 
                value={projectForm.description} 
                onChange={e=>setProjectForm({...projectForm, description: e.target.value})} 
                style={{...styles.input, minHeight: 80}}
                rows="3"
              />
              <button type="submit" style={styles.btnSubmit}>Create Project</button>
              <button type="button" onClick={() => setShowProjectForm(false)} style={styles.btnCancel}>Cancel</button>
            </form>
          )}

          <div style={styles.projectsList}>
            {projects.length === 0 ? (
              <p style={styles.emptyMessage}>No projects yet. Create one to get started!</p>
            ) : (
              projects.map(p => (
                <div 
                  key={p._id} 
                  onClick={() => {
                    setSelectedProject(p._id)
                    setMobileMenuOpen(false)
                  }}
                  style={{
                    ...styles.projectCard,
                    background: selectedProject === p._id ? 'var(--primary)' : 'var(--light)',
                    color: selectedProject === p._id ? 'white' : 'var(--dark)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                      📦 {p.name}
                    </strong>
                    <small style={{ opacity: 0.8 }}>
                      {p.members?.length || 0} member{(p.members?.length || 0) !== 1 ? 's' : ''}
                    </small>
                  </div>
                  {user?.role === 'Admin' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteProject(p._id)
                      }} 
                      style={styles.btnDelete}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main style={styles.mainContent}>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={styles.mobileMenuToggle}
          >
            ☰ Menu
          </button>

          {!selectedProject ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🚀</div>
              <h3>Select a project to start</h3>
              <p>Choose an existing project or create a new one from the sidebar</p>
            </div>
          ) : (
            <>
              {/* Project Header */}
              <div style={styles.projectHeader}>
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>📦 {selectedProjectData?.name}</h3>
                  {selectedProjectData?.description && (
                    <p style={styles.projectDescription}>{selectedProjectData.description}</p>
                  )}
                </div>
              </div>

              {/* Members Section */}
              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h4 style={{ margin: 0 }}>👥 Team Members ({selectedProjectData?.members?.length || 0})</h4>
                  {user?.role === 'Admin' && (
                    <button onClick={() => setShowMemberForm(!showMemberForm)} style={styles.btnAdd}>
                      + Add
                    </button>
                  )}
                </div>

                {showMemberForm && (
                  <form onSubmit={addMember} style={styles.formBox}>
                    <select 
                      value={newMemberId} 
                      onChange={e => setNewMemberId(e.target.value)}
                      style={styles.input}
                      required
                    >
                      <option value="">Select a member...</option>
                      {availableMembers.map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                    <button type="submit" style={styles.btnSubmit}>Add Member</button>
                    <button type="button" onClick={() => setShowMemberForm(false)} style={styles.btnCancel}>Cancel</button>
                  </form>
                )}

                <div style={styles.membersList}>
                  {selectedProjectData?.members?.length === 0 ? (
                    <p style={styles.emptyMessage}>No members yet. Add one to collaborate!</p>
                  ) : (
                    selectedProjectData?.members?.map(m => (
                      <div key={m._id} style={styles.memberCard}>
                        <div style={{ flex: 1 }}>
                          <strong style={{ display: 'block', marginBottom: '0.25rem' }}>👤 {m.name}</strong>
                          <small style={{ color: 'var(--gray)' }}>{m.email}</small>
                        </div>
                        {user?.role === 'Admin' && (
                          <button 
                            onClick={() => removeMember(selectedProject, m._id)} 
                            style={styles.btnDelete}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Tasks Section */}
              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h4 style={{ margin: 0 }}>✓ Tasks</h4>
                  <button onClick={() => setShowTaskForm(!showTaskForm)} style={styles.btnAdd}>
                    + New Task
                  </button>
                </div>

                {showTaskForm && (
                  <form onSubmit={createTask} style={styles.formBox}>
                    <div>
                      <label style={styles.label}>Title *</label>
                      <input 
                        value={taskForm.title} 
                        onChange={e=>setTaskForm({...taskForm, title: e.target.value})} 
                        style={styles.input}
                        placeholder="Enter task title"
                        required
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Description</label>
                      <textarea 
                        value={taskForm.description} 
                        onChange={e=>setTaskForm({...taskForm, description: e.target.value})} 
                        style={{...styles.input, minHeight: 100}}
                        placeholder="Describe the task..."
                        rows="3"
                      />
                    </div>
                    <div style={styles.formRow}>
                      <div style={{ flex: 1 }}>
                        <label style={styles.label}>Due Date</label>
                        <input 
                          type="date" 
                          value={taskForm.dueDate} 
                          onChange={e=>setTaskForm({...taskForm, dueDate: e.target.value})}
                          style={styles.input}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={styles.label}>Assign To</label>
                        <select 
                          value={taskForm.assignee} 
                          onChange={e=>setTaskForm({...taskForm, assignee: e.target.value})}
                          style={styles.input}
                        >
                          <option value="">Unassigned</option>
                          {selectedProjectData?.members?.map(m => (
                            <option key={m._id} value={m._id}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={styles.formActions}>
                      <button type="submit" style={styles.btnSubmit}>
                        {editingTask ? '✓ Update Task' : '+ Create Task'}
                      </button>
                      <button type="button" onClick={cancelEdit} style={styles.btnCancel}>Cancel</button>
                    </div>
                  </form>
                )}

                {overdueTasks.length > 0 && (
                  <div style={styles.warningBox}>
                    <strong>⚠️ {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}</strong>
                  </div>
                )}

                <div style={styles.tasksGrid}>
                  {['Todo', 'In Progress', 'Done'].map(status => (
                    <div key={status} style={styles.statusColumn}>
                      <div style={styles.statusHeader}>
                        <h5 style={styles.statusTitle}>
                          {status === 'Todo' && '📝'}
                          {status === 'In Progress' && '⚙️'}
                          {status === 'Done' && '✅'}
                          {' '}{status}
                        </h5>
                        <span style={styles.taskCount}>{tasksByStatus[status].length}</span>
                      </div>

                      {tasksByStatus[status].length === 0 ? (
                        <p style={styles.emptyMessage}>No tasks</p>
                      ) : (
                        <div style={styles.tasksList}>
                          {tasksByStatus[status].map(t => (
                            <div key={t._id} style={styles.taskItem}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <strong style={{ 
                                  display: 'block', 
                                  marginBottom: '0.5rem',
                                  wordBreak: 'break-word'
                                }}>
                                  {t.title}
                                </strong>
                                {t.description && (
                                  <p style={styles.taskDesc}>{t.description}</p>
                                )}
                                <div style={styles.taskMeta}>
                                  {t.dueDate && (
                                    <span style={{
                                      ...styles.metaBadge,
                                      background: new Date(t.dueDate) < new Date() ? '#fee2e2' : '#dbeafe',
                                      color: new Date(t.dueDate) < new Date() ? '#991b1b' : '#0c4a6e'
                                    }}>
                                      📅 {new Date(t.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                  {t.assignee && (
                                    <span style={styles.metaBadge}>
                                      👤 {t.assignee.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div style={styles.taskActions}>
                                {status !== 'Done' && (
                                  <button 
                                    onClick={() => updateTask(t._id, status === 'Todo' ? 'In Progress' : 'Done')} 
                                    style={styles.btnAction}
                                    title={status === 'Todo' ? 'Start' : 'Complete'}
                                  >
                                    {status === 'Todo' ? '▶️' : '✓'}
                                  </button>
                                )}
                                <button 
                                  onClick={() => startEditTask(t)} 
                                  style={styles.btnAction}
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button 
                                  onClick={() => deleteTask(t._id)} 
                                  style={{...styles.btnAction, color: 'var(--danger)'}}
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
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
    flexWrap: 'wrap',
    maxWidth: '1400px',
    margin: '0 auto',
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
  headerActions: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  navButton: {
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
  role: {
    background: 'rgba(255, 255, 255, 0.2)',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  
  /* Error & Warnings */
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
  warningBox: {
    background: '#fef3c7',
    border: '2px solid #fde047',
    color: '#92400e',
    padding: '1rem',
    borderRadius: '0.5rem',
    marginBottom: '1.5rem',
    fontWeight: '600',
  },

  /* Layout */
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(280px, 1fr) 3fr',
    gap: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 clamp(0.5rem, 3vw, 1.5rem)',
    marginBottom: '2rem',
  },
  sidebar: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    height: 'fit-content',
    position: 'sticky',
    top: '100px',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid var(--border)',
  },
  projectsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  projectCard: {
    padding: '1rem',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
  },
  btnAdd: {
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '1.2rem',
    transition: 'all 0.3s ease',
  },
  btnDelete: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.25rem',
    opacity: 0.7,
    transition: 'opacity 0.3s ease',
  },
  
  /* Main Content */
  mainContent: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: 'clamp(1rem, 5vw, 2rem)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  mobileMenuToggle: {
    display: 'none',
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600',
    marginBottom: '1rem',
    width: '100%',
  },
  
  /* Sections */
  section: {
    marginBottom: '2.5rem',
    paddingBottom: '2rem',
    borderBottom: '2px solid var(--border)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    gap: '1rem',
  },
  projectHeader: {
    borderBottom: '2px solid var(--border)',
    paddingBottom: '1.5rem',
    marginBottom: '2rem',
  },
  projectDescription: {
    color: 'var(--gray)',
    margin: 0,
    fontSize: '0.95rem',
  },
  
  /* Forms */
  formBox: {
    background: 'var(--light)',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    border: '2px solid var(--border)',
    marginBottom: '1.5rem',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  formActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  label: {
    fontWeight: '600',
    color: 'var(--dark)',
    fontSize: '0.9rem',
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
  btnSubmit: {
    padding: '0.75rem 1.5rem',
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  btnCancel: {
    padding: '0.75rem 1.5rem',
    background: 'var(--gray)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  
  /* Members */
  membersList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  },
  memberCard: {
    padding: '1rem',
    background: 'var(--light)',
    border: '2px solid var(--border)',
    borderRadius: '0.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  
  /* Tasks */
  tasksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  statusColumn: {
    background: 'var(--light)',
    borderRadius: '0.5rem',
    padding: '1rem',
    minHeight: '500px',
  },
  statusHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid var(--border)',
  },
  statusTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--dark)',
  },
  taskCount: {
    background: 'var(--primary)',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  tasksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  taskItem: {
    background: 'white',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '2px solid var(--border)',
    display: 'flex',
    gap: '0.75rem',
    transition: 'all 0.3s ease',
  },
  taskDesc: {
    fontSize: '0.85rem',
    color: 'var(--gray)',
    margin: '0.5rem 0 0 0',
    lineHeight: '1.4',
  },
  taskMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  metaBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    background: '#dbeafe',
    color: '#0c4a6e',
    width: 'fit-content',
  },
  taskActions: {
    display: 'flex',
    gap: '0.25rem',
    flexShrink: 0,
  },
  btnAction: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.25rem',
    opacity: 0.7,
    transition: 'opacity 0.3s ease',
  },
  
  /* Empty States */
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: 'var(--gray)',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  emptyMessage: {
    color: 'var(--gray)',
    fontStyle: 'italic',
    margin: 0,
    padding: '1rem',
    textAlign: 'center',
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
}

/* Add animation styles at runtime */
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @media (max-width: 1024px) {
      ${JSON.stringify({mainLayout: {gridTemplateColumns: '1fr'}})}
    }
    @media (max-width: 768px) {
      [style*="sidebar"] { display: none; }
      [style*="tasksGrid"] { gridTemplateColumns: 1fr; }
      [style*="mobileMenuToggle"] { display: block; }
      input, textarea, select { font-size: 16px; }
    }
    @media (max-width: 480px) {
      button { width: 100%; }
    }
  `
  document.head.appendChild(style)
}

