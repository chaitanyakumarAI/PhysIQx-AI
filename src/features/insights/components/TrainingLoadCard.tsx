import Link from "next/link";
import { Activity, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { loadStatusLabels, type LoadStatus, type TrainingLoad } from "@/lib/trainingLoad";

const statusTone: Record<LoadStatus, string> = {
  baseline: "bg-white/[0.06] text-foreground-secondary",
  fresh: "bg-info/15 text-info",
  balanced: "bg-brand/15 text-brand",
  building: "bg-warning/15 text-warning",
  high: "bg-danger/15 text-danger",
};

export interface TrainingLoadCardProps {
  load: TrainingLoad;
  /** Compact = the Insights summary that links to the full screen. */
  href?: string;
  className?: string;
}

/** This week's training stress against the athlete's own baseline. */
export function TrainingLoadCard({ load, href, className }: TrainingLoadCardProps) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-white/[0.06] text-foreground">
            <Activity size={iconSize.sm} aria-hidden />
          </span>
          <h3 className="text-sm font-bold">Training load</h3>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            statusTone[load.status],
          )}
        >
          {loadStatusLabels[load.status]}
        </span>
      </div>
      <p className="text-sm">{load.headline}</p>
      <p className="text-sm text-foreground-secondary">{load.advice}</p>
      <dl className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-surface-elevated/60 p-2.5">
          <dt className="text-[11px] text-foreground-muted">This week</dt>
          <dd className="font-display text-base font-bold tabular-nums">
            {(load.weekVolumeKg / 1000).toFixed(1)} t
          </dd>
        </div>
        <div className="rounded-xl bg-surface-elevated/60 p-2.5">
          <dt className="text-[11px] text-foreground-muted">4-wk avg</dt>
          <dd className="font-display text-base font-bold tabular-nums">
            {load.baselineWeeklyVolumeKg !== null
              ? `${(load.baselineWeeklyVolumeKg / 1000).toFixed(1)} t`
              : "—"}
          </dd>
        </div>
        <div className="rounded-xl bg-surface-elevated/60 p-2.5">
          <dt className="text-[11px] text-foreground-muted">Days in a row</dt>
          <dd className="font-display text-base font-bold tabular-nums">
            {load.consecutiveTrainingDays}
          </dd>
        </div>
      </dl>
    </>
  );

  if (!href) {
    return <Card padding="md" className={cn("flex flex-col gap-3", className)}>{body}</Card>;
  }
  return (
    <Link href={href} className="block rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60">
      <Card padding="md" className={cn("flex flex-col gap-3 transition-colors hover:border-white/[0.14]", className)}>
        {body}
        <span className="flex items-center gap-1 text-xs font-semibold text-foreground-secondary">
          How load is measured
          <ChevronRight size={iconSize.xs} aria-hidden />
        </span>
      </Card>
    </Link>
  );
}
