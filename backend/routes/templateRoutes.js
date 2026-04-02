const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', templateController.getAllTemplates);
router.get('/:id', templateController.getTemplateById);
router.post('/', auth, authorize('admin'), templateController.createTemplate);
router.put('/:id', auth, authorize('admin'), templateController.updateTemplate);
router.delete('/:id', auth, authorize('admin'), templateController.deleteTemplate);

module.exports = router;