# Insights Feature

Check here before adding an Insights component.

## Data

- `types.ts` — `InsightsData` (the screen's data contract).
- `api/getInsightsData.ts` — service seam; returns `Promise<InsightsData>`.
- `mocks/insightsData.ts` — fixtures. Score comes from the shared
  `src/data/score.ts` (also used by Home). Trend/PR/heatmap series are
  generated deterministically (no `Math.random()`), and every series' final
  point is pinned to the value shown elsewhere so nothing can contradict.
## Components

| Component | Purpose |
|---|---|
| `ScoreTrendCard` | Score numeral + delta + headline + range selector + trend chart. Deliberately separate from Home's `PhysIQScoreCard` (radial gauge) — same score data, different anatomy per surface. |
| `RangeSelector` | Vertical 7D/30D/90D/1Y picker. Not built on `Chip` — plain-text unselected state is a distinct pattern from Train's horizontal chip rows. |
| `BodyBalanceCard` | Six-pillar radar + weakest-pillar caption + `PillarGrid` beneath for precise numbers. Takes `pillars`/`weakestPillarId` straight from `PhysIQScoreSnapshot` — no separate Body Balance data of its own (see below). |
| `PersonalRecordCard` | One exercise's PR: value, delta, trend chart. |
| `StreakHeatmapCard` | 12-week training heatmap + legend. |

`AIInsightCard` (shared, from `@/features/shared/components/`) is reused
as-is for "What the data says" — no new component needed for that.

## Pillar model revision (resolved the old open question)

The Body Balance radar used to be a separately-authored six-axis fixture
that didn't map cleanly onto the four score pillars of the time (two axes,
Strength and Cardio, weren't tracked anywhere else). The pillar model was
revised (see docs/PHYSIQ_SCORE.md) to six pillars used identically
everywhere — Consistency, Strength, Cardio, BMI, Body Shape, Water. The
radar now renders `score.pillars` directly; there is no second dataset to
keep in sync, and `findWeakestAxis` (the old per-feature helper) was removed
in favor of `@/lib/score`'s `findWeakestPillar`, already computed once on the
shared score fixture.

## Deliberately not built yet

No screen needs them: a real 90D/1Y query path (mock resolves all four
ranges eagerly — cheap at this data size, no reason to fetch per range yet),
multiple personal records beyond Bench Press (array is already correctly
shaped for more), weekly/monthly Insights summary aggregation.
