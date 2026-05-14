// Environment scan: camera sweep for unauthorised materials.
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

async function describeImages(images) {
  // TODO: configure credentials — OPENAI_API_KEY (vision)
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const content = [
    { type: 'text', text: 'Examine the room photos. Flag any unauthorised materials (notes, second monitor, phone, books). Output JSON {"violations":[{"type":"...","confidence":0..1}],"clear":bool}.' },
    ...images.slice(0, 8).map(img => img.url ? { type: 'image_url', image_url: { url: img.url } } : { type: 'image_url', image_url: { url: `data:image/png;base64,${img.base64}` } }),
  ];
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content }], max_tokens: 600 }),
  });
  if (!r.ok) return null;
  const j = await r.json();
  return j.choices?.[0]?.message?.content;
}

// POST /api/environment-scan/check { session_id, images:[{url? base64?}] }
router.post('/check', authenticate, async (req, res) => {
  try {
    const { session_id, images = [] } = req.body || {};
    if (!session_id || !Array.isArray(images) || !images.length) return res.status(400).json({ error: 'session_id + images[] required' });
    const raw = await describeImages(images);
    if (!raw) return res.status(503).json({ error: 'Vision API not configured' });
    let parsed;
    try { parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || raw); } catch { parsed = { raw }; }
    try {
      await pool.query(`INSERT INTO incidents (session_id, severity, flags, source, created_at) VALUES ($1,$2,$3,'env_scan',NOW())`, [session_id, parsed.clear ? 'low' : 'high', JSON.stringify(parsed)]);
    } catch {}
    return res.json({ session_id, scan: parsed });
  } catch (e) {
    return res.status(500).json({ error: 'check failed' });
  }
});

module.exports = router;
