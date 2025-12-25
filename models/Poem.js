const mongoose = require('mongoose');
const crypto = require('crypto');

const PoemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  lines: [{
    type: String,
  }],
  isPublic: {
    type: Boolean,
    default: false,
  },
  shareableLink: {
    type: String,
    unique: true,
  },
  slideInterval: {
    type: Number,
    default: 3000, // 3 seconds per 2 lines
  },
  narrationSettings: {
    voice: {
      type: String,
      default: 'default',
    },
    rate: {
      type: Number,
      default: 1.0,
    },
    pitch: {
      type: Number,
      default: 1.0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate unique shareable link before saving
PoemSchema.pre('save', function(next) {
  if (!this.shareableLink) {
    this.shareableLink = crypto.randomBytes(8).toString('hex');
  }
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Poem', PoemSchema);