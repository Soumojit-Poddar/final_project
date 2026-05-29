import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, BarChart3, Shield } from 'lucide-react';

const AdminLayout = () => {
  const navigation = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', to: '/admin/users', icon: Users },
    { name: 'Jobs', to: '/admin/jobs', icon: Briefcase },
    { name: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="mb-6 p-4 bg-primary-500/10 rounded-lg border border-primary-500/20">
              <div className="flex items-center space-x-2 text-primary-400">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Admin Panel</span>
              </div>
            </div>

            <nav className="space-y-1">
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

export default AdminLayout;