const express = require('express');
const router = express.Router();
const { getDashboard, getDetailedAnalytics, getCareerSuggestions } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/detailed', getDetailedAnalytics);
router.get('/career-suggestions', getCareerSuggestions);

module.exports = router;
