# Home Feature

Check here before adding a Home component — mirrors the reuse-discovery
convention in `src/components/README.md`. `AIInsightCard` used to live here;
it moved to `src/features/shared/components/` once Insights needed it too —
see that folder's README. `HealthPillarSummary` (the old four-bar pillar row)
was retired during the pillar-model revision — replaced by the shared
`PillarGrid` (see `features/shared/README.md`), which Insights now uses too.

## The screen's one job

Home answers "**what should I do next?**" in the first five seconds. The
order is the morning flow: status strip + greeting → Mission → Priorities →
Score → today's win → week. Everything that used to compete for attention
(pillar grid, fuel cards, standalone AI insight, XP bar) moved one tap away
(Insights/Profile) — progressive disclosure, decided in the July 2026
first-principles rethink. Do not add sections back without challenging them
against that question.

## Data

- `types.ts` — `HomeData` (the screen's data contract), `QuickAction`,
  `DailyPriority`.
- `api/getHomeData.ts` — the service seam; returns `Promise<HomeData>`.
  Resolves mock fixtures today, a real fetch later — callers don't change.
- `mocks/homeData.ts` — fixtures. Every derived field is computed via
  `lib/derive.ts`, never hand-typed, so numbers can't drift out of consistency.
- `lib/derive.ts` — pure fixture-consistency helpers (percent, completion%,
  `deriveRecoveryStatus`). Weakest-pillar math lives in `@/lib/score`.
- `lib/greeting.ts` — pure time-of-day greeting text.
- PR spotlight values come from the shared `@/data/personalRecords` (also
  feeds Insights' PR cards — one source, no contradictions).

## Components

| Component | Purpose |
|---|---|
| `StatusStrip` | Date + live recovery chip framing the greeting; date computed client-side (SSG) |
| `WelcomeHeader` | Greeting, streak badge, archetype; avatar links to /profile |
| `DailyMissionCard` | Today's mission; renders a rest-day state when `mission` is `null` |
| `TodaysPriorities` | The coach's supporting actions (hydration/cardio/weigh-in), each tied to a score pillar with its payoff stated. The mission is NOT in this list — its card sits directly above |
| `PhysIQScoreCard` | Score gauge + band + "vs last week" delta + sparkline + "See breakdown". Deliberately borderless — a radial gradient dissolving into the page, not another rectangle |
| `AchievementSpotlight` | Notification-style "New PR" card (violet trophy — sanctioned accent moment); will be reused by the celebration system |
| `WeeklyActivityCard` | "This Week" completion % + daily bar chart |
| `FuelStatCard` | One fuel metric (hydration). No longer on Home (priorities carry hydration); kept for playground/insights reuse |
| `XPProgress` | Level/XP bar. No longer on Home — Profile owns progression display |
| `QuickActionGrid` | One-tap shortcut tiles; hrefs follow the quick-log param convention in `docs/ROUTES.md` |

All components are presentational — they take data via props and contain no
fetching or business logic.
