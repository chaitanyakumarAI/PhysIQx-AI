-- PhysIQx AI — cross-account security check (row level security)
--
-- Paste into Dashboard → SQL Editor → New Query and Run. It changes
-- nothing: two throwaway users and their rows are created inside a
-- transaction that is rolled back at the end.
--
-- Pass: the run finishes with "RLS check passed" in the messages.
-- Fail: it stops with an error naming the check that leaked.
--
-- What it proves, acting as athlete A against athlete B's data:
--   A sees none of B's rows, can't write rows for B, can't change or
--   delete B's rows, and B's rows never appear in A's restore pages.
-- Covers profiles, sessions, cardio_logs, weigh_ins, plans,
-- xp_transactions, and (after migration 008) media_items and the
-- athlete-media bucket.

BEGIN;

-- Fixtures (as the dashboard's admin role) ---------------------------------
INSERT INTO auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
  ('aaaaaaaa-0000-4000-8000-00000000000a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'rls-check-a@example.invalid', '{}', '{"name":"RLS A"}', NOW(), NOW()),
  ('bbbbbbbb-0000-4000-8000-00000000000b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'rls-check-b@example.invalid', '{}', '{"name":"RLS B"}', NOW(), NOW());

INSERT INTO sessions (user_id, client_ref, template_name, status, completed_at)
VALUES ('bbbbbbbb-0000-4000-8000-00000000000b', 'rls-b-workout', 'B workout', 'completed', NOW());
INSERT INTO cardio_logs (user_id, client_ref, source, activity_type, duration_minutes)
VALUES ('bbbbbbbb-0000-4000-8000-00000000000b', 'gpx:rls-b', 'gpx', 'run', 30);
INSERT INTO weigh_ins (user_id, date, weight_kg)
VALUES ('bbbbbbbb-0000-4000-8000-00000000000b', '2026-11-01', 80);
INSERT INTO plans (user_id, client_ref, payload)
VALUES ('bbbbbbbb-0000-4000-8000-00000000000b', 'plan-rls-b', '{"id":"plan-rls-b","name":"B","days":[]}');
INSERT INTO xp_transactions (user_id, amount, source_type, source_ref)
VALUES ('bbbbbbbb-0000-4000-8000-00000000000b', 100, 'workout_complete', 'rls-b');

DO $$
BEGIN
  IF to_regclass('public.media_items') IS NOT NULL THEN
    EXECUTE $sql$
      INSERT INTO media_items (user_id, client_ref, kind, storage_path)
      VALUES ('bbbbbbbb-0000-4000-8000-00000000000b', 'avatar-1-rlsb', 'avatar',
              'bbbbbbbb-0000-4000-8000-00000000000b/avatar-1-rlsb')
    $sql$;
  END IF;
END $$;

-- Become athlete A ---------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-0000-4000-8000-00000000000a","role":"authenticated"}', TRUE);

DO $$
DECLARE
  b CONSTANT UUID := 'bbbbbbbb-0000-4000-8000-00000000000b';
  a CONSTANT UUID := 'aaaaaaaa-0000-4000-8000-00000000000a';
  n INTEGER;
  page JSONB;
BEGIN
  ASSERT auth.uid() = a, 'setup: not acting as athlete A';

  -- 1. Reads: none of B's rows are visible.
  ASSERT (SELECT count(*) FROM profiles WHERE id = b) = 0, 'profiles: A can read B';
  ASSERT (SELECT count(*) FROM sessions WHERE user_id = b) = 0, 'sessions: A can read B';
  ASSERT (SELECT count(*) FROM cardio_logs WHERE user_id = b) = 0, 'cardio_logs: A can read B';
  ASSERT (SELECT count(*) FROM weigh_ins WHERE user_id = b) = 0, 'weigh_ins: A can read B';
  ASSERT (SELECT count(*) FROM plans WHERE user_id = b) = 0, 'plans: A can read B';
  ASSERT (SELECT count(*) FROM xp_transactions WHERE user_id = b) = 0, 'xp_transactions: A can read B';

  -- 2. Writes for B are refused (RLS raises insufficient_privilege, 42501).
  BEGIN
    INSERT INTO weigh_ins (user_id, date, weight_kg) VALUES (b, '2026-11-02', 70);
    RAISE EXCEPTION 'weigh_ins: A could insert a row for B';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO plans (user_id, client_ref, payload) VALUES (b, 'plan-rls-a-for-b', '{}');
    RAISE EXCEPTION 'plans: A could insert a row for B';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO sessions (user_id, client_ref, template_name, status) VALUES (b, 'rls-a-for-b', 'x', 'completed');
    RAISE EXCEPTION 'sessions: A could insert a row for B';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO cardio_logs (user_id, client_ref, source, activity_type, duration_minutes) VALUES (b, 'gpx:rls-a-for-b', 'gpx', 'run', 10);
    RAISE EXCEPTION 'cardio_logs: A could insert a row for B';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  -- XP is append-only through save_workout_session; nobody inserts directly.
  BEGIN
    INSERT INTO xp_transactions (user_id, amount, source_type, source_ref) VALUES (a, 999, 'pr', 'rls-self-grant');
    RAISE EXCEPTION 'xp_transactions: A could grant itself XP';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  -- 3. Updates and deletes of B's rows touch nothing.
  UPDATE weigh_ins SET weight_kg = 1 WHERE user_id = b;
  GET DIAGNOSTICS n = ROW_COUNT; ASSERT n = 0, 'weigh_ins: A updated B';
  UPDATE plans SET deleted_at = NOW() WHERE user_id = b;
  GET DIAGNOSTICS n = ROW_COUNT; ASSERT n = 0, 'plans: A tombstoned B';
  UPDATE sessions SET template_name = 'hacked' WHERE user_id = b;
  GET DIAGNOSTICS n = ROW_COUNT; ASSERT n = 0, 'sessions: A updated B';
  UPDATE profiles SET name = 'hacked' WHERE id = b;
  GET DIAGNOSTICS n = ROW_COUNT; ASSERT n = 0, 'profiles: A updated B';
  DELETE FROM cardio_logs WHERE user_id = b;
  GET DIAGNOSTICS n = ROW_COUNT; ASSERT n = 0, 'cardio_logs: A deleted B';

  -- 4. Restore pages carry only A's data.
  page := get_ledger_changes('{}'::JSONB, 500);
  ASSERT jsonb_array_length(page->'sessions') = 0, 'get_ledger_changes: B sessions in A''s page';
  ASSERT jsonb_array_length(page->'cardio') = 0, 'get_ledger_changes: B cardio in A''s page';
  ASSERT jsonb_array_length(page->'weigh_ins') = 0, 'get_ledger_changes: B weigh-ins in A''s page';
  ASSERT jsonb_array_length(page->'plans') = 0, 'get_ledger_changes: B plans in A''s page';

  -- 5. Media (migration 008), when it's applied.
  IF to_regclass('public.media_items') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM media_items WHERE user_id = $1' INTO n USING b;
    ASSERT n = 0, 'media_items: A can read B';
    page := get_media_changes('{}'::JSONB, 500);
    ASSERT jsonb_array_length(page->'media') = 0, 'get_media_changes: B media in A''s page';
    BEGIN
      EXECUTE 'INSERT INTO media_items (user_id, client_ref, kind, storage_path) VALUES ($1, $2, $3, $4)'
        USING b, 'avatar-2-rlsa', 'avatar', b::TEXT || '/avatar-2-rlsa';
      RAISE EXCEPTION 'media_items: A could insert a row for B';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
      INSERT INTO storage.objects (bucket_id, name) VALUES ('athlete-media', b::TEXT || '/planted.jpg');
      RAISE EXCEPTION 'storage: A could write into B''s folder';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    ASSERT (SELECT count(*) FROM storage.objects WHERE bucket_id = 'athlete-media' AND name LIKE b::TEXT || '/%') = 0,
      'storage: A can list B''s folder';
  END IF;

  -- 6. Sanity: A can still use its own data (the checks above aren't vacuous).
  INSERT INTO weigh_ins (user_id, date, weight_kg) VALUES (a, '2026-11-02', 75);
  ASSERT (SELECT count(*) FROM weigh_ins WHERE user_id = a) = 1, 'weigh_ins: A cannot write its own row';

  RAISE NOTICE 'RLS check passed';
END $$;

ROLLBACK;
