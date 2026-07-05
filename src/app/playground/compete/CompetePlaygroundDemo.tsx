"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { FilterChipRow, type FilterChipOption } from "@/components/ui/FilterChipRow";
import { ActivityFeedItem } from "@/features/compete/components/ActivityFeedItem";
import { ClimbingCard } from "@/features/compete/components/ClimbingCard";
import { LeaderboardRow } from "@/features/compete/components/LeaderboardRow";
import { WeeklyChallengeCard } from "@/features/compete/components/WeeklyChallengeCard";
import { leaderboardScopeLabels, type LeaderboardScope } from "@/types/leaderboard";
import type { CompeteData } from "@/features/compete/types";

const scopeOptions: FilterChipOption[] = (
  Object.entries(leaderboardScopeLabels) as [LeaderboardScope, string][]
).map(([id, label]) => ({ id, label }));

export function CompetePlaygroundDemo({
  challenge,
  participation,
  currentUserId,
  scopes,
  activity,
}: CompeteData) {
  const [scope, setScope] = useState<LeaderboardScope>("weekly");
  const entries = scopes[scope];

  return (
    <PageContainer withBottomNav={false}>
      <Section title="Compete feature — component preview">
        <WeeklyChallengeCard challenge={challenge} participation={participation} />
        <ClimbingCard entries={entries} currentUserId={currentUserId} />
      </Section>

      <Section title="Leaderboard">
        <FilterChipRow
          label="Leaderboard scope"
          options={scopeOptions}
          selectedId={scope}
          onSelect={(id) => setScope(id as LeaderboardScope)}
        />
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
    </PageContainer>
  );
}
