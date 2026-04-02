const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth, authorize } = require('../middleware/auth');
const { paymentValidation, idParamValidation } = require('../middleware/validation');

router.post('/', auth, paymentValidation, paymentController.createPayment);
router.get('/', auth, authorize('admin'), paymentController.getAllPayments);
router.get('/user/:userId', auth, paymentController.getPaymentsByUser);
router.get('/booking/:bookingId', auth, paymentController.getPaymentsByBooking);
router.get('/:id', auth, idParamValidation, paymentController.getPaymentById);
router.get('/:id/invoice', auth, idParamValidation, paymentController.generateInvoice);
router.put('/:id/status', auth, authorize('admin'), idParamValidation, paymentController.updatePaymentStatus);

module.exports = router;