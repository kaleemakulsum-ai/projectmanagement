const express = require('express');
const Board = require('../models/Board');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all boards for a project
router.get('/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or member
    if (!project.owner.equals(req.user._id) && !project.members.some(m => m.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const boards = await Board.find({ project: req.params.projectId })
      .sort({ createdAt: 1 });

    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create board
router.post('/', auth, async (req, res) => {
  try {
    const { name, project } = req.body;

    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or member
    if (!projectDoc.owner.equals(req.user._id) && !projectDoc.members.some(m => m.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const board = new Board({
      name,
      project
    });

    await board.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(project.toString()).emit('board-created', board);

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update board
router.put('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const project = await Project.findById(board.project);
    if (!project.owner.equals(req.user._id) && !project.members.some(m => m.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name } = req.body;
    if (name) board.name = name;

    await board.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(board.project.toString()).emit('board-updated', board);

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete board
router.delete('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const project = await Project.findById(board.project);
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Board.findByIdAndDelete(req.params.id);

    // Emit socket event
    const io = req.app.get('io');
    io.to(board.project.toString()).emit('board-deleted', board._id);

    res.json({ message: 'Board deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
