"use client";

import { m } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { fadeInUp, staggerChildren } from "@/lib/motion";
import { useEntranceOnce } from "@/lib/useEntranceOnce";
import { CollectionShowcase } from "@/features/profile/components/CollectionShowcase";
import { ProfileHeaderCard } from "@/features/profile/components/ProfileHeaderCard";
import { SettingsRow } from "@/features/profile/components/SettingsRow";
import { StatChipRow } from "@/features/shared/components/StatChipRow";
import {
  buildIdentityStats,
  buildProgressStats,
} from "@/features/profile/lib/derive";
import type { ProfileData } from "@/features/profile/types";

export type ProfileScreenProps = ProfileData;

/**
 * Pure composition, no interactive state of its own — unlike the other four
 * tabs, Profile has no tabs/toggles in the design. Still a client component
 * because the entrance motion (staggerChildren/fadeInUp) applies uniformly
 * across every screen, not only ones with interactivity.
 */
export function ProfileScreen({
  profile,
  score,
  level,
  streak,
  stats,
  achievements,
  settings,
}: ProfileScreenProps) {
  return (
    <PageContainer>
      {/* display:contents keeps PageContainer's flex/gap acting directly on
          these items — this node exists only to orchestrate the stagger. */}
      <m.div
        variants={staggerChildren}
        initial={useEntranceOnce("profile")}
        animate="visible"
        className="contents"
      >
        <m.div variants={fadeInUp}>
          <ScreenHeader title="Profile" />
        </m.div>

        <m.div variants={fadeInUp} className="flex flex-col gap-4">
          <ProfileHeaderCard
            name={profile.displayName}
            archetype={profile.dnaArchetype}
            level={level.level}
            score={score.score}
          />
          {/* DNABanner removed: the header card already carries the
              archetype — saying it twice in one screenful read as filler
              (visual-audit finding). */}
          <StatChipRow stats={buildIdentityStats(profile)} />
          <StatChipRow stats={buildProgressStats(stats, streak)} />
        </m.div>

        <m.div variants={fadeInUp}>
          <CollectionShowcase achievements={achievements} />
        </m.div>

        <m.div variants={fadeInUp}>
          <Section title="Settings">
            <ul
              aria-label="Settings"
              className="divide-y divide-border/60 rounded-card border border-border/60"
            >
              {settings.map((item) => (
                <li key={item.id}>
                  <SettingsRow item={item} />
                </li>
              ))}
            </ul>
          </Section>
        </m.div>
      </m.div>
    </PageContainer>
  );
}
