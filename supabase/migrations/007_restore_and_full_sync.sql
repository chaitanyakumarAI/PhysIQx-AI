-- PhysIQx AI — Migration 007: everything a new device needs to restore
-- Run after 006_atomic_workout_save.sql
-- (Dashboard → SQL Editor → New Query, paste, Run).
-- Plan: docs/SYNC_RESTORE_PLAN.md (Phase A).
--
-- Adds the data that only lived on the device (body details, settings,
-- weigh-ins, plans), tombstones so deletes reach other devices, updated_at
-- triggers that drive the pull cursor, and one read function that returns
-- what changed since a cursor.

-- 1. Profile: body details, the active plan and device-independent settings.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sex TEXT CHECK (sex IN ('male', 'female'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_year INTEGER CHECK (birth_year BETWEEN 1900 AND 2100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height_cm NUMERIC CHECK (height_cm BETWEEN 50 AND 300);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_build TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_plan_ref TEXT;
-- preferences, notification preferences, showcase ids, avatar preset id
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}'::JSONB
  CHECK (octet_length(settings::TEXT) < 16384);
-- When the device last changed any of the above (newer wins on merge).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS client_updated_at TIMESTAMPTZ;

-- 2. Weigh-ins: one per user per day, like the local ledger.
CREATE TABLE IF NOT EXISTS weigh_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg NUMERIC NOT NULL CHECK (weight_kg BETWEEN 20 AND 400),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

-- 3. Plans: the whole plan as JSON (validated by the Server Action).
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_ref TEXT NOT NULL,
  payload JSONB NOT NULL CHECK (octet_length(payload::TEXT) < 65536),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, client_ref)
);

-- 4. Tombstones on cardio (deleting an activity must reach other devices).
ALTER TABLE cardio_logs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 5. updated_at triggers on every synced table (update_updated_at is from 001).
--    The pull cursor compares updated_at, so it must never be NULL.
UPDATE sessions SET updated_at = COALESCE(created_at, NOW()) WHERE updated_at IS NULL;
ALTER TABLE sessions ALTER COLUMN updated_at SET DEFAULT NOW(), ALTER COLUMN updated_at SET NOT NULL;
UPDATE cardio_logs SET updated_at = COALESCE(created_at, NOW()) WHERE updated_at IS NULL;
ALTER TABLE cardio_logs ALTER COLUMN updated_at SET DEFAULT NOW(), ALTER COLUMN updated_at SET NOT NULL;
DROP TRIGGER IF EXISTS sessions_updated_at ON sessions;
CREATE TRIGGER sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS cardio_logs_updated_at ON cardio_logs;
CREATE TRIGGER cardio_logs_updated_at BEFORE UPDATE ON cardio_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS weigh_ins_updated_at ON weigh_ins;
CREATE TRIGGER weigh_ins_updated_at BEFORE UPDATE ON weigh_ins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS plans_updated_at ON plans;
CREATE TRIGGER plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 6. Cursor indexes: (user, updated_at, id) keyset pagination.
CREATE INDEX IF NOT EXISTS sessions_user_updated ON sessions (user_id, updated_at, id);
CREATE INDEX IF NOT EXISTS cardio_logs_user_updated ON cardio_logs (user_id, updated_at, id);
CREATE INDEX IF NOT EXISTS weigh_ins_user_updated ON weigh_ins (user_id, updated_at, id);
CREATE INDEX IF NOT EXISTS plans_user_updated ON plans (user_id, updated_at, id);

-- 7. Row level security: owners only. No DELETE policies — deletes are
--    tombstones (deleted_at), so other devices learn about them.
ALTER TABLE weigh_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own weigh-ins" ON weigh_ins;
CREATE POLICY "Users can read own weigh-ins" ON weigh_ins FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own weigh-ins" ON weigh_ins;
CREATE POLICY "Users can insert own weigh-ins" ON weigh_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own weigh-ins" ON weigh_ins;
CREATE POLICY "Users can update own weigh-ins" ON weigh_ins FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can read own plans" ON plans;
CREATE POLICY "Users can read own plans" ON plans FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own plans" ON plans;
CREATE POLICY "Users can insert own plans" ON plans FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own plans" ON plans;
CREATE POLICY "Users can update own plans" ON plans FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. One read for a pull. SECURITY INVOKER: RLS decides what comes back; the
--    explicit user_id filters are for the indexes.
--    p_cursors: { "sessions": {"at": ts, "id": uuid}, "cardio": …,
--                 "weigh_ins": …, "plans": … } — missing = from the start.
--    Returns each table's next page (oldest first, at most p_limit rows),
--    a per-table has_more flag, and the profile row.
CREATE OR REPLACE FUNCTION public.get_ledger_changes(p_cursors JSONB DEFAULT '{}'::JSONB, p_limit INTEGER DEFAULT 200)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_limit INTEGER := LEAST(GREATEST(COALESCE(p_limit, 200), 1), 500);
  v_zero UUID := '00000000-0000-0000-0000-000000000000';
  v_epoch TIMESTAMPTZ := '1970-01-01T00:00:00Z';
  v_sessions JSONB; v_cardio JSONB; v_weigh_ins JSONB; v_plans JSONB; v_profile JSONB;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT COALESCE(jsonb_agg(row_json ORDER BY at, id), '[]'::JSONB) INTO v_sessions FROM (
    SELECT s.updated_at AS at, s.id, jsonb_build_object(
      'id', s.id, 'client_ref', s.client_ref, 'template_id', s.template_id, 'template_name', s.template_name,
      'status', s.status, 'started_at', s.started_at, 'completed_at', s.completed_at,
      'total_volume_kg', s.total_volume_kg, 'xp_earned', s.xp_earned, 'updated_at', s.updated_at,
      'exercises', (
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
          'exercise_id', e.exercise_id, 'exercise_name', e.exercise_name, 'order_index', e.order_index,
          'sets', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
                     'set_number', x.set_number, 'weight_kg', x.weight_kg, 'reps', x.reps, 'rpe', x.rpe)
                   ORDER BY x.set_number), '[]'::JSONB)
                   FROM exercise_sets x WHERE x.session_exercise_id = e.id)
        ) ORDER BY e.order_index), '[]'::JSONB)
        FROM session_exercises e WHERE e.session_id = s.id)
    ) AS row_json
    FROM sessions s
    WHERE s.user_id = v_user AND s.client_ref IS NOT NULL
      AND (s.updated_at, s.id) > (COALESCE((p_cursors->'sessions'->>'at')::TIMESTAMPTZ, v_epoch),
                                  COALESCE((p_cursors->'sessions'->>'id')::UUID, v_zero))
    ORDER BY s.updated_at, s.id
    LIMIT v_limit + 1
  ) page;

  SELECT COALESCE(jsonb_agg(row_json ORDER BY at, id), '[]'::JSONB) INTO v_cardio FROM (
    SELECT c.updated_at AS at, c.id, jsonb_build_object(
      'id', c.id, 'client_ref', c.client_ref, 'source', c.source, 'external_id', c.external_id,
      'activity_type', c.activity_type, 'started_at', c.started_at, 'duration_minutes', c.duration_minutes,
      'distance_km', c.distance_km, 'avg_heart_rate', c.avg_heart_rate, 'max_heart_rate', c.max_heart_rate,
      'calories_burned', c.calories_burned, 'synced_at', c.synced_at, 'deleted_at', c.deleted_at, 'updated_at', c.updated_at
    ) AS row_json
    FROM cardio_logs c
    WHERE c.user_id = v_user AND c.client_ref IS NOT NULL
      AND (c.updated_at, c.id) > (COALESCE((p_cursors->'cardio'->>'at')::TIMESTAMPTZ, v_epoch),
                                  COALESCE((p_cursors->'cardio'->>'id')::UUID, v_zero))
    ORDER BY c.updated_at, c.id
    LIMIT v_limit + 1
  ) page;

  SELECT COALESCE(jsonb_agg(row_json ORDER BY at, id), '[]'::JSONB) INTO v_weigh_ins FROM (
    SELECT w.updated_at AS at, w.id, jsonb_build_object(
      'id', w.id, 'date', w.date, 'weight_kg', w.weight_kg, 'deleted_at', w.deleted_at, 'updated_at', w.updated_at
    ) AS row_json
    FROM weigh_ins w
    WHERE w.user_id = v_user
      AND (w.updated_at, w.id) > (COALESCE((p_cursors->'weigh_ins'->>'at')::TIMESTAMPTZ, v_epoch),
                                  COALESCE((p_cursors->'weigh_ins'->>'id')::UUID, v_zero))
    ORDER BY w.updated_at, w.id
    LIMIT v_limit + 1
  ) page;

  SELECT COALESCE(jsonb_agg(row_json ORDER BY at, id), '[]'::JSONB) INTO v_plans FROM (
    SELECT p.updated_at AS at, p.id, jsonb_build_object(
      'id', p.id, 'client_ref', p.client_ref, 'payload', p.payload, 'deleted_at', p.deleted_at, 'updated_at', p.updated_at
    ) AS row_json
    FROM plans p
    WHERE p.user_id = v_user
      AND (p.updated_at, p.id) > (COALESCE((p_cursors->'plans'->>'at')::TIMESTAMPTZ, v_epoch),
                                  COALESCE((p_cursors->'plans'->>'id')::UUID, v_zero))
    ORDER BY p.updated_at, p.id
    LIMIT v_limit + 1
  ) page;

  SELECT jsonb_build_object(
    'name', pr.name, 'goal', pr.goal, 'experience_level', pr.experience_level, 'active_split', pr.active_split,
    'session_frequency', pr.session_frequency, 'goal_body_shape', pr.goal_body_shape,
    'training_days_per_week', pr.training_days_per_week, 'onboarding_completed_at', pr.onboarding_completed_at,
    'sex', pr.sex, 'birth_year', pr.birth_year, 'height_cm', pr.height_cm, 'current_build', pr.current_build,
    'active_plan_ref', pr.active_plan_ref, 'settings', pr.settings, 'client_updated_at', pr.client_updated_at,
    'updated_at', pr.updated_at
  ) INTO v_profile FROM profiles pr WHERE pr.id = v_user;

  -- Each page fetched one extra row to learn whether more remain; trim it.
  RETURN jsonb_build_object(
    'sessions', CASE WHEN jsonb_array_length(v_sessions) > v_limit THEN v_sessions - v_limit ELSE v_sessions END,
    'cardio', CASE WHEN jsonb_array_length(v_cardio) > v_limit THEN v_cardio - v_limit ELSE v_cardio END,
    'weigh_ins', CASE WHEN jsonb_array_length(v_weigh_ins) > v_limit THEN v_weigh_ins - v_limit ELSE v_weigh_ins END,
    'plans', CASE WHEN jsonb_array_length(v_plans) > v_limit THEN v_plans - v_limit ELSE v_plans END,
    'has_more', jsonb_build_object(
      'sessions', jsonb_array_length(v_sessions) > v_limit,
      'cardio', jsonb_array_length(v_cardio) > v_limit,
      'weigh_ins', jsonb_array_length(v_weigh_ins) > v_limit,
      'plans', jsonb_array_length(v_plans) > v_limit),
    'profile', v_profile,
    'server_time', NOW()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_ledger_changes(JSONB, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_ledger_changes(JSONB, INTEGER) TO authenticated;
