const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword, firebaseSync } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidator');

// @route   POST /api/auth/register
router.post('/register', validateRegister, register);

// @route   POST /api/auth/login
router.post('/login', validateLogin, login);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

// @route   POST /api/auth/firebase
router.post('/firebase', firebaseSync);

// @route   POST /api/auth/forgotpassword
router.post('/forgotpassword', forgotPassword);

// @route   PUT /api/auth/resetpassword/:resettoken
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
