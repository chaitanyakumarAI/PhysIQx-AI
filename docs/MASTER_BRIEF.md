# PhysIQx — Master Brief

The complete product description: identity, philosophy, design language,
feature map, and technical shape. Use it whole as opening context for any
AI session, or lift sections (Design language + Voice for image/copy
tools, The score for fitness-content work). Kept current as the product
evolves — this reflects what is BUILT, not just envisioned.

## What this product is

PhysIQx is a premium mobile-first fitness app whose core invention is the
PhysIQ Score: one number (0–100) that converts everything a user actually
does — workouts logged, cardio minutes, consistency, body composition —
into a single figure they can care about. The app is a coach, not a
dashboard: every screen answers "what should I do next?", never "here is
all your data." Tagline: Every rep feeds your PhysIQ Score.

## The score (four pillars, weighted by health evidence)

- **Consistency 30%** — showing up is the engine of everything else
- **Strength 25%** — estimated 1RM (Epley: weight × (1 + reps/30), reps
  capped at 10) relative to bodyweight, mapped to published strength
  standards on a diminishing-returns curve
- **Cardio 25%** — weekly minutes vs the WHO 150-minute guideline
- **Body Shape 20%** — the user SELECTS their body type from illustrated
  silhouettes (9 builds per sex: Obese 15% → Sculpted 96%, non-linear);
  height, sex, and age adjust the percentage automatically (tall gets +4
  on muscle-forward builds; age adds up to +12 — a 50-year-old at Athletic
  equals a 25-year-old at Muscular). Never calculated from photos.

Score psychology: quick to reward, slow to punish. Missed days consume a
buffer before the score moves; the higher you climb the harder each point
gets; the score must never collapse and kill motivation. BMI and hydration
are deliberately NOT pillars: BMI punishes muscle, hydration is a habit.

## Design language

- Dark, near-black green-cast surfaces (#0a0d0b ground), brand green
  #22c55e with #16a34a depth, Space Grotesk for display numerals/headers
- Light lives in the UI: glows, auras, gradient falloffs — never flat slabs
- Color grammar: green = progress/identity; amber = warning/at-risk ONLY;
  red = quiet negatives (muted, never punitive); violet #a78bfa = flat tint
  reserved exclusively for Legendary rarity; blue = informational accents
- One geometry per meaning: uniform capsules/cells where only fill varies
- 390px viewport is the design target; 44px minimum touch targets;
  reduced-motion respected everywhere; entrance choreography plays ONCE
  per session — returning to a screen renders instantly
- The word "AI" is banned from the UI (it read as spam). The intelligence
  is felt in content, badged nowhere: "Coach", "For you", a lightbulb.

## Non-negotiable product philosophies

1. **HONESTY**: the UI never lies. Real ledgers (completed sessions, cardio
   log, weigh-ins) drive the week strip, streak, spotlight, and coach
   insights; fixtures appear only at day zero. If the app can't know
   something (no schedule = can't call a day "missed"), it stays neutral.
2. **TARGETS, NEVER CAPS**: every rep prescription is a guide. "×8 target",
   "To failure" (AMRAP), "40 sec" (timed). Going to failure is always
   valid; inputs are free; placeholders are ghosts (25% opacity).
3. **FREQUENT WINS**: the freshest real achievement is surfaced on Home;
   celebrations are specific and quantified ("2,140 kg moved · +320 XP"),
   never generic praise.
4. **QUALITY OVER QUANTITY**: no filler exercises, no padded content, no
   third card when two say it; every element earns its place.
5. **USER CONTROL**: skip everything (tours, rest timers), edit everything
   (adopted programs become fully editable plans), any number of sets/reps.

## Feature map

- **Home**: date + recovery strip → Today's Mission (one clear workout) →
  Today's Priorities → PhysIQ Score (radial, band, sparkline, headline
  naming the weakest pillar) → freshest-win spotlight → This Week capsules
- **Train**: mission hero, Log cardio, 8 program chips (Coach + PPL,
  Upper/Lower, Bro, Full Body, Body Part, Fat Loss, Arnold — each with
  level, days/week variants, full schedule page, Duolingo-style month
  calendar mapping workouts to real days, and Adopt-as-my-plan), user plan
  builder (any days/exercises/per-set reps), 189-exercise catalog with
  EMG-based muscle-hit percentages (badge shows the active filter's %;
  filters rank by stimulus share), exercise detail pages with per-muscle
  bars
- **Session**: set logging with last-time ghosts ("Last time: 60 kg × 8"),
  visible N-of-M progress, skippable rest timer, add/remove sets live,
  Finish disabled until one real set (protects the ledger), Workout
  Complete celebration (duration/volume/XP)
- **Insights**: interactive score trend (drag to scrub), pillar tiles +
  weakest link, PR switcher per lift, 12-week tappable streak heatmap
- **Compete**: weekly challenge with progress, "you're climbing" gap card,
  XP leaderboard with portrait avatars, circle activity feed. XP is the
  social currency; the score stays personal.
- **Profile**: portrait avatar (16 presets + upload), body stats page
  (height/weight/BMI-as-context, weight trend chart), top-3 achievement
  showcase (user-curated, locked ones desaturated), settings
- **Onboarding**: 6 questions (goal, body shape, experience, split, rest
  days, frequency) → DNA reveal → guided walkthrough: a spotlight window
  glides across the LIVE interface through all 5 tabs (10 beats),
  skippable at every step, replayable from Profile
- **Coach program (direction)**: rules-based — picks the right program
  from days/week + level + goal, rotates its days using session history,
  explains itself in one line ("Pull-Width today — you pushed yesterday")

## Technical shape (mock-data phase)

Next.js 15 App Router + TypeScript strict + Tailwind tokens + framer-motion
(m components), zustand persisted stores (session/profile/plans/cardio,
skipHydration + explicit rehydration), no backend/auth/AI yet — everything
behind api/get*Data.ts seams and src/data fixtures. Content is authored in
JSON (content/) and GENERATED into typed src/data files — content files are
the source of truth; hand-editing generated code is forbidden. Completed
workouts write a summary ledger (date, volume, sets, XP, best set per
exercise) that all live derivations read.

## Voice

Confident coach, zero fluff, specific numbers over adjectives, one-line
explanations that teach ("Cardio carries 25% of your score — an easy walk
counts"). Never shame: missed days are reflected, not punished. Rest days
you planned count as wins.
