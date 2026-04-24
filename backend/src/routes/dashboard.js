const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const [exams, students, sessions, incidents, institutions, activeSessions] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM exams'),
      pool.query('SELECT COUNT(*) FROM students'),
      pool.query('SELECT COUNT(*) FROM proctoring_sessions'),
      pool.query('SELECT COUNT(*) FROM incidents'),
      pool.query('SELECT COUNT(*) FROM institutions'),
      pool.query("SELECT COUNT(*) FROM proctoring_sessions WHERE status = 'in_progress'"),
    ]);

    res.json({
      success: true,
      data: {
        total_exams: parseInt(exams.rows[0].count, 10),
        total_students: parseInt(students.rows[0].count, 10),
        total_sessions: parseInt(sessions.rows[0].count, 10),
        total_incidents: parseInt(incidents.rows[0].count, 10),
        total_institutions: parseInt(institutions.rows[0].count, 10),
        active_sessions: parseInt(activeSessions.rows[0].count, 10),
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats.' });
  }
});

module.exports = router;
