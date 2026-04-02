const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.use(authorize('admin'));

router.get('/users', adminController.getAllUsers);
router.get('/vendors', adminController.getAllVendors);
router.get('/analytics', adminController.getAnalytics);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/deactivate', adminController.deactivateUser);
router.put('/users/:id/activate', adminController.activateUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;