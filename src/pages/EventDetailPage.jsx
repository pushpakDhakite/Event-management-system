import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventService, bookingService, guestService } from '../services';
import { documentService, attendanceService } from '../services/newFeatures';
import DashboardSidebar from '../components/DashboardSidebar';
import ShareModal from '../components/ShareModal';
import { generateICS, generateGoogleCalendarUrl } from '../utils/calendarExport';

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [attendanceData, setAttendanceData] = useState({ records: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [showShare, setShowShare] = useState(false);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [eventRes, guestsRes, bookingsRes, docsRes, attRes] = await Promise.all([
        eventService.getById(id),
        guestService.getByEvent(id),
        bookingService.getByEvent(id),
        documentService.getByEvent(id),
        attendanceService.getByEvent(id).catch(() => ({ data: { data: [], stats: {} } }))
      ]);
      setEvent(eventRes.data.data);
      setGuests(guestsRes.data.data || []);
      setBookings(bookingsRes.data.data || []);
      setDocuments(docsRes.data.data || []);
      setAttendanceData({ records: attRes.data.data || [], stats: attRes.data.stats || {} });
    } catch (err) {
      console.error('Failed to fetch event details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;
  if (!event) return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Event not found</p></div>;

  const totalBookingsCost = bookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);

  const tabs = [
    { id: 'details', label: 'Details', icon: '📋' },
    { id: 'guests', label: `Guests (${guests.length})`, icon: '👥' },
    { id: 'bookings', label: `Bookings (${bookings.length})`, icon: '📅' },
    { id: 'documents', label: `Docs (${documents.length})`, icon: '📁' },
    { id: 'attendance', label: 'Attendance', icon: '✅' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link to={-1} className="text-sm text-purple-600 hover:text-purple-700 mb-2 inline-block">← Back</Link>
              <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setShowShare(true)} className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">📤 Share</button>
              <button onClick={() => generateICS(event)} className="px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100">📅 Add to Calendar</button>
              <a href={event ? generateGoogleCalendarUrl(event) : '#'} target="_blank" rel="noopener noreferrer" className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">🔗 Google Calendar</a>
              <Link to={`/events/${id}/agenda`} className="px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100">📝 Agenda</Link>
              <Link to={`/events/${id}/documents`} className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">📁 Documents</Link>
              <Link to={`/events/${id}/attendance`} className="px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100">✅ Attendance</Link>
              <Link to={`/events/${id}/edit`} className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">✏️ Edit</Link>
            </div>
          </div>

          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'details' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Type', value: event.event_type || 'N/A' },
                      { label: 'Status', value: event.status },
                      { label: 'Date', value: event.event_date ? new Date(event.event_date).toLocaleDateString() : 'N/A' },
                      { label: 'Time', value: event.start_time ? `${event.start_time} - ${event.end_time || 'TBD'}` : 'TBD' },
                      { label: 'Venue', value: event.venue || 'TBD' },
                      { label: 'Budget', value: event.budget ? `$${parseFloat(event.budget).toLocaleString()}` : 'Not set' }
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <p className="font-medium text-gray-900 capitalize">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  {event.description && <p className="mt-4 text-gray-600">{event.description}</p>}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Service Bookings ({bookings.length})</h2>
                    <Link to={`/events/${id}/book`} className="text-sm text-purple-600 hover:text-purple-700">+ Add Service</Link>
                  </div>
                  {bookings.length === 0 ? (
                    <p className="text-gray-500 text-sm">No services booked yet</p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map(booking => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{booking.service_name || 'Service'}</p>
                            <p className="text-sm text-gray-500">{booking.vendor_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">${parseFloat(booking.total_price || 0).toLocaleString()}</p>
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{booking.status}</span>
                          </div>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-gray-200 flex justify-between">
                        <span className="font-medium">Total Bookings</span>
                        <span className="font-bold text-purple-600">${totalBookingsCost.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
                  <div className="space-y-3">
                    {[
                      { label: 'Guests', value: guests.length, color: 'text-gray-900' },
                      { label: 'Confirmed', value: guests.filter(g => g.rsvp_status === 'accepted').length, color: 'text-green-600' },
                      { label: 'Pending RSVP', value: guests.filter(g => g.rsvp_status === 'pending').length, color: 'text-yellow-600' },
                      { label: 'Services Booked', value: bookings.length, color: 'text-purple-600' },
                      { label: 'Documents', value: documents.length, color: 'text-blue-600' },
                      { label: 'Checked In', value: attendanceData.stats.checked_in || 0, color: 'text-green-600' }
                    ].map(item => (
                      <div key={item.label} className="flex justify-between">
                        <span className="text-gray-600">{item.label}</span>
                        <span className={`font-medium ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-gray-600">Total Budget</span><span className="font-medium">{event.budget ? `$${parseFloat(event.budget).toLocaleString()}` : 'Not set'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Spent</span><span className="font-medium">${totalBookingsCost.toLocaleString()}</span></div>
                    <div className="flex justify-between pt-3 border-t border-gray-200">
                      <span className="font-semibold">Remaining</span>
                      <span className={`font-bold ${event.budget && totalBookingsCost > event.budget ? 'text-red-600' : 'text-green-600'}`}>
                        {event.budget ? `$${(event.budget - totalBookingsCost).toLocaleString()}` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="space-y-2">
                    {[
                      { label: 'Manage Guests', path: `/events/${id}/guests`, icon: '👥' },
                      { label: 'Build Agenda', path: `/events/${id}/agenda`, icon: '📝' },
                      { label: 'Upload Documents', path: `/events/${id}/documents`, icon: '📁' },
                      { label: 'Track Attendance', path: `/events/${id}/attendance`, icon: '✅' },
                      { label: 'Book Services', path: `/events/${id}/book`, icon: '📅' },
                      { label: 'View Wishlist', path: `/wishlist`, icon: '🎁' }
                    ].map(action => (
                      <Link key={action.path} to={action.path} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="text-xl">{action.icon}</span>
                        <span className="text-sm font-medium text-gray-900">{action.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guests' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Guest List</h2>
                <Link to={`/events/${id}/guests`} className="text-sm text-purple-600 hover:text-purple-700">Manage Guests →</Link>
              </div>
              {guests.length === 0 ? (
                <div className="p-12 text-center"><p className="text-gray-500">No guests added yet</p></div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {guests.map(guest => (
                      <tr key={guest.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{guest.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{guest.email || guest.phone || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${guest.rsvp_status === 'accepted' ? 'bg-green-100 text-green-800' : guest.rsvp_status === 'declined' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{guest.rsvp_status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Service Bookings</h2>
                <Link to={`/events/${id}/book`} className="text-sm text-purple-600 hover:text-purple-700">+ Book Service</Link>
              </div>
              {bookings.length === 0 ? (
                <div className="p-12 text-center"><p className="text-gray-500">No services booked yet</p></div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{booking.service_name || 'Service'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{booking.vendor_name || '-'}</td>
                        <td className="px-4 py-3 font-medium text-purple-600">${parseFloat(booking.total_price || 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{booking.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
                <Link to={`/events/${id}/documents`} className="text-sm text-purple-600 hover:text-purple-700">Manage Documents →</Link>
              </div>
              {documents.length === 0 ? (
                <div className="p-12 text-center"><p className="text-gray-500">No documents uploaded yet</p></div>
              ) : (
                <div className="p-4 space-y-2">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{doc.original_name}</p>
                        <p className="text-xs text-gray-500">{doc.description || 'No description'} • {new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
                <Link to={`/events/${id}/attendance`} className="text-sm text-purple-600 hover:text-purple-700">Manage Attendance →</Link>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Total', value: attendanceData.stats.total || 0, color: 'bg-gray-100 text-gray-800' },
                    { label: 'Checked In', value: attendanceData.stats.checked_in || 0, color: 'bg-green-100 text-green-800' },
                    { label: 'Checked Out', value: attendanceData.stats.checked_out || 0, color: 'bg-blue-100 text-blue-800' },
                    { label: 'Not Arrived', value: attendanceData.stats.not_arrived || 0, color: 'bg-red-100 text-red-800' }
                  ].map(s => (
                    <div key={s.label} className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${s.color}`}>{s.label}</span>
                    </div>
                  ))}
                </div>
                {attendanceData.records.length > 0 && (
                  <div className="space-y-2">
                    {attendanceData.records.slice(0, 10).map(r => (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">{r.guest_name}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${r.check_out_time ? 'bg-blue-100 text-blue-800' : r.check_in_time ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {r.check_out_time ? 'Left' : r.check_in_time ? 'Present' : 'Absent'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {showShare && <ShareModal event={event} onClose={() => setShowShare(false)} />}
      </main>
    </div>
  );
};

export default EventDetailPage;