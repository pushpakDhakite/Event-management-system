require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
const { rateLimit } = require('./middleware/rateLimiter');
const { securityHeaders, sanitizeInput } = require('./middleware/security');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const guestRoutes = require('./routes/guestRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const aiPlannerRoutes = require('./routes/aiPlannerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const documentRoutes = require('./routes/documentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const templateRoutes = require('./routes/templateRoutes');
const promoRoutes = require('./routes/promoRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(securityHeaders);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ai-planner', aiPlannerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();