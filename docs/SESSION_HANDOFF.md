# PhysIQx AI — Complete Agent Handover & Architecture Guide
*Last updated: 2026-10-14 · Comprehensive handover for incoming coding agents.*
*Latest Directives: See `docs/PRODUCT_DIRECTIVES.md` and `docs/TODO.md` (Phase 6 Character Overlays data safely preserved, UI rework track active, Phase 7 Media bible upcoming).*

---

## 🔑 1. Executive Quick Facts

| Key | Value |
|---|---|
| **App Name** | **PhysIQx AI** (Advanced intelligent fitness, strength & physique analytics platform) |
| **Workspace Path** | `e:\physQIx AI` |
| **Core Stack** | **Next.js 15.5** (App Router, Turbopack/Webpack), **TypeScript**, **Tailwind CSS v4**, **Zustand** (with persistent client-side state & SSR hydration safety), **Framer Motion**, **Lucide React** |
| **Backend & Sync** | **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`), offline-first local cache & persistent sync queue (`lib/syncEngine.ts`), PWA Service Worker (`public/sw.js`) |
| **Test Suite** | **Vitest** → **142 / 142 tests passing** across 21 test files (`npx vitest run`) |
| **Type Check** | `npx tsc --noEmit` → **0 errors** |
| **Dev Server** | `npm run dev` → `http://localhost:3000` |
| **Production Build** | `npm run build` → 31/31 static routes compiled clean |
| **Current Git Branch**| `main` (commit `2774096`) |

---

## 🧠 2. Core Philosophy & Product Architecture

PhysIQx is designed as an elite, high-signal, zero-fluff training companion:
1. **The 4-Pillar Score System**:
   - `Strength` (volume, 1RM progression across Big 4 compound lifts)
   - `Cardio` (aerobic capacity, weekly active cardio minutes from manual log or wearable sync)
   - `Consistency` (workout frequency, streak adherence, honoring planned rest)
   - `Body Shape` (body composition, archetype progress, weigh-in tracking)
   - Formula defined in `src/lib/score.ts` (`computeWeightedScore`, `findWeakestPillar`, `scoreBand`).
2. **Local-First & Gym-Resilient**:
   - Workouts must NEVER fail or freeze in a basement gym with zero cellular reception.
   - All state mutations write immediately to local Zustand stores persisted in `localStorage`.
   - `syncEngine.ts` maintains a background queue (`physiqx-sync-queue`) that retries whenever connectivity returns.
   - Supabase middleware (`src/lib/supabase/middleware.ts`) features an 800ms reachability check and 1500ms timeout to ensure offline page navigation is instant (0ms DNS blocking).
3. **Never Punish the Lifter**:
   - An abandoned or interrupted workout is **never** silently discarded — it is auto-summarized and saved to `history`.
   - Streaks are forgiving: rest days honor streak continuity.
4. **Signal, Not Noise**:
   - Home answers: *"What do I do next?"* (Mission → Priorities → Score → Week).
   - Insights answer: *"What does the data say?"* (Trends, radar body balance, strength standards, PR curves).
   - Strict rule: Coach insights conform to $\le 2$ sentences (`enforceTwoSentences()`).

---

## 🛠️ 3. Navigation & App Routes

Navigation follows `docs/ROUTES.md`. Standard 5-tab persistent bottom shell plus dedicated deep-link destinations:

```
(auth)                           — Public login/signup
  /login
  /signup
  /forgot-password

(onboarding)                     — 6-step interactive flow
  /onboarding

(app)                            — Protected tab shell (bottom nav)
  /home                          — Morning opening: mission, 4-col quick actions, priorities, score
  /train                         — Active program hero, library, custom plan builder
  /train/exercises               — 189 exercise catalog with EMG muscle breakdown
  /train/exercises/[id]          — Detailed exercise cues, setup & trajectory demo
  /train/cardio                  — Cardio log + automatic wearable sync card
  /train/calendar                — Monthly training history & rest day tracker
  /train/programs/ai             — PhysIQ Split (rule-based program template; not AI)
  /insights                      — Score trends (30d/90d), Body Balance radar, PR curves
  /insights/recovery             — HRV, readiness, target intensity & recovery strategies
  /insights/strength             — Big 4 1RM standards, multipliers & percentile tiers
  /coach                         — DISABLED: deferred to a future version (returns notFound)
  /compete                       — Leaderboards, weekly challenges, cheer wall
  /compete/challenges/[id]       — Individual challenge detail & participation
  /profile                       — Progress summary, day streak, DNA archetype
  /profile/achievements          — 8-achievement collection, medals & unlock tiers
  /profile/body                  — Digital twin 3D hologram scan, weight history & BMI
  /profile/history               — Historical workouts ledger
  /profile/photos                — Visual check-in progress photos journal
  /profile/integrations          — Wearables manager (Apple Health, Garmin, Health Connect)
  /profile/settings/*            — Preferences, notifications, appearance, privacy, export

(session - full screen)
  /session/[id]                  — Live active workout session (sets, RPE, rest timer, plate calculator)
```

---

## 🚀 4. What Was Just Shipped & Recent Critical Fixes

1. **Conversational AI Coach (`/coach`)** — *update 2026-09-28: deferred to a future version; route disabled and Home/Insights entry points removed (see FUTURE_WORK.md #1).*
   - Built [`src/app/(app)/coach/CoachScreen.tsx`](file:///E:/physQIx%20AI/src/app/(app)/coach/CoachScreen.tsx) and `page.tsx`.
   - Powered by `src/lib/aiCoachChat.ts` (100% client-side, zero external API latency, grounded in user's profile goal, experience level, and live streak).
   - Persona switcher: **⚡ Kix** (aggressive progressive overload, intensity) vs **🛡 Nyra** (recovery, biomechanics, joint longevity).
   - Quick prompt chips (bench plateau, sleep fatigue, score optimization, deload timing, form cues).
   - Was a 5th Home quick action and an Insights CTA banner; both removed.
2. **Barbell Sleeve Plate Visualizer Fixed**:
   - In [`src/features/session/components/ExercisePlateModal.tsx`](file:///E:/physQIx%20AI/src/features/session/components/ExercisePlateModal.tsx), fixed a bug where 265kg loading only rendered a single 25kg plate.
   - Updated renderer to `flatMap(Array.from({ length: plate.count }))` so all 4×25kg, 1×20kg, 1×2.5kg plates render sequentially. Added horizontal scrolling, borders, and height scaling.
3. **Cardio Section Automatic Sync Info & Routing**:
   - In [`src/app/(app)/train/cardio/CardioContent.tsx`](file:///E:/physQIx%20AI/src/app/(app)/train/cardio/CardioContent.tsx), added an "Automatic Cardio Tracking" card detailing background Apple Health, Garmin, and Health Connect sync, with a 1-tap route to `/profile/integrations`.
4. **Mascots Temporarily Removed/Hidden Globally**:
   - Per explicit user directive (*"dont use mascots anywhere for now, remove everywhere the mascots are being used, i will let you know how to use it after"*):
   - [`src/components/mascots/Mascot.tsx`](file:///E:/physQIx%20AI/src/components/mascots/Mascot.tsx) returns `null` immediately.
   - Replaced mascot art in `SessionSummaryCard`, `WorkoutShareModal`, `RecoveryScreen`, `CalendarContent`, `EmptyState`, and `AchievementSpotlight` with clean, athletic icons (`Trophy`, `Zap`, `Shield`, `HeartPulse`).
5. **UI Decongestion & Flow Fixes**:
   - `StrengthStandardsCard.tsx`: Replaced squished `sm:grid-cols-4` with a clean `grid-cols-2 gap-3` layout.
   - `HomeScreen.tsx`: Removed water intake and cardio nagging from Today's Priorities; focused strictly on lifting execution, 1RMs, and bodyweight.
   - Profile Day Streak button: Now routes to `/profile/achievements` instead of generic `/insights`.
   - `IntegrationsContent.tsx`: Fixed toggle switch thumb alignment.
6. **Bundle & Performance Audit**:
   - `@next/bundle-analyzer` configured.
   - Shared base bundle verified clean at **102 KB** (framer-motion + radix + zustand). Zero Recharts leakage (all charts are custom pure SVG).
   - Fixed pre-existing ESLint errors (`no-explicit-any`, `no-unescaped-entities`).

7. **Live Supabase End-to-End Cloud Verification**:
   - 100% live verified against Seoul Supabase PostgreSQL instance: User signup (`auth.users`), `profiles` auto-creation, onboarding selections persistence, workout logging (`sessions`, `session_exercises`, `exercise_sets`, `xp_transactions`).
8. **Phase 6: Interactive Character Guide Overlays (Data Preserved, UI Rework Track)**:
   - Ingested `physiqx_coach_content.json` into typed modules `src/data/coachContent.ts` and `src/types/coach.ts`.
   - Built low-FPS animated avatar component `CoachAvatar.tsx` and deterministic telemetry recommendation engine `CoachRecommendationWidget.tsx`.
   - V1 Briefing Modal and V1 Info Sheet cards were unmounted per user feedback (*"i didnt liked the UI at all remove this with the content being stored safe lets rework on this"*).
   - All underlying content, data models, and logic rules remain 100% safe, tested, and ready for redesign.
9. **Full Master UI Redesign Specification Created**:
   - A complete architectural Master Prompt was generated for rebuilding the UI from scratch with full styling freedom while locking down all required screens, metrics, and character interactions.

---

## 🧪 5. Testing & Verification Guide

Running tests and verification takes seconds:

```bash
# 1. Run Vitest Unit Tests (all 142 tests passing across 21 test files)
npx vitest run

# 2. Check TypeScript Types (must be 0 errors)
npx tsc --noEmit

# 3. Start Next.js Development Server
npm run dev
# Server runs on http://localhost:3000

# 4. Production Build Test (all 31 static routes compile clean)
npm run build
```

---

## 💡 6. Open Ideas & Brainstorming Opportunities for the Incoming Agent

You are granted **full creative and technical freedom** to evaluate, brainstorm, and improve any part of the codebase. Here are high-impact areas to explore:

### A. AI & Smart Training
- **LLM / Web-LLM Integration**: `aiCoachChat.ts` currently uses a deterministic, rule-based catalog matcher with $\le 2$ sentence responses. Could connect to an on-device WebLLM or edge API for open-ended conversation while keeping the prompt constrained to PhysIQx's athletic persona.
- **RPE Auto-Regulation & Deload Warnings**: While `progression.ts` and `aiProgramEngine.ts` calculate suggested weights, consider surfacing real-time "Fatigue Alert" badges in `SessionScreen` when a user logs 2 consecutive sets at RPE 10.
- **Computer Vision / Pose Estimation**: Experiment with camera-based rep counting or bar-path tracking for squats/bench press using lightweight client-side pose models.

### B. Session Experience & UX Polish
- **Rest Timer Enhancements**: Picture-in-Picture (PiP) or native Web Notification / audio chimes when rest timer expires. (Check `src/lib/audioEngine.ts` which already has Web Audio beeps).
- **Plate Barbell Visualizer in Live Session**: Expand the plate calculator modal into a persistent collapsible sleeve widget during active barbell sets.
- **Live Activity / Lockscreen Widget**: Explore Web Lock Screen API or PWA Notification action buttons to log sets directly from the lock screen.

### C. Backend, Persistence & Wearables
- **Live Supabase Schema Execution**: Replace mock fixtures in `src/data/` with live Supabase database queries once user configures `.env.local` keys (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- **Real Wearables Webhooks**: Wire OAuth or API bridges for Strava, Garmin Connect Developer API, or Apple HealthKit export files (.xml zip import).

### D. Visuals & Design System
- **Mascot Strategy**: The user asked to hide mascots for now until they decide how to reintroduce them. When requested, evaluate whether Kix and Nyra should be subtle ambient coach avatars, animated SVGs, or remain disabled in favor of the current minimalist dark-athletic UI.
- **Hologram Scan 3D**: `HologramBodyScan.tsx` currently renders static 67-asset SVG/PNG renders. Could be upgraded with Three.js / React Three Fiber for full 360-degree interactive rotation.

---

## 📂 7. Critical Files Map for Context & Continuation

### A. Coach & Interactive Character Files (Phase 6 Core)
- `physiqx_coach_content.json`: Raw source of truth for 5 briefing dialogue scenes, 6 feature explainers, and 4 preloaded recommendations.
- `src/types/coach.ts`: Strongly typed interfaces (`CoachId`, `CoachProfile`, `DualDialogueStep`, `FeatureInfoExplainer`, `PreloadedRecommendation`).
- `src/data/coachContent.ts`: Profile tokens (Kix `#10b981`, Nyra `#06b6d4`), expression WebP frame paths, and accessor functions.
- `src/components/ui/CoachAvatar.tsx`: Animated avatar component (~3.5 FPS frame-flipping, Framer Motion head bob, equalizer waveform, tactical badges).
- `src/features/coach/components/CoachRecommendationWidget.tsx`: Deterministic recommendation card mounted under Quick Actions on `/home`.
- `src/features/coach/components/CoachBriefingModal.tsx`: V1 dialogue briefing modal (unmounted, preserved for UI overhaul).
- `src/features/coach/components/CoachInfoSheet.tsx`: V1 feature explainer sheet (unmounted, preserved for UI overhaul).
- `src/features/coach/components/CoachInfoButton.tsx`: Discreet `(i)` button primitive for triggering coach explainers.
- `src/data/coachContent.test.ts`: 4 Vitest tests for coach content integrity.
- `src/features/coach/coachLogic.test.ts`: 9 Vitest tests for telemetry thresholds (<60% CNS fatigue, PR green lights) and briefing state storage.

### B. Primary Screens & Components
- `src/app/(app)/home/HomeScreen.tsx`: Home command hub (Status strip, greeting, quick action grid, coach recommendation, daily mission, priorities, score gauge).
- `src/features/home/components/WelcomeHeader.tsx`: Greeting, streak badge, athletic archetype chip, notification drawer button.
- `src/features/home/components/PhysIQScoreCard.tsx`: 0–100 circular gauge, delta indicator, 7-day sparkline trend.
- `src/app/(app)/insights/InsightsScreen.tsx`: 4-pillar score radar, weakest axis alert, 12-week consistency heatmap, PR tracker.
- `src/features/insights/components/RecoveryReadinessCard.tsx`: 3-Pillar recovery breakdown (Neuromuscular 40%, Autonomic CNS 35%, Connective Tissue 25%).
- `src/features/insights/components/StrengthStandardsCard.tsx`: Big 4 strength tiers (Squat, Bench, Deadlift, Overhead Press) across Novice to Elite.
- `src/app/(app)/train/page.tsx`: Training hub, split generator, and exercise library navigation.
- `src/features/session/components/ExerciseSessionCard.tsx`: Active workout exercise container and plate calculator trigger.
- `src/features/session/components/SetRow.tsx`: Set logging row (weight, reps, optional `@RPE` 1–10 / RIR, progressive overload ghost hints).
- `src/features/session/components/ExercisePlateModal.tsx`: Barbell plate calculator (10/15/20/25kg bars, sleeve plate breakdown, warmup ladder).
- `src/features/session/components/RestTimer.tsx`: Automatic rest timer countdown with skip and +30s increment.
- `src/app/(app)/train/cardio/CardioContent.tsx`: Strictly sync-only cardio screen with 150-min weekly progress meter.
- `src/app/(app)/profile/integrations/IntegrationsContent.tsx`: Wearable integrations manager (Apple Health, Garmin, WHOOP, Oura).
- `src/app/(app)/compete/page.tsx`: Community XP leaderboards and time-limited challenges.
- `src/app/(app)/profile/page.tsx`: Athlete profile, weigh-in trend chart, digital twin scan, preferences.
- `src/app/(onboarding)/onboarding/page.tsx`: 6-step athletic DNA questionnaire and archetype reveal.
- `src/features/home/components/GuidedTour.tsx`: Walkthrough tour highlighting core UI landmarks (`?tour=1`).
- `src/app/(app)/AppBottomNav.tsx` & `src/components/navigation/BottomNavigation.tsx`: Persistent 5-destination bottom navigation bar.

### C. Business Logic Engines & Store Files
- `src/lib/score.ts`: 4-pillar composite score formula (23 tests).
- `src/lib/recoveryEngine.ts`: 3-pillar recovery algorithm (no hydration).
- `src/lib/barbellCalculator.ts`: Plate breakdown math and warmup progression ladder.
- `src/lib/progression.ts`: Progressive overload double progression engine.
- `src/lib/prEngine.ts`: 1RM detection and PR tracking.
- `src/lib/streakEngine.ts`: Consistency streak logic with rest day forgiveness.
- `src/lib/syncEngine.ts`: Offline-first persistent sync queue (`physiqx-sync-queue`).
- `src/store/sessionStore.ts`: Active workout logging and history persistence.
- `src/store/profileStore.ts`: Athlete profile, preferences (units, auto rest, RPE tracking).
- `src/store/cardioStore.ts`: Synced wearable cardio activities.
- `src/store/notificationStore.ts`: Notification drawer state.

### D. Architectural Documentation
- `docs/TODO.md`: Living task checklist with active Phase 6 UI rework track.
- `docs/SESSION_HANDOFF.md`: This file.
- `docs/PRODUCT_DIRECTIVES.md`: Core product rules (Kix & Nyra, zero hydration, sync-only cardio, AI buzzword cleanse).
- `docs/DATA_MODELS.md`: Complete entity and Supabase database schemas.
- `docs/ROUTES.md`: Complete URL routing tree.
- `docs/PHYSIQ_SCORE.md`: Score mathematical whitepaper.

---

## 🏁 8. Quick Commands Checklist For Incoming Agent

```bash
# Verify health
npm test               # Run Vitest test suite
npx tsc --noEmit       # Verify TypeScript types
git status             # See current modified working tree

# Run dev
npm run dev            # Starts server on http://localhost:3000
```
