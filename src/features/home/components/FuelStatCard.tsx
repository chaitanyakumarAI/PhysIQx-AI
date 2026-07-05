import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import type { FuelProgress } from "@/types/nutrition";

export interface FuelStatCardProps extends React.ComponentProps<"div"> {
  fuel: FuelProgress;
  icon: LucideIcon;
  tone: "info" | "brand";
}

const iconWrapTone = {
  info: "bg-info/15 text-info",
  brand: "bg-brand/15 text-brand",
} as const;

export function FuelStatCard({
  className,
  fuel,
  icon: Icon,
  tone,
  ...props
}: FuelStatCardProps) {
  return (
    <Card className={cn("flex flex-col gap-4", className)} {...props}>
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "grid size-9 place-items-center rounded-full",
            iconWrapTone[tone],
          )}
        >
          <Icon size={iconSize.sm} aria-hidden />
        </div>
        <span className="text-sm font-semibold text-foreground-secondary">
          {fuel.percent}%
        </span>
      </div>
      <div>
        <p className="font-display text-2xl font-bold">
          {fuel.current}
          <span className="text-base font-normal text-foreground-secondary">
            {" "}
            / {fuel.goal}
            {fuel.unit}
          </span>
        </p>
        <p className="text-sm text-foreground-secondary">{fuel.label}</p>
      </div>
      <ProgressBar
        value={fuel.percent}
        tone={tone}
        aria-label={`${fuel.label} ${fuel.percent}%`}
      />
    </Card>
  );
}
