"use client";

import { useState } from "react";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { OptionCard } from "@/components/ui/OptionCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { SettingsPageHeader } from "@/features/profile/components/SettingsPageHeader";

type Theme = "dark" | "light" | "system";

const themes: { value: Theme; label: string; icon: LucideIcon }[] = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
];

/**
 * Selection is real (local state), but only Dark is actually applied to the
 * app right now — PhysIQx is dark-first per docs/UI_Guideliness.md, and no
 * light theme exists yet. The caption says so honestly rather than letting
 * Light/System silently do nothing.
 */
export function AppearanceContent() {
  const [theme, setTheme] = useState<Theme>("dark");

  return (
    <PageContainer>
      <SettingsPageHeader title="Appearance" />
      <Section title="Theme">
        <div role="group" aria-label="Theme" className="flex flex-col gap-3">
          {themes.map((option) => (
            <OptionCard
              key={option.value}
              label={option.label}
              icon={option.icon}
              selected={theme === option.value}
              onSelect={() => setTheme(option.value)}
            />
          ))}
        </div>
        {theme !== "dark" && (
          <p className="text-sm text-foreground-secondary">
            Light and System themes are coming in a future update — PhysIQx
            is dark-first for now, so your selection won&apos;t change how the
            app looks yet.
          </p>
        )}
      </Section>
    </PageContainer>
  );
}
