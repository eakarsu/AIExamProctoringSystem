// Stress monitor: micro-expression + breathing analysis. v0 accepts
// frame-level metrics (face landmarks/heart rate) and returns a score.
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

// POST /api/stress-monitor/sample { session_id, brow_furrow_pct?, blink_rate_hz?, breathing_rate_bpm?, hr_bpm? }
router.post('/sample', authenticate, async (req, res) => {
  try {
    const { session_id, brow_furrow_pct = 0, blink_rate_hz = 0.2, breathing_rate_bpm = 14, hr_bpm = 75 } = req.body || {};
    if (!session_id) return res.status(400).json({ error: 'session_id required' });
    let score = 0;
    score += Math.min(40, Number(brow_furrow_pct) * 80);
    score += Number(blink_rate_hz) > 0.5 ? 20 : 0;
    score += Number(breathing_rate_bpm) > 22 ? 20 : 0;
    score += Number(hr_bpm) > 110 ? 20 : 0;
    const level = score > 70 ? 'high' : score > 40 ? 'medium' : 'low';
    try {
      await pool.query(`INSERT INTO stress_samples (session_id, score, level, payload, created_at) VALUES ($1,$2,$3,$4,NOW())`, [session_id, score, level, JSON.stringify(req.body)]);
    } catch {}
    return res.json({ session_id, score, level });
  } catch (e) {
    return res.status(500).json({ error: 'sample failed' });
  }
});

module.exports = router;
