import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardSidebar = ({ items }) => {
  const location = useLocation();
  const { user } = useAuth();

  const defaultItems = {
    admin: [
      { path: '/admin', label: 'Overview', icon: '📊' },
      { path: '/admin/users', label: 'Users', icon: '👥' },
      { path: '/admin/vendors', label: 'Vendors', icon: '🏪' },
      { path: '/admin/analytics', label: 'Analytics', icon: '📈' }
    ],
    organizer: [
      { path: '/dashboard/organization', label: 'Overview', icon: '📊' },
      { path: '/events/create', label: 'Create Event', icon: '➕' },
      { path: '/events', label: 'My Events', icon: '📅' },
      { path: '/calendar', label: 'Calendar', icon: '📆' },
      { path: '/guests', label: 'Guests', icon: '👥' },
      { path: '/bookings', label: 'Bookings', icon: '📋' },
      { path: '/hotels-restaurants', label: 'Hotels & Dining', icon: '🏨' },
      { path: '/messages', label: 'Messages', icon: '💬' },
      { path: '/notifications', label: 'Notifications', icon: '🔔' },
      { path: '/reports', label: 'Reports', icon: '📈' },
      { path: '/templates', label: 'Templates', icon: '📄' }
    ],
    user: [
      { path: '/dashboard/personal', label: 'Overview', icon: '📊' },
      { path: '/events/create', label: 'Create Event', icon: '➕' },
      { path: '/events', label: 'My Events', icon: '📅' },
      { path: '/calendar', label: 'Calendar', icon: '📆' },
      { path: '/vendors', label: 'Vendors', icon: '🏪' },
      { path: '/hotels-restaurants', label: 'Hotels & Dining', icon: '🏨' },
      { path: '/ai-planner', label: 'AI Planner', icon: '🤖' },
      { path: '/payments', label: 'Payments', icon: '💳' },
      { path: '/wishlist', label: 'Wishlist', icon: '🎁' },
      { path: '/notifications', label: 'Notifications', icon: '🔔' },
      { path: '/reports', label: 'Reports', icon: '📈' },
      { path: '/templates', label: 'Templates', icon: '📄' }
    ],
    vendor: [
      { path: '/dashboard/vendor', label: 'Overview', icon: '📊' },
      { path: '/vendors/services', label: 'My Services', icon: '📋' },
      { path: '/bookings', label: 'Bookings', icon: '📅' },
      { path: '/reviews', label: 'Reviews', icon: '⭐' },
      { path: '/promo-codes', label: 'Promo Codes', icon: '🏷️' },
      { path: '/messages', label: 'Messages', icon: '💬' },
      { path: '/notifications', label: 'Notifications', icon: '🔔' }
    ]
  };

  const sidebarItems = items || defaultItems[user?.role] || [];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === item.path
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default DashboardSidebar;