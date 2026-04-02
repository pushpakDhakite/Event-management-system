const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.post('/', auth, authorize('vendor', 'admin'), restaurantController.createRestaurant);
router.put('/:id', auth, authorize('vendor', 'admin'), restaurantController.updateRestaurant);
router.delete('/:id', auth, authorize('vendor', 'admin'), restaurantController.deleteRestaurant);

module.exports = router;