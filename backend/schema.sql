CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL DEFAULT '',
  last_name VARCHAR(255) NOT NULL DEFAULT '',
  role VARCHAR(50) NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS institutions (
  id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, type VARCHAR(100), address TEXT,
  city VARCHAR(100), state VARCHAR(100), country VARCHAR(100), email VARCHAR(255),
  phone VARCHAR(100), license_type VARCHAR(50), status VARCHAR(50), created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT, subject VARCHAR(255),
  duration_minutes INTEGER, total_marks NUMERIC(10,2), passing_marks NUMERIC(10,2),
  status VARCHAR(50), institution_id INTEGER REFERENCES institutions(id), created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY, first_name VARCHAR(255), last_name VARCHAR(255), email VARCHAR(255) UNIQUE,
  student_id VARCHAR(100) UNIQUE, institution_id INTEGER REFERENCES institutions(id), phone VARCHAR(100),
  status VARCHAR(50), created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proctors (
  id SERIAL PRIMARY KEY, first_name VARCHAR(255), last_name VARCHAR(255), email VARCHAR(255) UNIQUE,
  phone VARCHAR(100), specialization VARCHAR(255), experience_years INTEGER, status VARCHAR(50),
  certification VARCHAR(255), institution_id INTEGER REFERENCES institutions(id), created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proctoring_sessions (
  id SERIAL PRIMARY KEY, exam_id INTEGER REFERENCES exams(id), student_id INTEGER REFERENCES students(id),
  proctor_id INTEGER REFERENCES proctors(id), start_time TIMESTAMPTZ, end_time TIMESTAMPTZ,
  status VARCHAR(50), trust_score NUMERIC(6,2), browser_locked BOOLEAN DEFAULT FALSE,
  webcam_enabled BOOLEAN DEFAULT FALSE, audio_enabled BOOLEAN DEFAULT FALSE, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY, session_id INTEGER REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
  type VARCHAR(100), severity VARCHAR(50), description TEXT, ai_confidence NUMERIC(5,4),
  status VARCHAR(50), resolution_notes TEXT, timestamp TIMESTAMPTZ DEFAULT NOW(), created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_results (
  id SERIAL PRIMARY KEY, session_id INTEGER REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
  exam_id INTEGER REFERENCES exams(id), student_id INTEGER REFERENCES students(id), score NUMERIC(10,2),
  total_marks NUMERIC(10,2), percentage NUMERIC(6,2), grade VARCHAR(20), trust_score NUMERIC(6,2),
  incidents_count INTEGER DEFAULT 0, status VARCHAR(50), completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS face_verification_logs (
  id SERIAL PRIMARY KEY, session_id INTEGER REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
  analysis TEXT, confidence NUMERIC(5,4), risk_level VARCHAR(50), recommendations TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS behavior_analysis_logs (
  id SERIAL PRIMARY KEY, session_id INTEGER REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
  analysis TEXT, confidence NUMERIC(5,4), risk_level VARCHAR(50), recommendations TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audio_monitoring_logs (
  id SERIAL PRIMARY KEY, session_id INTEGER REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
  analysis TEXT, confidence NUMERIC(5,4), risk_level VARCHAR(50), recommendations TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS browser_security_events (
  id SERIAL PRIMARY KEY, session_id INTEGER REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
  event_type VARCHAR(100), details TEXT, ip_address VARCHAR(100), user_agent TEXT,
  blocked BOOLEAN DEFAULT FALSE, timestamp TIMESTAMPTZ DEFAULT NOW(), created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plagiarism_reports (
  id SERIAL PRIMARY KEY,
  student_answer TEXT,
  original_text TEXT,
  analysis TEXT,
  similarity_score NUMERIC(5, 4),
  confidence NUMERIC(5, 4),
  risk_level VARCHAR(50),
  recommendations TEXT,
  analyzed_at TIMESTAMP DEFAULT NOW()
);
