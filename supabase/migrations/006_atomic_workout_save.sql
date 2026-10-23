-- PhysIQx AI — Migration 006: atomic, tamper-resistant workout saves
-- Run after 005_cardio_sources_and_upsert.sql
-- (Dashboard → SQL Editor → New Query, paste, Run).
--
-- Before: the Server Action wrote sessions, exercises, sets and XP in
-- separate requests, logged child failures and still reported success, and
-- owners could insert any XP row they liked. After: one function writes the
-- whole workout in a single transaction, XP is append-only through that
-- function, and a session id is unique per user.

-- 1. Idempotency key scoped per user (was globally unique).
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_client_ref_key;
DROP INDEX IF EXISTS idx_sessions_client_ref;
CREATE UNIQUE INDEX IF NOT EXISTS sessions_user_client_ref_key
  ON sessions (user_id, client_ref);

-- 2. XP is read-only for owners; only save_workout_session appends to it.
--    Exact duplicate ledger rows (same user, source and ref) are removed
--    first — the old client-side check could race — keeping the earliest.
DELETE FROM xp_transactions a
  USING xp_transactions b
  WHERE a.user_id = b.user_id
    AND a.source_type = b.source_type
    AND a.source_ref IS NOT DISTINCT FROM b.source_ref
    AND (a.created_at, a.id) > (b.created_at, b.id);
CREATE UNIQUE INDEX IF NOT EXISTS xp_transactions_source_key
  ON xp_transactions (user_id, source_type, source_ref);

DROP POLICY IF EXISTS "Users can read/create own XP transactions" ON xp_transactions;
DROP POLICY IF EXISTS "Users can read own XP transactions" ON xp_transactions;
CREATE POLICY "Users can read own XP transactions" ON xp_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- 3. The whole workout in one transaction.
--    SECURITY DEFINER so it can append XP past the read-only policy; every
--    row it writes is tied to auth.uid(), never to an id from the payload.
--    p shape (built by saveWorkoutSession):
--    { client_ref, template_id, template_name, status, started_at,
--      completed_at, total_volume_kg, xp_earned,
--      exercises: [{ exercise_id, exercise_name,
--                    sets: [{ set_number, weight_kg, reps, rpe, is_pr }] }] }
CREATE OR REPLACE FUNCTION public.save_workout_session(p JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_session UUID;
  v_exercise JSONB;
  v_exercise_id UUID;
  v_order INTEGER := 0;
  v_xp INTEGER := COALESCE((p->>'xp_earned')::INTEGER, 0);
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '28000';
  END IF;
  -- Mirrors MAX_SESSION_XP in src/features/session/lib/setValidation.ts.
  IF v_xp < 0 OR v_xp > 400 THEN
    RAISE EXCEPTION 'xp_earned out of range: %', v_xp USING ERRCODE = '22003';
  END IF;
  IF p->>'status' NOT IN ('completed', 'abandoned') THEN
    RAISE EXCEPTION 'status must be completed or abandoned' USING ERRCODE = '22023';
  END IF;

  -- A workout that already synced is never rewritten: retries return its id.
  SELECT id INTO v_session FROM sessions
    WHERE user_id = v_user AND client_ref = p->>'client_ref';
  IF v_session IS NOT NULL THEN
    RETURN v_session;
  END IF;

  BEGIN
    INSERT INTO sessions (user_id, client_ref, template_id, template_name, status,
                          started_at, completed_at, total_volume_kg, xp_earned)
    VALUES (v_user, p->>'client_ref', p->>'template_id', p->>'template_name', p->>'status',
            (p->>'started_at')::TIMESTAMPTZ, (p->>'completed_at')::TIMESTAMPTZ,
            COALESCE((p->>'total_volume_kg')::NUMERIC, 0), v_xp)
    RETURNING id INTO v_session;
  EXCEPTION WHEN unique_violation THEN
    -- A concurrent retry won the race; its transaction holds the full workout.
    SELECT id INTO v_session FROM sessions
      WHERE user_id = v_user AND client_ref = p->>'client_ref';
    RETURN v_session;
  END;

  FOR v_exercise IN SELECT * FROM jsonb_array_elements(COALESCE(p->'exercises', '[]'::JSONB)) LOOP
    INSERT INTO session_exercises (session_id, exercise_id, exercise_name, order_index)
    VALUES (v_session, v_exercise->>'exercise_id', v_exercise->>'exercise_name', v_order)
    RETURNING id INTO v_exercise_id;

    INSERT INTO exercise_sets (session_exercise_id, set_number, weight_kg, reps, rpe, is_completed, is_pr)
    SELECT v_exercise_id,
           (s->>'set_number')::INTEGER,
           COALESCE((s->>'weight_kg')::NUMERIC, 0),
           COALESCE((s->>'reps')::INTEGER, 0),
           (s->>'rpe')::NUMERIC,
           TRUE,
           COALESCE((s->>'is_pr')::BOOLEAN, FALSE)
    FROM jsonb_array_elements(COALESCE(v_exercise->'sets', '[]'::JSONB)) AS s;

    v_order := v_order + 1;
  END LOOP;

  IF p->>'status' = 'completed' AND v_xp > 0 THEN
    INSERT INTO xp_transactions (user_id, amount, source_type, source_ref)
    VALUES (v_user, v_xp, 'workout_complete', v_session::TEXT)
    ON CONFLICT (user_id, source_type, source_ref) DO NOTHING;
  END IF;

  RETURN v_session;
END;
$$;

REVOKE ALL ON FUNCTION public.save_workout_session(JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_workout_session(JSONB) TO authenticated;
