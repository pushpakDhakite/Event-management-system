const { pool } = require('../config/database');

const createGuest = async (req, res) => {
  try {
    const { event_id, name, email, phone, rsvp_status = 'pending', dietary_requirements, plus_one = false } = req.body;

    if (!event_id || !name) {
      return res.status(400).json({ success: false, message: 'Event ID and guest name are required' });
    }

    const [eventExists] = await pool.query('SELECT id FROM events WHERE id = ?', [event_id]);
    if (eventExists.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const [result] = await pool.query(
      'INSERT INTO guests (event_id, name, email, phone, rsvp_status, dietary_requirements, plus_one) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [event_id, name, email || null, phone || null, rsvp_status, dietary_requirements || null, plus_one]
    );

    const [guest] = await pool.query('SELECT * FROM guests WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, message: 'Guest added successfully', data: guest[0] });
  } catch (error) {
    console.error('Create guest error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getAllGuests = async (req, res) => {
  try {
    const { page = 1, limit = 10, event_id, rsvp_status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT g.*, e.name as event_name
                 FROM guests g
                 LEFT JOIN events e ON g.event_id = e.id
                 WHERE 1=1`;
    const params = [];

    if (event_id) { query += ' AND g.event_id = ?'; params.push(event_id); }
    if (rsvp_status) { query += ' AND g.rsvp_status = ?'; params.push(rsvp_status); }

    query += ' ORDER BY g.name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [guests] = await pool.query(query, params);

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM guests WHERE 1=1${event_id ? ' AND event_id = ?' : ''}${rsvp_status ? ' AND rsvp_status = ?' : ''}`,
      event_id && rsvp_status ? [event_id, rsvp_status] : event_id ? [event_id] : rsvp_status ? [rsvp_status] : []
    );

    res.json({
      success: true,
      data: guests,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, pages: Math.ceil(countResult[0].total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get all guests error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getGuestById = async (req, res) => {
  try {
    const { id } = req.params;

    const [guests] = await pool.query(
      `SELECT g.*, e.name as event_name
       FROM guests g
       LEFT JOIN events e ON g.event_id = e.id
       WHERE g.id = ?`,
      [id]
    );

    if (guests.length === 0) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    res.json({ success: true, data: guests[0] });
  } catch (error) {
    console.error('Get guest by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const updateGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, rsvp_status, dietary_requirements, plus_one } = req.body;

    const [existing] = await pool.query('SELECT * FROM guests WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    const fields = [];
    const values = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
    if (rsvp_status !== undefined) { fields.push('rsvp_status = ?'); values.push(rsvp_status); }
    if (dietary_requirements !== undefined) { fields.push('dietary_requirements = ?'); values.push(dietary_requirements); }
    if (plus_one !== undefined) { fields.push('plus_one = ?'); values.push(plus_one); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    await pool.query(`UPDATE guests SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query('SELECT * FROM guests WHERE id = ?', [id]);

    res.json({ success: true, message: 'Guest updated successfully', data: updated[0] });
  } catch (error) {
    console.error('Update guest error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const deleteGuest = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM guests WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    await pool.query('DELETE FROM guests WHERE id = ?', [id]);

    res.json({ success: true, message: 'Guest deleted successfully' });
  } catch (error) {
    console.error('Delete guest error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getGuestsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rsvp_status, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT g.* FROM guests g WHERE g.event_id = ?`;
    const params = [eventId];

    if (rsvp_status) { query += ' AND g.rsvp_status = ?'; params.push(rsvp_status); }

    query += ' ORDER BY g.name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [guests] = await pool.query(query, params);

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM guests WHERE event_id = ?${rsvp_status ? ' AND rsvp_status = ?' : ''}`,
      rsvp_status ? [eventId, rsvp_status] : [eventId]
    );

    res.json({
      success: true,
      data: guests,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, pages: Math.ceil(countResult[0].total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get guests by event error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const updateGuestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { rsvp_status } = req.body;

    if (!rsvp_status) {
      return res.status(400).json({ success: false, message: 'RSVP status is required' });
    }

    const validStatuses = ['pending', 'accepted', 'declined', 'maybe'];
    if (!validStatuses.includes(rsvp_status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const [existing] = await pool.query('SELECT * FROM guests WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    await pool.query('UPDATE guests SET rsvp_status = ?, updated_at = NOW() WHERE id = ?', [rsvp_status, id]);

    const [updated] = await pool.query('SELECT * FROM guests WHERE id = ?', [id]);

    res.json({ success: true, message: 'Guest status updated successfully', data: updated[0] });
  } catch (error) {
    console.error('Update guest status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const bulkInvite = async (req, res) => {
  try {
    const { event_id, guests } = req.body;

    if (!event_id || !Array.isArray(guests) || guests.length === 0) {
      return res.status(400).json({ success: false, message: 'Event ID and guests array are required' });
    }

    const [eventExists] = await pool.query('SELECT id FROM events WHERE id = ?', [event_id]);
    if (eventExists.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const values = [];
    const placeholders = [];

    for (const guest of guests) {
      if (!guest.name) {
        continue;
      }
      placeholders.push('(?, ?, ?, ?, ?, ?, ?)');
      values.push(
        event_id,
        guest.name,
        guest.email || null,
        guest.phone || null,
        guest.rsvp_status || 'pending',
        guest.dietary_requirements || null,
        guest.plus_one || 0
      );
    }

    if (placeholders.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid guests to add' });
    }

    const query = `INSERT INTO guests (event_id, name, email, phone, rsvp_status, dietary_requirements, plus_one) VALUES ${placeholders.join(', ')}`;
    const [result] = await pool.query(query, values);

    const insertedCount = result.affectedRows;

    res.status(201).json({
      success: true,
      message: `${insertedCount} guests invited successfully`,
      data: { inserted: insertedCount, total: guests.length }
    });
  } catch (error) {
    console.error('Bulk invite error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = { createGuest, getAllGuests, getGuestById, updateGuest, deleteGuest, getGuestsByEvent, updateGuestStatus, bulkInvite };
