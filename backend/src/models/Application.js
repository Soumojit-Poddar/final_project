const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  matchDetails: {
    matchedSkills: [String],
    missingSkills: [String],
    experienceMatch: Boolean,
    similarityScore: Number,
    keywordMatches: [{
      keyword: String,
      count: Number
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'interview'],
    default: 'pending'
  },
  recruiterNotes: String,
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate applications
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);