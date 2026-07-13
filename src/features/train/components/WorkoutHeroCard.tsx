import { Clock, Dumbbell, Flame, Play } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { missionIntensityLabels, type Mission } from "@/types/training";

export interface WorkoutHeroCardProps {
  /** null renders the rest-day state — never a blank card. */
  mission: Mission | null;
  onStart?: () => void;
  className?: string;
}

/**
 * Train's hero: today's workout with a full-width Start CTA. Deliberately a
 * separate component from Home's DailyMissionCard — same Mission data, but a
 * different anatomy (TODAY badge, prominent button) that will keep diverging
 * per surface; unifying them would be premature.
 */
export function WorkoutHeroCard({
  mission,
  onStart,
  className,
}: WorkoutHeroCardProps) {
  if (!mission) {
    return (
      <Card variant="accent" padding="lg" className={className}>
        <Badge tone="brand">Today</Badge>
        <h2 className="mt-3 font-display text-3xl font-bold">Rest day</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Recovery counts too — your score reflects it.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="accent" padding="lg" className={className}>
      <div className="flex items-center justify-between gap-4">
        <Badge tone="brand">Today</Badge>
        <span className="text-sm font-semibold text-brand">
          +{mission.xpReward} XP
        </span>
      </div>

      <h2 className="mt-4 font-display text-3xl font-bold">{mission.title}</h2>
      <p className="mt-1 text-base text-foreground-secondary">
        {mission.muscleGroups.join(" · ")}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone="neutral">
          <Clock size={iconSize.xs} aria-hidden />
          {mission.durationMinutes} min
        </Badge>
        <Badge tone="neutral">
          <Dumbbell size={iconSize.xs} aria-hidden />
          {mission.liftCount} lifts
        </Badge>
        <Badge tone="warning">
          <Flame size={iconSize.xs} aria-hidden />
          {missionIntensityLabels[mission.intensity]}
        </Badge>
      </div>

      <Button size="lg" fullWidth className="mt-6" onClick={onStart}>
        <Play size={iconSize.sm} aria-hidden fill="currentColor" />
        Start workout
      </Button>
    </Card>
  );
}
