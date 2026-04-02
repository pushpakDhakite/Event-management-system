import { useState, useEffect } from 'react';
import { notificationService } from '../services';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchNotifications(); }, [filter]);

  const fetchNotifications = async () => {
    try {
      const params = filter !== 'all' ? { is_read: filter === 'unread' ? 'false' : 'true' } : {};
      const res = await notificationService.getByUser(user.id, params);
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user.id);
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const typeIcons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌', booking: '📅', payment: '💳', event: '🎉', reminder: '⏰' };
  const typeColors = { info: 'bg-blue-50 border-blue-200', success: 'bg-green-50 border-green-200', warning: 'bg-yellow-50 border-yellow-200', error: 'bg-red-50 border-red-200', booking: 'bg-purple-50 border-purple-200', payment: 'bg-pink-50 border-pink-200', event: 'bg-indigo-50 border-indigo-200', reminder: 'bg-orange-50 border-orange-200' };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && <p className="text-sm text-gray-600">{unreadCount} unread</p>}
            </div>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100">Mark All Read</button>
              )}
            </div>
          </div>

          <div className="flex space-x-2 mb-6">
            {['all', 'unread', 'read'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-sm font-medium rounded-lg capitalize ${filter === f ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>{f}</button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-4xl mb-3">🔔</div>
              <p className="text-gray-500">No notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id} onClick={() => !n.is_read && markAsRead(n.id)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${n.is_read ? 'bg-white border-gray-200 opacity-75' : `${typeColors[n.type] || 'bg-white border-gray-200'} opacity-100`}`}>
                  <div className="flex items-start space-x-3">
                    <span className="text-xl flex-shrink-0">{typeIcons[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${n.is_read ? 'text-gray-600' : 'text-gray-900'}`}>{n.title}</p>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                    </div>
                    {!n.is_read && <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-2"></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NotificationCenter;
