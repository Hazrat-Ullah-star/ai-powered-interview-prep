const { db } = require('../config/firebase');
const { reviewCode } = require('../services/aiService');

// @desc    Get all coding challenges
// @route   GET /api/coding
const getChallenges = async (req, res, next) => {
  try {
    const { difficulty, category, page = 1, limit = 20 } = req.query;

    let queryRef = db.collection('challenges').where('isActive', '==', true);
    if (difficulty) queryRef = queryRef.where('difficulty', '==', difficulty);
    if (category) queryRef = queryRef.where('category', '==', category);

    const snapshot = await queryRef.get();
    const challenges = snapshot.docs.map(doc => ({ id: doc.id, _id: doc.id, ...doc.data() }));

    challenges.sort((a, b) => {
      if (a.difficulty !== b.difficulty) return a.difficulty > b.difficulty ? 1 : -1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    const total = challenges.length;
    const paginatedChallenges = challenges.slice((page - 1) * limit, page * limit);

    const subSnapshot = await db.collection('submissions')
      .where('user', '==', req.user.id)
      .get();
    
    const solvedChallengeIds = subSnapshot.docs
      .map(doc => doc.data())
      .filter(s => s.status === 'accepted' || s.status === 'reviewed')
      .map(s => s.challenge);

    const challengesWithStatus = paginatedChallenges.map(c => ({
      ...c,
      solved: solvedChallengeIds.includes(c.id) || solvedChallengeIds.includes(c._id)
    }));

    res.json({
      success: true,
      challenges: challengesWithStatus,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single challenge
// @route   GET /api/coding/:id
const getChallenge = async (req, res, next) => {
  try {
    const challengeDoc = await db.collection('challenges').doc(req.params.id).get();
    if (!challengeDoc.exists) return res.status(404).json({ success: false, message: 'Challenge not found' });

    const challengeObj = { id: challengeDoc.id, _id: challengeDoc.id, ...challengeDoc.data() };
    if (challengeObj.testCases) {
      challengeObj.testCases = challengeObj.testCases.filter(tc => !tc.isHidden);
    }

    res.json({ success: true, challenge: challengeObj });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit code solution
// @route   POST /api/coding/:id/submit
const submitCode = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    const challengeDoc = await db.collection('challenges').doc(req.params.id).get();
    if (!challengeDoc.exists) return res.status(404).json({ success: false, message: 'Challenge not found' });

    const challenge = challengeDoc.data();

    const aiReview = await reviewCode({
      code,
      language,
      challengeTitle: challenge.title,
      challengeDescription: challenge.description
    });

    const newSubRef = db.collection('submissions').doc();
    const submissionData = {
      user: req.user.id,
      challenge: req.params.id,
      code,
      language,
      status: aiReview.score >= 70 ? 'accepted' : 'reviewed',
      aiReview,
      createdAt: new Date().toISOString()
    };
    await newSubRef.set(submissionData);

    const totalSubmissions = (challenge.totalSubmissions || 0) + 1;
    const successfulSubmissions = (challenge.successfulSubmissions || 0) + (aiReview.score >= 70 ? 1 : 0);
    const acceptanceRate = Math.round((successfulSubmissions / totalSubmissions) * 100);

    await db.collection('challenges').doc(req.params.id).update({
      totalSubmissions,
      successfulSubmissions,
      acceptanceRate
    });

    const userDoc = await db.collection('users').doc(req.user.id).get();
    if (userDoc.exists) {
      const stats = userDoc.data().stats || {};
      stats.totalCodingChallenges = (stats.totalCodingChallenges || 0) + 1;
      await db.collection('users').doc(req.user.id).update({ stats });
    }

    res.status(201).json({ success: true, submission: { id: newSubRef.id, _id: newSubRef.id, ...submissionData } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's submissions
// @route   GET /api/coding/submissions
const getSubmissions = async (req, res, next) => {
  try {
    const subSnapshot = await db.collection('submissions')
      .where('user', '==', req.user.id)
      .get();

    const submissions = subSnapshot.docs.map(doc => ({ id: doc.id, _id: doc.id, ...doc.data() }));

    submissions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const populatedSubmissions = await Promise.all(submissions.slice(0, 20).map(async s => {
      const challengeDoc = await db.collection('challenges').doc(s.challenge).get();
      return {
        ...s,
        challenge: challengeDoc.exists ? { id: challengeDoc.id, _id: challengeDoc.id, ...challengeDoc.data() } : null
      };
    }));

    res.json({ success: true, submissions: populatedSubmissions });
  } catch (error) {
    next(error);
  }
};

// @desc    Create coding challenge (admin)
// @route   POST /api/coding
const createChallenge = async (req, res, next) => {
  try {
    const newChallengeRef = db.collection('challenges').doc();
    const challengeData = {
      ...req.body,
      isActive: true,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };
    await newChallengeRef.set(challengeData);

    res.status(201).json({ success: true, challenge: { id: newChallengeRef.id, _id: newChallengeRef.id, ...challengeData } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getChallenges, getChallenge, submitCode, getSubmissions, createChallenge };
