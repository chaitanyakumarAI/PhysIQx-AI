# PhysIQx — Product Directives & Roadmap Notes
*Recorded: October 9, 2026 · Source: Direct User Vision & Feedback*

---

## 1. Gamified Fitness Characters: Kix & Nyra (Interactive Character Guide Mechanic)

### Concept & Design Intent
*Important Distinction*: We are **not literally copying the Clash of Clans visual aesthetic** (no cartoonish village tropes or intrusive game takeovers). Instead, we are adapting the **interactive character guide mechanic**:
- Characters appear dynamically in a modern, dark-athletic UI as ambient/hover guides with contextual dialogue speech bubbles.
- Inspired by the *engagement pattern* from mobile gaming (Supercell-style: warm onboarding greeting, first-visit feature explanations, re-engagement welcome-backs, and celebratory milestones), but styled with PhysIQx's sleek, neon-accented, high-performance aesthetic.
- **Core Vision**: Transform PhysIQx from a sterile utility logger into a **gamified fitness universe** where Kix and Nyra feel like living training partners and coaches.

### In-App Execution Blueprint
1. **Interactive Hover Dialogue Guides**:
   - Instead of static text or sterile walkthrough overlays, Kix or Nyra appears anchored to the screen edge/bottom corner with animated dialogue balloons.
   - **Onboarding Intro**: Introducing the lifter to their journey, split selection, and setup.
   - **Feature Explanation**: Popping up contextually on first visit to complex screens (e.g., explaining the 4-Pillar Score on Insights, how the Barbell Sleeve works in Session, or how device sync powers the Cardio pillar).
   - **Welcome Back / Re-engagement**: Triggered upon returning after a hiatus (*"Thank goodness you're back! Ready to hit the iron today?"*).
   - **Accountability & Celebration**: High-energy high-fives on PRs, streak milestones, and completed workouts.
2. **Character Roles**:
   - **⚡ Kix**: The high-energy, fiery motivator. Owns intensity, progressive overload, heavy compound lifts, streak momentum, and celebratory hype.
   - **🛡 Nyra**: The stoic, intelligent guardian. Owns biomechanics, form standards, recovery science, deload timing, and joint longevity.

---

## 2. Kix & Nyra Social Media Video Series

### Concept & IP Expansion
- Develop a dedicated social media video series (Instagram Reels, TikTok, YouTube Shorts) starring Kix and Nyra.
- **Content Pillars**:
  - **Fitness Lore & Comedy**: Relatable gym moments (gym bros vs. biomechanics purists, cutting vs. bulking debates).
  - **Educational Cues**: Nyra breaking down form on deadlifts and squats; Kix demonstrating explosive intent and mental toughness.
  - **Product Showcase**: Characters explaining features, score algorithms, and gamified challenges directly to athletes.
  - **Brand Universe**: Establishing PhysIQx as a lifestyle and gaming-inspired fitness brand rather than a generic workout logger.

---

## 3. Strict Truth-in-Terminology: Remove Misleading 'AI' Buzzwords

### Directive
Audit and remove the word **"AI"** across the entire UI where real machine learning / neural networks are not actually used. Keep the app honest, authentic, and respected by athletes.

### Audit & Renaming Targets:
| Current Phrasing | New Honest Phrasing | Context |
|---|---|---|
| `AI Coach` | `Coach` or `Athletic Coach` | Conversational rule engine (`/coach`) |
| `AI Insights` | `Coach Insights` or `Performance Insights` | Heuristic performance rules |
| `Certified AI Assets` | `Certified 3D Scan Models` | Holographic body assets |
| `AI Program Architect` | `Smart Program Architect` | Algorithmic split generator |
| `AI-generated` | `Automated` or `Algorithmic` | Background calculations |

---

## 4. Complete Disconnection & Removal of Hydration Features

### Directive
Completely disconnect and remove all hydration-related tracking from the app's functioning. PhysIQx is a serious lifting and conditioning platform; daily water logging adds friction and noise.

### Action Checklist:
- [ ] Remove `HydrationLogSheet.tsx` and water quick-log actions from Home.
- [ ] Disconnect `hydrationStore.ts` from active app imports.
- [ ] Remove hydration inputs from onboarding flow (`hydrationGoalLiters`).
- [ ] Remove hydration status (`glycogenHydration`) from `RecoveryReadinessCard.tsx`, `RecoveryScreen.tsx`, and `recoveryEngine.ts` (recalculate recovery score based on CNS fatigue, session tonnage, sleep, and rest days).
- [ ] Remove "Hydration Master" achievement from `achievementEngine.ts`.
- [ ] Remove hydration targets from profile types (`types/profile.ts`, `types/nutrition.ts`).

---

## 5. Cardio Architecture: Sync-Only (No Manual Logging)

### Directive
For the Cardio pillar, **there should only be background device syncing of activities**. Manual logging should not be there.

### Action Checklist:
- [ ] In [`src/app/(app)/train/cardio/CardioContent.tsx`](file:///E:/physQIx%20AI/src/app/(app)/train/cardio/CardioContent.tsx):
  - Remove manual activity selection chips (Running, Cycling, Rowing, Walking, etc.).
  - Remove manual duration chips and custom minutes text input.
  - Remove "Save session" manual submit button.
- [ ] Focus the Cardio screen solely on:
  - Weekly cardio progress bar (active minutes towards weekly goal).
  - Direct integration status & sync button (Apple Health, Garmin, Health Connect).
  - Synced activities ledger (displaying workouts imported automatically from wearable devices).
