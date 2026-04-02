import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventService, bookingService } from '../services';
import DashboardSidebar from '../components/DashboardSidebar';

const VendorDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await bookingService.getAll({});
      const bookingsData = res.data.data || [];
      setBookings(bookingsData);
      setStats({
        total: bookingsData.length,
        pending: bookingsData.filter(b => b.status === 'pending').length,
        confirmed: bookingsData.filter(b => b.status === 'confirmed').length,
        completed: bookingsData.filter(b => b.status === 'completed').length,
        revenue: bookingsData.filter(b => b.status === 'completed').reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0)
      });
    } catch (err) {
      console.error('Failed to fetch vendor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await bookingService.updateStatus(id, status);
      fetchData();
    } catch (err) {
      console.error('Failed to update booking status:', err);
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
              <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-gray-600">Manage your services and bookings</p>
            </div>
            <Link to="/vendors/services" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90">
              Manage Services
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[
              { label: 'Total Bookings', value: stats.total, icon: '📋', color: 'from-blue-500 to-blue-600' },
              { label: 'Pending', value: stats.pending, icon: '⏳', color: 'from-yellow-500 to-orange-500' },
              { label: 'Confirmed', value: stats.confirmed, icon: '✅', color: 'from-green-500 to-green-600' },
              { label: 'Completed', value: stats.completed, icon: '🎉', color: 'from-purple-500 to-purple-600' },
              { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: '💰', color: 'from-pink-500 to-red-500' }
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            </div>
            {bookings.length === 0 ? (
              <div className="p-12 text-center"><p className="text-gray-500">No bookings yet</p></div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.slice(0, 10).map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{booking.event_name || 'Event'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{booking.service_name || 'Service'}</td>
                      <td className="px-4 py-3 font-medium text-purple-600">${parseFloat(booking.total_price || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{booking.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-1">
                          {booking.status === 'pending' && (
                            <>
                              <button onClick={() => updateStatus(booking.id, 'confirmed')} className="px-2 py-1 text-xs text-green-600 bg-green-50 rounded hover:bg-green-100">Confirm</button>
                              <button onClick={() => updateStatus(booking.id, 'cancelled')} className="px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100">Decline</button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button onClick={() => updateStatus(booking.id, 'completed')} className="px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100">Complete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;