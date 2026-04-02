const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { auth, authorize } = require('../middleware/auth');
const { serviceValidation, idParamValidation } = require('../middleware/validation');

router.get('/', serviceController.getAllServices);
router.get('/search', serviceController.searchServices);
router.get('/category/:category', serviceController.getServicesByCategory);
router.get('/:id', serviceController.getServiceById);
router.post('/', auth, authorize('vendor', 'admin'), serviceValidation, serviceController.createService);
router.put('/:id', auth, authorize('vendor', 'admin'), idParamValidation, serviceController.updateService);
router.delete('/:id', auth, authorize('vendor', 'admin'), idParamValidation, serviceController.deleteService);

module.exports = router;