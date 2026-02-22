import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from './BottomNav';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Chat', path: '/chat', icon: '💬' },
    { name: 'Orders', path: '/orders', icon: '📦' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  // Add admin link if user is admin
  const adminNavigation = user?.role === 'admin' ? [
    { name: 'Admin Panel', path: '/admin', icon: '👑' },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-50 p-4 ${location.pathname === '/chat' ? 'hidden' : ''}`}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600 hover:text-gray-900"
        >
          <span className="text-2xl">{sidebarOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-primary-600">4Pixels CRM</h1>
            <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
            
            {/* Admin Navigation */}
            {adminNavigation.length > 0 && (
              <>
                <div className="my-4 border-t border-gray-200"></div>
                {adminNavigation.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-purple-50'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </>
            )}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={logout}
              className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`lg:ml-64 ${location.pathname === '/chat' ? 'pt-0 pb-16' : 'pt-16 pb-20'} lg:pt-0 md:pb-0`}>
        <main className={`${location.pathname === '/chat' ? 'p-0 md:p-6' : 'p-6'}`}>
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomNav />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
