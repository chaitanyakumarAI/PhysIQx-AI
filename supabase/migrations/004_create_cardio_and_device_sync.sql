-- PhysIQx AI — Supabase Migration: Phase 4 Cardio & Wearables Sync Tables
-- Run this in your Supabase SQL Editor after 003_add_session_client_ref.sql

-- 1. Create cardio_logs table for wearable-synced activities
CREATE TABLE IF NOT EXISTS cardio_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('apple_health', 'garmin', 'health_connect', 'whoop', 'oura', 'manual')),
  activity_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  distance_km NUMERIC,
  avg_heart_rate INTEGER,
  calories_burned INTEGER,
  client_ref TEXT UNIQUE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying user cardio activities ordered by date
CREATE INDEX IF NOT EXISTS idx_cardio_logs_user_date ON cardio_logs (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_cardio_logs_client_ref ON cardio_logs (client_ref) WHERE client_ref IS NOT NULL;

-- 2. Cleanly drop obsolete hydration_logs table (hydration removed per October 2026 product directive)
DROP TABLE IF EXISTS hydration_logs CASCADE;

-- 3. Row Level Security for cardio_logs
ALTER TABLE cardio_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own cardio logs" ON cardio_logs;
CREATE POLICY "Users can read own cardio logs"
  ON cardio_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own cardio logs" ON cardio_logs;
CREATE POLICY "Users can insert own cardio logs"
  ON cardio_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cardio logs" ON cardio_logs;
CREATE POLICY "Users can update own cardio logs"
  ON cardio_logs FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own cardio logs" ON cardio_logs;
CREATE POLICY "Users can delete own cardio logs"
  ON cardio_logs FOR DELETE
  USING (auth.uid() = user_id);
