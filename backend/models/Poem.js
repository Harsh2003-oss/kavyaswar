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
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
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
    default: 3000,
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
    volume: {
      type: Number,
      default: 1.0,
    },
    autoPlay: {
      type: Boolean,
      default: false,
    },
  },
  backgroundMusic: {
    url: {
      type: String,
      default: '',
    },
    volume: {
      type: Number,
      default: 0.3,
    },
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
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

PoemSchema.pre('save', function() {
  if (!this.shareableLink) {
    this.shareableLink = crypto.randomBytes(8).toString('hex');
  }
  this.updatedAt = Date.now();
});


module.exports = mongoose.model('Poem', PoemSchema);