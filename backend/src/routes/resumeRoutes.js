const express = require('express');
const router = express.Router();
const {
  uploadResume,
  getMyResume,
  getResumeByCandidate,
  downloadResume,
  deleteResume
} = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Candidate routes
router.post('/upload', protect, authorize('candidate'), upload.single('resume'), uploadResume);
router.get('/my-resume', protect, authorize('candidate'), getMyResume);
router.delete('/my-resume', protect, authorize('candidate'), deleteResume);

// Recruiter/Admin routes
router.get('/candidate/:candidateId', protect, authorize('recruiter', 'admin'), getResumeByCandidate);

// Download (both candidate and recruiter can access)
router.get('/download/:id', protect, downloadResume);

module.exports = router;