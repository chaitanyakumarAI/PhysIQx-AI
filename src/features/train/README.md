# Train Feature (the "Workout" tab)

Named `train` to match the `/train` route per the canonical naming rule in
`docs/ROUTES.md`. Check here before adding a Train component.

## Data

- `types.ts` — `TrainData` (the screen's data contract).
- `api/getTrainData.ts` — service seam; returns `Promise<TrainData>`.
- `mocks/trainData.ts` — fixtures. Mission and exercise catalog come from
  shared `src/data/` fixtures (also used by Home and Session respectively)
  so no two screens can ever disagree on them. `catalogSize` is the real
  list length — the aspirational "412+" copy is gone.
- `lib/derive.ts` — `filterExercises(exercises, { query, muscleGroup })`,
  the pure filtering rule behind search + muscle chips. Results are ranked
  by the authored `muscleHit` stimulus share (EMG-informed content from
  content/muscle-involvement_filled.json): the harder a lift hits the
  selected group, the higher it lists. The list rows surface the same
  number as the hit-% badge, so the ranking is self-explaining.
- `lib/planLaunch.ts` — `buildPlanDayLaunch(plan, day)`: turns a user
  plan's day into startSession params (the "plan-*" mission-id contract
  with /session/[id]).
- `hooks/useExerciseFilters.ts` — the screen's search/filter state (query,
  single-select muscle toggle, derived results, top-10 paging with a
  Show-more reveal that resets on filter change) plus the shared
  `muscleFilterOptions` constant. Used by both the real Train screen and its
  playground harness so the two never drift apart.

## Components

| Component | Purpose |
|---|---|
| `WorkoutHeroCard` | Today's workout hero with full-width Start CTA; rest-day state when `mission` is `null`. Intentionally separate from Home's `DailyMissionCard` — same data, different anatomy per surface. |
| `ExerciseListItem` | Catalog row: icon tile, name, primary muscle · equipment, difficulty badge, chevron link to the exercise detail route. |
| `MyPlansSection` | The user's own plans: per-day Start buttons (client-side session launch) + edit/create links. |
| `PlanEditor` | The plan builder behind `/train/plans/new` and `/train/plans/[id]`: days, catalog picker, per-set reps, rest select; whole-plan saves to the persisted plansStore. |

`FilterChipRow` (programs / muscle groups) used to live here; it moved to
`@/components/ui/FilterChipRow` once Compete needed the same pattern for its
leaderboard scope tabs.

Program schedules and the full WorkoutTemplate/planner model are still not
built (no screen needs them yet). Session/set models now exist —
`src/types/workoutTemplate.ts` and `src/types/workoutSession.ts`, built for
the Workout Session feature.
