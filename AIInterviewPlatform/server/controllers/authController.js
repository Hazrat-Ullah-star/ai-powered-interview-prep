const { db } = require('../config/firebase');
const { generateToken } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  // Check for existing user
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).limit(1).get();
  
  if (!snapshot.empty) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user doc
  const newUserRef = usersRef.doc();
  const userData = {
    fullName,
    email,
    password: hashedPassword,
    role: role === 'admin' ? 'user' : role, // Default to user for safety
    createdAt: new Date().toISOString()
  };

  await newUserRef.set(userData);

  const token = generateToken(newUserRef.id);
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      _id: newUserRef.id,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  // Check for user
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).limit(1).get();
  
  if (snapshot.empty) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();

  // Check password (only if not a social login user)
  if (!userData.password) {
    return res.status(401).json({ success: false, message: 'This account uses social login. Please sign in via Google.' });
  }

  const isMatch = await bcrypt.compare(password, userData.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = generateToken(userDoc.id);
  res.json({
    success: true,
    token,
    user: {
      _id: userDoc.id,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role
    }
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const userDoc = await db.collection('users').doc(req.user.id).get();
  if (!userDoc.exists) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, user: { id: userDoc.id, _id: userDoc.id, ...userDoc.data() } });
});

// @desc    Forgot password (Placeholder/Basic)
// @route   POST /api/auth/forgotpassword
const forgotPassword = asyncHandler(async (req, res) => {
  res.status(501).json({ success: false, message: 'Forgot password functionality is currently in maintenance.' });
});

// @desc    Reset password (Placeholder/Basic)
// @route   PUT /api/auth/resetpassword/:resettoken
const resetPassword = asyncHandler(async (req, res) => {
  res.status(501).json({ success: false, message: 'Reset password functionality is currently in maintenance.' });
});

// @desc    Firebase Auth Sync
// @route   POST /api/auth/firebase
const firebaseSync = asyncHandler(async (req, res) => {
  const { email, uid, fullName } = req.body;

  if (!email || !uid) {
    return res.status(400).json({ success: false, message: 'Missing Firebase credentials' });
  }

  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).limit(1).get();
  
  let userId;
  let userData;

  if (snapshot.empty) {
    const newUserRef = usersRef.doc(uid);
    userData = {
      fullName: fullName || email.split('@')[0],
      email,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    await newUserRef.set(userData);
    userId = uid;
  } else {
    const doc = snapshot.docs[0];
    userId = doc.id;
    userData = doc.data();
  }

  const token = generateToken(userId);
  res.json({
    success: true,
    token,
    user: {
      _id: userId,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role
    }
  });
});

module.exports = { register, login, getMe, forgotPassword, resetPassword, firebaseSync };
