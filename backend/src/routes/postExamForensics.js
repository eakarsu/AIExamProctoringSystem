// Post-exam forensics: replay session with flagged moments.
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

// GET /api/post-exam-forensics/:session_id
router.get('/:session_id', authenticate, async (req, res) => {
  try {
    const incidents = await pool.query(`SELECT * FROM incidents WHERE session_id = $1 ORDER BY created_at ASC`, [req.params.session_id]).catch(() => ({ rows: [] }));
    const stress = await pool.query(`SELECT created_at as ts, score, level FROM stress_samples WHERE session_id = $1 ORDER BY created_at ASC`, [req.params.session_id]).catch(() => ({ rows: [] }));
    const session = await pool.query(`SELECT * FROM sessions WHERE id = $1`, [req.params.session_id]).catch(() => ({ rows: [{}] }));

    const timeline = [
      ...incidents.rows.map(i => ({ ts: i.created_at, type: 'incident', payload: i })),
      ...stress.rows.filter(s => s.level !== 'low').map(s => ({ ts: s.ts, type: 'stress_spike', payload: s })),
    ].sort((a, b) => new Date(a.ts) - new Date(b.ts));

    return res.json({
      session_id: req.params.session_id,
      session: session.rows[0],
      incident_count: incidents.rows.length,
      stress_samples: stress.rows.length,
      timeline,
    });
  } catch (e) {
    return res.status(500).json({ error: 'forensics failed' });
  }
});

module.exports = router;
