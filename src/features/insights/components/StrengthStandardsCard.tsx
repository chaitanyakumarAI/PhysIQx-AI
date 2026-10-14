"use client";

import Link from "next/link";
import { Award, ChevronRight, Dumbbell, Scale } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { bestE1rmByExercise } from "@/lib/prEngine";
import {
  evaluateLift,
  standardsFor,
  TIER_COLORS,
  TIER_LABELS,
  TIER_ORDER,
} from "@/lib/strengthStandards";
import { cn } from "@/lib/utils";
import type { Ledger } from "@/types/ledger";

export interface StrengthStandardsCardProps {
  ledger: Ledger;
}

/**
 * The Big 4 against bodyweight standards — only from lifts actually
 * logged, against the athlete's actual latest weigh-in. Missing inputs get
 * an honest prompt, never a made-up default.
 */
export function StrengthStandardsCard({ ledger }: StrengthStandardsCardProps) {
  const latest = [...ledger.weighIns].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
  const bodyweight = latest?.weightKg ?? null;
  const best = bestE1rmByExercise(ledger.sessions);
  const lifts = standardsFor(ledger.profile.sex).map((benchmark) => {
    const e1rm = best.get(benchmark.exerciseId);
    return {
      benchmark,
      evaluation: e1rm && bodyweight ? evaluateLift(benchmark, e1rm, bodyweight) : null,
    };
  });
  const rated = lifts.flatMap((lift) => (lift.evaluation ? [lift.evaluation] : []));
  const overall =
    rated.length > 0
      ? TIER_ORDER[
          Math.round(
            rated.reduce((sum, lift) => sum + TIER_ORDER.indexOf(lift.currentTier), 0) /
              rated.length,
          )
        ]!
      : null;

  return (
    <Card padding="md" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-brand/15 text-brand">
            <Award size={iconSize.sm} aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-bold">Strength standards</h3>
            <p className="text-xs text-foreground-secondary">
              {bodyweight ? `Big 4 vs. your ${bodyweight} kg bodyweight` : "Big 4 vs. your bodyweight"}
            </p>
          </div>
        </div>
        {overall && (
          <div className="text-right">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
              Overall
            </span>
            <p className="text-xs font-bold text-brand">{TIER_LABELS[overall]}</p>
          </div>
        )}
      </div>

      {!bodyweight ? (
        <Link
          href="/profile/body"
          className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface-elevated/50 p-3 text-sm hover:bg-surface-elevated"
        >
          <Scale size={iconSize.sm} className="text-brand" aria-hidden />
          <span className="flex-1">Add your bodyweight to rate your lifts.</span>
          <ChevronRight size={iconSize.xs} className="text-foreground-secondary" aria-hidden />
        </Link>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {lifts.map(({ benchmark, evaluation }) => (
            <div
              key={benchmark.exerciseId}
              className="flex min-w-0 flex-col justify-between rounded-xl border border-border/40 bg-surface-elevated/70 p-3.5"
            >
              <div className="flex items-start justify-between gap-1">
                <span className="truncate text-xs font-semibold" title={benchmark.exerciseName}>
                  {benchmark.shortName}
                </span>
                {evaluation && (
                  <span className="shrink-0 text-[11px] font-bold tabular-nums text-foreground-secondary">
                    {evaluation.ratio}×
                  </span>
                )}
              </div>
              {evaluation ? (
                <>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-display text-lg font-bold tabular-nums">
                      {evaluation.oneRepMaxKg}
                    </span>
                    <span className="text-xs text-foreground-secondary">kg est. 1RM</span>
                  </div>
                  <span
                    className={cn(
                      "mt-2.5 self-start rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      TIER_COLORS[evaluation.currentTier].text,
                      TIER_COLORS[evaluation.currentTier].bg,
                      TIER_COLORS[evaluation.currentTier].border,
                    )}
                  >
                    {TIER_LABELS[evaluation.currentTier]}
                  </span>
                </>
              ) : (
                <p className="mt-2 text-xs text-foreground-muted">Not logged yet</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Link
        href="/insights/strength"
        className="flex items-center justify-between rounded-xl border border-border/50 bg-surface-elevated/50 px-3 py-2 text-xs font-semibold transition-colors hover:bg-surface-elevated hover:text-brand"
      >
        <span className="flex items-center gap-2">
          <Dumbbell size={iconSize.xs} className="text-brand" aria-hidden />
          Tiers and what it takes to reach the next one
        </span>
        <ChevronRight size={iconSize.xs} className="text-foreground-secondary" aria-hidden />
      </Link>
    </Card>
  );
}
