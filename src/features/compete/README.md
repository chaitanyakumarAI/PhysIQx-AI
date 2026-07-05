# Compete Feature (the "Community" tab)

Named `compete` to match the `/compete` route per the canonical naming rule
in `docs/ROUTES.md`. Check here before adding a Compete component.

## Data

- `types.ts` — `CompeteData` (the screen's data contract).
- `api/getCompeteData.ts` — service seam; returns `Promise<CompeteData>`.
- `mocks/competeData.ts` — fixtures. Leaderboard XP scales by a fixed
  multiplier per scope (weekly ×1, monthly ×4.3, all-time ×18) rather than
  reshuffling rank order — no product decision says rankings should change
  shape per scope, so inventing that would be unjustified.
- `lib/derive.ts` — `getRankMovement` (rank + previousRank → direction/delta,
  never hand-authored alongside rank), `computeXPGapToNextRank`,
  `formatRelativeTime`.

## Components

| Component | Purpose |
|---|---|
| `WeeklyChallengeCard` | Volume King card: badge, progress bar, reward footer |
| `ClimbingCard` | "You're climbing" — XP gap to the next rank + this-week movement |
| `LeaderboardRow` | Rank, avatar, name (+"· you"), XP, movement badge |
| `ActivityFeedItem` | "Live from your circle" row; client component (see note below) |

`FilterChipRow` (shared, from `@/components/ui/`) is reused as-is for the
Weekly/Monthly/All-time scope tabs — no new component needed for that.

## Known limitation: relative activity timestamps

`ActivityFeedItem` is a client component that pins `now` once per session
(`useState(() => new Date())`) rather than computing it server-side, so
"12m ago" doesn't freeze the way Home's greeting would have (same fix,
same reasoning — see `WelcomeHeader`). The fixture's `occurredAt` values are
generated relative to real time at fixture-build time rather than a fixed
calendar date, for the same reason: a fixed past date would go stale the
moment it's viewed even once removed from today, whereas this only drifts
between rebuilds of the static page. Acceptable for the mock phase; a real
backend resolves it properly (timestamps become genuinely live data).

## Deliberately not built yet

Circle/Friendship as its own modeled entity — no screen currently manages
circle membership, only displays leaderboard rows and an activity feed
already scoped to "your circle" in the fixture. Modeling it now would be
speculative.
