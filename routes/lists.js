const express = require('express');
const List = require('../models/List');
const Board = require('../models/Board');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all lists for a board
router.get('/:boardId', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const project = await Project.findById(board.project);
    if (!project.owner.equals(req.user._id) && !project.members.some(m => m.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const lists = await List.find({ board: req.params.boardId })
      .sort({ order: 1 });

    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create list
router.post('/', auth, async (req, res) => {
  try {
    const { name, board, order } = req.body;

    const boardDoc = await Board.findById(board);
    if (!boardDoc) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const project = await Project.findById(boardDoc.project);
    if (!project.owner.equals(req.user._id) && !project.members.some(m => m.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const list = new List({
      name,
      board,
      order: order || 0
    });

    await list.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(board.toString()).emit('list-created', list);

    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update list
router.put('/:id', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const board = await Board.findById(list.board);
    const project = await Project.findById(board.project);
    if (!project.owner.equals(req.user._id) && !project.members.some(m => m.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, order } = req.body;
    if (name) list.name = name;
    if (order !== undefined) list.order = order;

    await list.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(list.board.toString()).emit('list-updated', list);

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete list
router.delete('/:id', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const board = await Board.findById(list.board);
    const project = await Project.findById(board.project);
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await List.findByIdAndDelete(req.params.id);

    // Emit socket event
    const io = req.app.get('io');
    io.to(list.board.toString()).emit('list-deleted', list._id);

    res.json({ message: 'List deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
