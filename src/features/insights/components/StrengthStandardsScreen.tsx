"use client";

import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { iconSize } from "@/constants/icons";
import { DemoBanner } from "@/features/shared/components/DemoBanner";
import { useLedger } from "@/features/shared/hooks/useAthlete";
import { bestE1rmByExercise } from "@/lib/prEngine";
import {
  evaluateLift,
  standardsFor,
  TIER_COLORS,
  TIER_LABELS,
  TIER_ORDER,
} from "@/lib/strengthStandards";
import { cn } from "@/lib/utils";

/**
 * Big 4 standards, read-only and derived: best estimated 1RM from logged
 * sets (Epley, reps capped at 10) against tier thresholds scaled to the
 * athlete's latest weigh-in and sex. Nothing is editable here — the log is
 * the source of truth.
 */
export function StrengthStandardsScreen() {
  const { ledger, demo } = useLedger();
  const latest = [...ledger.weighIns].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
  const bodyweight = latest?.weightKg ?? null;
  const best = bestE1rmByExercise(ledger.sessions);

  return (
    <PageContainer>
      <div className="flex items-center gap-3 pt-6">
        <Link
          href="/insights"
          aria-label="Back to Insights"
          className="grid size-11 place-items-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          <ArrowLeft size={iconSize.sm} aria-hidden />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Strength standards</h1>
          <p className="text-xs text-foreground-secondary">
            {bodyweight
              ? `Scaled to your ${bodyweight} kg bodyweight${ledger.profile.sex ? ` · ${ledger.profile.sex} tables` : ""}`
              : "Scaled to your bodyweight"}
          </p>
        </div>
      </div>

      {demo && <DemoBanner />}

      {!bodyweight ? (
        <Card padding="lg" className="flex flex-col gap-3">
          <Scale size={iconSize.lg} className="text-brand" aria-hidden />
          <h2 className="font-semibold">Add your bodyweight first</h2>
          <p className="text-sm text-foreground-secondary">
            Standards are ratios of what you lift to what you weigh, so they need a recent weigh-in.
          </p>
          <Link href="/profile/body" className="text-sm font-semibold text-brand">
            Log your weight →
          </Link>
        </Card>
      ) : (
        <Section title="Your lifts">
          {standardsFor(ledger.profile.sex).map((benchmark) => {
            const e1rm = best.get(benchmark.exerciseId);
            const evaluation = e1rm ? evaluateLift(benchmark, e1rm, bodyweight) : null;
            const thresholds = TIER_ORDER.map((tier) => ({
              tier,
              kg: Math.round(benchmark.tiers[tier] * bodyweight * 2) / 2,
            }));
            return (
              <Card key={benchmark.exerciseId} padding="md" className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{benchmark.exerciseName}</h3>
                    <p className="text-xs text-foreground-secondary">
                      {evaluation
                        ? `${evaluation.oneRepMaxKg} kg est. 1RM · ${evaluation.ratio}× bodyweight`
                        : "Not logged yet — log a working set to rate it"}
                    </p>
                  </div>
                  {evaluation && (
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        TIER_COLORS[evaluation.currentTier].text,
                        TIER_COLORS[evaluation.currentTier].bg,
                        TIER_COLORS[evaluation.currentTier].border,
                      )}
                    >
                      {TIER_LABELS[evaluation.currentTier]}
                    </span>
                  )}
                </div>
                {evaluation?.nextTier && (
                  <div className="flex flex-col gap-1.5">
                    <ProgressBar
                      value={evaluation.tierProgressPercent}
                      max={100}
                      aria-label={`Progress to ${TIER_LABELS[evaluation.nextTier]}`}
                    />
                    <p className="text-xs text-foreground-secondary">
                      {evaluation.kgToNextTier} kg to {TIER_LABELS[evaluation.nextTier]}
                    </p>
                  </div>
                )}
                <dl className="grid grid-cols-5 gap-1 text-center">
                  {thresholds.map(({ tier, kg }) => (
                    <div
                      key={tier}
                      className={cn(
                        "rounded-lg px-1 py-1.5",
                        evaluation?.currentTier === tier ? "bg-brand/15" : "bg-surface-elevated/60",
                      )}
                    >
                      <dt className="truncate text-[10px] text-foreground-muted">{TIER_LABELS[tier]}</dt>
                      <dd className="text-xs font-semibold tabular-nums">{kg} kg</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            );
          })}
        </Section>
      )}

      <p className="px-1 text-xs text-foreground-muted">
        Estimated 1RM = weight × (1 + reps ÷ 30), with reps capped at 10. Tiers follow published
        bodyweight-ratio tables (beginner → elite); female tables are scaled per lift.
      </p>
    </PageContainer>
  );
}
