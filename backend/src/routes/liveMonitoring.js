const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

// GET /api/live-monitoring/active-sessions
router.get('/active-sessions', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ps.*,
              s.first_name AS student_first_name, s.last_name AS student_last_name, s.email AS student_email,
              e.title AS exam_title, e.subject AS exam_subject
       FROM proctoring_sessions ps
       LEFT JOIN students s ON ps.student_id = s.id
       LEFT JOIN exams e ON ps.exam_id = e.id
       WHERE ps.status = 'in_progress'
       ORDER BY ps.start_time DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get active sessions error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch active sessions.' });
  }
});

// GET /api/live-monitoring/session/:id/feed
router.get('/session/:id/feed', authenticate, async (req, res) => {
  try {
    const session = await pool.query('SELECT * FROM proctoring_sessions WHERE id = $1', [req.params.id]);
    if (session.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }

    const feedData = {
      session_id: parseInt(req.params.id, 10),
      status: session.rows[0].status,
      trust_score: session.rows[0].trust_score,
      webcam_active: session.rows[0].webcam_enabled,
      audio_active: session.rows[0].audio_enabled,
      browser_locked: session.rows[0].browser_locked,
      timestamp: new Date().toISOString(),
      face_detected: true,
      face_count: 1,
      eye_tracking: { looking_at_screen: true, gaze_direction: 'center' },
      audio_level: Math.random() * 0.3,
      keystrokes_per_minute: Math.floor(Math.random() * 60) + 20,
      mouse_activity: 'normal',
      tab_switches: 0,
      alerts: [],
    };

    res.json({ success: true, data: feedData });
  } catch (err) {
    console.error('Get session feed error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch session feed.' });
  }
});

// POST /api/live-monitoring/session/:id/flag
router.post('/session/:id/flag', authenticate, async (req, res) => {
  try {
    const { reason } = req.body;
    const sessionId = req.params.id;

    const session = await pool.query('SELECT * FROM proctoring_sessions WHERE id = $1', [sessionId]);
    if (session.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }

    await pool.query(
      "UPDATE proctoring_sessions SET status = 'flagged', notes = COALESCE(notes, '') || $1 WHERE id = $2",
      [`\n[FLAGGED] ${reason || 'No reason provided'}`, sessionId]
    );

    await pool.query(
      `INSERT INTO incidents (session_id, type, severity, description, timestamp, status)
       VALUES ($1, 'identity_mismatch', 'high', $2, NOW(), 'open')`,
      [sessionId, reason || 'Session flagged by proctor']
    );

    // Proctor audit log
    await pool.query(`
      CREATE TABLE IF NOT EXISTS proctor_actions (
        id SERIAL PRIMARY KEY,
        proctor_user_id INTEGER,
        session_id INTEGER,
        action VARCHAR(100),
        reason TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(
      `INSERT INTO proctor_actions (proctor_user_id, session_id, action, reason)
       VALUES ($1, $2, 'flag-session', $3)`,
      [req.user?.id || null, sessionId, reason || 'No reason provided']
    );

    res.json({ success: true, data: { message: 'Session flagged successfully.', session_id: parseInt(sessionId, 10) } });
  } catch (err) {
    console.error('Flag session error:', err);
    res.status(500).json({ success: false, error: 'Failed to flag session.' });
  }
});

module.exports = router;
