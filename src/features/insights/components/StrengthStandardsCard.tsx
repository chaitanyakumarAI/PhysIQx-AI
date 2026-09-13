"use client";

import Link from "next/link";
import { ChevronRight, Dumbbell, Award } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import {
  evaluateStrengthProfile,
  TIER_COLORS,
  TIER_LABELS,
} from "@/lib/strengthStandards";
import { useSessionStore } from "@/store/sessionStore";
import { useProfileStore } from "@/store/profileStore";

export function StrengthStandardsCard() {
  const history = useSessionStore((state) => state.history);
  const weights = useProfileStore((state) => state.weightEntries);
  const currentBW = weights && weights.length > 0 ? weights.at(-1)!.weightKg : 75;

  // Derive highest 1RM for Big 4 from completed sessions
  const liftMaxes: Record<string, number> = {
    "ex-bench-press": 85,
    "ex-squat": 115,
    "ex-deadlift": 145,
    "ex-overhead-press": 52.5,
  };

  history.forEach((session) => {
    session.topSets?.forEach((top) => {
      if (top.weightKg && top.reps) {
        // Epley 1RM formula: weight * (1 + reps / 30)
        const est1RM = Math.round(top.weightKg * (1 + top.reps / 30) * 2) / 2;
        if (liftMaxes[top.exerciseId] === undefined || est1RM > liftMaxes[top.exerciseId]!) {
          liftMaxes[top.exerciseId] = est1RM;
        }
      }
    });
  });

  const profile = evaluateStrengthProfile(liftMaxes, currentBW);

  return (
    <Card padding="md" className="flex flex-col gap-4 border border-border/70">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-brand/15 text-brand">
            <Award size={iconSize.sm} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">Strength Standards</h3>
            <p className="text-xs text-foreground-secondary">
              Big 4 relative to your {currentBW} kg bodyweight
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
            Overall
          </span>
          <p className="text-xs font-bold capitalize text-brand">
            {TIER_LABELS[profile.overallTier]}
          </p>
        </div>
      </div>

      {/* Lift Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {profile.evaluations.map((ev) => {
          const colors = TIER_COLORS[ev.currentTier];
          return (
            <div
              key={ev.exerciseId}
              className="flex flex-col rounded-xl bg-surface-elevated/70 p-3 border border-border/40"
            >
              <span className="text-xs font-semibold text-foreground-secondary truncate">
                {ev.shortName}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-base font-bold font-display tabular-nums text-foreground">
                  {ev.oneRepMaxKg}
                </span>
                <span className="text-[11px] text-foreground-secondary">kg</span>
                <span className="text-[11px] font-semibold text-foreground-secondary ml-auto tabular-nums">
                  {ev.ratio}×
                </span>
              </div>
              <span
                className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border self-start ${colors.text} ${colors.bg} ${colors.border}`}
              >
                {TIER_LABELS[ev.currentTier]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action link to full standards breakdown */}
      <Link
        href="/insights/strength"
        className="flex items-center justify-between rounded-xl bg-surface-elevated/50 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-surface-elevated hover:text-brand border border-border/50"
      >
        <span className="flex items-center gap-2">
          <Dumbbell size={iconSize.xs} className="text-brand" />
          View full strength standards & tier progressions
        </span>
        <ChevronRight size={iconSize.xs} className="text-foreground-secondary" />
      </Link>
    </Card>
  );
}
