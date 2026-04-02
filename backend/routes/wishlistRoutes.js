const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { auth } = require('../middleware/auth');

router.get('/event/:eventId', auth, wishlistController.getWishlistByEvent);
router.post('/', auth, wishlistController.createWishlistItem);
router.post('/:id/claim', auth, wishlistController.claimWishlistItem);
router.delete('/:id', auth, wishlistController.deleteWishlistItem);

module.exports = router;