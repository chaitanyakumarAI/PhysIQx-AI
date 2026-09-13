import type { ProfileGoal, ExperienceLevel, GoalBodyShape } from "@/types/profile";
import type { ProgramType } from "@/types/training";
import type {
  ProgramDefinition,
  ProgramVariant,
  ProgramDay,
  ProgramLevel,
} from "@/data/programs";
import type {
  WorkoutTemplateExercise,
  TemplateSet,
} from "@/types/workoutTemplate";
import { setsOf } from "@/types/workoutTemplate";
import type { UserPlan, PlanDay } from "@/types/plan";
import type { CompletedSessionSummary } from "@/store/sessionStore";
import { enforceTwoSentences } from "@/types/insight";

export interface ProgramGenerationParams {
  goal: ProfileGoal;
  experienceLevel: ExperienceLevel;
  daysPerWeek: number;
  targetBodyShape?: GoalBodyShape;
  preferredSplit?: ProgramType;
  sessionHistory?: CompletedSessionSummary[];
}

export interface GeneratedAdaptiveProgram {
  program: ProgramDefinition;
  userPlan: UserPlan;
  rationale: string;
  targetFocus: string;
  weeklyVolumeSets: number;
}

export interface ProgramDifficultyAdaptation {
  adjustmentType: "progressive_overload" | "deload" | "maintain" | "volume_increase";
  rationale: string;
  modifiedExercises: WorkoutTemplateExercise[];
  recommendedRestMultiplier: number;
}

export interface ScoreTrajectoryPoint {
  weekNumber: number;
  date: string;
  projectedScore: number;
  confidenceLower: number;
  confidenceUpper: number;
  isForecast: boolean;
}

/**
 * Maps experience level to standard program level.
 */
function toProgramLevel(exp: ExperienceLevel): ProgramLevel {
  if (exp === "advanced") return "advanced";
  if (exp === "intermediate") return "intermediate";
  return "beginner";
}

/**
 * Builds exercise set prescriptions tailored to user goal and experience.
 */
function buildSets(
  goal: ProfileGoal,
  isCompound: boolean,
  experience: ExperienceLevel,
): { sets: TemplateSet[]; restSeconds: number } {
  if (goal === "bulk") {
    if (isCompound) {
      const reps = experience === "advanced" ? 6 : 8;
      const count = experience === "beginner" ? 3 : 4;
      return { sets: setsOf(count, reps), restSeconds: 120 };
    }
    return { sets: setsOf(3, 10), restSeconds: 75 };
  }

  if (goal === "cut") {
    if (isCompound) {
      return { sets: setsOf(3, 8), restSeconds: 75 };
    }
    return { sets: setsOf(3, 12), restSeconds: 45 };
  }

  if (goal === "endurance") {
    if (isCompound) {
      return { sets: setsOf(3, 12), restSeconds: 60 };
    }
    return { sets: setsOf(3, 15), restSeconds: 45 };
  }

  // Maintain / Balanced
  if (isCompound) {
    return { sets: setsOf(3, 8), restSeconds: 90 };
  }
  return { sets: setsOf(3, 10), restSeconds: 60 };
}

/**
 * Generates day blueprints based on target frequency (2-6 days).
 */
function generateDaysForFrequency(
  daysPerWeek: number,
  goal: ProfileGoal,
  experience: ExperienceLevel,
): ProgramDay[] {
  const compound = (id: string) => {
    const { sets, restSeconds } = buildSets(goal, true, experience);
    return { exerciseId: id, sets, restSeconds };
  };

  const accessory = (id: string) => {
    const { sets, restSeconds } = buildSets(goal, false, experience);
    return { exerciseId: id, sets, restSeconds };
  };

  const clampedDays = Math.max(2, Math.min(6, Math.round(daysPerWeek)));

  if (clampedDays === 2) {
    return [
      {
        name: "Full Body A",
        focus: "Squat mechanics, horizontal press, and upper back stability",
        exercises: [
          compound("ex-back-squat"),
          compound("ex-bench-press"),
          compound("ex-barbell-row"),
          accessory("ex-lateral-raise"),
          accessory("ex-plank"),
        ],
      },
      {
        name: "Full Body B",
        focus: "Posterior chain hinge, vertical pressing, and lats",
        exercises: [
          compound("ex-romanian-deadlift"),
          compound("ex-overhead-press"),
          compound("ex-lat-pulldown"),
          accessory("ex-db-curl"),
          accessory("ex-triceps-pushdown"),
        ],
      },
    ];
  }

  if (clampedDays === 3) {
    return [
      {
        name: "Push-Heavy",
        focus: "Chest drive, anterior delts, and triceps lockout",
        exercises: [
          compound("ex-bench-press"),
          compound("ex-incline-db-press"),
          compound("ex-overhead-press"),
          accessory("ex-cable-fly"),
          accessory("ex-lateral-raise"),
          accessory("ex-triceps-pushdown"),
        ],
      },
      {
        name: "Pull & Posture",
        focus: "Lat width, mid-trap thickness, and biceps peak",
        exercises: [
          compound("ex-barbell-row"),
          compound("ex-lat-pulldown"),
          compound("ex-seated-cable-row"),
          accessory("ex-face-pull"),
          accessory("ex-barbell-curl"),
          accessory("ex-hammer-curl"),
        ],
      },
      {
        name: "Legs & Core",
        focus: "Quad extension, hamstring hinge, and core stabilization",
        exercises: [
          compound("ex-back-squat"),
          compound("ex-romanian-deadlift"),
          compound("ex-leg-press"),
          accessory("ex-lying-leg-curl"),
          accessory("ex-standing-calf-raise"),
          accessory("ex-plank"),
        ],
      },
    ];
  }

  if (clampedDays === 4) {
    return [
      {
        name: "Upper Power",
        focus: "Heavy horizontal pressing and horizontal pulling",
        exercises: [
          compound("ex-bench-press"),
          compound("ex-barbell-row"),
          compound("ex-overhead-press"),
          accessory("ex-lat-pulldown"),
          accessory("ex-lateral-raise"),
          accessory("ex-triceps-pushdown"),
        ],
      },
      {
        name: "Lower Power",
        focus: "Heavy knee flexion and posterior chain hinge",
        exercises: [
          compound("ex-back-squat"),
          compound("ex-romanian-deadlift"),
          compound("ex-leg-press"),
          accessory("ex-lying-leg-curl"),
          accessory("ex-standing-calf-raise"),
        ],
      },
      {
        name: "Upper Hypertrophy",
        focus: "Incline chest angle, vertical pull, and arm accessories",
        exercises: [
          compound("ex-incline-db-press"),
          compound("ex-seated-cable-row"),
          accessory("ex-cable-fly"),
          accessory("ex-face-pull"),
          accessory("ex-db-curl"),
          accessory("ex-overhead-triceps-ext"),
        ],
      },
      {
        name: "Lower Hypertrophy",
        focus: "Unilateral leg drive and posterior chain isolation",
        exercises: [
          compound("ex-leg-press"),
          compound("ex-walking-lunge"),
          accessory("ex-leg-extension"),
          accessory("ex-lying-leg-curl"),
          accessory("ex-cable-crunch"),
        ],
      },
    ];
  }

  if (clampedDays === 5) {
    return [
      {
        name: "Push",
        focus: "Chest, front/side delts, and triceps volume",
        exercises: [
          compound("ex-bench-press"),
          compound("ex-incline-db-press"),
          accessory("ex-cable-fly"),
          accessory("ex-lateral-raise"),
          accessory("ex-triceps-pushdown"),
        ],
      },
      {
        name: "Pull",
        focus: "Lat width, rhomboids, and biceps peak",
        exercises: [
          compound("ex-barbell-row"),
          compound("ex-lat-pulldown"),
          accessory("ex-seated-cable-row"),
          accessory("ex-face-pull"),
          accessory("ex-barbell-curl"),
        ],
      },
      {
        name: "Legs",
        focus: "Squat mechanics, quad dominance, and calves",
        exercises: [
          compound("ex-back-squat"),
          compound("ex-leg-press"),
          accessory("ex-leg-extension"),
          accessory("ex-standing-calf-raise"),
          accessory("ex-plank"),
        ],
      },
      {
        name: "Upper Precision",
        focus: "Overhead press strength, upper chest, and arms",
        exercises: [
          compound("ex-overhead-press"),
          compound("ex-incline-db-press"),
          accessory("ex-lat-pulldown"),
          accessory("ex-hammer-curl"),
          accessory("ex-overhead-triceps-ext"),
        ],
      },
      {
        name: "Lower Posterior",
        focus: "Hamstring hinge, glute drive, and core trunk rigidity",
        exercises: [
          compound("ex-romanian-deadlift"),
          compound("ex-walking-lunge"),
          accessory("ex-lying-leg-curl"),
          accessory("ex-standing-calf-raise"),
          accessory("ex-cable-crunch"),
        ],
      },
    ];
  }

  // 6 Days — Full PPL x 2 Cycle
  return [
    {
      name: "Push A (Strength)",
      focus: "Barbell bench press heavy foundation and vertical delt drive",
      exercises: [
        compound("ex-bench-press"),
        compound("ex-overhead-press"),
        accessory("ex-incline-db-press"),
        accessory("ex-lateral-raise"),
        accessory("ex-triceps-pushdown"),
      ],
    },
    {
      name: "Pull A (Strength)",
      focus: "Bent-over row power and weighted lat recruitment",
      exercises: [
        compound("ex-barbell-row"),
        compound("ex-lat-pulldown"),
        accessory("ex-seated-cable-row"),
        accessory("ex-face-pull"),
        accessory("ex-barbell-curl"),
      ],
    },
    {
      name: "Legs A (Strength)",
      focus: "Back squat depth, heavy quad overload, and calves",
      exercises: [
        compound("ex-back-squat"),
        compound("ex-romanian-deadlift"),
        accessory("ex-leg-press"),
        accessory("ex-lying-leg-curl"),
        accessory("ex-standing-calf-raise"),
      ],
    },
    {
      name: "Push B (Hypertrophy)",
      focus: "Incline dumbbell pressing and cable isolation angles",
      exercises: [
        compound("ex-incline-db-press"),
        compound("ex-seated-db-press"),
        accessory("ex-cable-fly"),
        accessory("ex-cable-lateral-raise"),
        accessory("ex-overhead-triceps-ext"),
      ],
    },
    {
      name: "Pull B (Hypertrophy)",
      focus: "Unilateral rows, pulldowns, and bicep peak isolation",
      exercises: [
        compound("ex-single-arm-db-row"),
        compound("ex-lat-pulldown"),
        accessory("ex-face-pull"),
        accessory("ex-hammer-curl"),
        accessory("ex-cable-curl"),
      ],
    },
    {
      name: "Legs B (Hypertrophy)",
      focus: "Leg press volume, walking lunges, and hamstring curls",
      exercises: [
        compound("ex-leg-press"),
        compound("ex-walking-lunge"),
        accessory("ex-leg-extension"),
        accessory("ex-lying-leg-curl"),
        accessory("ex-seated-calf-raise"),
      ],
    },
  ];
}

/**
 * Builds coaching rationale enforcing the <= 2 sentence UI contract.
 */
function buildRationale(
  goal: ProfileGoal,
  daysPerWeek: number,
  experience: ExperienceLevel,
): string {
  const goalDescriptions: Record<ProfileGoal, string> = {
    bulk: "Engineered for maximum mechanical tension and hypertrophy volume across your weekly schedule.",
    cut: "Structured with heightened training density and controlled rest intervals to preserve lean muscle in a deficit.",
    endurance: "Programmed with elevated repetition thresholds and shorter rest windows to optimize muscular work capacity.",
    maintain: "Calibrated for steady muscular stimulus and joint health across balanced push-pull movement planes.",
  };

  const sentence1 = goalDescriptions[goal];
  const sentence2 = `Your ${daysPerWeek}-day split is optimized for ${experience} progression with balanced weekly frequency.`;
  return enforceTwoSentences(`${sentence1} ${sentence2}`);
}

/**
 * Generates an adaptive, structured Program and UserPlan matching all contracts.
 */
export function generateAdaptiveProgram(
  params: ProgramGenerationParams,
): GeneratedAdaptiveProgram {
  const { goal, experienceLevel, daysPerWeek } = params;
  const clampedDays = Math.max(2, Math.min(6, Math.round(daysPerWeek)));
  const days = generateDaysForFrequency(clampedDays, goal, experienceLevel);

  let totalSets = 0;
  days.forEach((d) => {
    d.exercises.forEach((ex) => {
      totalSets += ex.sets.length;
    });
  });

  const variant: ProgramVariant = {
    daysPerWeek: clampedDays,
    notes: `Adaptive AI program generated for ${goal} goal at ${experienceLevel} level.`,
    days,
  };

  const program: ProgramDefinition = {
    type: "ai",
    name: "PhysIQ Adaptive Engine",
    level: toProgramLevel(experienceLevel),
    description: `Customized ${clampedDays}-day split designed dynamically for your active ${goal} goal and fatigue profile.`,
    recommendedDaysPerWeek: [clampedDays],
    variants: [variant],
  };

  const userPlanDays: PlanDay[] = days.map((day, idx) => ({
    id: `plan-day-ai-${idx + 1}`,
    name: day.name,
    exercises: day.exercises,
  }));

  const userPlan: UserPlan = {
    id: `plan-ai-adaptive-${Date.now()}`,
    name: `Adaptive ${goal.toUpperCase()} Split (${clampedDays}D)`,
    days: userPlanDays,
  };

  const rationale = buildRationale(goal, clampedDays, experienceLevel);

  return {
    program,
    userPlan,
    rationale,
    targetFocus: days[0]?.name ?? "General Conditioning",
    weeklyVolumeSets: totalSets,
  };
}

/**
 * Evaluates session history to adapt difficulty, scaling volume or rest.
 */
export function adaptProgramDifficulty(
  program: ProgramDefinition,
  history: CompletedSessionSummary[],
): ProgramDifficultyAdaptation {
  const recentSessions = history.slice(0, 5);
  const baseExercises = program.variants[0]?.days[0]?.exercises ?? [];

  if (recentSessions.length === 0) {
    return {
      adjustmentType: "maintain",
      rationale: enforceTwoSentences(
        "No historical sessions logged yet. Baseline training targets remain calibrated to your starting onboarding profile."
      ),
      modifiedExercises: baseExercises,
      recommendedRestMultiplier: 1.0,
    };
  }

  // Calculate average RPE if available
  const sessionsWithRpe = recentSessions.filter((s) => s.avgRpe !== undefined && s.avgRpe > 0);
  const avgRpe =
    sessionsWithRpe.length > 0
      ? sessionsWithRpe.reduce((sum, s) => sum + (s.avgRpe ?? 0), 0) / sessionsWithRpe.length
      : 8.0;

  // 1. High systemic fatigue detection -> Prescribe Deload / Recovery Mod
  if (avgRpe >= 9.0) {
    const modified = baseExercises.map((ex) => ({
      ...ex,
      sets: ex.sets.slice(0, Math.max(1, ex.sets.length - 1)),
      restSeconds: Math.round(ex.restSeconds * 1.2),
    }));

    return {
      adjustmentType: "deload",
      rationale: enforceTwoSentences(
        `Average exertion of RPE ${avgRpe.toFixed(1)} indicates accumulated fatigue. Volume reduced by one set per movement with 20% extended rest to ensure recovery.`
      ),
      modifiedExercises: modified,
      recommendedRestMultiplier: 1.2,
    };
  }

  // 2. Low exertion detection -> Drive progressive overload
  if (avgRpe <= 7.0 && recentSessions.length >= 3) {
    const modified = baseExercises.map((ex) => ({
      ...ex,
      sets: [...ex.sets, { targetReps: ex.sets[ex.sets.length - 1]?.targetReps ?? 8 }],
      restSeconds: ex.restSeconds,
    }));

    return {
      adjustmentType: "progressive_overload",
      rationale: enforceTwoSentences(
        `Low exertion average of RPE ${avgRpe.toFixed(1)} confirms strong recovery capacity. Added one progressive working set to accelerate overload adaptations.`
      ),
      modifiedExercises: modified,
      recommendedRestMultiplier: 1.0,
    };
  }

  // 3. Steady progression
  return {
    adjustmentType: "maintain",
    rationale: enforceTwoSentences(
      `Recent training exertion is dialed into the optimal adaptive window at RPE ${avgRpe.toFixed(1)}. Maintain current set volume and advance weights progressively.`
    ),
    modifiedExercises: baseExercises,
    recommendedRestMultiplier: 1.0,
  };
}

/**
 * Projects future PhysIQ Score trajectory based on consistency and current metrics.
 */
export function forecastScoreTrajectory(
  currentScore: number,
  history: CompletedSessionSummary[],
  goal: ProfileGoal,
  weeksAhead: number = 6,
): ScoreTrajectoryPoint[] {
  const points: ScoreTrajectoryPoint[] = [];
  const safeCurrent = Math.max(10, Math.min(99, Math.round(currentScore)));

  // Adherence rate from recent history
  const recentCount = history.filter((s) => s.status === "completed").length;
  const consistencyFactor = recentCount >= 4 ? 1.0 : recentCount >= 2 ? 0.75 : 0.5;

  let projected = safeCurrent;
  const now = new Date();

  for (let week = 1; week <= weeksAhead; week++) {
    // Law of diminishing returns: growth rate scales with headroom (100 - current)
    const headroom = 100 - projected;
    const baseWeeklyGain = (headroom * 0.08) * consistencyFactor;
    projected = Math.min(99, Math.round((projected + baseWeeklyGain) * 10) / 10);

    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + week * 7);
    const dateStr = futureDate.toISOString().split("T")[0]!;

    const variance = (week * 0.8);
    const lower = Math.max(safeCurrent, Math.round((projected - variance) * 10) / 10);
    const upper = Math.min(100, Math.round((projected + variance) * 10) / 10);

    points.push({
      weekNumber: week,
      date: dateStr,
      projectedScore: Math.round(projected),
      confidenceLower: lower,
      confidenceUpper: upper,
      isForecast: true,
    });
  }

  return points;
}

/**
 * Builds the canonical multi-variant AI Coach program definition for Train screen and static routes.
 */
export function buildAiCoachProgramDefinition(
  goal: ProfileGoal = "bulk",
  experienceLevel: ExperienceLevel = "intermediate",
): ProgramDefinition {
  const frequencies = [3, 4, 5, 6];
  const variants: ProgramVariant[] = frequencies.map((days) => ({
    daysPerWeek: days,
    notes: `Adaptive AI split engineered for ${goal} at ${days} days per week. Auto-regulates volume based on logged session RPE.`,
    days: generateDaysForFrequency(days, goal, experienceLevel),
  }));

  return {
    type: "ai",
    name: "AI Coach Adaptive",
    level: toProgramLevel(experienceLevel),
    description:
      "Dynamic periodized split engineered by the PhysIQ AI Coach. Auto-adjusts sets, intensity, and volume based on your recovery, RPE, and progress.",
    recommendedDaysPerWeek: frequencies,
    variants,
  };
}

export const aiCoachProgramDefinition: ProgramDefinition = buildAiCoachProgramDefinition();
