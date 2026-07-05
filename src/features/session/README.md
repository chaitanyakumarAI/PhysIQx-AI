# Session Feature (Workout Session)

Check here before adding a Session component. Includes both the reusable
feature layer and the real `/session/[id]` route (`src/app/session/[id]/`),
per `docs/ROUTES.md`: one route, two states keyed off `session.status`.

## Structure

Different from every other feature in one key way: session state is
genuinely stateful and must survive a refresh (docs/DATA_MODELS.md:
WorkoutSession "must survive app kill and airplane mode"). That's why this
feature has a `src/store/` entry (`sessionStore.ts`) instead of a
`getXData()` read model — there's no "fetch," there's live state that
needs to persist.

- `src/store/sessionStore.ts` — Zustand + `persist` (localStorage). This is
  frontend-only durability for the mock phase, not the real backend sync
  that arrives with Phase 4's Database — it satisfies the *documented*
  requirement at the layer this phase actually owns. Actions: `startSession`
  (resumes rather than recreates if the same mission's session is already
  active), `logSet`, `toggleSetCompleted`, `finishSession`, `abandonSession`,
  `clearSession`.
- `src/types/workoutTemplate.ts`, `src/types/workoutSession.ts` — the models
  Train's README flagged as deferred until a screen needed them. Built now.
- `src/data/exercises.ts` — the exercise catalog, promoted from Train's mock
  once Session needed the same catalog (so "Barbell Bench Press" is the same
  exercise, same id, in both places). Also added a Triceps Pushdown entry —
  the catalog had no triceps-isolation movement, and Push Day A's mission
  theme ("Chest, Shoulders, Triceps") needed one rather than substituting a
  wrong-muscle-group exercise.
- `src/data/workoutTemplates.ts` — Push Day A's blueprint, the only template
  needed since it's the only mission that exists.
- `lib/derive.ts` — `formatElapsedTime`, `computeSessionVolume`,
  `computeSessionProgress`, `findActiveExerciseIndex`. All computed from the
  session's own sets, never hand-authored.
- `hooks/useElapsedSeconds.ts` — ticks from a real `startedAt` timestamp
  (not an in-memory counter), so the display is correct immediately after a
  resume, not reset to zero.

### Hydration ordering

The store uses `skipHydration: true` (`sessionStore.ts`) — localStorage
doesn't exist during server rendering, so auto-rehydrating at store-creation
time would make the client's first render disagree with the server's, a
real hydration-mismatch risk for `ResumeSessionBanner` (shown on every tab
screen). `StoreHydrator` (`components/providers/`, mounted once in the root
layout) triggers the real rehydration after mount for passive readers like
that banner.

But React fires effects bottom-up on mount (children before parents), and
`StoreHydrator` lives at the root — so a deeply-nested consumer that both
*reads and writes* on mount (`SessionScreen`'s `startSession` call) would
otherwise race with it: `startSession` could run against the pre-hydration
`null` state, then get silently clobbered when the root's rehydration
finally resolves. `SessionScreen` and the playground harness both rehydrate
locally first and only call `startSession` after that resolves, making them
correct regardless of the global hydrator's timing. `rehydrate()` types as
`Promise<void> | void` (localStorage reads are synchronous) —
`Promise.resolve(...)` normalizes both so the `.then()` always runs.

## Components

| Component | Purpose |
|---|---|
| `SessionTimer` | Large elapsed-time numeral. Presentational — takes seconds as a prop, doesn't call the hook itself, stays testable without a live session. |
| `RestTimer` | Self-contained countdown between sets. Deliberately not persisted (a refresh mid-rest just restarts it — low stakes) unlike the session timer. |
| `SetRow` | Weight × reps inline inputs + complete toggle. Not built on `ui/Input` — compact, label-less row fields, same reasoning as `ExerciseListItem`/`LeaderboardRow` not reusing it either. |
| `ExerciseSessionCard` | One exercise's set list; owns local "which set just finished, show rest timer" state — ephemeral UI state, doesn't belong in the persisted store. |
| `SessionSummaryCard` | Completed-session celebration. Reuses `CircularProgress`'s glow and the shared `StatChipRow` — same pattern as Onboarding's DNA Result, not a new celebratory effect. |
| `ResumeSessionBanner` | Cross-screen "workout in progress" banner (rendered by `AppBottomNav`, visible on all five tabs while a session is active). Positioned with a spacing-scale offset (`bottom-24`) that clears `BottomNavigation` with headroom, deliberately not a pixel-matched `calc()` coupled to that component's exact height. |

## Known limitation

The store holds exactly one session slot (`WorkoutSession | null`), not a
history. `startSession` only resumes-not-recreates when the *same* mission's
session is already active — starting a *different* mission's session while
one is active would silently overwrite it, in tension with DATA_MODELS.md's
"abandoned work is saved, never discarded." Currently unreachable from the
actual UI (only one mission exists in the whole mock dataset, so there's no
way to trigger two concurrent sessions), so left as a documented limitation
rather than building multi-session tracking for a scenario nothing can
currently produce.

## Route

- `src/app/session/[id]/page.tsx` — Server Component; resolves the mission
  by id via `api/getSessionSetup.ts` (a lookup table today, since only one
  mission exists — shaped so adding more is a data change, not a rewrite),
  calls Next 15's async `params`, and 404s to `not-found.tsx` for an
  unknown id.
- `not-found.tsx` renders the correct friendly UI for an unknown mission id
  (verified against the production server), but the actual HTTP status stays
  200 rather than 404 — a known Next.js App Router nuance where `notFound()`
  inside an async dynamic-route Server Component doesn't always propagate the
  true status code. Not fixable from application code; low-impact here since
  this is an authenticated app route, not something crawled/indexed. Building
  the root-level `src/app/not-found.tsx` alongside this (a separate, genuine
  gap — no catch-all existed for any mistyped URL anywhere in the app) fixed
  the *general* 404 case correctly, confirmed via the production server.
- `SessionScreen.tsx` — the client controller. "Leave" navigates to `/home`
  immediately, no confirmation dialog — reconsidered and dropped: ROUTES.md's
  "pause and keep" leave-guard means preserving state (already handled by
  the persisted store) and letting the user leave freely, not blocking
  navigation with a prompt. So no `Dialog` primitive was needed after all.
- The completed-summary view computes duration from `completedAt`/`startedAt`
  directly, not the live elapsed-seconds hook — the hook stops ticking the
  instant status flips to `completed` and can be up to ~1s stale.

## Deliberately not built yet

Nothing outstanding from `docs/ROUTES.md`'s session flow at this point —
the resume banner (initially deferred as a follow-up) was added during the
Polish milestone via `AppBottomNav`, without modifying `BottomNavigation`
itself or any of the five tab screens directly.
