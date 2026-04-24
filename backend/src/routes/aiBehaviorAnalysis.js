const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');
const { analyzeWithAI } = require('../services/aiService');

const SYSTEM_PROMPT = 'You are an AI behavior analysis system for exam proctoring. Analyze the student\'s behavior patterns during the exam including mouse movements, typing patterns, eye tracking data, and screen activity. Identify suspicious behaviors and provide risk assessment. Provide a detailed analysis with sections: Behavior Assessment, Suspicious Patterns Detected, Risk Analysis, and Recommendations. Use clear headings with ** markers and bullet points with - for lists. Be thorough but concise.';

// POST /api/ai/behavior-analysis/analyze
router.post('/analyze', authenticate, async (req, res) => {
  try {
    const { session_id, behavior_data } = req.body;

    if (!session_id || !behavior_data) {
      return res.status(400).json({ success: false, error: 'session_id and behavior_data are required.' });
    }

    const prompt = `Session ID: ${session_id}\nBehavior Data: ${behavior_data}`;
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
      `INSERT INTO behavior_analysis_logs (session_id, analysis, confidence, risk_level, recommendations, analyzed_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [session_id, analysis, confidence, risk_level, recommendations]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Behavior analysis error:', err);
    res.status(500).json({ success: false, error: 'Behavior analysis failed.' });
  }
});

// GET /api/ai/behavior-analysis/logs
router.get('/logs', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM behavior_analysis_logs ORDER BY analyzed_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get behavior analysis logs error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch behavior analysis logs.' });
  }
});

module.exports = router;
