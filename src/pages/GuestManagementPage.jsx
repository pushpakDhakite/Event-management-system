import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { guestService } from '../services';
import DashboardSidebar from '../components/DashboardSidebar';

const GuestManagementPage = () => {
  const { eventId } = useParams();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '' });
  const [bulkText, setBulkText] = useState('');

  useEffect(() => {
    if (eventId) fetchGuests();
  }, [eventId]);

  const fetchGuests = async () => {
    try {
      const res = await guestService.getByEvent(eventId);
      setGuests(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch guests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    try {
      await guestService.create({ ...newGuest, event_id: parseInt(eventId) });
      setNewGuest({ name: '', email: '', phone: '' });
      setShowAddForm(false);
      fetchGuests();
    } catch (err) {
      console.error('Failed to add guest:', err);
    }
  };

  const handleBulkInvite = async (e) => {
    e.preventDefault();
    try {
      const lines = bulkText.trim().split('\n');
      const guestsList = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return { name: parts[0], email: parts[1] || '', phone: parts[2] || '' };
      }).filter(g => g.name);

      await guestService.bulkInvite({ event_id: parseInt(eventId), guests: guestsList });
      setBulkText('');
      setShowBulkForm(false);
      fetchGuests();
    } catch (err) {
      console.error('Failed to bulk invite:', err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await guestService.updateStatus(id, status);
      fetchGuests();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const stats = {
    total: guests.length,
    accepted: guests.filter(g => g.rsvp_status === 'accepted').length,
    declined: guests.filter(g => g.rsvp_status === 'declined').length,
    pending: guests.filter(g => g.rsvp_status === 'pending').length
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Guest Management</h1>
            <div className="flex space-x-2">
              <button onClick={() => setShowAddForm(!showAddForm)} className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100">+ Add Guest</button>
              <button onClick={() => setShowBulkForm(!showBulkForm)} className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">Bulk Invite</button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total', value: stats.total, color: 'bg-gray-100 text-gray-800' },
              { label: 'Accepted', value: stats.accepted, color: 'bg-green-100 text-green-800' },
              { label: 'Declined', value: stats.declined, color: 'bg-red-100 text-red-800' },
              { label: 'Pending', value: stats.pending, color: 'bg-yellow-100 text-yellow-800' }
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${stat.color}`}>{stat.label}</span>
              </div>
            ))}
          </div>

          {showAddForm && (
            <form onSubmit={handleAddGuest} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Add New Guest</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="text" value={newGuest.name} onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })} placeholder="Name *" className="px-4 py-2 border border-gray-300 rounded-lg text-sm" required />
                <input type="email" value={newGuest.email} onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })} placeholder="Email" className="px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                <div className="flex space-x-2">
                  <input type="tel" value={newGuest.phone} onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })} placeholder="Phone" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700">Add</button>
                </div>
              </div>
            </form>
          )}

          {showBulkForm && (
            <form onSubmit={handleBulkInvite} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Bulk Invite (one per line: name, email, phone)</h3>
              <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm mb-3" placeholder="John Doe, john@email.com, +1-555-0001&#10;Jane Smith, jane@email.com"></textarea>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowBulkForm(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Send Invites</button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>
          ) : guests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"><p className="text-gray-500">No guests added yet</p></div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {guests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{guest.name}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {guest.email && <p>{guest.email}</p>}
                        {guest.phone && <p>{guest.phone}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${guest.rsvp_status === 'accepted' ? 'bg-green-100 text-green-800' : guest.rsvp_status === 'declined' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{guest.rsvp_status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-1">
                          <button onClick={() => updateStatus(guest.id, 'accepted')} className="px-2 py-1 text-xs text-green-600 bg-green-50 rounded hover:bg-green-100">✓</button>
                          <button onClick={() => updateStatus(guest.id, 'declined')} className="px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100">✗</button>
                          <button onClick={() => updateStatus(guest.id, 'pending')} className="px-2 py-1 text-xs text-yellow-600 bg-yellow-50 rounded hover:bg-yellow-100">?</button>
                        </div>
                      </td>
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

export default GuestManagementPage;