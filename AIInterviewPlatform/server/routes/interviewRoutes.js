const express = require('express');
const router = express.Router();
const { generateInterview, getInterviews, getInterview, startInterview, completeInterview, deleteInterview } = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/generate', generateInterview);
router.get('/', getInterviews);
router.get('/:id', getInterview);
router.put('/:id/start', startInterview);
router.put('/:id/complete', completeInterview);
router.delete('/:id', deleteInterview);

module.exports = router;
