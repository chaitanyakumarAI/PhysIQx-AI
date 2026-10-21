import type { TourLine } from "@/features/tour/script";
import type { Grade } from "@/lib/gamification/catalog";
import type { LevelStatus, Rank } from "@/lib/gamification/levels";
import { computeProgression, type CollectibleState, type XpSource } from "@/lib/gamification/progression";
import { bestE1rmByExercise, calculateEpley1RM } from "@/lib/prEngine";
import type { Ledger } from "@/types/ledger";
import type { CompletedSessionSummary } from "@/types/workoutSession";

/**
 * What one finished workout earned, for the workout-complete celebration.
 * Pure: the ledger with and without the session, each run through the
 * same progression engine as the rest of the app, then compared — so the
 * celebration can never promise something Profile won't show.
 */

export interface RecordGain {
  exerciseId: string;
  exerciseName: string;
  e1rm: number;
  previousBest: number;
}

export interface WorkoutCelebration {
  xpGained: number;
  /** Where the XP came from, largest first (positive changes only). */
  xpSources: { source: XpSource; amount: number }[];
  levelBefore: LevelStatus;
  levelAfter: LevelStatus;
  /** The rank this workout reached, when it crossed into a new one. */
  newRank: Rank | null;
  /** Earned by this workout — including badges a level-up just unsealed. A new rank insignia first, then rarest first. */
  newBadges: CollectibleState[];
  /** Lifts where this session beat the athlete's previous best e1RM. */
  records: RecordGain[];
}

const GRADE_ORDER: Record<Grade, number> = { legendary: 0, platinum: 1, gold: 2, silver: 3, bronze: 4 };

/** The ledger as it stood just before this workout, and just after. */
export function aroundWorkout(ledger: Ledger, summary: CompletedSessionSummary): { before: Ledger; after: Ledger } {
  const before = { ...ledger, sessions: ledger.sessions.filter((session) => session.id !== summary.id) };
  return { before, after: { ...before, sessions: [...before.sessions, summary] } };
}

export function describeWorkoutCelebration(
  ledger: Ledger,
  summary: CompletedSessionSummary,
  todayIso: string,
): WorkoutCelebration {
  const { before, after } = aroundWorkout(ledger, summary);
  const was = computeProgression(before, todayIso);
  const now = computeProgression(after, todayIso);

  const earnedBefore = new Set(was.collectibles.filter((item) => item.status === "earned").map((item) => item.id));
  // A new rank leads (it's the level-up made visible), then rarest first.
  const newBadges = now.collectibles
    .filter((item) => item.status === "earned" && !earnedBefore.has(item.id))
    .sort(
      (a, b) =>
        Number(Boolean(b.rankId)) - Number(Boolean(a.rankId)) ||
        GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] ||
        b.xp - a.xp,
    );

  const xpSources = (Object.keys(now.xpBySource) as XpSource[])
    .map((source) => ({ source, amount: now.xpBySource[source] - was.xpBySource[source] }))
    .filter((entry) => entry.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // A record needs something to beat: a first-ever lift is a baseline.
  const bestBefore = bestE1rmByExercise(before.sessions);
  const records = summary.topSets.flatMap((top): RecordGain[] => {
    const e1rm = calculateEpley1RM(top.weightKg, top.reps);
    const previousBest = bestBefore.get(top.exerciseId) ?? 0;
    return previousBest > 0 && e1rm > previousBest
      ? [{ exerciseId: top.exerciseId, exerciseName: top.exerciseName, e1rm, previousBest }]
      : [];
  });

  return {
    xpGained: Math.max(0, now.totalXp - was.totalXp),
    xpSources,
    levelBefore: was.level,
    levelAfter: now.level,
    newRank: now.level.rank.id !== was.level.rank.id ? now.level.rank : null,
    newBadges,
    records,
  };
}

/** True when there's more to show than the XP itself. */
export function hasHighlights(celebration: WorkoutCelebration): boolean {
  return (
    celebration.levelAfter.level > celebration.levelBefore.level ||
    celebration.newBadges.length > 0 ||
    celebration.records.length > 0
  );
}

/**
 * The one thing Kix or Nyra says about it — the biggest moment wins.
 * Voices per docs/MASCOTS.md: Kix warm and openly proud; Nyra blunt, and
 * her slow nod only for something rare. `seed` varies the quiet-day line.
 */
export function celebrationLine(celebration: WorkoutCelebration, seed: string): TourLine {
  const { newBadges, newRank, levelAfter, levelBefore, records } = celebration;
  const legendary = newBadges.find((badge) => badge.grade === "legendary");
  if (legendary) {
    return { speaker: "nyra", expression: "nod", text: `…${legendary.name}. Legendary. Earned, not given.` };
  }
  if (newRank) {
    return { speaker: "kix", expression: "proud", text: `${newRank.name} rank! Look at you climbing.` };
  }
  if (levelAfter.level > levelBefore.level) {
    return { speaker: "kix", expression: "joy", text: `Level ${levelAfter.level}! The work is stacking up.` };
  }
  if (newBadges.length > 1) {
    return { speaker: "kix", expression: "joy", text: `${newBadges.length} new badges in one session? Unreal.` };
  }
  if (newBadges.length === 1) {
    const badge = newBadges[0]!;
    const name = badge.tierLabel ? `${badge.name} ${badge.tierLabel}` : badge.name;
    return { speaker: "kix", expression: "proud", text: `${name}! That one's going on the wall.` };
  }
  if (records.length > 1) {
    return { speaker: "kix", expression: "determined", text: `${records.length} new records. Big day.` };
  }
  if (records.length === 1) {
    return {
      speaker: "kix",
      expression: "determined",
      text: `New record on ${records[0]!.exerciseName}. The bar knows your name now.`,
    };
  }
  const quietDay = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 2 === 0;
  return quietDay
    ? { speaker: "kix", expression: "default", text: "Logged! Every session stacks up." }
    : { speaker: "nyra", expression: "stare", text: "Done. Recover well — tomorrow builds on this." };
}
