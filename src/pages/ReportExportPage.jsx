import { useState, useEffect } from 'react';
import { eventService, bookingService, guestService } from '../services';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';

const ReportExportPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [reportType, setReportType] = useState('summary');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventService.getMy();
      setEvents(res.data.data || []);
      if (res.data.data?.length > 0) setSelectedEvent(res.data.data[0]);
    } catch (err) { console.error(err); }
  };

  const generateCSV = (headers, rows, filename) => {
    const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportGuestList = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      const res = await guestService.getByEvent(selectedEvent.id);
      const guests = res.data.data || [];
      generateCSV(
        ['Name', 'Email', 'Phone', 'RSVP Status', 'Plus One'],
        guests.map(g => [g.name, g.email || '', g.phone || '', g.rsvp_status || '', g.plus_one ? 'Yes' : 'No']),
        `guests-${selectedEvent.name.replace(/\s+/g, '-').toLowerCase()}`
      );
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const exportBudgetReport = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      const bookingsRes = await bookingService.getByEvent(selectedEvent.id);
      const bookings = bookingsRes.data.data || [];
      const totalSpent = bookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
      generateCSV(
        ['Service', 'Vendor', 'Amount', 'Status'],
        [...bookings.map(b => [b.service_name || 'Service', b.vendor_name || '', parseFloat(b.total_price || 0).toFixed(2), b.status || '']), ['TOTAL', '', totalSpent.toFixed(2), '']],
        `budget-${selectedEvent.name.replace(/\s+/g, '-').toLowerCase()}`
      );
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const exportEventSummary = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      const [guestsRes, bookingsRes] = await Promise.all([
        guestService.getByEvent(selectedEvent.id),
        bookingService.getByEvent(selectedEvent.id)
      ]);
      const guests = guestsRes.data.data || [];
      const bookings = bookingsRes.data.data || [];
      const totalSpent = bookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
      generateCSV(
        ['Field', 'Value'],
        [
          ['Event Name', selectedEvent.name],
          ['Date', selectedEvent.event_date || ''],
          ['Venue', selectedEvent.venue || ''],
          ['Status', selectedEvent.status || ''],
          ['Budget', selectedEvent.budget || ''],
          ['Total Spent', totalSpent.toFixed(2)],
          ['Remaining', ((selectedEvent.budget || 0) - totalSpent).toFixed(2)],
          ['Total Guests', guests.length],
          ['Confirmed Guests', guests.filter(g => g.rsvp_status === 'accepted').length],
          ['Services Booked', bookings.length]
        ],
        `summary-${selectedEvent.name.replace(/\s+/g, '-').toLowerCase()}`
      );
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const exportAllEvents = async () => {
    setLoading(true);
    try {
      generateCSV(
        ['Name', 'Date', 'Venue', 'Status', 'Guests', 'Budget'],
        events.map(e => [e.name, e.event_date || '', e.venue || '', e.status || '', e.guest_count || 0, e.budget || '']),
        'all-events-report'
      );
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports & Export</h1>
          <p className="text-gray-600 mb-8">Generate and download reports for your events</p>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Select Event</h3>
            <select value={selectedEvent?.id || ''} onChange={(e) => setSelectedEvent(events.find(ev => ev.id === parseInt(e.target.value)))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name} ({ev.event_date})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button onClick={exportEventSummary} disabled={loading || !selectedEvent} className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left disabled:opacity-50">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-1">Event Summary</h3>
              <p className="text-sm text-gray-500">Overview with key metrics, budget, and guest stats</p>
            </button>
            <button onClick={exportGuestList} disabled={loading || !selectedEvent} className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left disabled:opacity-50">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-semibold text-gray-900 mb-1">Guest List</h3>
              <p className="text-sm text-gray-500">Complete guest list with contact info and RSVP status</p>
            </button>
            <button onClick={exportBudgetReport} disabled={loading || !selectedEvent} className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left disabled:opacity-50">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-semibold text-gray-900 mb-1">Budget Report</h3>
              <p className="text-sm text-gray-500">Detailed breakdown of all service bookings and costs</p>
            </button>
            <button onClick={exportAllEvents} disabled={loading} className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left disabled:opacity-50">
              <div className="text-3xl mb-3">📅</div>
              <h3 className="font-semibold text-gray-900 mb-1">All Events Report</h3>
              <p className="text-sm text-gray-500">Summary of all your events at a glance</p>
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Generating report...</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReportExportPage;
