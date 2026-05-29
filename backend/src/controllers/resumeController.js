const Resume = require('../models/Resume');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// @desc    Upload resume
// @route   POST /api/resumes/upload
// @access  Private (Candidate)
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file'
      });
    }

    // Check if user already has a resume
    let resume = await Resume.findOne({ candidate: req.user.id });

    // If resume exists, delete old file
    if (resume) {
      try {
        await fs.unlink(resume.filePath);
      } catch (err) {
        console.log('Old file not found or already deleted');
      }
    }

    // Send PDF to ML service for parsing
    let parsedData = null;
    let extractedText = '';

    try {
      const formData = new FormData();
      const fileBuffer = await fs.readFile(req.file.path);
      const blob = new Blob([fileBuffer], { type: 'application/pdf' });
      
      formData.append('file', blob, req.file.filename);

      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL}/api/parse-resume`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      if (mlResponse.data.success) {
        extractedText = mlResponse.data.data.text;
        parsedData = mlResponse.data.data.parsed;
      }
    } catch (mlError) {
      console.error('ML Service Error:', mlError.message);
      // Continue without parsing if ML service fails
    }

    // Save or update resume in database
    if (resume) {
      resume = await Resume.findByIdAndUpdate(
        resume._id,
        {
          fileName: req.file.originalname,
          filePath: req.file.path,
          extractedText,
          parsedData,
          uploadedAt: Date.now()
        },
        { new: true }
      );
    } else {
      resume = await Resume.create({
        candidate: req.user.id,
        fileName: req.file.originalname,
        filePath: req.file.path,
        extractedText,
        parsedData
      });
    }

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: resume
    });
  } catch (error) {
    // Delete uploaded file if database operation fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.log('Error deleting file:', err);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my resume
// @route   GET /api/resumes/my-resume
// @access  Private (Candidate)
exports.getMyResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ candidate: req.user.id });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No resume found. Please upload your resume.'
      });
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get resume by candidate ID (for recruiters)
// @route   GET /api/resumes/candidate/:candidateId
// @access  Private (Recruiter/Admin)
exports.getResumeByCandidate = async (req, res) => {
  try {
    const resume = await Resume.findOne({ candidate: req.params.candidateId })
      .populate('candidate', 'name email phone');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Download resume PDF
// @route   GET /api/resumes/download/:id
// @access  Private
exports.downloadResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Check authorization
    const isOwner = resume.candidate.toString() === req.user.id;
    const isRecruiter = req.user.role === 'recruiter' || req.user.role === 'admin';

    if (!isOwner && !isRecruiter) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this resume'
      });
    }

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(resume.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found on server'
      });
    }

    // Send file with proper headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resume.fileName}"`);
    res.download(resume.filePath, resume.fileName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/my-resume
// @access  Private (Candidate)
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ candidate: req.user.id });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No resume found'
      });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(resume.filePath);
    } catch (err) {
      console.log('File not found or already deleted');
    }

    // Delete from database
    await resume.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};