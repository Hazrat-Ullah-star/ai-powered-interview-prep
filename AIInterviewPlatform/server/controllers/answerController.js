const { db } = require('../config/firebase');
const { analyzeAnswer } = require('../services/aiService');

// @desc    Submit answer and get AI feedback
// @route   POST /api/answers/submit
const submitAnswer = async (req, res, next) => {
  try {
    const { interviewId, questionId, questionText, answerText, mode, timeTaken } = req.body;

    const interviewDoc = await db.collection('interviews').doc(interviewId).get();
    if (!interviewDoc.exists) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    const interviewData = interviewDoc.data();

    const question = (interviewData.questions || []).find(q => q.id === questionId || q._id === questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    let feedback = {};
    if (answerText && answerText.trim().length > 5) {
      feedback = await analyzeAnswer({
        question: questionText || question.text,
        answer: answerText,
        category: interviewData.category,
        difficulty: interviewData.difficulty
      });
    } else {
      feedback = {
        score: 0, grammar: 0, technicalCorrectness: 0,
        communication: 0, confidence: 0, relevance: 0, clarity: 0,
        summary: 'No answer provided.',
        strengths: [], improvements: ['Please provide an answer'],
        suggestedAnswer: question.expectedAnswer || ''
      };
    }

    const newAnswerRef = db.collection('answers').doc();
    const answerData = {
      user: req.user.id,
      interview: interviewId,
      question: questionId,
      questionText: questionText || question.text,
      answerText,
      mode: mode || 'text',
      feedback,
      timeTaken: timeTaken || 0,
      createdAt: new Date().toISOString()
    };

    await newAnswerRef.set(answerData);

    const answersList = interviewData.answers || [];
    answersList.push(newAnswerRef.id);
    await db.collection('interviews').doc(interviewId).update({ answers: answersList });

    res.status(201).json({ success: true, answer: { id: newAnswerRef.id, _id: newAnswerRef.id, ...answerData } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get answers for an interview
// @route   GET /api/answers/interview/:interviewId
const getInterviewAnswers = async (req, res, next) => {
  try {
    const answersSnapshot = await db.collection('answers')
      .where('interview', '==', req.params.interviewId)
      .where('user', '==', req.user.id)
      .get();
    const answers = answersSnapshot.docs.map(doc => ({ id: doc.id, _id: doc.id, ...doc.data() }));
    res.json({ success: true, answers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single answer
// @route   GET /api/answers/:id
const getAnswer = async (req, res, next) => {
  try {
    const answerDoc = await db.collection('answers').doc(req.params.id).get();
    if (!answerDoc.exists) return res.status(404).json({ success: false, message: 'Answer not found' });
    res.json({ success: true, answer: { id: answerDoc.id, _id: answerDoc.id, ...answerDoc.data() } });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitAnswer, getInterviewAnswers, getAnswer };
