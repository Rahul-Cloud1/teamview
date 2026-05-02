const express = require('express');
const Project = require('../models/Project');
const { auth, permit } = require('../middleware/auth');

const router = express.Router();

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });
    const project = await Project.create({ name, description, members: members || [], createdBy: req.user._id });
    await project.populate('members', 'name email');
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get projects
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'Admin') {
      const all = await Project.find().populate('members', 'name email').populate('createdBy', 'name email');
      return res.json(all);
    }
    const projects = await Project.find({ members: req.user._id }).populate('members', 'name email').populate('createdBy', 'name email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email').populate('createdBy', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add member to project
router.post('/:id/members', auth, permit('Admin'), async (req, res) => {
  try {
    const { memberId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.members.includes(memberId)) project.members.push(memberId);
    await project.save();
    await project.populate('members', 'name email');
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete project (Admin only)
router.delete('/:id', auth, permit('Admin'), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
