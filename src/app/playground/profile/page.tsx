import { getProfileData } from "@/features/profile/api/getProfileData";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { AchievementBadge } from "@/features/profile/components/AchievementBadge";
import { DNABanner } from "@/features/profile/components/DNABanner";
import { ProfileHeaderCard } from "@/features/profile/components/ProfileHeaderCard";
import { SettingsRow } from "@/features/profile/components/SettingsRow";
import { StatChipRow } from "@/features/shared/components/StatChipRow";
import {
  buildIdentityStats,
  buildProgressStats,
  countUnlockedAchievements,
} from "@/features/profile/lib/derive";

/**
 * Dev-only verification harness for the Profile feature layer — renders
 * every component wired to real mock data. Not the Profile screen.
 */
export default async function ProfileFeaturePlaygroundPage() {
  const data = await getProfileData();
  const unlockedCount = countUnlockedAchievements(data.achievements);

  return (
    <PageContainer withBottomNav={false}>
      <Section title="Profile feature — component preview">
        <ProfileHeaderCard
          name={data.profile.displayName}
          archetype={data.profile.dnaArchetype}
          level={data.level.level}
          score={data.score.score}
        />
        <StatChipRow stats={buildIdentityStats(data.profile)} />
        <DNABanner archetype={data.profile.dnaArchetype} />
        <StatChipRow stats={buildProgressStats(data.stats, data.streak)} />
      </Section>

      <Section
        title="Collection"
        action={
          <span className="text-sm text-foreground-secondary">
            {unlockedCount} / {data.achievements.length}
          </span>
        }
      >
        <ul aria-label="Achievement collection" className="grid grid-cols-3 gap-3">
          {data.achievements.map((achievement) => (
            <li key={achievement.id}>
              <AchievementBadge achievement={achievement} />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Settings">
        <ul
          aria-label="Settings"
          className="divide-y divide-border/60 rounded-card border border-border/60"
        >
          {data.settings.map((item) => (
            <li key={item.id}>
              <SettingsRow item={item} />
            </li>
          ))}
        </ul>
      </Section>
    </PageContainer>
  );
}
