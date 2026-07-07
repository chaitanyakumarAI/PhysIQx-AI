import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { UserAvatar } from "@/features/shared/components/UserAvatar";

export interface ProfileHeaderCardProps {
  name: string;
  archetype: string;
  level: number;
  score: number;
  className?: string;
}

export function ProfileHeaderCard({
  name,
  archetype,
  level,
  score,
  className,
}: ProfileHeaderCardProps) {
  return (
    <Card variant="accent" padding="lg" className={className}>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <UserAvatar name={name} size="xl" />
          <span
            aria-label={`Level ${level}`}
            className="absolute -bottom-1 -right-1 rounded-full border-2 border-surface bg-foreground px-2 py-0.5 text-xs font-bold text-zinc-950"
          >
            L{level}
          </span>
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-bold">{name}</h2>
          <p className="text-sm text-foreground-secondary">{archetype}</p>
          <Badge tone="brand" className="mt-2">
            {score} PhysIQ Score
          </Badge>
        </div>
      </div>
    </Card>
  );
}
