const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { auth } = require('../middleware/auth');

router.post('/generate', auth, attendanceController.generateQRCode);
router.post('/check-in', auth, attendanceController.checkIn);
router.post('/check-out', auth, attendanceController.checkOut);
router.get('/event/:eventId', auth, attendanceController.getAttendanceByEvent);
router.post('/generate-all/:event_id', auth, attendanceController.generateAllQRCodes);

module.exports = router;