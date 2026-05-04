import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL;

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
      const res = await api.get('/api/projects')
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
      const res = await api.get('/api/tasks')
      setTasks(Array.isArray(res.data) ? res.data : [])
    }catch(err){
      console.error(err)
      setTasks([])
    }
  }

  const loadAllUsers = async () => {
    try {
      const res = await api.get('/api/auth/list')
      setAllUsers(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
      setAllUsers([])
    }
  }

  const createProject = async e => {
    e.preventDefault()
    try{
      const res = await api.post('/api/projects', projectForm)
      setProjectForm({ name: '', description: '' })
      setShowProjectForm(false)
      setSelectedProject(res.data._id)
      loadProjects()
      setError('')
    }catch(err){
      setError(err.response?.data?.message || 'Failed to create project')
    }
  }

  const deleteProject = async (projectId) => {
    if (!window.confirm('Delete this project?')) return
    try {
      await api.delete(`/api/projects/${projectId}`)
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
        await api.patch(`/api/tasks/${editingTask._id}`, { ...taskForm, project: selectedProject })
      } else {
        await api.post('/api/tasks', { ...taskForm, project: selectedProject })
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
      await api.patch(`/api/tasks/${taskId}`, { status })
      loadTasks()
    }catch(err){
      setError('Failed to update task')
    }
  }

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await api.delete(`/api/tasks/${taskId}`)
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
      await api.post(`/api/projects/${selectedProject}/members`, { memberId: newMemberId })
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
      await api.delete(`/api/projects/${projectId}/members/${memberId}`)
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

  if (loading) return <div style={styles.loading}>Loading...</div>

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
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>Welcome, {user?.name}</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: 14 }}>Team Task Manager</p>
        </div>
        <div style={styles.headerActions}>
          <span style={styles.role}>{user?.role}</span>
          {user?.role === 'Admin' && (
            <button onClick={() => nav('/users')} style={styles.btnSecondary}>👥 Users</button>
          )}
          <button onClick={logout} style={styles.btnDanger}>Logout</button>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.mainGrid}>
        {/* Sidebar - Projects */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h3>Projects</h3>
            <button onClick={()=>setShowProjectForm(!showProjectForm)} style={styles.btnSmall}>+</button>
          </div>

          {showProjectForm && (
            <form onSubmit={createProject} style={styles.form}>
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
                style={{...styles.input, minHeight: 60}}
                rows="3"
              />
              <button type="submit" style={styles.btnPrimary}>Create</button>
              <button type="button" onClick={()=>setShowProjectForm(false)} style={styles.btnSecondary}>Cancel</button>
            </form>
          )}

          <ul style={styles.projectList}>
            {projects.map(p => (
              <li key={p._id} style={{...styles.projectItem, background: selectedProject === p._id ? '#e3f2fd' : '#f5f5f5'}}>
                <div onClick={()=>setSelectedProject(p._id)} style={{ flex: 1, cursor: 'pointer' }}>
                  <strong>{p.name}</strong>
                  <p style={styles.projectMeta}>{p.members?.length || 0} members</p>
                </div>
                {user?.role === 'Admin' && (
                  <button onClick={() => deleteProject(p._id)} style={styles.btnTiny}>🗑️</button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div style={styles.main}>
          {!selectedProject ? (
            <div style={styles.emptyState}>
              <h3>Select a project to start</h3>
              <p>Create a new project or click on an existing one</p>
            </div>
          ) : (
            <>
              {/* Project Info */}
              <div style={styles.projectInfo}>
                <div>
                  <h3>{selectedProjectData?.name}</h3>
                  {selectedProjectData?.description && <p>{selectedProjectData.description}</p>}
                </div>
              </div>

              {/* Members Section */}
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h4>Team Members ({selectedProjectData?.members?.length || 0})</h4>
                  {user?.role === 'Admin' && (
                    <button onClick={() => setShowMemberForm(!showMemberForm)} style={styles.btnSmall}>+ Add</button>
                  )}
                </div>

                {showMemberForm && (
                  <form onSubmit={addMember} style={styles.form}>
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
                    <button type="submit" style={styles.btnPrimary}>Add Member</button>
                    <button type="button" onClick={() => setShowMemberForm(false)} style={styles.btnSecondary}>Cancel</button>
                  </form>
                )}

                <div style={styles.membersList}>
                  {selectedProjectData?.members?.map(m => (
                    <div key={m._id} style={styles.memberItem}>
                      <div>
                        <strong>{m.name}</strong>
                        <p style={styles.memberEmail}>{m.email}</p>
                      </div>
                      {user?.role === 'Admin' && (
                        <button onClick={() => removeMember(selectedProject, m._id)} style={styles.btnTiny}>Remove</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks Section */}
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h4>Tasks</h4>
                  <button onClick={()=>setShowTaskForm(!showTaskForm)} style={styles.btnSmall}>+ New</button>
                </div>

                {showTaskForm && (
                  <form onSubmit={createTask} style={styles.form}>
                    <div>
                      <label style={styles.label}>Title *</label>
                      <input 
                        value={taskForm.title} 
                        onChange={e=>setTaskForm({...taskForm, title: e.target.value})} 
                        style={styles.input}
                        required
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Description</label>
                      <textarea 
                        value={taskForm.description} 
                        onChange={e=>setTaskForm({...taskForm, description: e.target.value})} 
                        style={{...styles.input, minHeight: 60}}
                        rows="3"
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Due Date</label>
                      <input 
                        type="date" 
                        value={taskForm.dueDate} 
                        onChange={e=>setTaskForm({...taskForm, dueDate: e.target.value})}
                        style={styles.input}
                      />
                    </div>
                    <div>
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
                    <button type="submit" style={styles.btnPrimary}>{editingTask ? 'Update' : 'Create'} Task</button>
                    <button type="button" onClick={cancelEdit} style={styles.btnSecondary}>Cancel</button>
                  </form>
                )}

                {overdueTasks.length > 0 && (
                  <div style={styles.alertBox}>
                    <strong>⚠️ {overdueTasks.length} overdue task(s)</strong>
                  </div>
                )}

                {['Todo', 'In Progress', 'Done'].map(status => (
                  <div key={status} style={styles.statusSection}>
                    <h5 style={styles.statusTitle}>{status} ({tasksByStatus[status].length})</h5>
                    {tasksByStatus[status].length === 0 ? (
                      <p style={styles.emptyText}>No tasks</p>
                    ) : (
                      <div style={styles.tasksList}>
                        {tasksByStatus[status].map(t => (
                          <div key={t._id} style={styles.taskCard}>
                            <div style={{ flex: 1 }}>
                              <strong>{t.title}</strong>
                              {t.description && <p style={styles.taskDesc}>{t.description}</p>}
                              <div style={styles.taskMeta}>
                                {t.dueDate && (
                                  <span style={{
                                    ...styles.taskMetaItem,
                                    color: new Date(t.dueDate) < new Date() ? '#dc3545' : '#666'
                                  }}>
                                    📅 {new Date(t.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                                {t.assignee && (
                                  <span style={styles.taskMetaItem}>👤 {t.assignee.name}</span>
                                )}
                              </div>
                            </div>
                            <div style={styles.taskActions}>
                              {status !== 'Done' && (
                                <button 
                                  onClick={()=>updateTask(t._id, status === 'Todo' ? 'In Progress' : 'Done')} 
                                  style={styles.btnSuccess}
                                >
                                  {status === 'Todo' ? '▶️ Start' : '✓ Done'}
                                </button>
                              )}
                              <button onClick={() => startEditTask(t)} style={styles.btnInfo}>✏️ Edit</button>
                              <button onClick={() => deleteTask(t._id)} style={styles.btnDanger}>🗑️ Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    background: '#f8f9fa',
    minHeight: '100vh',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '30px',
    marginBottom: '30px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  role: {
    background: 'rgba(255,255,255,0.2)',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  errorBox: {
    color: '#dc3545',
    marginBottom: '20px',
    padding: '15px',
    background: '#ffe0e0',
    borderRadius: '6px',
    border: '1px solid #ff6b6b',
  },
  alertBox: {
    color: '#856404',
    marginBottom: '15px',
    padding: '15px',
    background: '#fff3cd',
    borderRadius: '6px',
    border: '1px solid #ffc107',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '20px',
    padding: '0 20px 20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  sidebar: {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    height: 'fit-content',
    position: 'sticky',
    top: '20px',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  projectList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  projectItem: {
    padding: '12px',
    margin: '8px 0',
    background: '#f5f5f5',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  projectMeta: {
    margin: '5px 0 0 0',
    fontSize: '12px',
    color: '#666',
  },
  main: {
    background: 'white',
    borderRadius: '8px',
    padding: '25px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#999',
  },
  projectInfo: {
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '20px',
    marginBottom: '25px',
  },
  section: {
    marginBottom: '30px',
    paddingBottom: '25px',
    borderBottom: '1px solid #f0f0f0',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  form: {
    background: '#f9f9f9',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '15px',
    border: '1px solid #e9e9e9',
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '8px 0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  label: {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '5px',
    fontSize: '13px',
    color: '#333',
  },
  membersList: {
    display: 'grid',
    gap: '10px',
  },
  memberItem: {
    padding: '12px',
    background: '#f9f9f9',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #e9e9e9',
  },
  memberEmail: {
    margin: '3px 0 0 0',
    fontSize: '12px',
    color: '#666',
  },
  statusSection: {
    marginBottom: '25px',
  },
  statusTitle: {
    margin: '15px 0 10px 0',
    padding: '8px 12px',
    background: '#f0f0f0',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#555',
  },
  tasksList: {
    display: 'grid',
    gap: '12px',
  },
  taskCard: {
    padding: '15px',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  taskDesc: {
    margin: '5px 0',
    fontSize: '13px',
    color: '#666',
  },
  taskMeta: {
    display: 'flex',
    gap: '15px',
    marginTop: '8px',
    flexWrap: 'wrap',
  },
  taskMetaItem: {
    fontSize: '12px',
    color: '#666',
  },
  taskActions: {
    display: 'flex',
    gap: '5px',
    flexShrink: 0,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    margin: 0,
  },
  btnPrimary: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '10px',
    transition: 'background 0.2s',
  },
  btnSecondary: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    width: '100%',
    marginTop: '10px',
  },
  btnDanger: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  btnSuccess: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  btnInfo: {
    background: '#17a2b8',
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  btnSmall: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  btnTiny: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px',
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
  },
}

