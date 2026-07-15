import type { ProgramType } from "@/types/training";
import { setsOf, type WorkoutTemplateExercise } from "@/types/workoutTemplate";

/**
 * The suggested-program library behind Train's program chips — GENERATED
 * from content/program-content_filled.json (authored, research-grounded;
 * see that file's sourcing notes). Do not hand-edit; update the content
 * file and regenerate. Set prescriptions resolve to TemplateSet[] so
 * adopting a day is a direct mapping into a user plan.
 */

export type ProgramLevel = "beginner" | "intermediate" | "advanced";

export interface ProgramDay {
  name: string;
  /** One-line emphasis shown under the day name. */
  focus?: string;
  exercises: WorkoutTemplateExercise[];
}

export interface ProgramVariant {
  daysPerWeek: number;
  /** Coaching guidance shown with the schedule. */
  notes?: string;
  days: ProgramDay[];
}

export interface ProgramDefinition {
  type: ProgramType;
  name: string;
  level: ProgramLevel;
  description: string;
  /** Weekly frequencies this program suits — powers recommendations. */
  recommendedDaysPerWeek: number[];
  variants: ProgramVariant[];
}

/** AMRAP sets: the 10 is only the input placeholder — the target is failure. */
function amrap(count: number): WorkoutTemplateExercise["sets"] {
  return Array.from({ length: count }, () => ({ targetReps: 10, toFailure: true }));
}

/** Timed sets: seconds mirrored into targetReps as the logging placeholder. */
function timed(count: number, seconds: number): WorkoutTemplateExercise["sets"] {
  return Array.from({ length: count }, () => ({
    targetReps: seconds,
    durationSeconds: seconds,
  }));
}

export const programLevelLabels: Record<ProgramLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const programLibrary: ProgramDefinition[] = [
  {
    type: "ppl",
    name: "Push Pull Legs",
    level: "intermediate",
    description: "A high-frequency split that trains each movement pattern twice per week, built for lifters who want to prioritize hypertrophy and can commit to 5-6 sessions weekly.",
    recommendedDaysPerWeek: [5, 6],
    variants: [
      {
        daysPerWeek: 6,
        notes: "Each muscle group is trained twice per week. Run Heavy Push / Heavy Pull / Power Legs one cycle, then Shoulder Push / Width Pull / Hip Power the next, back to back with one rest day per week wherever it fits your schedule.",
        days: [
          {
            name: "Heavy Push",
            focus: "Chest, shoulders, triceps",
            exercises: [
              { exerciseId: "ex-bench-press", sets: [{ targetReps: 10 }, { targetReps: 8 }, { targetReps: 6 }, { targetReps: 6 }], restSeconds: 150 },
              { exerciseId: "ex-incline-db-press", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-cable-fly", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-overhead-press", sets: setsOf(3, 8), restSeconds: 90 },
              { exerciseId: "ex-lateral-raise", sets: setsOf(3, 15), restSeconds: 45 },
              { exerciseId: "ex-triceps-pushdown", sets: setsOf(3, 12), restSeconds: 60 },
            ],
          },
          {
            name: "Heavy Pull",
            focus: "Back, biceps",
            exercises: [
              { exerciseId: "ex-deadlift", sets: [{ targetReps: 6 }, { targetReps: 5 }, { targetReps: 4 }, { targetReps: 4 }], restSeconds: 180 },
              { exerciseId: "ex-pull-up", sets: setsOf(4, 8), restSeconds: 90 },
              { exerciseId: "ex-barbell-row", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-seated-cable-row", sets: setsOf(3, 12), restSeconds: 75 },
              { exerciseId: "ex-face-pull", sets: setsOf(3, 15), restSeconds: 45 },
              { exerciseId: "ex-barbell-curl", sets: setsOf(3, 12), restSeconds: 60 },
            ],
          },
          {
            name: "Power Legs",
            focus: "Quads, hamstrings, glutes, calves",
            exercises: [
              { exerciseId: "ex-back-squat", sets: [{ targetReps: 10 }, { targetReps: 8 }, { targetReps: 6 }, { targetReps: 6 }], restSeconds: 150 },
              { exerciseId: "ex-romanian-deadlift", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-leg-press", sets: setsOf(3, 12), restSeconds: 90 },
              { exerciseId: "ex-bulgarian-split-squat", sets: setsOf(3, 10), restSeconds: 75 },
              { exerciseId: "ex-lying-leg-curl", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-standing-calf-raise", sets: setsOf(4, 15), restSeconds: 45 },
            ],
          },
          {
            name: "Shoulder Push",
            focus: "Shoulders, chest, triceps",
            exercises: [
              { exerciseId: "ex-seated-db-press", sets: [{ targetReps: 10 }, { targetReps: 8 }, { targetReps: 8 }], restSeconds: 120 },
              { exerciseId: "ex-incline-bench-press", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-machine-chest-press", sets: setsOf(3, 12), restSeconds: 75 },
              { exerciseId: "ex-cable-lateral-raise", sets: setsOf(3, 15), restSeconds: 45 },
              { exerciseId: "ex-chest-dip", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-overhead-triceps-ext", sets: setsOf(3, 12), restSeconds: 60 },
            ],
          },
          {
            name: "Width Pull",
            focus: "Back width, rear delts, biceps",
            exercises: [
              { exerciseId: "ex-rack-pull", sets: [{ targetReps: 6 }, { targetReps: 6 }, { targetReps: 5 }, { targetReps: 5 }], restSeconds: 150 },
              { exerciseId: "ex-lat-pulldown", sets: setsOf(4, 10), restSeconds: 90 },
              { exerciseId: "ex-t-bar-row", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-single-arm-db-row", sets: setsOf(3, 12), restSeconds: 75 },
              { exerciseId: "ex-rear-delt-fly", sets: setsOf(3, 15), restSeconds: 45 },
              { exerciseId: "ex-hammer-curl", sets: setsOf(3, 12), restSeconds: 60 },
            ],
          },
          {
            name: "Hip Power",
            focus: "Hips, hamstrings, quads",
            exercises: [
              { exerciseId: "ex-front-squat", sets: [{ targetReps: 8 }, { targetReps: 8 }, { targetReps: 6 }, { targetReps: 6 }], restSeconds: 150 },
              { exerciseId: "ex-hip-thrust", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-walking-lunge", sets: setsOf(3, 12), restSeconds: 75 },
              { exerciseId: "ex-leg-extension", sets: setsOf(3, 15), restSeconds: 60 },
              { exerciseId: "ex-seated-leg-curl", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-seated-calf-raise", sets: setsOf(4, 15), restSeconds: 45 },
            ],
          },
        ],
      },
      {
        daysPerWeek: 5,
        notes: "A single weekly leg session with two push and two pull sessions. Good for lifters who want most of the PPL benefit without training 6 days a week — rotate which leg day (Power Legs or Hip Power) you use week to week.",
        days: [
          {
            name: "Heavy Push",
            focus: "Chest, shoulders, triceps",
            exercises: [
              { exerciseId: "ex-bench-press", sets: [{ targetReps: 10 }, { targetReps: 8 }, { targetReps: 6 }, { targetReps: 6 }], restSeconds: 150 },
              { exerciseId: "ex-incline-db-press", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-cable-fly", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-overhead-press", sets: setsOf(3, 8), restSeconds: 90 },
              { exerciseId: "ex-lateral-raise", sets: setsOf(3, 15), restSeconds: 45 },
              { exerciseId: "ex-triceps-pushdown", sets: setsOf(3, 12), restSeconds: 60 },
            ],
          },
          {
            name: "Heavy Pull",
            focus: "Back, biceps",
            exercises: [
              { exerciseId: "ex-deadlift", sets: [{ targetReps: 6 }, { targetReps: 5 }, { targetReps: 4 }, { targetReps: 4 }], restSeconds: 180 },
              { exerciseId: "ex-pull-up", sets: setsOf(4, 8), restSeconds: 90 },
              { exerciseId: "ex-barbell-row", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-seated-cable-row", sets: setsOf(3, 12), restSeconds: 75 },
              { exerciseId: "ex-face-pull", sets: setsOf(3, 15), restSeconds: 45 },
              { exerciseId: "ex-barbell-curl", sets: setsOf(3, 12), restSeconds: 60 },
            ],
          },
          {
            name: "Power Legs",
            focus: "Quads, hamstrings, glutes, calves",
            exercises: [
              { exerciseId: "ex-back-squat", sets: [{ targetReps: 10 }, { targetReps: 8 }, { targetReps: 6 }, { targetReps: 6 }], restSeconds: 150 },
              { exerciseId: "ex-romanian-deadlift", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-leg-press", sets: setsOf(3, 12), restSeconds: 90 },
              { exerciseId: "ex-bulgarian-split-squat", sets: setsOf(3, 10), restSeconds: 75 },
              { exerciseId: "ex-lying-leg-curl", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-standing-calf-raise", sets: setsOf(4, 15), restSeconds: 45 },
            ],
          },
          {
            name: "Shoulder Push",
            focus: "Shoulders, chest, triceps",
            exercises: [
              { exerciseId: "ex-seated-db-press", sets: [{ targetReps: 10 }, { targetReps: 8 }, { targetReps: 8 }], restSeconds: 120 },
              { exerciseId: "ex-incline-bench-press", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-machine-chest-press", sets: setsOf(3, 12), restSeconds: 75 },
              { exerciseId: "ex-cable-lateral-raise", sets: setsOf(3, 15), restSeconds: 45 },
              { exerciseId: "ex-chest-dip", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-overhead-triceps-ext", sets: setsOf(3, 12), restSeconds: 60 },
            ],
          },
          {
            name: "Width Pull",
            focus: "Back width, rear delts, biceps",
            exercises: [
              { exerciseId: "ex-rack-pull", sets: [{ targetReps: 6 }, { targetReps: 6 }, { targetReps: 5 }, { targetReps: 5 }], restSeconds: 150 },
              { exerciseId: "ex-lat-pulldown", sets: setsOf(4, 10), restSeconds: 90 },
              { exerciseId: "ex-t-bar-row", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-single-arm-db-row", sets: setsOf(3, 12), restSeconds: 75 },
              { exerciseId: "ex-rear-delt-fly", sets: setsOf(3, 15), restSeconds: 45 },
              { exerciseId: "ex-hammer-curl", sets: setsOf(3, 12), restSeconds: 60 },
            ],
          },
        ],
      },
    ],
  },
  {
    type: "upper-lower",
    name: "Upper / Lower",
    level: "intermediate",
    description: "A balanced 4-day split alternating upper and lower body sessions — enough frequency to drive progress without the daily commitment of PPL or a bro split.",
    recommendedDaysPerWeek: [4],
    variants: [
      {
        daysPerWeek: 4,
        notes: "Run Upper Strength, Lower Strength, Upper Volume, Lower Volume across the week with rest days spaced between, e.g. Mon/Tue/Thu/Fri. Strength days lean heavier and lower-rep; Volume days add sets at moderate reps.",
        days: [
          {
            name: "Upper Strength",
            focus: "Chest, back, shoulders — strength focus",
            exercises: [
              { exerciseId: "ex-bench-press", sets: [{ targetReps: 8 }, { targetReps: 6 }, { targetReps: 6 }, { targetReps: 4 }], restSeconds: 150 },
              { exerciseId: "ex-barbell-row", sets: setsOf(4, 8), restSeconds: 120 },
              { exerciseId: "ex-seated-db-press", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-lat-pulldown", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-lateral-raise", sets: setsOf(3, 15), restSeconds: 45 },
              { exerciseId: "ex-barbell-curl", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-triceps-pushdown", sets: setsOf(3, 12), restSeconds: 60 },
            ],
          },
          {
            name: "Lower Strength",
            focus: "Quads, hamstrings, calves — strength focus",
            exercises: [
              { exerciseId: "ex-back-squat", sets: [{ targetReps: 8 }, { targetReps: 6 }, { targetReps: 6 }, { targetReps: 4 }], restSeconds: 180 },
              { exerciseId: "ex-romanian-deadlift", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-leg-press", sets: setsOf(3, 12), restSeconds: 90 },
              { exerciseId: "ex-lying-leg-curl", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-standing-calf-raise", sets: setsOf(4, 15), restSeconds: 45 },
              { exerciseId: "ex-cable-crunch", sets: setsOf(3, 15), restSeconds: 45 },
            ],
          },
          {
            name: "Upper Volume",
            focus: "Chest, back, shoulders — volume focus",
            exercises: [
              { exerciseId: "ex-incline-db-press", sets: [{ targetReps: 12 }, { targetReps: 10 }, { targetReps: 10 }], restSeconds: 90 },
              { exerciseId: "ex-seated-cable-row", sets: setsOf(4, 10), restSeconds: 90 },
              { exerciseId: "ex-overhead-press", sets: setsOf(3, 8), restSeconds: 90 },
              { exerciseId: "ex-chin-up", sets: setsOf(3, 8), restSeconds: 90 },
              { exerciseId: "ex-cable-lateral-raise", sets: setsOf(3, 15), restSeconds: 45 },
              { exerciseId: "ex-hammer-curl", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-skull-crusher", sets: setsOf(3, 12), restSeconds: 60 },
            ],
          },
          {
            name: "Lower Volume",
            focus: "Hips, hamstrings — volume focus",
            exercises: [
              { exerciseId: "ex-front-squat", sets: [{ targetReps: 10 }, { targetReps: 10 }, { targetReps: 8 }], restSeconds: 150 },
              { exerciseId: "ex-hip-thrust", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-bulgarian-split-squat", sets: setsOf(3, 10), restSeconds: 75 },
              { exerciseId: "ex-seated-leg-curl", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-seated-calf-raise", sets: setsOf(4, 15), restSeconds: 45 },
              { exerciseId: "ex-hanging-knee-raise", sets: setsOf(3, 12), restSeconds: 45 },
            ],
          },
        ],
      },
    ],
  },
  {
    type: "bro",
    name: "Bro Split",
    level: "intermediate",
    description: "One muscle group per day for maximum focused volume and pump — a classic bodybuilding-style split for lifters training 5 days a week who enjoy specializing session to session.",
    recommendedDaysPerWeek: [5],
    variants: [
      {
        daysPerWeek: 5,
        notes: "Run Chest, Back, Shoulders, Arms, Legs in order across the week, e.g. Mon-Fri with the weekend off. Each muscle group is trained once weekly, so push volume and intensity hard within each session.",
        days: [
          {
            name: "Chest Day",
            focus: "Chest, front delts",
            exercises: [
              { exerciseId: "ex-bench-press", sets: [{ targetReps: 10 }, { targetReps: 8 }, { targetReps: 6 }, { targetReps: 6 }], restSeconds: 150 },
              { exerciseId: "ex-incline-db-press", sets: setsOf(4, 10), restSeconds: 90 },
              { exerciseId: "ex-machine-chest-press", sets: setsOf(3, 12), restSeconds: 75 },
              { exerciseId: "ex-cable-fly", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-chest-dip", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-push-up", sets: amrap(2), restSeconds: 60 },
            ],
          },
          {
            name: "Back Day",
            focus: "Lats, mid-back, erectors",
            exercises: [
              { exerciseId: "ex-deadlift", sets: [{ targetReps: 6 }, { targetReps: 5 }, { targetReps: 4 }, { targetReps: 4 }], restSeconds: 180 },
              { exerciseId: "ex-pull-up", sets: setsOf(4, 8), restSeconds: 90 },
              { exerciseId: "ex-barbell-row", sets: setsOf(4, 10), restSeconds: 90 },
              { exerciseId: "ex-lat-pulldown", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-seated-cable-row", sets: setsOf(3, 12), restSeconds: 75 },
              { exerciseId: "ex-back-extension", sets: setsOf(3, 15), restSeconds: 60 },
            ],
          },
          {
            name: "Shoulder Day",
            focus: "All three delt heads, traps",
            exercises: [
              { exerciseId: "ex-overhead-press", sets: [{ targetReps: 10 }, { targetReps: 8 }, { targetReps: 6 }, { targetReps: 6 }], restSeconds: 150 },
              { exerciseId: "ex-seated-db-press", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-lateral-raise", sets: setsOf(4, 15), restSeconds: 45 },
              { exerciseId: "ex-front-raise", sets: setsOf(3, 15), restSeconds: 45 },
              { exerciseId: "ex-rear-delt-fly", sets: setsOf(3, 15), restSeconds: 45 },
              { exerciseId: "ex-barbell-shrug", sets: setsOf(3, 12), restSeconds: 60 },
            ],
          },
          {
            name: "Arm Day",
            focus: "Biceps, triceps",
            exercises: [
              { exerciseId: "ex-barbell-curl", sets: setsOf(4, 10), restSeconds: 75 },
              { exerciseId: "ex-close-grip-bench", sets: setsOf(4, 8), restSeconds: 90 },
              { exerciseId: "ex-ez-bar-curl", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-triceps-pushdown", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-hammer-curl", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-skull-crusher", sets: setsOf(3, 12), restSeconds: 60 },
            ],
          },
          {
            name: "Leg Day",
            focus: "Quads, hamstrings, glutes, calves",
            exercises: [
              { exerciseId: "ex-back-squat", sets: [{ targetReps: 10 }, { targetReps: 8 }, { targetReps: 6 }, { targetReps: 6 }], restSeconds: 180 },
              { exerciseId: "ex-romanian-deadlift", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-leg-press", sets: setsOf(3, 12), restSeconds: 90 },
              { exerciseId: "ex-leg-extension", sets: setsOf(3, 15), restSeconds: 60 },
              { exerciseId: "ex-lying-leg-curl", sets: setsOf(3, 15), restSeconds: 60 },
              { exerciseId: "ex-standing-calf-raise", sets: setsOf(4, 15), restSeconds: 45 },
            ],
          },
        ],
      },
    ],
  },
  {
    type: "full-body",
    name: "Full Body",
    level: "beginner",
    description: "Every major movement pattern trained each session — ideal for beginners building a base, or anyone who can only commit to 2-3 sessions a week and wants full-body coverage every time.",
    recommendedDaysPerWeek: [2, 3],
    variants: [
      {
        daysPerWeek: 3,
        notes: "Run Squat & Press, Hinge & Pull, Press & Row in order with a rest day between each session, e.g. Mon/Wed/Fri. Each day covers a squat or hinge pattern, a push, a pull, and core work, so no single day is a 'leg day' or 'chest day' — the whole body is hit every time.",
        days: [
          {
            name: "Squat & Press",
            focus: "Squat pattern, horizontal push/pull",
            exercises: [
              { exerciseId: "ex-back-squat", sets: [{ targetReps: 10 }, { targetReps: 8 }, { targetReps: 8 }], restSeconds: 150 },
              { exerciseId: "ex-bench-press", sets: setsOf(3, 8), restSeconds: 120 },
              { exerciseId: "ex-barbell-row", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-lateral-raise", sets: setsOf(3, 15), restSeconds: 45 },
              { exerciseId: "ex-plank", sets: timed(3, 45), restSeconds: 45 },
            ],
          },
          {
            name: "Hinge & Pull",
            focus: "Hinge pattern, vertical push/pull",
            exercises: [
              { exerciseId: "ex-romanian-deadlift", sets: [{ targetReps: 10 }, { targetReps: 10 }, { targetReps: 8 }], restSeconds: 150 },
              { exerciseId: "ex-seated-db-press", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-lat-pulldown", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-barbell-curl", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-russian-twist", sets: setsOf(3, 20), restSeconds: 45 },
            ],
          },
          {
            name: "Press & Row",
            focus: "Leg press pattern, incline push, row",
            exercises: [
              { exerciseId: "ex-leg-press", sets: [{ targetReps: 12 }, { targetReps: 12 }, { targetReps: 10 }], restSeconds: 120 },
              { exerciseId: "ex-incline-db-press", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-seated-cable-row", sets: setsOf(3, 12), restSeconds: 75 },
              { exerciseId: "ex-triceps-pushdown", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-hanging-knee-raise", sets: setsOf(3, 12), restSeconds: 45 },
            ],
          },
        ],
      },
      {
        daysPerWeek: 2,
        notes: "For a 2-day-per-week schedule, alternate Squat & Press and Hinge & Pull week to week so each session still covers a full-body pattern. Best suited to maintenance or a very time-constrained schedule rather than active muscle building.",
        days: [
          {
            name: "Squat & Press",
            focus: "Squat pattern, horizontal push/pull",
            exercises: [
              { exerciseId: "ex-back-squat", sets: [{ targetReps: 10 }, { targetReps: 8 }, { targetReps: 8 }], restSeconds: 150 },
              { exerciseId: "ex-bench-press", sets: setsOf(3, 8), restSeconds: 120 },
              { exerciseId: "ex-barbell-row", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-lateral-raise", sets: setsOf(3, 15), restSeconds: 45 },
              { exerciseId: "ex-plank", sets: timed(3, 45), restSeconds: 45 },
            ],
          },
          {
            name: "Hinge & Pull",
            focus: "Hinge pattern, vertical push/pull",
            exercises: [
              { exerciseId: "ex-romanian-deadlift", sets: [{ targetReps: 10 }, { targetReps: 10 }, { targetReps: 8 }], restSeconds: 150 },
              { exerciseId: "ex-seated-db-press", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-lat-pulldown", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-barbell-curl", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-russian-twist", sets: setsOf(3, 20), restSeconds: 45 },
            ],
          },
        ],
      },
    ],
  },
  {
    type: "body-part",
    name: "Body Part Split",
    level: "intermediate",
    description: "Four focused days — each muscle pair gets a full session of volume with machine and cable work for clean isolation. The 4-day cousin of the Bro Split: one less gym day, shoulders get their own session, and legs are never squeezed out.",
    recommendedDaysPerWeek: [4],
    variants: [
      {
        daysPerWeek: 4,
        notes: "Spread the four days across the week with rest wherever life needs it — e.g. Mon/Tue/Thu/Sat. Rep numbers are targets, not caps: taking the last set of any isolation past the target to failure is exactly how this split is meant to be run.",
        days: [
          {
            name: "Chest & Triceps",
            focus: "Pressing volume, then triceps to finish",
            exercises: [
              { exerciseId: "ex-bench-press", sets: [{ targetReps: 10 }, { targetReps: 8 }, { targetReps: 8 }, { targetReps: 6 }], restSeconds: 120 },
              { exerciseId: "ex-incline-db-press", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-pec-deck", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-low-high-cable-fly", sets: setsOf(3, 15), restSeconds: 60 },
              { exerciseId: "ex-triceps-pushdown", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-cable-overhead-triceps-ext", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-bench-dip", sets: amrap(2), restSeconds: 60 },
            ],
          },
          {
            name: "Back & Biceps",
            focus: "Width, then thickness, then arms",
            exercises: [
              { exerciseId: "ex-lat-pulldown", sets: [{ targetReps: 12 }, { targetReps: 10 }, { targetReps: 10 }, { targetReps: 8 }], restSeconds: 90 },
              { exerciseId: "ex-machine-row", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-seated-cable-row", sets: setsOf(3, 12), restSeconds: 75 },
              { exerciseId: "ex-straight-arm-pulldown", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-preacher-curl", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-cable-curl", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-hammer-curl", sets: amrap(2), restSeconds: 60 },
            ],
          },
          {
            name: "Legs",
            focus: "Quads, hamstrings, glutes, calves",
            exercises: [
              { exerciseId: "ex-hack-squat", sets: [{ targetReps: 12 }, { targetReps: 10 }, { targetReps: 10 }, { targetReps: 8 }], restSeconds: 120 },
              { exerciseId: "ex-leg-press", sets: setsOf(3, 12), restSeconds: 90 },
              { exerciseId: "ex-romanian-deadlift", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-leg-extension", sets: setsOf(3, 15), restSeconds: 60 },
              { exerciseId: "ex-seated-leg-curl", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-standing-calf-raise", sets: setsOf(4, 15), restSeconds: 45 },
            ],
          },
          {
            name: "Shoulders",
            focus: "All three delt heads, traps, core to close",
            exercises: [
              { exerciseId: "ex-machine-shoulder-press", sets: [{ targetReps: 12 }, { targetReps: 10 }, { targetReps: 10 }, { targetReps: 8 }], restSeconds: 90 },
              { exerciseId: "ex-cable-lateral-raise", sets: setsOf(4, 15), restSeconds: 45 },
              { exerciseId: "ex-reverse-pec-deck", sets: setsOf(3, 15), restSeconds: 60 },
              { exerciseId: "ex-front-raise", sets: setsOf(3, 12), restSeconds: 45 },
              { exerciseId: "ex-barbell-shrug", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-cable-crunch", sets: setsOf(3, 15), restSeconds: 45 },
            ],
          },
        ],
      },
    ],
  },
  {
    type: "fat-loss",
    name: "Fat Loss Focus",
    level: "beginner",
    description: "Strength and conditioning woven together: lifting preserves muscle while the engine days drive the calorie burn. Built for weight loss and general fitness — high energy, never boring.",
    recommendedDaysPerWeek: [4, 5],
    variants: [
      {
        daysPerWeek: 5,
        notes: "Alternate lifting and conditioning: strength Mon, engine Tue, upper Wed, engine Thu, lower Fri. Conditioning days run circuit-style — the listed rest is between exercises; keep moving inside each round. Pair with a modest calorie deficit; the training protects the muscle.",
        days: [
          {
            name: "Full Body Strength",
            focus: "Big patterns, moderate loads — muscle is what keeps the burn",
            exercises: [
              { exerciseId: "ex-goblet-squat", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-db-bench-press", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-single-arm-db-row", sets: setsOf(3, 10), restSeconds: 75 },
              { exerciseId: "ex-romanian-deadlift", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-plank", sets: timed(3, 40), restSeconds: 45 },
            ],
          },
          {
            name: "Circuit Burner",
            focus: "Circuit style — move briskly, rest fully only between rounds",
            exercises: [
              { exerciseId: "ex-kettlebell-swing", sets: setsOf(4, 15), restSeconds: 30 },
              { exerciseId: "ex-jump-rope", sets: timed(4, 60), restSeconds: 45 },
              { exerciseId: "ex-mountain-climber", sets: timed(4, 30), restSeconds: 30 },
              { exerciseId: "ex-sled-push", sets: timed(4, 20), restSeconds: 60 },
              { exerciseId: "ex-farmers-carry", sets: timed(3, 40), restSeconds: 60 },
            ],
          },
          {
            name: "Upper Body",
            focus: "Push-pull pairs, finishers to failure",
            exercises: [
              { exerciseId: "ex-incline-db-press", sets: setsOf(3, 10), restSeconds: 75 },
              { exerciseId: "ex-lat-pulldown", sets: setsOf(3, 12), restSeconds: 75 },
              { exerciseId: "ex-seated-db-press", sets: setsOf(3, 10), restSeconds: 75 },
              { exerciseId: "ex-seated-cable-row", sets: setsOf(3, 12), restSeconds: 75 },
              { exerciseId: "ex-triceps-pushdown", sets: amrap(2), restSeconds: 45 },
              { exerciseId: "ex-db-curl", sets: amrap(2), restSeconds: 45 },
            ],
          },
          {
            name: "Interval Engine",
            focus: "Intervals — hard minute, easy recovery, repeat",
            exercises: [
              { exerciseId: "ex-rowing-machine", sets: timed(5, 60), restSeconds: 60 },
              { exerciseId: "ex-thruster", sets: setsOf(4, 12), restSeconds: 45 },
              { exerciseId: "ex-jump-rope", sets: timed(4, 60), restSeconds: 45 },
              { exerciseId: "ex-hollow-body-hold", sets: timed(3, 30), restSeconds: 45 },
            ],
          },
          {
            name: "Lower Body",
            focus: "Legs and glutes with short rests",
            exercises: [
              { exerciseId: "ex-leg-press", sets: setsOf(3, 12), restSeconds: 75 },
              { exerciseId: "ex-walking-lunge", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-lying-leg-curl", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-glute-bridge", sets: setsOf(3, 15), restSeconds: 60 },
              { exerciseId: "ex-standing-calf-raise", sets: setsOf(3, 15), restSeconds: 45 },
              { exerciseId: "ex-v-up", sets: amrap(3), restSeconds: 45 },
            ],
          },
        ],
      },
      {
        daysPerWeek: 4,
        notes: "The time-constrained version: one conditioning day instead of two. Keep walks or easy cardio on off days if fat loss is the priority.",
        days: [
          {
            name: "Full Body Strength",
            focus: "Big patterns, moderate loads — muscle is what keeps the burn",
            exercises: [
              { exerciseId: "ex-goblet-squat", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-db-bench-press", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-single-arm-db-row", sets: setsOf(3, 10), restSeconds: 75 },
              { exerciseId: "ex-romanian-deadlift", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-plank", sets: timed(3, 40), restSeconds: 45 },
            ],
          },
          {
            name: "Circuit Burner",
            focus: "Circuit style — move briskly, rest fully only between rounds",
            exercises: [
              { exerciseId: "ex-kettlebell-swing", sets: setsOf(4, 15), restSeconds: 30 },
              { exerciseId: "ex-jump-rope", sets: timed(4, 60), restSeconds: 45 },
              { exerciseId: "ex-mountain-climber", sets: timed(4, 30), restSeconds: 30 },
              { exerciseId: "ex-sled-push", sets: timed(4, 20), restSeconds: 60 },
              { exerciseId: "ex-farmers-carry", sets: timed(3, 40), restSeconds: 60 },
            ],
          },
          {
            name: "Upper Body",
            focus: "Push-pull pairs, finishers to failure",
            exercises: [
              { exerciseId: "ex-incline-db-press", sets: setsOf(3, 10), restSeconds: 75 },
              { exerciseId: "ex-lat-pulldown", sets: setsOf(3, 12), restSeconds: 75 },
              { exerciseId: "ex-seated-db-press", sets: setsOf(3, 10), restSeconds: 75 },
              { exerciseId: "ex-seated-cable-row", sets: setsOf(3, 12), restSeconds: 75 },
              { exerciseId: "ex-triceps-pushdown", sets: amrap(2), restSeconds: 45 },
              { exerciseId: "ex-db-curl", sets: amrap(2), restSeconds: 45 },
            ],
          },
          {
            name: "Lower Body",
            focus: "Legs and glutes with short rests",
            exercises: [
              { exerciseId: "ex-leg-press", sets: setsOf(3, 12), restSeconds: 75 },
              { exerciseId: "ex-walking-lunge", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-lying-leg-curl", sets: setsOf(3, 12), restSeconds: 60 },
              { exerciseId: "ex-glute-bridge", sets: setsOf(3, 15), restSeconds: 60 },
              { exerciseId: "ex-standing-calf-raise", sets: setsOf(3, 15), restSeconds: 45 },
              { exerciseId: "ex-v-up", sets: amrap(3), restSeconds: 45 },
            ],
          },
        ],
      },
    ],
  },
  {
    type: "arnold",
    name: "Arnold Split",
    level: "advanced",
    description: "The six-day split from Arnold's competition years: chest with back, shoulders with arms, legs with lower back — each pairing hit twice a week at heroic volume. For experienced lifters with recovery to spare.",
    recommendedDaysPerWeek: [6],
    variants: [
      {
        daysPerWeek: 6,
        notes: "Every rep count is an 'up to' target in Arnold's own style — the last set of anything can go to failure. The split is famously flexible: swap movements for your equipment and joints (chin-ups → lat pulldown, barbell press → dumbbell press) as long as the pattern stays. Sunday off.",
        days: [
          {
            name: "Chest & Back",
            focus: "Antagonist pairing — press and pull in one session",
            exercises: [
              { exerciseId: "ex-bench-press", sets: setsOf(4, 10), restSeconds: 120 },
              { exerciseId: "ex-incline-bench-press", sets: setsOf(4, 10), restSeconds: 120 },
              { exerciseId: "ex-db-pullover", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-chin-up", sets: amrap(4), restSeconds: 90 },
              { exerciseId: "ex-barbell-row", sets: setsOf(4, 10), restSeconds: 90 },
              { exerciseId: "ex-deadlift", sets: setsOf(3, 10), restSeconds: 180 },
              { exerciseId: "ex-crunch", sets: setsOf(5, 25), restSeconds: 30 },
            ],
          },
          {
            name: "Shoulders & Arms",
            focus: "Delts, then biceps-triceps supersets Arnold-style",
            exercises: [
              { exerciseId: "ex-db-clean-and-press", sets: setsOf(4, 10), restSeconds: 120 },
              { exerciseId: "ex-lateral-raise", sets: setsOf(4, 10), restSeconds: 60 },
              { exerciseId: "ex-upright-row", sets: setsOf(4, 10), restSeconds: 75 },
              { exerciseId: "ex-overhead-press", sets: setsOf(4, 10), restSeconds: 90 },
              { exerciseId: "ex-barbell-curl", sets: setsOf(4, 10), restSeconds: 60 },
              { exerciseId: "ex-db-curl", sets: setsOf(4, 10), restSeconds: 60 },
              { exerciseId: "ex-close-grip-bench", sets: setsOf(4, 10), restSeconds: 90 },
              { exerciseId: "ex-overhead-triceps-ext", sets: setsOf(4, 10), restSeconds: 60 },
              { exerciseId: "ex-wrist-curl", sets: setsOf(4, 10), restSeconds: 45 },
              { exerciseId: "ex-reverse-curl", sets: setsOf(4, 10), restSeconds: 45 },
              { exerciseId: "ex-reverse-crunch", sets: setsOf(5, 25), restSeconds: 30 },
            ],
          },
          {
            name: "Legs & Lower Back",
            focus: "Squat, hinge, and the posterior chain",
            exercises: [
              { exerciseId: "ex-back-squat", sets: setsOf(4, 10), restSeconds: 150 },
              { exerciseId: "ex-walking-lunge", sets: setsOf(4, 10), restSeconds: 90 },
              { exerciseId: "ex-lying-leg-curl", sets: setsOf(4, 10), restSeconds: 60 },
              { exerciseId: "ex-stiff-leg-deadlift", sets: setsOf(4, 10), restSeconds: 120 },
              { exerciseId: "ex-good-morning", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-standing-calf-raise", sets: setsOf(4, 15), restSeconds: 45 },
              { exerciseId: "ex-crunch", sets: setsOf(5, 25), restSeconds: 30 },
            ],
          },
          {
            name: "Chest & Back",
            focus: "Antagonist pairing — press and pull in one session",
            exercises: [
              { exerciseId: "ex-bench-press", sets: setsOf(4, 10), restSeconds: 120 },
              { exerciseId: "ex-incline-bench-press", sets: setsOf(4, 10), restSeconds: 120 },
              { exerciseId: "ex-db-pullover", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-chin-up", sets: amrap(4), restSeconds: 90 },
              { exerciseId: "ex-barbell-row", sets: setsOf(4, 10), restSeconds: 90 },
              { exerciseId: "ex-deadlift", sets: setsOf(3, 10), restSeconds: 180 },
              { exerciseId: "ex-crunch", sets: setsOf(5, 25), restSeconds: 30 },
            ],
          },
          {
            name: "Shoulders & Arms",
            focus: "Delts, then biceps-triceps supersets Arnold-style",
            exercises: [
              { exerciseId: "ex-db-clean-and-press", sets: setsOf(4, 10), restSeconds: 120 },
              { exerciseId: "ex-lateral-raise", sets: setsOf(4, 10), restSeconds: 60 },
              { exerciseId: "ex-upright-row", sets: setsOf(4, 10), restSeconds: 75 },
              { exerciseId: "ex-overhead-press", sets: setsOf(4, 10), restSeconds: 90 },
              { exerciseId: "ex-barbell-curl", sets: setsOf(4, 10), restSeconds: 60 },
              { exerciseId: "ex-db-curl", sets: setsOf(4, 10), restSeconds: 60 },
              { exerciseId: "ex-close-grip-bench", sets: setsOf(4, 10), restSeconds: 90 },
              { exerciseId: "ex-overhead-triceps-ext", sets: setsOf(4, 10), restSeconds: 60 },
              { exerciseId: "ex-wrist-curl", sets: setsOf(4, 10), restSeconds: 45 },
              { exerciseId: "ex-reverse-curl", sets: setsOf(4, 10), restSeconds: 45 },
              { exerciseId: "ex-reverse-crunch", sets: setsOf(5, 25), restSeconds: 30 },
            ],
          },
          {
            name: "Legs & Lower Back",
            focus: "Squat, hinge, and the posterior chain",
            exercises: [
              { exerciseId: "ex-back-squat", sets: setsOf(4, 10), restSeconds: 150 },
              { exerciseId: "ex-walking-lunge", sets: setsOf(4, 10), restSeconds: 90 },
              { exerciseId: "ex-lying-leg-curl", sets: setsOf(4, 10), restSeconds: 60 },
              { exerciseId: "ex-stiff-leg-deadlift", sets: setsOf(4, 10), restSeconds: 120 },
              { exerciseId: "ex-good-morning", sets: setsOf(3, 10), restSeconds: 90 },
              { exerciseId: "ex-standing-calf-raise", sets: setsOf(4, 15), restSeconds: 45 },
              { exerciseId: "ex-crunch", sets: setsOf(5, 25), restSeconds: 30 },
            ],
          },
        ],
      },
    ],
  },
];

export function findProgram(type: ProgramType): ProgramDefinition | undefined {
  return programLibrary.find((program) => program.type === type);
}
