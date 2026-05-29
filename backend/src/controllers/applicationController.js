const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const axios = require('axios');

// @desc    Apply for a job
// @route   POST /api/applications/apply/:jobId
// @access  Private (Candidate)
exports.applyForJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications'
      });
    }

    // Check if user has uploaded resume
    const resume = await Resume.findOne({ candidate: req.user.id });
    if (!resume) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume before applying'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Calculate match score using ML service
    let matchScore = 0;
    let matchDetails = {
      matchedSkills: [],
      missingSkills: [],
      experienceMatch: false,
      similarityScore: 0,
      keywordMatches: []
    };

    try {
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL}/api/match-resume`,
        {
          job_description: `${job.title} ${job.description} ${job.requirements}`,
          resume_text: resume.extractedText || '',
          job_skills: job.skills || [],
          resume_skills: resume.parsedData?.skills || []
        },
        { timeout: 30000 }
      );

      if (mlResponse.data.success) {
        matchScore = mlResponse.data.data.match_score;
        matchDetails = {
          matchedSkills: mlResponse.data.data.matched_skills,
          missingSkills: mlResponse.data.data.missing_skills,
          experienceMatch: mlResponse.data.data.experience_match,
          similarityScore: mlResponse.data.data.similarity_score,
          keywordMatches: mlResponse.data.data.keyword_matches
        };
      }
    } catch (mlError) {
      console.error('ML Service Error:', mlError.message);
      // Continue with default scores if ML service fails
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      candidate: req.user.id,
      resume: resume._id,
      matchScore,
      matchDetails
    });

    // Add application to job's applicants array
    await Job.findByIdAndUpdate(jobId, {
      $push: { applicants: application._id }
    });

    // Populate application data
    const populatedApplication = await Application.findById(application._id)
      .populate('job', 'title company')
      .populate('candidate', 'name email');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: populatedApplication
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all my applications (for candidates)
// @route   GET /api/applications/my-applications
// @access  Private (Candidate)
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate('job', 'title company location jobType status')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get applications for a specific job (for recruiters)
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter/Admin)
exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if recruiter owns this job
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these applications'
      });
    }

    const { status, minScore, sortBy = 'matchScore' } = req.query;

    // Build query
    let query = { job: req.params.jobId };
    if (status) query.status = status;
    if (minScore) query.matchScore = { $gte: parseInt(minScore) };

    // Sort options
    let sortOptions = {};
    if (sortBy === 'matchScore') sortOptions.matchScore = -1;
    else if (sortBy === 'recent') sortOptions.appliedAt = -1;
    else sortOptions.matchScore = -1; // default

    const applications = await Application.find(query)
      .populate('candidate', 'name email phone')
      .populate('resume')
      .sort(sortOptions);

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('candidate', 'name email phone')
      .populate('resume');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check authorization
    const isCandidate = application.candidate._id.toString() === req.user.id;
    const isRecruiter = req.user.role === 'recruiter' || req.user.role === 'admin';

    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update application status (for recruiters)
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter/Admin)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, recruiterNotes } = req.body;

    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if recruiter owns the job
    if (application.job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    application.status = status || application.status;
    application.recruiterNotes = recruiterNotes || application.recruiterNotes;

    await application.save();

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Withdraw application (for candidates)
// @route   DELETE /api/applications/:id
// @access  Private (Candidate)
exports.withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns this application
    if (application.candidate.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application'
      });
    }

    // Remove from job's applicants array
    await Job.findByIdAndUpdate(application.job, {
      $pull: { applicants: application._id }
    });

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get analytics for a job (for recruiters)
// @route   GET /api/applications/analytics/:jobId
// @access  Private (Recruiter/Admin)
exports.getJobAnalytics = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check authorization
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics'
      });
    }

    const applications = await Application.find({ job: req.params.jobId });

    // Calculate analytics
    const totalApplications = applications.length;
    const averageScore = applications.length > 0
      ? applications.reduce((sum, app) => sum + app.matchScore, 0) / applications.length
      : 0;

    const statusBreakdown = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    const topCandidates = applications
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10)
      .map(app => ({
        candidateId: app.candidate,
        matchScore: app.matchScore,
        appliedAt: app.appliedAt,
        status: app.status
      }));

    res.status(200).json({
      success: true,
      data: {
        totalApplications,
        averageScore: Math.round(averageScore * 100) / 100,
        statusBreakdown,
        topCandidates
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};