const { pool } = require('../config/database');

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT id, name, email, phone, role, avatar, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    if (role) { query += ' AND role = ?'; params.push(role); }
    if (search) { query += ' AND (name LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [users] = await pool.query(query, params);

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM users WHERE 1=1${role ? ' AND role = ?' : ''}`,
      role ? [role] : []
    );

    res.json({
      success: true,
      data: users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, pages: Math.ceil(countResult[0].total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 10, category_id, search, min_rating } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT v.*, c.name as category_name
                 FROM vendors v
                 LEFT JOIN categories c ON v.category_id = c.id
                 WHERE 1=1`;
    const params = [];

    if (category_id) { query += ' AND v.category_id = ?'; params.push(category_id); }
    if (search) { query += ' AND (v.name LIKE ? OR v.business_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (min_rating) { query += ' AND v.rating >= ?'; params.push(parseFloat(min_rating)); }

    query += ' ORDER BY v.rating DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [vendors] = await pool.query(query, params);

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM vendors WHERE 1=1${category_id ? ' AND category_id = ?' : ''}${min_rating ? ' AND rating >= ?' : ''}`,
      category_id && min_rating ? [category_id, parseFloat(min_rating)] : category_id ? [category_id] : min_rating ? [parseFloat(min_rating)] : []
    );

    res.json({
      success: true,
      data: vendors,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, pages: Math.ceil(countResult[0].total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get all vendors error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const dateFilter = start_date && end_date ? 'WHERE created_at BETWEEN ? AND ?' : '';
    const dateParams = start_date && end_date ? [start_date, end_date] : [];

    const [totalEvents] = await pool.query(`SELECT COUNT(*) as total FROM events ${dateFilter}`, dateParams);
    const [totalUsers] = await pool.query(`SELECT COUNT(*) as total FROM users ${dateFilter}`, dateParams);
    const [totalVendors] = await pool.query(`SELECT COUNT(*) as total FROM vendors ${dateFilter}`, dateParams);
    const [totalBookings] = await pool.query(`SELECT COUNT(*) as total FROM bookings ${dateFilter}`, dateParams);
    const [totalReviews] = await pool.query(`SELECT COUNT(*) as total FROM reviews ${dateFilter}`, dateParams);

    const [revenueResult] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total_revenue, COUNT(*) as total_payments FROM payments ${dateFilter}`,
      dateParams
    );

    const [eventsByStatus] = await pool.query(
      'SELECT status, COUNT(*) as count FROM events GROUP BY status'
    );

    const [eventsByCategory] = await pool.query(
      `SELECT c.name as category, COUNT(e.id) as count
       FROM events e
       LEFT JOIN categories c ON e.category_id = c.id
       GROUP BY c.name
       ORDER BY count DESC`
    );

    const [topVendors] = await pool.query(
      `SELECT v.id, v.business_name, v.rating, COUNT(b.id) as total_bookings, COALESCE(SUM(b.total_price), 0) as total_revenue
       FROM vendors v
       LEFT JOIN bookings b ON v.id = b.vendor_id
       GROUP BY v.id
       ORDER BY total_bookings DESC
       LIMIT 10`
    );

    const [recentActivity] = await pool.query(
      `SELECT 'event' as type, e.name as title, e.created_at FROM events e
       UNION ALL
       SELECT 'booking' as type, CONCAT('Booking #', b.id) as title, b.created_at FROM bookings b
       UNION ALL
       SELECT 'review' as type, CONCAT('Review for vendor #', r.vendor_id) as title, r.created_at FROM reviews r
       ORDER BY created_at DESC
       LIMIT 20`
    );

    const [bookingsByStatus] = await pool.query(
      'SELECT status, COUNT(*) as count FROM bookings GROUP BY status'
    );

    res.json({
      success: true,
      data: {
        overview: {
          total_events: totalEvents[0].total,
          total_users: totalUsers[0].total,
          total_vendors: totalVendors[0].total,
          total_bookings: totalBookings[0].total,
          total_reviews: totalReviews[0].total,
          total_revenue: parseFloat(revenueResult[0].total_revenue),
          total_payments: revenueResult[0].total_payments
        },
        events_by_status: eventsByStatus,
        events_by_category: eventsByCategory,
        bookings_by_status: bookingsByStatus,
        top_vendors: topVendors,
        recent_activity: recentActivity
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(
      'SELECT id, name, email, phone, role, avatar, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [eventCount] = await pool.query('SELECT COUNT(*) as total FROM events WHERE organizer_id = ?', [id]);
    const [bookingCount] = await pool.query('SELECT COUNT(*) as total FROM bookings WHERE user_id = ?', [id]);

    res.json({
      success: true,
      data: {
        ...users[0],
        stats: {
          total_events: eventCount[0].total,
          total_bookings: bookingCount[0].total
        }
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }

    const validRoles = ['user', 'organizer', 'vendor', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await pool.query('UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?', [role, id]);

    const [updated] = await pool.query(
      'SELECT id, name, email, phone, role, avatar, updated_at FROM users WHERE id = ?',
      [id]
    );

    res.json({ success: true, message: 'User role updated successfully', data: updated[0] });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await pool.query('UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?', [id]);

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await pool.query('UPDATE users SET is_active = 1, updated_at = NOW() WHERE id = ?', [id]);

    res.json({ success: true, message: 'User activated successfully' });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (existing[0].role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin users' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = { getAllUsers, getAllVendors, getAnalytics, getUserById, updateUserRole, deactivateUser, activateUser, deleteUser };
