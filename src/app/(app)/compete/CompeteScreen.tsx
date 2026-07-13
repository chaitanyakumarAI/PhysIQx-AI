"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { FilterChipRow, type FilterChipOption } from "@/components/ui/FilterChipRow";
import { fadeInUp, staggerChildren } from "@/lib/motion";
import { useEntranceOnce } from "@/lib/useEntranceOnce";
import { ActivityFeedItem } from "@/features/compete/components/ActivityFeedItem";
import { ClimbingCard } from "@/features/compete/components/ClimbingCard";
import { LeaderboardRow } from "@/features/compete/components/LeaderboardRow";
import { WeeklyChallengeCard } from "@/features/compete/components/WeeklyChallengeCard";
import type { CompeteData } from "@/features/compete/types";
import { leaderboardScopeLabels, type LeaderboardScope } from "@/types/leaderboard";

export type CompeteScreenProps = CompeteData;

const scopeOptions: FilterChipOption[] = (
  Object.entries(leaderboardScopeLabels) as [LeaderboardScope, string][]
).map(([id, label]) => ({ id, label }));

/**
 * Pure composition + scope-tab state: every visual/state decision (movement
 * badges, "you" highlight, activity icons) already lives in the Compete
 * feature components. This file only arranges them, holds the selected
 * leaderboard scope, and orchestrates entrance motion.
 */
export function CompeteScreen({
  challenge,
  participation,
  currentUserId,
  scopes,
  activity,
}: CompeteScreenProps) {
  const [scope, setScope] = useState<LeaderboardScope>("weekly");
  const entries = scopes[scope];

  return (
    <PageContainer>
      {/* display:contents keeps PageContainer's flex/gap acting directly on
          these items — this node exists only to orchestrate the stagger. */}
      <m.div
        variants={staggerChildren}
        initial={useEntranceOnce("compete")}
        animate="visible"
        className="contents"
      >
        <m.div variants={fadeInUp}>
          <ScreenHeader title="Compete" subtitle="Climb with your circle." />
        </m.div>

        <m.div
          variants={fadeInUp}
          className="flex flex-col gap-4"
          data-tour="compete-challenge"
        >
          <WeeklyChallengeCard challenge={challenge} participation={participation} />
          <ClimbingCard entries={entries} currentUserId={currentUserId} />
        </m.div>

        <m.div variants={fadeInUp} className="flex flex-col gap-4">
          <FilterChipRow
            label="Leaderboard scope"
            options={scopeOptions}
            selectedId={scope}
            onSelect={(id) => setScope(id as LeaderboardScope)}
          />
          <Section title="XP Leaderboard">
            <ul
              aria-label="XP leaderboard"
              className="divide-y divide-border/60 rounded-card border border-border/60"
            >
              {entries.map((entry) => (
                <li key={entry.id}>
                  <LeaderboardRow entry={entry} />
                </li>
              ))}
            </ul>
          </Section>
        </m.div>

        <m.div variants={fadeInUp}>
          <Section title="Live from your circle">
            <ul
              aria-label="Recent circle activity"
              className="divide-y divide-border/60 rounded-card border border-border/60 px-4"
            >
              {activity.map((event) => (
                <li key={event.id}>
                  <ActivityFeedItem event={event} />
                </li>
              ))}
            </ul>
          </Section>
        </m.div>
      </m.div>
    </PageContainer>
  );
}
