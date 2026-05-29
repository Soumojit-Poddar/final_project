import { useState, useEffect } from 'react';
import { applicationAPI } from '../../services/api';
import { Briefcase, TrendingUp, Calendar, X } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationAPI.getMyApplications();
      setApplications(response.data.data);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      await applicationAPI.withdraw(appId);
      setApplications(apps => apps.filter(app => app._id !== appId));
      setSelectedApp(null);
      toast.success('Application withdrawn');
    } catch (error) {
      toast.error('Failed to withdraw application');
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

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

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 45) return 'text-yellow-400';
    return 'text-orange-400';
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Applications</h1>
          <p className="text-gray-400 mt-1">
            Track all your job applications ({applications.length} total)
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto">
        {['all', 'pending', 'reviewed', 'shortlisted', 'interview', 'rejected'].map((status) => (
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
            {status === 'all' && ` (${applications.length})`}
            {status !== 'all' && ` (${applications.filter(a => a.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="card text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No applications found
          </h3>
          <p className="text-gray-400">
            {filter === 'all'
              ? "You haven't applied to any jobs yet"
              : `No ${filter} applications`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredApplications.map((app) => (
            <div key={app._id} className="card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {app.job?.title}
                  </h3>
                  <p className="text-gray-400">{app.job?.company}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                    {app.job?.location && (
                      <span>{app.job.location}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Match Score</div>
                    <div className={`text-3xl font-bold ${getScoreColor(app.matchScore)}`}>
                      {app.matchScore}%
                    </div>
                  </div>
                  <span className={getStatusColor(app.status)}>
                    {app.status}
                  </span>
                </div>
              </div>

              {/* Match Details */}
              {app.matchDetails && (
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-dark-hover p-3 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Matched Skills</p>
                    <p className="text-sm font-medium text-green-400">
                      {app.matchDetails.matchedSkills?.length || 0} skills
                    </p>
                  </div>
                  <div className="bg-dark-hover p-3 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Missing Skills</p>
                    <p className="text-sm font-medium text-orange-400">
                      {app.matchDetails.missingSkills?.length || 0} skills
                    </p>
                  </div>
                  <div className="bg-dark-hover p-3 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Similarity</p>
                    <p className="text-sm font-medium text-blue-400">
                      {app.matchDetails.similarityScore}%
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedApp(selectedApp?._id === app._id ? null : app)}
                  className="btn-ghost text-sm"
                >
                  {selectedApp?._id === app._id ? 'Hide Details' : 'View Details'}
                </button>

                {app.status === 'pending' && (
                  <button
                    onClick={() => handleWithdraw(app._id)}
                    className="btn-ghost text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Withdraw
                  </button>
                )}
              </div>

              {/* Expanded Details */}
              {selectedApp?._id === app._id && (
                <div className="mt-4 pt-4 border-t border-dark-border space-y-4">
                  {/* Matched Skills */}
                  {app.matchDetails?.matchedSkills?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        ✓ Matched Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {app.matchDetails.matchedSkills.map((skill, idx) => (
                          <span key={idx} className="badge-success">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {app.matchDetails?.missingSkills?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        ⚠️ Skills to Develop
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {app.matchDetails.missingSkills.map((skill, idx) => (
                          <span key={idx} className="badge-warning">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recruiter Notes */}
                  {app.recruiterNotes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        Recruiter Notes
                      </h4>
                      <p className="text-sm text-gray-300 bg-dark-hover p-3 rounded-lg">
                        {app.recruiterNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;