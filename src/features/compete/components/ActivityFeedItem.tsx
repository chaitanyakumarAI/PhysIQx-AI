"use client";

import { useState } from "react";
import { Flame, Trophy, Zap, type LucideIcon } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { iconSize } from "@/constants/icons";
import { formatRelativeTime } from "../lib/derive";
import type { ActivityEvent, ActivityEventType } from "@/types/activity";

export interface ActivityFeedItemProps {
  event: ActivityEvent;
  className?: string;
}

const eventIcon: Record<ActivityEventType, LucideIcon> = {
  "achievement-unlock": Trophy,
  "personal-record": Flame,
  "challenge-join": Zap,
};

// One quiet tone for all feed icons — amber/red/blue per event type was
// color noise with no grammar (visual-audit finding).
const eventIconTone: Record<ActivityEventType, string> = {
  "achievement-unlock": "text-foreground-secondary",
  "personal-record": "text-foreground-secondary",
  "challenge-join": "text-foreground-secondary",
};

/**
 * One row in "Live from your circle". Client component: relative time
 * ("12m ago") is computed against a `now` pinned once per session rather
 * than at server-render time, so it doesn't freeze at build time the way
 * Home's greeting would have (see that component for the same fix).
 */
export function ActivityFeedItem({ event, className }: ActivityFeedItemProps) {
  const [now] = useState(() => new Date());
  const Icon = eventIcon[event.type];

  return (
    <div className={className}>
      <div className="flex items-center gap-3 py-3">
        <Avatar name={event.actorName} src={event.actorAvatarSrc} size="sm" />
        <p className="min-w-0 flex-1 text-sm">
          <span className="font-semibold">{event.actorName}</span>{" "}
          <span className="text-foreground-secondary">{event.description}</span>
        </p>
        <Icon size={iconSize.sm} aria-hidden className={eventIconTone[event.type]} />
      </div>
      <p
        suppressHydrationWarning
        className="-mt-2 pb-1 pl-11 text-xs text-foreground-secondary"
      >
        {formatRelativeTime(event.occurredAt, now)}
      </p>
    </div>
  );
}
