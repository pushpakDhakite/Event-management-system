import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services';
import DashboardSidebar from '../components/DashboardSidebar';
import EventCard from '../components/EventCard';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchEvents(); }, [filter]);

  const fetchEvents = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const res = await eventService.getAll(params);
      setEvents(res.data.data || []);
    } catch (err) { console.error('Failed to fetch events:', err); } finally { setLoading(false); }
  };

  const handleDelete = (id) => {
    setEvents(events.filter(e => e.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Events</h1>
            <div className="flex items-center space-x-3">
              <div className="flex space-x-2">
                {['', 'draft', 'planned', 'ongoing', 'completed'].map((status) => (
                  <button key={status} onClick={() => setFilter(status)} className={`px-3 py-1 text-sm rounded-lg transition-colors ${filter === status ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {status || 'All'}
                  </button>
                ))}
              </div>
              <Link to="/events/create" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90">+ Create Event</Link>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>
          ) : events.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 mb-4">No events found</p>
              <Link to="/events/create" className="inline-block px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90">Create Your First Event</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => <EventCard key={event.id} event={event} onDelete={handleDelete} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventsPage;
