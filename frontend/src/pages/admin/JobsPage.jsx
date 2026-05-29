import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import { Briefcase, MapPin, Users, Eye, Trash2, CheckCircle, XCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getAll({});
      setJobs(response.data.data);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await jobAPI.update(jobId, { status: newStatus });
      setJobs(jobs.map(j => j._id === jobId ? { ...j, status: newStatus } : j));
      toast.success('Job status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      await jobAPI.delete(jobId);
      setJobs(jobs.filter(j => j._id !== jobId));
      toast.success('Job deleted successfully');
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filter === 'all' || job.status === filter;
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    draft: jobs.filter(j => j.status === 'draft').length,
    closed: jobs.filter(j => j.status === 'closed').length,
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'badge-success',
      draft: 'badge-warning',
      closed: 'badge-error',
    };
    return colors[status] || 'badge';
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Job Moderation</h1>
        <p className="text-gray-400 mt-1">Manage and moderate all job postings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="card">
          <p className="text-gray-400 text-sm">Total Jobs</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Active</p>
          <p className="text-3xl font-bold text-green-400 mt-1">{stats.active}</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Draft</p>
          <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.draft}</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Closed</p>
          <p className="text-3xl font-bold text-red-400 mt-1">{stats.closed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input flex-1"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input w-48"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="card text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No jobs found</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job._id} className="card hover:border-primary-500/20 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                    <span className={getStatusColor(job.status)}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-gray-400 mt-1">{job.company}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Posted by: {job.postedBy?.name || 'Unknown'}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {job.status === 'active' ? (
                    <button
                      onClick={() => handleStatusChange(job._id, 'closed')}
                      className="btn-ghost text-red-400 hover:bg-red-500/10"
                      title="Close Job"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(job._id, 'active')}
                      className="btn-ghost text-green-400 hover:bg-green-500/10"
                      title="Activate Job"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(job._id)}
                    className="btn-ghost text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
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
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {job.applicants?.length || 0} applicants
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {job.description}
              </p>

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.slice(0, 8).map((skill, index) => (
                    <span key={index} className="badge-primary text-xs">
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 8 && (
                    <span className="badge text-xs">
                      +{job.skills.length - 8} more
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-dark-border">
                <div className="text-sm text-gray-500">
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </div>

                <Link
                  to={`/recruiter/jobs/${job._id}`}
                  className="btn-ghost flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JobsPage;