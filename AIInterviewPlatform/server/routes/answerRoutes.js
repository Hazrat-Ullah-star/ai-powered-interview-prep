const express = require('express');
const router = express.Router();
const { submitAnswer, getInterviewAnswers, getAnswer } = require('../controllers/answerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/submit', submitAnswer);
router.get('/interview/:interviewId', getInterviewAnswers);
router.get('/:id', getAnswer);

module.exports = router;
