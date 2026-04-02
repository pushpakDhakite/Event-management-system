import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services';
import DashboardSidebar from '../components/DashboardSidebar';
import EventCard from '../components/EventCard';

const PersonalDashboard = () => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, totalGuests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes] = await Promise.all([eventService.getMy()]);
      const eventsData = eventsRes.data.data || [];
      setEvents(eventsData);
      setStats({
        total: eventsData.length,
        upcoming: eventsData.filter(e => e.status === 'planned' || e.status === 'ongoing').length,
        completed: eventsData.filter(e => e.status === 'completed').length,
        totalGuests: eventsData.reduce((sum, e) => sum + (e.guest_count || 0), 0)
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600">Plan and manage your personal events</p>
            </div>
            <div className="flex space-x-3">
              <Link to="/ai-planner" className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100">
                🤖 AI Planner
              </Link>
              <Link to="/events/create" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90">
                + Create Event
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'My Events', value: stats.total, icon: '🎉', color: 'from-purple-500 to-pink-500' },
              { label: 'Upcoming', value: stats.upcoming, icon: '📅', color: 'from-blue-500 to-cyan-500' },
              { label: 'Completed', value: stats.completed, icon: '🎊', color: 'from-green-500 to-emerald-500' },
              { label: 'Total Guests', value: stats.totalGuests, icon: '👥', color: 'from-orange-500 to-red-500' }
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">My Events</h2>
              {events.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <p className="text-gray-500 mb-4">No events yet. Start planning your next celebration!</p>
                  <div className="flex justify-center space-x-3">
                    <Link to="/events/create" className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90">Create Event</Link>
                    <Link to="/ai-planner" className="px-6 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100">Use AI Planner</Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.slice(0, 6).map((event) => <EventCard key={event.id} event={event} />)}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {[
                  { label: 'Browse Vendors', path: '/vendors', icon: '🏪', desc: 'Find services for your event' },
                  { label: 'Hotels & Restaurants', path: '/hotels-restaurants', icon: '🏨', desc: 'Book accommodation & dining' },
                  { label: 'AI Event Planner', path: '/ai-planner', icon: '🤖', desc: 'Get intelligent suggestions' },
                  { label: 'Event Calendar', path: '/calendar', icon: '📆', desc: 'View your event schedule' },
                  { label: 'View Payments', path: '/payments', icon: '💳', desc: 'Track your spending' },
                  { label: 'Event Templates', path: '/templates', icon: '📄', desc: 'Start with a template' },
                  { label: 'Wishlist', path: '/wishlist', icon: '🎁', desc: 'Manage gift preferences' },
                  { label: 'Messages', path: '/messages', icon: '💬', desc: 'Chat with vendors' }
                ].map((action) => (
                  <Link key={action.path} to={action.path} className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{action.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{action.label}</p>
                        <p className="text-sm text-gray-500">{action.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PersonalDashboard;