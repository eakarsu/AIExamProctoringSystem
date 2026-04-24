const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');
const { analyzeWithAI } = require('../services/aiService');

const SYSTEM_PROMPT = 'You are an AI plagiarism detection system. Compare the student\'s answer with provided reference materials and identify potential plagiarism. Provide a detailed analysis with sections: Plagiarism Assessment, Similarity Analysis, Flagged Passages, and Recommendations. Use clear headings with ** markers and bullet points with - for lists. Be thorough but concise.';

// POST /api/ai/plagiarism-detection/analyze
router.post('/analyze', authenticate, async (req, res) => {
  try {
    const { student_answer, original_text } = req.body;

    if (!student_answer || !original_text) {
      return res.status(400).json({ success: false, error: 'student_answer and original_text are required.' });
    }

    const prompt = `Student Answer:\n${student_answer}\n\nOriginal/Reference Text:\n${original_text}`;
    const analysis = await analyzeWithAI(prompt, SYSTEM_PROMPT);

    let confidence = 0.85;
    let risk_level = 'low';
    let recommendations = '';
    let similarity_score = 0;

    try {
      const parsed = JSON.parse(analysis);
      confidence = parsed.confidence || 0.85;
      risk_level = parsed.risk_level || 'low';
      similarity_score = parsed.similarity_score || 0;
      recommendations = JSON.stringify(parsed.recommendations || []);
    } catch {
      const confMatch = analysis.match(/confidence[:\s]*([\d.]+)/i);
      if (confMatch) confidence = parseFloat(confMatch[1]);
      const simMatch = analysis.match(/similarity[:\s]*([\d.]+)/i);
      if (simMatch) similarity_score = parseFloat(simMatch[1]);
      if (analysis.toLowerCase().includes('high risk') || analysis.toLowerCase().includes('critical')) risk_level = 'high';
      else if (analysis.toLowerCase().includes('medium risk') || analysis.toLowerCase().includes('suspicious')) risk_level = 'medium';
      recommendations = analysis;
    }

    const result = await pool.query(
      `INSERT INTO plagiarism_reports (student_answer, original_text, analysis, similarity_score, confidence, risk_level, recommendations, analyzed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
      [student_answer, original_text, analysis, similarity_score, confidence, risk_level, recommendations]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Plagiarism detection error:', err);
    res.status(500).json({ success: false, error: 'Plagiarism detection analysis failed.' });
  }
});

// GET /api/ai/plagiarism-detection/logs
router.get('/logs', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM plagiarism_reports ORDER BY analyzed_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get plagiarism reports error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch plagiarism reports.' });
  }
});

module.exports = router;
