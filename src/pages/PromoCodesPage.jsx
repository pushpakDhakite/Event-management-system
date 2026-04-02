import { useState, useEffect } from 'react';
import { promoService } from '../services/newFeatures';
import DashboardSidebar from '../components/DashboardSidebar';

const PromoCodesPage = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ code: '', discount_type: 'percent', discount_value: '', max_uses: '', valid_from: '', valid_until: '' });

  useEffect(() => { fetchPromoCodes(); }, []);

  const fetchPromoCodes = async () => {
    try {
      const res = await promoService.getMy();
      setPromoCodes(res.data.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await promoService.create(formData);
      setFormData({ code: '', discount_type: 'percent', discount_value: '', max_uses: '', valid_from: '', valid_until: '' });
      setShowForm(false);
      fetchPromoCodes();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
            <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90">+ Create Code</button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="font-medium text-gray-900 mb-4">New Promo Code</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="Code (e.g., SUMMER20)" className="px-4 py-2 border border-gray-300 rounded-lg text-sm" required />
                <select value={formData.discount_type} onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
                <input type="number" value={formData.discount_value} onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })} placeholder="Discount value" className="px-4 py-2 border border-gray-300 rounded-lg text-sm" min="0" step="0.01" required />
                <input type="number" value={formData.max_uses} onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })} placeholder="Max uses (0=unlimited)" className="px-4 py-2 border border-gray-300 rounded-lg text-sm" min="0" />
                <input type="date" value={formData.valid_from} onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                <input type="date" value={formData.valid_until} onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700">Create Code</button>
              </div>
            </form>
          )}

          {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div> :
          promoCodes.length === 0 ? <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"><p className="text-gray-500">No promo codes created yet</p></div> :
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promoCodes.map(pc => (
              <div key={pc.id} className={`bg-white rounded-xl shadow-sm border-2 p-5 ${pc.is_active ? 'border-green-200' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-purple-600 font-mono">{pc.code}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${pc.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{pc.is_active ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between"><span>Discount</span><span className="font-medium">{pc.discount_type === 'percent' ? `${pc.discount_value}%` : `$${pc.discount_value}`}</span></div>
                  <div className="flex justify-between"><span>Uses</span><span className="font-medium">{pc.used_count}{pc.max_uses > 0 ? ` / ${pc.max_uses}` : ' / Unlimited'}</span></div>
                  {pc.valid_from && <div className="flex justify-between"><span>Valid From</span><span className="font-medium">{new Date(pc.valid_from).toLocaleDateString()}</span></div>}
                  {pc.valid_until && <div className="flex justify-between"><span>Valid Until</span><span className="font-medium">{new Date(pc.valid_until).toLocaleDateString()}</span></div>}
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${pc.max_uses > 0 ? Math.min((pc.used_count / pc.max_uses) * 100, 100) : 0}%` }}></div>
                </div>
              </div>
            ))}
          </div>}
        </div>
      </main>
    </div>
  );
};

export default PromoCodesPage;