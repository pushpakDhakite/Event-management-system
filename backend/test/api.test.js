const path = require('path');
const resolve = (p) => path.resolve(__dirname, '..', p);

const expect = (actual) => ({
  toBe: (expected) => { if (actual !== expected) throw new Error(`Expected "${expected}" but got "${actual}"`); },
  toBeTruthy: () => { if (!actual) throw new Error(`Expected truthy but got ${actual}`); },
  toBeFalsy: () => { if (actual) throw new Error(`Expected falsy but got ${actual}`); },
  toEqual: (expected) => { if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`); },
  toHaveProperty: (prop) => { if (!actual || !(prop in actual)) throw new Error(`Expected property '${prop}'`); },
  toBeGreaterThan: (n) => { if (actual <= n) throw new Error(`Expected ${actual} > ${n}`); },
  toBeInstanceOf: (type) => { if (!(actual instanceof type)) throw new Error(`Expected instance of ${type.name}`); }
});

const tests = [
  ['Auth controller exports register', () => { const c = require(resolve('./controllers/authController')); expect(typeof c.register).toBe('function'); }],
  ['Auth controller exports login', () => { const c = require(resolve('./controllers/authController')); expect(typeof c.login).toBe('function'); }],
  ['Auth controller exports getProfile', () => { const c = require(resolve('./controllers/authController')); expect(typeof c.getProfile).toBe('function'); }],
  ['Auth controller exports updateProfile', () => { const c = require(resolve('./controllers/authController')); expect(typeof c.updateProfile).toBe('function'); }],
  ['Event controller exports createEvent', () => { const c = require(resolve('./controllers/eventController')); expect(typeof c.createEvent).toBe('function'); }],
  ['Event controller exports getAllEvents', () => { const c = require(resolve('./controllers/eventController')); expect(typeof c.getAllEvents).toBe('function'); }],
  ['Event controller exports getEventById', () => { const c = require(resolve('./controllers/eventController')); expect(typeof c.getEventById).toBe('function'); }],
  ['Event controller exports updateEvent', () => { const c = require(resolve('./controllers/eventController')); expect(typeof c.updateEvent).toBe('function'); }],
  ['Event controller exports deleteEvent', () => { const c = require(resolve('./controllers/eventController')); expect(typeof c.deleteEvent).toBe('function'); }],
  ['Vendor controller exports createVendor', () => { const c = require(resolve('./controllers/vendorController')); expect(typeof c.createVendor).toBe('function'); }],
  ['Vendor controller exports getAllVendors', () => { const c = require(resolve('./controllers/vendorController')); expect(typeof c.getAllVendors).toBe('function'); }],
  ['Vendor controller exports getVendorById', () => { const c = require(resolve('./controllers/vendorController')); expect(typeof c.getVendorById).toBe('function'); }],
  ['Booking controller exports createBooking', () => { const c = require(resolve('./controllers/bookingController')); expect(typeof c.createBooking).toBe('function'); }],
  ['Booking controller exports getBookingsByEvent', () => { const c = require(resolve('./controllers/bookingController')); expect(typeof c.getBookingsByEvent).toBe('function'); }],
  ['Booking controller exports updateBookingStatus', () => { const c = require(resolve('./controllers/bookingController')); expect(typeof c.updateBookingStatus).toBe('function'); }],
  ['Payment controller exports createPayment', () => { const c = require(resolve('./controllers/paymentController')); expect(typeof c.createPayment).toBe('function'); }],
  ['Payment controller exports generateInvoiceNumber', () => { const c = require(resolve('./controllers/paymentController')); expect(typeof c.generateInvoiceNumber).toBe('function'); }],
  ['Payment controller generates valid invoice numbers', async () => { const c = require(resolve('./controllers/paymentController')); const n = await c.generateInvoiceNumber(); expect(typeof n).toBe('string'); expect(n.startsWith('INV-')).toBeTruthy(); }],
  ['Review controller exports createReview', () => { const c = require(resolve('./controllers/reviewController')); expect(typeof c.createReview).toBe('function'); }],
  ['Review controller exports calculateAverageRating', () => { const c = require(resolve('./controllers/reviewController')); expect(typeof c.calculateAverageRating).toBe('function'); }],
  ['Auth middleware exports auth', () => { const m = require(resolve('./middleware/auth')); expect(typeof m.auth).toBe('function'); }],
  ['Auth middleware exports authorize', () => { const m = require(resolve('./middleware/auth')); expect(typeof m.authorize).toBe('function'); }],
  ['Validation middleware exports registerValidation', () => { const m = require(resolve('./middleware/validation')); expect(Array.isArray(m.registerValidation)).toBeTruthy(); }],
  ['Validation middleware exports loginValidation', () => { const m = require(resolve('./middleware/validation')); expect(Array.isArray(m.loginValidation)).toBeTruthy(); }],
  ['Error handler exports errorHandler', () => { const m = require(resolve('./middleware/errorHandler')); expect(typeof m.errorHandler).toBe('function'); }],
  ['Error handler exports notFound', () => { const m = require(resolve('./middleware/errorHandler')); expect(typeof m.notFound).toBe('function'); }],
  ['Rate limiter exports rateLimit', () => { const m = require(resolve('./middleware/rateLimiter')); expect(typeof m.rateLimit).toBe('function'); }],
  ['Security middleware exports securityHeaders', () => { const m = require(resolve('./middleware/security')); expect(Array.isArray(m.securityHeaders)).toBeTruthy(); }],
  ['Security middleware exports sanitizeInput', () => { const m = require(resolve('./middleware/security')); expect(typeof m.sanitizeInput).toBe('function'); }],
  ['Email service exports sendEmail', () => { const s = require(resolve('./services/emailService')); expect(typeof s.sendEmail).toBe('function'); }],
  ['Email service exports sendEventConfirmation', () => { const s = require(resolve('./services/emailService')); expect(typeof s.sendEventConfirmation).toBe('function'); }],
  ['Email service exports sendBookingConfirmation', () => { const s = require(resolve('./services/emailService')); expect(typeof s.sendBookingConfirmation).toBe('function'); }],
  ['Email service exports sendGuestInvitation', () => { const s = require(resolve('./services/emailService')); expect(typeof s.sendGuestInvitation).toBe('function'); }],
  ['Email service exports sendPaymentReceipt', () => { const s = require(resolve('./services/emailService')); expect(typeof s.sendPaymentReceipt).toBe('function'); }],
  ['Email service exports getSentEmails', () => { const s = require(resolve('./services/emailService')); expect(typeof s.getSentEmails).toBe('function'); }],
  ['Email service returns success on send', async () => { const s = require(resolve('./services/emailService')); const r = await s.sendEmail('test@example.com', 'Test', '<p>Test</p>'); expect(r.success).toBeTruthy(); }],
  ['Config exports port', () => { const c = require(resolve('./config/config')); expect(c.port).toBeTruthy(); }],
  ['Config exports db settings', () => { const c = require(resolve('./config/config')); expect(c.db).toBeTruthy(); expect(c.db.host).toBeTruthy(); }],
  ['Config exports jwt settings', () => { const c = require(resolve('./config/config')); expect(c.jwt).toBeTruthy(); expect(c.jwt.secret).toBeTruthy(); }],
  ['Database module exports pool', () => { const db = require(resolve('./config/database')); expect(db.pool).toBeTruthy(); }],
  ['Database module exports testConnection', () => { const db = require(resolve('./config/database')); expect(typeof db.testConnection).toBe('function'); }],
  ['Auth routes exports router', () => { expect(require(resolve('./routes/authRoutes'))).toBeTruthy(); }],
  ['Event routes exports router', () => { expect(require(resolve('./routes/eventRoutes'))).toBeTruthy(); }],
  ['Vendor routes exports router', () => { expect(require(resolve('./routes/vendorRoutes'))).toBeTruthy(); }],
  ['Booking routes exports router', () => { expect(require(resolve('./routes/bookingRoutes'))).toBeTruthy(); }],
  ['Payment routes exports router', () => { expect(require(resolve('./routes/paymentRoutes'))).toBeTruthy(); }],
  ['AI planner exports generatePlan', () => { const c = require(resolve('./controllers/aiPlannerController')); expect(typeof c.generatePlan).toBe('function'); }],
  ['AI planner exports getEventTemplates', () => { const c = require(resolve('./controllers/aiPlannerController')); expect(typeof c.getEventTemplates).toBe('function'); }],
  ['Admin controller exports getAllUsers', () => { const c = require(resolve('./controllers/adminController')); expect(typeof c.getAllUsers).toBe('function'); }],
  ['Admin controller exports getAnalytics', () => { const c = require(resolve('./controllers/adminController')); expect(typeof c.getAnalytics).toBe('function'); }],
  ['Notification controller exports createNotification', () => { const c = require(resolve('./controllers/notificationController')); expect(typeof c.createNotification).toBe('function'); }],
  ['Notification controller exports getNotificationsByUser', () => { const c = require(resolve('./controllers/notificationController')); expect(typeof c.getNotificationsByUser).toBe('function'); }],
  ['Guest controller exports createGuest', () => { const c = require(resolve('./controllers/guestController')); expect(typeof c.createGuest).toBe('function'); }],
  ['Guest controller exports bulkInvite', () => { const c = require(resolve('./controllers/guestController')); expect(typeof c.bulkInvite).toBe('function'); }],
  ['Service controller exports searchServices', () => { const c = require(resolve('./controllers/serviceController')); expect(typeof c.searchServices).toBe('function'); }]
];

(async () => {
  let passed = 0, failed = 0;
  for (const [name, fn] of tests) {
    try {
      await fn();
      passed++;
      console.log(`✓ ${name}`);
    } catch (error) {
      failed++;
      console.log(`✗ ${name}`);
      console.log(`  Error: ${error.message}`);
    }
  }
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Tests: ${tests.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(50));
  process.exit(failed > 0 ? 1 : 0);
})();
