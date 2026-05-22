const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/students', require('./routes/students'));
app.use('/api/proctors', require('./routes/proctors'));
app.use('/api/institutions', require('./routes/institutions'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/results', require('./routes/results'));
app.use('/api/ai/face-verification', require('./routes/aiFaceVerification'));
app.use('/api/ai/behavior-analysis', require('./routes/aiBehaviorAnalysis'));
app.use('/api/ai/audio-monitoring', require('./routes/aiAudioMonitoring'));
app.use('/api/ai/plagiarism-detection', require('./routes/aiPlagiarismDetection'));
app.use('/api/browser-security', require('./routes/browserSecurity'));
app.use('/api/live-monitoring', require('./routes/liveMonitoring'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/ai/new', require('./routes/aiNew'));
app.use('/api/ext', require('./routes/extensions')); // Apply pass 5 backlog: LMS, eye-gaze, appeals, stress detection
app.use('/api/agentic-proctor', require('./routes/agenticProctor'));
app.use('/api/keystroke-biometrics', require('./routes/keystrokeBiometrics'));
app.use('/api/voice-auth', require('./routes/voiceAuth'));
app.use('/api/environment-scan', require('./routes/environmentScan'));
app.use('/api/stress-monitor', require('./routes/stressMonitor'));
app.use('/api/accessibility', require('./routes/accessibilityAccommodations'));
app.use('/api/post-exam-forensics', require('./routes/postExamForensics'));
app.use('/api/custom-views', require('./routes/customViews'));
app.use('/api/accommodation-integrity-audit', require('./routes/accommodationIntegrityAudit'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

// Initialize database and start server
async function initializeDatabase() {
  try {
    await pool.query('SELECT NOW()');
    console.log('PostgreSQL connected successfully.');

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) DEFAULT '',
        last_name VARCHAR(100) DEFAULT '',
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS institutions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'university',
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(50),
        license_type VARCHAR(50) DEFAULT 'basic',
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS exams (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        subject VARCHAR(100),
        duration_minutes INTEGER,
        total_marks INTEGER,
        passing_marks INTEGER,
        status VARCHAR(50) DEFAULT 'draft',
        institution_id INTEGER REFERENCES institutions(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE,
        student_id VARCHAR(100),
        institution_id INTEGER REFERENCES institutions(id) ON DELETE SET NULL,
        phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS proctors (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        specialization VARCHAR(100),
        experience_years INTEGER,
        status VARCHAR(50) DEFAULT 'active',
        certification VARCHAR(255),
        institution_id INTEGER REFERENCES institutions(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS proctoring_sessions (
        id SERIAL PRIMARY KEY,
        exam_id INTEGER REFERENCES exams(id) ON DELETE SET NULL,
        student_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
        proctor_id INTEGER REFERENCES proctors(id) ON DELETE SET NULL,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        status VARCHAR(50) DEFAULT 'scheduled',
        trust_score DECIMAL(5,2) DEFAULT 100,
        browser_locked BOOLEAN DEFAULT TRUE,
        webcam_enabled BOOLEAN DEFAULT TRUE,
        audio_enabled BOOLEAN DEFAULT TRUE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS incidents (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
        type VARCHAR(100) NOT NULL,
        severity VARCHAR(50) DEFAULT 'medium',
        description TEXT,
        timestamp TIMESTAMP DEFAULT NOW(),
        ai_confidence DECIMAL(5,4),
        status VARCHAR(50) DEFAULT 'open',
        resolved_by INTEGER,
        resolution_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS exam_results (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES proctoring_sessions(id) ON DELETE SET NULL,
        exam_id INTEGER REFERENCES exams(id) ON DELETE SET NULL,
        student_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
        score DECIMAL(8,2),
        total_marks INTEGER,
        percentage DECIMAL(5,2),
        grade VARCHAR(10),
        trust_score DECIMAL(5,2),
        incidents_count INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'passed',
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS face_verification_logs (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
        analysis TEXT,
        confidence DECIMAL(5,4) DEFAULT 0.85,
        risk_level VARCHAR(50) DEFAULT 'low',
        recommendations TEXT,
        analyzed_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS behavior_analysis_logs (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
        analysis TEXT,
        confidence DECIMAL(5,4) DEFAULT 0.85,
        risk_level VARCHAR(50) DEFAULT 'low',
        recommendations TEXT,
        analyzed_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS audio_monitoring_logs (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
        analysis TEXT,
        confidence DECIMAL(5,4) DEFAULT 0.85,
        risk_level VARCHAR(50) DEFAULT 'low',
        recommendations TEXT,
        analyzed_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS plagiarism_reports (
        id SERIAL PRIMARY KEY,
        student_answer TEXT,
        original_text TEXT,
        analysis TEXT,
        similarity_score DECIMAL(5,4) DEFAULT 0,
        confidence DECIMAL(5,4) DEFAULT 0.85,
        risk_level VARCHAR(50) DEFAULT 'low',
        recommendations TEXT,
        analyzed_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS browser_security_events (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
        event_type VARCHAR(100) NOT NULL,
        details TEXT,
        ip_address VARCHAR(50),
        user_agent TEXT,
        blocked BOOLEAN DEFAULT FALSE,
        timestamp TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS proctor_actions (
        id SERIAL PRIMARY KEY,
        proctor_user_id INTEGER,
        session_id INTEGER,
        action VARCHAR(100),
        reason TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ai_analyses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        analysis_type VARCHAR(100),
        event_id INTEGER,
        content TEXT,
        model VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Database tables created/verified.');

    // Seed default admin user
    const existingAdmin = await pool.query("SELECT id FROM users WHERE email = 'admin@examproctor.com'");
    if (existingAdmin.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      await pool.query(
        "INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ('admin@examproctor.com', $1, 'Admin', 'User', 'admin')",
        [hash]
      );
      console.log('Default admin user created: admin@examproctor.com / admin123');
    }

    // Seed default settings
    const defaultSettings = {
      ai_sensitivity: '0.7',
      auto_flag_threshold: '3',
      browser_lock_enabled: 'true',
      audio_monitoring_enabled: 'true',
      face_check_interval: '30',
      max_incidents_before_flag: '5',
      recording_enabled: 'true',
      notification_email: 'admin@examproctor.com',
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      await pool.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
        [key, value]
      );
    }

    console.log('Default settings seeded.');
  } catch (err) {
    console.error('Database initialization error:', err.message);
    console.log('Server will start but some features may not work without the database.');
  }
}

initializeDatabase().then(() => {
  
// === Batch 03 Gaps & Frontend Mounts ===
try {
  const _batch03 = require('../routes/batch03Gaps');
  if (typeof authenticateToken === 'function') app.use('/api', authenticateToken, _batch03);
  else app.use('/api', _batch03);
} catch (_e) { /* batch03 gap routes optional */ }

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
});

module.exports = app;
