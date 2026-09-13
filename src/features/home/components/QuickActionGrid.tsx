import Link from "next/link";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import type { QuickAction } from "../types";

export interface QuickActionGridProps extends React.ComponentProps<"div"> {
  actions: QuickAction[];
}

/** Grid of one-tap shortcuts (quick-log, start workout, …). */
export function QuickActionGrid({
  className,
  actions,
  ...props
}: QuickActionGridProps) {
  const colClass = actions.length === 5 ? "grid-cols-5 gap-2" : "grid-cols-4 gap-3";
  return (
    <div
      className={cn("grid", colClass, className)}
      role="group"
      aria-label="Quick actions"
      {...props}
    >
      {actions.map((action) => (
        <Link
          key={action.id}
          href={action.href}
          className="flex flex-col items-center gap-1.5 rounded-card border border-border/60 bg-surface p-2 text-center transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          <span className="grid size-10 place-items-center rounded-full bg-surface-elevated text-foreground-secondary">
            <action.icon size={iconSize.sm} aria-hidden />
          </span>
          <span className="text-[11px] font-medium text-foreground-secondary truncate max-w-full">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
