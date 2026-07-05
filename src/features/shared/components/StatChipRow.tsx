import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface StatEntry {
  label: string;
  value: string;
}

export interface StatChipRowProps {
  stats: StatEntry[];
  /** Explicit, not derived from stats.length — the two current consumers
   *  need 3 and 2 respectively; an inline dynamic grid-template was tried
   *  and reverted in favor of this simpler, typed prop. */
  columns?: 2 | 3;
  className?: string;
}

/**
 * Row of label/value stat cards. Promoted from Profile once Onboarding's
 * DNA Result step needed the same pattern at a different column count —
 * same promotion rule as AIInsightCard.
 */
export function StatChipRow({ stats, columns = 3, className }: StatChipRowProps) {
  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 2 ? "grid-cols-2" : "grid-cols-3",
        className,
      )}
    >
      {stats.map((stat) => (
        <Card
          key={stat.label}
          padding="sm"
          className="flex flex-col items-center gap-1 text-center"
        >
          <span className="font-display text-lg font-bold">{stat.value}</span>
          <span className="text-xs uppercase tracking-[0.1em] text-foreground-secondary">
            {stat.label}
          </span>
        </Card>
      ))}
    </div>
  );
}
