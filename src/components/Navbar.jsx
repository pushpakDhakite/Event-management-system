import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services';
import ThemeToggle from './ThemeToggle';
import GlobalSearch from './GlobalSearch';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      notificationService.getByUser(user.id, { limit: 1 }).then(res => {
        setUnreadCount(res.data.unread_count || 0);
      }).catch(() => {});
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    ...(isAuthenticated ? [
      user?.role === 'admin' ? { path: '/admin', label: 'Admin' } : null,
      user?.role === 'organizer' ? { path: '/dashboard/organization', label: 'Dashboard' } : null,
      user?.role === 'user' ? { path: '/dashboard/personal', label: 'Dashboard' } : null,
      user?.role === 'vendor' ? { path: '/dashboard/vendor', label: 'Dashboard' } : null,
      { path: '/events', label: 'Events' },
      { path: '/vendors', label: 'Vendors' },
      { path: '/ai-planner', label: 'AI Planner' }
    ].filter(Boolean) : [])
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg"></div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">EventHub</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <GlobalSearch />
            <ThemeToggle />
            {isAuthenticated && (
              <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">Hi, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Login</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90 transition-opacity">Sign Up</Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-md text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md">Logout</button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900">Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-purple-600 hover:text-purple-700">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;