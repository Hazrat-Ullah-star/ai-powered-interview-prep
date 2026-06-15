const { db } = require('../config/firebase');
const { generateInterviewQuestions } = require('../services/aiService');

// @desc    Generate new interview
// @route   POST /api/interviews/generate
const generateInterview = async (req, res, next) => {
  try {
    const { category, difficulty, type, mode, count } = req.body;

    const aiQuestions = await generateInterviewQuestions({ category, difficulty, type, count: count || 10 });

    const newInterviewRef = db.collection('interviews').doc();
    const now = new Date().toISOString();
    
    const questions = aiQuestions.map((q, idx) => ({
      id: `${newInterviewRef.id}_q_${idx}`,
      _id: `${newInterviewRef.id}_q_${idx}`,
      text: q.text,
      category,
      difficulty,
      type,
      expectedAnswer: q.expectedAnswer,
      tags: q.tags || [],
      aiGenerated: true
    }));

    const interviewData = {
      user: req.user.id,
      title: `${category} - ${difficulty} ${type} Interview`,
      category,
      difficulty,
      type,
      mode: mode || 'text',
      status: 'not_started',
      questions,
      createdAt: now,
      updatedAt: now
    };

    await newInterviewRef.set(interviewData);

    res.status(201).json({ success: true, interview: { id: newInterviewRef.id, _id: newInterviewRef.id, ...interviewData } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all interviews for user
// @route   GET /api/interviews
const getInterviews = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;

    let queryRef = db.collection('interviews').where('user', '==', req.user.id);
    if (status) queryRef = queryRef.where('status', '==', status);
    if (category) queryRef = queryRef.where('category', '==', category);

    const snapshot = await queryRef.get();
    const interviews = snapshot.docs.map(doc => ({ id: doc.id, _id: doc.id, ...doc.data() }));

    interviews.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const total = interviews.length;
    const paginatedInterviews = interviews.slice((page - 1) * limit, page * limit);

    res.json({
      success: true,
      interviews: paginatedInterviews,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single interview
// @route   GET /api/interviews/:id
const getInterview = async (req, res, next) => {
  try {
    const interviewDoc = await db.collection('interviews').doc(req.params.id).get();
    if (!interviewDoc.exists) return res.status(404).json({ success: false, message: 'Interview not found' });

    const interviewData = interviewDoc.data();
    if (interviewData.user !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const answersSnapshot = await db.collection('answers').where('interview', '==', req.params.id).get();
    const answers = answersSnapshot.docs.map(doc => ({ id: doc.id, _id: doc.id, ...doc.data() }));

    const interview = { id: interviewDoc.id, _id: interviewDoc.id, ...interviewData, answers };

    res.json({ success: true, interview });
  } catch (error) {
    next(error);
  }
};

// @desc    Start interview
// @route   PUT /api/interviews/:id/start
const startInterview = async (req, res, next) => {
  try {
    await db.collection('interviews').doc(req.params.id).update({ status: 'in_progress' });
    const interviewDoc = await db.collection('interviews').doc(req.params.id).get();
    res.json({ success: true, interview: { id: interviewDoc.id, _id: interviewDoc.id, ...interviewDoc.data() } });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete interview
// @route   PUT /api/interviews/:id/complete
const completeInterview = async (req, res, next) => {
  try {
    const { overallScore, feedback, duration } = req.body;
    await db.collection('interviews').doc(req.params.id).update({
      status: 'completed',
      overallScore,
      feedback,
      duration,
      completedAt: new Date().toISOString()
    });

    const interviewDoc = await db.collection('interviews').doc(req.params.id).get();

    const userDoc = await db.collection('users').doc(req.user.id).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      const stats = userData.stats || { totalInterviews: 0, averageScore: 0 };
      stats.totalInterviews = (stats.totalInterviews || 0) + 1;

      const allInterviewsSnapshot = await db.collection('interviews')
        .where('user', '==', req.user.id)
        .where('status', '==', 'completed')
        .get();

      const allInterviews = allInterviewsSnapshot.docs.map(doc => doc.data());
      const sum = allInterviews.reduce((acc, i) => acc + (i.overallScore || 0), 0);
      stats.averageScore = Math.round(sum / (allInterviews.length || 1));

      await db.collection('users').doc(req.user.id).update({ stats });
    }

    res.json({ success: true, interview: { id: interviewDoc.id, _id: interviewDoc.id, ...interviewDoc.data() } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete interview
// @route   DELETE /api/interviews/:id
const deleteInterview = async (req, res, next) => {
  try {
    const interviewDoc = await db.collection('interviews').doc(req.params.id).get();
    if (!interviewDoc.exists) return res.status(404).json({ success: false, message: 'Interview not found' });

    if (interviewDoc.data().user !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await db.collection('interviews').doc(req.params.id).delete();
    res.json({ success: true, message: 'Interview deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateInterview, getInterviews, getInterview, startInterview, completeInterview, deleteInterview };
