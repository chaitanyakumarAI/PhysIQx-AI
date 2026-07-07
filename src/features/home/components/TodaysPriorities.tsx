import Link from "next/link";
import { Check, ChevronRight, Droplets, Dumbbell, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import type { DailyPriority } from "../types";

const priorityIcon: Record<DailyPriority["iconId"], LucideIcon> = {
  dumbbell: Dumbbell,
  droplets: Droplets,
};

export interface TodaysPrioritiesProps {
  priorities: DailyPriority[];
  className?: string;
}

/**
 * The coach's answer to "what should I do next?" — three concrete actions,
 * most impactful first, each with its payoff stated. This is the component
 * that turns Home from a dashboard into a coach: the score card says where
 * you stand, this says what to do about it today.
 */
export function TodaysPriorities({ priorities, className }: TodaysPrioritiesProps) {
  if (priorities.length === 0) return null;

  return (
    <Card padding="none" className={className}>
      <ol className="divide-y divide-border/60">
        {priorities.map((priority, index) => {
          const Icon = priorityIcon[priority.iconId];
          return (
            <li key={priority.id}>
              <Link
                href={priority.href}
                className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/60"
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full",
                    priority.completed
                      ? "bg-brand/20 text-brand"
                      : "bg-surface-elevated text-foreground-secondary",
                  )}
                >
                  {priority.completed ? (
                    <Check size={iconSize.sm} />
                  ) : (
                    <Icon size={iconSize.sm} />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block font-semibold",
                      priority.completed &&
                        "text-foreground-secondary line-through",
                    )}
                  >
                    {priority.label}
                  </span>
                  <span className="block text-sm text-foreground-secondary">
                    {priority.detail}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span
                    aria-hidden
                    className="font-display text-sm font-bold text-foreground-secondary"
                  >
                    {index + 1}
                  </span>
                  <ChevronRight
                    size={iconSize.sm}
                    aria-hidden
                    className="text-foreground-secondary"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
