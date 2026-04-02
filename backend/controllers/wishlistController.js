const { pool } = require('../config/database');

exports.createWishlistItem = async (req, res) => {
  try {
    const { event_id, guest_id, item_name, item_description, estimated_cost } = req.body;
    if (!event_id || !item_name) return res.status(400).json({ success: false, message: 'Event ID and item name are required' });
    const [result] = await pool.query(
      'INSERT INTO wishlists (event_id, guest_id, item_name, item_description, estimated_cost) VALUES (?, ?, ?, ?, ?)',
      [event_id, guest_id || null, item_name, item_description || null, estimated_cost || null]
    );
    res.status(201).json({ success: true, message: 'Wishlist item created', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create wishlist error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.getWishlistByEvent = async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT w.*, g.name as guest_name, u.name as claimed_by_name FROM wishlists w
       LEFT JOIN guests g ON w.guest_id = g.id LEFT JOIN users u ON w.claimed_by = u.id
       WHERE w.event_id = ? ORDER BY w.created_at DESC`,
      [req.params.eventId]
    );
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.claimWishlistItem = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE wishlists SET claimed_by = ? WHERE id = ? AND claimed_by IS NULL', [req.user.id, req.params.id]);
    if (result.affectedRows === 0) return res.status(400).json({ success: false, message: 'Item already claimed or not found' });
    res.json({ success: true, message: 'Wishlist item claimed successfully' });
  } catch (error) {
    console.error('Claim wishlist error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.deleteWishlistItem = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM wishlists WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Wishlist item deleted' });
  } catch (error) {
    console.error('Delete wishlist error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
