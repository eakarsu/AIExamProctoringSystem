const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

// GET /api/proctors
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proctors ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get proctors error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch proctors.' });
  }
});

// GET /api/proctors/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proctors WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Proctor not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get proctor error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch proctor.' });
  }
});

// POST /api/proctors
router.post('/', authenticate, async (req, res) => {
  try {
    const { first_name, last_name, email, phone, specialization, experience_years, status, certification, institution_id } = req.body;
    const result = await pool.query(
      `INSERT INTO proctors (first_name, last_name, email, phone, specialization, experience_years, status, certification, institution_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [first_name, last_name, email, phone, specialization, experience_years, status || 'active', certification, institution_id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Create proctor error:', err);
    res.status(500).json({ success: false, error: 'Failed to create proctor.' });
  }
});

// PUT /api/proctors/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { first_name, last_name, email, phone, specialization, experience_years, status, certification, institution_id } = req.body;
    const result = await pool.query(
      `UPDATE proctors SET first_name = $1, last_name = $2, email = $3, phone = $4,
       specialization = $5, experience_years = $6, status = $7, certification = $8, institution_id = $9
       WHERE id = $10 RETURNING *`,
      [first_name, last_name, email, phone, specialization, experience_years, status, certification, institution_id, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Proctor not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Update proctor error:', err);
    res.status(500).json({ success: false, error: 'Failed to update proctor.' });
  }
});

// DELETE /api/proctors/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM proctors WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Proctor not found.' });
    }
    res.json({ success: true, data: { message: 'Proctor deleted successfully.' } });
  } catch (err) {
    console.error('Delete proctor error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete proctor.' });
  }
});

module.exports = router;
