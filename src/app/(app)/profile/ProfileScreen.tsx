"use client";

import { m } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { CollectionShowcase } from "@/features/profile/components/CollectionShowcase";
import { ProfileHeaderCard } from "@/features/profile/components/ProfileHeaderCard";
import { SettingsRow } from "@/features/profile/components/SettingsRow";
import { useProfileView } from "@/features/profile/hooks/useProfileView";
import { buildIdentityStats, buildProgressStats } from "@/features/profile/lib/derive";
import { PROFILE_SETTINGS } from "@/features/profile/lib/settings";
import { generateArchetype } from "@/features/onboarding/lib/generateArchetype";
import { DemoBanner } from "@/features/shared/components/DemoBanner";
import { StatChipRow } from "@/features/shared/components/StatChipRow";
import { fadeInUp, staggerChildren } from "@/lib/motion";
import { useEntranceOnce } from "@/lib/useEntranceOnce";
import { useProfileStore } from "@/store/profileStore";

/** The athlete's identity and lifetime progress, derived from the ledger. */
export function ProfileScreen() {
  const { athlete, achievements, stats, level } = useProfileView();
  const split = useProfileStore((state) => state.onboardingProfile?.activeSplit ?? null);
  const entrance = useEntranceOnce("profile");
  const { profile } = athlete.ledger;

  if (!athlete.hydrated) {
    return (
      <PageContainer aria-busy="true">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </PageContainer>
    );
  }

  const activeSplit = athlete.demo ? "upper-lower" : split;
  const archetype = profile.goal && activeSplit ? generateArchetype(profile.goal, activeSplit) : "";
  const score = athlete.score.state === "calibrating" ? null : athlete.score.score;

  return (
    <PageContainer>
      <m.div variants={staggerChildren} initial={entrance} animate="visible" className="contents">
        {athlete.demo && (
          <m.div variants={fadeInUp}>
            <DemoBanner />
          </m.div>
        )}

        <m.div variants={fadeInUp}>
          <ScreenHeader title="Profile" />
        </m.div>

        <m.div variants={fadeInUp} className="flex flex-col gap-4">
          <ProfileHeaderCard
            name={profile.displayName ?? "Athlete"}
            archetype={archetype}
            level={level.level}
            score={score}
          />
          <StatChipRow
            stats={buildIdentityStats({
              goal: profile.goal,
              split: activeSplit,
              trainingDaysPerWeek: profile.trainingDaysPerWeek,
            })}
          />
          <StatChipRow stats={buildProgressStats(stats, athlete.streak)} />
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
              {PROFILE_SETTINGS.map((item) => (
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
