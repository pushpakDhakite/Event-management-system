const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

router.post('/send', auth, messageController.sendMessage);
router.get('/conversations', auth, messageController.getConversations);
router.get('/event/:eventId', auth, messageController.getEventMessages);
router.get('/contact/:contactId', auth, messageController.getMessages);

module.exports = router;