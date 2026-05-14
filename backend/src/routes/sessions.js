const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

// GET /api/sessions
router.get('/', authenticate, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const countResult = await pool.query('SELECT COUNT(*) FROM proctoring_sessions');
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query(
      'SELECT * FROM proctoring_sessions ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get sessions error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch sessions.' });
  }
});

// GET /api/sessions/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proctoring_sessions WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get session error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch session.' });
  }
});

// POST /api/sessions
router.post('/', authenticate, async (req, res) => {
  try {
    const { exam_id, student_id, proctor_id, start_time, end_time, status, trust_score, browser_locked, webcam_enabled, audio_enabled, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO proctoring_sessions (exam_id, student_id, proctor_id, start_time, end_time, status, trust_score, browser_locked, webcam_enabled, audio_enabled, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [exam_id, student_id, proctor_id, start_time, end_time, status || 'scheduled', trust_score || 100, browser_locked ?? true, webcam_enabled ?? true, audio_enabled ?? true, notes]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Create session error:', err);
    res.status(500).json({ success: false, error: 'Failed to create session.' });
  }
});

// PUT /api/sessions/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { exam_id, student_id, proctor_id, start_time, end_time, status, trust_score, browser_locked, webcam_enabled, audio_enabled, notes } = req.body;
    const result = await pool.query(
      `UPDATE proctoring_sessions SET exam_id = $1, student_id = $2, proctor_id = $3, start_time = $4,
       end_time = $5, status = $6, trust_score = $7, browser_locked = $8, webcam_enabled = $9,
       audio_enabled = $10, notes = $11 WHERE id = $12 RETURNING *`,
      [exam_id, student_id, proctor_id, start_time, end_time, status, trust_score, browser_locked, webcam_enabled, audio_enabled, notes, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Update session error:', err);
    res.status(500).json({ success: false, error: 'Failed to update session.' });
  }
});

// DELETE /api/sessions/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM proctoring_sessions WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }
    res.json({ success: true, data: { message: 'Session deleted successfully.' } });
  } catch (err) {
    console.error('Delete session error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete session.' });
  }
});

module.exports = router;
