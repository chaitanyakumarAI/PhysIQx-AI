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
| `StatChipRow` | Row of label/value stat cards — reused for both stat rows |
| `DNABanner` | "PhysIQ DNA · <archetype>" banner |
| `AchievementBadge` | Collection grid tile: unlocked shows real icon, locked/in-progress shows a lock + rarity-toned progress bar |
| `SettingsRow` | One Settings list row (icon, label, optional value, chevron). Deliberately separate from Train's `ExerciseListItem` despite a similar shape — no subtitle/badge here, a real difference, not a premature split. |

## Design system change this milestone

Added `--color-legendary` to `globals.css` and a `legendary` tone to
`ProgressBar` — the base status palette had no fifth hue for Legendary-tier
achievements (flagged as a gap in the original architecture review, closed
now that Profile actually needs it). Not a new category, one missing token.

## Deliberately not built yet

Achievement unlock celebration/animation (a moment, not part of the static
collection view), settings sub-pages (routes are wired per
`docs/ROUTES.md`'s reserved-routes convention, pages don't exist yet),
progress photos, wearable integrations — all future-phase per `docs/PROJECT.md`.
