CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL DEFAULT '',
  last_name VARCHAR(255) NOT NULL DEFAULT '',
  role VARCHAR(50) NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
