const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

// GET /api/settings
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings ORDER BY key ASC');

    const settings = {};
    result.rows.forEach((row) => {
      settings[row.key] = row.value;
    });

    res.json({ success: true, data: settings });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch settings.' });
  }
});

// PUT /api/settings
router.put('/', authenticate, async (req, res) => {
  try {
    const settingsToUpdate = req.body;

    for (const [key, value] of Object.entries(settingsToUpdate)) {
      await pool.query(
        `INSERT INTO settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, String(value)]
      );
    }

    const result = await pool.query('SELECT * FROM settings ORDER BY key ASC');
    const settings = {};
    result.rows.forEach((row) => {
      settings[row.key] = row.value;
    });

    res.json({ success: true, data: settings });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ success: false, error: 'Failed to update settings.' });
  }
});

module.exports = router;
