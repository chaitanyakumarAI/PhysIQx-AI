# Onboarding Feature

Check here before adding an Onboarding component. Like Auth: **no data to
fetch** — no `types.ts`, no `mocks/`, no `api/getXData()`. The whole flow
lives in one route (`/onboarding`, per `docs/ROUTES.md`), not one route per
step.

## Structure

- `schemas.ts` — `onboardingSchema` (Zod) + `defaultOnboardingValues`.
  Selection fields (goal/experience/split) are optional in the schema —
  there's nothing to fail validation once one is picked, so each step gates
  its own Continue button on presence, not a Zod error.
- `lib/generateArchetype.ts` — pure function composing the "PhysIQ DNA"
  reveal phrase from goal × split (9 authored strings → 20 combinations),
  not a real computation.
- `components/OptionCard.tsx` — large single-select card (Goal, Experience,
  Split). Uses `aria-pressed`, not `role="radio"` — deliberately matches
  Chip/FilterChipRow's existing pattern rather than introducing radiogroup
  semantics (arrow-key cycling) this component doesn't implement.
- `components/GoalStepper.tsx` — large-numeral +/- stepper (Rest Days,
  Protein, Water). Not a native range input — cross-browser slider styling
  is a well-known source of inconsistent results; a stepper with a
  confident hero numeral channels the same "big numbers" technique the
  reference designs use, in a form every browser renders identically.
- `components/steps/*` — one component per step, presentational only.
- `components/OnboardingFlow.tsx` — the controller. One `useForm()` instance
  via `watch`/`setValue` (not `register()` — none of the step UIs are native
  inputs), plus the step index and per-step Continue gating.

## Design-bar note

This is the first feature built under the "reference designs are inspiration,
not blueprints" policy (see memory). The reference bento-grid density
doesn't apply here — onboarding is inherently one-decision-per-screen, the
opposite instinct from a multi-widget dashboard. What was taken instead:
confident, generous touch targets (`OptionCard` over small checkboxes), and
large hero numerals (`GoalStepper`) for the one moment (DNA Result) that
earns a celebratory treatment, reusing `CircularProgress`'s existing glow
rather than inventing a new effect.

## Deliberate scope decisions

- **Rest Days collects a count, not specific weekdays.** `Profile` only
  models `trainingDaysPerWeek: number` — DATA_MODELS.md has no field for
  which weekdays are rest days. Copy frames it as "how many rest days" to
  match `docs/ROUTES.md`'s step naming; the stored value is the training-day
  count, not an invented weekday-selection field with nowhere to persist.
- **Nothing collected here is saved.** No backend exists yet — reaching the
  end navigates straight to `/home` with Alex's existing mock identity
  unchanged. The comment in `OnboardingFlow.handleContinue` marks the seam
  where a real profile-creation call belongs.
- **Skip is available from Welcome only**, not every step — reduces friction
  for a user who doesn't want to fill out six questions, without needing a
  skip control on every single step once they've started.
