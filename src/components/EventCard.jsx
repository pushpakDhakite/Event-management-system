import { Link } from 'react-router-dom';
import { eventService } from '../services';

const EventCard = ({ event, onDelete }) => {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    planned: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventService.delete(event.id);
      if (onDelete) onDelete(event.id);
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert('Failed to delete event');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500"></div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{event.name}</h3>
          <div className="flex items-center space-x-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status] || 'bg-gray-100 text-gray-800'}`}>
              {event.status}
            </span>
            {onDelete && (
              <button onClick={handleDelete} className="p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete event">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <span>📅</span>
            <span>{event.event_date ? new Date(event.event_date).toLocaleDateString() : 'No date'}</span>
          </div>
          {event.venue && (
            <div className="flex items-center space-x-2">
              <span>📍</span>
              <span>{event.venue}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <span>👥</span>
            <span>{event.guest_count || 0} guests</span>
          </div>
          {event.budget && (
            <div className="flex items-center space-x-2">
              <span>💰</span>
              <span>${parseFloat(event.budget).toLocaleString()}</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex space-x-2">
          <Link to={`/events/${event.id}`} className="flex-1 block text-center px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            View Details
          </Link>
          <Link to={`/events/${event.id}/edit`} className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors" title="Edit">
            ✏️
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
