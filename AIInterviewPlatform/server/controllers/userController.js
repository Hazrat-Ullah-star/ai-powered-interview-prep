const { db } = require('../config/firebase');
const path = require('path');
const fs = require('fs');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user profile
// @route   GET /api/users/profile
const getProfile = asyncHandler(async (req, res) => {
  const userDoc = await db.collection('users').doc(req.user.id).get();
  if (!userDoc.exists) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, user: { id: userDoc.id, _id: userDoc.id, ...userDoc.data() } });
});

// @desc    Update profile
// @route   PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, bio, skills, targetRole, experience } = req.body;
  
  const updateData = {};
  if (fullName !== undefined) updateData.fullName = fullName;
  if (bio !== undefined) updateData.bio = bio;
  if (skills !== undefined) updateData.skills = typeof skills === 'string' ? JSON.parse(skills) : skills;
  if (targetRole !== undefined) updateData.targetRole = targetRole;
  if (experience !== undefined) updateData.experience = experience;

  await db.collection('users').doc(req.user.id).update(updateData);
  
  const userDoc = await db.collection('users').doc(req.user.id).get();
  res.json({ success: true, user: { id: userDoc.id, _id: userDoc.id, ...userDoc.data() } });
});

// @desc    Upload avatar
// @route   PUT /api/users/avatar
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Please upload an image' });

  const userDoc = await db.collection('users').doc(req.user.id).get();
  if (userDoc.exists) {
    const userData = userDoc.data();
    if (userData.avatar && userData.avatar !== '') {
      const oldPath = path.join(__dirname, '..', userData.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  await db.collection('users').doc(req.user.id).update({ avatar: avatarUrl });
  
  const updatedDoc = await db.collection('users').doc(req.user.id).get();
  res.json({ success: true, avatar: avatarUrl, user: { id: updatedDoc.id, _id: updatedDoc.id, ...updatedDoc.data() } });
});

// @desc    Get interview history
// @route   GET /api/users/history
const getHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const interviewsRef = db.collection('interviews');
  const snapshot = await interviewsRef
    .where('user', '==', req.user.id)
    .where('status', '==', 'completed')
    .get();

  const interviews = snapshot.docs.map(doc => ({ id: doc.id, _id: doc.id, ...doc.data() }));
  
  // Sort in-memory to avoid needing index configuration in Firebase
  interviews.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  
  const total = interviews.length;
  const paginatedInterviews = interviews.slice((page - 1) * limit, page * limit);

  res.json({
    success: true,
    interviews: paginatedInterviews,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

// @desc    Change password
// @route   PUT /api/users/change-password
const changePassword = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Password change should be performed via Firebase Auth directly.' });
});

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
const getLeaderboard = asyncHandler(async (req, res) => {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('role', '==', 'user').get();
  
  const users = snapshot.docs.map(doc => ({
    id: doc.id,
    _id: doc.id,
    fullName: doc.data().fullName,
    avatar: doc.data().avatar,
    role: doc.data().role,
    createdAt: doc.data().createdAt
  }));
  
  // Sort in-memory
  users.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const limitedUsers = users.slice(0, 20);
  
  res.json({ success: true, users: limitedUsers });
});

module.exports = { getProfile, updateProfile, uploadAvatar, getHistory, changePassword, getLeaderboard };
