const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadAvatar, getHistory, changePassword, getLeaderboard } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar: uploadAvatarMiddleware } = require('../middleware/upload');

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/avatar', uploadAvatarMiddleware.single('avatar'), uploadAvatar);
router.get('/history', getHistory);
router.put('/change-password', changePassword);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
