# Future Work & Architectural Backlog

This document captures features, architectures, data models, and component blueprints designed for PhysIQx that have been curated for future release or optional modular activation.

---

## Table of Contents
1. [Conversational AI Coach Dialogue (`/coach`)](#1-conversational-ai-coach-dialogue-coach)
2. [AI Program Architect (`/train/programs/generate`)](#2-ai-program-architect-trainprogramsgenerate)
3. [Barbell & Strength Lab (`/train/calculator`)](#3-barbell--strength-lab-traincalculator)
4. [Fuel, Nutrition & Health Hub (`/fuel`, `/fuel/scanner`)](#4-fuel-nutrition--health-hub-fuelfuelscanner)
5. [Hydration Quick-Log Sheet (`HydrationLogSheet`)](#5-hydration-quick-log-sheet-hydrationlogsheet)
6. [Interactive Musculoskeletal Anatomy Diagram](#6-interactive-musculoskeletal-anatomy-diagram)
7. [Kinetic Bar Path & Motion Player](#7-kinetic-bar-path--motion-player)
8. [Movement Biomechanics & Form Guide](#8-movement-biomechanics--form-guide)
9. [Exercise Personal History & PR Tracker](#9-exercise-personal-history--pr-tracker)
10. [Mascot Milestone Celebrations](#10-mascot-milestone-celebrations)

---

### 1. Conversational AI Coach Dialogue (`/coach`)
- **Route**: `/coach`
- **Concept & Architecture**:
  - Dedicated interactive dialogue surface connecting athletes directly to dual AI mascot coaching personas:
    - **Kix**: The Power Mascot (Greyhound/Canine) focusing on drive, progressive overload, streak consistency, and mental discipline.
    - **Nyra**: The Science Mascot (Snow Leopard/Feline) focusing on biomechanics, anatomy, fatigue management, and athletic recovery.
  - **Context Grounding**: AI coach prompts ingest user profile parameters (`goal`, `experienceLevel`, `activeSplit`), training frequency, current streak, recent workout history, and exercise catalog fixtures.
  - **Two-Sentence Coaching Contract**: All AI responses strictly pass through `enforceTwoSentences(text)` to guarantee prompt, high-density, actionable coaching advice that prevents cognitive overload during gym sessions.
  - **Suggested Queries**: Preset prompt pills for quick queries (e.g., *"How should I warm up for heavy bench?"*, *"My lower back feels tight today"*, *"Suggest a finisher for triceps"*).

---

### 2. AI Program Architect (`/train/programs/generate`)
- **Route**: `/train/programs/generate`
- **Concept & Architecture**:
  - Algorithmic and generative workout split designer creating structured multi-week training programs tailored to athlete constraints.
  - **Input Parameters**:
    - Training Goal: Hypertrophy, Raw Strength, Athletic Conditioning, or Longevity.
    - Experience Level: Beginner, Intermediate, Advanced.
    - Weekly Frequency: 3, 4, 5, or 6 days/week.
    - Split Architecture: Push/Pull/Legs (PPL), Upper/Lower, Full Body, or Body Part Split.
    - Available Equipment: Full Commercial Gym, Barbell Only, Dumbbells Only, or Calisthenics/Home.
  - **Program Synthesis**:
    - Calculates weekly per-muscle volume sets based on evidence-based hypertrophy thresholds (e.g., 10–20 direct working sets/week).
    - Pairs compound anchor lifts with complementary isolation movements.
    - Emits structured program JSON that integrates directly into `plansStore.ts` and the active session launcher.

---

### 3. Barbell & Strength Lab (`/train/calculator`)
- **Route**: `/train/calculator`
- **Concept & Architecture**:
  - Comprehensive standalone strength laboratory providing:
    - **Greedy Olympic Plate Math**: Calculates exact plate loading configurations per sleeve for standard 20kg (Olympic), 15kg (Women's), 10kg (Technique), and 25kg (Trap) bars across 25kg, 20kg, 15kg, 10kg, 5kg, 2.5kg, and 1.25kg plates.
    - **1RM Percentage Zones**: Real-time breakdown of training zones based on Epley formula estimates (95% Heavy Peak, 85% Strength/Hypertrophy, 70% Speed/Volume, 50% Active Deload).
    - **4-Phase Warmup Progression Ladder**: Auto-calculates empty bar sets, 50% prep sets, 70% primer sets, and 85% potentiation singles prior to working weight sets.

---

### 4. Fuel, Nutrition & Health Hub (`/fuel`, `/fuel/scanner`)
- **Routes**: `/fuel`, `/fuel/scanner`
- **Concept & Architecture**:
  - Complete athletic macronutrient tracking and metabolic fueling engine:
    - **Dynamic Macro Budget**: Daily calorie, protein, carbohydrate, and fat targets derived from athlete lean body mass and goals (Cut, Maintain, Bulk).
    - **Meal Ledger**: Breakdown across Breakfast, Lunch, Dinner, and Post-Workout Snacks with circular progress rings and macro ratio badges.
    - **Optical Barcode Scanner (`/fuel/scanner`)**: Camera viewfinder using Web MediaDevices / BarcodeDetector API for instant packaged food UPC recognition, nutritional lookup, and logging.
    - **Local-First Nutrition Store (`nutritionStore.ts`)**: Fully offline-functional food log with custom food creation and fast search.

---

### 5. Hydration Quick-Log Sheet (`HydrationLogSheet`)
- **Component**: `src/features/home/components/HydrationLogSheet.tsx`
- **Concept & Architecture**:
  - Tactile slide-up bottom sheet for quick fluid intake recording:
    - Daily goal visualization (e.g., 3,000 mL target with circular progress meter).
    - 1-tap quick logging chips: `+250 ml` (Glass), `+500 ml` (Bottle), `+750 ml` (Shaker).
    - Custom fluid volume input with real-time target math.
    - Synthesized audio feedback: High-frequency liquid droplet pitch-bend sound effect (`playWaterDrop()`) and micro-haptics.
    - Persisted via `hydrationStore.ts`.

---

### 6. Interactive Musculoskeletal Anatomy Diagram
- **Component**: `src/features/train/components/MuscleAnatomyVisualizer.tsx`
- **Concept & Architecture**:
  - Dual-view (Anterior & Posterior) vector SVG anatomical model of the human muscular system.
  - Dynamically binds to exercise EMG stimulus distributions (`exercise.muscleHit: Record<MuscleGroup, number>`).
  - Active muscle groups (Chest, Lats, Quads, Hamstrings, Deltoids, Biceps, Triceps, Abs, Glutes, Calves) glow with tone-coded intensity proportional to their stimulus share:
    - Primary targets (>40% share) glow emerald with radial gradient filters.
    - Secondary synergists (20%–39%) highlight in subtle brand accents.
    - Stabilizers (<20%) render in neutral borders.
  - Tabbed Anterior/Posterior toggle with responsive touch scaling.

---

### 7. Kinetic Bar Path & Motion Player
- **Component**: `src/features/train/components/ExerciseDemoPlayer.tsx`
- **Concept & Architecture**:
  - Parametric side-profile kinetic bar path trajectory animator for compound and isolation movements.
  - Renders smooth SVG trajectory curves with moving weight indicators:
    - Vertical Linear paths (Squat, Deadlift, Overhead Press).
    - J-Curve biomechanical paths (Barbell Bench Press descending to sternum and pressing backward toward shoulders).
    - Arc paths (Pullups, Incline DB Press).
  - Real-time movement phase readout: **Eccentric** (lowering), **Stretch Pause** (reversal), and **Concentric** (drive).
  - Cadence tempo clock (e.g., `3-1-X-0`) with live rep counter and adjustable playback speeds ($0.5\times$, $1.0\times$, $1.5\times$).

---

### 8. Movement Biomechanics & Form Guide
- **Component**: `src/features/train/components/MovementFormGuide.tsx`
- **Concept & Architecture**:
  - Comprehensive movement execution manual structured into 3 distinct chronological phases:
    - **Setup**: Stance, grip width, scapular retraction, and bracing cues.
    - **Execution**: Eccentric descent trajectory, bar path alignment, knee/elbow tracking, and breathing cadence.
    - **Lockout**: Concentric drive, hip extension, and stable rack control.
  - **Common Faults & Injury Prevention**: Bulleted breakdown of typical failure points (e.g., knee valgus, lower back flexion, flared elbows) and actionable corrective cues.
  - 1-tap query link to launch Coach Nyra with prefilled biomechanics prompts.

---

### 9. Exercise Personal History & PR Tracker
- **Component**: `src/features/train/components/ExerciseHistoryCard.tsx`
- **Concept & Architecture**:
  - Dedicated personal performance ledger displayed on exercise detail pages:
    - Traverses completed workouts from `sessionStore.history`.
    - Highlights **All-Time Estimated 1RM** calculated via Epley formula.
    - Displays **Personal Best Working Set** (Max weight × reps).
    - Chronological log of recent training dates, sets, loads, and rep counts for that specific exercise.

---

### 10. Mascot Milestone Celebrations
- **Component**: `src/features/home/components/AchievementSpotlight.tsx`
- **Concept & Architecture**:
  - Character celebration widget highlighting athlete milestones on the Home screen:
    - Integrated mascot medallions (`/mascots/kix-proud.png`, `/mascots/kix-joy.png`, `/mascots/nyra-focus.png`).
    - Triggers on personal records (new 1RM or top set load) and consistency milestones (multiples of 7-day streaks).
    - Synthesizes celebration fanfare chords (`playCelebrationFanfare()`) and success haptic vibrations.
