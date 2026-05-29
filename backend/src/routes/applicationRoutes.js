const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getApplication,
  updateApplicationStatus,
  withdrawApplication,
  getJobAnalytics
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

// Candidate routes
router.post('/apply/:jobId', protect, authorize('candidate'), applyForJob);
router.get('/my-applications', protect, authorize('candidate'), getMyApplications);
router.delete('/:id', protect, authorize('candidate'), withdrawApplication);

// Recruiter/Admin routes
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplications);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.get('/analytics/:jobId', protect, authorize('recruiter', 'admin'), getJobAnalytics);

// Shared routes
router.get('/:id', protect, getApplication);

module.exports = router;