import type { Exercise } from "@/types/exercise";
import type { Ledger } from "@/types/ledger";
import type { UserPlan } from "@/types/plan";
import type { PhysIQScoreSnapshot } from "@/types/score";
import type { WeeklySummary } from "@/types/training";
import {
  generateCoachRecommendations,
  type ActiveSessionInfo,
  type CoachRecommendation,
} from "./coachEngine";
import { computeScoreSummary } from "./scoreEngine";
import { computeStreak, deriveCurrentWeek, type StreakResult } from "./streakEngine";
import { computeTrainingLoad, type TrainingLoad } from "./trainingLoad";
import { resolveTodaysWorkout, type TodaysWorkout } from "./workoutPlan";

/**
 * The athlete's whole derived state for one day — the single pipeline
 * every screen reads (Home, Insights, Profile, Train). Pure: ledger in,
 * view state out, so all screens agree by construction.
 */
export interface AthleteState {
  todayIso: string;
  score: PhysIQScoreSnapshot;
  streak: StreakResult;
  week: WeeklySummary;
  trainedThisWeek: number;
  load: TrainingLoad;
  todaysWorkout: TodaysWorkout | null;
  coach: CoachRecommendation[];
}

export interface AthleteStateInput {
  ledger: Ledger;
  todayIso: string;
  activePlan: UserPlan | null;
  activeSession: ActiveSessionInfo | null;
  catalog: Exercise[];
}

export function deriveAthleteState({
  ledger,
  todayIso,
  activePlan,
  activeSession,
  catalog,
}: AthleteStateInput): AthleteState {
  const calendar = {
    sessions: ledger.sessions,
    cardio: ledger.cardio,
    trainingDaysPerWeek: ledger.profile.trainingDaysPerWeek,
    todayIso,
  };
  const score = computeScoreSummary(ledger, todayIso);
  const streak = computeStreak(calendar);
  const week = deriveCurrentWeek(calendar);
  const trainedThisWeek = week.days.filter((day) => day.status === "trained").length;
  const load = computeTrainingLoad(ledger.sessions, todayIso);
  const todaysWorkout = resolveTodaysWorkout(activePlan, ledger.sessions, todayIso);
  const coach = generateCoachRecommendations({
    todayIso,
    ledger,
    score,
    load,
    streak,
    trainedThisWeek,
    todaysWorkout,
    activeSession,
    catalog,
  });
  return { todayIso, score, streak, week, trainedThisWeek, load, todaysWorkout, coach };
}
