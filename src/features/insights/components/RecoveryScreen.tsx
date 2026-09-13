"use client";

import Link from "next/link";
import { ArrowLeft, HeartPulse, Sparkles, Activity, Droplets, Zap, Shield, Dumbbell } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Mascot } from "@/components/mascots/Mascot";
import { iconSize } from "@/constants/icons";
import {
  calculateReadiness,
  READINESS_TIER_META,
  type SessionRecord,
} from "@/lib/recoveryEngine";
import { useSessionStore } from "@/store/sessionStore";
import { useHydrationStore } from "@/store/hydrationStore";

export function RecoveryScreen() {
  const history = useSessionStore((state) => state.history);
  const hydrationEntries = useHydrationStore((state) => state.entries);
  const hydrationTarget = useHydrationStore((state) => state.dailyGoalMl ?? 3000);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayWater = hydrationEntries
    .filter((e) => e.timestamp.startsWith(todayStr))
    .reduce((sum, e) => sum + e.amountMl, 0);

  const sessionRecords: SessionRecord[] = history.map((s) => ({
    date: s.completedAt || s.date,
    totalVolumeKg: s.totalVolumeKg,
    avgRpe: s.avgRpe,
    durationSec: s.durationSec,
  }));

  const readiness = calculateReadiness(sessionRecords, todayWater, hydrationTarget, 3);
  const tierMeta = READINESS_TIER_META[readiness.tier];

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
          <h1 className="font-display text-2xl font-bold">Recovery & Readiness</h1>
          <p className="text-xs text-foreground-secondary">
            Systemic capacity, ACWR workload ratio & recovery markers
          </p>
        </div>
      </div>

      {/* Hero Readiness Card */}
      <Card padding="lg" className="flex flex-col gap-4 border border-border/80 bg-gradient-to-br from-surface to-surface-elevated">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-rose-500/15 text-rose-400">
              <HeartPulse size={iconSize.md} />
            </span>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
                Daily Capacity Score
              </span>
              <h2 className="text-xl font-bold capitalize text-foreground">
                {tierMeta.label}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="font-display text-3xl font-bold text-brand tabular-nums">
              {readiness.score}
              <span className="text-base font-semibold text-foreground-secondary">%</span>
            </span>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-foreground-secondary border-t border-border/50 pt-3">
          {readiness.headline} {readiness.recommendation}
        </p>
      </Card>

      {/* ACWR Workload Ratio Card */}
      <Card padding="md" className="flex flex-col gap-3.5 border border-border/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={iconSize.sm} className="text-brand" />
            <h3 className="text-sm font-bold text-foreground">Acute-to-Chronic Workload Ratio (ACWR)</h3>
          </div>
          <span className="font-display font-bold text-brand tabular-nums text-sm">
            {readiness.acwrRatio}×
          </span>
        </div>

        <p className="text-xs text-foreground-secondary leading-relaxed">
          Compares your acute 7-day fatigue demand against your 28-day chronic fitness adaptation. A ratio between 0.8× and 1.3× represents the athletic progression sweet spot.
        </p>

        {/* ACWR Spectrum Bar */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex justify-between text-[10px] text-foreground-secondary font-semibold">
            <span>Under-stim (&lt;0.8)</span>
            <span className="text-brand">Sweet Spot (0.8–1.3)</span>
            <span>Overreach (&gt;1.5)</span>
          </div>
          <div className="relative h-2 w-full rounded-full bg-surface-elevated overflow-hidden">
            <div
              className="absolute h-full rounded-full bg-brand"
              style={{
                width: `${Math.min(100, Math.max(10, (readiness.acwrRatio / 2.0) * 100))}%`,
              }}
            />
          </div>
        </div>
      </Card>

      {/* 4 Pillars Deep Dive */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-foreground">Biological Recovery Dimensions</h3>

        {/* Neuromuscular */}
        <Card padding="sm" className="flex items-start gap-3 border border-border/60">
          <span className="grid size-9 place-items-center rounded-full bg-amber-500/15 text-amber-400 shrink-0 mt-0.5">
            <Zap size={iconSize.sm} />
          </span>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <h4 className="text-xs font-bold text-foreground">Neuromuscular Excitability</h4>
              <span className="font-display text-xs font-bold tabular-nums text-foreground">
                {readiness.pillars.neuromuscular}%
              </span>
            </div>
            <p className="text-[11px] text-foreground-secondary mt-0.5">
              Reflects central motor unit recruitment fatigue from heavy compound sets and near-failure work.
            </p>
            <ProgressBar value={readiness.pillars.neuromuscular} size="sm" tone="brand" className="mt-2" />
          </div>
        </Card>

        {/* Connective Tissue */}
        <Card padding="sm" className="flex items-start gap-3 border border-border/60">
          <span className="grid size-9 place-items-center rounded-full bg-emerald-500/15 text-emerald-400 shrink-0 mt-0.5">
            <Shield size={iconSize.sm} />
          </span>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <h4 className="text-xs font-bold text-foreground">Tendon & Joint Integrity</h4>
              <span className="font-display text-xs font-bold tabular-nums text-foreground">
                {readiness.pillars.connectiveTissue}%
              </span>
            </div>
            <p className="text-[11px] text-foreground-secondary mt-0.5">
              Tracks cumulative joint shear forces and multi-day training density without rest intervals.
            </p>
            <ProgressBar value={readiness.pillars.connectiveTissue} size="sm" tone="brand" className="mt-2" />
          </div>
        </Card>

        {/* Autonomic Nervous */}
        <Card padding="sm" className="flex items-start gap-3 border border-border/60">
          <span className="grid size-9 place-items-center rounded-full bg-rose-500/15 text-rose-400 shrink-0 mt-0.5">
            <Activity size={iconSize.sm} />
          </span>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <h4 className="text-xs font-bold text-foreground">Autonomic Balance</h4>
              <span className="font-display text-xs font-bold tabular-nums text-foreground">
                {readiness.pillars.autonomicNervous}%
              </span>
            </div>
            <p className="text-[11px] text-foreground-secondary mt-0.5">
              Measures sympathetic vs parasympathetic tone, workload equilibrium, and systemic stress.
            </p>
            <ProgressBar value={readiness.pillars.autonomicNervous} size="sm" tone="brand" className="mt-2" />
          </div>
        </Card>

        {/* Hydration */}
        <Card padding="sm" className="flex items-start gap-3 border border-border/60">
          <span className="grid size-9 place-items-center rounded-full bg-cyan-500/15 text-cyan-400 shrink-0 mt-0.5">
            <Droplets size={iconSize.sm} />
          </span>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <h4 className="text-xs font-bold text-foreground">Cellular Glycogen & Hydration</h4>
              <span className="font-display text-xs font-bold tabular-nums text-foreground">
                {readiness.pillars.glycogenHydration}%
              </span>
            </div>
            <p className="text-[11px] text-foreground-secondary mt-0.5">
              Connective tissue lubrication, fluid volume ({todayWater}ml / {hydrationTarget}ml), and substrate availability.
            </p>
            <ProgressBar value={readiness.pillars.glycogenHydration} size="sm" tone="info" className="mt-2" />
          </div>
        </Card>
      </div>

      {/* Dual Mascot Take */}
      <div className="grid grid-cols-2 gap-3">
        {/* Kix */}
        <Card padding="sm" className="flex flex-col gap-2 border border-brand/20 bg-brand/5">
          <div className="flex items-center gap-2">
            <Mascot pose="kix-determined" size={32} shape="circle" />
            <span className="text-xs font-bold text-brand">Kix • Intensity</span>
          </div>
          <p className="text-[11px] text-foreground-secondary leading-snug">
            {readiness.score >= 70
              ? "Attack your target weights today. The machine is running hot."
              : "Keep ego in check and stick to clean reps without missing."}
          </p>
        </Card>

        {/* Nyra */}
        <Card padding="sm" className="flex flex-col gap-2 border border-info/20 bg-info/5">
          <div className="flex items-center gap-2">
            <Mascot pose="nyra-nod" size={32} shape="circle" />
            <span className="text-xs font-bold text-info">Nyra • Recovery</span>
          </div>
          <p className="text-[11px] text-foreground-secondary leading-snug">
            {todayWater < hydrationTarget
              ? "Drink 500ml water before training to optimize fascial sliding."
              : "Hydration balance is optimal for muscle protein synthesis."}
          </p>
        </Card>
      </div>

      {/* Suggested Action Button */}
      <Button size="lg" fullWidth asChild>
        <Link href={readiness.suggestedAction.href}>
          {readiness.suggestedAction.label}
        </Link>
      </Button>
    </PageContainer>
  );
}
