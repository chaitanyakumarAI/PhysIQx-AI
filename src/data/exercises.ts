import type { Exercise } from "@/types/exercise";

/**
 * The exercise catalog — shown on Train's browse list AND referenced by
 * Session's workout templates, so "Barbell Bench Press" means the same
 * thing (and has the same id) in both places. Promoted out of Train's mock
 * once Session needed the same catalog, same rule as every other src/data/
 * fixture.
 */
export const mockExercises: Exercise[] = [
  {
    id: "ex-bench-press",
    name: "Barbell Bench Press",
    muscleGroups: ["chest", "shoulders", "arms"],
    equipment: "barbell",
    difficulty: "intermediate",
  },
  {
    id: "ex-incline-db-press",
    name: "Incline Dumbbell Press",
    muscleGroups: ["chest", "shoulders"],
    equipment: "dumbbell",
    difficulty: "beginner",
  },
  {
    id: "ex-cable-fly",
    name: "Cable Fly",
    muscleGroups: ["chest"],
    equipment: "cable",
    difficulty: "beginner",
  },
  {
    id: "ex-deadlift",
    name: "Deadlift",
    muscleGroups: ["back", "legs"],
    equipment: "barbell",
    difficulty: "advanced",
  },
  {
    id: "ex-pull-up",
    name: "Pull-Up",
    muscleGroups: ["back", "arms"],
    equipment: "bodyweight",
    difficulty: "intermediate",
  },
  {
    id: "ex-barbell-row",
    name: "Barbell Row",
    muscleGroups: ["back"],
    equipment: "barbell",
    difficulty: "intermediate",
  },
  {
    id: "ex-back-squat",
    name: "Back Squat",
    muscleGroups: ["legs", "core"],
    equipment: "barbell",
    difficulty: "advanced",
  },
  {
    id: "ex-romanian-deadlift",
    name: "Romanian Deadlift",
    muscleGroups: ["legs", "back"],
    equipment: "barbell",
    difficulty: "intermediate",
  },
  {
    id: "ex-leg-press",
    name: "Leg Press",
    muscleGroups: ["legs"],
    equipment: "machine",
    difficulty: "beginner",
  },
  {
    id: "ex-overhead-press",
    name: "Overhead Press",
    muscleGroups: ["shoulders", "arms"],
    equipment: "barbell",
    difficulty: "intermediate",
  },
  {
    id: "ex-lateral-raise",
    name: "Lateral Raise",
    muscleGroups: ["shoulders"],
    equipment: "dumbbell",
    difficulty: "beginner",
  },
  {
    id: "ex-barbell-curl",
    name: "Barbell Curl",
    muscleGroups: ["arms"],
    equipment: "barbell",
    difficulty: "beginner",
  },
  {
    id: "ex-triceps-pushdown",
    name: "Triceps Pushdown",
    muscleGroups: ["arms"],
    equipment: "cable",
    difficulty: "beginner",
  },
  {
    id: "ex-plank",
    name: "Plank",
    muscleGroups: ["core"],
    equipment: "bodyweight",
    difficulty: "beginner",
  },
];
