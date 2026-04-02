const { pool } = require('../config/database');

exports.generateQRCode = async (req, res) => {
  try {
    const { event_id, guest_id } = req.body;
    if (!event_id || !guest_id) return res.status(400).json({ success: false, message: 'Event ID and guest ID are required' });
    const qrCode = `QR-${event_id}-${guest_id}-${Date.now()}`;
    const [existing] = await pool.query('SELECT id FROM attendance_records WHERE event_id = ? AND guest_id = ?', [event_id, guest_id]);
    if (existing.length > 0) {
      await pool.query('UPDATE attendance_records SET qr_code = ? WHERE event_id = ? AND guest_id = ?', [qrCode, event_id, guest_id]);
      return res.json({ success: true, data: { qr_code: qrCode } });
    }
    const [result] = await pool.query('INSERT INTO attendance_records (event_id, guest_id, qr_code) VALUES (?, ?, ?)', [event_id, guest_id, qrCode]);
    res.status(201).json({ success: true, data: { id: result.insertId, qr_code: qrCode } });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const { qr_code } = req.body;
    if (!qr_code) return res.status(400).json({ success: false, message: 'QR code is required' });
    const [records] = await pool.query('SELECT * FROM attendance_records WHERE qr_code = ?', [qr_code]);
    if (records.length === 0) return res.status(404).json({ success: false, message: 'Invalid QR code' });
    const record = records[0];
    if (record.check_in_time) return res.json({ success: true, message: 'Already checked in', data: { check_in_time: record.check_in_time } });
    await pool.query('UPDATE attendance_records SET check_in_time = NOW() WHERE id = ?', [record.id]);
    await pool.query('UPDATE guests SET rsvp_status = ? WHERE id = ?', ['accepted', record.guest_id]);
    const [updated] = await pool.query('SELECT * FROM attendance_records WHERE id = ?', [record.id]);
    res.json({ success: true, message: 'Check-in successful', data: updated[0] });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { qr_code } = req.body;
    if (!qr_code) return res.status(400).json({ success: false, message: 'QR code is required' });
    const [records] = await pool.query('SELECT * FROM attendance_records WHERE qr_code = ?', [qr_code]);
    if (records.length === 0) return res.status(404).json({ success: false, message: 'Invalid QR code' });
    const record = records[0];
    if (!record.check_in_time) return res.status(400).json({ success: false, message: 'Guest has not checked in yet' });
    await pool.query('UPDATE attendance_records SET check_out_time = NOW() WHERE id = ?', [record.id]);
    const [updated] = await pool.query('SELECT * FROM attendance_records WHERE id = ?', [record.id]);
    res.json({ success: true, message: 'Check-out successful', data: updated[0] });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.getAttendanceByEvent = async (req, res) => {
  try {
    const [records] = await pool.query(
      `SELECT a.*, g.name as guest_name, g.email as guest_email FROM attendance_records a
       LEFT JOIN guests g ON a.guest_id = g.id WHERE a.event_id = ? ORDER BY a.check_in_time DESC`,
      [req.params.eventId]
    );
    const total = records.length;
    const checkedIn = records.filter(r => r.check_in_time).length;
    const checkedOut = records.filter(r => r.check_out_time).length;
    res.json({ success: true, data: records, stats: { total, checked_in: checkedIn, checked_out: checkedOut, not_arrived: total - checkedIn } });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.generateAllQRCodes = async (req, res) => {
  try {
    const { event_id } = req.params;
    const [guests] = await pool.query('SELECT id FROM guests WHERE event_id = ?', [event_id]);
    const qrCodes = [];
    for (const guest of guests) {
      const qrCode = `QR-${event_id}-${guest.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const [existing] = await pool.query('SELECT id FROM attendance_records WHERE event_id = ? AND guest_id = ?', [event_id, guest.id]);
      if (existing.length > 0) {
        await pool.query('UPDATE attendance_records SET qr_code = ? WHERE event_id = ? AND guest_id = ?', [qrCode, event_id, guest.id]);
      } else {
        await pool.query('INSERT INTO attendance_records (event_id, guest_id, qr_code) VALUES (?, ?, ?)', [event_id, guest.id, qrCode]);
      }
      qrCodes.push({ guest_id: guest.id, qr_code: qrCode });
    }
    res.json({ success: true, data: qrCodes, total: qrCodes.length });
  } catch (error) {
    console.error('Generate all QR codes error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
