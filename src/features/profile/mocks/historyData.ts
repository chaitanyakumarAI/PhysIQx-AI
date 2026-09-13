import type { CompletedSessionSummary } from "@/store/sessionStore";

export const mockHistoricalSessions: CompletedSessionSummary[] = [
  {
    id: "hist-1",
    missionId: "mission-push-heavy",
    title: "Push-Heavy",
    date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0]!,
    completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    durationSec: 3120, // 52 min
    setsCompleted: 18,
    totalVolumeKg: 14250,
    xpEarned: 320,
    topSets: [
      { exerciseId: "ex-bench-press", exerciseName: "Barbell Bench Press", weightKg: 102.5, reps: 8 },
      { exerciseId: "ex-overhead-press", exerciseName: "Barbell Overhead Press", weightKg: 62.5, reps: 8 },
    ],
    avgRpe: 8.5,
    status: "completed",
  },
  {
    id: "hist-2",
    missionId: "mission-pull-posture",
    title: "Pull & Posture",
    date: new Date(Date.now() - 4 * 86400000).toISOString().split("T")[0]!,
    completedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    durationSec: 2880, // 48 min
    setsCompleted: 16,
    totalVolumeKg: 12800,
    xpEarned: 290,
    topSets: [
      { exerciseId: "ex-barbell-row", exerciseName: "Barbell Bent-Over Row", weightKg: 85, reps: 8 },
      { exerciseId: "ex-lat-pulldown", exerciseName: "Lat Pulldown", weightKg: 77.5, reps: 10 },
    ],
    avgRpe: 8.0,
    status: "completed",
  },
  {
    id: "hist-3",
    missionId: "mission-legs-core",
    title: "Legs & Core",
    date: new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0]!,
    completedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    durationSec: 3480, // 58 min
    setsCompleted: 17,
    totalVolumeKg: 18400,
    xpEarned: 350,
    topSets: [
      { exerciseId: "ex-back-squat", exerciseName: "Barbell Back Squat", weightKg: 140, reps: 6 },
      { exerciseId: "ex-romanian-deadlift", exerciseName: "Romanian Deadlift", weightKg: 125, reps: 8 },
    ],
    avgRpe: 9.0,
    status: "completed",
  },
  {
    id: "hist-4",
    missionId: "mission-upper-power",
    title: "Upper Power",
    date: new Date(Date.now() - 8 * 86400000).toISOString().split("T")[0]!,
    completedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    durationSec: 3000, // 50 min
    setsCompleted: 15,
    totalVolumeKg: 13600,
    xpEarned: 300,
    topSets: [
      { exerciseId: "ex-incline-db-press", exerciseName: "Incline DB Press", weightKg: 36, reps: 8 },
      { exerciseId: "ex-seated-cable-row", exerciseName: "Seated Cable Row", weightKg: 80, reps: 10 },
    ],
    avgRpe: 8.0,
    status: "completed",
  },
  {
    id: "hist-5",
    missionId: "mission-cardio-recovery",
    title: "Zone-2 Cardio Walk",
    date: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0]!,
    completedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    durationSec: 1500, // 25 min
    setsCompleted: 0,
    totalVolumeKg: 0,
    xpEarned: 180,
    topSets: [],
    avgRpe: 6.0,
    status: "completed",
  },
];
