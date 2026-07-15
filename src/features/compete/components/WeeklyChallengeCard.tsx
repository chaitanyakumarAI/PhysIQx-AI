import { Trophy, Zap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { iconSize } from "@/constants/icons";
import type { Challenge, ChallengeParticipation } from "@/types/challenge";

export interface WeeklyChallengeCardProps {
  challenge: Challenge;
  participation: ChallengeParticipation;
  className?: string;
}

export function WeeklyChallengeCard({
  challenge,
  participation,
  className,
}: WeeklyChallengeCardProps) {
  return (
    <Card variant="accent" padding="lg" className={className}>
      <div className="flex items-center justify-between gap-4">
        <Badge tone="brand">
          <Zap size={iconSize.xs} aria-hidden />
          Weekly Challenge
        </Badge>
        <span className="text-sm text-foreground-secondary">
          {challenge.daysLeft}d left
        </span>
      </div>

      <h2 className="mt-3 font-display text-2xl font-bold">{challenge.name}</h2>
      <p className="mt-1 text-sm text-foreground-secondary">
        {challenge.description} · {challenge.participantCount.toLocaleString()} athletes
      </p>

      <div className="mt-4 flex items-center justify-between text-sm font-semibold">
        <span>
          {participation.progress.toLocaleString()} / {challenge.target.toLocaleString()}{" "}
          {challenge.unit}
        </span>
        <span className="text-brand">{participation.percent}%</span>
      </div>
      <ProgressBar
        value={participation.percent}
        className="mt-2"
        aria-label={`Challenge progress ${participation.percent}%`}
      />

      <div className="mt-4 flex items-center justify-between rounded-field bg-foreground/5 px-3 py-2 text-sm">
        {/* Legendary rewards wear the sanctioned violet tint, not amber —
            warm colors are reserved for warnings (color-grammar rule). */}
        <span className="flex items-center gap-2 text-foreground-secondary">
          <Trophy size={iconSize.xs} aria-hidden className="text-legendary" />
          {challenge.reward.tierLabel}
        </span>
        <span className="font-semibold text-legendary">{challenge.reward.badgeName}</span>
      </div>
    </Card>
  );
}
