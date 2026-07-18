CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_title VARCHAR(255),
  match_score INTEGER NOT NULL,
  summary TEXT,
  matched_skills JSONB DEFAULT '[]',
  missing_skills JSONB DEFAULT '[]',
  suggestions JSONB DEFAULT '[]',
  resume_snippet TEXT,
  jd_snippet TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
