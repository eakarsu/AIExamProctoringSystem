const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

// GET /api/incidents
router.get('/', authenticate, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const countResult = await pool.query('SELECT COUNT(*) FROM incidents');
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query(
      'SELECT * FROM incidents ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get incidents error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch incidents.' });
  }
});

// GET /api/incidents/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM incidents WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Incident not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get incident error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch incident.' });
  }
});

// POST /api/incidents
router.post('/', authenticate, async (req, res) => {
  try {
    const { session_id, type, severity, description, timestamp, ai_confidence, status, resolved_by, resolution_notes } = req.body;
    const result = await pool.query(
      `INSERT INTO incidents (session_id, type, severity, description, timestamp, ai_confidence, status, resolved_by, resolution_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [session_id, type, severity || 'medium', description, timestamp || new Date(), ai_confidence, status || 'open', resolved_by, resolution_notes]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Create incident error:', err);
    res.status(500).json({ success: false, error: 'Failed to create incident.' });
  }
});

// PUT /api/incidents/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { session_id, type, severity, description, timestamp, ai_confidence, status, resolved_by, resolution_notes } = req.body;
    const result = await pool.query(
      `UPDATE incidents SET session_id = $1, type = $2, severity = $3, description = $4,
       timestamp = $5, ai_confidence = $6, status = $7, resolved_by = $8, resolution_notes = $9
       WHERE id = $10 RETURNING *`,
      [session_id, type, severity, description, timestamp, ai_confidence, status, resolved_by, resolution_notes, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Incident not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Update incident error:', err);
    res.status(500).json({ success: false, error: 'Failed to update incident.' });
  }
});

// DELETE /api/incidents/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM incidents WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Incident not found.' });
    }
    res.json({ success: true, data: { message: 'Incident deleted successfully.' } });
  } catch (err) {
    console.error('Delete incident error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete incident.' });
  }
});

module.exports = router;
