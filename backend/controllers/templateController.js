const { pool } = require('../config/database');

exports.createTemplate = async (req, res) => {
  try {
    const { name, description, category_id, default_guest_count, default_budget, included_services } = req.body;
    const [result] = await pool.query(
      `INSERT INTO event_templates (name, description, category_id, default_guest_count, default_budget, included_services)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, category_id, default_guest_count, default_budget, included_services ? JSON.stringify(included_services) : null]
    );
    res.status(201).json({ success: true, message: 'Template created successfully', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.getAllTemplates = async (req, res) => {
  try {
    const { category_id } = req.query;
    let query = `SELECT t.*, c.name as category_name FROM event_templates t LEFT JOIN categories c ON t.category_id = c.id WHERE 1=1`;
    const params = [];
    if (category_id) { query += ' AND t.category_id = ?'; params.push(category_id); }
    query += ' ORDER BY t.name ASC';
    const [templates] = await pool.query(query, params);
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.getTemplateById = async (req, res) => {
  try {
    const [templates] = await pool.query(
      `SELECT t.*, c.name as category_name FROM event_templates t LEFT JOIN categories c ON t.category_id = c.id WHERE t.id = ?`,
      [req.params.id]
    );
    if (templates.length === 0) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, data: templates[0] });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const { name, description, category_id, default_guest_count, default_budget, included_services } = req.body;
    const [result] = await pool.query(
      `UPDATE event_templates SET name=?, description=?, category_id=?, default_guest_count=?, default_budget=?, included_services=? WHERE id=?`,
      [name, description, category_id, default_guest_count, default_budget, included_services ? JSON.stringify(included_services) : null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, message: 'Template updated successfully' });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM event_templates WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
