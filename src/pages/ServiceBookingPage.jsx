import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceService, bookingService } from '../services';
import DashboardSidebar from '../components/DashboardSidebar';
import ServiceCard from '../components/ServiceCard';

const ServiceBookingPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [bookingForm, setBookingForm] = useState({ quantity: 1, notes: '' });

  const categories = ['food', 'decoration', 'entertainment', 'transportation', 'venue', 'accommodation', 'event_staff'];

  useEffect(() => {
    fetchServices();
  }, [categoryFilter]);

  const fetchServices = async () => {
    try {
      const params = categoryFilter ? { category: categoryFilter } : {};
      const res = await serviceService.getAll(params);
      setServices(res.data.services || []);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedService || !eventId) return;
    try {
      await bookingService.create({
        event_id: parseInt(eventId),
        service_id: selectedService.id,
        vendor_id: selectedService.vendor_id,
        quantity: parseInt(bookingForm.quantity),
        total_price: selectedService.price * parseInt(bookingForm.quantity),
        notes: bookingForm.notes
      });
      setSelectedService(null);
      setBookingForm({ quantity: 1, notes: '' });
      navigate(`/events/${eventId}`);
    } catch (err) {
      console.error('Failed to create booking:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button onClick={() => navigate(-1)} className="text-sm text-purple-600 hover:text-purple-700 mb-2">← Back</button>
              <h1 className="text-2xl font-bold text-gray-900">Book Services</h1>
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">All Categories</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>
          ) : services.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"><p className="text-gray-500">No services available</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} onBook={() => setSelectedService(service)} />
              ))}
            </div>
          )}

          {selectedService && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Book {selectedService.name}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price</span>
                    <span className="font-medium">${selectedService.price?.toLocaleString()}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input type="number" value={bookingForm.quantity} onChange={(e) => setBookingForm({ ...bookingForm, quantity: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" min="1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea value={bookingForm.notes} onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"></textarea>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-purple-600">${(selectedService.price * parseInt(bookingForm.quantity || 1)).toLocaleString()}</span>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => setSelectedService(null)} className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                    <button onClick={handleBook} className="flex-1 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90">Confirm Booking</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ServiceBookingPage;