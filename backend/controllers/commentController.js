const Comment = require('../models/Comment');
const Poem = require('../models/Poem');

// Add a comment to a poem (No auth needed - guest comments)
exports.addComment = async (req, res) => {
  try {
    const { guestName, guestEmail, comment } = req.body;
    const { poemId } = req.params;

    // Validate input
    if (!guestName || !comment) {
      return res.status(400).json({ message: 'Please provide name and comment' });
    }

    // Check if poem exists and is public
    const poem = await Poem.findById(poemId);
    if (!poem) {
      return res.status(404).json({ message: 'Poem not found' });
    }

    if (!poem.isPublic) {
      return res.status(403).json({ message: 'Cannot comment on private poem' });
    }

    // Create new comment
    const newComment = new Comment({
      poemId,
      guestName,
      guestEmail: guestEmail || '',
      comment,
    });

    await newComment.save();

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all comments for a poem (No auth needed)
exports.getComments = async (req, res) => {
  try {
    const { poemId } = req.params;

    // Check if poem exists
    const poem = await Poem.findById(poemId);
    if (!poem) {
      return res.status(404).json({ message: 'Poem not found' });
    }

    // Get all comments for this poem
    const comments = await Comment.find({ poemId })
      .sort({ createdAt: -1 }); // Newest first

    res.json({
      count: comments.length,
      comments,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a comment (Only poem owner can delete)
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Get the poem to check ownership
    const poem = await Poem.findById(comment.poemId);
    if (!poem) {
      return res.status(404).json({ message: 'Poem not found' });
    }

    // Check if user owns the poem
    if (poem.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};