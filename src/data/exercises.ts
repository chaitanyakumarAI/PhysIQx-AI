import type {
  Equipment,
  Exercise,
  ExerciseDifficulty,
  MuscleGroup,
} from "@/types/exercise";

/**
 * The exercise catalog — shown on Train's browse list, referenced by
 * Session's workout templates, and the plan builder's picker, so every
 * exercise means the same thing (and has the same id) everywhere.
 *
 * Curated from content/physiq-app-content-v2.json per the quality-over-
 * quantity rule: the ~90 most commonly programmed movements, not all 200.
 * The source's biceps/triceps/forearms map to "arms", calves/glutes to
 * "legs"; cardio/functional movements wait for the cardio-logging phase.
 *
 * Two orderings carry meaning here (see the Exercise type contract):
 * within each group, compounds are listed before isolations ("top workouts
 * first" — this is the tie-break order filters preserve), and each entry's
 * muscleGroups array is ordered by involvement.
 */
function ex(
  id: string,
  name: string,
  muscleGroups: MuscleGroup[],
  equipment: Equipment,
  difficulty: ExerciseDifficulty,
): Exercise {
  return { id, name, muscleGroups, equipment, difficulty };
}

export const mockExercises: Exercise[] = [
  // ── Chest ──────────────────────────────────────────────────────────
  ex("ex-bench-press", "Barbell Bench Press", ["chest", "shoulders", "arms"], "barbell", "intermediate"),
  ex("ex-incline-bench-press", "Incline Barbell Bench Press", ["chest", "shoulders"], "barbell", "intermediate"),
  ex("ex-db-bench-press", "Dumbbell Bench Press", ["chest", "shoulders", "arms"], "dumbbell", "beginner"),
  ex("ex-incline-db-press", "Incline Dumbbell Press", ["chest", "shoulders"], "dumbbell", "beginner"),
  ex("ex-machine-chest-press", "Machine Chest Press", ["chest", "arms"], "machine", "beginner"),
  ex("ex-chest-dip", "Chest Dip", ["chest", "arms"], "bodyweight", "advanced"),
  ex("ex-push-up", "Push-Up", ["chest", "arms", "core"], "bodyweight", "beginner"),
  ex("ex-landmine-press", "Landmine Press", ["chest", "shoulders"], "barbell", "intermediate"),
  ex("ex-cable-fly", "Cable Fly", ["chest"], "cable", "beginner"),
  ex("ex-low-high-cable-fly", "Low-to-High Cable Fly", ["chest"], "cable", "intermediate"),
  ex("ex-db-fly", "Dumbbell Fly", ["chest"], "dumbbell", "beginner"),
  ex("ex-pec-deck", "Pec Deck Machine", ["chest"], "machine", "beginner"),

  // ── Back ───────────────────────────────────────────────────────────
  ex("ex-deadlift", "Conventional Deadlift", ["back", "legs", "core"], "barbell", "advanced"),
  ex("ex-pull-up", "Pull-Up", ["back", "arms"], "bodyweight", "intermediate"),
  ex("ex-chin-up", "Chin-Up", ["back", "arms"], "bodyweight", "intermediate"),
  ex("ex-barbell-row", "Bent-Over Barbell Row", ["back", "arms"], "barbell", "intermediate"),
  ex("ex-pendlay-row", "Pendlay Row", ["back"], "barbell", "intermediate"),
  ex("ex-t-bar-row", "T-Bar Row", ["back"], "barbell", "intermediate"),
  ex("ex-seated-cable-row", "Seated Cable Row", ["back", "arms"], "cable", "beginner"),
  ex("ex-single-arm-db-row", "Single-Arm Dumbbell Row", ["back"], "dumbbell", "beginner"),
  ex("ex-chest-supported-row", "Chest-Supported Row", ["back"], "machine", "beginner"),
  ex("ex-lat-pulldown", "Lat Pulldown (Wide Grip)", ["back", "arms"], "cable", "beginner"),
  ex("ex-close-grip-pulldown", "Lat Pulldown (Close Grip)", ["back", "arms"], "cable", "beginner"),
  ex("ex-assisted-pull-up", "Assisted Pull-Up", ["back"], "machine", "beginner"),
  ex("ex-rack-pull", "Rack Pull", ["back", "legs"], "barbell", "advanced"),
  ex("ex-inverted-row", "Inverted Row", ["back"], "bodyweight", "beginner"),
  ex("ex-straight-arm-pulldown", "Straight-Arm Pulldown", ["back"], "cable", "beginner"),
  ex("ex-face-pull", "Face Pull", ["back", "shoulders"], "cable", "beginner"),
  ex("ex-back-extension", "Back Extension", ["back", "legs"], "bodyweight", "beginner"),

  // ── Shoulders ──────────────────────────────────────────────────────
  ex("ex-overhead-press", "Barbell Overhead Press", ["shoulders", "arms"], "barbell", "intermediate"),
  ex("ex-seated-db-press", "Seated Dumbbell Shoulder Press", ["shoulders", "arms"], "dumbbell", "beginner"),
  ex("ex-arnold-press", "Arnold Press", ["shoulders"], "dumbbell", "intermediate"),
  ex("ex-push-press", "Push Press", ["shoulders", "legs"], "barbell", "advanced"),
  ex("ex-machine-shoulder-press", "Machine Shoulder Press", ["shoulders"], "machine", "beginner"),
  ex("ex-upright-row", "Upright Row", ["shoulders", "arms"], "barbell", "intermediate"),
  ex("ex-lateral-raise", "Lateral Raise", ["shoulders"], "dumbbell", "beginner"),
  ex("ex-cable-lateral-raise", "Cable Lateral Raise", ["shoulders"], "cable", "beginner"),
  ex("ex-front-raise", "Front Raise", ["shoulders"], "dumbbell", "beginner"),
  ex("ex-rear-delt-fly", "Rear Delt Fly", ["shoulders", "back"], "dumbbell", "beginner"),
  ex("ex-reverse-pec-deck", "Reverse Pec Deck", ["shoulders", "back"], "machine", "beginner"),
  ex("ex-barbell-shrug", "Barbell Shrug", ["shoulders", "back"], "barbell", "beginner"),

  // ── Arms ───────────────────────────────────────────────────────────
  ex("ex-close-grip-bench", "Close-Grip Bench Press", ["arms", "chest"], "barbell", "intermediate"),
  ex("ex-triceps-dip", "Triceps Dip", ["arms", "chest"], "bodyweight", "advanced"),
  ex("ex-barbell-curl", "Barbell Curl", ["arms"], "barbell", "beginner"),
  ex("ex-ez-bar-curl", "EZ-Bar Curl", ["arms"], "barbell", "beginner"),
  ex("ex-db-curl", "Dumbbell Curl", ["arms"], "dumbbell", "beginner"),
  ex("ex-hammer-curl", "Hammer Curl", ["arms"], "dumbbell", "beginner"),
  ex("ex-incline-db-curl", "Incline Dumbbell Curl", ["arms"], "dumbbell", "intermediate"),
  ex("ex-preacher-curl", "Preacher Curl", ["arms"], "machine", "beginner"),
  ex("ex-cable-curl", "Cable Curl", ["arms"], "cable", "beginner"),
  ex("ex-triceps-pushdown", "Triceps Rope Pushdown", ["arms"], "cable", "beginner"),
  ex("ex-skull-crusher", "Skull Crusher", ["arms"], "barbell", "intermediate"),
  ex("ex-overhead-triceps-ext", "Overhead Triceps Extension", ["arms"], "dumbbell", "beginner"),
  ex("ex-diamond-push-up", "Diamond Push-Up", ["arms", "chest"], "bodyweight", "intermediate"),
  ex("ex-bench-dip", "Bench Dip", ["arms"], "bodyweight", "beginner"),

  // ── Legs ───────────────────────────────────────────────────────────
  ex("ex-back-squat", "Barbell Back Squat", ["legs", "core"], "barbell", "intermediate"),
  ex("ex-front-squat", "Front Squat", ["legs", "core"], "barbell", "advanced"),
  ex("ex-romanian-deadlift", "Romanian Deadlift", ["legs", "back"], "barbell", "intermediate"),
  ex("ex-trap-bar-deadlift", "Trap Bar Deadlift", ["legs", "back"], "barbell", "intermediate"),
  ex("ex-hack-squat", "Hack Squat", ["legs"], "machine", "intermediate"),
  ex("ex-leg-press", "Leg Press", ["legs"], "machine", "beginner"),
  ex("ex-bulgarian-split-squat", "Bulgarian Split Squat", ["legs"], "dumbbell", "intermediate"),
  ex("ex-goblet-squat", "Goblet Squat", ["legs"], "dumbbell", "beginner"),
  ex("ex-hip-thrust", "Barbell Hip Thrust", ["legs"], "barbell", "intermediate"),
  ex("ex-walking-lunge", "Walking Lunge", ["legs"], "dumbbell", "beginner"),
  ex("ex-reverse-lunge", "Reverse Lunge", ["legs"], "dumbbell", "beginner"),
  ex("ex-step-up", "Step-Up", ["legs"], "dumbbell", "beginner"),
  ex("ex-box-squat", "Box Squat", ["legs"], "barbell", "intermediate"),
  ex("ex-stiff-leg-deadlift", "Stiff-Leg Deadlift", ["legs", "back"], "barbell", "intermediate"),
  ex("ex-glute-bridge", "Glute Bridge", ["legs"], "barbell", "beginner"),
  ex("ex-cable-pull-through", "Cable Pull-Through", ["legs"], "cable", "beginner"),
  ex("ex-leg-extension", "Leg Extension", ["legs"], "machine", "beginner"),
  ex("ex-lying-leg-curl", "Lying Leg Curl", ["legs"], "machine", "beginner"),
  ex("ex-seated-leg-curl", "Seated Leg Curl", ["legs"], "machine", "beginner"),
  ex("ex-nordic-curl", "Nordic Hamstring Curl", ["legs"], "bodyweight", "advanced"),
  ex("ex-standing-calf-raise", "Standing Calf Raise", ["legs"], "machine", "beginner"),
  ex("ex-seated-calf-raise", "Seated Calf Raise", ["legs"], "machine", "beginner"),

  // ── Core ───────────────────────────────────────────────────────────
  ex("ex-plank", "Plank", ["core"], "bodyweight", "beginner"),
  ex("ex-side-plank", "Side Plank", ["core"], "bodyweight", "beginner"),
  ex("ex-hanging-leg-raise", "Hanging Leg Raise", ["core"], "bodyweight", "advanced"),
  ex("ex-hanging-knee-raise", "Hanging Knee Raise", ["core"], "bodyweight", "intermediate"),
  ex("ex-ab-wheel", "Ab Wheel Rollout", ["core"], "bodyweight", "advanced"),
  ex("ex-cable-crunch", "Cable Crunch", ["core"], "cable", "beginner"),
  ex("ex-pallof-press", "Pallof Press", ["core"], "cable", "intermediate"),
  ex("ex-crunch", "Crunch", ["core"], "bodyweight", "beginner"),
  ex("ex-bicycle-crunch", "Bicycle Crunch", ["core"], "bodyweight", "beginner"),
  ex("ex-russian-twist", "Russian Twist", ["core"], "bodyweight", "beginner"),
  ex("ex-dead-bug", "Dead Bug", ["core"], "bodyweight", "beginner"),
  ex("ex-lying-leg-raise", "Lying Leg Raise", ["core"], "bodyweight", "beginner"),
];
