"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { FilterChipRow } from "@/components/ui/FilterChipRow";
import { Skeleton } from "@/components/ui/Skeleton";
import { iconSize } from "@/constants/icons";
import { DemoBanner } from "@/features/shared/components/DemoBanner";
import { categoryLabels, type CollectionCategory } from "@/lib/gamification/catalog";
import type { CollectibleState } from "@/lib/gamification/progression";
import { cn } from "@/lib/utils";
import { useProgression } from "../hooks/useProgression";
import { groupFamilies, type FamilyGroup } from "../lib/groups";
import { CollectibleSheet, type SheetSubject } from "./CollectibleSheet";
import { LevelCard } from "./LevelCard";
import { accentFor } from "../lib/materials";
import { CollectibleBadge } from "./CollectibleBadge";

type Filter = "all" | CollectionCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  ...(Object.keys(categoryLabels) as CollectionCategory[]).map((id) => ({ id, label: categoryLabels[id] })),
];

function TierPips({ group }: { group: FamilyGroup }) {
  return (
    <span className="flex justify-center gap-1" aria-hidden>
      {group.tiers.map((tier) => (
        <span
          key={tier.id}
          className="size-1.5 rounded-full"
          style={{
            background: tier.status === "earned" ? accentFor(tier) : "rgba(255,255,255,0.12)",
          }}
        />
      ))}
    </span>
  );
}

function Tile({
  label,
  sublabel,
  medal,
  onClick,
  footer,
}: {
  label: string;
  sublabel: string;
  medal: React.ReactNode;
  onClick: () => void;
  footer?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full w-full flex-col items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-2 pb-3 pt-4 text-center transition hover:border-white/[0.12] hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
    >
      {medal}
      <span className="text-[13px] font-semibold leading-tight">{label}</span>
      {footer}
      <span className="line-clamp-2 text-[11px] leading-snug text-foreground-secondary">{sublabel}</span>
    </button>
  );
}

function itemSublabel(item: CollectibleState): string {
  if (item.status === "earned") return item.tierLabel ? `${item.tierLabel} earned` : "Earned";
  if (item.status === "sealed") return item.hint ?? "Sealed";
  return item.hint ?? item.description;
}

/**
 * The collection: 13 tiered families, 10 milestones, 8 ranks. Tiles show
 * where each one stands; tapping opens the full ladder and what it takes.
 */
export function CollectionScreen() {
  const progression = useProgression();
  const [filter, setFilter] = useState<Filter>("all");
  const [subject, setSubject] = useState<SheetSubject | null>(null);

  const families = useMemo(() => groupFamilies(progression.collectibles), [progression.collectibles]);
  const singles = progression.collectibles.filter((item) => !item.familyId);
  const visibleFamilies = families.filter((group) => filter === "all" || group.family.category === filter);
  const milestones = singles.filter(
    (item) => item.category !== "rank" && (filter === "all" || item.category === filter),
  );
  const ranks = singles.filter((item) => item.category === "rank" && (filter === "all" || filter === "rank"));

  if (!progression.hydrated) {
    return (
      <PageContainer aria-busy="true">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center gap-3 pt-4">
        <Link
          href="/profile"
          aria-label="Back to Profile"
          className="grid size-11 place-items-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          <ArrowLeft size={iconSize.sm} aria-hidden />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Collection</h1>
          <p className="text-xs text-foreground-secondary">
            {progression.earnedCount} of {progression.collectibles.length} collected ·{" "}
            {progression.totalXp.toLocaleString("en-US")} XP lifetime
          </p>
        </div>
      </div>

      {progression.demo && <DemoBanner />}

      <LevelCard level={progression.level} />

      <FilterChipRow
        label="Collection category"
        options={FILTERS}
        selectedId={filter}
        onSelect={(id) => setFilter(id as Filter)}
      />

      {visibleFamilies.length > 0 && (
        <Section title="Badge families">
          <ul className="grid grid-cols-3 gap-2.5">
            {visibleFamilies.map((group) => (
              <li key={group.family.id}>
                <Tile
                  label={group.family.name}
                  sublabel={group.next ? itemSublabel(group.next) : "All tiers earned"}
                  footer={<TierPips group={group} />}
                  onClick={() => setSubject({ kind: "family", group })}
                  medal={
                    <CollectibleBadge
                      item={group.shown}
                      state={group.earnedCount > 0 ? "earned" : undefined}
                      progress={group.next?.progress ?? 1}
                      size={64}
                    />
                  }
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {milestones.length > 0 && (
        <Section title="Milestones">
          <ul className="grid grid-cols-3 gap-2.5">
            {milestones.map((item) => (
              <li key={item.id}>
                <Tile
                  label={item.name}
                  sublabel={itemSublabel(item)}
                  onClick={() => setSubject({ kind: "item", item })}
                  medal={
                    <CollectibleBadge item={item} size={64} />
                  }
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {ranks.length > 0 && (
        <Section title="Ranks">
          <ul className={cn("grid grid-cols-4 gap-2.5")}>
            {ranks.map((item) => (
              <li key={item.id}>
                <Tile
                  label={item.name.replace(" Rank", "")}
                  sublabel={item.status === "earned" ? "Reached" : `Level ${item.rankLevel}`}
                  onClick={() => setSubject({ kind: "item", item })}
                  medal={
                    <CollectibleBadge item={item} size={58} />
                  }
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CollectibleSheet subject={subject} onClose={() => setSubject(null)} canPin={!progression.demo} />
    </PageContainer>
  );
}
