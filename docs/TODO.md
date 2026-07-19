# PhysIQx — TODO

Living task list. Grouped by urgency, then phase. Update as things land.
Last audited: **2026-07-19**.

---

## 🔴 Do Now — Blockers & Quick Fixes

- [x] **Commit the design-folder reorganisation** *(67fde01)*
  `design/` reorganised — past UI screenshots moved to `past_UI/`,
  mascot drafts to `kix_drafts/`, favicons to `favicons_generated/`.

- [x] **Update `lucide-react` from 1.23.0 → 1.25.0** *(84a7650)*

- [x] **Write unit tests for `src/lib/score.ts`** *(84a7650)*
  23 tests passing. Covers `computeWeightedScore`, `findWeakestPillar`,
  `scoreBand`, `orderPillarsByWeight`, and `pillarWeights` invariants.
  Edge cases: empty arrays, single pillar, calibration (partial list),
  tie-breaking, boundary values, float rounding, immutability.
  Run with: `npm test` · Watch mode: `npm run test:watch`

---

## 🟡 High Priority — Before Phase 2 (Frontend Integration)

### Session & Training

- [x] **Expose RPE field in `SetRow`** *(b0545b6)*
  Added optional `@RPE` input (1–10, ghost placeholder) alongside weight × reps.
  RPE is passed to session store set updates to track exercise intensity.

- [x] **Progressive overload — next-set suggestion** *(f2a8c3d)*
  `computeSuggestion()` in `sessionStore.ts` walks history newest-first to find
  the last best set per exercise. +2.5 kg step if they hit all target reps;
  same weight otherwise. Ghost-fills weight × reps inputs via `suggest` prop
  on `SessionExercise → ExerciseSessionCard → SetRow`. Clears once any value
  is typed.

- [x] **Multi-session store safety** *(b0545b6)*
  `sessionStore` handles starting a new mission when one is already active
  by auto-summarizing the active session as `abandoned` into `history`
  so no logged work is ever silently lost.

### Code Health

- [x] **Enforce `Insight.body` ≤ 2-sentence contract** *(b0545b6)*
  Created `enforceTwoSentences(text)` helper in `src/types/insight.ts` and wrapped
  `insight.body` inside `AIInsightCard.tsx`. Unit tests added (28/28 tests passing).

- [x] **Wire onboarding form to a real profile store** *(b0545b6)*
  Added `onboardingProfile` state and `setOnboardingProfile` action to `profileStore.ts`.
  Wired `OnboardingFlow.tsx` submit to save user preferences locally upon completion.

---

## 🟠 Medium Priority — Phase 2 Polish

### Animations & Mascots

- [ ] **Exercise demo loops — WebM clips**
  PERFORMANCE.md budget: 189 exercises × ~200 KB WebM = ~30–45 MB on
  disk, lazy-loaded per detail page, one playing, paused off-screen.
  - Source: commission short 2–4 s looping clips or find a stock library
  - Add `demoVideoSrc?: string` to the `Exercise` type
  - Build `ExerciseDemoPlayer` component (thumbnail-first, IntersectionObserver
    pause, `muted playsInline loop`, `decoding="async"`)
  - Wire to `/train/exercises/[id]` detail pages

- [ ] **Rive animation for body shape onboarding step**
  The body-shape selection in onboarding currently uses static
  illustrated silhouettes. Replace with one Rive file with a state
  machine input that morphs the silhouette as the user selects
  their build (9 builds, Obese 15% → Sculpted 96%).
  - Source at rive.app/community or commission ($50–$150)
  - Add `@rive-app/react-canvas` (~40 KB gzipped)
  - State machine input: `buildIndex: number` (0–8)

- [ ] **Kix — full-body pose set**
  MASCOTS.md: next asset phase is "full-body pose sets (Kix action
  poses, Nyra quadruped/teaching poses), then the duo poster, then
  in-app integration." Kix cinematic anchor is locked. Generate:
  - Arms-raised celebration
  - Running/sprinting
  - Thumbs-up salute (teaching mode variant)

- [ ] **Nyra — quadruped teaching poses**
  Generate from `nyra-anchor.png`:
  - Seated upright (semi-anthro teaching mode — for coach insight cards)
  - Lying across a doorway (rest-day card)
  - Prowling (challenge / streak-risk surfaces)

- [ ] **Duo poster**
  One shared image: Kix and Nyra together. Reserved for legendary
  moments (30-day streak, score band-up, onboarding finale). Generate
  with both anchors attached to the generation tool.

### Performance

- [ ] **Lazy-load Recharts on `/insights` only**
  Currently Recharts may be leaking into the shared 102 KB chunk.
- [N/A] **Lazy-load Recharts on `/insights` only**
  ~~Recharts was never added.~~ Both charts (`TrendChart`, `RadarChart`) are
  custom pure-SVG components — zero third-party charting library. No action needed.

- [N/A] **Verify `domAnimation` not `domMax` in `MotionProvider`**
  `domMax` is intentional: the bottom-nav active pill uses `layoutId`
  shared-layout animations which require it. Confirmed correct.

- [ ] **Restrict `Space_Grotesk` font weights**
  Only weights 600 and 700 are used (`font-semibold`/`font-bold` on
  display text). Loading all weights wastes ~15–25 KB.
  ```ts
  Space_Grotesk({ subsets: ["latin"], weight: ["600", "700"], display: "swap" })
  ```

- [ ] **Run bundle analyser and fix any chunk leaks**
  ```bash
  npm install -D @next/bundle-analyzer
  ANALYZE=true npm run build
  ```
  Look for: any feature-specific imports pulled into the 102 KB base, large polyfills.

---

## 🟢 Phase 3 — Authentication (Supabase)

- [ ] Add Supabase client (`@supabase/supabase-js`)
- [ ] Email + password login — wire `LoginForm` to `supabase.auth.signInWithPassword`
- [ ] Google OAuth — wire `SocialLoginButtons`
- [ ] Session management — server-side middleware route guard
  (unauthenticated → `/login`, authenticated no onboarding → `/onboarding`,
  authenticated + onboarded → `/home`)
- [ ] Persist onboarding output to `profiles` table on submit
- [ ] Forgot password flow — wire `ForgotPasswordForm`

---

## 🔵 Phase 4 — Database

- [ ] Design Supabase schema: `profiles`, `sessions`, `session_exercises`,
  `sets`, `cardio_logs`, `hydration_logs`, `xp_transactions`
- [ ] Replace `src/data/` fixtures with real `supabase.from()` calls
  behind the existing `api/get*Data.ts` seams (no screen changes needed)
- [ ] Offline-first session logging — write to local store first,
  sync on reconnect (critical: session must survive airplane mode)
- [ ] Real PhysIQ Score computation from live ledger data
- [ ] Real streak and DayStatus derivation from session history

---

## 🟣 Phase 5 — Core Features

- [ ] **Progressive overload engine** — `lib/progression.ts`
  Given last session's sets, compute the next target weight/reps
  per exercise using a simple linear progression rule.
- [ ] **AI Coach insights** — generate `Insight` objects from real
  pillar deltas, PR trends, and fuel adherence; replace mock fixtures
- [ ] **Deterministic `generateHeadline(pillars, delta)`** — build this
  as a rules-based stub before Phase 6 so the AI replacement is a
  clean swap, not a retrofit
- [ ] **Achievement unlock engine** — evaluate `UserAchievement.progress`
  against real ledger data; fire `XPTransaction` + celebration on unlock
- [ ] **Notification scaffolding** — streak-risk, challenge results,
  mission reminders; deep-link targets per `ROUTES.md`
- [ ] **PWA service-worker** — cache app shell (layouts, fonts, static
  routes); `/session/[id]` must work fully offline

---

## ⚪ Phase 6 — AI (Future)

- [ ] **AI program generation pipeline** — design the LLM → structured
  `WorkoutTemplate` schema pipeline. Inputs: profile goal + days/week +
  session history. Output must conform to existing `Program` type with
  no schema changes to existing screens.
- [ ] **Conversational AI Coach** — if it outgrows inline cards,
  promote to a dedicated `/coach` route (reserved in ROUTES.md)
- [ ] **Adaptive difficulty** — post-session RPE + volume trend feeds
  the next session's target prescription
- [ ] **ML score trajectory forecast** — renders as a distinct forecast
  line on the Insights trend chart, clearly separated from history

---

## 📋 Resolved (archive)

- [x] `.gitattributes` for LF normalization *(c9b9419)*
- [x] Settings sub-pages (notifications, appearance, privacy, export)
- [x] 6-pillar → 4-pillar scoring model (BMI + Hydration removed)
- [x] Cardio logging screen (`/train/cardio`) *(063e0f9)*
- [x] Exercise detail pages — 189 routes, no more 404s *(a065b77)*
- [x] 189-exercise catalog with EMG muscle-hit percentages *(ef48cd8)*
- [x] Program library — 8 programs with full schedules *(e42e6c6)*
- [x] Custom workout plan builder *(f1672c6)*
- [x] Session "last time" ghosts + earned Finish button *(7ada999)*
- [x] Real avatar portraits — 15 personas + upload *(7cbbb6b)*
- [x] Body stats page (`/profile/body`) *(52c8421)*
- [x] Guided walkthrough — 10 beats, all 5 tabs *(d76da4a)*
- [x] Interactive charts (scrubbing, PR switcher, tappable heatmap)
- [x] Page transitions + celebration system *(ed46b61)*
- [x] Mascots Kix & Nyra — cinematic canon locked, Phase K1 shipped *(424f2b0)*
- [x] React 19 `<title>` array-children warning in RadarChart *(fixed in session)*
- [x] CRLF line ending warnings *(gitattributes)*
- [x] `lucide-react` version verified — **1.23.0 is real** (latest 1.25.0)
