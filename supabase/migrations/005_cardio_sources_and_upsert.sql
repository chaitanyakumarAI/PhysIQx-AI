-- PhysIQx AI — Migration 005: cardio import sources + idempotent upserts
-- Run after 004_create_cardio_and_device_sync.sql.
--
-- The app now imports GPX/TCX files (and later Strava) through one
-- normalized activity model. Each activity has a stable client id
-- ("<source>:<externalId>"), so re-imports update in place.

-- 1. Allow the new sources.
ALTER TABLE cardio_logs DROP CONSTRAINT IF EXISTS cardio_logs_source_check;
ALTER TABLE cardio_logs
  ADD CONSTRAINT cardio_logs_source_check
  CHECK (source IN ('gpx', 'tcx', 'strava', 'apple_health', 'health_connect', 'garmin', 'manual'));

-- 2. Fields the import pipeline records.
ALTER TABLE cardio_logs ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE cardio_logs ADD COLUMN IF NOT EXISTS max_heart_rate INTEGER;

-- 3. Upsert key: one row per user per activity. (client_ref was globally
--    unique; per-user uniqueness is the correct scope and lets
--    ON CONFLICT (user_id, client_ref) work.)
ALTER TABLE cardio_logs DROP CONSTRAINT IF EXISTS cardio_logs_client_ref_key;
CREATE UNIQUE INDEX IF NOT EXISTS cardio_logs_user_client_ref_key
  ON cardio_logs (user_id, client_ref);
