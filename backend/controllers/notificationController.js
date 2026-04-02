const { pool } = require('../config/database');

const createNotification = async (req, res) => {
  try {
    const { user_id, title, message, type = 'info', reference_id, reference_type } = req.body;

    if (!user_id || !title || !message) {
      return res.status(400).json({ success: false, message: 'User ID, title and message are required' });
    }

    const validTypes = ['info', 'success', 'warning', 'error', 'booking', 'payment', 'event', 'reminder'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }

    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, title, message, type, reference_id || null, reference_type || null]
    );

    const [notification] = await pool.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, message: 'Notification created successfully', data: notification[0] });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getNotificationsByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { page = 1, limit = 20, is_read, type } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];

    if (is_read !== undefined) { query += ' AND is_read = ?'; params.push(is_read === 'true' ? 1 : 0); }
    if (type) { query += ' AND type = ?'; params.push(type); }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [notifications] = await pool.query(query, params);

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM notifications WHERE user_id = ?${is_read !== undefined ? ' AND is_read = ?' : ''}${type ? ' AND type = ?' : ''}`,
      is_read !== undefined && type ? [userId, is_read === 'true' ? 1 : 0, type] : is_read !== undefined ? [userId, is_read === 'true' ? 1 : 0] : type ? [userId, type] : [userId]
    );

    const [unreadCount] = await pool.query(
      'SELECT COUNT(*) as total FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    res.json({
      success: true,
      data: notifications,
      unread_count: unreadCount[0].total,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, pages: Math.ceil(countResult[0].total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get notifications by user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM notifications WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (existing[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this notification' });
    }

    await pool.query('UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ?', [id]);

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const [result] = await pool.query(
      'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    res.json({ success: true, message: `${result.affectedRows} notifications marked as read`, data: { updated: result.affectedRows } });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM notifications WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (existing[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this notification' });
    }

    await pool.query('DELETE FROM notifications WHERE id = ?', [id]);

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const createBulkNotifications = async (req, res) => {
  try {
    const { user_ids, title, message, type = 'info', reference_id, reference_type } = req.body;

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'User IDs array is required' });
    }

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const values = [];
    const placeholders = [];

    for (const userId of user_ids) {
      placeholders.push('(?, ?, ?, ?, ?, ?)');
      values.push(userId, title, message, type, reference_id || null, reference_type || null);
    }

    const query = `INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type) VALUES ${placeholders.join(', ')}`;
    const [result] = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: `${result.affectedRows} notifications created successfully`,
      data: { created: result.affectedRows }
    });
  } catch (error) {
    console.error('Create bulk notifications error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const [notifications] = await pool.query('SELECT * FROM notifications WHERE id = ?', [id]);

    if (notifications.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const notification = notifications[0];

    if (notification.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this notification' });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Get notification by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = { createNotification, getNotificationsByUser, markAsRead, markAllAsRead, deleteNotification, createBulkNotifications, getNotificationById };
