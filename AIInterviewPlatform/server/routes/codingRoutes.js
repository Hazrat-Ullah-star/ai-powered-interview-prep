const express = require('express');
const router = express.Router();
const { getChallenges, getChallenge, submitCode, getSubmissions, createChallenge } = require('../controllers/codingController');
const { protect } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(protect);
router.get('/', getChallenges);
router.get('/submissions', getSubmissions);
router.post('/', adminMiddleware, createChallenge);
router.get('/:id', getChallenge);
router.post('/:id/submit', submitCode);

module.exports = router;
