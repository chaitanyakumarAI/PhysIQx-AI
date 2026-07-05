# Home Feature

Check here before adding a Home component — mirrors the reuse-discovery
convention in `src/components/README.md`. `AIInsightCard` used to live here;
it moved to `src/features/shared/components/` once Insights needed it too —
see that folder's README.

## Data

- `types.ts` — `HomeData` (the screen's data contract) and `QuickAction`.
- `api/getHomeData.ts` — the service seam; returns `Promise<HomeData>`.
  Resolves mock fixtures today, a real fetch later — callers don't change.
- `mocks/homeData.ts` — fixtures. Every derived field is computed via
  `lib/derive.ts`, never hand-typed, so numbers can't drift out of consistency.
- `lib/derive.ts` — pure fixture-consistency helpers (percent, completion%).
  Weakest-pillar math lives in `@/lib/score` (shared with Insights).
- `lib/greeting.ts` — pure time-of-day greeting text.

## Components

| Component | Purpose |
|---|---|
| `WelcomeHeader` | Greeting, streak badge, archetype, avatar |
| `PhysIQScoreCard` | Score gauge + delta + headline; handles `calibrating` state. Reusable on Insights. |
| `HealthPillarSummary` | Four-pillar progress row under the score |
| `DailyMissionCard` | Today's mission; renders a rest-day state when `mission` is `null` |
| `WeeklyActivityCard` | "This Week" completion % + daily bar chart |
| `FuelStatCard` | One fuel metric (hydration/protein) — icon, value/goal, progress. Compose two per screen. |
| `XPProgress` | Level, title, XP-to-next-level bar |
| `QuickActionGrid` | One-tap shortcut tiles; hrefs follow the quick-log param convention in `docs/ROUTES.md` |

All components are presentational — they take data via props and contain no
fetching or business logic. Assembly into the actual Home page (layout,
ordering, motion) is a separate, later step.
