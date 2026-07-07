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
export function StatTile({ icon: Icon, value, label, tone = "neutral", className }: StatTileProps) {
  return (
    <Card
      padding="md"
      className={cn("flex flex-col items-center justify-center gap-1.5 text-center", className)}
    >
      <span className={cn("grid size-9 place-items-center rounded-full", toneClasses[tone])}>
        <Icon size={iconSize.sm} aria-hidden />
      </span>
      <span className="font-display text-xl font-bold tabular-nums">{value}</span>
      <span className="text-xs text-foreground-secondary">{label}</span>
    </Card>
  );
}
