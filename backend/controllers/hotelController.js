const { pool } = require('../config/database');

exports.createHotel = async (req, res) => {
  try {
    const { name, description, address, city, state, stars, price_per_night, total_rooms, available_rooms, amenities } = req.body;
    const [result] = await pool.query(
      `INSERT INTO hotels (vendor_id, name, description, address, city, state, stars, price_per_night, total_rooms, available_rooms, amenities)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, description, address, city, state, stars || 3, price_per_night, total_rooms || 0, available_rooms || total_rooms || 0, amenities ? JSON.stringify(amenities) : null]
    );
    res.status(201).json({ success: true, message: 'Hotel created successfully', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create hotel error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.getAllHotels = async (req, res) => {
  try {
    const { city, min_stars, max_price, search } = req.query;
    let query = `SELECT h.*, v.business_name as vendor_name, v.rating as vendor_rating FROM hotels h LEFT JOIN vendors v ON h.vendor_id = v.id WHERE h.is_active = 1`;
    const params = [];
    if (city) { query += ' AND h.city LIKE ?'; params.push(`%${city}%`); }
    if (min_stars) { query += ' AND h.stars >= ?'; params.push(parseInt(min_stars)); }
    if (max_price) { query += ' AND h.price_per_night <= ?'; params.push(parseFloat(max_price)); }
    if (search) { query += ' AND (h.name LIKE ? OR h.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY h.stars DESC, h.price_per_night ASC';
    const [hotels] = await pool.query(query, params);
    res.json({ success: true, data: hotels });
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.getHotelById = async (req, res) => {
  try {
    const [hotels] = await pool.query(
      `SELECT h.*, v.business_name as vendor_name, v.rating as vendor_rating, v.phone as vendor_phone, v.email as vendor_email
       FROM hotels h LEFT JOIN vendors v ON h.vendor_id = v.id WHERE h.id = ?`,
      [req.params.id]
    );
    if (hotels.length === 0) return res.status(404).json({ success: false, message: 'Hotel not found' });
    res.json({ success: true, data: hotels[0] });
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.updateHotel = async (req, res) => {
  try {
    const { name, description, address, city, state, stars, price_per_night, total_rooms, available_rooms, amenities } = req.body;
    const [result] = await pool.query(
      `UPDATE hotels SET name=?, description=?, address=?, city=?, state=?, stars=?, price_per_night=?, total_rooms=?, available_rooms=?, amenities=? WHERE id=? AND vendor_id=(SELECT user_id FROM vendors WHERE user_id=?)`,
      [name, description, address, city, state, stars, price_per_night, total_rooms, available_rooms, amenities ? JSON.stringify(amenities) : null, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Hotel not found or unauthorized' });
    res.json({ success: true, message: 'Hotel updated successfully' });
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM hotels WHERE id = ? AND vendor_id = (SELECT user_id FROM vendors WHERE user_id = ?)', [req.params.id, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Hotel not found or unauthorized' });
    res.json({ success: true, message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
