const express = require('express');
const router = express.Router();
const aiPlannerController = require('../controllers/aiPlannerController');
const { auth } = require('../middleware/auth');

router.post('/plan', auth, aiPlannerController.generatePlan);
router.get('/templates', auth, aiPlannerController.getEventTemplates);

module.exports = router;