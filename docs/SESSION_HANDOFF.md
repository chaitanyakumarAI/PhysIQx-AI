# PhysIQx AI — Session Handoff Document
*Last updated: 2026-07-19 · Use this file when switching accounts to resume work.*

---

## 🔑 Project Quick Facts

| Key | Value |
|---|---|
| **App name** | PhysIQx AI |
| **Workspace path** | `e:\physQIx AI` |
| **Stack** | Next.js 15 (App Router), TypeScript, Zustand, Framer Motion, Tailwind |
| **Dev server** | `npm run dev` → `http://localhost:3000` |
| **Tests** | `npm test` → 28/28 passing (Vitest) |
| **Lint** | `npm run lint` → 0 errors |
| **Git branch** | `main` |
| **Latest commit** | `2c57705` — mascot WebPs |

---

## 🗺️ Project Phase Map

```
Phase 1 — UI Shell          ✅ COMPLETE
Phase 2 — Polish & Logic    ✅ COMPLETE (as of this session)
Phase 3 — Auth (Supabase)   ⬜ NOT STARTED
Phase 4 — Database          ⬜ NOT STARTED
Phase 5 — Core Features     ⬜ NOT STARTED
Phase 6 — AI Integration    ⬜ NOT STARTED
```

---

## ✅ Everything Done In This Session (2026-07-19)

### UI Audit & Fixes
Ran a full browser subagent audit of all 5 tabs. Applied all findings:

| Fix | File | Commit |
|---|---|---|
| Bottom padding `pb-36` so ResumeSessionBanner doesn't cover buttons | `PageContainer.tsx` | `6bda1d5` |
| Plan Builder validation hint text when Save is disabled | `PlanEditor.tsx` | `6bda1d5` |
| Full card tap target on Program cards (`after:absolute after:inset-0`) | `ProgramSummaryCard.tsx` | `6bda1d5` |
| Empty state fallback for PersonalRecordCard with no trend data | `PersonalRecordCard.tsx` | `6bda1d5` |
| Tour replay row accented brand-green in Settings | `SettingsRow.tsx`, `profileData.ts`, `types.ts` | `f0b4cc4` |
| Friend Challenge bottom-sheet modal on leaderboard rows | `ChallengeModal.tsx`, `LeaderboardRow.tsx`, `CompeteScreen.tsx` | `f0b4cc4` |

### Progressive Overload Ghost-Fill
- `computeSuggestion()` in `sessionStore.ts` reads history → +2.5 kg if all reps hit, else same weight.
- `SessionExercise.suggest = { weightKg, reps } | null` added to type.
- Wired through: `ExerciseSessionCard` → `SetRow` as ghost placeholder on unlogged sets.
- Commit: `99faa6a`

### Mascot Asset Upgrade
- User provided: `design/mascots/kix/kix-anchor.png`, `kix-grid.png`
- User provided: `design/mascots/nyra/nyra-anchor.png`, `nyra-grid.png`
- Script `scripts/crop_mascots.py` (Python + Pillow) crops all 13 poses:
  - **Kix (8 poses):** default, focus, joy, sheepish, worried, proud, determined, asleep
  - **Nyra (5 poses):** stare, narrowed, closed, nod, tilt
- All exported to `public/mascots/*.webp` at 480×480, quality-88, bg composited to `#0a0d0b`
- Commit: `2c57705`

### App Icon Design & Generation (Nyra Mascot-Focused)
- Conducted deep research on 2026 UI/UX fitness app icon trends (Tactile Maximalism, Glassmorphism, Multi-Material).
- Iterated through four rounds of generation to find the perfect blend of 2026 aesthetics and PhysIQx mascot relevance.
- Selected **Option 26 (The Lynx Gaze)**: A sleek, almond-shaped lynx eye made of brushed gunmetal, revealing a glowing neon green silicone pupil. Captures the sophisticated, AI-driven wisdom of Nyra.
- Ran `scripts/generate_icons.py` to auto-resize the master 1024x1024 icon into all required formats.
- Exported and wired all PWA/favicon sizes to `public/` (16, 32, 180, 192, 512, favicon.ico).
- Added `public/manifest.json` for PWA support.

---

## 🏗️ Architecture Quick Reference

### Key Stores (Zustand, localStorage via `persist`)
| Store | File | Purpose |
|---|---|---|
| `useSessionStore` | `src/store/sessionStore.ts` | Active workout, history (60 sessions), progressive overload |
| `useProfileStore` | `src/store/profileStore.ts` | Onboarding profile, user preferences |
| `usePlansStore` | `src/store/plansStore.ts` | Custom user workout plans |

**Important:** All stores use `skipHydration: true`. `<StoreHydrator />` triggers rehydration after mount to prevent SSR mismatch. Session screen does its own explicit rehydrate before starting.

### Mascot System
- Component: `src/components/mascots/Mascot.tsx`
- Usage: `<Mascot pose="kix-joy" size={96} shape="circle" />`
- Served from: `public/mascots/{pose}.webp`
- Rule: Kix = effort/celebration, Nyra = standards/rest. Never both on one screen. Never during input (anti-Clippy law).
- Used in: `EmptyState.tsx`, `SessionSummaryCard.tsx`

### Charts
- Both `TrendChart` and `RadarChart` are **custom pure SVG** — zero Recharts dependency.
- `TrendChart`: sparkline/area, interactive scrubbing, used on Home, Insights, Body Stats
- `RadarChart`: 4-axis Body Balance polygon, used on Insights

### Motion
- `MotionProvider.tsx` uses `domMax` (not `domAnimation`) — required for bottom-nav `layoutId` pill animation.
- All screens use `m.div` (not `motion.div`) + `LazyMotion` for bundle efficiency.

### Scoring (4 Pillars)
- Pillars: Strength, Endurance, Recovery, Nutrition
- Weights defined in `src/lib/score.ts` → `pillarWeights`
- `computeWeightedScore()`, `findWeakestPillar()`, `scoreBand()` all have 23 unit tests

---

## 📁 Key File Locations

```
src/
  app/
    (app)/                    — 5 main tabs (home, train, insights, compete, profile)
    session/[id]/             — Active workout screen (SessionScreen.tsx)
    onboarding/               — 6-step onboarding wizard
  features/
    session/components/       — ExerciseSessionCard, SetRow (RPE + suggest), ResumeSessionBanner
    train/components/         — PlanEditor (validation hint), ProgramSummaryCard (full tap target)
    compete/components/       — ChallengeModal (NEW), LeaderboardRow (challenge button)
    insights/components/      — PersonalRecordCard (empty state), ScoreTrendCard
    profile/components/       — SettingsRow (accent flag), CollectionShowcase
  store/
    sessionStore.ts           — computeSuggestion, buildSessionExercises, history
    profileStore.ts           — onboardingProfile, setOnboardingProfile
  types/
    workoutSession.ts         — ExerciseSet (rpe), SessionExercise (suggest)
    insight.ts                — enforceTwoSentences()
  lib/
    score.ts                  — scoring math (fully tested)
  components/
    mascots/Mascot.tsx        — Mascot component
    layout/PageContainer.tsx  — pb-36 bottom padding

public/
  mascots/                    — 13 WebP pose files (Kix × 8, Nyra × 5)

design/
  mascots/
    kix/kix-anchor.png        — Kix cinematic reference (2816×1536)
    kix/kix-grid.png          — Kix 8-pose expression grid
    nyra/nyra-anchor.png      — Nyra cinematic reference (2816×1536)
    nyra/nyra-grid.png        — Nyra 5-pose expression grid

scripts/
  crop_mascots.py             — Python/Pillow script to regenerate WebP crops

docs/
  TODO.md                     — Living task list
  UI_AUDIT_NOTES.md           — Full app UI audit from browser subagent
  MASCOTS.md                  — Mascot character canon and usage rules
  DATA_MODELS.md              — Data schema documentation
  ROUTES.md                   — Route architecture
```

---

## 🚀 What To Do Next (Priority Order)

### 1. Phase 3 — Supabase Auth (Next Priority)

### 4. Phase 4 — Database
- Design schema: `profiles`, `sessions`, `session_exercises`, `sets`, `cardio_logs`, `xp_transactions`
- Replace `src/data/` fixtures with `supabase.from()` calls behind `api/get*Data.ts` seams

---

## 🧪 How To Verify Everything Is Working

```bash
cd "e:\physQIx AI"
npm test          # Should show 28/28 passing
npm run lint      # Should show 0 errors
npm run dev       # Opens http://localhost:3000
```

Open browser:
- `/home` — Dashboard with score, daily mission
- `/train` — Programs, exercises, plan builder (check validation hint when Save disabled)
- `/insights` — Trend charts, PR switcher, Body Balance radar
- `/compete` — Leaderboard (tap any non-you row → challenge modal opens)
- `/profile` — Settings (tour replay is brand-green), avatar picker

---

## 📝 Ongoing Design Rules (Never Break These)

1. **Anti-Clippy law:** Never show a mascot during user input. Never both mascots on one screen.
2. **Colour grammar:** Warm/amber = warnings only. Brand green = positive/primary. Danger red = destructive.
3. **Session safety:** Abandoned sessions are always summarized into history, never discarded silently.
4. **Insight contract:** `insight.body` always enforced ≤ 2 sentences via `enforceTwoSentences()`.
5. **Store hydration:** Never remove `skipHydration: true` from stores — it prevents SSR mismatch.
6. **`domMax` is intentional** in MotionProvider — do not downgrade to `domAnimation`.
