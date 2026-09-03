-- PhysIQx AI — Migration: add client_ref idempotency column to sessions
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS client_ref TEXT UNIQUE;

-- Index for fast duplicate-check lookups
CREATE INDEX IF NOT EXISTS idx_sessions_client_ref ON sessions (client_ref)
  WHERE client_ref IS NOT NULL;
