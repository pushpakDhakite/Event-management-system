const { pool } = require('../config/database');

const createVendor = async (req, res) => {
  try {
    const { name, business_name, description, email, phone, address, city, state, zip_code, country, category_id, website, rating = 0 } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Vendor name and email are required' });
    }

    const [existing] = await pool.query('SELECT id FROM vendors WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Vendor with this email already exists' });
    }

    const [result] = await pool.query(
      `INSERT INTO vendors (name, business_name, description, email, phone, address, city, state, zip_code, country, category_id, website, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, business_name || null, description || null, email, phone || null, address || null, city || null, state || null, zip_code || null, country || null, category_id || null, website || null, rating]
    );

    const [vendor] = await pool.query('SELECT * FROM vendors WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, message: 'Vendor created successfully', data: vendor[0] });
  } catch (error) {
    console.error('Create vendor error:', error);
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
    if (search) { query += ' AND (v.name LIKE ? OR v.business_name LIKE ? OR v.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (min_rating) { query += ' AND v.rating >= ?'; params.push(parseFloat(min_rating)); }

    query += ' ORDER BY v.rating DESC, v.name ASC LIMIT ? OFFSET ?';
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

const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;

    const [vendors] = await pool.query(
      `SELECT v.*, c.name as category_name
       FROM vendors v
       LEFT JOIN categories c ON v.category_id = c.id
       WHERE v.id = ?`,
      [id]
    );

    if (vendors.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    res.json({ success: true, data: vendors[0] });
  } catch (error) {
    console.error('Get vendor by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, business_name, description, email, phone, address, city, state, zip_code, country, category_id, website, rating } = req.body;

    const [existing] = await pool.query('SELECT * FROM vendors WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    if (email && email !== existing[0].email) {
      const [emailExists] = await pool.query('SELECT id FROM vendors WHERE email = ? AND id != ?', [email, id]);
      if (emailExists.length > 0) {
        return res.status(409).json({ success: false, message: 'Email already in use by another vendor' });
      }
    }

    const fields = [];
    const values = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (business_name !== undefined) { fields.push('business_name = ?'); values.push(business_name); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
    if (address !== undefined) { fields.push('address = ?'); values.push(address); }
    if (city !== undefined) { fields.push('city = ?'); values.push(city); }
    if (state !== undefined) { fields.push('state = ?'); values.push(state); }
    if (zip_code !== undefined) { fields.push('zip_code = ?'); values.push(zip_code); }
    if (country !== undefined) { fields.push('country = ?'); values.push(country); }
    if (category_id !== undefined) { fields.push('category_id = ?'); values.push(category_id); }
    if (website !== undefined) { fields.push('website = ?'); values.push(website); }
    if (rating !== undefined) { fields.push('rating = ?'); values.push(rating); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    await pool.query(`UPDATE vendors SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query('SELECT * FROM vendors WHERE id = ?', [id]);

    res.json({ success: true, message: 'Vendor updated successfully', data: updated[0] });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM vendors WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    await pool.query('DELETE FROM vendors WHERE id = ?', [id]);

    res.json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getVendorsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [vendors] = await pool.query(
      `SELECT v.*, c.name as category_name
       FROM vendors v
       LEFT JOIN categories c ON v.category_id = c.id
       WHERE v.category_id = ?
       ORDER BY v.rating DESC, v.name ASC
       LIMIT ? OFFSET ?`,
      [categoryId, parseInt(limit), offset]
    );

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM vendors WHERE category_id = ?', [categoryId]);

    res.json({
      success: true,
      data: vendors,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, pages: Math.ceil(countResult[0].total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get vendors by category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getVendorServices = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const [vendorExists] = await pool.query('SELECT id FROM vendors WHERE id = ?', [vendorId]);
    if (vendorExists.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const [services] = await pool.query(
      `SELECT s.*, c.name as category_name
       FROM services s
       LEFT JOIN categories c ON s.category_id = c.id
       WHERE s.vendor_id = ? AND s.is_active = 1
       ORDER BY s.name ASC`,
      [vendorId]
    );

    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Get vendor services error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = { createVendor, getAllVendors, getVendorById, updateVendor, deleteVendor, getVendorsByCategory, getVendorServices };
