import { Clock, Dumbbell, Play, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { missionIntensityLabels, type Mission } from "@/types/training";

export interface DailyMissionCardProps extends React.ComponentProps<"div"> {
  /** null renders the rest-day state — never a blank card. */
  mission: Mission | null;
  onStart?: () => void;
}

const intensityTone = {
  low: "neutral",
  moderate: "info",
  high: "warning",
} as const;

export function DailyMissionCard({
  className,
  mission,
  onStart,
  ...props
}: DailyMissionCardProps) {
  if (!mission) {
    return (
      <Card variant="accent" padding="lg" className={className} {...props}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-secondary">
          Today
        </p>
        <h3 className="mt-2 text-xl font-bold">Rest day</h3>
        <p className="mt-1 text-sm text-foreground-secondary">
          Recovery counts too — your score reflects it.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="accent" padding="lg" className={cn(className)} {...props}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {mission.aiProgrammed && (
              <Badge tone="brand">
                <Sparkles size={iconSize.xs} aria-hidden />
                AI Programmed
              </Badge>
            )}
            <span className="text-sm font-semibold text-brand">
              +{mission.xpReward} XP
            </span>
          </div>
          <h3 className="font-display text-2xl font-bold">{mission.title}</h3>
          <p className="text-sm text-foreground-secondary">
            {mission.muscleGroups.join(" · ")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">
              <Clock size={iconSize.xs} aria-hidden />
              {mission.durationMinutes} min
            </Badge>
            <Badge tone="neutral">
              <Dumbbell size={iconSize.xs} aria-hidden />
              {mission.liftCount} lifts
            </Badge>
            <Badge tone={intensityTone[mission.intensity]}>
              {missionIntensityLabels[mission.intensity]}
            </Badge>
          </div>
        </div>
        <IconButton
          label={`Start ${mission.title}`}
          variant="brand"
          className="size-14 shrink-0"
          onClick={onStart}
        >
          <Play size={iconSize.md} aria-hidden fill="currentColor" />
        </IconButton>
      </div>
    </Card>
  );
}
