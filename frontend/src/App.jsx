import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layouts
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import CandidateLayout from './layouts/CandidateLayout';
import RecruiterLayout from './layouts/RecruiterLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Candidate Pages
import CandidateDashboard from './pages/candidate/Dashboard';
import JobsPage from './pages/candidate/JobsPage';
import ApplicationsPage from './pages/candidate/ApplicationsPage';
import ResumePage from './pages/candidate/ResumePage';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import MyJobs from './pages/recruiter/MyJobs';
import PostJob from './pages/recruiter/PostJob';
import JobDetails from './pages/recruiter/JobDetails';
import EditJob from './pages/recruiter/EditJob';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/UsersPage';
import AdminJobs from './pages/admin/JobsPage';
import AdminAnalytics from './pages/admin/AnalyticsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-dark-bg">
          <Navbar />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Candidate Routes */}
            <Route
              path="/candidate/*"
              element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <CandidateLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<CandidateDashboard />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="resume" element={<ResumePage />} />
            </Route>

            {/* Recruiter Routes */}
            <Route
              path="/recruiter/*"
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <RecruiterLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<RecruiterDashboard />} />
              <Route path="jobs" element={<MyJobs />} />
              <Route path="post-job" element={<PostJob />} />
              <Route path="jobs/:id" element={<JobDetails />} />
              <Route path="jobs/:id/edit" element={<EditJob />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="jobs" element={<AdminJobs />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>

            {/* 404 - Redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#131313',
                color: '#fff',
                border: '1px solid #262626',
              },
              success: {
                iconTheme: {
                  primary: '#0ea5e9',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;