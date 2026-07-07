"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { PageContainer } from "@/components/layout/PageContainer";
import { SettingsPageHeader } from "@/features/profile/components/SettingsPageHeader";

interface PrivacyPref {
  id: string;
  label: string;
  description: string;
}

const prefs: PrivacyPref[] = [
  {
    id: "leaderboard-visibility",
    label: "Show me on leaderboards",
    description: "Appear in Compete's XP leaderboards",
  },
  {
    id: "circle-activity-sharing",
    label: "Share activity with circle",
    description: "PRs and achievements show up in your circle's feed",
  },
  {
    id: "friend-requests",
    label: "Allow friend requests",
    description: "Let other athletes send you circle invites",
  },
];

const defaultEnabled: Record<string, boolean> = {
  "leaderboard-visibility": true,
  "circle-activity-sharing": true,
  "friend-requests": true,
};

export function PrivacyContent() {
  const [enabled, setEnabled] = useState(defaultEnabled);

  return (
    <PageContainer>
      <SettingsPageHeader title="Privacy" />
      <Card padding="none" className="divide-y divide-border/60">
        {prefs.map((pref) => (
          <div key={pref.id} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{pref.label}</p>
              <p className="text-sm text-foreground-secondary">{pref.description}</p>
            </div>
            <Switch
              checked={enabled[pref.id] ?? false}
              onChange={(checked) =>
                setEnabled((current) => ({ ...current, [pref.id]: checked }))
              }
              label={pref.label}
            />
          </div>
        ))}
      </Card>
    </PageContainer>
  );
}
