# PhysIQx AI — Complete Agent Handover & Architecture Guide
*Last updated: 2026-09-28 · Comprehensive handover for incoming coding agents.*

---

## 🔑 1. Executive Quick Facts

| Key | Value |
|---|---|
| **App Name** | **PhysIQx AI** (Advanced intelligent fitness, strength & physique analytics platform) |
| **Workspace Path** | `e:\physQIx AI` |
| **Core Stack** | **Next.js 15** (App Router, Turbopack/Webpack), **TypeScript**, **Tailwind CSS**, **Zustand** (with persistent client-side state & SSR hydration safety), **Framer Motion** (`LazyMotion` with `domMax`), **Lucide React** |
| **Backend & Sync** | **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`), offline-first local cache & persistent sync queue (`lib/syncEngine.ts`), PWA Service Worker (`public/sw.js`) |
| **Test Suite** | **Vitest** → **131 / 131 tests passing** across 20 test files (`npm test`) |
| **Type Check** | `npx tsc --noEmit` → **0 errors** |
| **Dev Server** | `npm run dev` → `http://localhost:3000` |
| **Production Build** | `npx next build --no-lint` → 238 static/dynamic routes compiled clean |
| **Current Git Branch**| `main` |

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

---

## 🧪 5. Testing & Verification Guide

Running tests and verification takes seconds:

```bash
# 1. Run Vitest Unit Tests (all 131 tests should pass)
npm test

# 2. Check TypeScript Types (must be 0 errors)
npx tsc --noEmit

# 3. Start Next.js Development Server
npm run dev
# Server runs on http://localhost:3000

# 4. Production Build Test
npx next build --no-lint
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

## 📂 7. Directory Map & Critical Files

```
e:\physQIx AI\
├── src\
│   ├── app\                    # Next.js 15 App Router routes
│   │   ├── (app)\              # Authenticated shell (home, train, insights, compete, profile, coach)
│   │   ├── session\[id]\       # Full-screen active workout tracker
│   │   └── onboarding\         # 6-step questionnaire wizard
│   ├── components\
│   │   ├── ui\                 # Primitives (Button, Card, Input, Switch, FilterChipRow)
│   │   ├── mascots\            # Mascot.tsx (currently returning null)
│   │   └── navigation\         # BottomNavigation, ScreenHeader
│   ├── features\               # Domain modules (home, train, insights, compete, session, profile, fuel)
│   ├── store\                  # Zustand stores (sessionStore, profileStore, cardioStore, hydrationStore)
│   ├── lib\                    # Pure business logic engines
│   │   ├── score.ts            # 4-pillar math (23 tests)
│   │   ├── progression.ts      # Double progression & RPE auto-regulation (14 tests)
│   │   ├── streakEngine.ts     # Heatmap & forgiving streak logic (8 tests)
│   │   ├── prEngine.ts         # Epley 1RM PR derivation (7 tests)
│   │   ├── aiCoachChat.ts      # Coach chat rule engine & catalog matcher (5 tests)
│   │   ├── aiProgramEngine.ts  # Adaptive split & schedule generator (7 tests)
│   │   ├── syncEngine.ts       # Offline sync queue (4 tests)
│   │   └── audioEngine.ts      # Web Audio haptics & cues (2 tests)
│   └── data\                   # Mock fixtures (exercises, programs, personas)
├── docs\                       # Full architectural documentation
│   ├── TODO.md                 # Living task checklist
│   ├── ROUTES.md               # Route architecture
│   ├── PHYSIQ_SCORE.md         # 4-pillar score breakdown
│   └── SESSION_HANDOFF.md      # This file
└── public\                     # Static assets (body-shapes, icons, sw.js)
```

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
