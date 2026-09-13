"use client";

import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { SettingsPageHeader } from "@/features/profile/components/SettingsPageHeader";
import {
  DEFAULT_USER_PREFERENCES,
  useProfileStore,
  type UserPreferences,
} from "@/store/profileStore";
import { Button } from "@/components/ui/Button";

interface PreferenceItem {
  id: keyof UserPreferences;
  label: string;
  description: string;
  badge?: string;
}

const workoutLoggingPrefs: PreferenceItem[] = [
  {
    id: "trackRpe",
    label: "Track RPE (Exertion 1–10)",
    description: "Show an optional Rate of Perceived Exertion column on each set to log fatigue and auto-regulate weight suggestions. Off by default for cleaner, faster set rows.",
    badge: "Recommended Off for Beginners",
  },
  {
    id: "showGhostSuggestions",
    label: "Smart Overload Suggestions",
    description: "Ghost-fill predicted target weight and reps from previous sessions as placeholder hints in set inputs.",
  },
  {
    id: "autoRestTimer",
    label: "Auto-Start Rest Timer",
    description: "Automatically begin the rest countdown when you mark a set as complete.",
  },
];

const coachAtmospherePrefs: PreferenceItem[] = [
  {
    id: "showMascots",
    label: "Mascot Coach Tips & Presence",
    description: "Display Kix and Nyra mascot illustrations and coaching commentary across the app. Turn off for a silent, minimalist gym utility.",
  },
  {
    id: "showAiInsights",
    label: "AI Coach Insights",
    description: "Display AI-generated recommendations and training advice cards on Home and Insights screens.",
  },
  {
    id: "celebrationEffects",
    label: "Celebration Fanfare",
    description: "Show confetti animations and celebration popups when you break personal records or complete workouts.",
  },
];

export function PreferencesContent() {
  const preferences = useProfileStore(
    (state) => state.preferences ?? DEFAULT_USER_PREFERENCES,
  );
  const updatePreferences = useProfileStore((state) => state.updatePreferences);
  const resetPreferences = useProfileStore((state) => state.resetPreferences);

  return (
    <PageContainer>
      <SettingsPageHeader title="Preferences & Logging" />

      <Section title="Workout & Logging">
        <p className="text-xs text-foreground-secondary -mt-2 mb-2">
          Control the density and tools displayed while actively logging sets in the gym.
        </p>
        <Card padding="none" className="divide-y divide-border/60">
          {workoutLoggingPrefs.map((pref) => (
            <div key={pref.id} className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm sm:text-base">{pref.label}</p>
                  {pref.badge && (
                    <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] font-medium text-foreground-secondary border border-border">
                      {pref.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-foreground-secondary mt-1">
                  {pref.description}
                </p>
              </div>
              <Switch
                checked={preferences[pref.id]}
                onChange={(checked) => updatePreferences({ [pref.id]: checked })}
                label={pref.label}
              />
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Coach & Atmosphere (Quiet Mode)">
        <p className="text-xs text-foreground-secondary -mt-2 mb-2">
          Tone down unsolicited dialogue, advice cards, and animations to keep the app focused and quiet.
        </p>
        <Card padding="none" className="divide-y divide-border/60">
          {coachAtmospherePrefs.map((pref) => (
            <div key={pref.id} className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm sm:text-base">{pref.label}</p>
                <p className="text-xs sm:text-sm text-foreground-secondary mt-1">
                  {pref.description}
                </p>
              </div>
              <Switch
                checked={preferences[pref.id]}
                onChange={(checked) => updatePreferences({ [pref.id]: checked })}
                label={pref.label}
              />
            </div>
          ))}
        </Card>
      </Section>

      <div className="flex justify-end pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => resetPreferences()}
          className="text-xs text-foreground-secondary hover:text-foreground"
        >
          Reset all to defaults
        </Button>
      </div>
    </PageContainer>
  );
}
