import { useState, useEffect } from 'react';
import { jobAPI, applicationAPI } from '../../services/api';
import { 
  TrendingUp, Users, Briefcase, Target, 
  Calendar, Award, Activity 
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState({
    totalJobs: 0,
    totalApplications: 0,
    avgMatchScore: 0,
    topSkills: [],
    applicationsByStatus: {},
    recentTrends: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all jobs
      const jobsRes = await jobAPI.getAll({});
      const jobs = jobsRes.data.data;

      // Calculate stats
      const totalJobs = jobs.length;
      let totalApps = 0;
      let totalScore = 0;
      let scoreCount = 0;
      const skillMap = {};
      const statusMap = {
        pending: 0,
        reviewed: 0,
        shortlisted: 0,
        interview: 0,
        rejected: 0,
      };

      // Process each job
      for (const job of jobs) {
        totalApps += job.applicants?.length || 0;

        // Count skills
        job.skills?.forEach(skill => {
          skillMap[skill] = (skillMap[skill] || 0) + 1;
        });

        // Fetch applications for scoring
        if (job.applicants && job.applicants.length > 0) {
          try {
            const appsRes = await applicationAPI.getJobApplications(job._id, {});
            const apps = appsRes.data.data;

            apps.forEach(app => {
              if (app.matchScore) {
                totalScore += app.matchScore;
                scoreCount++;
              }
              statusMap[app.status] = (statusMap[app.status] || 0) + 1;
            });
          } catch (err) {
            console.error('Error fetching apps:', err);
          }
        }
      }

      // Get top 10 skills
      const topSkills = Object.entries(skillMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([skill, count]) => ({ skill, count }));

      const avgScore = scoreCount > 0 ? totalScore / scoreCount : 0;

      setAnalytics({
        totalJobs,
        totalApplications: totalApps,
        avgMatchScore: avgScore.toFixed(1),
        topSkills,
        applicationsByStatus: statusMap,
        recentTrends: jobs.slice(0, 5),
      });

    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const statusColors = {
    pending: 'text-yellow-400',
    reviewed: 'text-blue-400',
    shortlisted: 'text-green-400',
    interview: 'text-purple-400',
    rejected: 'text-red-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">Platform insights and statistics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Jobs</p>
              <p className="text-4xl font-bold text-white mt-2">{analytics.totalJobs}</p>
            </div>
            <div className="p-4 bg-primary-500/10 rounded-lg">
              <Briefcase className="w-8 h-8 text-primary-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Applications</p>
              <p className="text-4xl font-bold text-white mt-2">{analytics.totalApplications}</p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Match Score</p>
              <p className="text-4xl font-bold text-white mt-2">{analytics.avgMatchScore}%</p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg">
              <Target className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Applications by Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-6">Applications by Status</h3>
          <div className="space-y-4">
            {Object.entries(analytics.applicationsByStatus).map(([status, count]) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 capitalize">{status}</span>
                  <span className={`font-semibold ${statusColors[status]}`}>{count}</span>
                </div>
                <div className="w-full bg-dark-bg rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      status === 'pending' ? 'bg-yellow-400' :
                      status === 'reviewed' ? 'bg-blue-400' :
                      status === 'shortlisted' ? 'bg-green-400' :
                      status === 'interview' ? 'bg-purple-400' :
                      'bg-red-400'
                    }`}
                    style={{
                      width: `${(count / analytics.totalApplications) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Skills in Demand */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-6">Top Skills in Demand</h3>
          <div className="space-y-3">
            {analytics.topSkills.map((item, index) => (
              <div key={item.skill} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary-400 font-semibold text-sm">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 capitalize">{item.skill}</span>
                    <span className="text-primary-400 font-semibold">{item.count} jobs</span>
                  </div>
                  <div className="w-full bg-dark-bg rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-primary-500"
                      style={{
                        width: `${(item.count / analytics.topSkills[0].count) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-6">Platform Performance</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-dark-hover rounded-lg">
            <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{analytics.totalJobs}</p>
            <p className="text-sm text-gray-400 mt-1">Active Listings</p>
          </div>

          <div className="text-center p-4 bg-dark-hover rounded-lg">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{analytics.totalApplications}</p>
            <p className="text-sm text-gray-400 mt-1">Total Applications</p>
          </div>

          <div className="text-center p-4 bg-dark-hover rounded-lg">
            <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {analytics.applicationsByStatus.shortlisted || 0}
            </p>
            <p className="text-sm text-gray-400 mt-1">Shortlisted</p>
          </div>

          <div className="text-center p-4 bg-dark-hover rounded-lg">
            <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{analytics.avgMatchScore}%</p>
            <p className="text-sm text-gray-400 mt-1">Avg Match Quality</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-6">Recent Job Postings</h3>
        <div className="space-y-3">
          {analytics.recentTrends.map((job) => (
            <div key={job._id} className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-white">{job.title}</h4>
                <p className="text-sm text-gray-400">{job.company}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary-400">
                  {job.applicants?.length || 0} applicants
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;