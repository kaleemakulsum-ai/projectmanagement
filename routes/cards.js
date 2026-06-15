const express = require('express');
const Card = require('../models/Card');
const List = require('../models/List');
const Board = require('../models/Board');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all cards for a list
router.get('/:listId', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const board = await Board.findById(list.board);
    const project = await Project.findById(board.project);
    if (!project.owner.equals(req.user._id) && !project.members.some(m => m.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const cards = await Card.find({ list: req.params.listId })
      .populate('assignedTo', 'username email avatar')
      .sort({ order: 1 });

    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create card
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, list, board, order, dueDate, priority } = req.body;

    const listDoc = await List.findById(list);
    if (!listDoc) {
      return res.status(404).json({ message: 'List not found' });
    }

    const boardDoc = await Board.findById(board);
    const project = await Project.findById(boardDoc.project);
    if (!project.owner.equals(req.user._id) && !project.members.some(m => m.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const card = new Card({
      title,
      description,
      list,
      board,
      order: order || 0,
      dueDate,
      priority: priority || 'medium'
    });

    await card.save();
    await card.populate('assignedTo', 'username email avatar');

    // Emit socket event
    const io = req.app.get('io');
    io.to(board.toString()).emit('card-created', card);

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update card
router.put('/:id', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const board = await Board.findById(card.board);
    const project = await Project.findById(board.project);
    if (!project.owner.equals(req.user._id) && !project.members.some(m => m.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, list, order, dueDate, priority, assignedTo, labels } = req.body;

    if (title) card.title = title;
    if (description !== undefined) card.description = description;
    if (list) card.list = list;
    if (order !== undefined) card.order = order;
    if (dueDate !== undefined) card.dueDate = dueDate;
    if (priority) card.priority = priority;
    if (assignedTo) card.assignedTo = assignedTo;
    if (labels) card.labels = labels;

    await card.save();
    await card.populate('assignedTo', 'username email avatar');

    // Create notification for assigned users
    if (assignedTo && assignedTo.length > 0) {
      for (const userId of assignedTo) {
        if (!userId.equals(req.user._id)) {
          const notification = new Notification({
            recipient: userId,
            type: 'assignment',
            message: `You were assigned to card: ${card.title}`,
            card: card._id,
            project: project._id
          });
          await notification.save();

          const io = req.app.get('io');
          io.to(userId.toString()).emit('notification', notification);
        }
      }
    }

    // Emit socket event
    const io = req.app.get('io');
    io.to(board.toString()).emit('card-updated', card);

    res.json(card);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Move card
router.put('/:id/move', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const board = await Board.findById(card.board);
    const project = await Project.findById(board.project);
    if (!project.owner.equals(req.user._id) && !project.members.some(m => m.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { list, order } = req.body;

    if (list) card.list = list;
    if (order !== undefined) card.order = order;

    await card.save();
    await card.populate('assignedTo', 'username email avatar');

    // Emit socket event
    const io = req.app.get('io');
    io.to(board.toString()).emit('card-moved', card);

    res.json(card);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete card
router.delete('/:id', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const board = await Board.findById(card.board);
    const project = await Project.findById(board.project);
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Card.findByIdAndDelete(req.params.id);

    // Emit socket event
    const io = req.app.get('io');
    io.to(board.toString()).emit('card-deleted', card._id);

    res.json({ message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
