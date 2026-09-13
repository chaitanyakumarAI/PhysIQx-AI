"use client";

import Link from "next/link";
import { ChevronRight, HeartPulse, Sparkles, Activity } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { iconSize } from "@/constants/icons";
import {
  calculateReadiness,
  READINESS_TIER_META,
  type SessionRecord,
} from "@/lib/recoveryEngine";
import { useSessionStore } from "@/store/sessionStore";
import { useHydrationStore } from "@/store/hydrationStore";

export function RecoveryReadinessCard() {
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
    <Card padding="md" className="flex flex-col gap-4 border border-border/70">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-rose-500/15 text-rose-400">
            <HeartPulse size={iconSize.sm} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">Recovery & Readiness</h3>
            <p className="text-xs text-foreground-secondary">
              Neuromuscular & systemic training capacity
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${tierMeta.text} ${tierMeta.bg} ${tierMeta.border}`}
        >
          {tierMeta.label}
        </span>
      </div>

      {/* Main Meter & Score */}
      <div className="flex items-center justify-between rounded-xl bg-surface-elevated/70 p-3.5 border border-border/40">
        <div>
          <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
            Systemic Readiness
          </span>
          <p className="mt-0.5 text-xs text-foreground leading-snug">
            {readiness.headline}
          </p>
        </div>
        <div className="text-right">
          <span className="font-display text-2xl font-bold tabular-nums text-brand">
            {readiness.score}
            <span className="text-sm font-semibold text-foreground-secondary">%</span>
          </span>
        </div>
      </div>

      {/* 4 Pillar Breakdown Mini-Gauges */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex flex-col gap-1 rounded-lg bg-surface-elevated/40 p-2 border border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-foreground-secondary text-[11px]">Neuromuscular</span>
            <span className="font-semibold font-display tabular-nums text-foreground text-[11px]">
              {readiness.pillars.neuromuscular}%
            </span>
          </div>
          <ProgressBar value={readiness.pillars.neuromuscular} size="sm" tone="brand" />
        </div>

        <div className="flex flex-col gap-1 rounded-lg bg-surface-elevated/40 p-2 border border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-foreground-secondary text-[11px]">Connective Tissue</span>
            <span className="font-semibold font-display tabular-nums text-foreground text-[11px]">
              {readiness.pillars.connectiveTissue}%
            </span>
          </div>
          <ProgressBar value={readiness.pillars.connectiveTissue} size="sm" tone="brand" />
        </div>

        <div className="flex flex-col gap-1 rounded-lg bg-surface-elevated/40 p-2 border border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-foreground-secondary text-[11px]">Autonomic CNS</span>
            <span className="font-semibold font-display tabular-nums text-foreground text-[11px]">
              {readiness.pillars.autonomicNervous}%
            </span>
          </div>
          <ProgressBar value={readiness.pillars.autonomicNervous} size="sm" tone="brand" />
        </div>

        <div className="flex flex-col gap-1 rounded-lg bg-surface-elevated/40 p-2 border border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-foreground-secondary text-[11px]">Hydration Recovery</span>
            <span className="font-semibold font-display tabular-nums text-foreground text-[11px]">
              {readiness.pillars.glycogenHydration}%
            </span>
          </div>
          <ProgressBar value={readiness.pillars.glycogenHydration} size="sm" tone="info" />
        </div>
      </div>

      {/* Action link */}
      <Link
        href="/insights/recovery"
        className="flex items-center justify-between rounded-xl bg-surface-elevated/50 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-surface-elevated hover:text-brand border border-border/50"
      >
        <span className="flex items-center gap-2">
          <Activity size={iconSize.xs} className="text-rose-400" />
          View deep recovery diagnostics & ACWR workload ratio
        </span>
        <ChevronRight size={iconSize.xs} className="text-foreground-secondary" />
      </Link>
    </Card>
  );
}
