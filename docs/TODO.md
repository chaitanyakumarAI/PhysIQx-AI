# PhysIQx — TODO

Living task list. Grouped by urgency, then phase. Update as things land.
Last audited: **2026-09-28**.

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

- [x] **Fix Wearables & Integrations Toggle Switch Alignment**
  Fixed toggle switch thumb in `IntegrationsContent.tsx` by using `relative inline-flex items-center`
  with `border-2 border-transparent` and `translate-x-5` / `translate-x-0.5`, eliminating switch knob protrusion outside the track.

- [x] **Remove Cardio and Water Intake from Home Suggestions**
  Cleaned `homeData.ts` and `HomeScreen.tsx` to stop suggesting water intake and cardio walks.
  Re-anchored Today's Priorities on lifting execution, Big 4 strength benchmarks, and bodyweight tracking.
  Home Quick Action bar: `Train`, `Library`, `History`, `Compete` (4 items; `Coach` removed when `/coach` was deferred).

- [x] **Decongest Strength Standards Card UI**
  Replaced cramped `sm:grid-cols-4` horizontal squishing in `StrengthStandardsCard.tsx` with a spacious
  `grid-cols-2 gap-3` layout. Displays full lift names, prominent 1RM values, ratio multipliers, and
  prevents tier badges (`INTERMEDIATE`, `NOVICE`) from overlapping adjacent cards.

- [x] **Re-route Profile Day Streak Button to Achievements**
  Updated `buildProgressStats` in `src/features/profile/lib/derive.ts` so the "27d Streak" chip navigates
  to `/profile/achievements` (milestones, streak medals, and unlock progress) instead of the generic `/insights` page.

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

- [x] **Modular User Preferences & Optional Controls (RPE & Quiet Mode)**
  Added `/profile/settings/preferences` with switches for RPE tracking (default: off),
  ghost progression hints, auto rest timer, mascot commentary, AI insights,
  and celebration fanfare. Persisted to `profileStore` with 31/31 unit tests passing.

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

- [N/A] **Lazy-load Recharts on `/insights` only**
  ~~Recharts was never added.~~ Both charts (`TrendChart`, `RadarChart`) are
  custom pure-SVG components — zero third-party charting library. No action needed.

- [N/A] **Verify `domAnimation` not `domMax` in `MotionProvider`**
  `domMax` is intentional: the bottom-nav active pill uses `layoutId`
  shared-layout animations which require it. Confirmed correct.

- [x] **Restrict `Space_Grotesk` font weights**
  Only weights 600 and 700 are used (`font-semibold`/`font-bold` on
  display text). Confirmed restricted in `src/app/layout.tsx`.

- [x] **Run bundle analyser — confirmed no chunk leaks**
  `@next/bundle-analyzer` installed, wired in `next.config.ts` (`ANALYZE=true` env var).
  Build results (2026-09-20):
  - **Shared base chunk**: **102 KB** — split into `chunks/1255` (46 KB, framer-motion + radix)
    and `chunks/4bd1b696` (54.2 KB, Zustand stores + React runtime). No feature leakage detected.
  - `/coach` route: **7.97 KB** route chunk + 148 KB First Load — reasonable for a full chat UI.
  - `/home`: **9.07 KB** + 148 KB FL. `/insights`: **7.85 KB** + 151 KB FL.
  - `/train`: **5.37 KB** + 154 KB FL. `/session/[id]`: **3.05 KB** + 135 KB FL.
  - Middleware: **94.9 KB** (Supabase SSR + cookie handling).
  - **No Recharts leak** (confirmed — pure SVG charts).
  - **Verdict**: Base bundle is clean. No unexpected feature imports in shared chunks.
    Middleware weight is from `@supabase/ssr` — acceptable given auth requirement.
  - **Future optimization**: If auth is deprioritized, extracting Supabase from middleware
    could reduce it from 94.9 KB → ~5 KB, saving ~90 KB on every request.

---

## 🟢 Phase 3 — Authentication (Supabase)

- [x] Add Supabase client (`@supabase/supabase-js` + `@supabase/ssr`)
  `@supabase/supabase-js@2.x` and `@supabase/ssr` installed. Client at `src/lib/supabase/client.ts`,
  server at `src/lib/supabase/server.ts`, middleware helper at `src/lib/supabase/middleware.ts`.
- [x] Email + password login — wire `LoginForm` to `supabase.auth.signInWithPassword`
  `LoginForm.tsx` calls `supabase.auth.signInWithPassword`; fully built with RHF + Zod validation.
- [x] Google OAuth — wire `SocialLoginButtons`
  `SocialLoginButtons.tsx` calls `supabase.auth.signInWithOAuth({ provider: 'google' })`.
- [x] Session management — server-side middleware route guard
  `src/middleware.ts` implements the 3-state guard (unauthenticated → `/login`,
  authenticated no onboarding → `/onboarding`, authenticated + onboarded → `/home`).
  `src/lib/supabase/middleware.ts` handles cookie refresh with 800ms Supabase reachability check
  and 1500ms session timeout to prevent navigation hangs offline.
- [ ] Persist onboarding output to `profiles` table on submit
  *(Needs live Supabase project with `NEXT_PUBLIC_SUPABASE_URL` + key configured)*
- [x] Forgot password flow — wire `ForgotPasswordForm`
  `ForgotPasswordForm.tsx` calls `supabase.auth.resetPasswordForEmail`.

---

## 🔵 Phase 4 — Database

- [ ] Design Supabase schema: `profiles`, `sessions`, `session_exercises`,
  `sets`, `cardio_logs`, `hydration_logs`, `xp_transactions`
- [ ] Replace `src/data/` fixtures with real `supabase.from()` calls
  behind the existing `api/get*Data.ts` seams (no screen changes needed)
- [x] **Offline-first session logging** — `lib/syncEngine.ts`
  Local store-first writes with persistent background sync queue (`physiqx-sync-queue`).
  Auto-retries on browser `online` event and app rehydration. Survives airplane mode.
- [x] **Real PhysIQ Score computation from live ledger data** — `lib/scoreEngine.ts`
  Computes 4-pillar dynamic scores from Supabase user sessions, volume, and profile goals.
- [x] **Real streak and DayStatus derivation from session history** — `lib/streakEngine.ts` & `lib/prEngine.ts`
  Single source of truth for 12-week heatmap (`generateHeatmapWeeks`), forgiving streaks,
  and Epley 1RM Personal Record trend curves. Wired into `getInsightsData.ts`.

---

## 🟣 Phase 5 — Core Features

- [x] **Progressive overload engine** — `lib/progression.ts`
  Equipment-aware double progression (barbell +2.5kg, dumbbell +1.0kg, bodyweight reps),
  RPE auto-regulation rules, and comprehensive unit tests (14 tests passing).
  Wired directly into `sessionStore.ts`.
- [x] **AI Coach insights** — `lib/coachInsights.ts`
  Generates contextual `Insight` objects (volume progression, weakest pillar focus,
  streak momentum) from live ledgers and score metrics with 5 unit tests passing.
  Strictly enforces the <= 2 sentence contract. Wired into `getInsightsData.ts`.
- [x] **Deterministic `generateHeadline(pillars, delta)`**
  Rules-based headline generator implemented in `src/lib/scoreEngine.ts`.
- [x] **Achievement unlock engine** — `lib/achievementEngine.ts`
  Evaluates all 8 achievements against real session history, streak days,
  and cumulative volume with 5 unit tests passing.
- [x] **Notification scaffolding** — `lib/notifications.ts`
  Deep-link targets per `ROUTES.md` (`/session/[id]`, `/home`, `/compete`, `/insights`),
  streak-risk alerts, mission reminders, and active session resume safeguards.
  Wired to `profileStore.notificationPreferences` and `/profile/settings/notifications`.
  5 unit tests passing.
- [x] **PWA service-worker** — `public/sw.js` & `ServiceWorkerRegister.tsx`
  Caches app shell, fonts, and static routes with Stale-While-Revalidate;
  enables offline workout sessions via Network-First with cache fallback.

---

## ⚪ Phase 6 — AI

> **Honesty rule (2026-09-28):** nothing in the app uses an AI/ML model yet.
> Everything below is deterministic rules. User-facing "AI" labels on rule-based
> features were replaced with accurate wording. Only call a feature "AI" once it
> actually uses a model.

- [x] **"AI" label audit — user-facing copy** *(2026-09-28)*
  Program "AI Coach Adaptive" / "PhysIQ Adaptive Engine" → **PhysIQ Split** (chip, onboarding,
  profile stat); removed false "auto-adjusts to recovery/RPE" claims. Auth screen "AI-powered
  PhysIQ Score" / "AI fitness platform" → plain copy. Preferences "AI Coach Insights" →
  "Coach Insights". Unrouted screens fixed too ("AI Program Architect" → "Program Builder",
  "AI Vision Scanner" → "Barcode Scanner").
  Kept: brand name "PhysIQx AI" (product decision), internal ids (`type: "ai"`,
  `/train/programs/ai` URL, file names) to avoid breaking persisted user data.
- [x] **Rule-based program generator** — `lib/aiProgramEngine.ts`
  Fixed split templates per days/week (2–6); sets/reps/rest from goal × experience table.
  Live `/train/programs/ai` is built once with defaults (bulk, intermediate) — not personalised.
  `targetBodyShape`, `preferredSplit`, `sessionHistory` inputs are accepted but unused.
- [ ] **Personalise the PhysIQ Split** — build it from the user's onboarding goal/experience
  (`GenerateProgramScreen.tsx` already does this but has no route).
- [ ] **Conversational AI Coach** — dedicated `/coach` route — **deferred to a future version (route disabled 2026-09-28; see `docs/FUTURE_WORK.md` #1)**
  `src/app/(app)/coach/CoachScreen.tsx` — full chat UI: bubble thread, persona toggle (Kix/Nyra),
  6-category quick prompts, thinking animation, suggested action deep-links, input bar.
  Engine: `src/lib/aiCoachChat.ts` (rule-based keyword matcher, 100% client-side, no API calls).
  Entry points (Home quick action, Insights CTA) removed; `coach/page.tsx` now returns `notFound()`.
- [ ] **Adaptive difficulty** — `adaptProgramDifficulty()` in `lib/aiProgramEngine.ts`
  Logic + tests exist (deload on avg RPE >= 9.0, extra set on avg RPE <= 7.0) but it is
  **not wired to any screen**. Wire it before any "adapts to you" copy returns.
- [ ] **Score trajectory forecast** — `forecastScoreTrajectory()` in `lib/aiProgramEngine.ts`
  A diminishing-returns formula (not ML) with tests; **not wired to any screen**.
- [ ] **Real AI (future)** — candidates once a model is actually used: LLM coach over the rule
  engine as guardrails, learned progression from logged history. Only these earn an "AI" label.

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
