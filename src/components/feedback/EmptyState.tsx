import type { LucideIcon } from "lucide-react";
import { Mascot, type MascotPose } from "@/components/mascots/Mascot";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.ComponentProps<"div"> {
  icon?: LucideIcon;
  /** A mascot face instead of an icon — for moments of emotion (a dead end,
   *  a rest day), never for plain input feedback like a search miss
   *  (docs/MASCOTS.md, the anti-Clippy law). Wins over `icon` if both set. */
  mascot?: MascotPose;
  title: string;
  description?: string;
  /** Primary CTA — every empty state should offer a next action. */
  action?: React.ReactNode;
}

export function EmptyState({
  className,
  icon: Icon,
  mascot,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      {mascot ? (
        <Mascot
          pose={mascot}
          size={80}
          shape="circle"
          className="mb-2 ring-2 ring-surface-elevated"
        />
      ) : (
        Icon && (
          <div className="mb-2 grid size-14 place-items-center rounded-full bg-surface-elevated">
            <Icon
              size={iconSize.md}
              aria-hidden
              className="text-foreground-secondary"
            />
          </div>
        )
      )}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="max-w-xs text-sm text-foreground-secondary">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
