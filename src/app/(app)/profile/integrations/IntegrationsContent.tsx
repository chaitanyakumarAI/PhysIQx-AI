"use client";

import { Check, Clock, Smartphone } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { SettingsPageHeader } from "@/features/profile/components/SettingsPageHeader";
import { CardioImportCard } from "@/features/train/components/CardioImportCard";
import {
  CARDIO_PROVIDERS,
  providerStatusLabels,
  type ProviderStatus,
} from "@/lib/cardio/providers";
import { cn } from "@/lib/utils";

const statusStyle: Record<ProviderStatus, { icon: typeof Check; tone: string }> = {
  available: { icon: Check, tone: "bg-brand/15 text-brand" },
  "coming-soon": { icon: Clock, tone: "bg-white/[0.06] text-foreground-secondary" },
  "needs-app": { icon: Smartphone, tone: "bg-white/[0.06] text-foreground-secondary" },
};

/**
 * Where cardio comes from — stated honestly. Nothing here claims a
 * connection that doesn't exist: file import works today, Strava is next,
 * and Apple Health / Health Connect need the mobile app.
 */
export function IntegrationsContent() {
  return (
    <PageContainer>
      <SettingsPageHeader title="Cardio sync & imports" />

      <CardioImportCard />

      <Section title="Sources">
        <Card padding="none" className="divide-y divide-white/[0.06]">
          {CARDIO_PROVIDERS.map((provider) => {
            const style = statusStyle[provider.status];
            const Icon = style.icon;
            return (
              <div key={provider.id} className="flex flex-col gap-1.5 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{provider.name}</h3>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      style.tone,
                    )}
                  >
                    <Icon size={12} aria-hidden />
                    {providerStatusLabels[provider.status]}
                  </span>
                </div>
                <p className="text-sm text-foreground-secondary">{provider.summary}</p>
                {provider.howTo && (
                  <p className="text-xs text-foreground-muted">{provider.howTo}</p>
                )}
              </div>
            );
          })}
        </Card>
      </Section>

      <p className="px-1 text-xs text-foreground-muted">
        Imported activities stay on this device and sync to your account when you&apos;re signed in.
        Same workout from two sources? It&apos;s counted once.
      </p>
    </PageContainer>
  );
}
