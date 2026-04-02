import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hotelService, restaurantService } from '../services/newFeatures';
import DashboardSidebar from '../components/DashboardSidebar';

const HotelRestaurantPage = () => {
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [activeTab, setActiveTab] = useState('hotels');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', min_stars: '', max_price: '', cuisine_type: '', price_range: '', search: '' });

  useEffect(() => { fetchData(); }, [activeTab, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'hotels') {
        const params = {};
        if (filters.city) params.city = filters.city;
        if (filters.min_stars) params.min_stars = filters.min_stars;
        if (filters.max_price) params.max_price = filters.max_price;
        if (filters.search) params.search = filters.search;
        const res = await hotelService.getAll(params);
        setHotels(res.data.data || []);
      } else {
        const params = {};
        if (filters.city) params.city = filters.city;
        if (filters.cuisine_type) params.cuisine_type = filters.cuisine_type;
        if (filters.price_range) params.price_range = filters.price_range;
        if (filters.search) params.search = filters.search;
        const res = await restaurantService.getAll(params);
        setRestaurants(res.data.data || []);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const cuisineTypes = ['Italian', 'American', 'Indian', 'Seafood', 'Organic', 'Chinese', 'Japanese', 'Mexican', 'French'];
  const priceRanges = ['budget', 'moderate', 'premium', 'luxury'];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Hotels & Restaurants</h1>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex space-x-2">
              <button onClick={() => setActiveTab('hotels')} className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'hotels' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>🏨 Hotels</button>
              <button onClick={() => setActiveTab('restaurants')} className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'restaurants' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>🍽️ Restaurants</button>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <input type="text" placeholder="Search..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <input type="text" placeholder="City" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-24" />
              {activeTab === 'hotels' ? (
                <>
                  <select value={filters.min_stars} onChange={(e) => setFilters({ ...filters, min_stars: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Stars</option>
                    {[3, 4, 5].map(s => <option key={s} value={s}>{s}+ Stars</option>)}
                  </select>
                  <input type="number" placeholder="Max $/night" value={filters.max_price} onChange={(e) => setFilters({ ...filters, max_price: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-28" />
                </>
              ) : (
                <>
                  <select value={filters.cuisine_type} onChange={(e) => setFilters({ ...filters, cuisine_type: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Cuisine</option>
                    {cuisineTypes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={filters.price_range} onChange={(e) => setFilters({ ...filters, price_range: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Price</option>
                    {priceRanges.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </>
              )}
            </div>
          </div>

          {loading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div> :
          activeTab === 'hotels' ? (
            hotels.length === 0 ? <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"><p className="text-gray-500">No hotels found</p></div> :
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map(h => (
                <div key={h.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{h.name}</h3>
                      <span className="text-yellow-400">{'★'.repeat(h.stars)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{h.city}, {h.state}</p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{h.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(typeof h.amenities === 'string' ? JSON.parse(h.amenities) : h.amenities || []).slice(0, 4).map((a, i) => (
                        <span key={i} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">{a}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xl font-bold text-blue-600">${h.price_per_night}<span className="text-sm font-normal text-gray-500">/night</span></p>
                        <p className="text-xs text-gray-500">{h.available_rooms} rooms available</p>
                      </div>
                      <Link to={`/hotels/${h.id}`} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Book</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            restaurants.length === 0 ? <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"><p className="text-gray-500">No restaurants found</p></div> :
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map(r => (
                <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{r.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${r.price_range === 'luxury' ? 'bg-purple-100 text-purple-800' : r.price_range === 'premium' ? 'bg-blue-100 text-blue-800' : r.price_range === 'moderate' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{r.price_range}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{r.cuisine_type} • {r.city}, {r.state}</p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{r.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm font-medium">{r.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <p className="text-xs text-gray-500">Capacity: {r.capacity || 'N/A'}</p>
                      </div>
                      <Link to={`/restaurants/${r.id}`} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700">Book</Link>
                    </div>
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

export default HotelRestaurantPage;