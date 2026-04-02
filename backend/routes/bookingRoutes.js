const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { auth, authorize } = require('../middleware/auth');
const { bookingValidation, idParamValidation } = require('../middleware/validation');

router.post('/', auth, bookingValidation, bookingController.createBooking);
router.get('/', auth, authorize('admin', 'vendor'), bookingController.getAllBookings);
router.get('/event/:eventId', auth, bookingController.getBookingsByEvent);
router.get('/vendor/:vendorId', auth, authorize('vendor', 'admin'), bookingController.getBookingsByVendor);
router.get('/:id', auth, idParamValidation, bookingController.getBookingById);
router.put('/:id', auth, idParamValidation, bookingController.updateBooking);
router.put('/:id/status', auth, bookingController.updateBookingStatus);
router.delete('/:id', auth, idParamValidation, bookingController.deleteBooking);

module.exports = router;