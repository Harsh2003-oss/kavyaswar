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
      default: 1.0,  // Speed (0.1 to 10)
    },
    pitch: {
      type: Number,
      default: 1.0,  // Pitch (0 to 2)
    },
    volume: {                    // ✅ ADD THIS
      type: Number,
      default: 1.0,  // Volume (0 to 1)
    },
    autoPlay: {                  // ✅ ADD THIS
      type: Boolean,
      default: false,
    },
  },
  backgroundMusic: {             // ✅ ADD THIS
    url: {
      type: String,
      default: '',
    },
    volume: {
      type: Number,
      default: 0.3,  // BG music volume (0 to 1)
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