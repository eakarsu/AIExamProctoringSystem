const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { analyzeWithAI } = require('../services/aiService');

async function ensureAiAnalysesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_analyses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      analysis_type VARCHAR(100),
      event_id INTEGER,
      content TEXT,
      model VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

async function persistAnalysis(userId, analysisType, refId, content) {
  await ensureAiAnalysesTable();
  const result = await pool.query(
    `INSERT INTO ai_analyses (user_id, analysis_type, event_id, content, model)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [userId, analysisType, refId, content, 'anthropic/claude-3-5-sonnet-20241022']
  );
  return result.rows[0].id;
}

// POST /api/ai/new/session-risk-summary
router.post('/session-risk-summary', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) {
      return res.status(400).json({ success: false, error: 'session_id is required.' });
    }

    const [sessionResult, incidentsResult, browserEventsResult] = await Promise.all([
      pool.query('SELECT * FROM proctoring_sessions WHERE id = $1', [session_id]),
      pool.query('SELECT type, severity, description, timestamp FROM incidents WHERE session_id = $1 ORDER BY timestamp DESC', [session_id]),
      pool.query('SELECT COUNT(*) as count FROM browser_security_events WHERE session_id = $1', [session_id]),
    ]);

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }

    const session = sessionResult.rows[0];
    const incidents = incidentsResult.rows;
    const browserEventCount = parseInt(browserEventsResult.rows[0].count);

    const incidentSummary = incidents.length > 0
      ? incidents.map(i => `- [${i.severity}] ${i.type}: ${i.description || 'No description'} (${new Date(i.timestamp).toISOString()})`).join('\n')
      : 'No incidents recorded';

    const prompt = `You are an AI exam proctoring risk analyst. Provide a comprehensive risk assessment for the following exam session:

Session ID: ${session_id}
Status: ${session.status}
Trust Score: ${session.trust_score}/100
Start Time: ${session.start_time || 'Not started'}
End Time: ${session.end_time || 'Ongoing'}
Browser Locked: ${session.browser_locked}
Webcam Enabled: ${session.webcam_enabled}
Audio Enabled: ${session.audio_enabled}
Browser Security Events: ${browserEventCount}

Incidents (${incidents.length} total):
${incidentSummary}

Provide:
1. Overall Risk Level (Low/Medium/High/Critical)
2. Risk Score Assessment (explain the trust score trajectory)
3. Incident Pattern Analysis
4. Key Concerns
5. Recommended Proctor Actions
6. Integrity Verdict
7. Evidence Summary`;

    const analysis = await analyzeWithAI(prompt, 'You are an expert exam integrity analyst.');
    const analysisId = await persistAnalysis(req.user?.id, 'session-risk-summary', session_id, analysis);

    res.json({ success: true, data: { analysis, analysis_id: analysisId, session_id } });
  } catch (err) {
    console.error('Session risk summary error:', err);
    res.status(500).json({ success: false, error: 'Session risk summary failed.' });
  }
});

// POST /api/ai/new/exam-integrity-report
router.post('/exam-integrity-report', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const { exam_id } = req.body;
    if (!exam_id) {
      return res.status(400).json({ success: false, error: 'exam_id is required.' });
    }

    const [examResult, sessionsResult] = await Promise.all([
      pool.query('SELECT * FROM exams WHERE id = $1', [exam_id]),
      pool.query(
        `SELECT ps.id, ps.student_id, ps.trust_score, ps.status,
                s.first_name, s.last_name, s.email,
                COUNT(i.id) as incident_count
         FROM proctoring_sessions ps
         LEFT JOIN students s ON ps.student_id = s.id
         LEFT JOIN incidents i ON i.session_id = ps.id
         WHERE ps.exam_id = $1
         GROUP BY ps.id, s.first_name, s.last_name, s.email
         ORDER BY ps.trust_score ASC`,
        [exam_id]
      ),
    ]);

    if (examResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Exam not found.' });
    }

    const exam = examResult.rows[0];
    const sessions = sessionsResult.rows;
    const avgTrustScore = sessions.length > 0
      ? (sessions.reduce((sum, s) => sum + parseFloat(s.trust_score || 100), 0) / sessions.length).toFixed(2)
      : 100;

    const flaggedSessions = sessions.filter(s => s.status === 'flagged' || parseFloat(s.trust_score) < 70);
    const sessionSummary = sessions.map(s =>
      `- ${s.first_name || 'Unknown'} ${s.last_name || ''} (session ${s.id}): trust=${s.trust_score}, incidents=${s.incident_count}, status=${s.status}`
    ).join('\n');

    const prompt = `You are an exam integrity auditor. Generate a comprehensive integrity report for:

Exam: ${exam.title}
Subject: ${exam.subject || 'N/A'}
Total Sessions: ${sessions.length}
Average Trust Score: ${avgTrustScore}/100
Flagged Sessions: ${flaggedSessions.length}

Session Breakdown:
${sessionSummary || 'No sessions found'}

Provide:
1. Exam Integrity Overview
2. Statistical Summary (trust score distribution, incident rates)
3. Flagged Students List with reasons
4. Risk Pattern Analysis across all sessions
5. Comparison to Normal Benchmarks
6. Recommendations for Future Exams
7. Overall Exam Integrity Rating`;

    const analysis = await analyzeWithAI(prompt, 'You are an expert exam integrity auditor.');
    const analysisId = await persistAnalysis(req.user?.id, 'exam-integrity-report', exam_id, analysis);

    res.json({
      success: true,
      data: {
        analysis,
        analysis_id: analysisId,
        exam_id,
        flagged_students: flaggedSessions.map(s => ({
          session_id: s.id,
          student: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
          trust_score: s.trust_score,
          incident_count: s.incident_count,
          status: s.status,
        })),
      },
    });
  } catch (err) {
    console.error('Exam integrity report error:', err);
    res.status(500).json({ success: false, error: 'Exam integrity report failed.' });
  }
});

// POST /api/ai/new/post-exam-forensics
router.post('/post-exam-forensics', authenticate, aiRateLimiter, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ success: false, error: 'AI service unavailable: OPENROUTER_API_KEY not configured.' });
    }

    const { session_id } = req.body;
    if (!session_id) {
      return res.status(400).json({ success: false, error: 'session_id is required.' });
    }

    const [sessionResult, incidentsResult, browserEventsResult] = await Promise.all([
      pool.query('SELECT * FROM proctoring_sessions WHERE id = $1', [session_id]),
      pool.query(
        `SELECT type, severity, description, timestamp FROM incidents
         WHERE session_id = $1 ORDER BY timestamp ASC`,
        [session_id]
      ),
      pool.query(
        `SELECT event_type, details, timestamp FROM browser_security_events
         WHERE session_id = $1 ORDER BY timestamp ASC LIMIT 200`,
        [session_id]
      ).catch(() => ({ rows: [] })),
    ]);

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }

    const session = sessionResult.rows[0];
    const incidents = incidentsResult.rows;
    const browserEvents = browserEventsResult.rows || [];

    const timeline = [];
    incidents.forEach(i => timeline.push({ ts: i.timestamp, kind: 'incident', text: `[${i.severity}] ${i.type}: ${i.description || ''}` }));
    browserEvents.forEach(e => timeline.push({ ts: e.timestamp, kind: 'browser', text: `${e.event_type}: ${typeof e.details === 'object' ? JSON.stringify(e.details) : (e.details || '')}` }));
    timeline.sort((a, b) => new Date(a.ts) - new Date(b.ts));

    const timelineSummary = timeline.length > 0
      ? timeline.slice(0, 80).map(e => `[${new Date(e.ts).toISOString()}] (${e.kind}) ${e.text}`).join('\n')
      : 'No events recorded.';

    const prompt = `You are conducting post-exam forensic review. Build a replay-ready forensic timeline summary for this session.

Session ID: ${session_id}
Status: ${session.status}
Trust Score: ${session.trust_score}/100
Start Time: ${session.start_time || 'Unknown'}
End Time: ${session.end_time || 'Unknown'}

Chronological events (incidents + browser security):
${timelineSummary}

Provide:
1. Replay narrative (chronological summary suitable for a reviewer to play back)
2. Critical evidence moments (timestamp + why it matters)
3. Pattern clusters (groups of related events)
4. Integrity verdict (clear pass / suspect / fail with rationale)
5. Recommended evidentiary clips (timestamp ranges to retain)
6. Chain-of-custody notes`;

    const analysis = await analyzeWithAI(prompt, 'You are an expert exam forensic investigator.');
    const analysisId = await persistAnalysis(req.user?.id, 'post-exam-forensics', session_id, analysis);

    res.json({
      success: true,
      data: {
        analysis,
        analysis_id: analysisId,
        session_id,
        event_count: timeline.length,
      },
    });
  } catch (err) {
    console.error('Post-exam forensics error:', err);
    const msg = String(err.message || '');
    if (/OPENROUTER_API_KEY|api.?key/i.test(msg)) {
      return res.status(503).json({ success: false, error: 'AI service unavailable: ' + msg });
    }
    res.status(500).json({ success: false, error: 'Post-exam forensics failed.' });
  }
});

// POST /api/ai/new/proctor-recommendations
router.post('/proctor-recommendations', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) {
      return res.status(400).json({ success: false, error: 'session_id is required.' });
    }

    await ensureAiAnalysesTable();

    const [sessionResult, latestAnalysesResult] = await Promise.all([
      pool.query('SELECT * FROM proctoring_sessions WHERE id = $1', [session_id]),
      pool.query(
        `SELECT analysis_type, content, created_at FROM ai_analyses
         WHERE event_id = $1
         ORDER BY created_at DESC LIMIT 5`,
        [session_id]
      ),
    ]);

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }

    const session = sessionResult.rows[0];
    const analyses = latestAnalysesResult.rows;

    const analysesSummary = analyses.length > 0
      ? analyses.map(a => `[${a.analysis_type} at ${new Date(a.created_at).toISOString()}]:\n${a.content.substring(0, 500)}...`).join('\n\n')
      : 'No prior AI analyses found for this session.';

    const prompt = `You are an expert exam proctor advisor. Based on the following session data and AI analyses, generate actionable proctor recommendations:

Session ID: ${session_id}
Current Status: ${session.status}
Trust Score: ${session.trust_score}/100

Recent AI Analyses:
${analysesSummary}

Provide specific, prioritized proctor action recommendations:
1. Immediate Actions Required (if any)
2. Monitoring Adjustments
3. Intervention Strategies
4. Documentation Requirements
5. Escalation Criteria
6. Risk Mitigation Steps
7. Communication Recommendations (what to tell the student if needed)`;

    const analysis = await analyzeWithAI(prompt, 'You are an expert exam proctor advisor providing actionable guidance.');
    const analysisId = await persistAnalysis(req.user?.id, 'proctor-recommendations', session_id, analysis);

    res.json({ success: true, data: { analysis, analysis_id: analysisId, session_id } });
  } catch (err) {
    console.error('Proctor recommendations error:', err);
    res.status(500).json({ success: false, error: 'Proctor recommendations failed.' });
  }
});

module.exports = router;
