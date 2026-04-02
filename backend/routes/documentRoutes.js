const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { auth } = require('../middleware/auth');

router.post('/upload', auth, documentController.upload, documentController.uploadDocument);
router.get('/event/:eventId', auth, documentController.getDocumentsByEvent);
router.delete('/:id', auth, documentController.deleteDocument);

module.exports = router;