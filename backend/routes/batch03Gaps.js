// ============================================================
// === Batch 03 Gaps & Frontend Mounts ===
// Auto-generated Gap-feature endpoints (lean v0).
// TODO: configure credentials (set OPENROUTER_API_KEY).
// ============================================================
const express = require('express');
const router = express.Router();

let _gfReady = false;
async function ensureGapTable(pool) {
  if (_gfReady || !pool) return;
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS gap_features (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(120) NOT NULL,
      user_id INT,
      input JSONB,
      output JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    _gfReady = true;
  } catch (_) { /* tolerant of missing DB */ }
}

async function callAI(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return { ok: false, status: 503, error: 'AI service unavailable. Set OPENROUTER_API_KEY (TODO: configure credentials).' };
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
      }),
    });
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content || '';
    return { ok: r.ok, status: r.status, text, raw: data };
  } catch (e) {
    return { ok: false, status: 500, error: String(e.message || e) };
  }
}

function buildHandler(slug, label, hint) {
  return async (req, res) => {
    const body = req.body || {};
    const userId = req.user?.id || null;
    const prompt = `Feature: ${label}\nContext hint: ${hint}\nUser input:\n${JSON.stringify(body, null, 2)}\n\nProduce a concise, actionable response.`;
    const ai = await callAI(prompt);
    try {
      const pool = req.app.locals.pool || req.app.get('pool') || null;
      if (pool) {
        await ensureGapTable(pool);
        await pool.query('INSERT INTO gap_features(slug, user_id, input, output) VALUES ($1,$2,$3,$4)',
          [slug, userId, body, { text: ai.text || ai.error || null }]);
      }
    } catch (_) { /* tolerant */ }
    if (!ai.ok) return res.status(ai.status || 500).json({ error: ai.error || ai.text || `Upstream error (${ai.status})`, slug });
    res.json({ slug, label, result: ai.text });
  };
}

router.post('/gap-no-keystroke-dynamics-biometric', buildHandler('gap-ai-no-keystroke-dynamics-biometric', 'No keystroke-dynamics biometric', 'No keystroke-dynamics biometric'));
router.post('/gap-no-environment-verification-scan-full-room-visual-check', buildHandler('gap-ai-no-environment-verification-scan-full-room-visual-check', 'No environment-verification scan (full-room visual check)', 'No environment-verification scan (full-room visual check)'));
router.post('/gap-no-stress-detection-from-micro-expressions', buildHandler('gap-ai-no-stress-detection-from-micro-expressions', 'No stress detection from micro-expressions', 'No stress detection from micro-expressions'));
router.post('/gap-no-lms-connectors-canvas-blackboard-endpoints-surfaced', buildHandler('gap-non-no-lms-connectors-canvas-blackboard-endpoints-surfaced', 'No LMS connectors (Canvas/Blackboard) endpoints surfaced', 'No LMS connectors (Canvas/Blackboard) endpoints surfaced'));
router.post('/gap-no-question-bank-module', buildHandler('gap-non-no-question-bank-module', 'No question-bank module', 'No question-bank module'));
router.post('/gap-no-exam-scheduling-calendar-surface', buildHandler('gap-non-no-exam-scheduling-calendar-surface', 'No exam-scheduling calendar surface', 'No exam-scheduling calendar surface'));
router.post('/gap-no-proctor-assignment-workflow', buildHandler('gap-non-no-proctor-assignment-workflow', 'No proctor-assignment workflow', 'No proctor-assignment workflow'));
router.post('/gap-no-appeal-workflow', buildHandler('gap-non-no-appeal-workflow', 'No appeal workflow', 'No appeal workflow'));
router.post('/gap-no-search-across-sessions-incidents', buildHandler('gap-non-no-search-across-sessions-incidents', 'No search across sessions/incidents', 'No search across sessions/incidents'));
router.post('/gap-no-webhooks-no-lms-callback', buildHandler('gap-non-no-webhooks-no-lms-callback', 'No webhooks (no LMS callback)', 'No webhooks (no LMS callback)'));

module.exports = router;
