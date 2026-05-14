// Voice authentication: verify identity by voice sample.
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

async function transcribeAndAnalyse(base64, mimeType = 'audio/webm') {
  // TODO: configure credentials — OPENAI_API_KEY (whisper)
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const buf = Buffer.from(base64, 'base64');
  const form = new FormData();
  form.append('file', new Blob([buf], { type: mimeType }), 'voice.webm');
  form.append('model', 'whisper-1');
  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  if (!r.ok) return null;
  return await r.json();
}

// POST /api/voice-auth/enrol { user_id, audio_base64, passphrase }
router.post('/enrol', authenticate, async (req, res) => {
  try {
    const { user_id, audio_base64, passphrase, mimeType } = req.body || {};
    if (!user_id || !audio_base64 || !passphrase) return res.status(400).json({ error: 'user_id, audio_base64, passphrase required' });
    const t = await transcribeAndAnalyse(audio_base64, mimeType);
    if (!t) return res.status(503).json({ error: 'OPENAI_API_KEY missing' });
    const transcript = t.text || '';
    const phraseMatch = transcript.toLowerCase().includes(passphrase.toLowerCase());
    try {
      await pool.query(`INSERT INTO voice_baselines (user_id, passphrase, sample_transcript, created_at) VALUES ($1,$2,$3,NOW()) ON CONFLICT (user_id) DO UPDATE SET sample_transcript=EXCLUDED.sample_transcript`, [user_id, passphrase, transcript]);
    } catch {}
    return res.json({ user_id, enrolled: phraseMatch, transcript });
  } catch (e) {
    return res.status(500).json({ error: 'enrol failed' });
  }
});

// POST /api/voice-auth/verify { user_id, audio_base64 }
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { user_id, audio_base64, mimeType } = req.body || {};
    if (!user_id || !audio_base64) return res.status(400).json({ error: 'user_id + audio_base64 required' });
    const r = await pool.query(`SELECT passphrase FROM voice_baselines WHERE user_id = $1`, [user_id]).catch(() => ({ rows: [] }));
    if (!r.rows[0]) return res.status(404).json({ error: 'no enrolment' });
    const t = await transcribeAndAnalyse(audio_base64, mimeType);
    if (!t) return res.status(503).json({ error: 'OPENAI_API_KEY missing' });
    const verified = (t.text || '').toLowerCase().includes(String(r.rows[0].passphrase).toLowerCase());
    return res.json({ user_id, verified, transcript: t.text });
  } catch (e) {
    return res.status(500).json({ error: 'verify failed' });
  }
});

module.exports = router;
