import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";

export interface StatTileProps {
  icon: LucideIcon;
  /** Pre-formatted — this component doesn't know units ("62%", "27", "4.2L"). */
  value: string;
  label: string;
  tone?: "brand" | "warning" | "info" | "neutral";
  /** Denser rendering for secondary-tier stats — smaller numeral and icon. */
  compact?: boolean;
  className?: string;
}

const toneClasses: Record<NonNullable<StatTileProps["tone"]>, string> = {
  brand: "bg-brand/15 text-brand",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/15 text-info",
  neutral: "bg-surface-elevated text-foreground-secondary",
};

/**
 * Small bento cell: icon + big mono numeral + label. Domain-agnostic (no
 * pillar/metric-specific knowledge) — built for the Home/Insights bento
 * density pass, but generic enough for any compact stat.
 */
export function StatTile({
  icon: Icon,
  value,
  label,
  tone = "neutral",
  compact = false,
  className,
}: StatTileProps) {
  return (
    <Card
      padding={compact ? "sm" : "md"}
      className={cn("flex flex-col items-center justify-center gap-1.5 text-center", className)}
    >
      <span
        className={cn(
          "grid place-items-center rounded-full",
          compact ? "size-7" : "size-9",
          toneClasses[tone],
        )}
      >
        <Icon size={compact ? iconSize.xs : iconSize.sm} aria-hidden />
      </span>
      <span
        className={cn(
          "font-display font-bold tabular-nums",
          compact ? "text-base" : "text-xl",
        )}
      >
        {value}
      </span>
      <span className="text-xs text-foreground-secondary">{label}</span>
    </Card>
  );
}
