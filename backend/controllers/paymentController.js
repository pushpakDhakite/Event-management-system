const { pool } = require('../config/database');

const generateInvoiceNumber = async () => {
  const [result] = await pool.query('SELECT COUNT(*) as count FROM payments');
  const count = result[0].count + 1;
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `INV-${year}${month}-${String(count).padStart(5, '0')}`;
};

const createPayment = async (req, res) => {
  try {
    const { booking_id, amount, payment_method, description } = req.body;
    const userId = req.user.id;

    if (!booking_id || !amount) {
      return res.status(400).json({ success: false, message: 'Booking ID and amount are required' });
    }

    const [booking] = await pool.query('SELECT * FROM bookings WHERE id = ?', [booking_id]);
    if (booking.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const invoiceNumber = await generateInvoiceNumber();

    const [result] = await pool.query(
      `INSERT INTO payments (booking_id, user_id, invoice_number, amount, payment_method, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [booking_id, userId, invoiceNumber, amount, payment_method || 'credit_card', description || null, 'completed']
    );

    const [payment] = await pool.query(
      `SELECT p.*, b.id as booking_id, e.name as event_name
       FROM payments p
       LEFT JOIN bookings b ON p.booking_id = b.id
       LEFT JOIN events e ON b.event_id = e.id
       WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, message: 'Payment processed successfully', data: payment[0] });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, payment_method } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT p.*, u.name as user_name, b.id as booking_id, e.name as event_name
                 FROM payments p
                 LEFT JOIN users u ON p.user_id = u.id
                 LEFT JOIN bookings b ON p.booking_id = b.id
                 LEFT JOIN events e ON b.event_id = e.id
                 WHERE 1=1`;
    const params = [];

    if (status) { query += ' AND p.status = ?'; params.push(status); }
    if (payment_method) { query += ' AND p.payment_method = ?'; params.push(payment_method); }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [payments] = await pool.query(query, params);

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM payments WHERE 1=1', []);

    res.json({
      success: true,
      data: payments,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, pages: Math.ceil(countResult[0].total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [payments] = await pool.query(
      `SELECT p.*, u.name as user_name, u.email as user_email, b.id as booking_id, e.name as event_name, s.name as service_name, v.business_name as vendor_name
       FROM payments p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN bookings b ON p.booking_id = b.id
       LEFT JOIN events e ON b.event_id = e.id
       LEFT JOIN services s ON b.service_id = s.id
       LEFT JOIN vendors v ON b.vendor_id = v.id
       WHERE p.id = ?`,
      [id]
    );

    if (payments.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({ success: true, data: payments[0] });
  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getPaymentsByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [payments] = await pool.query(
      `SELECT p.*, e.name as event_name, s.name as service_name, v.business_name as vendor_name
       FROM payments p
       LEFT JOIN bookings b ON p.booking_id = b.id
       LEFT JOIN events e ON b.event_id = e.id
       LEFT JOIN services s ON b.service_id = s.id
       LEFT JOIN vendors v ON b.vendor_id = v.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), offset]
    );

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM payments WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      data: payments,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, pages: Math.ceil(countResult[0].total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get payments by user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getPaymentsByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const [payments] = await pool.query(
      'SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC',
      [bookingId]
    );

    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Get payments by booking error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const [existing] = await pool.query('SELECT * FROM payments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    await pool.query('UPDATE payments SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);

    const [updated] = await pool.query('SELECT * FROM payments WHERE id = ?', [id]);

    res.json({ success: true, message: 'Payment status updated successfully', data: updated[0] });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const generateInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const [payments] = await pool.query(
      `SELECT p.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
              b.id as booking_id, e.name as event_name, e.event_date, e.venue,
              s.name as service_name, v.business_name as vendor_name, v.name as vendor_contact, v.email as vendor_email
       FROM payments p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN bookings b ON p.booking_id = b.id
       LEFT JOIN events e ON b.event_id = e.id
       LEFT JOIN services s ON b.service_id = s.id
       LEFT JOIN vendors v ON b.vendor_id = v.id
       WHERE p.id = ?`,
      [id]
    );

    if (payments.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const payment = payments[0];

    const invoice = {
      invoice_number: payment.invoice_number,
      date: payment.created_at,
      customer: {
        name: payment.user_name,
        email: payment.user_email,
        phone: payment.user_phone
      },
      event: {
        name: payment.event_name,
        date: payment.event_date,
        venue: payment.venue
      },
      vendor: {
        business_name: payment.vendor_name,
        contact: payment.vendor_contact,
        email: payment.vendor_email
      },
      service: payment.service_name,
      amount: payment.amount,
      payment_method: payment.payment_method,
      status: payment.status,
      description: payment.description
    };

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = { createPayment, getAllPayments, getPaymentById, getPaymentsByUser, getPaymentsByBooking, updatePaymentStatus, generateInvoice, generateInvoiceNumber };
