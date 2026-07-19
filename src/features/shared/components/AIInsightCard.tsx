import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { type Insight, enforceTwoSentences } from "@/types/insight";

export interface AIInsightCardProps extends React.ComponentProps<"div"> {
  /** null renders the "still learning" fallback — never a blank card. */
  insight: Insight | null;
  onAction?: () => void;
}

/**
 * Coach card. Used by Home (single insight) and Insights ("What the data
 * says" cards) — shared here rather than owned by one feature, the same
 * promotion pattern as src/data/'s shared fixtures. Deliberately quiet
 * branding: "Coach", one lightbulb — no AI badging (user: it read as spam).
 */
export function AIInsightCard({
  className,
  insight,
  onAction,
  ...props
}: AIInsightCardProps) {
  return (
    <Card variant="accent" className={cn(className)} {...props}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Lightbulb size={iconSize.sm} aria-hidden className="text-brand" />
          <span className="text-sm font-semibold text-brand">Coach</span>
        </div>
        {insight?.actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="text-sm font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 rounded"
          >
            {insight.actionLabel} <span aria-hidden>↗</span>
          </button>
        )}
      </div>
      <p className="mt-3 text-sm text-foreground">
        {insight
          ? enforceTwoSentences(insight.body)
          : "Still learning your patterns — check back after a few more sessions."}
      </p>
    </Card>
  );
}
