# Train Feature (the "Workout" tab)

Named `train` to match the `/train` route per the canonical naming rule in
`docs/ROUTES.md`. Check here before adding a Train component.

## Data

- `types.ts` — `TrainData` (the screen's data contract).
- `api/getTrainData.ts` — service seam; returns `Promise<TrainData>`.
- `mocks/trainData.ts` — fixtures. Mission and exercise catalog come from
  shared `src/data/` fixtures (also used by Home and Session respectively)
  so no two screens can ever disagree on them.
- `lib/derive.ts` — `filterExercises(exercises, { query, muscleGroup })`,
  the pure filtering rule behind search + muscle chips.
- `hooks/useExerciseFilters.ts` — the screen's search/filter state (query,
  single-select muscle toggle, derived results) plus the shared
  `muscleFilterOptions` constant. Used by both the real Train screen and its
  playground harness so the two never drift apart.

## Components

| Component | Purpose |
|---|---|
| `WorkoutHeroCard` | Today's workout hero with full-width Start CTA; rest-day state when `mission` is `null`. Intentionally separate from Home's `DailyMissionCard` — same data, different anatomy per surface. |
| `ExerciseListItem` | Catalog row: icon tile, name, primary muscle · equipment, difficulty badge, chevron link to the exercise detail route. |

`FilterChipRow` (programs / muscle groups) used to live here; it moved to
`@/components/ui/FilterChipRow` once Compete needed the same pattern for its
leaderboard scope tabs.

Program schedules and the full WorkoutTemplate/planner model are still not
built (no screen needs them yet). Session/set models now exist —
`src/types/workoutTemplate.ts` and `src/types/workoutSession.ts`, built for
the Workout Session feature.
