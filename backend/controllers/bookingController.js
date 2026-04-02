const { pool } = require('../config/database');

const createBooking = async (req, res) => {
  try {
    const { event_id, service_id, vendor_id, booking_date, start_time, end_time, quantity, total_price, notes, status = 'pending' } = req.body;
    const userId = req.user.id;

    if (!event_id || !service_id) {
      return res.status(400).json({ success: false, message: 'Event ID and service ID are required' });
    }

    const [eventExists] = await pool.query('SELECT id FROM events WHERE id = ?', [event_id]);
    if (eventExists.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const [serviceExists] = await pool.query('SELECT * FROM services WHERE id = ?', [service_id]);
    if (serviceExists.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const calculatedPrice = serviceExists[0].price ? serviceExists[0].price * (quantity || 1) : total_price || 0;

    const [result] = await pool.query(
      `INSERT INTO bookings (event_id, service_id, vendor_id, user_id, booking_date, start_time, end_time, quantity, total_price, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [event_id, service_id, vendor_id || serviceExists[0].vendor_id, userId, booking_date || null, start_time || null, end_time || null, quantity || 1, calculatedPrice, notes || null, status]
    );

    const [booking] = await pool.query(
      `SELECT b.*, e.name as event_name, s.name as service_name, v.business_name as vendor_name
       FROM bookings b
       LEFT JOIN events e ON b.event_id = e.id
       LEFT JOIN services s ON b.service_id = s.id
       LEFT JOIN vendors v ON b.vendor_id = v.id
       WHERE b.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, message: 'Booking created successfully', data: booking[0] });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, event_id } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT b.*, e.name as event_name, s.name as service_name, v.business_name as vendor_name, u.name as user_name
                 FROM bookings b
                 LEFT JOIN events e ON b.event_id = e.id
                 LEFT JOIN services s ON b.service_id = s.id
                 LEFT JOIN vendors v ON b.vendor_id = v.id
                 LEFT JOIN users u ON b.user_id = u.id
                 WHERE 1=1`;
    const params = [];

    if (status) { query += ' AND b.status = ?'; params.push(status); }
    if (event_id) { query += ' AND b.event_id = ?'; params.push(event_id); }

    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [bookings] = await pool.query(query, params);

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM bookings WHERE 1=1', []);

    res.json({
      success: true,
      data: bookings,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, pages: Math.ceil(countResult[0].total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const [bookings] = await pool.query(
      `SELECT b.*, e.name as event_name, s.name as service_name, v.business_name as vendor_name, u.name as user_name
       FROM bookings b
       LEFT JOIN events e ON b.event_id = e.id
       LEFT JOIN services s ON b.service_id = s.id
       LEFT JOIN vendors v ON b.vendor_id = v.id
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, data: bookings[0] });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { booking_date, start_time, end_time, quantity, total_price, notes, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const fields = [];
    const values = [];

    if (booking_date !== undefined) { fields.push('booking_date = ?'); values.push(booking_date); }
    if (start_time !== undefined) { fields.push('start_time = ?'); values.push(start_time); }
    if (end_time !== undefined) { fields.push('end_time = ?'); values.push(end_time); }
    if (quantity !== undefined) { fields.push('quantity = ?'); values.push(quantity); }
    if (total_price !== undefined) { fields.push('total_price = ?'); values.push(total_price); }
    if (notes !== undefined) { fields.push('notes = ?'); values.push(notes); }
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    await pool.query(`UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);

    res.json({ success: true, message: 'Booking updated successfully', data: updated[0] });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await pool.query('DELETE FROM bookings WHERE id = ?', [id]);

    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getBookingsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.query;

    let query = `SELECT b.*, s.name as service_name, v.business_name as vendor_name
                 FROM bookings b
                 LEFT JOIN services s ON b.service_id = s.id
                 LEFT JOIN vendors v ON b.vendor_id = v.id
                 WHERE b.event_id = ?`;
    const params = [eventId];

    if (status) { query += ' AND b.status = ?'; params.push(status); }

    query += ' ORDER BY b.created_at DESC';

    const [bookings] = await pool.query(query, params);

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Get bookings by event error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getBookingsByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT b.*, e.name as event_name, s.name as service_name, u.name as user_name
                 FROM bookings b
                 LEFT JOIN events e ON b.event_id = e.id
                 LEFT JOIN services s ON b.service_id = s.id
                 LEFT JOIN users u ON b.user_id = u.id
                 WHERE b.vendor_id = ?`;
    const params = [vendorId];

    if (status) { query += ' AND b.status = ?'; params.push(status); }

    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [bookings] = await pool.query(query, params);

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM bookings WHERE vendor_id = ?', [vendorId]);

    res.json({
      success: true,
      data: bookings,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, pages: Math.ceil(countResult[0].total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get bookings by vendor error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const [existing] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await pool.query('UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);

    const [updated] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);

    res.json({ success: true, message: 'Booking status updated successfully', data: updated[0] });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = { createBooking, getAllBookings, getBookingById, updateBooking, deleteBooking, getBookingsByEvent, getBookingsByVendor, updateBookingStatus };
