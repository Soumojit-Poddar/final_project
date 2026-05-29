import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI, resumeAPI, applicationAPI } from '../../services/api';
import { Briefcase, MapPin, Clock, DollarSign, Search, Filter } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasResume, setHasResume] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [filters, setFilters] = useState({
    search: '',
    jobType: '',
    location: '',
  });
  const [applying, setApplying] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    checkResume();
    fetchJobs();
    fetchApplications();
  }, []);

  const checkResume = async () => {
    try {
      await resumeAPI.getMy();
      setHasResume(true);
    } catch (error) {
      setHasResume(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await applicationAPI.getMyApplications();
      const jobIds = new Set(response.data.data.map(app => app.job._id));
      setAppliedJobs(jobIds);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getAll({
        status: 'active',
        ...filters,
      });
      setJobs(response.data.data);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!hasResume) {
      toast.error('Please upload your resume first');
      navigate('/candidate/resume');
      return;
    }

    try {
      setApplying(jobId);
      const response = await applicationAPI.apply(jobId);
      
      setAppliedJobs(prev => new Set([...prev, jobId]));
      
      toast.success(
        <div>
          <p className="font-medium">Application submitted!</p>
          <p className="text-sm">Match Score: {response.data.data.matchScore}%</p>
        </div>
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(null);
    }
  };

  const handleSearch = () => {
    fetchJobs();
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Browse Jobs</h1>
        <p className="text-gray-400 mt-1">Find your next opportunity</p>
      </div>

      {/* Resume Warning */}
      {!hasResume && (
        <div className="card bg-yellow-500/10 border-yellow-500/20">
          <p className="text-yellow-400 text-sm">
            ⚠️ Upload your resume to apply for jobs and get match scores
          </p>
        </div>
      )}

      {/* Search & Filters */}
      <div className="card">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input pl-10"
              />
            </div>
          </div>

          <select
            value={filters.jobType}
            onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
            className="input"
          >
            <option value="">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>

          <button onClick={handleSearch} className="btn-primary">
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      {jobs.length === 0 ? (
        <div className="card text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No jobs found</h3>
          <p className="text-gray-400">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id} className="card-hover">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-white hover:text-primary-400 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-gray-400">{job.company}</p>
                    </div>
                    <span className="badge-info capitalize">{job.jobType}</span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                    {job.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </div>
                    )}
                    {job.experience && (
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {job.experience.min}-{job.experience.max} years
                      </div>
                    )}
                    {job.salary && (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {job.salary.min}-{job.salary.max} {job.salary.currency}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Skills */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.slice(0, 5).map((skill, index) => (
                        <span key={index} className="badge-primary text-xs">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="badge text-xs">
                          +{job.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    {appliedJobs.has(job._id) ? (
                      <button disabled className="btn-secondary opacity-50 cursor-not-allowed">
                        Already Applied
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApply(job._id)}
                        disabled={applying === job._id}
                        className="btn-primary"
                      >
                        {applying === job._id ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span className="ml-2">Applying...</span>
                          </>
                        ) : (
                          'Apply Now'
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/candidate/jobs/${job._id}`)}
                      className="btn-ghost"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsPage;