import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import { Briefcase, MapPin, Users, Eye, Edit, Trash2, Plus } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getMyJobs();
      setJobs(response.data.data);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
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
    if (filter === 'all') return true;
    return job.status === filter;
  });

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Jobs</h1>
          <p className="text-gray-400 mt-1">Manage all your job postings ({jobs.length} total)</p>
        </div>
        <Link to="/recruiter/post-job" className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Post New Job
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto">
        {['all', 'active', 'draft', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-dark-card text-gray-400 hover:bg-dark-hover'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'all' && ` (${jobs.length})`}
            {status !== 'all' && ` (${jobs.filter(j => j.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="card text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No jobs found
          </h3>
          <p className="text-gray-400 mb-4">
            {filter === 'all' 
              ? "You haven't posted any jobs yet"
              : `No ${filter} jobs`}
          </p>
          <Link to="/recruiter/post-job" className="btn-primary inline-flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Post Your First Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div key={job._id} className="card hover:border-primary-500/20 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                    <span
                      className={`badge ${
                        job.status === 'active'
                          ? 'badge-success'
                          : job.status === 'closed'
                          ? 'badge-error'
                          : 'badge-warning'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <p className="text-gray-400 mt-1">{job.company}</p>
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

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-dark-border">
                <div className="text-sm text-gray-500">
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/recruiter/jobs/${job._id}`}
                    className="btn-ghost flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Link>

                  <Link
                    to={`/recruiter/jobs/${job._id}/edit`}
                    className="btn-ghost flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(job._id)}
                    className="btn-ghost text-red-400 hover:bg-red-500/10 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyJobs;