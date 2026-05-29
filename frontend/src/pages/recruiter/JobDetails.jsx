import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../../services/api';
import { 
  Briefcase, MapPin, DollarSign, Users, TrendingUp, 
  ArrowLeft, Edit, Filter, ChevronDown
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { resumeAPI } from '../../services/api';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'all', minScore: 0 });
  const [sortBy, setSortBy] = useState('matchScore');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch job details
      const jobRes = await jobAPI.getById(id);
      setJob(jobRes.data.data);
      
      // Fetch applications
      const appsRes = await applicationAPI.getJobApplications(id, {
        sortBy: 'matchScore'
      });
      setApplications(appsRes.data.data);
    } catch (error) {
      toast.error('Failed to load job details');
      navigate('/recruiter/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, newStatus, notes) => {
    try {
      await applicationAPI.updateStatus(appId, { 
        status: newStatus,
        recruiterNotes: notes 
      });
      
      // Update local state
      setApplications(apps =>
        apps.map(app =>
          app._id === appId
            ? { ...app, status: newStatus, recruiterNotes: notes }
            : app
        )
      );
      
      toast.success('Application status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredAndSorted = applications
    .filter(app => {
      if (filter.status !== 'all' && app.status !== filter.status) return false;
      if (app.matchScore < filter.minScore) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'matchScore') return b.matchScore - a.matchScore;
      if (sortBy === 'recent') return new Date(b.appliedAt) - new Date(a.appliedAt);
      return 0;
    });

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 45) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'badge-warning',
      reviewed: 'badge-info',
      shortlisted: 'badge-success',
      rejected: 'badge-error',
      interview: 'badge-primary',
    };
    return colors[status] || 'badge';
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!job) {
    return <div>Job not found</div>;
  }

  const stats = {
    total: applications.length,
    avgScore: applications.length > 0
      ? (applications.reduce((sum, a) => sum + a.matchScore, 0) / applications.length).toFixed(1)
      : 0,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/recruiter/jobs')}
        className="btn-ghost flex items-center"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </button>

      {/* Job Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{job.title}</h1>
            <p className="text-gray-400 text-lg">{job.company}</p>
          </div>
          <div className="flex space-x-2">
            <span className={getStatusColor(job.status)}>
              {job.status}
            </span>
            <Link to={`/recruiter/jobs/${id}/edit`} className="btn-secondary">
              <Edit className="w-4 h-4 mr-2" />
              Edit Job
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
          {job.location && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {job.location}
            </div>
          )}
          <div className="flex items-center">
            <Briefcase className="w-4 h-4 mr-1" />
            <span className="capitalize">{job.jobType}</span>
          </div>
          {job.salary && job.salary.min > 0 && (
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              {job.salary.min.toLocaleString()}-{job.salary.max.toLocaleString()} {job.salary.currency}
            </div>
          )}
        </div>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <span key={index} className="badge-primary">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
            <p className="text-gray-300 whitespace-pre-line">{job.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Requirements</h3>
            <p className="text-gray-300 whitespace-pre-line">{job.requirements}</p>
          </div>
        </div>
      </div>

      {/* Application Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Applications</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-primary-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Match Score</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.avgScore}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Shortlisted</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.shortlisted}</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Applicants Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Applicants ({filteredAndSorted.length})
          </h2>

          {/* Filters & Sort */}
          <div className="flex space-x-3">
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="input py-2"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filter.minScore}
              onChange={(e) => setFilter({ ...filter, minScore: parseInt(e.target.value) })}
              className="input py-2"
            >
              <option value="0">All Scores</option>
              <option value="75">75%+ (Excellent)</option>
              <option value="60">60%+ (Good)</option>
              <option value="45">45%+ (Fair)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input py-2"
            >
              <option value="matchScore">Sort by Score</option>
              <option value="recent">Sort by Date</option>
            </select>
          </div>
        </div>

        {/* Applicants Table */}
        {filteredAndSorted.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No applicants found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSorted.map((app) => (
              <ApplicantCard
                key={app._id}
                application={app}
                onStatusUpdate={handleStatusUpdate}
                getScoreColor={getScoreColor}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Applicant Card Component
const ApplicantCard = ({ application, onStatusUpdate, getScoreColor, getStatusColor }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [notes, setNotes] = useState(application.recruiterNotes || '');
  const [downloading, setDownloading] = useState(false);

  const statusOptions = ['pending', 'reviewed', 'shortlisted', 'interview', 'rejected'];

  const handleDownloadResume = async () => {
  if (!application.resume) {
    toast.error('Resume not available');
    return;
  }

  try {
    setDownloading(true);

    // Extract resume ID safely
    const resumeId =
      typeof application.resume === 'object'
        ? application.resume._id
        : application.resume;

    if (!resumeId) {
      toast.error('Invalid resume ID');
      return;
    }

    // Download request
    const response = await resumeAPI.download(resumeId);

    if (!response.data) {
      throw new Error('No data received');
    }

    // Get content type dynamically
    const contentType =
      response.headers['content-type'] || 'application/pdf';

    const blob = new Blob([response.data], {
      type: contentType,
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;

    // Optional: preserve original filename
    const filename =
      `${application.candidate?.name?.replace(/\s+/g, '_') || 'resume'}.pdf`;

    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

    toast.success('Resume downloaded successfully');
  } catch (error) {
    console.error('Download error:', error);

    if (error.response?.status === 404) {
      toast.error('Resume file not found');
    } else if (error.response?.status === 403) {
      toast.error('Not authorized to download this resume');
    } else {
      toast.error('Failed to download resume');
    }
  } finally {
    setDownloading(false);
  }
};

  return (
    <div className="bg-dark-hover p-4 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">
            {application.candidate?.name}
          </h3>
          <p className="text-sm text-gray-400">{application.candidate?.email}</p>
          <p className="text-xs text-gray-500 mt-1">
            Applied {new Date(application.appliedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-gray-400">Match Score</div>
            <div className={`text-3xl font-bold ${getScoreColor(application.matchScore)}`}>
              {application.matchScore}%
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={`${getStatusColor(application.status)} flex items-center gap-1 cursor-pointer`}
            >
              {application.status}
              <ChevronDown className="w-3 h-3" />
            </button>

            {showStatusMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-lg shadow-lg z-10">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      onStatusUpdate(application._id, status, notes);
                      setShowStatusMenu(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-dark-hover ${
                      status === application.status ? 'text-primary-400' : 'text-gray-300'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match Details Summary */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="bg-dark-bg p-2 rounded">
          <p className="text-xs text-gray-400">Matched Skills</p>
          <p className="text-sm font-medium text-green-400">
            {application.matchDetails?.matchedSkills?.length || 0}
          </p>
        </div>
        <div className="bg-dark-bg p-2 rounded">
          <p className="text-xs text-gray-400">Missing Skills</p>
          <p className="text-sm font-medium text-orange-400">
            {application.matchDetails?.missingSkills?.length || 0}
          </p>
        </div>
        <div className="bg-dark-bg p-2 rounded">
          <p className="text-xs text-gray-400">Similarity</p>
          <p className="text-sm font-medium text-blue-400">
            {application.matchDetails?.similarityScore}%
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="btn-ghost text-sm"
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>
        
        <button
          onClick={handleDownloadResume}
          disabled={downloading}
          className="btn-ghost text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? 'Downloading...' : 'Download Resume'}
        </button>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-dark-border space-y-4">
          {/* Matched Skills */}
          {application.matchDetails?.matchedSkills?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">✓ Matched Skills</h4>
              <div className="flex flex-wrap gap-2">
                {application.matchDetails.matchedSkills.map((skill, idx) => (
                  <span key={idx} className="badge-success">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {application.matchDetails?.missingSkills?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">⚠ Missing Skills</h4>
              <div className="flex flex-wrap gap-2">
                {application.matchDetails.missingSkills.map((skill, idx) => (
                  <span key={idx} className="badge-warning">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Recruiter Notes</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input"
              rows="3"
              placeholder="Add notes about this candidate..."
            />
            <button
              onClick={() => onStatusUpdate(application._id, application.status, notes)}
              className="btn-primary mt-2 text-sm"
            >
              Save Notes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;