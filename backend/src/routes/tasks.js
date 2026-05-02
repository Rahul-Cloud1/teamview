const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, dueDate, assignee, project } = req.body;
    if (!title || !project) return res.status(400).json({ message: 'Title and project are required' });
    const proj = await Project.findById(project);
    if (!proj) return res.status(400).json({ message: 'Invalid project' });
    const isMember = proj.members.map(String).includes(String(req.user._id)) || req.user.role === 'Admin';
    if (!isMember) return res.status(403).json({ message: 'Not a project member' });
    const task = await Task.create({ title, description, dueDate, assignee, project, createdBy: req.user._id });
    await task.populate('assignee', 'name email').populate('project', 'name');
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get tasks with filters
router.get('/', auth, async (req, res) => {
  try {
    const { project, status, overdue } = req.query;
    const filter = {};








    if (project) filter.project = project;
    if (status) filter.status = status;
    if (overdue === 'true') filter.dueDate = { $lt: new Date() };

    let tasks = await Task.find(filter).populate('assignee', 'name email').populate('project', 'name').populate('createdBy', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignee', 'name email').populate('project').populate('createdBy', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update task
router.patch('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const proj = task.project;
    const isMember = proj.members.map(String).includes(String(req.user._id)) || req.user.role === 'Admin';
    if (!isMember) return res.status(403).json({ message: 'Not a project member' });
    const { status, assignee, title, description, dueDate } = req.body;
    if (status) task.status = status;
    if (assignee) task.assignee = assignee;
    if (title) task.title = title;
    if (description) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    await task.save();
    await task.populate('assignee', 'name email').populate('project', 'name').populate('createdBy', 'name email');
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const proj = task.project;
    const isMember = proj.members.map(String).includes(String(req.user._id)) || req.user.role === 'Admin';
    if (!isMember) return res.status(403).json({ message: 'Not a project member' });
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;