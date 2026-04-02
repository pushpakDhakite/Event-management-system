import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventService, vendorService, serviceService } from '../services';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ events: [], vendors: [], services: [] });
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowResults(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults({ events: [], vendors: [], services: [] }); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const [eventsRes, vendorsRes, servicesRes] = await Promise.all([
          eventService.getAll({ search: query, limit: 5 }),
          vendorService.getAll({ search: query, limit: 5 }),
          serviceService.search({ query, limit: 5 })
        ]);
        setResults({
          events: eventsRes.data.data || [],
          vendors: vendorsRes.data.data || [],
          services: servicesRes.data.services || servicesRes.data.data || []
        });
        setShowResults(true);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const totalResults = results.events.length + results.vendors.length + results.services.length;

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => query.length >= 2 && setShowResults(true)} placeholder="Search events, vendors, services..." className="w-64 lg:w-80 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
          ) : totalResults === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No results found</div>
          ) : (
            <>
              {results.events.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">Events</p>
                  {results.events.map(ev => (
                    <Link key={ev.id} to={`/events/${ev.id}`} onClick={() => { setShowResults(false); setQuery(''); }} className="block px-3 py-2 text-sm hover:bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{ev.name}</p>
                      <p className="text-xs text-gray-500">{ev.event_date} • {ev.venue || 'No venue'}</p>
                    </Link>
                  ))}
                </div>
              )}
              {results.vendors.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <p className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">Vendors</p>
                  {results.vendors.map(v => (
                    <Link key={v.id} to={`/vendors/${v.id}`} onClick={() => { setShowResults(false); setQuery(''); }} className="block px-3 py-2 text-sm hover:bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{v.business_name || v.name}</p>
                      <p className="text-xs text-gray-500">{v.category_name || v.category} • ★ {v.rating?.toFixed(1)}</p>
                    </Link>
                  ))}
                </div>
              )}
              {results.services.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <p className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">Services</p>
                  {results.services.map(s => (
                    <div key={s.id} className="block px-3 py-2 text-sm hover:bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.vendor_name} • ${s.price?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;