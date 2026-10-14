import Link from "next/link";
import { AlertTriangle, ArrowRight, Lightbulb, Sparkle, Trophy, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import type { CoachRecommendation, CoachTone } from "@/lib/coachEngine";

const toneMeta: Record<CoachTone, { icon: LucideIcon; label: string; tint: string }> = {
  celebrate: { icon: Trophy, label: "Win", tint: "bg-brand/15 text-brand" },
  suggest: { icon: Lightbulb, label: "Coach", tint: "bg-brand/10 text-brand" },
  caution: { icon: AlertTriangle, label: "Heads up", tint: "bg-warning/15 text-warning" },
  info: { icon: Sparkle, label: "Coach", tint: "bg-white/[0.06] text-foreground-secondary" },
};

export interface CoachCardProps {
  recommendation: CoachRecommendation;
  className?: string;
}

/** The coach's lead recommendation: one situation, one specific action. */
export function CoachCard({ recommendation, className }: CoachCardProps) {
  const meta = toneMeta[recommendation.tone];
  const Icon = meta.icon;
  return (
    <Card padding="md" className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-start gap-3">
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", meta.tint)}>
          <Icon size={iconSize.sm} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
            {meta.label}
          </p>
          <h3 className="mt-0.5 font-semibold leading-snug">{recommendation.title}</h3>
          <p className="mt-1 text-sm text-foreground-secondary">{recommendation.body}</p>
        </div>
      </div>
      {recommendation.action && (
        <Button asChild variant="secondary" size="sm" className="self-start">
          <Link href={recommendation.action.href}>
            {recommendation.action.label}
            <ArrowRight size={iconSize.xs} aria-hidden />
          </Link>
        </Button>
      )}
    </Card>
  );
}

export interface CoachListProps {
  recommendations: CoachRecommendation[];
  className?: string;
}

/** Secondary recommendations as compact, tappable rows. */
export function CoachList({ recommendations, className }: CoachListProps) {
  if (recommendations.length === 0) return null;
  return (
    <Card padding="none" className={cn("divide-y divide-white/[0.06]", className)}>
      {recommendations.map((recommendation) => {
        const meta = toneMeta[recommendation.tone];
        const Icon = meta.icon;
        const content = (
          <>
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", meta.tint)}>
              <Icon size={iconSize.xs} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{recommendation.title}</span>
              <span className="block text-xs text-foreground-secondary">{recommendation.body}</span>
            </span>
          </>
        );
        return recommendation.action ? (
          <Link
            key={recommendation.id}
            href={recommendation.action.href}
            className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
          >
            {content}
            <ArrowRight size={iconSize.xs} className="shrink-0 text-foreground-muted" aria-hidden />
          </Link>
        ) : (
          <div key={recommendation.id} className="flex min-h-14 items-center gap-3 px-4 py-3">
            {content}
          </div>
        );
      })}
    </Card>
  );
}
