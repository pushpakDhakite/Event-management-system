import { useState, useEffect } from 'react';
import { eventService } from '../services';
import { templateService } from '../services/newFeatures';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';

const EventTemplatesPage = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    try {
      const res = await templateService.getAll();
      setTemplates(res.data.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const useTemplate = async (template) => {
    try {
      await eventService.create({
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        description: template.description,
        event_type: template.name,
        event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        guest_count: template.default_guest_count || 50,
        budget: template.default_budget || 5000,
        category: user?.role === 'organizer' ? 'organization' : 'personal'
      });
      window.location.href = user?.role === 'organizer' ? '/dashboard/organization' : '/dashboard/personal';
    } catch (err) { console.error(err); }
  };

  const templateIcons = { Wedding: '💒', 'Corporate Conference': '🏢', 'Birthday Bash': '🎂', 'Gala Dinner': '🍽️', 'Workshop Seminar': '📚', 'Engagement Party': '💍', 'Baby Shower': '👶', 'Annual Company Party': '🎉', 'Product Launch': '🚀', 'Family Reunion': '👨‍👩‍👧‍👦' };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Templates</h1>
          <p className="text-gray-600 mb-8">Start with a pre-built template to plan your event faster</p>

          {loading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div> :
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(t => (
              <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div className="p-6">
                  <div className="text-4xl mb-3">{templateIcons[t.name] || '📅'}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{t.description}</p>
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex justify-between"><span>Guests</span><span className="font-medium">{t.default_guest_count || 'Flexible'}</span></div>
                    <div className="flex justify-between"><span>Budget</span><span className="font-medium">${t.default_budget?.toLocaleString() || 'Flexible'}</span></div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(typeof t.included_services === 'string' ? JSON.parse(t.included_services) : t.included_services || []).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs bg-purple-50 text-purple-700 rounded capitalize">{s}</span>
                    ))}
                  </div>
                  <button onClick={() => useTemplate(t)} className="w-full py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90">Use Template</button>
                </div>
              </div>
            ))}
          </div>}
        </div>
      </main>
    </div>
  );
};

export default EventTemplatesPage;