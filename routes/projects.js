const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all projects for user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
    .populate('owner', 'username email avatar')
    .populate('members', 'username email avatar')
    .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username email avatar')
      .populate('members', 'username email avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or member
    if (!project.owner._id.equals(req.user._id) && !project.members.some(m => m._id.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const project = new Project({
      name,
      description,
      owner: req.user._id,
      color: color || '#3B82F6',
      members: [req.user._id]
    });

    await project.save();
    await project.populate('owner', 'username email avatar');
    await project.populate('members', 'username email avatar');

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description, color } = req.body;

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;

    await project.save();
    await project.populate('owner', 'username email avatar');
    await project.populate('members', 'username email avatar');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add member to project
router.post('/:id/members', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (project.members.includes(user._id)) {
      return res.status(400).json({ message: 'User already a member' });
    }

    project.members.push(user._id);
    await project.save();
    await project.populate('owner', 'username email avatar');
    await project.populate('members', 'username email avatar');

    // Emit socket event
    const io = req.app.get('io');
    io.to(project._id.toString()).emit('member-added', { project, user });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
