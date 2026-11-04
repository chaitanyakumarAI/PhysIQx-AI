-- PhysIQx AI — Migration 008: cloud copies of the athlete's images
-- Run after 007_restore_and_full_sync.sql
-- (Dashboard → SQL Editor → New Query, paste, Run). Safe to run twice.
-- Plan: docs/NEXT_ROUND_PLAN.md (W7). Owner decision 2026-11-02: the
-- uploaded avatar always syncs; progress photos only when the athlete turns
-- on "Back up progress photos" in Privacy.

-- 1. A private bucket. Each athlete's files live under "<user id>/".
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('athlete-media', 'athlete-media', FALSE, 2097152, ARRAY['image/jpeg', 'image/webp', 'image/png'])
ON CONFLICT (id) DO UPDATE
  SET public = FALSE, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage access: owners only, inside their own folder.
DROP POLICY IF EXISTS "Athletes read own media" ON storage.objects;
CREATE POLICY "Athletes read own media" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'athlete-media' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
DROP POLICY IF EXISTS "Athletes upload own media" ON storage.objects;
CREATE POLICY "Athletes upload own media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'athlete-media' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
DROP POLICY IF EXISTS "Athletes replace own media" ON storage.objects;
CREATE POLICY "Athletes replace own media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'athlete-media' AND (storage.foldername(name))[1] = auth.uid()::TEXT)
  WITH CHECK (bucket_id = 'athlete-media' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
DROP POLICY IF EXISTS "Athletes delete own media" ON storage.objects;
CREATE POLICY "Athletes delete own media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'athlete-media' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

-- 3. What each file is. Photo details travel here so a restore can rebuild
--    the check-in; deletes are tombstones, like the other synced tables.
CREATE TABLE IF NOT EXISTS media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_ref TEXT NOT NULL,               -- the device's media id
  kind TEXT NOT NULL CHECK (kind IN ('avatar', 'photo')),
  storage_path TEXT NOT NULL,             -- "<user id>/<client_ref>", set by the server
  photo JSONB CHECK (photo IS NULL OR octet_length(photo::TEXT) < 4096),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, client_ref)
);
DROP TRIGGER IF EXISTS media_items_updated_at ON media_items;
CREATE TRIGGER media_items_updated_at BEFORE UPDATE ON media_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE INDEX IF NOT EXISTS media_items_user_updated ON media_items (user_id, updated_at, id);

ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own media items" ON media_items;
CREATE POLICY "Users can read own media items" ON media_items FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own media items" ON media_items;
CREATE POLICY "Users can insert own media items" ON media_items FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own media items" ON media_items;
CREATE POLICY "Users can update own media items" ON media_items FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. One page of media changes since a cursor {at, id} (same keyset as 007).
CREATE OR REPLACE FUNCTION public.get_media_changes(p_cursor JSONB DEFAULT '{}'::JSONB, p_limit INTEGER DEFAULT 200)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_limit INTEGER := LEAST(GREATEST(COALESCE(p_limit, 200), 1), 500);
  v_rows JSONB;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT COALESCE(jsonb_agg(row_json ORDER BY at, id), '[]'::JSONB) INTO v_rows FROM (
    SELECT m.updated_at AS at, m.id, jsonb_build_object(
      'id', m.id, 'client_ref', m.client_ref, 'kind', m.kind, 'storage_path', m.storage_path,
      'photo', m.photo, 'deleted_at', m.deleted_at, 'updated_at', m.updated_at
    ) AS row_json
    FROM media_items m
    WHERE m.user_id = v_user
      AND (m.updated_at, m.id) > (COALESCE((p_cursor->>'at')::TIMESTAMPTZ, '1970-01-01T00:00:00Z'),
                                  COALESCE((p_cursor->>'id')::UUID, '00000000-0000-0000-0000-000000000000'))
    ORDER BY m.updated_at, m.id
    LIMIT v_limit + 1
  ) page;

  RETURN jsonb_build_object(
    'media', CASE WHEN jsonb_array_length(v_rows) > v_limit THEN v_rows - v_limit ELSE v_rows END,
    'has_more', jsonb_array_length(v_rows) > v_limit,
    'server_time', NOW()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_media_changes(JSONB, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_media_changes(JSONB, INTEGER) TO authenticated;
