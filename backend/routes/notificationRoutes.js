const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('admin'), notificationController.createNotification);
router.post('/bulk', auth, authorize('admin'), notificationController.createBulkNotifications);
router.get('/user/:userId', auth, notificationController.getNotificationsByUser);
router.get('/:id', auth, notificationController.getNotificationById);
router.put('/:id/read', auth, notificationController.markAsRead);
router.put('/user/:userId/read-all', auth, notificationController.markAllAsRead);
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;