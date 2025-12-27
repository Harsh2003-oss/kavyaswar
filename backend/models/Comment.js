const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  poemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poem',
    required: true,
  },
  guestName: {
    type: String,
    required: true,
    trim: true,
  },
  guestEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  comment: {
    type: String,
    required: true,
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Comment', CommentSchema);
