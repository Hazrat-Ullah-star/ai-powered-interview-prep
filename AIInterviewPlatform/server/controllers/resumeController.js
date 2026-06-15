const path = require('path');
const { db } = require('../config/firebase');
const { extractTextFromPDF, extractSkillsFromResume, deleteFile } = require('../services/resumeService');
const { generateQuestionsFromResume } = require('../services/aiService');

// @desc    Upload and parse resume
// @route   POST /api/resume/upload
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a PDF resume' });

    const filePath = path.join(__dirname, '..', 'uploads', 'resumes', req.file.filename);
    const resumeText = await extractTextFromPDF(filePath);
    const parsed = await extractSkillsFromResume(resumeText);

    // Update user skills
    if (parsed.technicalSkills && parsed.technicalSkills.length > 0) {
      const allSkills = [
        ...parsed.technicalSkills,
        ...(parsed.programmingLanguages || []),
        ...(parsed.frameworks || [])
      ];
      await db.collection('users').doc(req.user.id).update({
        skills: allSkills,
        experience: parsed.experience || 'fresher',
        targetRole: parsed.targetRole || ''
      });
    }

    // Clean up file
    deleteFile(filePath);

    res.json({ success: true, parsed, message: 'Resume parsed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate questions from resume
// @route   POST /api/resume/generate-questions
const generateResumeQuestions = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { skills, experience, targetRole } = userDoc.data();

    if (!skills || skills.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload your resume first to extract skills' });
    }

    const questions = await generateQuestionsFromResume({ skills, experience, targetRole });

    res.json({ success: true, questions, skillsUsed: skills });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadResume, generateResumeQuestions };
