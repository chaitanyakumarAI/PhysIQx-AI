import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { iconSize } from "@/constants/icons";

export interface DeltaBadgeProps {
  value: number;
  /** Appended after the number verbatim — include a leading space for text
   *  suffixes ("this week") or omit it for units ("kg"). */
  suffix?: string;
  className?: string;
}

/**
 * Signed-change badge: up/down icon, brand/danger tone, "+N"/"N" formatting.
 * Generic — no knowledge of score, PR, or any other domain concept.
 */
export function DeltaBadge({ value, suffix = "", className }: DeltaBadgeProps) {
  const Icon = value >= 0 ? TrendingUp : TrendingDown;

  return (
    <Badge tone={value >= 0 ? "brand" : "danger"} className={className}>
      <Icon size={iconSize.xs} aria-hidden />
      {value >= 0 ? "+" : ""}
      {value}
      {suffix}
    </Badge>
  );
}
