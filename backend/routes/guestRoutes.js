const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, guestController.createGuest);
router.post('/bulk', auth, guestController.bulkInvite);
router.get('/', auth, authorize('admin'), guestController.getAllGuests);
router.get('/event/:eventId', auth, guestController.getGuestsByEvent);
router.get('/:id', auth, guestController.getGuestById);
router.put('/:id', auth, guestController.updateGuest);
router.put('/:id/status', auth, guestController.updateGuestStatus);
router.delete('/:id', auth, guestController.deleteGuest);

module.exports = router;