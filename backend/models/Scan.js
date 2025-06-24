const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true
  },
  results: {
    ssl: {
      valid_from: String,
      valid_to: String,
      subject: Object,
      issuer: Object,
      protocol: String
    },
    headers: Object,
    ports: [Number],
    vulnerabilities: [String]
  },
  securityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  scanDuration: {
    type: Number, // in milliseconds
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  errorMessage: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
scanSchema.index({ user: 1, createdAt: -1 });
scanSchema.index({ url: 1 });

module.exports = mongoose.model('Scan', scanSchema);