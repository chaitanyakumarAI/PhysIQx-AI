# PhysIQx — TODO

Living task list. Grouped by urgency, then phase. Update as things land.
Last audited: **2026-10-15**. Master plan and status: `docs/MASTER_PLAN.md`.

---

## 🎨 Asset generation — prompts in `docs/ASSET_PROMPTS.md`

Everything works today with placeholders (vector medals, expression
crops). Each asset replaces its placeholder once registered (ASSET_PROMPTS §5).

- [x] **Stage cuts from the locked grids** (12): Kix default · focus · joy · sheepish · worried · proud · determined; Nyra stare · narrowed · closed · nod · tilt → `public/mascots/stage/` (`scripts/crop_mascot_stage.py`)
- [ ] **Stage poses — Kix** (4): wave · point-up · celebrate · thinking → `public/mascots/stage/`
- [ ] **Stage poses — Nyra** (3): gesture-up · teach · rest → `public/mascots/stage/`
- [ ] **Duo & celebration scenes** (4): duo-intro · duo-finale · kix-level-up · nyra-legendary-nod → `public/mascots/scenes/`
- [ ] **Medals — Training families** (16): iron-ledger · tonnage · explorer · big-session × bronze/silver/gold/platinum
- [ ] **Medals — Strength families** (8): record-breaker · strength-standard × 4 tiers
- [ ] **Medals — Cardio families** (12): cardio-engine · long-haul · double-duty × 4 tiers
- [ ] **Medals — Consistency families** (8): perfect-week · unbroken × 4 tiers
- [ ] **Medals — Body & score families** (8): steady-scale · physiq-climber × 4 tiers
- [ ] **Medals — Milestones** (10): first-rep · calibrated · body-map · first-import · comeback-kid · full-house · perfect-month · iron-year · anniversary · unshakeable
- [ ] **Rank insignia** (8): iron · bronze · silver · gold · platinum · diamond · obsidian · legend
- [ ] *(Optional)* Hero art: level-up burst · collection header
- [ ] **Integrate**: convert with `node scripts/convert-assets.mjs`, register medal ids in `src/features/collection/lib/badgeArt.ts`, point the tour script at the new poses

## 🎮 Gamification v2 — see `docs/GAMIFICATION_STUDY.md`

- [x] **XP from real effort**: workouts (by work done), PRs, cardio, weigh-ins, perfect weeks, setup bonus, collection — derived from the ledger, with anti-grind caps
- [x] **Levels 1–100** on a polynomial curve (each level costs more) + **9 ranks** (Rookie → Legend)
- [x] **Collection: 70 items** — 13 families × 4 tiers, 10 milestones, 8 rank insignia; Gold/Platinum and legendary items gated by level; real earned dates
- [x] **Collection screen + detail sheets + profile showcase + level card**
- [x] **Stylised vector medals** (2026-10-16): the rim levels up with the tier (coin → beaded → rosette + laurels → gem-cut + jewel → violet star crest), metal shading and raised emblems; unearned pieces are unminted iron in their tier's shape (green ring in progress, padlock + level when sealed); 8 distinct rank crests (chevrons, wings, crown, diamond, obsidian core, Legend regalia)
- [x] **Consistency heatmap redesign**: intensity by your own typical day, rest dots, month/weekday labels, tap-a-day detail
- [x] **App tour with Kix & Nyra in dialogue** (Supercell-style character introductions over the real UI)
- [x] **Tour stage, Clash of Clans-style**: big chest-up characters at the bottom corners, comic speech bubbles with name tags, a bouncing arrow on the real UI; Kix hops in, Nyra emerges from the dark; speaker steps forward, listener dims; per-line body language
- [x] **Celebrations** (2026-10-21): the workout-complete screen counts up the XP by source, fills the level bar (level-up pop + sparks + chime), strikes each new badge (flip, shine, sparks, rarity-pitched chime), lists new records, and Kix or Nyra reacts (Nyra's nod for legendary). Skippable; reduced motion shows it all at once; sparks and sounds follow Preferences → Celebration Fanfare (`src/features/celebration/`)
- [x] **Living medals**: shine sweep on earned pieces, tilt-to-turn on the badge sheet, progress rings that fill as they appear

## 🖌 Figma design system — https://www.figma.com/design/Py9qoiT5srEZTnuX8PqMBj

Free Starter team: build with write tools (`use_figma`, `upload_assets`); reads (`get_design_context`, `get_screenshot`…) are capped at ~20 a month — save them for turning finished frames into code.

- [x] **Tokens** (2026-10-21): 66 variables mirroring `globals.css` (Primitives → semantic Color with CSS-variable code syntax, Radius, Spacing/sizes), 13 text styles (Space Grotesk display, Inter body), 4 effect styles (card shadows, brand glow)
- [x] **v1 components**: Button (Style × Size × State), Chip, Card (Default / Elevated / Accent), Stat Chip, Progress Bar (Tone × Size), Medal (Tier × State, vectors exported from the app), Rank Insignia (Rank × State), plus a review frame
- [x] **Second pass** (2026-10-22, `docs/FIGMA_PLAN.md` §8): structure, foundations pages, all 100 Lucide icons, 8 component families + Patterns documented to the definition of done, audits clean (no raw fills or strokes, every text styled, no detached instances), 0 metered reads
- [x] **Key screens** composed from the components: Home, Collection (+ badge sheet), Workout Complete (quiet day + illustrative big day), checked side by side with the app
- [x] **Speech bubble + cast** components for the tour and celebrations (Kix & Nyra stage cuts with the app's edge fades)
- [ ] **v2 screens** in Figma: Train, Insights, Profile, Session (placeholders ready on the Screens page)
- [ ] **Delete the Archive** section in Figma once the second pass is approved (superseded first-pass components)
- [ ] **Code a11y**: 11–12 px labels in `text-foreground-muted` fail AA (CoachCard kicker, badge-sheet XP, heatmap labels) — use foreground-secondary
- [ ] **Weekly quests**: 3 personal goals a week from the plan (Fitocracy/Duolingo style)
- [ ] **Character reactions on Home** to real events (PR → Kix proud; skipped rest → Nyra narrowed)
- [ ] **Leagues** once Compete has real users

## 🛠 Hardening — from the 2026-10-17 code audit

- [x] **Transactional workout save** (2026-10-23, migration 006 — **apply in the SQL Editor**): `save_workout_session` RPC writes session + exercises + sets + XP in one transaction; any error fails the outbox job. Was: one Postgres function (RPC) for session + exercises + sets + XP; fail the outbox job on any child error (today child errors are logged and the job reports success)
- [ ] **Validate Server Action input** with Zod — `saveWorkoutSession` done 2026-10-23 (`finishedSessionSchema`, XP and volume recomputed server-side); `saveCardioActivity` and `saveOnboardingProfile` still open
- [x] **`xp_transactions`** (migration 006): SELECT-only for owners; append through a server-side function (owners can currently insert their own XP)
- [x] **`sessions.client_ref`** (migration 006): unique per user `(user_id, client_ref)` like cardio (005), and `upsert … onConflict` instead of check-then-insert
- [ ] **Cross-tab safety**: rehydrate stores on `storage` events (or a `BroadcastChannel`) so two tabs can't overwrite each other's history
- [ ] **Queue abandoned workouts** for upload too (only Finish queues today)
- [ ] **RPE in top sets** so `computeOverloadSuggestion`'s RPE auto-regulation can run on real data
- [ ] **Photos and avatar** out of `localStorage` (data URLs) into IndexedDB / Supabase Storage
- [ ] **Pull / restore** for signed-in users on a new device (sync is push-only today)
- [ ] **Stale docs**: middleware comment claims route guarding; `PHYSIQ_SCORE.md` describes stored snapshots and other behaviour the engine doesn't have
- [ ] **Tests**: RLS cross-user tests (pgTAP / Supabase CLI) and one Playwright flow (log offline → online → rows exist)

## 🔴 Phase 6 — Interactive Character Guide Overlays

- [ ] **Phase 6: Interactive Character Guide Overlays (UI Rework Track)**
  - [x] **Core Content & Data Store (SAFELY PRESERVED)**:
    Ingested `physiqx_coach_content.json` with strict type contracts (`src/types/coach.ts`), character profile mappings (`COACH_PROFILES`), and accessor APIs (`src/data/coachContent.ts`).
  - [x] **Telemetry & Rules Logic Engine**:
    Deterministic recommendation logic (`deriveActiveRecommendation`), briefing state storage, and comprehensive tests in `coachLogic.test.ts` (142/142 tests passing).
  - [x] **Rework Briefing UI (Dialogue Walkthrough)** *(2026-10-15)*:
    Rebuilt as the Kix & Nyra character tour (`src/features/tour/`) — the two slide in from the screen edges and talk it through while the real UI is spotlit. New script; the old JSON dialogue described removed features.
  - [ ] **Rework Feature Explainer UI (On-Demand Info Cards)**:
    Replace generic modal sheet with an ultra-polished popover or contextual micro-drawer that feels integrated, native, and high-end.
  - [x] **Screens Cleaned of Disliked V1 Cards**:
    Unmounted V1 `CoachBriefingModal` and V1 `CoachInfoSheet` triggers from Home, Insights, Session, Plate Modal, Cardio, and Integrations screens while preserving all underlying content safely.

- [ ] **Phase 7: Kix & Nyra Social Media Video Series & Storyboards**
  - [ ] **Item 7.1 — Concept & Episode Bible**:
    4 initial short-form video scripts (Iron Ledger, 3 Recovery Pillars, Why Hydration Was Cut, PR Protocol).
  - [ ] **Item 7.2 — Storyboard & Visual Prompts**:
    Visual staging, character visual cues, and visual asset generation prompts.
  - [ ] **Item 7.3 — Audio & Voice Synthesis Guidelines**:
    Pacing, cadence, and voice model profile prompts for Kix & Nyra.

---

## 🟢 Recent Completed Directives (October 2026)

- [x] **Disconnect & Remove All Hydration Features** *(97dc858)*
  Deleted `HydrationLogSheet.tsx`, `hydrationStore.ts`, removed hydration from `recoveryEngine.ts` (rebalanced to 40% Neuromuscular, 35% Autonomic CNS, 25% Connective Tissue), replaced "Hydration Master" with "Cardio Crusher", and dropped `hydration_logs` table.
- [x] **Cardio Refinement: Sync-Only (No Manual Logging)** *(97dc858)*
  Refactored `/train/cardio` (`CardioContent.tsx`) to strictly render synced activities from connected wearables (Apple Health, Garmin, Whoop). Created `saveCardioSession.ts` server action and updated `syncEngine.ts` with `cardio_logs` queue.
- [x] **Terminology Audit: Cleansed Misleading 'AI' Buzzwords** *(97dc858)*
  Audited user-facing copy: "AI Coach" → "Coach", "AI Insights" → "Coach Insights", "Certified AI Assets" → "Certified 3D Scan Models". Authenticity restored across all screens.
- [x] **Live Supabase End-to-End Cloud Verification** *(8b42f83)*
  100% live verified against Seoul Supabase PostgreSQL instance: User signup (`auth.users`), `profiles` auto-creation, onboarding selections persistence, workout logging (`sessions`, `session_exercises`, `exercise_sets`, `xp_transactions`). 129/129 vitest tests passing.

---

## 🔴 Past Blockers & Quick Fixes (Completed)

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

## 🔵 Phase 4 — Database & Offline Sync (Complete)

- [x] **Design Supabase schema & migrations**
  Created migration files `001_create_profiles.sql`, `002_create_workout_tables.sql`,
  `003_add_session_client_ref.sql`, and `004_create_cardio_and_device_sync.sql`
  covering `profiles`, `sessions`, `session_exercises`, `exercise_sets`, `cardio_logs`, and `xp_transactions`.
- [x] **Wire database seams with safe offline fallback**
  `getProfileData.ts`, `getHomeData.ts`, `getInsightsData.ts`, and `getCompeteData.ts`
  query Supabase directly and gracefully fall back to local ledgers/fixtures if unauthenticated or offline.
- [x] **Persist onboarding output to `profiles` table**
  `saveOnboardingProfile.ts` server action upserts to Supabase `profiles` with user auth guard.
- [x] **Offline-first session & cardio logging** — `lib/syncEngine.ts`
  Local store-first writes with persistent background sync queues (`physiqx-sync-queue` and `physiqx-cardio-sync-queue`).
  Auto-retries on browser `online` event and app rehydration. Tested with 6 passing unit tests.
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
