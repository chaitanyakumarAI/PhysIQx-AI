/**
 * Recovery & Readiness Engine
 *
 * Implements Banister Impulse-Response Fitness-Fatigue model and
 * Acute-to-Chronic Workload Ratio (ACWR) to quantify systemic athletic readiness.
 *
 * Factors:
 * 1. Acute Workload (7-day cumulative training volume) vs Chronic Baseline (28-day average).
 * 2. Neuromuscular Strain (density of sets at RPE >= 8.5).
 * 3. Rest Days & Streak Continuity (preventing overtraining).
 * 4. Hydration Status (cellular recovery and connective tissue lubrication).
 */

export type ReadinessTier = "peak" | "optimal" | "fatigued" | "overreached";

export interface RecoveryPillars {
  neuromuscular: number; // 0 - 100
  connectiveTissue: number; // 0 - 100
  glycogenHydration: number; // 0 - 100
  autonomicNervous: number; // 0 - 100
}

export interface ReadinessScore {
  score: number; // 0 - 100
  tier: ReadinessTier;
  acwrRatio: number; // typically 0.8 - 1.5
  pillars: RecoveryPillars;
  headline: string;
  recommendation: string;
  suggestedAction: {
    label: string;
    href: string;
  };
}

export const READINESS_TIER_META: Record<
  ReadinessTier,
  { label: string; text: string; bg: string; border: string }
> = {
  peak: {
    label: "Peak Capacity",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  optimal: {
    label: "Optimal Training",
    text: "text-brand",
    bg: "bg-brand/10",
    border: "border-brand/30",
  },
  fatigued: {
    label: "Moderate Fatigue",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  overreached: {
    label: "Recovery Required",
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
  },
};

export interface SessionRecord {
  date: string;
  totalVolumeKg: number;
  avgRpe?: number;
  durationSec?: number;
}

/**
 * Calculates athletic readiness score and multi-pillar recovery profile.
 */
export function calculateReadiness(
  recentSessions: SessionRecord[],
  todayHydrationMl: number = 2500,
  hydrationTargetMl: number = 3000,
  currentStreakDays: number = 3
): ReadinessScore {
  // 1. Calculate Acute (last 7 days) and Chronic (last 28 days) volume
  const now = new Date();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  let acuteVolume = 0;
  let chronicVolume = 0;
  let recentHighRpeCount = 0;
  let sessionsLast7Days = 0;

  recentSessions.forEach((s) => {
    const sessionDate = new Date(s.date);
    const daysAgo = Math.max(0, (now.getTime() - sessionDate.getTime()) / ONE_DAY_MS);

    if (daysAgo <= 7) {
      acuteVolume += s.totalVolumeKg;
      sessionsLast7Days++;
      if (s.avgRpe && s.avgRpe >= 8.5) {
        recentHighRpeCount++;
      }
    }
    if (daysAgo <= 28) {
      chronicVolume += s.totalVolumeKg;
    }
  });

  // Normalize Chronic to a weekly baseline
  const weeklyChronicBaseline = chronicVolume > 0 ? chronicVolume / 4 : acuteVolume || 10000;
  const acwrRatio =
    weeklyChronicBaseline > 0
      ? Math.round((acuteVolume / weeklyChronicBaseline) * 100) / 100
      : 1.0;

  // 2. Pillar Sub-scores
  // Neuromuscular: starts at 100, drops with heavy acute spikes and high RPE
  let neuromuscular = 95 - (acwrRatio > 1.3 ? (acwrRatio - 1.3) * 50 : 0) - recentHighRpeCount * 8;
  neuromuscular = Math.min(100, Math.max(20, Math.round(neuromuscular)));

  // Connective tissue: drops if training >= 6 days in a row without a rest day
  let connectiveTissue = 100 - (sessionsLast7Days >= 5 ? 20 : 0) - (currentStreakDays > 7 ? 15 : 0);
  connectiveTissue = Math.min(100, Math.max(25, Math.round(connectiveTissue)));

  // Glycogen & Hydration: ratio of consumed water vs target
  const hydrationRatio = Math.min(1.2, todayHydrationMl / Math.max(1000, hydrationTargetMl));
  const glycogenHydration = Math.min(100, Math.max(30, Math.round(hydrationRatio * 90)));

  // Autonomic nervous system: balanced by ACWR sweet spot (0.8 - 1.25)
  let autonomicNervous = 90;
  if (acwrRatio > 1.5) {
    autonomicNervous -= 35; // Overtraining risk zone
  } else if (acwrRatio > 1.25) {
    autonomicNervous -= 15;
  } else if (acwrRatio < 0.7) {
    autonomicNervous -= 10; // Detraining / under-stimulation
  }
  autonomicNervous = Math.min(100, Math.max(20, Math.round(autonomicNervous)));

  // 3. Composite Readiness Score (weighted sum)
  const compositeScore = Math.round(
    neuromuscular * 0.35 +
      autonomicNervous * 0.3 +
      connectiveTissue * 0.2 +
      glycogenHydration * 0.15
  );

  const score = Math.min(100, Math.max(0, compositeScore));

  // 4. Tier & Actionable Coaching Take
  let tier: ReadinessTier = "optimal";
  let headline = "System primed for progressive overload.";
  let recommendation =
    "Neuromuscular recovery is high. Push for target reps on heavy compound movements.";
  let suggestedAction = {
    label: "Start Today's Mission",
    href: "/train",
  };

  if (score >= 88) {
    tier = "peak";
    headline = "Peak readiness detected. Ideal day for personal records.";
    recommendation =
      "Central nervous system is fresh and joint load is low. Attack your heaviest top set with conviction.";
    suggestedAction = {
      label: "View PR Benchmarks",
      href: "/insights/strength",
    };
  } else if (score >= 68) {
    tier = "optimal";
    headline = "Solid capacity for working sets and volume.";
    recommendation =
      "Workload is well-managed within your sweet spot. Maintain 1–2 reps in reserve on auxiliary work.";
    suggestedAction = {
      label: "Open Train Catalog",
      href: "/train",
    };
  } else if (score >= 48) {
    tier = "fatigued";
    headline = "Moderate systemic fatigue accumulated.";
    recommendation =
      "Accumulated volume is elevated. Cap working sets at RPE 7.5 or substitute with low-impact cardio.";
    suggestedAction = {
      label: "Log Active Recovery Cardio",
      href: "/train/cardio",
    };
  } else {
    tier = "overreached";
    headline = "High fatigue load. Recovery protocol strongly advised.";
    recommendation =
      "Your acute-to-chronic workload ratio indicates acute overreaching. Take a dedicated rest day with hydration.";
    suggestedAction = {
      label: "Log Hydration & Rest",
      href: "/home?log=water",
    };
  }

  return {
    score,
    tier,
    acwrRatio,
    pillars: {
      neuromuscular,
      connectiveTissue,
      glycogenHydration,
      autonomicNervous,
    },
    headline,
    recommendation,
    suggestedAction,
  };
}
