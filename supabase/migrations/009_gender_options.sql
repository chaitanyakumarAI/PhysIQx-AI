-- 009: gender options beyond male/female (owner decision 2026-11-15).
-- The app now offers "Non-binary" and "Prefer not to say" in onboarding;
-- both map to the men's strength tables client-side, but the answer itself
-- syncs so it restores on a new device. Widen the profiles.sex CHECK so
-- profile snapshots carrying the new values aren't rejected (a rejected
-- write would retry in the outbox forever).
--
-- Apply BEFORE (or right after) deploying the app change: until this runs,
-- a signed-in athlete who picks one of the new options can't sync their
-- profile.

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_sex_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_sex_check
  CHECK (sex IN ('male', 'female', 'nonbinary', 'unspecified'));
