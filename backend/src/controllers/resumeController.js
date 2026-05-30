const Resume = require('../models/Resume');
const axios = require('axios');
const fs = require('fs').promises;
const fssync = require('fs');
const path = require('path');

// ========================================
// ✅ Ensure uploads directory exists
// ========================================

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

const ensureUploadsDir = async () => {
  try {
    if (!fssync.existsSync(UPLOADS_DIR)) {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      console.log('✅ Uploads directory created/verified:', UPLOADS_DIR);
    }
  } catch (error) {
    console.error('❌ Error creating uploads directory:', error);
  }
};

// Create uploads directory on startup
ensureUploadsDir();

// ========================================
// Resume Upload Controller
// ========================================

// @desc    Upload resume
// @route   POST /api/resumes/upload
// @access  Private (Candidate)
exports.uploadResume = async (req, res) => {
  try {
    // ✅ Ensure uploads folder exists before processing
    await ensureUploadsDir();

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file'
      });
    }

    console.log('📄 Resume upload started:', {
      filename: req.file.filename,
      size: req.file.size,
      path: req.file.path,
      userId: req.user.id
    });

    // Check if user already has a resume
    let resume = await Resume.findOne({ candidate: req.user.id });

    // If resume exists, delete old file
    if (resume) {
      try {
        if (fssync.existsSync(resume.filePath)) {
          await fs.unlink(resume.filePath);
          console.log('🗑️ Old resume file deleted:', resume.filePath);
        }
      } catch (err) {
        console.log('⚠️ Old file not found or already deleted');
      }
    }

    // Send PDF to ML service for parsing
    let parsedData = null;
    let extractedText = '';
    let skills = [];

    try {
      console.log('🤖 Sending resume to ML service:', process.env.ML_SERVICE_URL);
      
      const FormData = require('form-data');
      const formData = new FormData();
      
      // Read file from disk
      const fileStream = fssync.createReadStream(req.file.path);
      formData.append('file', fileStream, req.file.filename);

      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL}/api/parse-resume`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 30000 // 30 seconds timeout
        }
      );

      if (mlResponse.data.success) {
        extractedText = mlResponse.data.data.text || '';
        parsedData = mlResponse.data.data.parsed || {};
        skills = parsedData.skills || [];
        
        console.log('✅ ML Service response:', {
          textLength: extractedText.length,
          skills: skills.length,
          experience: parsedData.experience_years
        });
      }
    } catch (mlError) {
      console.error('⚠️ ML Service Error:', {
        message: mlError.message,
        status: mlError.response?.status,
        data: mlError.response?.data
      });
      // Continue without parsing if ML service fails
      // User can still use basic resume functionality
    }

    // Save or update resume in database
    if (resume) {
      resume = await Resume.findByIdAndUpdate(
        resume._id,
        {
          fileName: req.file.originalname,
          filePath: req.file.path,
          fileSize: req.file.size,
          extractedText,
          skills,
          parsedData,
          uploadedAt: Date.now()
        },
        { new: true }
      );
      console.log('✅ Resume updated in database:', resume._id);
    } else {
      resume = await Resume.create({
        candidate: req.user.id,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        extractedText,
        skills,
        parsedData
      });
      console.log('✅ New resume created:', resume._id);
    }

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        ...resume.toObject(),
        parsed: {
          skills: skills.length,
          experience: parsedData.experience_years || 0
        }
      }
    });
  } catch (error) {
    console.error('❌ Resume upload error:', error);
    
    // Delete uploaded file if database operation fails
    if (req.file) {
      try {
        if (fssync.existsSync(req.file.path)) {
          await fs.unlink(req.file.path);
          console.log('🗑️ Failed upload file deleted');
        }
      } catch (err) {
        console.log('Error deleting failed upload:', err.message);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload resume'
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
    if (!fssync.existsSync(resume.filePath)) {
      console.error('❌ Resume file not found:', resume.filePath);
      return res.status(404).json({
        success: false,
        message: 'Resume file not found on server. Please re-upload your resume.'
      });
    }

    // Send file with proper headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resume.fileName}"`);
    res.download(resume.filePath, resume.fileName, (err) => {
      if (err) {
        console.error('❌ Error downloading resume:', err);
      }
    });
  } catch (error) {
    console.error('❌ Download error:', error);
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
      if (fssync.existsSync(resume.filePath)) {
        await fs.unlink(resume.filePath);
        console.log('✅ Resume file deleted:', resume.filePath);
      }
    } catch (err) {
      console.log('⚠️ File not found or already deleted');
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