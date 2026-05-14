const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

// GET /api/exams
router.get('/', authenticate, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const countResult = await pool.query('SELECT COUNT(*) FROM exams');
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query(
      'SELECT * FROM exams ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get exams error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch exams.' });
  }
});

// GET /api/exams/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM exams WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Exam not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get exam error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch exam.' });
  }
});

// POST /api/exams
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, subject, duration_minutes, total_marks, passing_marks, status, institution_id } = req.body;
    const result = await pool.query(
      `INSERT INTO exams (title, description, subject, duration_minutes, total_marks, passing_marks, status, institution_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, subject, duration_minutes, total_marks, passing_marks, status || 'draft', institution_id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Create exam error:', err);
    res.status(500).json({ success: false, error: 'Failed to create exam.' });
  }
});

// PUT /api/exams/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, description, subject, duration_minutes, total_marks, passing_marks, status, institution_id } = req.body;
    const result = await pool.query(
      `UPDATE exams SET title = $1, description = $2, subject = $3, duration_minutes = $4,
       total_marks = $5, passing_marks = $6, status = $7, institution_id = $8
       WHERE id = $9 RETURNING *`,
      [title, description, subject, duration_minutes, total_marks, passing_marks, status, institution_id, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Exam not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Update exam error:', err);
    res.status(500).json({ success: false, error: 'Failed to update exam.' });
  }
});

// DELETE /api/exams/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM exams WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Exam not found.' });
    }
    res.json({ success: true, data: { message: 'Exam deleted successfully.' } });
  } catch (err) {
    console.error('Delete exam error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete exam.' });
  }
});

module.exports = router;
