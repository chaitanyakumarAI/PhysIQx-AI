"use client";

import { Pin } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { gradeLabels } from "@/lib/gamification/catalog";
import type { CollectibleState } from "@/lib/gamification/progression";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/store/profileStore";
import { formatEarned, type FamilyGroup } from "../lib/groups";
import { accentFor } from "../lib/materials";
import { CollectibleBadge } from "./CollectibleBadge";

export type SheetSubject = { kind: "family"; group: FamilyGroup } | { kind: "item"; item: CollectibleState };

export interface CollectibleSheetProps {
  subject: SheetSubject | null;
  onClose: () => void;
  /** Showcasing is the athlete's own choice — off for demo data. */
  canPin: boolean;
}

function StatusLine({ item }: { item: CollectibleState }) {
  if (item.status === "earned") {
    return <span className="text-brand">Earned {formatEarned(item.earnedOn!)}</span>;
  }
  if (item.status === "sealed") {
    return <span className="text-foreground-secondary">Done — {item.hint?.toLowerCase()}</span>;
  }
  return <span className="text-foreground-secondary">{item.hint ?? "Not started"}</span>;
}

/** Everything about one badge (or a family's four tiers) and how to earn it. */
export function CollectibleSheet({ subject, onClose, canPin }: CollectibleSheetProps) {
  const showcaseIds = useProfileStore((state) => state.showcaseAchievementIds);
  const toggleShowcase = useProfileStore((state) => state.toggleShowcaseAchievement);

  const hero = subject?.kind === "family" ? subject.group.shown : subject?.item;
  const pinTarget =
    subject?.kind === "family"
      ? [...subject.group.tiers].reverse().find((tier) => tier.status === "earned")
      : subject?.item.status === "earned"
        ? subject.item
        : undefined;
  const pinned = pinTarget ? showcaseIds.includes(pinTarget.id) : false;

  return (
    <BottomSheet open={subject !== null} onClose={onClose} title={hero?.name ?? "Badge"} hideTitle>
      {hero && subject && (
        <div className="flex flex-col gap-5 pb-2">
          <div className="flex flex-col items-center gap-3 text-center">
            <CollectibleBadge item={hero} size={128} />
            <div>
              <h2 className="font-display text-2xl font-bold">{hero.name}</h2>
              <p
                className="mt-0.5 text-xs font-semibold uppercase tracking-[0.16em]"
                style={{ color: hero.status === "earned" ? accentFor(hero) : undefined }}
              >
                {subject.kind === "family"
                  ? `${subject.group.earnedCount} of 4 tiers`
                  : gradeLabels[hero.grade]}
              </p>
            </div>
            {subject.kind === "item" && (
              <p className="max-w-xs text-sm text-foreground-secondary">{subject.item.description}</p>
            )}
          </div>

          {subject.kind === "family" ? (
            <ol className="flex flex-col gap-2">
              {subject.group.tiers.map((tier) => (
                <li
                  key={tier.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-3",
                    tier.status === "earned" ? "border-white/[0.1] bg-white/[0.04]" : "border-white/[0.05]",
                  )}
                >
                  <CollectibleBadge item={tier} size={46} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {tier.tierLabel} <span className="font-normal text-foreground-secondary">· {tier.description}</span>
                    </p>
                    <p className="text-xs">
                      <StatusLine item={tier} />
                    </p>
                    {tier.status === "in-progress" && (
                      <ProgressBar value={tier.progress * 100} size="sm" className="mt-1.5" aria-label={`${tier.tierLabel} progress`} />
                    )}
                  </div>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground-muted">+{tier.xp} XP</span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] p-3 text-sm">
              <StatusLine item={subject.item} />
              {subject.item.xp > 0 && (
                <span className="text-xs font-semibold tabular-nums text-foreground-muted">+{subject.item.xp} XP</span>
              )}
            </div>
          )}

          {canPin && pinTarget && (
            <Button variant={pinned ? "secondary" : "primary"} size="md" fullWidth onClick={() => toggleShowcase(pinTarget.id)}>
              <Pin size={16} aria-hidden className={pinned ? "rotate-45" : undefined} />
              {pinned ? "Remove from profile showcase" : "Feature on profile"}
            </Button>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
