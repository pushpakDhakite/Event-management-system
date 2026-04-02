const { pool } = require('../config/database');

exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, event_id, message } = req.body;
    if (!receiver_id || !message) return res.status(400).json({ success: false, message: 'Receiver ID and message are required' });

    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, event_id, message) VALUES (?, ?, ?, ?)',
      [req.user.id, receiver_id, event_id || null, message]
    );

    const [msg] = await pool.query(
      `SELECT m.*, u.name as sender_name, e.name as event_name FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id LEFT JOIN events e ON m.event_id = e.id WHERE m.id = ?`,
      [result.insertId]
    );
    res.status(201).json({ success: true, data: msg[0] });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const [conversations] = await pool.query(
      `SELECT DISTINCT
         CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as contact_id,
         u.name as contact_name, u.avatar as contact_avatar,
         (SELECT message FROM messages WHERE (sender_id = ? AND receiver_id = contact_id) OR (sender_id = contact_id AND receiver_id = ?) ORDER BY created_at DESC LIMIT 1) as last_message,
         (SELECT created_at FROM messages WHERE (sender_id = ? AND receiver_id = contact_id) OR (sender_id = contact_id AND receiver_id = ?) ORDER BY created_at DESC LIMIT 1) as last_message_time,
         (SELECT COUNT(*) FROM messages WHERE sender_id = contact_id AND receiver_id = ? AND is_read = 0) as unread_count
       FROM messages m
       JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
       WHERE m.sender_id = ? OR m.receiver_id = ?
       ORDER BY last_message_time DESC`,
      [userId, userId, userId, userId, userId, userId, userId, userId, userId]
    );
    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user.id;
    const [messages] = await pool.query(
      `SELECT m.*, u.name as sender_name FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [userId, contactId, contactId, userId]
    );
    await pool.query('UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0', [contactId, userId]);
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.getEventMessages = async (req, res) => {
  try {
    const { eventId } = req.params;
    const [messages] = await pool.query(
      `SELECT m.*, u.name as sender_name FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.event_id = ? ORDER BY m.created_at ASC`,
      [eventId]
    );
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get event messages error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
