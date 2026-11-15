import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import {
  muscleRecoveryStatusLabels,
  type MuscleRecoveryEntry,
  type MuscleRecoveryStatus,
} from "../lib/muscleRecovery";

export interface MuscleRecoveryCardProps {
  entries: MuscleRecoveryEntry[];
  className?: string;
}

const statusText: Record<MuscleRecoveryStatus, string> = {
  worked: "text-warning",
  recovering: "text-warning",
  nearly: "text-info",
  ready: "text-brand",
  untrained: "text-foreground-secondary",
};

const statusBar: Record<MuscleRecoveryStatus, "warning" | "info" | "brand" | "neutral"> = {
  worked: "warning",
  recovering: "warning",
  nearly: "info",
  ready: "brand",
  untrained: "neutral",
};

function agoLabel(entry: MuscleRecoveryEntry): string | null {
  if (entry.daysSince === null) return null;
  return entry.daysSince === 0 ? "today" : `${entry.daysSince}d`;
}

/**
 * Per-muscle recovery at a glance (design-inspiration pick, 2026-11-15):
 * a status word and bar per muscle group, estimated purely from how many
 * days ago the log last saw real work for it — no sensor claims.
 */
export function MuscleRecoveryCard({ entries, className }: MuscleRecoveryCardProps) {
  return (
    <Card padding="md" className={cn("flex flex-col gap-3", className)}>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {entries.map((entry) => {
          const ago = agoLabel(entry);
          return (
            <li
              key={entry.group}
              aria-label={`${entry.label}: ${muscleRecoveryStatusLabels[entry.status]}${ago ? `, last trained ${ago}` : ""}`}
              className="flex flex-col gap-1.5 rounded-xl bg-surface-elevated/60 p-2.5"
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold">{entry.label}</span>
                {ago && (
                  <span className="text-[10px] tabular-nums text-foreground-secondary">{ago}</span>
                )}
              </span>
              <span className={cn("text-xs font-semibold", statusText[entry.status])}>
                {muscleRecoveryStatusLabels[entry.status]}
              </span>
              <ProgressBar
                value={entry.percent ?? 0}
                size="sm"
                tone={statusBar[entry.status]}
                aria-hidden
              />
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-foreground-secondary">
        Estimated from the days since each muscle group last saw real work — most muscles rebuild
        in about 48–72 hours.
      </p>
    </Card>
  );
}
