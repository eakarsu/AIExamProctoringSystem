const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

// GET /api/students
router.get('/', authenticate, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const countResult = await pool.query('SELECT COUNT(*) FROM students');
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query(
      'SELECT * FROM students ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch students.' });
  }
});

// GET /api/students/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get student error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch student.' });
  }
});

// POST /api/students
router.post('/', authenticate, async (req, res) => {
  try {
    const { first_name, last_name, email, student_id, institution_id, phone, status } = req.body;
    const result = await pool.query(
      `INSERT INTO students (first_name, last_name, email, student_id, institution_id, phone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [first_name, last_name, email, student_id, institution_id, phone, status || 'active']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ success: false, error: 'Failed to create student.' });
  }
});

// PUT /api/students/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { first_name, last_name, email, student_id, institution_id, phone, status } = req.body;
    const result = await pool.query(
      `UPDATE students SET first_name = $1, last_name = $2, email = $3, student_id = $4,
       institution_id = $5, phone = $6, status = $7 WHERE id = $8 RETURNING *`,
      [first_name, last_name, email, student_id, institution_id, phone, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ success: false, error: 'Failed to update student.' });
  }
});

// DELETE /api/students/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }
    res.json({ success: true, data: { message: 'Student deleted successfully.' } });
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete student.' });
  }
});

module.exports = router;
