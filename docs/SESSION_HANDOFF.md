# PhysIQx AI — Session Handoff Document
*Last updated: 2026-09-13 · Use this file when switching accounts to resume work.*

---

## 🔑 Project Quick Facts

| Key | Value |
|---|---|
| **App name** | PhysIQx AI |
| **Workspace path** | `e:\physQIx AI` |
| **Stack** | Next.js 15 (App Router), TypeScript, Zustand, Framer Motion, Tailwind |
| **Dev server** | `npm run dev` → `http://localhost:3000` |
| **Production build**| `npm run build` → 25/25 routes static/dynamic compiled clean |
| **Tests** | `npm test` → 28/28 passing (Vitest) |
| **Lint** | `npm run lint` → 0 errors, 0 warnings |
| **Git branch** | `main` |
| **Body Scan Assets**| 67 Certified high-fidelity assets in `public/body-shapes/` |

---

## 🗺️ Project Phase Map

```
Phase 1 — UI Shell              ✅ COMPLETE
Phase 2 — Polish & Logic        ✅ COMPLETE
Phase 3 — Auth (Supabase)       ✅ COMPLETE (wired to real project)
Phase 4 — Database & Persistence✅ COMPLETE (Supabase tables + Score Engine)
Phase 5 — Hologram Body Suite   ✅ COMPLETE (67 assets + 3D UI controls)
Phase 6 — AI Integration        ⬜ NOT STARTED
```

---

## ✅ Everything Done In This Session (2026-09-13)

### Holographic Body Scan Expansion & App Attachment (67 Assets Complete)
- Resumed and completed all image generation batches (Batches 1, 2, 3, 4):
  - **Batch 2 (Tall & Short Statures)**: 10/10 complete (`tall_athletic_male_45deg`, `tall_muscular_male_front`, `tall_lean_female_front`, `tall_athletic_female_front`, `tall_muscular_female_front`, `short_athletic_male_front`, `short_muscular_female_front`, etc.).
  - **Batch 3 (Realistic Body Shapes)**: 10/10 complete (`apple_male_front`, `pear_female_front`, `hourglass_female_front`, `rectangular_male_front`, `endomorph_male_front`, `skinnyfat_female_front`, `dadbod_male_side`, `apple_female_front`, `pear_male_front`, `endomorph_female_front`).
  - **Batch 4 (1:1 Aspect Ratio Icons)**: 8/8 complete (`short_lean_neutral_icon`, `short_muscular_neutral_icon`, `tall_lean_neutral_icon`, `tall_muscular_neutral_icon`, `skinnyfat_neutral_icon`, `dadbod_neutral_icon`, `apple_neutral_icon`, `pear_neutral_icon`).
- Audited all assets against the 5 Zero-Tolerance Constraints (pure `#00E676` neon green, faceless ovoid head, zero internal bones, compression apparel, clean void HUD).
- Integrated all 67 assets into the central asset registry (`src/data/bodyScanRegistry.ts`).
- Enhanced dynamic resolver (`src/utils/bodyScanResolver.ts`) with stature-aware icon lookups and realistic category mappings.
- Attached live interactive angle (`Front`, `Side`, `45°`) and gender switchers to `BodyShapeStep.tsx` during onboarding.
- Embedded holographic archetype scan into `DNAResultStep.tsx` celebration card.
- Added dedicated **"Digital Twin Hologram Scan"** section to Body Stats screen (`src/app/(app)/profile/body/BodyContent.tsx`) calibrated to user's measured height tier and body shape archetype.
- Updated `docs/BODY_SHAPE_EXPANSION_HANDBOOK.md` with complete 67-asset inventory.
- Cleaned lint warnings in `scoreEngine.ts`, `bodyScanResolver.ts`, and `getProfileData.ts` (0 errors, 0 warnings).

### Modular User Preferences & Optional Controls (RPE & Quiet Mode)
- Created **Preferences & Logging** page (`/profile/settings/preferences`) with accessible `Switch.tsx` toggles.
- Defined `UserPreferences` in `src/store/profileStore.ts` with SSR-safe hydration and local persistence:
  - **`trackRpe: false`** (default off): Hides `@RPE` column in `SetRow.tsx` so standard set logging is fast and uncluttered (Weight × Reps only).
  - **`showGhostSuggestions: true`**: Allows toggling progression ghost placeholder hints.
  - **`autoRestTimer: true`**: Allows toggling automatic rest countdown on set completion.
  - **`showMascots: true`**: Allows enabling a stoic "Quiet Mode" that hides Kix & Nyra commentary/mascot medallions across the app.
  - **`showAiInsights: true`**: Allows suppressing unsolicited coach insight cards on Home and Insights.
  - **`celebrationEffects: true`**: Allows toggling celebration fanfare/confetti.
- Added comprehensive unit tests in `src/store/profileStore.test.ts` (31/31 Vitest tests passing).
- Verified Next.js 15 build with clean static generation of all 229 routes.

---

## ✅ Previous Session Accomplishments

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

### App Icon Design & Generation (Kix Mascot-Focused)
- Iterated through four rounds of generation to find the perfect blend of 2026 aesthetics and PhysIQx mascot relevance.
- Selected **Option 21 (The Holographic Glove)**: A premium 3D boxing glove made of translucent holographic neon green mesh. Represents Kix's fighting spirit.
- Ran `scripts/generate_icons.py` to auto-resize the master 1024x1024 icon into all required formats.
- Exported and wired all PWA/favicon sizes to `public/` (16, 32, 180, 192, 512, favicon.ico).
- Added `public/manifest.json` for PWA support.

### Phase 3 — Supabase Auth Wiring
- Installed `@supabase/supabase-js` + `@supabase/ssr`
- Created Supabase client utilities: `src/lib/supabase/client.ts`, `server.ts`, `middleware.ts`
- Wired all 4 auth forms (`LoginForm`, `SignupForm`, `SocialLoginButtons`, `ForgotPasswordForm`) to real Supabase API calls
- Created `src/middleware.ts` with route protection (unauthenticated → `/login`)
- Created `src/app/auth/callback/route.ts` for OAuth callback handling
- Created `src/features/auth/actions/logout.ts` server action
- Created `supabase/migrations/001_create_profiles.sql` (profiles table + RLS + auto-profile trigger)
- Wired `OnboardingFlow.tsx` to persist onboarding data to the Supabase `profiles` table
- Updated root redirect (`src/app/page.tsx`) from `/home` → `/login`
- **Status:** Code is fully wired. Needs `.env.local` credentials from a real Supabase project + SQL migration run.

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
