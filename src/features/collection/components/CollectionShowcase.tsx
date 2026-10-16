"use client";

import Link from "next/link";
import { Section } from "@/components/layout/Section";
import type { ProgressionState } from "@/lib/gamification/progression";
import { useProfileStore } from "@/store/profileStore";
import { formatEarned } from "../lib/groups";
import { CollectibleBadge } from "./CollectibleBadge";
import { Medal } from "./Medal";

const SHOWCASE_SIZE = 3;

export interface CollectionShowcaseProps {
  progression: ProgressionState;
  /** Pins belong to the athlete's own collection — ignored for demo data. */
  usePins: boolean;
}

/**
 * Profile's three featured badges: the athlete's pins first, then the most
 * recently earned. The full collection is one tap away.
 */
export function CollectionShowcase({ progression, usePins }: CollectionShowcaseProps) {
  const pinnedIds = useProfileStore((state) => state.showcaseAchievementIds);
  const earned = progression.recentlyEarned;
  const pinned = usePins
    ? pinnedIds.flatMap((id) => earned.filter((item) => item.id === id))
    : [];
  const featured = [...pinned, ...earned.filter((item) => !pinned.includes(item))].slice(0, SHOWCASE_SIZE);

  return (
    <Section
      title="Collection"
      action={
        <Link
          href="/profile/achievements"
          className="rounded text-xs font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          {progression.earnedCount} / {progression.collectibles.length} collected ↗
        </Link>
      }
    >
      {featured.length === 0 ? (
        <Link
          href="/profile/achievements"
          className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04]"
        >
          <Medal grade="bronze" icon="sparkles" state="locked" size={52} />
          <span className="text-sm text-foreground-secondary">
            Finish your first workout to earn <span className="font-semibold text-foreground">First Rep</span> —
            70 badges to collect.
          </span>
        </Link>
      ) : (
        <ul aria-label="Featured badges" className="grid grid-cols-3 gap-2.5">
          {featured.map((item) => (
            <li key={item.id}>
              <Link
                href="/profile/achievements"
                className="flex h-full flex-col items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-2 pb-3 pt-4 text-center hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
              >
                <CollectibleBadge item={item} state="earned" size={64} />
                <span className="text-[13px] font-semibold leading-tight">{item.name}</span>
                <span className="text-[11px] text-foreground-secondary">
                  {item.tierLabel ? `${item.tierLabel} · ` : ""}
                  {formatEarned(item.earnedOn!)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
