"use client";

import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { PageContainer } from "@/components/layout/PageContainer";
import { SettingsPageHeader } from "@/features/profile/components/SettingsPageHeader";
import { DEFAULT_PRIVACY_PREFERENCES, PRIVACY_PREFERENCES } from "@/features/profile/lib/privacy";
import { useProfileStore } from "@/store/profileStore";

export function PrivacyContent() {
  const enabled = useProfileStore((state) => state.privacyPreferences ?? DEFAULT_PRIVACY_PREFERENCES);
  const update = useProfileStore((state) => state.updatePrivacyPreferences);

  return (
    <PageContainer>
      <SettingsPageHeader title="Privacy" />
      <Card padding="none" className="divide-y divide-border/60">
        {PRIVACY_PREFERENCES.map((pref) => (
          <div key={pref.id} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{pref.label}</p>
              <p className="text-sm text-foreground-secondary">{pref.description}</p>
            </div>
            <Switch
              checked={enabled[pref.id] ?? false}
              onChange={(checked) => update({ [pref.id]: checked })}
              label={pref.label}
            />
          </div>
        ))}
      </Card>
    </PageContainer>
  );
}
