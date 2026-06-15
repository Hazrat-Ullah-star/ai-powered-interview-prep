const express = require('express');
const router = express.Router();
const { getUsers, toggleUserStatus, deleteUser, getAdminAnalytics, promoteUser } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(protect, adminMiddleware);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/promote', promoteUser);
router.get('/analytics', getAdminAnalytics);

module.exports = router;
