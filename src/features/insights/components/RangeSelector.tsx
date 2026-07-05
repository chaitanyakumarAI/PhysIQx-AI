import { cn } from "@/lib/utils";
import { scoreTrendRangeLabels, type ScoreTrendRange } from "@/types/score";

export interface RangeSelectorProps {
  value: ScoreTrendRange;
  onChange: (range: ScoreTrendRange) => void;
  className?: string;
}

const ranges = Object.keys(scoreTrendRangeLabels) as ScoreTrendRange[];

/**
 * Vertical time-range picker for the score trend chart. Deliberately not
 * built on Chip — unselected options render as plain text here, not pills,
 * a distinct enough pattern from the horizontal filter rows on Train.
 */
export function RangeSelector({ value, onChange, className }: RangeSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Trend range"
      className={cn("flex flex-col items-end gap-1", className)}
    >
      {ranges.map((range) => {
        const selected = range === value;
        return (
          <button
            key={range}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(range)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
              selected
                ? "bg-brand/15 text-brand"
                : "text-foreground-secondary hover:text-foreground",
            )}
          >
            {scoreTrendRangeLabels[range]}
          </button>
        );
      })}
    </div>
  );
}
