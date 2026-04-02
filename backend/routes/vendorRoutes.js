const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { auth, authorize } = require('../middleware/auth');
const { vendorValidation, idParamValidation } = require('../middleware/validation');

router.get('/', vendorController.getAllVendors);
router.get('/category/:category', vendorController.getVendorsByCategory);
router.get('/:id/services', vendorController.getVendorServices);
router.get('/:id', vendorController.getVendorById);
router.post('/', auth, vendorValidation, vendorController.createVendor);
router.put('/', auth, vendorController.updateVendor);
router.delete('/', auth, vendorController.deleteVendor);

module.exports = router;