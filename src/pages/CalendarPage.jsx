import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services';
import DashboardSidebar from '../components/DashboardSidebar';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventService.getAll();
      setEvents(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.event_date && e.event_date.startsWith(dateStr));
  };

  const statusColors = { draft: 'bg-gray-400', planned: 'bg-blue-500', ongoing: 'bg-green-500', completed: 'bg-purple-500', cancelled: 'bg-red-500' };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Event Calendar</h1>
            <Link to="/events/create" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90">+ Create Event</Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button onClick={prevMonth} className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">← Prev</button>
              <h2 className="text-lg font-semibold text-gray-900">{monthName}</h2>
              <button onClick={nextMonth} className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">Next →</button>
            </div>

            <div className="grid grid-cols-7">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="p-2 text-center text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-200">{d}</div>
              ))}
              {days.map((day, i) => {
                const dayEvents = getEventsForDay(day);
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                return (
                  <div key={i} onClick={() => day && setSelectedDate(day)} className={`min-h-[80px] p-1 border-b border-r border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${isToday ? 'bg-purple-50' : ''} ${!day ? 'bg-gray-50' : ''}`}>
                    {day && (
                      <>
                        <span className={`text-sm font-medium ${isToday ? 'text-purple-600' : 'text-gray-700'}`}>{day}</span>
                        <div className="mt-1 space-y-0.5">
                          {dayEvents.slice(0, 2).map(ev => (
                            <Link key={ev.id} to={`/events/${ev.id}`} className={`block px-1 py-0.5 text-xs text-white rounded truncate ${statusColors[ev.status] || 'bg-gray-500'}`} title={ev.name}>{ev.name}</Link>
                          ))}
                          {dayEvents.length > 2 && <span className="text-xs text-gray-500">+{dayEvents.length - 2} more</span>}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {selectedDate && getEventsForDay(selectedDate).length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Events on {monthName.split(' ')[0]} {selectedDate}, {year}</h3>
              <div className="space-y-3">
                {getEventsForDay(selectedDate).map(ev => (
                  <Link key={ev.id} to={`/events/${ev.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{ev.name}</p>
                      <p className="text-sm text-gray-500">{ev.venue || 'No venue'} • {ev.guest_count || 0} guests</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${statusColors[ev.status] || 'bg-gray-500'}`}>{ev.status}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;