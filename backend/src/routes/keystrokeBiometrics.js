// Keystroke biometrics: continuous authentication during exam. v0 stores
// dwell+flight times and scores against the user's baseline.
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

// POST /api/keystroke-biometrics/baseline { user_id, samples:[{dwell, flight}] }
router.post('/baseline', authenticate, async (req, res) => {
  try {
    const { user_id, samples = [] } = req.body || {};
    if (!user_id || !Array.isArray(samples) || samples.length < 30) return res.status(400).json({ error: 'user_id + ≥30 samples required' });
    const dwells = samples.map(s => Number(s.dwell));
    const flights = samples.map(s => Number(s.flight));
    const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const md = mean(dwells), mf = mean(flights);
    try {
      await pool.query(
        `INSERT INTO keystroke_baselines (user_id, mean_dwell, mean_flight, sample_count, updated_at)
         VALUES ($1,$2,$3,$4,NOW())
         ON CONFLICT (user_id) DO UPDATE SET mean_dwell=EXCLUDED.mean_dwell, mean_flight=EXCLUDED.mean_flight, sample_count=EXCLUDED.sample_count, updated_at=NOW()`,
        [user_id, md, mf, samples.length]
      );
    } catch {}
    return res.json({ user_id, mean_dwell: md, mean_flight: mf, sample_count: samples.length });
  } catch (e) {
    return res.status(500).json({ error: 'baseline failed' });
  }
});

// POST /api/keystroke-biometrics/verify { user_id, samples:[{dwell, flight}] }
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { user_id, samples = [] } = req.body || {};
    if (!user_id || !samples.length) return res.status(400).json({ error: 'user_id + samples required' });
    const r = await pool.query(`SELECT mean_dwell, mean_flight FROM keystroke_baselines WHERE user_id = $1`, [user_id]).catch(() => ({ rows: [] }));
    if (!r.rows[0]) return res.json({ user_id, verified: false, reason: 'no baseline' });
    const md = Number(r.rows[0].mean_dwell), mf = Number(r.rows[0].mean_flight);
    const sd = samples.reduce((a, s) => a + Math.abs(s.dwell - md), 0) / samples.length;
    const sf = samples.reduce((a, s) => a + Math.abs(s.flight - mf), 0) / samples.length;
    const distance = sd + sf;
    const verified = distance < (md + mf) * 0.4;
    return res.json({ user_id, verified, distance: Math.round(distance), threshold: Math.round((md + mf) * 0.4) });
  } catch (e) {
    return res.status(500).json({ error: 'verify failed' });
  }
});

module.exports = router;
