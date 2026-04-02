import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Plan Perfect Events
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">Effortlessly</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10">
              From corporate conferences to dream weddings, manage every detail with our all-in-one event management platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="px-8 py-4 text-lg font-semibold text-purple-700 bg-white rounded-xl hover:bg-gray-50 transition-colors shadow-lg">
                Get Started Free
              </Link>
              <Link to="/login" className="px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Two Powerful Platforms in One</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Whether you are managing corporate events or planning personal celebrations, we have you covered.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl mb-6">🏢</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Organization Events</h3>
              <ul className="space-y-3 text-gray-600">
                {['Meetings & Conferences', 'Corporate Events & Workshops', 'Seminars & Product Launches', 'Team Building Activities', 'Award Ceremonies'].map((item) => (
                  <li key={item} className="flex items-center space-x-2">
                    <span className="text-blue-500">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center text-white text-2xl mb-6">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Personal Events</h3>
              <ul className="space-y-3 text-gray-600">
                {['Weddings & Receptions', 'Birthday Parties', 'Anniversaries & Baby Showers', 'Festivals & Religious Ceremonies', 'Family Gatherings'].map((item) => (
                  <li key={item} className="flex items-center space-x-2">
                    <span className="text-purple-500">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-lg text-gray-600">Complete event management tools at your fingertips</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🤖', title: 'AI Event Planner', desc: 'Get intelligent suggestions for venues, services, and budgets based on your event type.' },
              { icon: '🏪', title: 'Vendor Marketplace', desc: 'Browse and book from hundreds of verified vendors across all service categories.' },
              { icon: '💰', title: 'Budget Calculator', desc: 'Automatic cost estimation and tracking to keep your event on budget.' },
              { icon: '💳', title: 'Easy Payments', desc: 'Secure payment processing with invoice generation and payment tracking.' },
              { icon: '👥', title: 'Guest Management', desc: 'Send invitations, track RSVPs, and manage your guest list effortlessly.' },
              { icon: '📅', title: 'Event Scheduling', desc: 'Plan agendas, manage timelines, and coordinate all event activities.' },
              { icon: '⭐', title: 'Reviews & Ratings', desc: 'Read authentic reviews from other users to choose the best vendors.' },
              { icon: '📊', title: 'Analytics Dashboard', desc: 'Track event performance, spending, and engagement metrics in real-time.' }
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Plan Your Next Event?</h2>
          <p className="text-lg text-gray-600 mb-8">Join thousands of event organizers who trust EventHub</p>
          <Link to="/register" className="inline-block px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl hover:opacity-90 transition-opacity shadow-lg">
            Create Your Free Account
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-400 rounded-lg"></div>
                <span className="text-xl font-bold">EventHub</span>
              </div>
              <p className="text-gray-400 text-sm">Your complete event management platform for organizations and individuals.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/events" className="hover:text-white">Events</Link></li>
                <li><Link to="/vendors" className="hover:text-white">Vendors</Link></li>
                <li><Link to="/ai-planner" className="hover:text-white">AI Planner</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            © 2026 EventHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;