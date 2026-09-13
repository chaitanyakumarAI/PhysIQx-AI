import { createServerSupabaseClient } from "@/lib/supabase/server";
import { computeWeightedScore, findWeakestPillar } from "@/lib/score";
import type { PhysIQScoreSnapshot, PillarScore, PillarId } from "@/types/score";
import { pillarLabels } from "@/types/score";

interface RawScoreInputs {
  completedSessionsCount: number;
  totalVolumeKg: number;
  targetDaysPerWeek: number;
  hasGoalBodyShape: boolean;
  hasCardioLog: boolean;
}

/**
 * Derives individual 0–100 pillar scores from user activity metrics.
 */
function derivePillarScores(inputs: RawScoreInputs): PillarScore[] {
  // 1. Consistency (30%): Days trained vs weekly goal target (scaled 0-100)
  const targetDays = Math.max(1, inputs.targetDaysPerWeek);
  const consistencyRaw = Math.min(100, Math.round((inputs.completedSessionsCount / targetDays) * 100));
  // Baseline floor of 50 for active users so cold starts calibrate smoothly
  const consistencyVal = inputs.completedSessionsCount === 0 ? 60 : Math.max(50, consistencyRaw);

  // 2. Strength (25%): Volume progression score
  let strengthVal = 65; // Neutral baseline
  if (inputs.totalVolumeKg > 10000) strengthVal = 92;
  else if (inputs.totalVolumeKg > 5000) strengthVal = 85;
  else if (inputs.totalVolumeKg > 1000) strengthVal = 75;
  else if (inputs.totalVolumeKg > 0) strengthVal = 70;

  // 3. Cardio (25%): Cardio activity score
  const cardioVal = inputs.hasCardioLog ? 85 : 70;

  // 4. Body Shape (20%): Goal shape clarity & calibration
  const bodyShapeVal = inputs.hasGoalBodyShape ? 88 : 70;

  return [
    { id: "consistency", label: pillarLabels.consistency, value: consistencyVal },
    { id: "strength", label: pillarLabels.strength, value: strengthVal },
    { id: "cardio", label: pillarLabels.cardio, value: cardioVal },
    { id: "bodyShape", label: pillarLabels.bodyShape, value: bodyShapeVal },
  ];
}

/**
 * Generates an automated, contextual headline based on the score and weakest pillar.
 */
function generateHeadline(pillars: PillarScore[], weakestId: PillarId, totalScore: number): string {
  const weakestLabel = pillarLabels[weakestId];
  if (totalScore >= 85) {
    return `Elite momentum — training volume and consistency aligned. Keep pushing ${weakestLabel} to maximize progress.`;
  }
  if (totalScore >= 70) {
    return `Solid adherence this week — focus on ${weakestLabel} to elevate your overall PhysIQ score.`;
  }
  return `Calibrating active profile — logging your sessions this week will build your baseline PhysIQ score.`;
}

/**
 * Calculates the dynamic PhysIQ Score Snapshot for an authenticated user directly from Supabase.
 * Falls back to default calibration values if unauthenticated or offline.
 */
export async function calculateUserPhysIQScore(): Promise<PhysIQScoreSnapshot> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return getFallbackSnapshot();
    }

    // Fetch user profile stats
    const { data: profile } = await supabase
      .from("profiles")
      .select("training_days_per_week, goal_body_shape")
      .eq("id", user.id)
      .maybeSingle();

    // Fetch completed workout sessions in past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: sessions } = await supabase
      .from("sessions")
      .select("total_volume_kg, status")
      .eq("user_id", user.id)
      .gte("created_at", thirtyDaysAgo.toISOString());

    const completedSessions = sessions?.filter(s => s.status === "completed") ?? [];
    const totalVolume = completedSessions.reduce((acc, s) => acc + (Number(s.total_volume_kg) || 0), 0);

    const inputs: RawScoreInputs = {
      completedSessionsCount: completedSessions.length,
      totalVolumeKg: totalVolume,
      targetDaysPerWeek: profile?.training_days_per_week ?? 4,
      hasGoalBodyShape: Boolean(profile?.goal_body_shape),
      hasCardioLog: false, // Updated when cardio logs table is connected
    };

    const pillars = derivePillarScores(inputs);
    const score = computeWeightedScore(pillars);
    const weakestPillarId = findWeakestPillar(pillars);
    const headline = generateHeadline(pillars, weakestPillarId, score);

    // 7-day trend calculation simulation ending at current score
    const delta = completedSessions.length > 0 ? 3 : 0;
    const weekTrend = [
      Math.max(0, score - delta),
      Math.max(0, score - 2),
      Math.max(0, score - 3),
      Math.max(0, score - 1),
      Math.max(0, score - 1),
      Math.max(0, score - 1),
      score,
    ];

    return {
      score,
      delta,
      weekTrend,
      pillars,
      weakestPillarId,
      headline,
      state: "active",
      scoreVersion: "v3",
    };
  } catch (error) {
    console.error("[calculateUserPhysIQScore] Error computing score:", error);
    return getFallbackSnapshot();
  }
}

function getFallbackSnapshot(): PhysIQScoreSnapshot {
  const pillars: PillarScore[] = [
    { id: "consistency", label: pillarLabels.consistency, value: 75 },
    { id: "strength", label: pillarLabels.strength, value: 80 },
    { id: "cardio", label: pillarLabels.cardio, value: 70 },
    { id: "bodyShape", label: pillarLabels.bodyShape, value: 78 },
  ];
  const score = computeWeightedScore(pillars);
  const weakestPillarId = findWeakestPillar(pillars);

  return {
    score,
    delta: 0,
    weekTrend: [score, score, score, score, score, score, score],
    pillars,
    weakestPillarId,
    headline: "Calibrating baseline score — log your next workout to track progress.",
    state: "calibrating",
    scoreVersion: "v3",
  };
}
