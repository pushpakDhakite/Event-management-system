const { pool } = require('../config/database');

const suggestVenues = async (eventType, guestCount, budget, location) => {
  let query = `SELECT v.*, c.name as category_name
               FROM vendors v
               LEFT JOIN categories c ON v.category_id = c.id
               WHERE v.category_id IN (SELECT id FROM categories WHERE LOWER(name) LIKE '%venue%' OR LOWER(name) LIKE '%hall%' OR LOWER(name) LIKE '%banquet%')
               AND v.rating >= 3.5`;
  const params = [];

  if (location) {
    query += ' AND (v.city LIKE ? OR v.state LIKE ? OR v.address LIKE ?)';
    params.push(`%${location}%`, `%${location}%`, `%${location}%`);
  }

  query += ' ORDER BY v.rating DESC LIMIT 10';

  const [venues] = await pool.query(query, params);

  return venues.map(venue => ({
    id: venue.id,
    name: venue.business_name || venue.name,
    category: venue.category_name,
    rating: venue.rating,
    location: `${venue.city || ''}, ${venue.state || ''}`.trim(),
    contact: venue.email,
    match_score: calculateVenueMatchScore(venue, eventType, guestCount, budget, location)
  }));
};

const calculateVenueMatchScore = (venue, eventType, guestCount, budget, location) => {
  let score = 50;

  score += venue.rating * 8;

  if (location && (venue.city?.toLowerCase().includes(location.toLowerCase()) || venue.state?.toLowerCase().includes(location.toLowerCase()))) {
    score += 20;
  }

  if (budget) {
    const estimatedCost = budget * 0.4;
    if (estimatedCost > 1000) score += 10;
  }

  if (guestCount) {
    if (guestCount > 100) score += 5;
  }

  return Math.min(Math.round(score), 100);
};

const suggestServices = async (eventType, guestCount, budget) => {
  const serviceCategories = getServiceCategoriesForEventType(eventType);

  const [services] = await pool.query(
    `SELECT s.*, v.business_name as vendor_name, v.rating as vendor_rating, c.name as category_name
     FROM services s
     LEFT JOIN vendors v ON s.vendor_id = v.id
     LEFT JOIN categories c ON s.category_id = c.id
     WHERE s.is_active = 1 AND c.name IN (${serviceCategories.map(() => '?').join(',')})
     ORDER BY v.rating DESC, s.price ASC
     LIMIT 20`,
    serviceCategories
  );

  return services.map(service => ({
    id: service.id,
    name: service.name,
    category: service.category_name,
    vendor: service.vendor_name,
    vendor_rating: service.vendor_rating,
    price: service.price,
    description: service.description,
    priority: getServicePriority(service.category_name, eventType)
  }));
};

const getServiceCategoriesForEventType = (eventType) => {
  const type = eventType?.toLowerCase() || '';

  const baseCategories = ['Catering', 'Photography', 'Decoration', 'Music'];

  if (type.includes('wedding')) {
    return [...baseCategories, 'Florist', 'Makeup', 'Videography', 'Transportation'];
  } else if (type.includes('corporate') || type.includes('conference') || type.includes('meeting')) {
    return [...baseCategories, 'AV Equipment', 'Printing', 'Translation'];
  } else if (type.includes('birthday')) {
    return [...baseCategories, 'Cake', 'Entertainment', 'Balloon'];
  } else if (type.includes('birthday')) {
    return [...baseCategories, 'Cake', 'Entertainment'];
  } else if (type.includes('conference')) {
    return [...baseCategories, 'AV Equipment', 'Printing'];
  }

  return baseCategories;
};

const getServicePriority = (category, eventType) => {
  const type = eventType?.toLowerCase() || '';
  const cat = category?.toLowerCase() || '';

  if (cat.includes('catering')) return 'high';
  if (cat.includes('venue') || cat.includes('hall')) return 'high';
  if (type.includes('wedding') && cat.includes('photography')) return 'high';
  if (type.includes('corporate') && cat.includes('av')) return 'high';

  return 'medium';
};

const suggestPackages = async (eventType, guestCount, budget, location) => {
  const packages = [];

  const basePackage = {
    name: `${eventType || 'Event'} Standard Package`,
    description: `A well-rounded package for your ${eventType || 'event'} with essential services`,
    estimated_cost: budget ? budget * 0.6 : null,
    services: []
  };

  const [catering] = await pool.query(
    `SELECT s.*, v.business_name as vendor_name
     FROM services s
     LEFT JOIN vendors v ON s.vendor_id = v.id
     WHERE s.is_active = 1 AND (LOWER(s.name) LIKE '%catering%' OR LOWER(s.name) LIKE '%food%' OR LOWER(s.name) LIKE '%meal%')
     ORDER BY s.price ASC LIMIT 3`
  );

  const [photography] = await pool.query(
    `SELECT s.*, v.business_name as vendor_name
     FROM services s
     LEFT JOIN vendors v ON s.vendor_id = v.id
     WHERE s.is_active = 1 AND (LOWER(s.name) LIKE '%photo%' OR LOWER(s.name) LIKE '%camera%')
     ORDER BY v.rating DESC LIMIT 2`
  );

  const [decoration] = await pool.query(
    `SELECT s.*, v.business_name as vendor_name
     FROM services s
     LEFT JOIN vendors v ON s.vendor_id = v.id
     WHERE s.is_active = 1 AND (LOWER(s.name) LIKE '%decor%' OR LOWER(s.name) LIKE '%floral%' OR LOWER(s.name) LIKE '%design%')
     ORDER BY v.rating DESC LIMIT 2`
  );

  basePackage.services = [...catering, ...photography, ...decoration].map(s => ({
    id: s.id,
    name: s.name,
    vendor: s.vendor_name,
    price: s.price
  }));

  packages.push({
    tier: 'standard',
    ...basePackage
  });

  const premiumPackage = {
    tier: 'premium',
    name: `${eventType || 'Event'} Premium Package`,
    description: `A comprehensive package with premium vendors and additional services for your ${eventType || 'event'}`,
    estimated_cost: budget ? budget * 0.85 : null,
    services: []
  };

  const [premiumCatering] = await pool.query(
    `SELECT s.*, v.business_name as vendor_name
     FROM services s
     LEFT JOIN vendors v ON s.vendor_id = v.id
     WHERE s.is_active = 1 AND (LOWER(s.name) LIKE '%catering%' OR LOWER(s.name) LIKE '%food%' OR LOWER(s.name) LIKE '%meal%')
     ORDER BY s.price DESC LIMIT 2`
  );

  const [premiumServices] = await pool.query(
    `SELECT s.*, v.business_name as vendor_name, c.name as category_name
     FROM services s
     LEFT JOIN vendors v ON s.vendor_id = v.id
     LEFT JOIN categories c ON s.category_id = c.id
     WHERE s.is_active = 1 AND v.rating >= 4.0
     ORDER BY v.rating DESC, s.price DESC
     LIMIT 5`
  );

  premiumPackage.services = [...premiumCatering, ...premiumServices].map(s => ({
    id: s.id,
    name: s.name,
    vendor: s.vendor_name,
    category: s.category_name,
    price: s.price
  }));

  packages.push(premiumPackage);

  const budgetPackage = {
    tier: 'budget',
    name: `${eventType || 'Event'} Budget Package`,
    description: `An affordable package with quality vendors for your ${eventType || 'event'}`,
    estimated_cost: budget ? budget * 0.4 : null,
    services: []
  };

  const [budgetServices] = await pool.query(
    `SELECT s.*, v.business_name as vendor_name
     FROM services s
     LEFT JOIN vendors v ON s.vendor_id = v.id
     WHERE s.is_active = 1
     ORDER BY s.price ASC
     LIMIT 5`
  );

  budgetPackage.services = budgetServices.map(s => ({
    id: s.id,
    name: s.name,
    vendor: s.vendor_name,
    price: s.price
  }));

  packages.push(budgetPackage);

  return packages;
};

const generatePlan = async (req, res) => {
  try {
    const { event_type, guest_count, budget, location, preferences } = req.body;

    if (!event_type) {
      return res.status(400).json({ success: false, message: 'Event type is required' });
    }

    const [venues, services, packages] = await Promise.all([
      suggestVenues(event_type, guest_count, budget, location),
      suggestServices(event_type, guest_count, budget),
      suggestPackages(event_type, guest_count, budget, location)
    ]);

    const budgetBreakdown = budget ? {
      venue: Math.round(budget * 0.4),
      catering: Math.round(budget * 0.25),
      decoration: Math.round(budget * 0.1),
      photography: Math.round(budget * 0.1),
      entertainment: Math.round(budget * 0.05),
      miscellaneous: Math.round(budget * 0.1)
    } : null;

    const timeline = generateTimeline(event_type, guest_count);

    res.json({
      success: true,
      data: {
        event_type,
        guest_count,
        budget,
        location,
        venues,
        services,
        packages,
        budget_breakdown: budgetBreakdown,
        timeline,
        recommendations: generateRecommendations(event_type, guest_count, budget, venues, services)
      }
    });
  } catch (error) {
    console.error('Generate plan error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const generateTimeline = (eventType, guestCount) => {
  const type = eventType?.toLowerCase() || '';
  const timeline = [];

  if (type.includes('wedding')) {
    timeline.push(
      { phase: 'Planning', timeframe: '6-12 months before', tasks: ['Set budget', 'Choose venue', 'Create guest list', 'Hire planner'] },
      { phase: 'Booking', timeframe: '4-6 months before', tasks: ['Book vendors', 'Send save-the-dates', 'Choose attire', 'Plan menu'] },
      { phase: 'Preparation', timeframe: '2-3 months before', tasks: ['Send invitations', 'Finalize menu', 'Plan ceremony', 'Book transportation'] },
      { phase: 'Final Details', timeframe: '1 month before', tasks: ['Confirm vendors', 'Final fitting', 'Create seating chart', 'Rehearsal dinner'] },
      { phase: 'Event Day', timeframe: 'Day of', tasks: ['Setup', 'Ceremony', 'Reception', 'Send-off'] }
    );
  } else if (type.includes('corporate') || type.includes('conference')) {
    timeline.push(
      { phase: 'Planning', timeframe: '3-6 months before', tasks: ['Set objectives', 'Choose venue', 'Set budget', 'Form committee'] },
      { phase: 'Organization', timeframe: '2-3 months before', tasks: ['Book speakers', 'Send invitations', 'Arrange catering', 'Plan agenda'] },
      { phase: 'Preparation', timeframe: '1 month before', tasks: ['Confirm attendees', 'Finalize materials', 'Test AV equipment', 'Brief staff'] },
      { phase: 'Event Day', timeframe: 'Day of', tasks: ['Registration', 'Sessions', 'Networking', 'Feedback collection'] }
    );
  } else {
    timeline.push(
      { phase: 'Planning', timeframe: '2-3 months before', tasks: ['Set budget', 'Choose venue', 'Create guest list'] },
      { phase: 'Booking', timeframe: '1-2 months before', tasks: ['Book vendors', 'Send invitations', 'Plan menu'] },
      { phase: 'Preparation', timeframe: '2-4 weeks before', tasks: ['Confirm vendors', 'Finalize details', 'Setup plan'] },
      { phase: 'Event Day', timeframe: 'Day of', tasks: ['Setup', 'Event execution', 'Cleanup'] }
    );
  }

  return timeline;
};

const generateRecommendations = (eventType, guestCount, budget, venues, services) => {
  const recommendations = [];
  const type = eventType?.toLowerCase() || '';

  if (guestCount && guestCount > 200) {
    recommendations.push('Consider a larger venue or multiple spaces to accommodate your guest count comfortably');
  }

  if (budget && guestCount) {
    const perGuest = budget / guestCount;
    if (perGuest < 50) {
      recommendations.push('Your per-guest budget is tight. Consider potluck-style catering or buffet options');
    } else if (perGuest > 200) {
      recommendations.push('You have a generous per-guest budget. Consider premium vendors and personalized experiences');
    }
  }

  if (type.includes('wedding')) {
    recommendations.push('Book your venue and photographer first as they tend to get reserved early');
    recommendations.push('Consider hiring a day-of coordinator even if you plan everything else yourself');
  } else if (type.includes('corporate')) {
    recommendations.push('Ensure reliable WiFi and AV equipment for presentations');
    recommendations.push('Plan networking breaks between sessions for better engagement');
  }

  if (venues.length === 0) {
    recommendations.push('No venues found matching your criteria. Consider expanding your location search');
  }

  return recommendations;
};

const getEventTemplates = async (req, res) => {
  try {
    const templates = [
      {
        type: 'Wedding',
        description: 'Complete wedding event planning',
        typical_guest_count: '100-300',
        typical_budget_range: '$15,000 - $50,000',
        essential_services: ['Venue', 'Catering', 'Photography', 'Decoration', 'Music/DJ', 'Florist'],
        timeline_months: '6-12'
      },
      {
        type: 'Corporate Conference',
        description: 'Professional conference or seminar',
        typical_guest_count: '50-500',
        typical_budget_range: '$10,000 - $100,000',
        essential_services: ['Venue', 'Catering', 'AV Equipment', 'Printing', 'Photography'],
        timeline_months: '3-6'
      },
      {
        type: 'Birthday Party',
        description: 'Birthday celebration event',
        typical_guest_count: '20-100',
        typical_budget_range: '$1,000 - $10,000',
        essential_services: ['Venue', 'Catering', 'Decoration', 'Cake', 'Entertainment'],
        timeline_months: '1-3'
      },
      {
        type: 'Gala Dinner',
        description: 'Formal dinner event',
        typical_guest_count: '100-500',
        typical_budget_range: '$20,000 - $100,000',
        essential_services: ['Venue', 'Catering', 'Decoration', 'Music', 'Photography'],
        timeline_months: '3-6'
      },
      {
        type: 'Workshop',
        description: 'Educational or training workshop',
        typical_guest_count: '10-50',
        typical_budget_range: '$500 - $5,000',
        essential_services: ['Venue', 'Catering', 'AV Equipment', 'Materials'],
        timeline_months: '1-2'
      }
    ];

    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Get event templates error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = { generatePlan, getEventTemplates, suggestVenues, suggestServices, suggestPackages };
