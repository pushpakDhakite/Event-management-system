const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { auth, authorize } = require('../middleware/auth');
const { eventValidation, idParamValidation } = require('../middleware/validation');

router.post('/', auth, eventValidation, eventController.createEvent);
router.get('/', auth, eventController.getAllEvents);
router.get('/my', auth, eventController.getEventsByOrganizer);
router.get('/category/:category', auth, eventController.getEventsByCategory);
router.get('/:id', auth, idParamValidation, eventController.getEventById);
router.put('/:id', auth, idParamValidation, eventController.updateEvent);
router.delete('/:id', auth, idParamValidation, eventController.deleteEvent);

module.exports = router;