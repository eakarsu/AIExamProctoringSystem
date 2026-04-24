const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');
const { analyzeWithAI } = require('../services/aiService');

const SYSTEM_PROMPT = 'You are an AI face verification system for exam proctoring. Analyze the provided information about a student\'s webcam feed and determine identity verification status, confidence level, and any concerns. Provide a detailed analysis with sections: Verification Status, Identity Confidence Assessment, Detected Concerns, and Recommendations. Use clear headings with ** markers and bullet points with - for lists. Be thorough but concise.';

// POST /api/ai/face-verification/analyze
router.post('/analyze', authenticate, async (req, res) => {
  try {
    const { session_id, description } = req.body;

    if (!session_id || !description) {
      return res.status(400).json({ success: false, error: 'session_id and description are required.' });
    }

    const prompt = `Session ID: ${session_id}\nFace Verification Data: ${description}`;
    const analysis = await analyzeWithAI(prompt, SYSTEM_PROMPT);

    let confidence = 0.85;
    let risk_level = 'low';
    let recommendations = '';

    try {
      const parsed = JSON.parse(analysis);
      confidence = parsed.confidence || 0.85;
      risk_level = parsed.risk_level || 'low';
      recommendations = JSON.stringify(parsed.recommendations || []);
    } catch {
      const confMatch = analysis.match(/confidence[:\s]*([\d.]+)/i);
      if (confMatch) confidence = parseFloat(confMatch[1]);
      if (analysis.toLowerCase().includes('high risk') || analysis.toLowerCase().includes('critical')) risk_level = 'high';
      else if (analysis.toLowerCase().includes('medium risk') || analysis.toLowerCase().includes('suspicious')) risk_level = 'medium';
      recommendations = analysis;
    }

    const result = await pool.query(
      `INSERT INTO face_verification_logs (session_id, analysis, confidence, risk_level, recommendations, analyzed_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [session_id, analysis, confidence, risk_level, recommendations]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Face verification analysis error:', err);
    res.status(500).json({ success: false, error: 'Face verification analysis failed.' });
  }
});

// GET /api/ai/face-verification/logs
router.get('/logs', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM face_verification_logs ORDER BY analyzed_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get face verification logs error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch face verification logs.' });
  }
});

module.exports = router;
