CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  provider VARCHAR(20) NOT NULL DEFAULT 'email',
  role VARCHAR(30) NOT NULL DEFAULT 'consumer',
  reputation_points INTEGER NOT NULL DEFAULT 0,
  trust_score INTEGER NOT NULL DEFAULT 50,
  updates_count INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 1,
  saved_minutes INTEGER NOT NULL DEFAULT 0,
  invited_friends INTEGER NOT NULL DEFAULT 0,
  referral_bonuses INTEGER NOT NULL DEFAULT 0,
  referral_code VARCHAR(32) NOT NULL UNIQUE,
  managed_location_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  address VARCHAR(220) NOT NULL,
  category VARCHAR(40) NOT NULL,
  branch_group VARCHAR(80),
  lat NUMERIC(9, 6) NOT NULL,
  lng NUMERIC(9, 6) NOT NULL,
  distance_km NUMERIC(5, 2) NOT NULL,
  working_hours VARCHAR(40) NOT NULL,
  integration_key VARCHAR(80) NOT NULL,
  hourly_load JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE queue_reports (
  id SERIAL PRIMARY KEY,
  location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  queue_level VARCHAR(20) NOT NULL,
  wait_minutes INTEGER NOT NULL,
  people_count INTEGER NOT NULL,
  passive_detected BOOLEAN NOT NULL DEFAULT FALSE,
  source VARCHAR(20) NOT NULL DEFAULT 'user',
  trust_weight NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE predictions (
  id SERIAL PRIMARY KEY,
  location_id INTEGER NOT NULL UNIQUE REFERENCES locations(id) ON DELETE CASCADE,
  current_wait_minutes INTEGER NOT NULL,
  crowd_index INTEGER NOT NULL,
  best_visit_time VARCHAR(16) NOT NULL,
  recommendation TEXT NOT NULL,
  behavior JSONB NOT NULL DEFAULT '{}'::jsonb,
  forecast JSONB NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  scheduled_for VARCHAR(16) NOT NULL,
  predicted_wait_minutes INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE behavior_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  inviter_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_email VARCHAR(190) NOT NULL,
  bonus_points INTEGER NOT NULL DEFAULT 25,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, location_id)
);
