const { pool } = require('../config/database');

const createService = async (req, res) => {
  try {
    const { name, description, category_id, vendor_id, price, duration_minutes, is_active = true } = req.body;

    if (!name || !vendor_id) {
      return res.status(400).json({ success: false, message: 'Service name and vendor ID are required' });
    }

    const [vendorExists] = await pool.query('SELECT id FROM vendors WHERE id = ?', [vendor_id]);
    if (vendorExists.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const [result] = await pool.query(
      'INSERT INTO services (name, description, category_id, vendor_id, price, duration_minutes, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description || null, category_id || null, vendor_id, price || null, duration_minutes || null, is_active]
    );

    const [service] = await pool.query('SELECT * FROM services WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, message: 'Service created successfully', data: service[0] });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getAllServices = async (req, res) => {
  try {
    const { page = 1, limit = 10, category_id, category, vendor_id, is_active, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT s.*, v.name as vendor_name, v.business_name, c.name as category_name
                 FROM services s
                 LEFT JOIN vendors v ON s.vendor_id = v.id
                 LEFT JOIN categories c ON s.category_id = c.id
                 WHERE 1=1`;
    const params = [];

    if (category_id) { query += ' AND s.category_id = ?'; params.push(category_id); }
    if (category && !category_id) { query += ' AND LOWER(c.name) LIKE LOWER(?)'; params.push(`%${category}%`); }
    if (vendor_id) { query += ' AND s.vendor_id = ?'; params.push(vendor_id); }
    if (is_active !== undefined) { query += ' AND s.is_active = ?'; params.push(is_active === 'true' ? 1 : 0); }
    if (search) { query += ' AND (s.name LIKE ? OR s.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    query += ' ORDER BY s.name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [services] = await pool.query(query, params);

    const countQuery = `SELECT COUNT(*) as total FROM services s LEFT JOIN categories c ON s.category_id = c.id WHERE 1=1${category_id ? ' AND s.category_id = ?' : ''}${category && !category_id ? ' AND LOWER(c.name) LIKE LOWER(?)' : ''}${vendor_id ? ' AND s.vendor_id = ?' : ''}${is_active !== undefined ? ' AND s.is_active = ?' : ''}`;
    const countParams = [];
    if (category_id) countParams.push(category_id);
    else if (category) countParams.push(`%${category}%`);
    if (vendor_id) countParams.push(vendor_id);
    if (is_active !== undefined) countParams.push(is_active === 'true' ? 1 : 0);
    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: services,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, pages: Math.ceil(countResult[0].total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const [services] = await pool.query(
      `SELECT s.*, v.name as vendor_name, v.business_name, v.contact_email, v.contact_phone, c.name as category_name
       FROM services s
       LEFT JOIN vendors v ON s.vendor_id = v.id
       LEFT JOIN categories c ON s.category_id = c.id
       WHERE s.id = ?`,
      [id]
    );

    if (services.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, data: services[0] });
  } catch (error) {
    console.error('Get service by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category_id, price, duration_minutes, is_active } = req.body;

    const [existing] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const fields = [];
    const values = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (category_id !== undefined) { fields.push('category_id = ?'); values.push(category_id); }
    if (price !== undefined) { fields.push('price = ?'); values.push(price); }
    if (duration_minutes !== undefined) { fields.push('duration_minutes = ?'); values.push(duration_minutes); }
    if (is_active !== undefined) { fields.push('is_active = ?'); values.push(is_active); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    await pool.query(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);

    res.json({ success: true, message: 'Service updated successfully', data: updated[0] });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    await pool.query('DELETE FROM services WHERE id = ?', [id]);

    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { is_active = 'true' } = req.query;

    const [services] = await pool.query(
      `SELECT s.*, v.name as vendor_name, v.business_name, v.rating, c.name as category_name
       FROM services s
       LEFT JOIN vendors v ON s.vendor_id = v.id
       LEFT JOIN categories c ON s.category_id = c.id
       WHERE (s.category_id = ? OR LOWER(c.name) = LOWER(?)) AND s.is_active = ?
       ORDER BY s.name ASC`,
      [category, category, is_active === 'true' ? 1 : 0]
    );

    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const searchServices = async (req, res) => {
  try {
    const { query: searchQuery, category_id, category, min_price, max_price, vendor_id } = req.query;

    let sql = `SELECT s.*, v.name as vendor_name, v.business_name, v.rating, c.name as category_name
               FROM services s
               LEFT JOIN vendors v ON s.vendor_id = v.id
               LEFT JOIN categories c ON s.category_id = c.id
               WHERE s.is_active = 1`;
    const params = [];

    if (searchQuery) { sql += ' AND (s.name LIKE ? OR s.description LIKE ?)'; params.push(`%${searchQuery}%`, `%${searchQuery}%`); }
    if (category_id) { sql += ' AND s.category_id = ?'; params.push(category_id); }
    if (category && !category_id) { sql += ' AND LOWER(c.name) LIKE LOWER(?)'; params.push(`%${category}%`); }
    if (min_price) { sql += ' AND s.price >= ?'; params.push(parseFloat(min_price)); }
    if (max_price) { sql += ' AND s.price <= ?'; params.push(parseFloat(max_price)); }
    if (vendor_id) { sql += ' AND s.vendor_id = ?'; params.push(vendor_id); }

    sql += ' ORDER BY s.name ASC';

    const [services] = await pool.query(sql, params);

    res.json({ success: true, data: services, total: services.length });
  } catch (error) {
    console.error('Search services error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = { createService, getAllServices, getServiceById, updateService, deleteService, getServicesByCategory, searchServices };
