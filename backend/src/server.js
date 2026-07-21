const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('./governance/runtime').validateRuntime();
const express = require('express');
const cors = require('cors');
const pool = require('./config/database');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;
const allowedOrigins = String(process.env.CLIENT_URL || 'http://localhost:3000').split(',').map((v) => v.trim());
app.use(cors({ origin: (origin, cb) => !origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error('Origin not allowed')), credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.get('/api/health', (_req, res) => res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } }));

const routes = [
  ['/api/auth', './routes/auth'], ['/api/dashboard', './routes/dashboard'], ['/api/exams', './routes/exams'],
  ['/api/students', './routes/students'], ['/api/proctors', './routes/proctors'], ['/api/institutions', './routes/institutions'],
  ['/api/sessions', './routes/sessions'], ['/api/incidents', './routes/incidents'], ['/api/results', './routes/results'],
  ['/api/ai/face-verification', './routes/aiFaceVerification'], ['/api/ai/behavior-analysis', './routes/aiBehaviorAnalysis'],
  ['/api/ai/audio-monitoring', './routes/aiAudioMonitoring'], ['/api/ai/plagiarism-detection', './routes/aiPlagiarismDetection'],
  ['/api/browser-security', './routes/browserSecurity'], ['/api/live-monitoring', './routes/liveMonitoring'], ['/api/settings', './routes/settings'],
  ['/api/ai/new', './routes/aiNew'], ['/api/ext', './routes/extensions'], ['/api/agentic-proctor', './routes/agenticProctor'],
  ['/api/keystroke-biometrics', './routes/keystrokeBiometrics'], ['/api/voice-auth', './routes/voiceAuth'],
  ['/api/environment-scan', './routes/environmentScan'], ['/api/stress-monitor', './routes/stressMonitor'],
  ['/api/accessibility', './routes/accessibilityAccommodations'], ['/api/post-exam-forensics', './routes/postExamForensics'],
  ['/api/custom-views', './routes/customViews'], ['/api/accommodation-integrity-audit', './routes/accommodationIntegrityAudit'],
  ['/api/governed-workflow', './governance/router'],
];
routes.forEach(([mount, modulePath]) => app.use(mount, require(modulePath)));
app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found.' }));
app.use((err, _req, res, _next) => { console.error('Unhandled error:', err.message); res.status(500).json({ success: false, error: 'Internal server error.' }); });

async function start() {
  await pool.query('SELECT 1');
  app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));
}
if (require.main === module) start().catch((error) => { console.error('Startup failed:', error.message); process.exit(1); });
module.exports = app;
