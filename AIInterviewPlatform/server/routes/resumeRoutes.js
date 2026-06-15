const express = require('express');
const router = express.Router();
const { uploadResume, generateResumeQuestions } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const { uploadResume: uploadResumeMiddleware } = require('../middleware/upload');

router.use(protect);
router.post('/upload', uploadResumeMiddleware.single('resume'), uploadResume);
router.post('/generate-questions', generateResumeQuestions);

module.exports = router;
