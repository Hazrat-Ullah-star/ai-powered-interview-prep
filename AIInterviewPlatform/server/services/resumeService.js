const pdfParse = require('pdf-parse');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract text from PDF file
 */
const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
};

/**
 * Extract skills from resume text using Gemini
 */
const extractSkillsFromResume = async (resumeText) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Extract technical and soft skills from this resume text. Return ONLY valid JSON:
{
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1", "skill2"],
  "programmingLanguages": ["lang1", "lang2"],
  "frameworks": ["framework1"],
  "databases": ["db1"],
  "tools": ["tool1"],
  "experience": "fresher|junior|mid|senior",
  "targetRole": "suggested job role",
  "summary": "brief profile summary"
}

Resume text:
${resumeText.substring(0, 3000)}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}') + 1;
  const jsonStr = text.slice(jsonStart, jsonEnd);
  return JSON.parse(jsonStr);
};

/**
 * Clean up uploaded file
 */
const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = { extractTextFromPDF, extractSkillsFromResume, deleteFile };
