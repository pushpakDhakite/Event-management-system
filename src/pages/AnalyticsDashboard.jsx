import { useEffect, useState } from 'react';
import { eventService, bookingService, guestService, vendorService, paymentService } from '../services';
import DashboardSidebar from '../components/DashboardSidebar';

const AnalyticsDashboard = () => {
  const [data, setData] = useState({
    events: [], bookings: [], guests: [], vendors: [], payments: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => { fetchData(); }, [dateRange]);

  const fetchData = async () => {
    try {
      const [eventsRes, bookingsRes, guestsRes, vendorsRes, paymentsRes] = await Promise.all([
        eventService.getAll(),
        bookingService.getAll({}),
        guestService.getAllGuests(),
        vendorService.getAll(),
        paymentService.getAll?.() || Promise.resolve({ data: { data: [] } })
      ]);
      setData({
        events: eventsRes.data.data || [],
        bookings: bookingsRes.data.data || [],
        guests: guestsRes.data.data || [],
        vendors: vendorsRes.data.data || [],
        payments: paymentsRes.data.data || []
      });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const eventsByType = {};
  data.events.forEach(e => { eventsByType[e.event_type] = (eventsByType[e.event_type] || 0) + 1; });

  const eventsByStatus = {};
  data.events.forEach(e => { eventsByStatus[e.status] = (eventsByStatus[e.status] || 0) + 1; });

  const bookingsByStatus = {};
  data.bookings.forEach(b => { bookingsByStatus[b.status] = (bookingsByStatus[b.status] || 0) + 1; });

  const totalRevenue = data.bookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
  const avgBookingValue = data.bookings.length > 0 ? totalRevenue / data.bookings.length : 0;

  const topVendors = {};
  data.bookings.forEach(b => {
    if (b.vendor_name) topVendors[b.vendor_name] = (topVendors[b.vendor_name] || 0) + 1;
  });

  const guestRSVP = {};
  data.guests.forEach(g => { guestRSVP[g.rsvp_status] = (guestRSVP[g.rsvp_status] || 0) + 1; });

  const maxTypeCount = Math.max(...Object.values(eventsByType), 1);
  const maxStatusCount = Math.max(...Object.values(eventsByStatus), 1);
  const maxVendorCount = Math.max(...Object.values(topVendors), 1);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive insights into your event management platform</p>
            </div>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Events', value: data.events.length, icon: '📅', change: '+12%', color: 'from-blue-500 to-blue-600' },
              { label: 'Total Bookings', value: data.bookings.length, icon: '📋', change: '+8%', color: 'from-green-500 to-green-600' },
              { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: '💰', change: '+15%', color: 'from-purple-500 to-purple-600' },
              { label: 'Avg Booking', value: `$${avgBookingValue.toFixed(0)}`, icon: '📊', change: '+5%', color: 'from-orange-500 to-orange-600' }
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>{stat.icon}</div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Events by Type</h3>
              <div className="space-y-4">
                {Object.entries(eventsByType).map(([type, count]) => (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${(count / maxTypeCount) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
                {Object.keys(eventsByType).length === 0 && <p className="text-gray-500 text-sm text-center py-8">No events data</p>}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Events by Status</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(eventsByStatus).map(([status, count]) => {
                  const colors = { draft: 'bg-gray-500', planned: 'bg-blue-500', ongoing: 'bg-green-500', completed: 'bg-purple-500', cancelled: 'bg-red-500' };
                  return (
                    <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`w-16 h-16 ${colors[status] || 'bg-gray-500'} rounded-full flex items-center justify-center mx-auto mb-2`}>
                        <span className="text-2xl font-bold text-white">{count}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 capitalize">{status}</p>
                    </div>
                  );
                })}
                {Object.keys(eventsByStatus).length === 0 && <p className="text-gray-500 text-sm text-center py-8 col-span-2">No events data</p>}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Guest RSVP Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(guestRSVP).map(([status, count]) => {
                  const colors = { accepted: 'bg-green-500', declined: 'bg-red-500', pending: 'bg-yellow-500', maybe: 'bg-blue-500' };
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${colors[status] || 'bg-gray-500'}`}></div>
                        <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                  );
                })}
                {Object.keys(guestRSVP).length === 0 && <p className="text-gray-500 text-sm text-center py-8">No guest data</p>}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Bookings by Status</h3>
              <div className="space-y-4">
                {Object.entries(bookingsByStatus).map(([status, count]) => {
                  const colors = { pending: 'bg-yellow-500', confirmed: 'bg-green-500', in_progress: 'bg-blue-500', completed: 'bg-purple-500', cancelled: 'bg-red-500' };
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 capitalize">{status.replace('_', ' ')}</span>
                        <span className="text-sm text-gray-500">{count}</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[status] || 'bg-gray-500'} rounded-full transition-all duration-500`} style={{ width: `${(count / maxStatusCount) * 100}%` }}></div>
                      </div>
                    </div>
                  );
                })}
                {Object.keys(bookingsByStatus).length === 0 && <p className="text-gray-500 text-sm text-center py-8">No booking data</p>}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Vendors</h3>
              <div className="space-y-3">
                {Object.entries(topVendors).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([vendor, count], i) => (
                  <div key={vendor} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-gray-400">#{i + 1}</span>
                      <span className="text-sm font-medium text-gray-700">{vendor}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(count / maxVendorCount) * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
                {Object.keys(topVendors).length === 0 && <p className="text-gray-500 text-sm text-center py-8">No vendor data</p>}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Vendors</span>
                  <span className="text-xl font-bold text-gray-900">{data.vendors.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Guests</span>
                  <span className="text-xl font-bold text-gray-900">{data.guests.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="text-xl font-bold text-purple-600">${totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Avg Booking Value</span>
                  <span className="text-xl font-bold text-blue-600">${avgBookingValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Events per Vendor</span>
                  <span className="text-xl font-bold text-green-600">{data.vendors.length > 0 ? (data.events.length / data.vendors.length).toFixed(1) : 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-3">
                {data.events.slice(0, 5).map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{event.name}</p>
                      <p className="text-xs text-gray-500">{event.event_date} • {event.venue || 'No venue'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${event.status === 'planned' ? 'bg-blue-100 text-blue-800' : event.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{event.status}</span>
                  </div>
                ))}
                {data.events.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No recent activity</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
