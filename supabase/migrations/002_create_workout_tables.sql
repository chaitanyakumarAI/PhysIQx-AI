-- PhysIQx AI — Supabase Migration: Phase 4 Workout, Fuel, and XP Tables
-- Run this in your Supabase SQL Editor after 001_create_profiles.sql

-- 1. Workout Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT,
  template_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_volume_kg NUMERIC DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user sessions ordered by date
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON sessions (user_id, started_at DESC);

-- 2. Session Exercises Table
CREATE TABLE IF NOT EXISTS session_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  target_muscle TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_exercises_session ON session_exercises (session_id, order_index);

-- 3. Exercise Sets Table
CREATE TABLE IF NOT EXISTS exercise_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_exercise_id UUID NOT NULL REFERENCES session_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight_kg NUMERIC NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  rpe NUMERIC,
  is_completed BOOLEAN DEFAULT TRUE,
  is_pr BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercise_sets_exercise ON exercise_sets (session_exercise_id, set_number);

-- 4. Hydration Logs Table (Fuel Ledger)
CREATE TABLE IF NOT EXISTS hydration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL CHECK (amount_ml > 0),
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_time ON hydration_logs (user_id, logged_at DESC);

-- 5. XP Transactions Table (Gamification Ledger)
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount <> 0),
  source_type TEXT NOT NULL CHECK (source_type IN ('workout_complete', 'mission_complete', 'pr', 'challenge_reward', 'achievement_unlock')),
  source_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON xp_transactions (user_id, created_at DESC);

-- 6. Row Level Security (RLS) Policies

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

-- Sessions policies
DROP POLICY IF EXISTS "Users can manage own sessions" ON sessions;
CREATE POLICY "Users can manage own sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id);

-- Session exercises policies (linked via session.user_id)
DROP POLICY IF EXISTS "Users can manage own session exercises" ON session_exercises;
CREATE POLICY "Users can manage own session exercises" ON session_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_exercises.session_id
        AND sessions.user_id = auth.uid()
    )
  );

-- Exercise sets policies (linked via session_exercise -> session.user_id)
DROP POLICY IF EXISTS "Users can manage own exercise sets" ON exercise_sets;
CREATE POLICY "Users can manage own exercise sets" ON exercise_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM session_exercises
      JOIN sessions ON sessions.id = session_exercises.session_id
      WHERE session_exercises.id = exercise_sets.session_exercise_id
        AND sessions.user_id = auth.uid()
    )
  );

-- Hydration logs policies
DROP POLICY IF EXISTS "Users can manage own hydration logs" ON hydration_logs;
CREATE POLICY "Users can manage own hydration logs" ON hydration_logs
  FOR ALL USING (auth.uid() = user_id);

-- XP transactions policies
DROP POLICY IF EXISTS "Users can read/create own XP transactions" ON xp_transactions;
CREATE POLICY "Users can read/create own XP transactions" ON xp_transactions
  FOR ALL USING (auth.uid() = user_id);

