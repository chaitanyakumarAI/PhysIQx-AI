import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import type { PillarId, PillarScore } from "@/types/score";

export interface HealthPillarSummaryProps extends React.ComponentProps<"div"> {
  pillars: PillarScore[];
  weakestPillarId?: PillarId;
}

const pillarTone: Record<PillarId, "brand" | "warning" | "info"> = {
  training: "brand",
  nutrition: "warning",
  recovery: "info",
  consistency: "brand",
};

/** The four-segment pillar row shown under the score on Home. */
export function HealthPillarSummary({
  className,
  pillars,
  weakestPillarId,
  ...props
}: HealthPillarSummaryProps) {
  return (
    <div
      className={cn("grid grid-cols-4 gap-3", className)}
      role="group"
      aria-label="Health pillar breakdown"
      {...props}
    >
      {pillars.map((pillar) => (
        <div key={pillar.id} className="flex flex-col items-center gap-2">
          <ProgressBar
            value={pillar.value}
            tone={pillarTone[pillar.id]}
            size="sm"
            aria-label={`${pillar.label} ${pillar.value} of 100`}
          />
          <span
            className={cn(
              "text-xs text-foreground-secondary",
              pillar.id === weakestPillarId && "font-semibold text-foreground",
            )}
          >
            {pillar.label}
          </span>
        </div>
      ))}
    </div>
  );
}
