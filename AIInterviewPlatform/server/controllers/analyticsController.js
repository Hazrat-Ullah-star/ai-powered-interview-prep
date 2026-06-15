const { db } = require('../config/firebase');
const { generateCareerSuggestions } = require('../services/aiService');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const interviewsSnapshot = await db.collection('interviews')
      .where('user', '==', userId)
      .where('status', '==', 'completed')
      .get();
    const allCompletedInterviews = interviewsSnapshot.docs.map(doc => ({ id: doc.id, _id: doc.id, ...doc.data() }));

    const recentInterviews = [...allCompletedInterviews]
      .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))
      .slice(0, 5)
      .map(i => ({
        title: i.title,
        category: i.category,
        difficulty: i.difficulty,
        overallScore: i.overallScore,
        completedAt: i.completedAt,
        duration: i.duration
      }));

    const categoryMap = {};
    allCompletedInterviews.forEach(i => {
      if (!categoryMap[i.category]) {
        categoryMap[i.category] = { _id: i.category, sumScore: 0, count: 0 };
      }
      categoryMap[i.category].sumScore += (i.overallScore || 0);
      categoryMap[i.category].count += 1;
    });
    const categoryBreakdown = Object.values(categoryMap).map(c => ({
      _id: c._id,
      avgScore: Math.round(c.sumScore / c.count),
      count: c.count
    }));
    categoryBreakdown.sort((a, b) => b.count - a.count);

    const weeklyMap = {};
    allCompletedInterviews.forEach(i => {
      if (i.completedAt) {
        const dateStr = i.completedAt.split('T')[0];
        if (!weeklyMap[dateStr]) {
          weeklyMap[dateStr] = { _id: dateStr, sumScore: 0, count: 0 };
        }
        weeklyMap[dateStr].sumScore += (i.overallScore || 0);
        weeklyMap[dateStr].count += 1;
      }
    });
    const weeklyScores = Object.values(weeklyMap).map(w => ({
      _id: w._id,
      avgScore: Math.round(w.sumScore / w.count),
      count: w.count
    }));
    weeklyScores.sort((a, b) => b._id.localeCompare(a._id));
    const limitedWeeklyScores = weeklyScores.slice(0, 30);

    const answersSnapshot = await db.collection('answers')
      .where('user', '==', userId)
      .get();
    const allAnswers = answersSnapshot.docs.map(doc => doc.data());
    allAnswers.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const recentAnswers = allAnswers.slice(0, 50);

    const subSnapshot = await db.collection('submissions')
      .where('user', '==', userId)
      .get();
    const totalCodingChallenges = subSnapshot.size;

    const skillScores = {};
    recentAnswers.forEach(a => {
      if (a.feedback) {
        if (!skillScores['Technical']) skillScores['Technical'] = [];
        skillScores['Technical'].push(a.feedback.technicalCorrectness || 0);
        if (!skillScores['Communication']) skillScores['Communication'] = [];
        skillScores['Communication'].push(a.feedback.communication || 0);
      }
    });

    const skillBreakdown = Object.entries(skillScores).map(([skill, scores]) => ({
      skill,
      score: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    }));

    res.json({
      success: true,
      data: {
        recentInterviews,
        categoryBreakdown,
        weeklyScores: limitedWeeklyScores.reverse(),
        skillBreakdown,
        totalCodingChallenges
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed analytics
// @route   GET /api/analytics/detailed
const getDetailedAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const interviewsSnapshot = await db.collection('interviews')
      .where('user', '==', userId)
      .where('status', '==', 'completed')
      .get();
    const allCompletedInterviews = interviewsSnapshot.docs
      .map(doc => doc.data())
      .filter(i => new Date(i.completedAt) >= startDate);

    const answersSnapshot = await db.collection('answers')
      .where('user', '==', userId)
      .get();
    const allAnswers = answersSnapshot.docs
      .map(doc => doc.data())
      .filter(a => new Date(a.createdAt || 0) >= startDate);

    const scoreDistribution = [
      { range: '0-20', count: allCompletedInterviews.filter(i => i.overallScore <= 20).length },
      { range: '21-40', count: allCompletedInterviews.filter(i => i.overallScore > 20 && i.overallScore <= 40).length },
      { range: '41-60', count: allCompletedInterviews.filter(i => i.overallScore > 40 && i.overallScore <= 60).length },
      { range: '61-80', count: allCompletedInterviews.filter(i => i.overallScore > 60 && i.overallScore <= 80).length },
      { range: '81-100', count: allCompletedInterviews.filter(i => i.overallScore > 80).length }
    ];

    res.json({
      success: true,
      data: { 
        interviews: allCompletedInterviews.map(i => ({
          overallScore: i.overallScore,
          category: i.category,
          difficulty: i.difficulty,
          completedAt: i.completedAt,
          duration: i.duration
        })), 
        answers: allAnswers.map(a => ({ feedback: a.feedback })), 
        scoreDistribution 
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI career suggestions
// @route   GET /api/analytics/career-suggestions
const getCareerSuggestions = async (req, res, next) => {
  try {
    const user = req.user;
    
    const answersSnapshot = await db.collection('answers')
      .where('user', '==', user.id)
      .get();
    const answers = answersSnapshot.docs.map(doc => doc.data());
    
    answers.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const recentAnswers = answers.slice(0, 50);

    const weakAreas = [];
    const strongAreas = [];

    recentAnswers.forEach(a => {
      if (a.feedback) {
        if (a.feedback.technicalCorrectness < 50) weakAreas.push('Technical Knowledge');
        else strongAreas.push('Technical Knowledge');
        
        if (a.feedback.communication < 50) weakAreas.push('Communication');
        else strongAreas.push('Communication');
      }
    });

    const suggestions = await generateCareerSuggestions({
      weakAreas: [...new Set(weakAreas)],
      strongAreas: [...new Set(strongAreas)],
      targetRole: user.targetRole || 'Software Developer'
    });

    res.json({ success: true, suggestions });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getDetailedAnalytics, getCareerSuggestions };
