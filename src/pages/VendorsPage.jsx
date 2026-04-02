import { useEffect, useState } from 'react';
import { vendorService, serviceService } from '../services';
import DashboardSidebar from '../components/DashboardSidebar';
import VendorCard from '../components/VendorCard';
import ServiceCard from '../components/ServiceCard';

const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vendors');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['catering', 'decoration', 'photography', 'venue', 'transportation', 'entertainment'];

  useEffect(() => {
    fetchData();
  }, [activeTab, categoryFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'vendors') {
        const params = categoryFilter ? { category: categoryFilter } : {};
        const res = await vendorService.getAll(params);
        setVendors(res.data.data || []);
      } else {
        const params = {};
        if (categoryFilter) params.category = categoryFilter;
        if (searchQuery) params.query = searchQuery;
        const res = await serviceService.getAll(params);
        setServices(res.data.services || []);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Vendor Marketplace</h1>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex space-x-2">
              <button onClick={() => setActiveTab('vendors')} className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'vendors' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Vendors</button>
              <button onClick={() => setActiveTab('services')} className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'services' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Services</button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm">
                <option value="">All Categories</option>
                {categories.map((cat) => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>
          ) : activeTab === 'vendors' ? (
            vendors.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"><p className="text-gray-500">No vendors found</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors.map((vendor) => <VendorCard key={vendor.id} vendor={vendor} />)}
              </div>
            )
          ) : (
            services.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"><p className="text-gray-500">No services found</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => <ServiceCard key={service.id} service={service} />)}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default VendorsPage;