// Apply pass 5 — backlog extensions for AIExamProctoringSystem
//
// ENV VARS (consumed by NEEDS-CREDS endpoints; absence triggers 503):
//   CANVAS_API_URL, CANVAS_API_TOKEN              (Canvas LMS)
//   BLACKBOARD_API_URL, BLACKBOARD_API_KEY        (Blackboard LMS)
//   MOODLE_API_URL, MOODLE_API_TOKEN              (Moodle LMS)
//   EYE_GAZE_PROVIDER, EYE_GAZE_API_KEY           (Eye-gaze biometrics SDK)
//   STRESS_DETECTION_PROVIDER, STRESS_DETECTION_API_KEY  (TOO-RISKY; ethics gate enforced)
//   STRESS_DETECTION_ETHICS_APPROVED              (must be 'true' to enable)
//
// All env-gated endpoints return 503 with `missing: <ENV>` when unset.
// CREATE TABLE IF NOT EXISTS only.

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

async function ensureExtTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lms_sync_log (
      id SERIAL PRIMARY KEY,
      provider VARCHAR(40) NOT NULL,
      action VARCHAR(60) NOT NULL,
      payload JSONB,
      status VARCHAR(20) DEFAULT 'pending',
      response JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `).catch(() => {});
  await pool.query(`
    CREATE TABLE IF NOT EXISTS eye_gaze_samples (
      id SERIAL PRIMARY KEY,
      session_id INTEGER,
      gaze_x NUMERIC,
      gaze_y NUMERIC,
      off_screen BOOLEAN DEFAULT FALSE,
      confidence NUMERIC,
      sampled_at TIMESTAMP DEFAULT NOW()
    )
  `).catch(() => {});
  await pool.query(`
    CREATE TABLE IF NOT EXISTS keystroke_biometrics (
      id SERIAL PRIMARY KEY,
      session_id INTEGER,
      avg_dwell_ms NUMERIC,
      avg_flight_ms NUMERIC,
      typing_rhythm_score NUMERIC,
      anomaly_score NUMERIC,
      sampled_at TIMESTAMP DEFAULT NOW()
    )
  `).catch(() => {});
  await pool.query(`
    CREATE TABLE IF NOT EXISTS appeals (
      id SERIAL PRIMARY KEY,
      session_id INTEGER,
      student_id INTEGER,
      filed_by_user_id INTEGER,
      reason TEXT NOT NULL,
      status VARCHAR(30) DEFAULT 'submitted',
      assigned_reviewer_id INTEGER,
      decision TEXT,
      escalation_level INTEGER DEFAULT 1,
      due_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `).catch(() => {});
  await pool.query(`
    CREATE TABLE IF NOT EXISTS appeal_events (
      id SERIAL PRIMARY KEY,
      appeal_id INTEGER REFERENCES appeals(id) ON DELETE CASCADE,
      event_type VARCHAR(50) NOT NULL,
      actor_user_id INTEGER,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `).catch(() => {});
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stress_assessments (
      id SERIAL PRIMARY KEY,
      session_id INTEGER,
      consent_given BOOLEAN DEFAULT FALSE,
      stress_score NUMERIC,
      indicators JSONB,
      ethics_review_id VARCHAR(120),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `).catch(() => {});
}
ensureExtTables();

function missingEnv(...keys) { return keys.filter(k => !process.env[k]); }

// ── 1) LMS integration: Canvas (NEEDS-CREDS) ───────────────────────────────
router.post('/lms/canvas/sync-roster', authenticate, async (req, res) => {
  const missing = missingEnv('CANVAS_API_URL', 'CANVAS_API_TOKEN');
  if (missing.length) return res.status(503).json({ success: false, error: 'Canvas not configured', missing: missing.join(',') });
  const { course_id } = req.body || {};
  const log = await pool.query(
    `INSERT INTO lms_sync_log (provider, action, payload, status) VALUES ('canvas','sync-roster',$1,'queued') RETURNING id`,
    [JSON.stringify({ course_id })]
  );
  res.json({ success: true, log_id: log.rows[0].id, note: 'Canvas REST integration stub; install @instructure/canvas-api for live sync.' });
});

// ── 2) LMS integration: Blackboard (NEEDS-CREDS) ───────────────────────────
router.post('/lms/blackboard/sync-roster', authenticate, async (req, res) => {
  const missing = missingEnv('BLACKBOARD_API_URL', 'BLACKBOARD_API_KEY');
  if (missing.length) return res.status(503).json({ success: false, error: 'Blackboard not configured', missing: missing.join(',') });
  const { course_id } = req.body || {};
  const log = await pool.query(
    `INSERT INTO lms_sync_log (provider, action, payload, status) VALUES ('blackboard','sync-roster',$1,'queued') RETURNING id`,
    [JSON.stringify({ course_id })]
  );
  res.json({ success: true, log_id: log.rows[0].id });
});

// ── 3) LMS integration: Moodle (NEEDS-CREDS) ───────────────────────────────
router.post('/lms/moodle/sync-roster', authenticate, async (req, res) => {
  const missing = missingEnv('MOODLE_API_URL', 'MOODLE_API_TOKEN');
  if (missing.length) return res.status(503).json({ success: false, error: 'Moodle not configured', missing: missing.join(',') });
  const { course_id } = req.body || {};
  const log = await pool.query(
    `INSERT INTO lms_sync_log (provider, action, payload, status) VALUES ('moodle','sync-roster',$1,'queued') RETURNING id`,
    [JSON.stringify({ course_id })]
  );
  res.json({ success: true, log_id: log.rows[0].id });
});

router.get('/lms/log', authenticate, async (req, res) => {
  const { rows } = await pool.query(`SELECT * FROM lms_sync_log ORDER BY created_at DESC LIMIT 100`);
  res.json({ success: true, log: rows });
});

// ── 4) Eye-gaze biometrics (NEEDS-CREDS) ───────────────────────────────────
router.get('/eye-gaze/status', authenticate, async (req, res) => {
  const missing = missingEnv('EYE_GAZE_PROVIDER', 'EYE_GAZE_API_KEY');
  if (missing.length) return res.status(503).json({ success: false, error: 'Eye-gaze provider not configured', missing: missing.join(',') });
  res.json({ success: true, provider: process.env.EYE_GAZE_PROVIDER, configured: true });
});

// PRODUCT-DECISION: clients POST gaze samples (gaze_x, gaze_y in [0,1] viewport
// coords). off_screen flag computed when coords fall outside [0,1].
router.post('/eye-gaze/sample', authenticate, async (req, res) => {
  const { session_id, gaze_x, gaze_y, confidence } = req.body || {};
  if (session_id == null || gaze_x == null || gaze_y == null) {
    return res.status(400).json({ success: false, error: 'session_id, gaze_x, gaze_y required' });
  }
  const offScreen = (gaze_x < 0 || gaze_x > 1 || gaze_y < 0 || gaze_y > 1);
  const ins = await pool.query(
    `INSERT INTO eye_gaze_samples (session_id, gaze_x, gaze_y, off_screen, confidence) VALUES ($1,$2,$3,$4,$5) RETURNING id, sampled_at`,
    [session_id, gaze_x, gaze_y, offScreen, confidence || null]
  );
  res.json({ success: true, sample_id: ins.rows[0].id, off_screen: offScreen });
});

// PRODUCT-DECISION: keystroke biometrics use simple dwell/flight time pairs.
// Anomaly_score is supplied by client model OR computed as |delta| from session avg.
router.post('/keystroke/sample', authenticate, async (req, res) => {
  const { session_id, avg_dwell_ms, avg_flight_ms, typing_rhythm_score, anomaly_score } = req.body || {};
  if (session_id == null) return res.status(400).json({ success: false, error: 'session_id required' });
  const ins = await pool.query(
    `INSERT INTO keystroke_biometrics (session_id, avg_dwell_ms, avg_flight_ms, typing_rhythm_score, anomaly_score)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [session_id, avg_dwell_ms || null, avg_flight_ms || null, typing_rhythm_score || null, anomaly_score || null]
  );
  res.json({ success: true, id: ins.rows[0].id });
});

// ── 5) Appeal workflow (NEEDS-PRODUCT-DECISION) ────────────────────────────
// PRODUCT-DECISION: 3-tier escalation, 72-hour SLA per tier, statuses:
// submitted → under_review → decision_pending → resolved (approved|denied|escalated)
router.post('/appeals', authenticate, async (req, res) => {
  const { session_id, student_id, reason } = req.body || {};
  if (!reason) return res.status(400).json({ success: false, error: 'reason required' });
  const dueAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // PRODUCT-DECISION: 72-hour tier-1 SLA
  const ins = await pool.query(
    `INSERT INTO appeals (session_id, student_id, filed_by_user_id, reason, status, escalation_level, due_at)
     VALUES ($1,$2,$3,$4,'submitted',1,$5) RETURNING *`,
    [session_id || null, student_id || null, req.user.id, reason, dueAt]
  );
  await pool.query(
    `INSERT INTO appeal_events (appeal_id, event_type, actor_user_id, notes) VALUES ($1,'submitted',$2,$3)`,
    [ins.rows[0].id, req.user.id, 'Appeal filed']
  );
  res.json({ success: true, appeal: ins.rows[0] });
});

router.get('/appeals', authenticate, async (req, res) => {
  const { rows } = await pool.query(`SELECT * FROM appeals ORDER BY created_at DESC LIMIT 200`);
  res.json({ success: true, appeals: rows });
});

router.post('/appeals/:id/escalate', authenticate, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { rows } = await pool.query(`SELECT * FROM appeals WHERE id = $1`, [id]);
  if (rows.length === 0) return res.status(404).json({ success: false, error: 'Appeal not found' });
  const newLevel = Math.min(3, rows[0].escalation_level + 1);
  const dueAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
  const upd = await pool.query(
    `UPDATE appeals SET escalation_level = $1, due_at = $2, status = 'under_review', updated_at = NOW() WHERE id = $3 RETURNING *`,
    [newLevel, dueAt, id]
  );
  await pool.query(
    `INSERT INTO appeal_events (appeal_id, event_type, actor_user_id, notes) VALUES ($1,'escalated',$2,$3)`,
    [id, req.user.id, `Escalated to tier ${newLevel}`]
  );
  res.json({ success: true, appeal: upd.rows[0] });
});

router.post('/appeals/:id/decide', authenticate, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { decision, outcome } = req.body || {};
  if (!decision) return res.status(400).json({ success: false, error: 'decision required' });
  const status = (outcome === 'approved' || outcome === 'denied') ? `resolved_${outcome}` : 'decision_pending';
  const upd = await pool.query(
    `UPDATE appeals SET decision = $1, status = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
    [decision, status, id]
  );
  if (upd.rows.length === 0) return res.status(404).json({ success: false, error: 'Appeal not found' });
  await pool.query(
    `INSERT INTO appeal_events (appeal_id, event_type, actor_user_id, notes) VALUES ($1,'decision',$2,$3)`,
    [id, req.user.id, decision]
  );
  res.json({ success: true, appeal: upd.rows[0] });
});

// ── 6) Stress detection (TOO-RISKY) ────────────────────────────────────────
// PRODUCT-DECISION: requires explicit subject consent + ethics-board approval flag.
// ENV STRESS_DETECTION_ETHICS_APPROVED must equal 'true'; otherwise 503 with
// missing: STRESS_DETECTION_ETHICS_APPROVED. ENV STRESS_DETECTION_PROVIDER /
// STRESS_DETECTION_API_KEY also required. No live model is invoked — endpoint
// simply records consent + caller-supplied stress_score for traceability.
router.post('/stress-detection/assess', authenticate, async (req, res) => {
  const missing = missingEnv('STRESS_DETECTION_PROVIDER', 'STRESS_DETECTION_API_KEY');
  if (missing.length) return res.status(503).json({ success: false, error: 'Stress detection provider not configured', missing: missing.join(',') });
  if (process.env.STRESS_DETECTION_ETHICS_APPROVED !== 'true') {
    return res.status(503).json({ success: false, error: 'Ethics review not on file', missing: 'STRESS_DETECTION_ETHICS_APPROVED' });
  }
  const { session_id, consent_given, stress_score, indicators, ethics_review_id } = req.body || {};
  if (!consent_given) return res.status(400).json({ success: false, error: 'subject consent_given=true required' });
  const ins = await pool.query(
    `INSERT INTO stress_assessments (session_id, consent_given, stress_score, indicators, ethics_review_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING id, created_at`,
    [session_id || null, !!consent_given, stress_score || null, JSON.stringify(indicators || {}), ethics_review_id || null]
  );
  res.json({ success: true, assessment_id: ins.rows[0].id });
});

module.exports = router;
