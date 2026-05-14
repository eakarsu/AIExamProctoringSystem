// Agentic proctor: real-time monitor, auto-flags anomalies, escalates to
// human when severity exceeds threshold.
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');
const { analyzeWithAI } = require('../services/aiService');

// POST /api/agentic-proctor/observe { session_id, signals:{face_count, gaze_offscreen_sec, audio_anomaly, mouse_idle_sec} }
router.post('/observe', authenticate, async (req, res) => {
  try {
    const { session_id, signals = {} } = req.body || {};
    if (!session_id) return res.status(400).json({ error: 'session_id required' });
    const flags = [];
    if ((signals.face_count || 0) > 1) flags.push({ type: 'multiple_faces', severity: 'high' });
    if ((signals.face_count || 0) < 1) flags.push({ type: 'no_face', severity: 'medium' });
    if ((signals.gaze_offscreen_sec || 0) > 30) flags.push({ type: 'gaze_offscreen', severity: 'medium' });
    if (signals.audio_anomaly) flags.push({ type: 'audio_anomaly', severity: 'medium' });
    if ((signals.mouse_idle_sec || 0) > 180) flags.push({ type: 'extended_idle', severity: 'low' });

    const severity = flags.find(f => f.severity === 'high') ? 'high' : flags.length ? 'medium' : 'low';
    try {
      await pool.query(`INSERT INTO incidents (session_id, severity, flags, source, created_at) VALUES ($1,$2,$3,'agentic_proctor',NOW())`, [session_id, severity, JSON.stringify(flags)]);
    } catch {}

    let summary = null;
    if (severity !== 'low') {
      try {
        summary = await analyzeWithAI('Summarise proctoring incident and recommend action.', JSON.stringify({ session_id, signals, flags }));
      } catch {}
    }
    return res.json({ session_id, severity, flags, summary, escalate_to_human: severity === 'high' });
  } catch (e) {
    return res.status(500).json({ error: 'observe failed' });
  }
});

module.exports = router;
