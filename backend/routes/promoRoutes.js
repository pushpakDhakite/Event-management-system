const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promoController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, promoController.getAllActivePromoCodes);
router.get('/my', auth, authorize('vendor'), promoController.getPromoCodes);
router.post('/', auth, authorize('vendor'), promoController.createPromoCode);
router.get('/validate/:code', promoController.validatePromoCode);
router.post('/:code/use', auth, promoController.usePromoCode);

module.exports = router;