const express = require('express');
const Comment = require('../models/Comment');
const Card = require('../models/Card');
const List = require('../models/List');
const Board = require('../models/Board');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all comments for a card
router.get('/:cardId', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId);
    
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const board = await Board.findById(card.board);
    const project = await Project.findById(board.project);
    if (!project.owner.equals(req.user._id) && !project.members.some(m => m.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const comments = await Comment.find({ card: req.params.cardId })
      .populate('author', 'username email avatar')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create comment
router.post('/', auth, async (req, res) => {
  try {
    const { text, card } = req.body;

    const cardDoc = await Card.findById(card);
    if (!cardDoc) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const board = await Board.findById(cardDoc.board);
    const project = await Project.findById(board.project);
    if (!project.owner.equals(req.user._id) && !project.members.some(m => m.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const comment = new Comment({
      text,
      card,
      author: req.user._id
    });

    await comment.save();
    await comment.populate('author', 'username email avatar');

    // Create notification for card assignees
    if (cardDoc.assignedTo && cardDoc.assignedTo.length > 0) {
      for (const userId of cardDoc.assignedTo) {
        if (!userId.equals(req.user._id)) {
          const notification = new Notification({
            recipient: userId,
            type: 'comment',
            message: `${req.user.username} commented on card: ${cardDoc.title}`,
            card: cardDoc._id,
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
    io.to(board.toString()).emit('comment-created', comment);

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (!comment.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
