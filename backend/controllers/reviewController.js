const { pool } = require('../config/database');

const createReview = async (req, res) => {
  try {
    const { vendor_id, booking_id, rating, comment } = req.body;
    const userId = req.user.id;

    if (!vendor_id || !rating) {
      return res.status(400).json({ success: false, message: 'Vendor ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const [vendorExists] = await pool.query('SELECT id FROM vendors WHERE id = ?', [vendor_id]);
    if (vendorExists.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const [existingReview] = await pool.query(
      'SELECT id FROM reviews WHERE vendor_id = ? AND user_id = ? AND booking_id = ?',
      [vendor_id, userId, booking_id || 0]
    );
    if (existingReview.length > 0) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this vendor for this booking' });
    }

    const [result] = await pool.query(
      'INSERT INTO reviews (vendor_id, user_id, booking_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [vendor_id, userId, booking_id || null, rating, comment || null]
    );

    const [review] = await pool.query(
      `SELECT r.*, u.name as user_name, v.business_name as vendor_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN vendors v ON r.vendor_id = v.id
       WHERE r.id = ?`,
      [result.insertId]
    );

    await updateVendorRating(vendor_id);

    res.status(201).json({ success: true, message: 'Review submitted successfully', data: review[0] });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const updateVendorRating = async (vendorId) => {
  try {
    const [result] = await pool.query(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE vendor_id = ?',
      [vendorId]
    );
    const avgRating = result[0].avg_rating || 0;
    await pool.query('UPDATE vendors SET rating = ? WHERE id = ?', [parseFloat(avgRating.toFixed(1)), vendorId]);
  } catch (error) {
    console.error('Update vendor rating error:', error);
  }
};

const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, vendor_id, min_rating } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT r.*, u.name as user_name, v.business_name as vendor_name
                 FROM reviews r
                 LEFT JOIN users u ON r.user_id = u.id
                 LEFT JOIN vendors v ON r.vendor_id = v.id
                 WHERE 1=1`;
    const params = [];

    if (vendor_id) { query += ' AND r.vendor_id = ?'; params.push(vendor_id); }
    if (min_rating) { query += ' AND r.rating >= ?'; params.push(parseInt(min_rating)); }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [reviews] = await pool.query(query, params);

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM reviews WHERE 1=1${vendor_id ? ' AND vendor_id = ?' : ''}${min_rating ? ' AND rating >= ?' : ''}`,
      vendor_id && min_rating ? [vendor_id, parseInt(min_rating)] : vendor_id ? [vendor_id] : min_rating ? [parseInt(min_rating)] : []
    );

    res.json({
      success: true,
      data: reviews,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, pages: Math.ceil(countResult[0].total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const [reviews] = await pool.query(
      `SELECT r.*, u.name as user_name, v.business_name as vendor_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN vendors v ON r.vendor_id = v.id
       WHERE r.id = ?`,
      [id]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({ success: true, data: reviews[0] });
  } catch (error) {
    console.error('Get review by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getReviewsByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 10, min_rating } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT r.*, u.name as user_name
                 FROM reviews r
                 LEFT JOIN users u ON r.user_id = u.id
                 WHERE r.vendor_id = ?`;
    const params = [vendorId];

    if (min_rating) { query += ' AND r.rating >= ?'; params.push(parseInt(min_rating)); }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [reviews] = await pool.query(query, params);

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM reviews WHERE vendor_id = ?${min_rating ? ' AND rating >= ?' : ''}`,
      min_rating ? [vendorId, parseInt(min_rating)] : [vendorId]
    );

    const [avgResult] = await pool.query(
      'SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews FROM reviews WHERE vendor_id = ?',
      [vendorId]
    );

    res.json({
      success: true,
      data: reviews,
      summary: {
        average_rating: parseFloat(avgResult[0].average_rating || 0).toFixed(1),
        total_reviews: avgResult[0].total_reviews
      },
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, pages: Math.ceil(countResult[0].total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get reviews by vendor error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [reviews] = await pool.query(
      `SELECT r.*, v.business_name as vendor_name, v.name as vendor_contact
       FROM reviews r
       LEFT JOIN vendors v ON r.vendor_id = v.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), offset]
    );

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM reviews WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      data: reviews,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, pages: Math.ceil(countResult[0].total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const [existing] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (existing[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }

    const fields = [];
    const values = [];

    if (rating !== undefined) { fields.push('rating = ?'); values.push(rating); }
    if (comment !== undefined) { fields.push('comment = ?'); values.push(comment); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    await pool.query(`UPDATE reviews SET ${fields.join(', ')} WHERE id = ?`, values);

    await updateVendorRating(existing[0].vendor_id);

    const [updated] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);

    res.json({ success: true, message: 'Review updated successfully', data: updated[0] });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (existing[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const vendorId = existing[0].vendor_id;
    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);

    await updateVendorRating(vendorId);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const calculateAverageRating = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const [result] = await pool.query(
      `SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews,
              SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
              SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
              SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
              SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
              SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
       FROM reviews WHERE vendor_id = ?`,
      [vendorId]
    );

    if (!result[0]) {
      return res.json({
        success: true,
        data: {
          average_rating: 0,
          total_reviews: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      });
    }

    res.json({
      success: true,
      data: {
        average_rating: parseFloat(result[0].average_rating || 0).toFixed(1),
        total_reviews: result[0].total_reviews,
        distribution: {
          5: result[0].five_star || 0,
          4: result[0].four_star || 0,
          3: result[0].three_star || 0,
          2: result[0].two_star || 0,
          1: result[0].one_star || 0
        }
      }
    });
  } catch (error) {
    console.error('Calculate average rating error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = { createReview, getAllReviews, getReviewById, getReviewsByVendor, getUserReviews, updateReview, deleteReview, calculateAverageRating };
