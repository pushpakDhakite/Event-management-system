import { useState, useEffect } from 'react';
import { eventService, guestService } from '../services';
import { wishlistService } from '../services/newFeatures';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';

const WishlistPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ item_name: '', item_description: '', estimated_cost: '' });

  useEffect(() => { fetchEvents(); }, []);
  useEffect(() => { if (selectedEvent) fetchWishlist(); }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const res = await eventService.getMy();
      setEvents(res.data.data || []);
      if (res.data.data?.length > 0) setSelectedEvent(res.data.data[0]);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchWishlist = async () => {
    try {
      const res = await wishlistService.getByEvent(selectedEvent.id);
      setItems(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const addItem = async (e) => {
    e.preventDefault();
    try {
      await wishlistService.create({ event_id: selectedEvent.id, ...newItem, guest_id: null });
      setNewItem({ item_name: '', item_description: '', estimated_cost: '' });
      fetchWishlist();
    } catch (err) { console.error(err); }
  };

  const claimItem = async (id) => {
    try {
      await wishlistService.claim(id);
      fetchWishlist();
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (id) => {
    try {
      await wishlistService.delete(id);
      fetchWishlist();
    } catch (err) { console.error(err); }
  };

  const totalValue = items.reduce((sum, i) => sum + (parseFloat(i.estimated_cost) || 0), 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Event Wishlist</h1>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Event</label>
            <select value={selectedEvent?.id || ''} onChange={(e) => setSelectedEvent(events.find(ev => ev.id === parseInt(e.target.value)))} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm">
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>
          </div>

          <form onSubmit={addItem} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Add Wishlist Item</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input type="text" value={newItem.item_name} onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })} placeholder="Item name *" className="px-4 py-2 border border-gray-300 rounded-lg text-sm" required />
              <input type="text" value={newItem.item_description} onChange={(e) => setNewItem({ ...newItem, item_description: e.target.value })} placeholder="Description" className="px-4 py-2 border border-gray-300 rounded-lg text-sm" />
              <input type="number" value={newItem.estimated_cost} onChange={(e) => setNewItem({ ...newItem, estimated_cost: e.target.value })} placeholder="Cost ($)" className="px-4 py-2 border border-gray-300 rounded-lg text-sm" min="0" step="0.01" />
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90">Add Item</button>
            </div>
          </form>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Wishlist Items ({items.length})</h2>
            <span className="text-sm font-medium text-purple-600">Total: ${totalValue.toLocaleString()}</span>
          </div>

          {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div> :
          items.length === 0 ? <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"><p className="text-gray-500">No wishlist items yet</p></div> :
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-900">{item.item_name}</p>
                  <p className="text-sm text-gray-500">{item.item_description || 'No description'}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-purple-600">${parseFloat(item.estimated_cost || 0).toLocaleString()}</span>
                  {item.claimed_by_name ? (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Claimed by {item.claimed_by_name}</span>
                  ) : (
                    <button onClick={() => claimItem(item.id)} className="px-3 py-1 text-xs text-white bg-purple-600 rounded hover:bg-purple-700">Claim</button>
                  )}
                  <button onClick={() => deleteItem(item.id)} className="px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100">✕</button>
                </div>
              </div>
            ))}
          </div>}
        </div>
      </main>
    </div>
  );
};

export default WishlistPage;