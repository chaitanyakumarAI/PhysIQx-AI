import type { Exercise } from "@/types/exercise";
import { enforceTwoSentences } from "@/types/insight";
import type { Ledger } from "@/types/ledger";
import { pillarLabels, type PhysIQScoreSnapshot } from "@/types/score";
import { addDaysIso, daysBetweenIso, weekdayIndex } from "./dates";
import { detectRecentPRs, findStalledLifts } from "./prEngine";
import { computeOverloadSuggestion } from "./progression";
import type { StreakResult } from "./streakEngine";
import type { TrainingLoad } from "./trainingLoad";
import { estimateDayMinutes, type TodaysWorkout } from "./workoutPlan";

/**
 * The Coach — deterministic recommendations from the athlete's own ledger
 * (no model, so it is never labelled "AI"). Each rule looks for one
 * situation, and when it fires, says one specific thing with one action.
 * Rules carry a priority and a stance (train / rest) so the top pick never
 * sits next to advice that contradicts it. One scoring brain, many mouths:
 * the coach reads score, load, and streak outputs — it computes none.
 */

export type CoachTone = "celebrate" | "suggest" | "caution" | "info";

export interface CoachAction {
  label: string;
  href: string;
}

export interface CoachRecommendation {
  id: string;
  tone: CoachTone;
  title: string;
  /** At most two sentences. */
  body: string;
  action?: CoachAction;
  /** Higher wins. */
  priority: number;
  stance?: "train" | "rest";
}

export interface ActiveSessionInfo {
  missionId: string;
  title: string;
  completedSets: number;
  totalSets: number;
}

export interface CoachContext {
  todayIso: string;
  ledger: Ledger;
  score: PhysIQScoreSnapshot;
  load: TrainingLoad;
  streak: StreakResult;
  trainedThisWeek: number;
  todaysWorkout: TodaysWorkout | null;
  activeSession: ActiveSessionInfo | null;
  catalog: Exercise[];
}

const STREAK_MILESTONES = new Set([7, 14, 21, 30, 50, 75, 100, 150, 200, 365]);
const REST_AFTER_DAYS: Record<string, number> = { beginner: 3, intermediate: 4, advanced: 5 };
const COMEBACK_AFTER_DAYS = 7;
const WEIGH_IN_EVERY_DAYS = 7;

const kg = (value: number) => `${Math.round(value * 10) / 10} kg`;

function startAction(context: CoachContext, label?: string): CoachAction {
  const workout = context.todaysWorkout;
  if (!workout) return { label: "Choose a plan", href: "/train" };
  return { label: label ?? `Start ${workout.day.name}`, href: `/session/${workout.missionId}` };
}

type Rule = (context: CoachContext) => CoachRecommendation | null;

const resumeSession: Rule = ({ activeSession }) =>
  activeSession && {
    id: "resume-session",
    tone: "info",
    title: `Finish ${activeSession.title}`,
    body: `${activeSession.completedSets} of ${activeSession.totalSets} sets logged. Pick up where you left off.`,
    action: { label: "Resume workout", href: `/session/${activeSession.missionId}` },
    priority: 100,
  };

const firstWorkout: Rule = (context) => {
  const { ledger, todaysWorkout, activeSession } = context;
  if (activeSession || ledger.sessions.length > 0 || ledger.cardio.length > 0) return null;
  return {
    id: "first-workout",
    tone: "suggest",
    title: "Start your first workout",
    body: todaysWorkout
      ? `${todaysWorkout.day.name} is ready: ${todaysWorkout.day.exercises.length} exercises, about ${estimateDayMinutes(todaysWorkout.day)} minutes. Everything you log from here feeds your score.`
      : "Pick a plan and log your first session. Everything you log from here feeds your score.",
    action: startAction(context),
    priority: 95,
    stance: "train",
  };
};

function daysSinceLastTraining({ ledger, todayIso }: CoachContext): number | null {
  const dates = [
    ...ledger.sessions.filter((session) => session.setsCompleted > 0).map((session) => session.date),
    ...ledger.cardio.map((activity) => activity.date),
  ].filter((date) => date <= todayIso);
  if (dates.length === 0) return null;
  return daysBetweenIso(dates.sort().at(-1)!, todayIso);
}

const comeback: Rule = (context) => {
  const gap = daysSinceLastTraining(context);
  if (gap === null || gap < COMEBACK_AFTER_DAYS) return null;
  return {
    id: "comeback",
    tone: "suggest",
    title: "Welcome back",
    body: `It's been ${gap} days. Start at about 80% of your last weights today; showing up is what counts.`,
    action: startAction(context),
    priority: 90,
    stance: "train",
  };
};

const highLoad: Rule = ({ load, streak }) => {
  if (load.status !== "high" || streak.trainedToday) return null;
  return {
    id: "high-load",
    tone: "caution",
    title: "Ease off today",
    body: `${load.headline} Go light or take a rest day; adaptation happens in recovery.`,
    action: { label: "See training load", href: "/insights/recovery" },
    priority: 88,
    stance: "rest",
  };
};

const doneToday: Rule = ({ todaysWorkout }) => {
  const done = todaysWorkout?.completedToday;
  if (!todaysWorkout || !done) return null;
  const moved = done.totalVolumeKg > 0 ? `${done.totalVolumeKg.toLocaleString()} kg moved, ` : "";
  return {
    id: "done-today",
    tone: "celebrate",
    title: `${todaysWorkout.day.name} done`,
    body: `${moved}+${done.xpEarned} XP. Next up: ${todaysWorkout.nextDay.name}.`,
    action: { label: "View history", href: "/profile/history" },
    priority: 85,
    stance: "rest",
  };
};

const freshPR: Rule = ({ ledger, todayIso }) => {
  const [pr] = detectRecentPRs(ledger.sessions, addDaysIso(todayIso, -1));
  if (!pr) return null;
  return {
    id: `pr-${pr.exerciseId}-${pr.date}`,
    tone: "celebrate",
    title: `New best: ${pr.exerciseName}`,
    body: `${kg(pr.weightKg)} × ${pr.reps}, an estimated 1RM of ${kg(pr.e1rm)} (up ${kg(pr.e1rm - pr.previousBest)}).`,
    action: { label: "See your records", href: "/insights" },
    priority: 84,
  };
};

const restDay: Rule = ({ ledger, load, streak, trainedThisWeek, todaysWorkout }) => {
  if (streak.trainedToday || todaysWorkout?.status === "done") return null;
  const threshold = REST_AFTER_DAYS[ledger.profile.experienceLevel ?? "beginner"] ?? 3;
  const target = ledger.profile.trainingDaysPerWeek;
  if (load.consecutiveTrainingDays >= threshold) {
    return {
      id: "rest-day",
      tone: "info",
      title: "Rest day earned",
      body: `${load.consecutiveTrainingDays} days in a row: a rest day today sets up your next session. Planned rest never breaks your streak.`,
      priority: 82,
      stance: "rest",
    };
  }
  if (trainedThisWeek >= target) {
    return {
      id: "week-complete",
      tone: "celebrate",
      title: "Weekly target hit",
      body: `${trainedThisWeek} of ${target} sessions done this week. Rest is part of the plan, and anything extra is a bonus.`,
      priority: 66,
      stance: "rest",
    };
  }
  return null;
};

const readyToProgress: Rule = (context) => {
  const { todaysWorkout, ledger, catalog } = context;
  if (!todaysWorkout || todaysWorkout.status === "done") return null;
  for (const entry of todaysWorkout.day.exercises) {
    const exercise = catalog.find((item) => item.id === entry.exerciseId);
    if (!exercise || exercise.equipment === "bodyweight") continue;
    const suggestion = computeOverloadSuggestion({
      exerciseId: entry.exerciseId,
      history: ledger.sessions,
      targetReps: entry.sets[0]?.targetReps ?? 8,
      equipment: exercise.equipment,
      exerciseType: exercise.type,
    });
    if (suggestion?.reason === "reps_met_weight_step" || suggestion?.reason === "rpe_accelerated_step") {
      return {
        id: `progress-${entry.exerciseId}`,
        tone: "suggest",
        title: `Ready to progress: ${exercise.name}`,
        body: `You hit every rep last time. Today's target is ${kg(suggestion.weightKg)} × ${suggestion.reps}.`,
        action: startAction(context),
        priority: 75,
        stance: "train",
      };
    }
  }
  return null;
};

const stalledLift: Rule = ({ ledger, todayIso }) => {
  const [stalled] = findStalledLifts(ledger.sessions, todayIso);
  if (!stalled) return null;
  return {
    id: `stalled-${stalled.exerciseId}`,
    tone: "suggest",
    title: `${stalled.exerciseName} has stalled`,
    body: `No new best in ${stalled.weeksStalled} weeks. Drop the weight about 10% and build back up over two or three weeks.`,
    action: { label: "View exercise", href: `/train/exercises/${stalled.exerciseId}` },
    priority: 70,
    stance: "train",
  };
};

const streakMilestone: Rule = ({ streak }) => {
  if (!STREAK_MILESTONES.has(streak.currentStreakDays)) return null;
  return {
    id: `streak-${streak.currentStreakDays}`,
    tone: "celebrate",
    title: `${streak.currentStreakDays}-day streak`,
    body: "Planned rest days included. That's consistency done right.",
    priority: 68,
  };
};

const weekPacing: Rule = (context) => {
  const { ledger, streak, trainedThisWeek, todayIso, todaysWorkout } = context;
  if (streak.trainedToday) return null;
  const target = ledger.profile.trainingDaysPerWeek;
  const remaining = target - trainedThisWeek;
  if (remaining <= 0) return null;
  const daysLeft = 7 - weekdayIndex(todayIso);
  if (remaining >= daysLeft) {
    return {
      id: "week-pacing-tight",
      tone: "caution",
      title: `${remaining} ${remaining === 1 ? "session" : "sessions"} left, ${daysLeft} ${daysLeft === 1 ? "day" : "days"} to go`,
      body: "Train today to close out the week on target.",
      action: startAction(context),
      priority: 64,
      stance: "train",
    };
  }
  if (!todaysWorkout || trainedThisWeek === 0) return null;
  return {
    id: "week-pacing",
    tone: "info",
    title: `${trainedThisWeek} of ${target} sessions this week`,
    body: `${todaysWorkout.day.name} today keeps you on pace.`,
    action: startAction(context),
    priority: 56,
    stance: "train",
  };
};

const calibration: Rule = ({ score }) => {
  if (score.state !== "calibrating" || !score.calibrationDay) return null;
  return {
    id: "calibration",
    tone: "info",
    title: `Day ${score.calibrationDay} of 7`,
    body: "Your PhysIQ Score unlocks after a week. Log every session so the baseline is really yours.",
    action: { label: "How the score works", href: "/insights" },
    priority: 58,
  };
};

const weakestPillar: Rule = (context) => {
  const { score, todaysWorkout } = context;
  if (score.state !== "active") return null;
  const weakest = score.pillars.find((pillar) => pillar.id === score.weakestPillarId);
  if (!weakest || weakest.status === "untracked" || weakest.value >= 85) return null;
  const label = pillarLabels[weakest.id];
  const copy: Record<typeof weakest.id, [string, CoachAction]> = {
    cardio: [
      "A brisk 30-minute walk or easy ride lifts it fastest. Import or sync it so it counts.",
      { label: "Open cardio", href: "/train/cardio" },
    ],
    strength: [
      todaysWorkout
        ? `Compound lifts move it most, and ${todaysWorkout.day.name} has them.`
        : "Compound lifts move it most.",
      startAction(context),
    ],
    consistency: [
      "One more session this week moves it most.",
      startAction(context),
    ],
    bodyShape: [
      "It follows the build you pick. Re-check it as your body changes.",
      { label: "Update your build", href: "/profile/body" },
    ],
  };
  const [body, action] = copy[weakest.id];
  return {
    id: `weakest-${weakest.id}`,
    tone: "suggest",
    title: `${label} is your weakest pillar`,
    body,
    action,
    priority: 50,
  };
};

const weighIn: Rule = ({ ledger, todayIso }) => {
  const last = ledger.weighIns.reduce<string | null>(
    (latest, entry) => (latest === null || entry.date > latest ? entry.date : latest),
    null,
  );
  if (last && daysBetweenIso(last, todayIso) < WEIGH_IN_EVERY_DAYS) return null;
  const goalDriven = ledger.profile.goal === "cut" || ledger.profile.goal === "bulk";
  return {
    id: "weigh-in",
    tone: "info",
    title: last ? "Weekly weigh-in" : "Add your bodyweight",
    body: "Strength is scored against bodyweight, so keep it current.",
    action: { label: "Log weight", href: "/profile/body" },
    priority: goalDriven ? 54 : 45,
  };
};

const pickBuild: Rule = ({ ledger }) =>
  ledger.profile.currentBuild
    ? null
    : {
        id: "pick-build",
        tone: "info",
        title: "Switch on Body Shape",
        body: "Pick the silhouette closest to you today. It takes ten seconds.",
        action: { label: "Pick your build", href: "/profile/body" },
        priority: 40,
      };

const RULES: Rule[] = [
  resumeSession,
  firstWorkout,
  comeback,
  highLoad,
  doneToday,
  freshPR,
  restDay,
  readyToProgress,
  stalledLift,
  streakMilestone,
  weekPacing,
  calibration,
  weakestPillar,
  weighIn,
  pickBuild,
];

/** All applicable recommendations, best first, without contradictions. */
export function generateCoachRecommendations(context: CoachContext): CoachRecommendation[] {
  const fired = RULES.map((rule) => rule(context))
    .filter((recommendation): recommendation is CoachRecommendation => recommendation !== null)
    .map((recommendation) => ({ ...recommendation, body: enforceTwoSentences(recommendation.body) }))
    .sort((a, b) => b.priority - a.priority);

  const leadStance = fired.find((recommendation) => recommendation.stance)?.stance;
  return fired.filter(
    (recommendation) => !recommendation.stance || recommendation.stance === leadStance,
  );
}
