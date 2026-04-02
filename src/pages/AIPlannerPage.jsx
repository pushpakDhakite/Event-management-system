import { useState } from 'react';
import { aiPlannerService } from '../services';
import DashboardSidebar from '../components/DashboardSidebar';
import BudgetCalculator from '../components/BudgetCalculator';

const AIPlannerPage = () => {
  const [formData, setFormData] = useState({
    event_type: '',
    guest_count: '',
    budget: '',
    location: '',
    preferences: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await aiPlannerService.generatePlan(formData);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Event Planner</h1>
          <p className="text-gray-600 mb-8">Get intelligent suggestions for your event planning</p>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 sticky top-24">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
                  <input type="text" name="event_type" value={formData.event_type} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="e.g., Wedding, Conference" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                  <input type="number" name="guest_count" value={formData.guest_count} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="100" min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                  <input type="number" name="budget" value={formData.budget} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="10000" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="City or area" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Preferences</label>
                  <textarea name="preferences" value={formData.preferences} onChange={handleChange} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="Any specific requirements..."></textarea>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 text-white font-semibold bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center space-x-2">
                  {loading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Generating Plan...</span></> : <><span>🤖</span><span>Generate Plan</span></>}
                </button>
              </form>
            </div>

            <div className="lg:col-span-3">
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

              {!result && !loading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Event Planner</h3>
                  <p className="text-gray-600">Fill in the form to get personalized event planning suggestions including venues, services, packages, and budget breakdown.</p>
                </div>
              )}

              {loading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">AI is analyzing your requirements...</p>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {result.budget_breakdown && (
                    <BudgetCalculator
                      guestCount={parseInt(formData.guest_count) || 0}
                      budget={parseInt(formData.budget) || 0}
                      services={{}}
                    />
                  )}

                  {result.venues && result.venues.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🏛️ Suggested Venues</h3>
                      <div className="space-y-3">
                        {result.venues.map((venue, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{venue.name}</p>
                              <p className="text-sm text-gray-500">{venue.location}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1">
                                <span className="text-yellow-400">★</span>
                                <span className="text-sm font-medium">{venue.rating}</span>
                              </div>
                              <span className="text-xs text-purple-600">{venue.match_score}% match</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.services && result.services.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Recommended Services</h3>
                      <div className="space-y-3">
                        {result.services.map((service, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{service.name}</p>
                              <p className="text-sm text-gray-500">{service.category} • {service.vendor}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-purple-600">${service.price?.toLocaleString()}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${service.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{service.priority}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.packages && result.packages.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Suggested Packages</h3>
                      <div className="space-y-4">
                        {result.packages.map((pkg, i) => (
                          <div key={i} className={`p-4 rounded-lg border-2 ${pkg.tier === 'premium' ? 'border-purple-300 bg-purple-50' : pkg.tier === 'budget' ? 'border-green-300 bg-green-50' : 'border-blue-300 bg-blue-50'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900 capitalize">{pkg.tier} Package</h4>
                              {pkg.estimated_cost && <span className="font-bold text-purple-600">~${pkg.estimated_cost.toLocaleString()}</span>}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                            {pkg.services && pkg.services.length > 0 && (
                              <div className="space-y-1">
                                {pkg.services.map((s, j) => (
                                  <div key={j} className="flex justify-between text-sm">
                                    <span className="text-gray-700">{s.name} ({s.vendor})</span>
                                    <span className="text-gray-900 font-medium">${s.price?.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.recommendations && result.recommendations.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Recommendations</h3>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start space-x-2 text-sm text-gray-600">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.timeline && result.timeline.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Planning Timeline</h3>
                      <div className="space-y-4">
                        {result.timeline.map((phase, i) => (
                          <div key={i} className="flex items-start space-x-4">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold flex-shrink-0">{i + 1}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">{phase.phase}</h4>
                                <span className="text-sm text-gray-500">{phase.timeframe}</span>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {phase.tasks.map((task, j) => (
                                  <span key={j} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">{task}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIPlannerPage;