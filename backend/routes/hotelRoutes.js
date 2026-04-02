const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', hotelController.getAllHotels);
router.get('/:id', hotelController.getHotelById);
router.post('/', auth, authorize('vendor', 'admin'), hotelController.createHotel);
router.put('/:id', auth, authorize('vendor', 'admin'), hotelController.updateHotel);
router.delete('/:id', auth, authorize('vendor', 'admin'), hotelController.deleteHotel);

module.exports = router;