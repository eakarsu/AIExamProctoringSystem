// Accessibility accommodations: screen reader / extended time /
// large-print management.
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

const TYPES = ['screen_reader', 'extended_time_25', 'extended_time_50', 'extended_time_100', 'large_print', 'separate_room', 'sign_language', 'breaks'];

// POST /api/accessibility/grants { student_id, type, justification }
router.post('/grants', authenticate, async (req, res) => {
  try {
    const { student_id, type, justification } = req.body || {};
    if (!student_id || !type) return res.status(400).json({ error: 'student_id + type required' });
    if (!TYPES.includes(type)) return res.status(400).json({ error: `type must be one of ${TYPES.join(',')}` });
    try {
      const r = await pool.query(
        `INSERT INTO accessibility_grants (student_id, type, justification, granted_by, status, created_at) VALUES ($1,$2,$3,$4,'active',NOW()) RETURNING id`,
        [student_id, type, justification || null, req.user?.id]
      );
      return res.json({ id: r.rows[0].id, student_id, type });
    } catch (e) {
      return res.status(500).json({ error: 'accessibility_grants table missing' });
    }
  } catch (e) {
    return res.status(500).json({ error: 'grant failed' });
  }
});

// GET /api/accessibility/grants/:student_id
router.get('/grants/:student_id', authenticate, async (req, res) => {
  try {
    const r = await pool.query(`SELECT type, status, justification, created_at FROM accessibility_grants WHERE student_id = $1 AND status = 'active'`, [req.params.student_id]).catch(() => ({ rows: [] }));
    return res.json({ student_id: req.params.student_id, count: r.rows.length, grants: r.rows });
  } catch (e) {
    return res.status(500).json({ error: 'lookup failed' });
  }
});

module.exports = router;
