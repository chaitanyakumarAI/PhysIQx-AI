"use client";

import { useState, useId } from "react";
import Link from "next/link";
import { ArrowLeft, Award, Dumbbell, Sparkles, TrendingUp, Info } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { iconSize } from "@/constants/icons";
import {
  evaluateStrengthProfile,
  TIER_COLORS,
  TIER_LABELS,
  TIER_ORDER,
  type StrengthTier,
  type LiftEvaluation,
} from "@/lib/strengthStandards";
import { useSessionStore } from "@/store/sessionStore";
import { useProfileStore } from "@/store/profileStore";

export function StrengthStandardsScreen() {
  const history = useSessionStore((state) => state.history);
  const weights = useProfileStore((state) => state.weightEntries);
  const initialBW = weights && weights.length > 0 ? weights.at(-1)!.weightKg : 75;

  const [bodyweight, setBodyweight] = useState<number>(initialBW);
  const bodyweightInputId = useId();

  // Derive initial 1RMs from user history or realistic benchmarks
  const [customLifts, setCustomLifts] = useState<Record<string, number>>(() => {
    const maxes: Record<string, number> = {
      "ex-bench-press": 85,
      "ex-squat": 120,
      "ex-deadlift": 150,
      "ex-overhead-press": 55,
    };
    history.forEach((session) => {
      session.topSets?.forEach((top) => {
        if (top.weightKg && top.reps) {
          const est1RM = Math.round(top.weightKg * (1 + top.reps / 30) * 2) / 2;
          if (maxes[top.exerciseId] === undefined || est1RM > maxes[top.exerciseId]!) {
            maxes[top.exerciseId] = est1RM;
          }
        }
      });
    });
    return maxes;
  });

  const profile = evaluateStrengthProfile(customLifts, bodyweight);

  function updateLift(exerciseId: string, delta: number) {
    setCustomLifts((prev) => ({
      ...prev,
      [exerciseId]: Math.max(0, Math.round(((prev[exerciseId] ?? 0) + delta) * 2) / 2),
    }));
  }

  return (
    <PageContainer>
      {/* Top Header */}
      <div className="flex items-center gap-3 pt-6">
        <Link
          href="/insights"
          aria-label="Back to Insights"
          className="grid size-11 place-items-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          <ArrowLeft size={iconSize.sm} aria-hidden />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Strength Standards</h1>
          <p className="text-xs text-foreground-secondary">
            Canonical weight-class percentiles & Big 4 benchmarks
          </p>
        </div>
      </div>

      {/* Bodyweight Selector Card */}
      <Card padding="md" className="flex items-center justify-between gap-4 border border-border/70">
        <div className="flex flex-col">
          <label htmlFor={bodyweightInputId} className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
            Reference Bodyweight
          </label>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Standards scale proportionally with total mass
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setBodyweight((prev) => Math.max(40, prev - 1))}
            className="px-2 py-1 rounded bg-surface-elevated text-xs font-semibold border border-border/50 text-foreground"
          >
            -1
          </button>
          <div className="flex items-baseline gap-1 px-1">
            <input
              id={bodyweightInputId}
              type="number"
              min={40}
              max={200}
              value={bodyweight}
              onChange={(e) => setBodyweight(Number(e.target.value) || 75)}
              className="w-14 bg-transparent text-center font-display text-lg font-bold tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-brand rounded"
            />
            <span className="text-xs font-semibold text-foreground-secondary">kg</span>
          </div>
          <button
            type="button"
            onClick={() => setBodyweight((prev) => Math.min(180, prev + 1))}
            className="px-2 py-1 rounded bg-surface-elevated text-xs font-semibold border border-border/50 text-foreground"
          >
            +1
          </button>
        </div>
      </Card>

      {/* Overall Score & Total Hero */}
      <Card padding="lg" className="flex flex-col gap-4 bg-gradient-to-br from-surface to-surface-elevated border border-border/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-full bg-brand/15 text-brand">
              <Award size={iconSize.md} />
            </span>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
                Overall Strength Tier
              </span>
              <h2 className="text-xl font-bold capitalize text-foreground">
                {TIER_LABELS[profile.overallTier]} Lifter
              </h2>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
              Strength Score
            </span>
            <p className="font-display text-2xl font-bold text-brand tabular-nums">
              {profile.totalScore}
              <span className="text-sm font-semibold text-foreground-secondary">/100</span>
            </p>
          </div>
        </div>

        {/* Big 3 and Big 4 Totals */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
          <div className="flex flex-col rounded-xl bg-surface/70 p-3 border border-border/40">
            <span className="text-xs font-semibold text-foreground-secondary">
              Powerlifting Big 3 Total
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-xl font-bold tabular-nums text-foreground">
                {profile.big3TotalKg}
              </span>
              <span className="text-xs font-semibold text-foreground-secondary">kg</span>
              <span className="text-xs text-brand font-semibold ml-auto tabular-nums">
                {(profile.big3TotalKg / bodyweight).toFixed(2)}× BW
              </span>
            </div>
          </div>

          <div className="flex flex-col rounded-xl bg-surface/70 p-3 border border-border/40">
            <span className="text-xs font-semibold text-foreground-secondary">
              Combined Big 4 Total
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-xl font-bold tabular-nums text-foreground">
                {profile.big4TotalKg}
              </span>
              <span className="text-xs font-semibold text-foreground-secondary">kg</span>
              <span className="text-xs text-brand font-semibold ml-auto tabular-nums">
                {(profile.big4TotalKg / bodyweight).toFixed(2)}× BW
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Lift Deep Dives */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-foreground">Big 4 Lift Breakdowns</h2>

        {profile.evaluations.map((ev: LiftEvaluation) => {
          const tierColor = TIER_COLORS[ev.currentTier];
          return (
            <Card key={ev.exerciseId} padding="md" className="flex flex-col gap-3.5 border border-border/70">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{ev.exerciseName}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${tierColor.text} ${tierColor.bg} ${tierColor.border}`}
                    >
                      {TIER_LABELS[ev.currentTier]}
                    </span>
                    <span className="text-xs font-semibold text-foreground-secondary tabular-nums">
                      {ev.ratio}× bodyweight
                    </span>
                  </div>
                </div>

                {/* 1RM Stepper */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateLift(ev.exerciseId, -2.5)}
                    className="size-7 rounded bg-surface-elevated hover:bg-surface-elevated/80 text-xs font-semibold text-foreground grid place-items-center border border-border/50"
                  >
                    -
                  </button>
                  <span className="min-w-14 text-center font-display font-bold tabular-nums text-foreground text-sm">
                    {ev.oneRepMaxKg} kg
                  </span>
                  <button
                    type="button"
                    onClick={() => updateLift(ev.exerciseId, 2.5)}
                    className="size-7 rounded bg-surface-elevated hover:bg-surface-elevated/80 text-xs font-semibold text-foreground grid place-items-center border border-border/50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Tier Progress Bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-foreground-secondary">
                    {ev.nextTier
                      ? `Progress to ${TIER_LABELS[ev.nextTier]}`
                      : "Peak Elite Tier Achieved"}
                  </span>
                  <span className="font-semibold tabular-nums text-brand">
                    {ev.nextTier ? `${ev.tierProgressPercent}%` : "100%"}
                  </span>
                </div>
                <ProgressBar
                  value={ev.tierProgressPercent}
                  size="sm"
                  tone="brand"
                  aria-label={`Progress to ${ev.nextTier ?? "elite"}`}
                />
              </div>

              {/* Thresholds Spectrum */}
              <div className="grid grid-cols-5 gap-1 text-center text-[10px] pt-1">
                {TIER_ORDER.map((tier: StrengthTier) => {
                  const targetKg = ev.tierThresholdKg[tier];
                  const isCurrent = tier === ev.currentTier;
                  return (
                    <div
                      key={tier}
                      className={`flex flex-col rounded-lg p-1.5 border transition-colors ${
                        isCurrent
                          ? "bg-brand/15 border-brand text-brand font-bold"
                          : "bg-surface-elevated/50 border-border/30 text-foreground-secondary"
                      }`}
                    >
                      <span className="capitalize">{tier.slice(0, 3)}</span>
                      <span className="font-display font-semibold tabular-nums mt-0.5">
                        {targetKg}k
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Next Tier Advice */}
              {ev.nextTier && (
                <div className="flex items-center justify-between rounded-xl bg-surface-elevated/60 px-3 py-2 text-xs border border-border/40">
                  <span className="text-foreground-secondary">
                    Next milestone ({TIER_LABELS[ev.nextTier]}):
                  </span>
                  <span className="font-semibold text-brand tabular-nums">
                    +{ev.kgToNextTier} kg ({ev.tierThresholdKg[ev.nextTier]} kg)
                  </span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Methodology Disclaimer */}
      <Card padding="sm" className="flex items-start gap-2.5 bg-surface-elevated/50 border border-border/40 text-xs text-foreground-secondary">
        <Info size={iconSize.xs} className="shrink-0 mt-0.5 text-brand" />
        <p className="leading-relaxed text-[11px]">
          Standards are calibrated from strength physiology databases (Dr. Lon Kilgore & Mark Rippetoe model). 1RMs are estimated from your logged sets using the Epley formula (\(w \times (1 + r / 30)\)) and scaled to your bodyweight.
        </p>
      </Card>
    </PageContainer>
  );
}
