const { pool } = require('../config/database');

const createEvent = async (req, res) => {
  try {
    const { name, description, event_type, event_date, start_time, end_time, venue, category_id, guest_count, budget, status = 'draft' } = req.body;
    const organizerId = req.user.id;

    if (!name || !event_date) {
      return res.status(400).json({ success: false, message: 'Event name and date are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO events (name, description, event_type, event_date, start_time, end_time, venue, category_id, guest_count, budget, status, organizer_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, event_type || null, event_date, start_time || null, end_time || null, venue || null, category_id || null, guest_count || null, budget || null, status, organizerId]
    );

    const [event] = await pool.query('SELECT * FROM events WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, message: 'Event created successfully', data: event[0] });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category_id, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT e.*, u.name as organizer_name, c.name as category_name
                 FROM events e
                 LEFT JOIN users u ON e.organizer_id = u.id
                 LEFT JOIN categories c ON e.category_id = c.id
                 WHERE 1=1`;
    const params = [];

    if (status) { query += ' AND e.status = ?'; params.push(status); }
    if (category_id) { query += ' AND e.category_id = ?'; params.push(category_id); }
    if (search) { query += ' AND (e.name LIKE ? OR e.description LIKE ? OR e.venue LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    query += ' ORDER BY e.event_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [events] = await pool.query(query, params);

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM events WHERE 1=1${status ? ' AND status = ?' : ''}${category_id ? ' AND category_id = ?' : ''}`,
      status && category_id ? [status, category_id] : status ? [status] : category_id ? [category_id] : []
    );

    res.json({
      success: true,
      data: events,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, pages: Math.ceil(countResult[0].total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const [events] = await pool.query(
      `SELECT e.*, u.name as organizer_name, c.name as category_name
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE e.id = ?`,
      [id]
    );

    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, data: events[0] });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, event_type, event_date, start_time, end_time, venue, category_id, guest_count, budget, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (req.user.role !== 'admin' && existing[0].organizer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }

    const fields = [];
    const values = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (event_type !== undefined) { fields.push('event_type = ?'); values.push(event_type); }
    if (event_date !== undefined) { fields.push('event_date = ?'); values.push(event_date); }
    if (start_time !== undefined) { fields.push('start_time = ?'); values.push(start_time); }
    if (end_time !== undefined) { fields.push('end_time = ?'); values.push(end_time); }
    if (venue !== undefined) { fields.push('venue = ?'); values.push(venue); }
    if (category_id !== undefined) { fields.push('category_id = ?'); values.push(category_id); }
    if (guest_count !== undefined) { fields.push('guest_count = ?'); values.push(guest_count); }
    if (budget !== undefined) { fields.push('budget = ?'); values.push(budget); }
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    await pool.query(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);

    res.json({ success: true, message: 'Event updated successfully', data: updated[0] });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (req.user.role !== 'admin' && existing[0].organizer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await pool.query('DELETE FROM events WHERE id = ?', [id]);

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getEventsByOrganizer = async (req, res) => {
  try {
    const organizerId = req.params.organizerId || req.user.id;
    const { status } = req.query;

    let query = `SELECT e.*, c.name as category_name
                 FROM events e
                 LEFT JOIN categories c ON e.category_id = c.id
                 WHERE e.organizer_id = ?`;
    const params = [organizerId];

    if (status) { query += ' AND e.status = ?'; params.push(status); }

    query += ' ORDER BY e.event_date DESC';

    const [events] = await pool.query(query, params);

    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Get events by organizer error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getEventsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT e.*, u.name as organizer_name
                 FROM events e
                 LEFT JOIN users u ON e.organizer_id = u.id
                 WHERE e.category_id = ?`;
    const params = [categoryId];

    if (status) { query += ' AND e.status = ?'; params.push(status); }

    query += ' ORDER BY e.event_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [events] = await pool.query(query, params);

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM events WHERE category_id = ?', [categoryId]);

    res.json({
      success: true,
      data: events,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, pages: Math.ceil(countResult[0].total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get events by category error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, getEventsByOrganizer, getEventsByCategory };
