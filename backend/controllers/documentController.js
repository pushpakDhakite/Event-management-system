const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

exports.upload = upload.single('file');

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { event_id, description } = req.body;
    if (!event_id) return res.status(400).json({ success: false, message: 'Event ID is required' });

    const [result] = await pool.query(
      `INSERT INTO documents (event_id, user_id, filename, original_name, file_path, file_type, file_size, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [event_id, req.user.id, req.file.filename, req.file.originalname, req.file.path, req.file.mimetype, req.file.size, description || null]
    );

    const [doc] = await pool.query('SELECT * FROM documents WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Document uploaded successfully', data: doc[0] });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.getDocumentsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const [docs] = await pool.query(
      `SELECT d.*, u.name as uploaded_by_name FROM documents d LEFT JOIN users u ON d.user_id = u.id WHERE d.event_id = ? ORDER BY d.created_at DESC`,
      [eventId]
    );
    res.json({ success: true, data: docs });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const [docs] = await pool.query('SELECT * FROM documents WHERE id = ?', [id]);
    if (docs.length === 0) return res.status(404).json({ success: false, message: 'Document not found' });

    const doc = docs[0];
    if (fs.existsSync(doc.file_path)) fs.unlinkSync(doc.file_path);
    await pool.query('DELETE FROM documents WHERE id = ?', [id]);
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
