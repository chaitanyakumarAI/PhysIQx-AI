import type { Ledger } from "@/types/ledger";
import {
  pillarLabels,
  type PhysIQScoreSnapshot,
  type PillarId,
  type PillarScore,
  type ScoreState,
  type ScoreTrendPoint,
} from "@/types/score";
import { computeBodyShapeValue, getBodyBuild } from "./bodyShape";
import { equivalentMinutes, WHO_WEEKLY_CARDIO_MIN } from "./cardio/minutes";
import { addDaysIso, daysBetweenIso } from "./dates";
import { buildLiftHistories, type LiftHistory } from "./prEngine";
import { computeWeightedScore, pillarWeights } from "./score";
import { collectActiveDates } from "./streakEngine";
import { ratioToStrengthScore, standardsFor } from "./strengthStandards";

/**
 * PhysIQ Score v4 — the one pure, deterministic module that owns all score
 * math (docs/PHYSIQ_SCORE.md). Same ledger + same date → same score; no
 * clock reads, no I/O. Everything is recomputed from the ledger, so a
 * score can always be explained from the events behind it.
 *
 * Lifecycle: one snapshot per local day. The headline shows the most recent
 * FINALIZED day (yesterday) — today's work shows as `pending` and lands
 * when the day closes. Calibrating for the first 7 days, stale after 14
 * days without training.
 */
export const SCORE_VERSION = "v4";
export const CALIBRATION_DAYS = 7;
export const STALE_AFTER_DAYS = 14;

const CONSISTENCY_WINDOW_DAYS = 28;
const CARDIO_WINDOW_DAYS = 14;
/** Cardio decays toward this floor, never to zero (PHYSIQ_SCORE "low-signal"). */
const CARDIO_FLOOR = 35;
const STRENGTH_LOOKBACK_DAYS = 112;
const STRENGTH_TREND_DAYS = 56;

/** Everything derived once from the ledger, reused for every day's snapshot. */
interface ScoreContext {
  ledger: Ledger;
  activeDates: string[];
  liftHistories: LiftHistory[];
}

function buildContext(ledger: Ledger): ScoreContext {
  return {
    ledger,
    activeDates: [...collectActiveDates(ledger.sessions, ledger.cardio)].sort(),
    liftHistories: buildLiftHistories(ledger.sessions),
  };
}

function pillar(
  id: PillarId,
  value: number,
  status: PillarScore["status"],
  detail: string,
): PillarScore {
  return { id, label: pillarLabels[id], value: Math.round(value), status, detail };
}

// --- Pillars ---------------------------------------------------------------

function consistencyPillar(context: ScoreContext, asOf: string, first: string): PillarScore {
  const window = Math.min(CONSISTENCY_WINDOW_DAYS, daysBetweenIso(first, asOf) + 1);
  const windowStart = addDaysIso(asOf, -(window - 1));
  const trained = context.activeDates.filter((date) => date >= windowStart && date <= asOf).length;
  const target = context.ledger.profile.trainingDaysPerWeek;
  const expected = (target * window) / 7;
  const adherence = Math.min(1, trained / Math.max(1, expected));
  // Concave: quick to reward the first sessions, slower near the top.
  const value = 100 * adherence ** 0.75;
  const perWeek = Math.round((trained / window) * 7 * 10) / 10;
  return pillar(
    "consistency",
    value,
    "active",
    `${perWeek} of ${target} planned sessions a week (last ${window} days)`,
  );
}

function latestWeight(ledger: Ledger, asOf: string): number | null {
  let latest: { date: string; weightKg: number } | null = null;
  for (const entry of ledger.weighIns) {
    if (entry.date <= asOf && (!latest || entry.date > latest.date)) latest = entry;
  }
  return latest?.weightKg ?? null;
}

function bestE1rm(history: LiftHistory, from: string, to: string): number {
  let best = 0;
  for (const point of history.points) {
    if (point.date >= from && point.date <= to) best = Math.max(best, point.e1rm);
  }
  return best;
}

function strengthPillar(context: ScoreContext, asOf: string): PillarScore {
  const { ledger, liftHistories } = context;
  const lookbackStart = addDaysIso(asOf, -STRENGTH_LOOKBACK_DAYS);
  const bodyweight = latestWeight(ledger, asOf);

  // Level mode: main lifts relative to bodyweight, against published standards.
  if (bodyweight) {
    const scored = standardsFor(ledger.profile.sex)
      .map((benchmark) => {
        const history = liftHistories.find((lift) => lift.exerciseId === benchmark.exerciseId);
        const e1rm = history ? bestE1rm(history, lookbackStart, asOf) : 0;
        return e1rm > 0 ? ratioToStrengthScore(e1rm / bodyweight, benchmark.tiers) : null;
      })
      .filter((value): value is number => value !== null);
    if (scored.length > 0) {
      const value = scored.reduce((sum, score) => sum + score, 0) / scored.length;
      return pillar(
        "strength",
        value,
        "active",
        `${scored.length} main ${scored.length === 1 ? "lift" : "lifts"} vs. your bodyweight`,
      );
    }
  }

  // Trend mode: are logged lifts getting stronger? (No bodyweight or no
  // main lifts yet.) Compares the last 4 weeks' best with the 4 before.
  const trendStart = addDaysIso(asOf, -STRENGTH_TREND_DAYS);
  const midpoint = addDaysIso(asOf, -STRENGTH_TREND_DAYS / 2);
  const changes: number[] = [];
  let anyRecentLift = false;
  for (const history of liftHistories) {
    const recent = bestE1rm(history, addDaysIso(midpoint, 1), asOf);
    const earlier = bestE1rm(history, trendStart, midpoint);
    if (recent > 0) anyRecentLift = true;
    if (recent > 0 && earlier > 0) changes.push(recent / earlier - 1);
  }
  if (changes.length > 0) {
    const change = changes.reduce((sum, delta) => sum + delta, 0) / changes.length;
    const value =
      change >= 0.05 ? 85 : change >= 0.02 ? 78 : change >= 0 ? 70 : change >= -0.05 ? 62 : 55;
    const percent = Math.round(change * 1000) / 10;
    return pillar(
      "strength",
      value,
      "active",
      `${percent >= 0 ? "+" : ""}${percent}% estimated 1RM over 4 weeks`,
    );
  }

  const everLifted = liftHistories.some((history) =>
    history.points.some((point) => point.date <= asOf),
  );
  if (!everLifted) return pillar("strength", 0, "untracked", "Log a loaded lift to measure strength");
  return pillar(
    "strength",
    anyRecentLift ? 60 : 50,
    "low-signal",
    anyRecentLift
      ? "Log a lift twice in 8 weeks to measure progress"
      : "No lifts logged in the last 8 weeks",
  );
}

function ageOn(ledger: Ledger, asOf: string): number | null {
  const { birthYear } = ledger.profile;
  return birthYear ? Number(asOf.slice(0, 4)) - birthYear : null;
}

function cardioPillar(context: ScoreContext, asOf: string): PillarScore {
  const { ledger } = context;
  const tracked = ledger.cardio.some((activity) => activity.date <= asOf);
  if (!tracked) {
    return pillar("cardio", 0, "untracked", "Import or sync cardio to include this pillar");
  }
  const windowStart = addDaysIso(asOf, -(CARDIO_WINDOW_DAYS - 1));
  // WHO: vigorous minutes count double toward the moderate-intensity target.
  const minutes = equivalentMinutes(ledger.cardio, windowStart, asOf, ageOn(ledger, asOf));
  const weekly = Math.round(minutes / (CARDIO_WINDOW_DAYS / 7));
  const value =
    CARDIO_FLOOR +
    (100 - CARDIO_FLOOR) * Math.min(1, weekly / WHO_WEEKLY_CARDIO_MIN) ** 0.7;
  if (weekly === 0) {
    return pillar("cardio", value, "low-signal", "No cardio in the last 2 weeks");
  }
  return pillar("cardio", value, "active", `${weekly} of ${WHO_WEEKLY_CARDIO_MIN} weekly minutes`);
}

function bodyShapePillar(context: ScoreContext, asOf: string): PillarScore {
  const { profile } = context.ledger;
  if (!profile.currentBuild) {
    return pillar("bodyShape", 0, "untracked", "Pick your current build to include this pillar");
  }
  const value = computeBodyShapeValue({
    build: profile.currentBuild,
    sex: profile.sex,
    heightCm: profile.heightCm,
    age: ageOn(context.ledger, asOf),
  });
  return pillar("bodyShape", value, "active", `${getBodyBuild(profile.currentBuild).label} build`);
}

// --- Snapshots ---------------------------------------------------------------

export interface DailySnapshot {
  date: string;
  state: ScoreState;
  /** null while calibrating (a new athlete never sees a low number). */
  score: number | null;
  pillars: PillarScore[];
  weakestPillarId: PillarId | null;
  /** Days since the first training day, counted from 1 (0 = not started). */
  calibrationDay: number;
}

function scoredPillars(pillars: PillarScore[]): PillarScore[] {
  return pillars.filter((entry) => entry.status !== "untracked");
}

/** The pillar holding the score back; ties go to the heavier-weighted one. */
function weakestOf(pillars: PillarScore[]): PillarId | null {
  const candidates = scoredPillars(pillars);
  if (candidates.length === 0) return null;
  return candidates.reduce((weakest, entry) =>
    entry.value < weakest.value ||
    (entry.value === weakest.value && pillarWeights[entry.id] > pillarWeights[weakest.id])
      ? entry
      : weakest,
  ).id;
}

function snapshotAt(context: ScoreContext, asOf: string): DailySnapshot {
  const activeSoFar = context.activeDates.filter((date) => date <= asOf);
  const first = activeSoFar[0];
  if (!first) {
    return {
      date: asOf,
      state: "calibrating",
      score: null,
      pillars: [],
      weakestPillarId: null,
      calibrationDay: 0,
    };
  }

  const last = activeSoFar.at(-1)!;
  if (daysBetweenIso(last, asOf) >= STALE_AFTER_DAYS) {
    // Paused, not decayed: show the value as it stood when training stopped.
    const frozen = snapshotAt(context, last);
    return { ...frozen, date: asOf, state: "stale" };
  }

  const pillars = [
    consistencyPillar(context, asOf, first),
    strengthPillar(context, asOf),
    cardioPillar(context, asOf),
    bodyShapePillar(context, asOf),
  ];
  const calibrationDay = daysBetweenIso(first, asOf) + 1;
  const calibrating = calibrationDay < CALIBRATION_DAYS;
  return {
    date: asOf,
    state: calibrating ? "calibrating" : "active",
    score: calibrating ? null : computeWeightedScore(scoredPillars(pillars)),
    pillars,
    weakestPillarId: weakestOf(pillars),
    calibrationDay: Math.min(calibrationDay, CALIBRATION_DAYS),
  };
}

/** The score as it stood at the close of `asOfIso`. */
export function computeDailySnapshot(ledger: Ledger, asOfIso: string): DailySnapshot {
  return snapshotAt(buildContext(ledger), asOfIso);
}

/** Daily finalized scores over the last `days` days (gaps where none exists). */
export function computeScoreTrend(
  ledger: Ledger,
  todayIso: string,
  days: number,
): ScoreTrendPoint[] {
  const context = buildContext(ledger);
  const points: ScoreTrendPoint[] = [];
  for (let offset = days; offset >= 1; offset--) {
    const date = addDaysIso(todayIso, -offset);
    const snapshot = snapshotAt(context, date);
    if (snapshot.state === "active" && snapshot.score !== null) {
      points.push({ date, score: snapshot.score });
    }
  }
  return points;
}

function headlineFor(
  current: DailySnapshot,
  weekAgo: DailySnapshot,
  delta: number,
  todayCalibrationDay: number,
  comeback: boolean,
): string {
  if (comeback) return "Welcome back — today's training restarts your score.";
  if (current.state === "calibrating") {
    return todayCalibrationDay === 0
      ? "Log your first workout to start calibrating your score."
      : `Day ${todayCalibrationDay} of ${CALIBRATION_DAYS} — your baseline score arrives after a week of training.`;
  }
  if (current.state === "stale") {
    return "Your score is paused. One workout brings it back.";
  }
  const change = (id: PillarId) =>
    (current.pillars.find((entry) => entry.id === id)?.value ?? 0) -
    (weekAgo.pillars.find((entry) => entry.id === id)?.value ?? 0);
  const movers = scoredPillars(current.pillars)
    .map((entry) => ({ id: entry.id, change: change(entry.id) }))
    .sort((a, b) => b.change - a.change);
  if (delta >= 3 && movers[0]) {
    return `Up ${delta} this week — ${pillarLabels[movers[0].id]} led the climb.`;
  }
  const faller = movers.at(-1);
  if (delta <= -3 && faller) {
    return `${pillarLabels[faller.id]} dipped this week — it's your quickest way back up.`;
  }
  const weakest = current.weakestPillarId;
  return weakest
    ? `Steady week. ${pillarLabels[weakest]} is your biggest opportunity.`
    : "Steady week — keep stacking sessions.";
}

/**
 * What every screen renders (PHYSIQ_SCORE.md "The contract"): the latest
 * finalized score, its 7-day delta and trend, pillars, weakest link, a
 * one-line headline, and today's pending change.
 */
export function computeScoreSummary(ledger: Ledger, todayIso: string): PhysIQScoreSnapshot {
  const context = buildContext(ledger);
  const yesterday = addDaysIso(todayIso, -1);
  const finalized = snapshotAt(context, yesterday);
  const weekAgo = snapshotAt(context, addDaysIso(yesterday, -7));
  const today = snapshotAt(context, todayIso);

  const score = finalized.score ?? 0;
  const delta =
    finalized.score !== null && weekAgo.score !== null && weekAgo.state === "active"
      ? finalized.score - weekAgo.score
      : 0;
  const weekTrend: number[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const day = snapshotAt(context, addDaysIso(yesterday, -offset));
    if (day.state === "active" && day.score !== null) weekTrend.push(day.score);
  }
  const pending =
    finalized.state === "active" && today.score !== null && finalized.score !== null
      ? today.score - finalized.score
      : undefined;
  // Paused right now → stale. Trained today after a pause → a comeback: the
  // score shows as active again while today's work is pending.
  const comeback = finalized.state === "stale" && today.state === "active";
  const state: ScoreState =
    today.state === "stale" ? "stale" : comeback ? "active" : finalized.state;
  // Pillars show today's live progress; the composite waits for day close.
  const pillars = (today.pillars.length > 0 ? today.pillars : finalized.pillars).map(
    (entry) => ({ ...entry }),
  );

  return {
    score,
    delta,
    weekTrend,
    pillars,
    weakestPillarId: today.weakestPillarId ?? finalized.weakestPillarId ?? "consistency",
    headline: headlineFor(finalized, weekAgo, delta, today.calibrationDay, comeback),
    state,
    scoreVersion: SCORE_VERSION,
    calibrationDay: today.calibrationDay,
    pending,
  };
}
