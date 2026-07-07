# Profile Feature

Check here before adding a Profile component.

## Data

- `types.ts` — `ProfileData` (the screen's data contract), `ProfileAchievement`
  (flattened Achievement + UserAchievement view), `SettingsItem`.
- `api/getProfileData.ts` — service seam; returns `Promise<ProfileData>`.
- `mocks/profileData.ts` — fixtures. Profile/score/level/streak come from the
  shared `src/data/` fixtures (also used by Home). `totalXP` is deliberately
  NOT the design's shipped number (2,840) — see the comment in that file for
  why (it's smaller than the weekly leaderboard XP for the same user, which
  is arithmetically impossible for a lifetime total).
- `lib/derive.ts` — `countUnlockedAchievements`, `buildIdentityStats`,
  `buildProgressStats`. Stat labels/values are computed from raw profile
  fields via shared label maps (`goalLabels`, `programTypeLabels`), never
  hand-typed alongside the raw enum values.

## Components

| Component | Purpose |
|---|---|
| `ProfileHeaderCard` | Avatar + level badge overlay + name + archetype + score badge |
| `DNABanner` | "PhysIQ DNA · <archetype>" banner |
| `AchievementBadge` | Collection grid tile: unlocked shows real icon, locked/in-progress shows a lock + rarity-toned progress bar |
| `SettingsRow` | One Settings list row (icon, label, optional value, chevron). Deliberately separate from Train's `ExerciseListItem` despite a similar shape — no subtitle/badge here, a real difference, not a premature split. |
| `SettingsPageHeader` | Back-to-Profile + title, shared by the four Settings sub-pages |

`StatChipRow` used to live here; it moved to `@/features/shared/components/`
once Onboarding's DNA Result step needed the same pattern at a different
column count (this README wasn't updated at the time — fixed now).

## Design system change this milestone

Added `--color-legendary` to `globals.css` and a `legendary` tone to
`ProgressBar` — the base status palette had no fifth hue for Legendary-tier
achievements (flagged as a gap in the original architecture review, closed
now that Profile actually needs it). Not a new category, one missing token.

## Settings sub-pages

`src/app/(app)/profile/settings/{notifications,appearance,privacy,export}/` —
built during the Polish milestone to close a gap the audit flagged (these
were placeholder hrefs that 404'd). Each is a real, standalone page (own
`page.tsx` + client content component, following the same server/client
split as every other route in the app) with locally-scoped mock state, no
service layer — same reasoning as Auth/Onboarding: nothing here persists,
there's no backend yet.

- **Appearance** is deliberately honest about its own limits: theme
  selection is real (local state), but only Dark actually applies anywhere
  — the app has no light theme built. The page says so in a caption rather
  than letting Light/System silently do nothing.
- **Export data** shows a brief "preparing" state before a completion
  message — matching `ForgotPasswordForm`'s pattern (honest UX feedback,
  not a simulation of a real export job).

## Deliberately not built yet

Achievement unlock celebration/animation (a moment, not part of the static
collection view), progress photos, wearable integrations — all future-phase
per `docs/PROJECT.md`.
