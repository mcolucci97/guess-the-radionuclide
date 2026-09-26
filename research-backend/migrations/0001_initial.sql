PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS research_participants (
  study_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  age_band TEXT NOT NULL,
  gate_version TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (study_id, participant_id)
);

CREATE TABLE IF NOT EXISTS authorization_records (
  authorization_record_id TEXT PRIMARY KEY,
  study_id TEXT NOT NULL,
  participant_token_hash TEXT NOT NULL,
  participant_information_version TEXT NOT NULL,
  participant_confirmation INTEGER NOT NULL DEFAULT 0,
  parental_authorization_status TEXT NOT NULL DEFAULT 'not_required',
  minor_assent_status TEXT NOT NULL DEFAULT 'not_required',
  created_at TEXT NOT NULL,
  revoked_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_authorization_study_token ON authorization_records(study_id, participant_token_hash);

CREATE TABLE IF NOT EXISTS research_sessions (
  session_id TEXT PRIMARY KEY,
  study_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  authorization_record_id TEXT NOT NULL,
  upload_token_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  language TEXT,
  game_version TEXT,
  learning_engine_version TEXT,
  started_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  finished_at TEXT,
  finish_data_json TEXT,
  FOREIGN KEY (study_id, participant_id) REFERENCES research_participants(study_id, participant_id),
  FOREIGN KEY (authorization_record_id) REFERENCES authorization_records(authorization_record_id)
);
CREATE INDEX IF NOT EXISTS idx_sessions_study_participant ON research_sessions(study_id, participant_id);

CREATE TABLE IF NOT EXISTS research_events (
  event_id TEXT PRIMARY KEY,
  study_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  client_event_index INTEGER NOT NULL,
  relative_time_ms INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  game_version TEXT,
  learning_engine_version TEXT,
  level TEXT,
  mode TEXT,
  data_json TEXT NOT NULL,
  received_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES research_sessions(session_id)
);
CREATE INDEX IF NOT EXISTS idx_events_session_index ON research_events(session_id, client_event_index);
CREATE INDEX IF NOT EXISTS idx_events_study_type ON research_events(study_id, event_type);

CREATE TABLE IF NOT EXISTS research_responses (
  response_id TEXT PRIMARY KEY,
  study_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  test_version TEXT NOT NULL,
  phase TEXT NOT NULL,
  item_id TEXT NOT NULL,
  response_json TEXT NOT NULL,
  correct INTEGER,
  score REAL,
  response_time_ms INTEGER,
  submitted_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES research_sessions(session_id)
);
CREATE INDEX IF NOT EXISTS idx_responses_session_phase ON research_responses(session_id, phase);
