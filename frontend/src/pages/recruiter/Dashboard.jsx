import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../../services/api';
import { Briefcase, Users, TrendingUp, Clock, Eye, Plus } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    avgMatchScore: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch recruiter's jobs
      const jobsRes = await jobAPI.getMyJobs();
      const jobs = jobsRes.data.data;
      
      setRecentJobs(jobs.slice(0, 5)); // Recent 5 jobs
      
      const totalJobs = jobs.length;
      const activeJobs = jobs.filter(j => j.status === 'active').length;
      
      // Calculate total applications and avg score
      let totalApps = 0;
      let totalScore = 0;
      let scoreCount = 0;
      
      jobs.forEach(job => {
        const appCount = job.applicants?.length || 0;
        totalApps += appCount;
      });
      
      // Get avg match score from all applications
      for (const job of jobs) {
        if (job.applicants && job.applicants.length > 0) {
          for (const appId of job.applicants) {
            try {
              const appRes = await applicationAPI.getById(appId);
              if (appRes.data.data.matchScore) {
                totalScore += appRes.data.data.matchScore;
                scoreCount++;
              }
            } catch (err) {
              console.error('Error fetching application:', err);
            }
          }
        }
      }
      
      const avgScore = scoreCount > 0 ? totalScore / scoreCount : 0;
      
      setStats({
        totalJobs,
        activeJobs,
        totalApplications: totalApps,
        avgMatchScore: avgScore.toFixed(1),
      });
      
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
        <h1 className="text-3xl font-bold text-white">Recruiter Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview of your recruitment activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Jobs</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalJobs}</p>
            </div>
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <Briefcase className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Jobs</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.activeJobs}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Applications</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalApplications}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Match Score</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.avgMatchScore}%</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Job Postings</h2>
          <Link to="/recruiter/jobs" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
            View all
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No jobs posted yet</p>
            <Link to="/recruiter/post-job" className="btn-primary inline-flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div
                key={job._id}
                className="flex items-center justify-between p-4 bg-dark-hover rounded-lg hover:bg-dark-border transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{job.title}</h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                    <span>{job.location || 'Remote'}</span>
                    <span>•</span>
                    <span className="capitalize">{job.jobType}</span>
                    <span>•</span>
                    <span>{job.applicants?.length || 0} applicants</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
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

                  <Link
                    to={`/recruiter/jobs/${job._id}`}
                    className="btn-ghost flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link to="/recruiter/post-job" className="card-hover">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-primary-500/10 rounded-lg">
              <Plus className="w-8 h-8 text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Post New Job</h3>
              <p className="text-sm text-gray-400">Create a new job posting</p>
            </div>
          </div>
        </Link>

        <Link to="/recruiter/jobs" className="card-hover">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-green-500/10 rounded-lg">
              <Briefcase className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Manage Jobs</h3>
              <p className="text-sm text-gray-400">View and edit your postings</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;