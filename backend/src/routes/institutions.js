const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

// GET /api/institutions
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM institutions ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get institutions error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch institutions.' });
  }
});

// GET /api/institutions/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM institutions WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Institution not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get institution error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch institution.' });
  }
});

// POST /api/institutions
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, type, address, city, state, country, email, phone, license_type, status } = req.body;
    const result = await pool.query(
      `INSERT INTO institutions (name, type, address, city, state, country, email, phone, license_type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, type, address, city, state, country, email, phone, license_type || 'basic', status || 'active']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Create institution error:', err);
    res.status(500).json({ success: false, error: 'Failed to create institution.' });
  }
});

// PUT /api/institutions/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, type, address, city, state, country, email, phone, license_type, status } = req.body;
    const result = await pool.query(
      `UPDATE institutions SET name = $1, type = $2, address = $3, city = $4, state = $5,
       country = $6, email = $7, phone = $8, license_type = $9, status = $10
       WHERE id = $11 RETURNING *`,
      [name, type, address, city, state, country, email, phone, license_type, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Institution not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Update institution error:', err);
    res.status(500).json({ success: false, error: 'Failed to update institution.' });
  }
});

// DELETE /api/institutions/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM institutions WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Institution not found.' });
    }
    res.json({ success: true, data: { message: 'Institution deleted successfully.' } });
  } catch (err) {
    console.error('Delete institution error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete institution.' });
  }
});

module.exports = router;
