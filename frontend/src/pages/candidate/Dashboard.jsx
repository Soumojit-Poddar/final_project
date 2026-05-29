import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resumeAPI, applicationAPI } from '../../services/api';
import { FileText, Briefcase, CheckCircle, Clock, Upload } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [resume, setResume] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    avgScore: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch resume
      try {
        const resumeRes = await resumeAPI.getMy();
        setResume(resumeRes.data.data);
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error('Error fetching resume:', err);
        }
      }

      // Fetch applications
      try {
        const appsRes = await applicationAPI.getMyApplications();
        const apps = appsRes.data.data;
        setApplications(apps.slice(0, 5)); // Recent 5

        // Calculate stats
        const total = apps.length;
        const pending = apps.filter(a => a.status === 'pending').length;
        const shortlisted = apps.filter(a => a.status === 'shortlisted').length;
        const avgScore = total > 0
          ? apps.reduce((sum, a) => sum + (a.matchScore || 0), 0) / total
          : 0;

        setStats({ total, pending, shortlisted, avgScore: avgScore.toFixed(1) });
      } catch (err) {
        console.error('Error fetching applications:', err);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back! Here's your overview</p>
      </div>

      {/* Resume Upload CTA (if no resume) */}
      {!resume && (
        <div className="card bg-primary-500/10 border-primary-500/20">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-primary-500/20 rounded-lg">
                <Upload className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Upload Your Resume
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  Get started by uploading your resume to unlock AI-powered job matching
                </p>
                <Link to="/candidate/resume" className="btn-primary inline-flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resume
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Applications</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <Briefcase className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Review</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Shortlisted</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.shortlisted}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Match Score</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.avgScore}%</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Applications</h2>
          <Link to="/candidate/applications" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
            View all
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No applications yet</p>
            <Link to="/candidate/jobs" className="btn-primary inline-flex items-center">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="flex items-center justify-between p-4 bg-dark-hover rounded-lg hover:bg-dark-border transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{app.job?.title}</h3>
                  <p className="text-sm text-gray-400">{app.job?.company}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Match Score</div>
                    <div className="text-2xl font-bold text-primary-400">
                      {app.matchScore}%
                    </div>
                  </div>

                  <span
                    className={`badge ${
                      app.status === 'shortlisted'
                        ? 'badge-success'
                        : app.status === 'rejected'
                        ? 'badge-error'
                        : app.status === 'interview'
                        ? 'badge-info'
                        : 'badge-warning'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link to="/candidate/jobs" className="card-hover">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-primary-500/10 rounded-lg">
              <Briefcase className="w-8 h-8 text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Browse Jobs</h3>
              <p className="text-sm text-gray-400">Find your next opportunity</p>
            </div>
          </div>
        </Link>

        <Link to="/candidate/resume" className="card-hover">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-green-500/10 rounded-lg">
              <FileText className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Update Resume</h3>
              <p className="text-sm text-gray-400">Keep your profile current</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;