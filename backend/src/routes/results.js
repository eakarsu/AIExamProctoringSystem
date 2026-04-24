const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

// GET /api/results
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM exam_results ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get results error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch results.' });
  }
});

// GET /api/results/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM exam_results WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Result not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get result error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch result.' });
  }
});

// POST /api/results
router.post('/', authenticate, async (req, res) => {
  try {
    const { session_id, exam_id, student_id, score, total_marks, percentage, grade, trust_score, incidents_count, status, completed_at } = req.body;
    const result = await pool.query(
      `INSERT INTO exam_results (session_id, exam_id, student_id, score, total_marks, percentage, grade, trust_score, incidents_count, status, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [session_id, exam_id, student_id, score, total_marks, percentage, grade, trust_score, incidents_count || 0, status || 'passed', completed_at || new Date()]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Create result error:', err);
    res.status(500).json({ success: false, error: 'Failed to create result.' });
  }
});

// PUT /api/results/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { session_id, exam_id, student_id, score, total_marks, percentage, grade, trust_score, incidents_count, status, completed_at } = req.body;
    const result = await pool.query(
      `UPDATE exam_results SET session_id = $1, exam_id = $2, student_id = $3, score = $4,
       total_marks = $5, percentage = $6, grade = $7, trust_score = $8, incidents_count = $9,
       status = $10, completed_at = $11 WHERE id = $12 RETURNING *`,
      [session_id, exam_id, student_id, score, total_marks, percentage, grade, trust_score, incidents_count, status, completed_at, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Result not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Update result error:', err);
    res.status(500).json({ success: false, error: 'Failed to update result.' });
  }
});

// DELETE /api/results/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM exam_results WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Result not found.' });
    }
    res.json({ success: true, data: { message: 'Result deleted successfully.' } });
  } catch (err) {
    console.error('Delete result error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete result.' });
  }
});

module.exports = router;
