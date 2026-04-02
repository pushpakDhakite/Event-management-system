import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventService } from '../services';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';

const CreateEventPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_type: '',
    event_date: '',
    start_time: '',
    end_time: '',
    venue: '',
    category_id: '',
    guest_count: '',
    budget: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const eventTypes = {
    organization: ['Meeting', 'Board Meeting', 'Conference', 'Corporate Event', 'Workshop', 'Training Session', 'Seminar', 'Product Launch', 'Networking Event', 'Corporate Dinner', 'Annual Celebration', 'Team Building', 'Client Meeting', 'Award Ceremony'],
    personal: ['Wedding', 'Reception', 'Engagement', 'Birthday Party', 'Anniversary', 'Baby Shower', 'House Warming', 'Graduation Party', 'Family Reunion', 'Kids Party', 'Private Dinner', 'Surprise Party', 'Friend Gathering', 'Festival', 'Religious Ceremony']
  };

  const category = user?.role === 'organizer' ? 'organization' : 'personal';
  const types = eventTypes[category] || eventTypes.personal;

  useEffect(() => {
    if (isEdit) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      const res = await eventService.getById(id);
      const event = res.data.data;
      setFormData({
        name: event.name || '',
        description: event.description || '',
        event_type: event.event_type || '',
        event_date: event.event_date?.split('T')[0] || '',
        start_time: event.start_time?.substring(0, 5) || '',
        end_time: event.end_time?.substring(0, 5) || '',
        venue: event.venue || '',
        category_id: event.category_id || '',
        guest_count: event.guest_count || '',
        budget: event.budget || '',
        status: event.status || 'draft'
      });
    } catch (err) {
      setError('Failed to load event');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { category, ...cleanData } = formData;
      const data = { ...cleanData };
      if (isEdit) {
        await eventService.update(id, data);
      } else {
        await eventService.create(data);
      }
      navigate(user?.role === 'organizer' ? '/dashboard/organization' : '/dashboard/personal');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Event' : 'Create New Event'}</h1>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="Enter event name" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="Describe your event"></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
              <select name="event_type" value={formData.event_type} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" required>
                <option value="">Select type</option>
                {types.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" name="event_date" value={formData.event_date} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <input type="text" name="venue" value={formData.venue} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="Event location" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Guests</label>
                <input type="number" name="guest_count" value={formData.guest_count} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="0" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                <input type="number" name="budget" value={formData.budget} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="0.00" min="0" step="0.01" />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90 disabled:opacity-50">{loading ? 'Saving...' : (isEdit ? 'Update Event' : 'Create Event')}</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateEventPage;