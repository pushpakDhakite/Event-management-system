import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService, eventService, vendorService } from '../services';
import DashboardSidebar from '../components/DashboardSidebar';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, usersRes, vendorsRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getUsers({ limit: 10 }),
        adminService.getVendors({ limit: 10 })
      ]);
      setAnalytics(analyticsRes.data.data);
      setUsers(usersRes.data.data || []);
      setVendors(vendorsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

          <div className="flex space-x-2 mb-6">
            {['overview', 'users', 'vendors'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-lg capitalize ${activeTab === tab ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{tab}</button>
            ))}
          </div>

          {activeTab === 'overview' && analytics && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Total Events', value: analytics.overview?.total_events || 0, icon: '📅', color: 'from-blue-500 to-blue-600' },
                  { label: 'Total Users', value: analytics.overview?.total_users || 0, icon: '👥', color: 'from-green-500 to-green-600' },
                  { label: 'Total Vendors', value: analytics.overview?.total_vendors || 0, icon: '🏪', color: 'from-purple-500 to-purple-600' },
                  { label: 'Total Revenue', value: `$${(analytics.overview?.total_revenue || 0).toLocaleString()}`, icon: '💰', color: 'from-yellow-500 to-orange-500' }
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

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Events by Status</h3>
                  <div className="space-y-3">
                    {analytics.events_by_status?.map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{item.status}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(item.count / (analytics.overview?.total_events || 1)) * 100}%` }}></div>
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Vendors</h3>
                  <div className="space-y-3">
                    {analytics.top_vendors?.slice(0, 5).map((vendor) => (
                      <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{vendor.business_name || vendor.name}</p>
                          <p className="text-sm text-gray-500">{vendor.total_bookings} bookings</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm font-medium">{vendor.rating}</span>
                          </div>
                          <p className="text-sm text-purple-600">${(vendor.total_revenue || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${user.role === 'admin' ? 'bg-red-100 text-red-800' : user.role === 'vendor' ? 'bg-purple-100 text-purple-800' : user.role === 'organizer' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{user.role}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{vendor.business_name || vendor.name}</p>
                        <Link to={`/vendors/${vendor.id}`} className="text-sm text-purple-600 hover:text-purple-700">View Profile</Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{vendor.category_name || vendor.category}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm font-medium">{vendor.rating?.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{vendor.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;