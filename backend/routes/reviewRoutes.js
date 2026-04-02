const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, reviewController.createReview);
router.get('/', auth, authorize('admin'), reviewController.getAllReviews);
router.get('/vendor/:vendorId', reviewController.getReviewsByVendor);
router.get('/user/:userId', auth, reviewController.getUserReviews);
router.get('/vendor/:vendorId/average', reviewController.calculateAverageRating);
router.get('/:id', auth, reviewController.getReviewById);
router.put('/:id', auth, reviewController.updateReview);
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;