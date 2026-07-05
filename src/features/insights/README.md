# Insights Feature

Check here before adding an Insights component.

## Data

- `types.ts` — `InsightsData` (the screen's data contract).
- `api/getInsightsData.ts` — service seam; returns `Promise<InsightsData>`.
- `mocks/insightsData.ts` — fixtures. Score comes from the shared
  `src/data/score.ts` (also used by Home). Trend/PR/heatmap series are
  generated deterministically (no `Math.random()`), and every series' final
  point is pinned to the value shown elsewhere so nothing can contradict.
- `lib/derive.ts` — `findWeakestAxis(points)`, mirrors `@/lib/score`'s
  `findWeakestPillar` but scoped here (only Insights needs it today).

## Components

| Component | Purpose |
|---|---|
| `ScoreTrendCard` | Score numeral + delta + headline + range selector + trend chart. Deliberately separate from Home's `PhysIQScoreCard` (radial gauge) — same score data, different anatomy per surface. |
| `RangeSelector` | Vertical 7D/30D/90D/1Y picker. Not built on `Chip` — plain-text unselected state is a distinct pattern from Train's horizontal chip rows. |
| `BodyBalanceCard` | Six-axis radar + weakest-axis caption. |
| `PersonalRecordCard` | One exercise's PR: value, delta, trend chart. |
| `StreakHeatmapCard` | 12-week training heatmap + legend. |

`AIInsightCard` (shared, from `@/features/shared/components/`) is reused
as-is for "What the data says" — no new component needed for that.

## Open product question (unresolved, flagged in docs/PHYSIQ_SCORE.md)

The Body Balance radar's six axes (Strength, Nutrition, Hydration, Recovery,
Cardio, Consistency) don't map 1:1 onto the four score pillars
(Training/Nutrition/Recovery/Consistency) — two axes (Strength, Cardio)
aren't tracked anywhere else in the app yet. Mock data here is authored
directly, not derived from the pillars. A real implementation needs a
product decision on this mapping before `lib/score` can compute it.

## Deliberately not built yet

No screen needs them: a real 90D/1Y query path (mock resolves all four
ranges eagerly — cheap at this data size, no reason to fetch per range yet),
multiple personal records beyond Bench Press (array is already correctly
shaped for more), weekly/monthly Insights summary aggregation.
