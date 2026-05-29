import { Outlet, NavLink } from 'react-router-dom';
import { Briefcase, Plus, Users, BarChart3, Settings } from 'lucide-react';

const RecruiterLayout = () => {
  const navigation = [
    { name: 'Dashboard', to: '/recruiter/dashboard', icon: BarChart3 },
    { name: 'My Jobs', to: '/recruiter/jobs', icon: Briefcase },
    { name: 'Post Job', to: '/recruiter/post-job', icon: Plus },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1 sticky top-24">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-400 hover:bg-dark-hover hover:text-gray-200'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default RecruiterLayout;