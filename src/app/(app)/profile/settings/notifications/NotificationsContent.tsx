"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { PageContainer } from "@/components/layout/PageContainer";
import { SettingsPageHeader } from "@/features/profile/components/SettingsPageHeader";

interface NotificationPref {
  id: string;
  label: string;
  description: string;
}

const prefs: NotificationPref[] = [
  {
    id: "mission-reminders",
    label: "Mission reminders",
    description: "A nudge when today's workout hasn't started yet",
  },
  {
    id: "streak-risk",
    label: "Streak risk alerts",
    description: "Heads up before a streak is about to break",
  },
  {
    id: "challenge-results",
    label: "Challenge results",
    description: "Weekly challenge standings and rewards",
  },
  {
    id: "circle-activity",
    label: "Circle activity",
    description: "When someone in your circle hits a PR or unlocks an achievement",
  },
  {
    id: "ai-coach",
    label: "Coach insights",
    description: "New insights about your training and recovery",
  },
];

const defaultEnabled: Record<string, boolean> = {
  "mission-reminders": true,
  "streak-risk": true,
  "challenge-results": true,
  "circle-activity": false,
  "ai-coach": true,
};

export function NotificationsContent() {
  const [enabled, setEnabled] = useState(defaultEnabled);

  return (
    <PageContainer>
      <SettingsPageHeader title="Notifications" />
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
