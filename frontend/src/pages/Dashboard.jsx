import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const api = axios.create()
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export default function Dashboard(){
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', assignee: '' })
  const [projectForm, setProjectForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const nav = useNavigate()

  useEffect(()=>{
    if (!localStorage.getItem('token')) return nav('/')
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    setUser(u)
    loadProjects()
    loadTasks()
  }, [])

  const loadProjects = async ()=>{
    try{
      const res = await api.get('/api/projects')
      setProjects(res.data)
    }catch(err){
      setError('Failed to load projects')
      console.error(err)
    }finally{
      setLoading(false)
    }
  }

  const loadTasks = async ()=>{
    try{
      const res = await api.get('/api/tasks')
      setTasks(res.data)
    }catch(err){
      console.error(err)
    }
  }

  const createProject = async e => {
    e.preventDefault()
    try{
      await api.post('/api/projects', projectForm)
      setProjectForm({ name: '', description: '' })
      setShowProjectForm(false)
      loadProjects()
    }catch(err){
      setError(err.response?.data?.message || 'Failed to create project')
    }
  }

  const createTask = async e => {
    e.preventDefault()
    if (!selectedProject) {
      setError('Select a project first')
      return
    }
    try{
      await api.post('/api/tasks', { ...taskForm, project: selectedProject })
      setTaskForm({ title: '', description: '', dueDate: '', assignee: '' })
      setShowTaskForm(false)
      loadTasks()
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

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    nav('/')
  }

  if (loading) return <div>Loading...</div>

  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date())
  const tasksByStatus = {
    'Todo': tasks.filter(t => t.status === 'Todo'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Done': tasks.filter(t => t.status === 'Done')
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Welcome, {user?.name}</h2>
        <div>
          <span style={{ marginRight: 10 }}>Role: <strong>{user?.role}</strong></span>
          <button onClick={logout} style={{ background: '#dc3545' }}>Logout</button>
        </div>
      </div>

      {error && <div style={{ color: 'red', marginBottom: 10, padding: 10, background: '#ffe0e0', borderRadius: 4 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        {/* Sidebar */}
        <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8 }}>
          <h3>Projects</h3>
          <button onClick={()=>setShowProjectForm(!showProjectForm)} style={{ width: '100%', marginBottom: 10 }}>+ New Project</button>

          {showProjectForm && (
            <form onSubmit={createProject} style={{ marginBottom: 15, padding: 10, background: '#f9f9f9', borderRadius: 4 }}>
              <input placeholder="Project name" value={projectForm.name} onChange={e=>setProjectForm({...projectForm, name: e.target.value})} required/>
              <textarea placeholder="Description" value={projectForm.description} onChange={e=>setProjectForm({...projectForm, description: e.target.value})} rows="3"/>
              <button type="submit" style={{ width: '100%' }}>Create</button>
              <button type="button" onClick={()=>setShowProjectForm(false)} style={{ width: '100%', background: '#6c757d' }}>Cancel</button>
            </form>
          )}

          <ul style={{ listStyle: 'none' }}>
            {projects.map(p => (
              <li key={p._id} style={{ padding: 10, margin: 5, background: selectedProject === p._id ? '#e3f2fd' : '#f5f5f5', cursor: 'pointer', borderRadius: 4 }}>
                <strong onClick={()=>setSelectedProject(p._id)}>{p.name}</strong>
                <p style={{ fontSize: 12, color: '#666' }}>{p.members.length} members</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
            <h3>Tasks</h3>
            <button onClick={()=>setShowTaskForm(!showTaskForm)}>+ New Task</button>
          </div>

          {showTaskForm && (
            <form onSubmit={createTask} style={{ marginBottom: 15, padding: 15, background: '#f9f9f9', borderRadius: 8, border: '1px solid #ddd' }}>
              <div>
                <label>Title</label>
                <input value={taskForm.title} onChange={e=>setTaskForm({...taskForm, title: e.target.value})} required/>
              </div>
              <div>
                <label>Description</label>
                <textarea value={taskForm.description} onChange={e=>setTaskForm({...taskForm, description: e.target.value})} rows="3"/>
              </div>
              <div>
                <label>Due Date</label>
                <input type="date" value={taskForm.dueDate} onChange={e=>setTaskForm({...taskForm, dueDate: e.target.value})}/>
              </div>
              <button type="submit" style={{ width: '100%' }}>Create Task</button>
              <button type="button" onClick={()=>setShowTaskForm(false)} style={{ width: '100%', background: '#6c757d' }}>Cancel</button>
            </form>
          )}

          {overdueTasks.length > 0 && (
            <div style={{ padding: 10, background: '#fff3cd', borderRadius: 4, marginBottom: 15 }}>
              <strong>⚠️ {overdueTasks.length} overdue task(s)</strong>
            </div>
          )}

          {['Todo', 'In Progress', 'Done'].map(status => (
            <div key={status} style={{ marginBottom: 20 }}>
              <h4>{status} ({tasksByStatus[status].length})</h4>
              {tasksByStatus[status].length === 0 ? (
                <p style={{ color: '#999' }}>No tasks</p>
              ) : (
                <ul style={{ listStyle: 'none' }}>
                  {tasksByStatus[status].map(t => (
                    <li key={t._id} style={{ padding: 10, margin: 5, background: '#fff', border: '1px solid #ddd', borderRadius: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <strong>{t.title}</strong>
                          {t.dueDate && <p style={{ fontSize: 12, color: new Date(t.dueDate) < new Date() ? 'red' : '#666' }}>Due: {new Date(t.dueDate).toLocaleDateString()}</p>}
                          {t.assignee && <p style={{ fontSize: 12, color: '#666' }}>Assigned to: {t.assignee.name}</p>}
                        </div>
                        {status !== 'Done' && (
                          <button onClick={()=>updateTask(t._id, status === 'Todo' ? 'In Progress' : 'Done')} style={{ height: 'fit-content' }}>
                            {status === 'Todo' ? 'Start' : 'Complete'}
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
