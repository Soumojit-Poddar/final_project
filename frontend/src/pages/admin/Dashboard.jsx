import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import { Users, Briefcase, TrendingUp, Activity, ArrowUp, ArrowDown, BarChart3 } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    candidates: 0,
    recruiters: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log('📊 Fetching admin dashboard data...');
      
      // ✅ FIX: Fetch all jobs without status filter
      const jobsRes = await jobAPI.getAll();
      console.log('✅ Jobs response:', jobsRes.data);
      
      const jobs = jobsRes.data.data || [];
      console.log('📋 Total jobs fetched:', jobs.length);
      
      const totalJobs = jobs.length;
      const activeJobs = jobs.filter(j => j.status === 'active').length;
      
      // Calculate total applications
      let totalApps = 0;
      jobs.forEach(job => {
        const appCount = job.applicants?.length || 0;
        totalApps += appCount;
        console.log(`Job: ${job.title}, Applicants: ${appCount}`);
      });

      console.log('📊 Total Applications:', totalApps);

      // ✅ FIX: Fetch user statistics
      let totalUsers = 0;
      let candidates = 0;
      let recruiters = 0;
      let admins = 0;

      try {
        const usersRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/users`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (usersRes.data.success) {
          const users = usersRes.data.data || [];
          totalUsers = users.length;
          candidates = users.filter(u => u.role === 'candidate').length;
          recruiters = users.filter(u => u.role === 'recruiter').length;
          admins = users.filter(u => u.role === 'admin').length;
          
          console.log('👥 Users:', { totalUsers, candidates, recruiters, admins });
        }
      } catch (userError) {
        console.error('❌ Error fetching users:', userError.message);
        // Continue without user data
      }

      setStats({
        totalUsers,
        candidates,
        recruiters,
        admins,
        totalJobs,
        activeJobs,
        totalApplications: totalApps,
      });
      
    } catch (error) {
      console.error('❌ Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data: ' + error.message);
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
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <Users className="w-6 h-6 text-primary-400" />
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <span>Candidates: <span className="text-green-400 font-semibold ml-1">{stats.candidates}</span></span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Total Jobs</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalJobs}</p>
            </div>
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <Briefcase className="w-6 h-6 text-primary-400" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-400 flex items-center">
              <ArrowUp className="w-4 h-4 mr-1" />
              {stats.activeJobs} active
            </span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Total Applications</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalApplications}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            Across all jobs
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">System Health</p>
              <p className="text-xl font-bold text-green-400 mt-1">Operational</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            All services running
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Jobs Overview */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Jobs Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
              <span className="text-gray-300">Active Jobs</span>
              <span className="text-green-400 font-semibold">{stats.activeJobs}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
              <span className="text-gray-300">Total Jobs</span>
              <span className="text-primary-400 font-semibold">{stats.totalJobs}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
              <span className="text-gray-300">Total Applications</span>
              <span className="text-blue-400 font-semibold">{stats.totalApplications}</span>
            </div>
          </div>
          <Link to="/admin/jobs" className="btn-primary w-full mt-4">
            Manage Jobs
          </Link>
        </div>

        {/* Users Overview */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Users Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
              <span className="text-gray-300">Total Users</span>
              <span className="text-primary-400 font-semibold">{stats.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
              <span className="text-gray-300">Candidates</span>
              <span className="text-green-400 font-semibold">{stats.candidates}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
              <span className="text-gray-300">Recruiters</span>
              <span className="text-blue-400 font-semibold">{stats.recruiters}</span>
            </div>
          </div>
          <Link to="/admin/users" className="btn-primary w-full mt-4">
            Manage Users
          </Link>
        </div>
      </div>

      {/* System Status */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
            <span className="text-gray-300">Backend API</span>
            <span className="badge-success">Online</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
            <span className="text-gray-300">ML Service</span>
            <span className="badge-success">Online</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
            <span className="text-gray-300">Database</span>
            <span className="badge-success">Connected</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/admin/users" className="card hover:border-primary-500/40 transition-all cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-primary-500/10 rounded-lg">
              <Users className="w-8 h-8 text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Manage Users</h3>
              <p className="text-sm text-gray-400">View all {stats.totalUsers} users</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/jobs" className="card hover:border-primary-500/40 transition-all cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-green-500/10 rounded-lg">
              <Briefcase className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Manage Jobs</h3>
              <p className="text-sm text-gray-400">Moderate {stats.totalJobs} jobs</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/analytics" className="card hover:border-primary-500/40 transition-all cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-blue-500/10 rounded-lg">
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Analytics</h3>
              <p className="text-sm text-gray-400">View detailed stats</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;