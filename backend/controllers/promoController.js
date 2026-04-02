const { pool } = require('../config/database');

exports.createPromoCode = async (req, res) => {
  try {
    const { code, discount_type, discount_value, max_uses, valid_from, valid_until } = req.body;
    const [existing] = await pool.query('SELECT id FROM promo_codes WHERE code = ?', [code]);
    if (existing.length > 0) return res.status(409).json({ success: false, message: 'Promo code already exists' });

    const [result] = await pool.query(
      `INSERT INTO promo_codes (vendor_id, code, discount_type, discount_value, max_uses, valid_from, valid_until)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, code, discount_type, discount_value, max_uses || 0, valid_from, valid_until]
    );
    res.status(201).json({ success: true, message: 'Promo code created successfully', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create promo code error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.validatePromoCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { amount } = req.query;
    const [codes] = await pool.query(
      `SELECT p.*, v.business_name as vendor_name FROM promo_codes p LEFT JOIN vendors v ON p.vendor_id = v.id WHERE p.code = ? AND p.is_active = 1`,
      [code]
    );
    if (codes.length === 0) return res.status(404).json({ success: false, message: 'Invalid promo code' });

    const promo = codes[0];
    const today = new Date().toISOString().split('T')[0];
    if (promo.valid_from && today < promo.valid_from) return res.status(400).json({ success: false, message: 'Promo code not yet valid' });
    if (promo.valid_until && today > promo.valid_until) return res.status(400).json({ success: false, message: 'Promo code expired' });
    if (promo.max_uses > 0 && promo.used_count >= promo.max_uses) return res.status(400).json({ success: false, message: 'Promo code usage limit reached' });

    let discount = 0;
    if (promo.discount_type === 'percent') {
      discount = (amount * promo.discount_value) / 100;
    } else {
      discount = promo.discount_value;
    }

    res.json({ success: true, data: { code: promo.code, discount_type: promo.discount_type, discount_value: promo.discount_value, discount: parseFloat(discount.toFixed(2)), vendor_name: promo.vendor_name } });
  } catch (error) {
    console.error('Validate promo code error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.getPromoCodes = async (req, res) => {
  try {
    const [codes] = await pool.query(
      `SELECT p.*, v.business_name as vendor_name FROM promo_codes p LEFT JOIN vendors v ON p.vendor_id = v.id WHERE p.vendor_id = (SELECT user_id FROM vendors WHERE user_id = ?) ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: codes });
  } catch (error) {
    console.error('Get promo codes error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.getAllActivePromoCodes = async (req, res) => {
  try {
    const { vendor_id } = req.query;
    let query = `SELECT p.*, v.business_name as vendor_name FROM promo_codes p LEFT JOIN vendors v ON p.vendor_id = v.id WHERE p.is_active = 1`;
    const params = [];
    if (vendor_id) { query += ' AND p.vendor_id = ?'; params.push(vendor_id); }
    query += ' ORDER BY p.discount_value DESC';
    const [codes] = await pool.query(query, params);
    res.json({ success: true, data: codes });
  } catch (error) {
    console.error('Get all promo codes error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.usePromoCode = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE promo_codes SET used_count = used_count + 1 WHERE code = ?', [req.params.code]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Promo code not found' });
    res.json({ success: true, message: 'Promo code applied successfully' });
  } catch (error) {
    console.error('Use promo code error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
