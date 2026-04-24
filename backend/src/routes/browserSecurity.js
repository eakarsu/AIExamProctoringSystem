const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

// GET /api/browser-security
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM browser_security_events ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get browser security events error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch browser security events.' });
  }
});

// GET /api/browser-security/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM browser_security_events WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Browser security event not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get browser security event error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch browser security event.' });
  }
});

// POST /api/browser-security
router.post('/', authenticate, async (req, res) => {
  try {
    const { session_id, event_type, details, ip_address, user_agent, blocked, timestamp } = req.body;
    const result = await pool.query(
      `INSERT INTO browser_security_events (session_id, event_type, details, ip_address, user_agent, blocked, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [session_id, event_type, details, ip_address, user_agent, blocked ?? false, timestamp || new Date()]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Create browser security event error:', err);
    res.status(500).json({ success: false, error: 'Failed to create browser security event.' });
  }
});

// PUT /api/browser-security/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { session_id, event_type, details, ip_address, user_agent, blocked, timestamp } = req.body;
    const result = await pool.query(
      `UPDATE browser_security_events SET session_id = $1, event_type = $2, details = $3,
       ip_address = $4, user_agent = $5, blocked = $6, timestamp = $7
       WHERE id = $8 RETURNING *`,
      [session_id, event_type, details, ip_address, user_agent, blocked, timestamp, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Browser security event not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Update browser security event error:', err);
    res.status(500).json({ success: false, error: 'Failed to update browser security event.' });
  }
});

// DELETE /api/browser-security/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM browser_security_events WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Browser security event not found.' });
    }
    res.json({ success: true, data: { message: 'Browser security event deleted successfully.' } });
  } catch (err) {
    console.error('Delete browser security event error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete browser security event.' });
  }
});

module.exports = router;
