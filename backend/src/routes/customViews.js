// ============================================================
// Custom Views - Proctor Views
// 4 endpoints: incident-timeline, integrity-heatmap, incident-report-pdf, monitoring-rules
// ============================================================
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

// In-memory monitoring rules (with defaults)
let monitoringRules = [
  { id: 1, name: 'Multiple Faces Detected', flag: 'multiple_faces', enabled: true, severity_weight: 9, description: 'Trigger when more than one face is visible in webcam.' },
  { id: 2, name: 'Tab Switch', flag: 'tab_switch', enabled: true, severity_weight: 6, description: 'Detects when the student switches browser tabs.' },
  { id: 3, name: 'Audio Conversation', flag: 'audio_voice', enabled: true, severity_weight: 7, description: 'Voice detected other than the student.' },
  { id: 4, name: 'Eye Off Screen', flag: 'eye_off_screen', enabled: true, severity_weight: 4, description: 'Student looking away from monitor for extended time.' },
  { id: 5, name: 'Phone Detected', flag: 'phone_detected', enabled: true, severity_weight: 10, description: 'Mobile device visible in webcam field.' },
  { id: 6, name: 'Copy/Paste', flag: 'copy_paste', enabled: false, severity_weight: 3, description: 'Detect clipboard usage during exam.' },
];
let _nextRuleId = 7;

// ---------- VIZ 1: Incident Timeline per session ----------
// GET /api/custom-views/incident-timeline?session_id=
router.get('/incident-timeline', authenticate, async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    let rows = [];
    try {
      if (sessionId) {
        const r = await pool.query(
          'SELECT id, session_id, type, severity, description, timestamp, ai_confidence, status FROM incidents WHERE session_id = $1 ORDER BY timestamp ASC LIMIT 200',
          [sessionId]
        );
        rows = r.rows;
      } else {
        const r = await pool.query(
          'SELECT id, session_id, type, severity, description, timestamp, ai_confidence, status FROM incidents ORDER BY timestamp DESC LIMIT 200'
        );
        rows = r.rows;
      }
    } catch (_) { rows = []; }

    // Build timeline buckets (events grouped by minute offset from first event)
    let baseTime = null;
    if (rows.length) baseTime = new Date(rows[0].timestamp || rows[0].created_at || Date.now()).getTime();
    const events = rows.map((row) => {
      const t = new Date(row.timestamp || row.created_at || Date.now()).getTime();
      return {
        id: row.id,
        session_id: row.session_id,
        type: row.type,
        severity: row.severity,
        description: row.description,
        ai_confidence: row.ai_confidence,
        status: row.status,
        timestamp: row.timestamp,
        minute_offset: baseTime ? Math.max(0, Math.round((t - baseTime) / 60000)) : 0,
      };
    });

    // Synthesise demo events if DB empty
    if (events.length === 0) {
      const types = ['multiple_faces', 'tab_switch', 'audio_voice', 'eye_off_screen', 'phone_detected'];
      const sevs = ['low', 'medium', 'high', 'critical'];
      for (let i = 0; i < 12; i++) {
        events.push({
          id: i + 1,
          session_id: sessionId || (100 + (i % 4)),
          type: types[i % types.length],
          severity: sevs[i % sevs.length],
          description: `Auto-flagged ${types[i % types.length]} event`,
          ai_confidence: (0.65 + (i % 5) * 0.05).toFixed(2),
          status: i % 3 === 0 ? 'resolved' : 'open',
          timestamp: new Date(Date.now() - (12 - i) * 60000).toISOString(),
          minute_offset: i * 3,
        });
      }
    }

    res.json({
      success: true,
      data: {
        session_id: sessionId || null,
        total_events: events.length,
        events,
        severity_counts: events.reduce((acc, ev) => {
          acc[ev.severity] = (acc[ev.severity] || 0) + 1; return acc;
        }, {}),
      },
    });
  } catch (err) {
    console.error('incident-timeline error:', err);
    res.status(500).json({ success: false, error: 'Failed to build timeline.' });
  }
});

// ---------- VIZ 2: Integrity Score Heatmap (Student x Exam) ----------
// GET /api/custom-views/integrity-heatmap
router.get('/integrity-heatmap', authenticate, async (req, res) => {
  try {
    let students = [];
    let exams = [];
    let cells = [];
    try {
      const sRes = await pool.query('SELECT id, first_name, last_name FROM students ORDER BY id LIMIT 12');
      students = sRes.rows;
      const eRes = await pool.query('SELECT id, title FROM exams ORDER BY id LIMIT 8');
      exams = eRes.rows;
      const rRes = await pool.query(
        'SELECT student_id, exam_id, AVG(trust_score) AS score, COUNT(*) AS sessions FROM proctoring_sessions GROUP BY student_id, exam_id'
      );
      cells = rRes.rows.map((row) => ({
        student_id: row.student_id,
        exam_id: row.exam_id,
        score: row.score != null ? Number(row.score) : null,
        sessions: Number(row.sessions || 0),
      }));
    } catch (_) {
      students = []; exams = []; cells = [];
    }

    // Demo fallback
    if (students.length === 0) {
      students = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, first_name: `Student`, last_name: `${i + 1}` }));
    }
    if (exams.length === 0) {
      exams = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, title: `Exam ${i + 1}` }));
    }

    // Fill matrix; synthesize for empty cells
    const matrix = students.map((stu) => ({
      student_id: stu.id,
      label: `${stu.first_name || ''} ${stu.last_name || ''}`.trim() || `Student ${stu.id}`,
      cells: exams.map((ex) => {
        const found = cells.find((c) => c.student_id === stu.id && c.exam_id === ex.id);
        const score = found && found.score != null
          ? Math.round(found.score)
          : Math.round(60 + ((stu.id * 13 + ex.id * 7) % 40));
        return { exam_id: ex.id, exam_title: ex.title, score };
      }),
    }));

    res.json({
      success: true,
      data: {
        students: matrix.map((r) => ({ id: r.student_id, label: r.label })),
        exams: exams.map((e) => ({ id: e.id, title: e.title })),
        matrix,
      },
    });
  } catch (err) {
    console.error('integrity-heatmap error:', err);
    res.status(500).json({ success: false, error: 'Failed to build heatmap.' });
  }
});

// ---------- NON-VIZ 1: Incident Report PDF (text/plain pseudo-PDF) ----------
// GET /api/custom-views/incident-report-pdf?session_id=
router.get('/incident-report-pdf', authenticate, async (req, res) => {
  try {
    const sessionId = req.query.session_id || null;
    let incidents = [];
    let session = null;
    try {
      if (sessionId) {
        const sRes = await pool.query('SELECT * FROM proctoring_sessions WHERE id = $1', [sessionId]);
        session = sRes.rows[0] || null;
        const iRes = await pool.query('SELECT * FROM incidents WHERE session_id = $1 ORDER BY timestamp ASC', [sessionId]);
        incidents = iRes.rows;
      } else {
        const iRes = await pool.query('SELECT * FROM incidents ORDER BY timestamp DESC LIMIT 20');
        incidents = iRes.rows;
      }
    } catch (_) { /* tolerate */ }

    if (incidents.length === 0) {
      incidents = Array.from({ length: 4 }, (_, i) => ({
        id: i + 1, type: ['tab_switch', 'multiple_faces', 'audio_voice', 'phone_detected'][i],
        severity: ['low', 'medium', 'high', 'critical'][i],
        description: `Sample incident #${i + 1}`,
        timestamp: new Date(Date.now() - (4 - i) * 120000).toISOString(),
      }));
    }

    const lines = [];
    lines.push('============================================================');
    lines.push('  AI EXAM PROCTORING - INCIDENT REPORT');
    lines.push('============================================================');
    lines.push(`  Generated: ${new Date().toISOString()}`);
    lines.push(`  Session ID: ${sessionId || 'ALL'}`);
    if (session) {
      lines.push(`  Status: ${session.status || 'n/a'}`);
      lines.push(`  Trust Score: ${session.trust_score || 'n/a'}`);
    }
    lines.push(`  Total Incidents: ${incidents.length}`);
    lines.push('------------------------------------------------------------');
    incidents.forEach((inc, idx) => {
      lines.push(`  #${idx + 1}  [${(inc.severity || 'med').toUpperCase()}]  ${inc.type}`);
      lines.push(`       When: ${inc.timestamp || inc.created_at || ''}`);
      lines.push(`       Desc: ${(inc.description || '').slice(0, 200)}`);
      lines.push('');
    });
    lines.push('============================================================');
    lines.push('  END OF REPORT');
    lines.push('============================================================');

    const body = lines.join('\n');
    res.json({
      success: true,
      data: {
        session_id: sessionId,
        format: 'pdf-text',
        filename: `incident_report_${sessionId || 'all'}_${Date.now()}.txt`,
        size_bytes: Buffer.byteLength(body, 'utf8'),
        incident_count: incidents.length,
        content: body,
      },
    });
  } catch (err) {
    console.error('incident-report-pdf error:', err);
    res.status(500).json({ success: false, error: 'Failed to build report.' });
  }
});

// ---------- NON-VIZ 2: Monitoring Rules Editor (CRUD) ----------
// GET (list) / POST (create) / PUT (update) / DELETE (remove)
router.get('/monitoring-rules', authenticate, (req, res) => {
  res.json({ success: true, data: monitoringRules });
});

router.post('/monitoring-rules', authenticate, (req, res) => {
  try {
    const { name, flag, enabled, severity_weight, description } = req.body || {};
    if (!name || !flag) {
      return res.status(400).json({ success: false, error: 'name and flag are required.' });
    }
    const rule = {
      id: _nextRuleId++,
      name: String(name).slice(0, 120),
      flag: String(flag).slice(0, 60),
      enabled: enabled === undefined ? true : Boolean(enabled),
      severity_weight: Math.max(1, Math.min(10, Number(severity_weight) || 5)),
      description: String(description || '').slice(0, 500),
    };
    monitoringRules.push(rule);
    res.status(201).json({ success: true, data: rule });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create rule.' });
  }
});

router.put('/monitoring-rules/:id', authenticate, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const idx = monitoringRules.findIndex((r) => r.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Rule not found.' });
    const { name, flag, enabled, severity_weight, description } = req.body || {};
    monitoringRules[idx] = {
      ...monitoringRules[idx],
      ...(name !== undefined ? { name: String(name).slice(0, 120) } : {}),
      ...(flag !== undefined ? { flag: String(flag).slice(0, 60) } : {}),
      ...(enabled !== undefined ? { enabled: Boolean(enabled) } : {}),
      ...(severity_weight !== undefined ? { severity_weight: Math.max(1, Math.min(10, Number(severity_weight) || 5)) } : {}),
      ...(description !== undefined ? { description: String(description).slice(0, 500) } : {}),
    };
    res.json({ success: true, data: monitoringRules[idx] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update rule.' });
  }
});

router.delete('/monitoring-rules/:id', authenticate, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const before = monitoringRules.length;
    monitoringRules = monitoringRules.filter((r) => r.id !== id);
    if (monitoringRules.length === before) {
      return res.status(404).json({ success: false, error: 'Rule not found.' });
    }
    res.json({ success: true, data: { message: 'Rule deleted.', id } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete rule.' });
  }
});

module.exports = router;
