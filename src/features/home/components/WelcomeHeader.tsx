import Link from "next/link";
import { Flame } from "lucide-react";
import { UserAvatar } from "@/features/shared/components/UserAvatar";
import { Badge } from "@/components/ui/Badge";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";

export interface WelcomeHeaderProps extends React.ComponentProps<"header"> {
  /** Pre-resolved greeting (see lib/greeting) — kept out of the component so it stays pure. */
  greeting: string;
  name: string;
  streakDays: number;
  archetype: string;
}

export function WelcomeHeader({
  className,
  greeting,
  name,
  streakDays,
  archetype,
  ...props
}: WelcomeHeaderProps) {
  return (
    <header
      className={cn("flex items-start justify-between gap-4", className)}
      {...props}
    >
      <div className="flex flex-col gap-2">
        {/* The page's h1: this greeting is Home's visual title, and screens
            need exactly one h1 for a sound heading tree (sections are h2s).
            suppressHydrationWarning: greeting is computed client-side on a
            statically prerendered page, so a text mismatch is expected.
            Greeting and name are one h1 semantically but two visual tiers —
            the person's name is the headline, not the pleasantry. */}
        <h1 className="flex flex-col">
          {/* suppressHydrationWarning must sit on the element whose text
              differs — it does not cascade to children. */}
          <span
            suppressHydrationWarning
            className="text-sm text-foreground-secondary"
          >
            {greeting},
          </span>
          <span className="font-display text-3xl font-bold tracking-tight">
            {name}
          </span>
        </h1>
        <div className="flex items-center gap-2">
          {streakDays > 0 && (
            <Badge tone="warning">
              <Flame size={iconSize.xs} aria-hidden />
              {streakDays} day streak
            </Badge>
          )}
          <span className="text-sm text-foreground-secondary">
            {archetype}
          </span>
        </div>
      </div>
      {/* The avatar is Home's door to Profile — a real link, not decoration. */}
      <Link
        href="/profile"
        aria-label="Open profile"
        className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <UserAvatar name={name} size="md" />
      </Link>
    </header>
  );
}
