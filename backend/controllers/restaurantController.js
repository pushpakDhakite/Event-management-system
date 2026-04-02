const { pool } = require('../config/database');

exports.createRestaurant = async (req, res) => {
  try {
    const { name, description, cuisine_type, address, city, state, price_range, capacity, menu_items } = req.body;
    const [result] = await pool.query(
      `INSERT INTO restaurants (vendor_id, name, description, cuisine_type, address, city, state, price_range, capacity, menu_items)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, description, cuisine_type, address, city, state, price_range || 'moderate', capacity || 0, menu_items ? JSON.stringify(menu_items) : null]
    );
    res.status(201).json({ success: true, message: 'Restaurant created successfully', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.getAllRestaurants = async (req, res) => {
  try {
    const { city, cuisine_type, price_range, search } = req.query;
    let query = `SELECT r.*, v.business_name as vendor_name, v.rating as vendor_rating FROM restaurants r LEFT JOIN vendors v ON r.vendor_id = v.id WHERE r.is_active = 1`;
    const params = [];
    if (city) { query += ' AND r.city LIKE ?'; params.push(`%${city}%`); }
    if (cuisine_type) { query += ' AND r.cuisine_type = ?'; params.push(cuisine_type); }
    if (price_range) { query += ' AND r.price_range = ?'; params.push(price_range); }
    if (search) { query += ' AND (r.name LIKE ? OR r.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY r.rating DESC, r.name ASC';
    const [restaurants] = await pool.query(query, params);
    res.json({ success: true, data: restaurants });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.getRestaurantById = async (req, res) => {
  try {
    const [restaurants] = await pool.query(
      `SELECT r.*, v.business_name as vendor_name, v.rating as vendor_rating, v.phone as vendor_phone, v.email as vendor_email
       FROM restaurants r LEFT JOIN vendors v ON r.vendor_id = v.id WHERE r.id = ?`,
      [req.params.id]
    );
    if (restaurants.length === 0) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    res.json({ success: true, data: restaurants[0] });
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const { name, description, cuisine_type, address, city, state, price_range, capacity, menu_items } = req.body;
    const [result] = await pool.query(
      `UPDATE restaurants SET name=?, description=?, cuisine_type=?, address=?, city=?, state=?, price_range=?, capacity=?, menu_items=? WHERE id=? AND vendor_id=(SELECT user_id FROM vendors WHERE user_id=?)`,
      [name, description, cuisine_type, address, city, state, price_range, capacity, menu_items ? JSON.stringify(menu_items) : null, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Restaurant not found or unauthorized' });
    res.json({ success: true, message: 'Restaurant updated successfully' });
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.deleteRestaurant = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM restaurants WHERE id = ? AND vendor_id = (SELECT user_id FROM vendors WHERE user_id = ?)', [req.params.id, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Restaurant not found or unauthorized' });
    res.json({ success: true, message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
