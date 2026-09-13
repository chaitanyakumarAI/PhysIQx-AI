"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  RefreshCw,
  CheckCircle2,
  Watch,
  HeartPulse,
  Smartphone,
  ShieldCheck,
  Zap,
  Sliders,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { SettingsPageHeader } from "@/features/profile/components/SettingsPageHeader";
import { triggerHaptic } from "@/lib/audioEngine";

interface IntegrationProvider {
  id: string;
  name: string;
  subtitle: string;
  category: "mobile" | "wearable" | "smart-ring";
  metrics: string[];
  connected: boolean;
  lastSynced: string;
}

const INITIAL_PROVIDERS: IntegrationProvider[] = [
  {
    id: "apple-health",
    name: "Apple Health (HealthKit)",
    subtitle: "Sync workouts, resting HR, and active calories with iOS & Apple Watch.",
    category: "mobile",
    metrics: ["Workouts", "Active Energy", "Resting HR", "VO2 Max"],
    connected: true,
    lastSynced: "4 mins ago",
  },
  {
    id: "health-connect",
    name: "Health Connect by Android",
    subtitle: "Google & Android unified fitness ledger and workout sync.",
    category: "mobile",
    metrics: ["Workouts", "Daily Steps", "Heart Rate Zones"],
    connected: false,
    lastSynced: "Never",
  },
  {
    id: "garmin",
    name: "Garmin Connect",
    subtitle: "Import GPS cardio sessions, HRV status, and training readiness.",
    category: "wearable",
    metrics: ["GPS Cardio", "HRV Status", "Training Readiness"],
    connected: true,
    lastSynced: "18 mins ago",
  },
  {
    id: "whoop",
    name: "WHOOP 4.0",
    subtitle: "Incorporate Day Strain, Recovery %, and Sleep performance.",
    category: "wearable",
    metrics: ["Day Strain", "Recovery Score", "Sleep Need"],
    connected: false,
    lastSynced: "Never",
  },
  {
    id: "oura",
    name: "Oura Ring (Gen 3 / 4)",
    subtitle: "Sleep architecture, readiness score, and body temperature deviation.",
    category: "smart-ring",
    metrics: ["Readiness Score", "Sleep Stages", "Temperature"],
    connected: false,
    lastSynced: "Never",
  },
];

export function IntegrationsContent() {
  const [providers, setProviders] = useState<IntegrationProvider[]>(INITIAL_PROVIDERS);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

  // Granular settings switches
  const [writeWorkouts, setWriteWorkouts] = useState(true);
  const [readHrv, setReadHrv] = useState(true);
  const [syncWifiOnly, setSyncWifiOnly] = useState(false);

  function toggleProvider(id: string) {
    setProviders((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const next = !p.connected;
          triggerHaptic("light");
          return {
            ...p,
            connected: next,
            lastSynced: next ? "Just now" : "Never",
          };
        }
        return p;
      })
    );
  }

  function handleSyncAll() {
    setSyncing(true);
    setSyncSuccess(null);
    triggerHaptic("medium");

    setTimeout(() => {
      setSyncing(false);
      setSyncSuccess("All connected health services synced successfully.");
      setProviders((prev) =>
        prev.map((p) => (p.connected ? { ...p, lastSynced: "Just now" } : p))
      );
      triggerHaptic("success");
      setTimeout(() => setSyncSuccess(null), 3000);
    }, 950);
  }

  const activeConnectedCount = providers.filter((p) => p.connected).length;

  return (
    <PageContainer>
      <SettingsPageHeader title="Wearables & Integrations" />

      {/* Sync Status Hero Card */}
      <Card variant="accent" padding="lg" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-brand/15 text-brand">
              <Activity size={18} aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-base font-bold">Health Synchronization</h2>
              <p className="text-xs text-foreground-secondary">
                {activeConnectedCount} active connected telemetry streams
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleSyncAll}
            disabled={syncing || activeConnectedCount === 0}
            className="flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={cn(syncing && "animate-spin")} />
            <span>{syncing ? "Syncing..." : "Sync All"}</span>
          </Button>
        </div>

        {syncSuccess && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-field bg-brand/15 px-3 py-2 text-xs font-semibold text-brand animate-in fade-in"
          >
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{syncSuccess}</span>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-foreground-secondary">
          <span>Auto-sync interval: <strong>Every 15 minutes</strong></span>
          <span>Background battery impact: <strong>&lt;0.5%</strong></span>
        </div>
      </Card>

      {/* Integration Providers List */}
      <div className="flex flex-col gap-3">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground-secondary">
          Connected Health Ecosystems
        </h3>

        <div className="flex flex-col gap-3">
          {providers.map((provider) => (
            <Card
              key={provider.id}
              padding="md"
              className={cn(
                "flex flex-col gap-3 transition-colors border",
                provider.connected ? "border-brand/40 bg-surface" : "border-border/60 bg-surface/70"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-field",
                      provider.connected
                        ? "bg-brand/15 text-brand"
                        : "bg-surface-elevated text-foreground-secondary"
                    )}
                  >
                    {provider.category === "wearable" ? (
                      <Watch size={20} />
                    ) : provider.category === "smart-ring" ? (
                      <HeartPulse size={20} />
                    ) : (
                      <Smartphone size={20} />
                    )}
                  </span>

                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {provider.name}
                    </p>
                    <p className="text-xs text-foreground-secondary line-clamp-2 mt-0.5">
                      {provider.subtitle}
                    </p>
                  </div>
                </div>

                {/* Connection Toggle Switch */}
                <button
                  type="button"
                  onClick={() => toggleProvider(provider.id)}
                  aria-pressed={provider.connected}
                  aria-label={`Toggle ${provider.name} connection`}
                  className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand/60",
                    provider.connected ? "bg-brand" : "bg-surface-elevated border border-border"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block size-4 transform rounded-full bg-background transition-transform",
                      provider.connected ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {/* Supported Metric Badges & Last Synced */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2 text-xs">
                <div className="flex flex-wrap gap-1.5">
                  {provider.metrics.map((m) => (
                    <span
                      key={m}
                      className="rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] font-medium text-foreground-secondary"
                    >
                      {m}
                    </span>
                  ))}
                </div>

                <span className="text-[11px] text-foreground-secondary">
                  Synced: <strong className="text-foreground">{provider.lastSynced}</strong>
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Sync Rules & Permissions */}
      <Card padding="md" className="flex flex-col gap-3 border-border/60">
        <h3 className="font-display text-sm font-bold flex items-center gap-2">
          <Sliders size={15} className="text-brand" />
          Sync Rules & Export Options
        </h3>

        <div className="divide-y divide-border/40 text-xs">
          <div className="flex items-center justify-between py-2.5">
            <div>
              <p className="font-semibold text-foreground">Export Workouts to Health App</p>
              <p className="text-[11px] text-foreground-secondary">
                Write completed PhysIQx strength & cardio sessions into Apple Health/Google
              </p>
            </div>
            <input
              type="checkbox"
              checked={writeWorkouts}
              onChange={(e) => setWriteWorkouts(e.target.checked)}
              className="size-4 accent-brand"
            />
          </div>

          <div className="flex items-center justify-between py-2.5">
            <div>
              <p className="font-semibold text-foreground">Incorporate HRV & Resting HR</p>
              <p className="text-[11px] text-foreground-secondary">
                Use daily wearable biometric recovery data to tune PhysIQ readiness
              </p>
            </div>
            <input
              type="checkbox"
              checked={readHrv}
              onChange={(e) => setReadHrv(e.target.checked)}
              className="size-4 accent-brand"
            />
          </div>

          <div className="flex items-center justify-between py-2.5">
            <div>
              <p className="font-semibold text-foreground">Wi-Fi Only Sync</p>
              <p className="text-[11px] text-foreground-secondary">
                Conserve mobile cellular data by syncing heavier telemetry streams on Wi-Fi
              </p>
            </div>
            <input
              type="checkbox"
              checked={syncWifiOnly}
              onChange={(e) => setSyncWifiOnly(e.target.checked)}
              className="size-4 accent-brand"
            />
          </div>
        </div>
      </Card>

      {/* Biometric Privacy Pledge */}
      <div className="flex items-start gap-2.5 rounded-card border border-brand/20 bg-brand/5 p-3.5 text-xs text-foreground-secondary pb-8">
        <ShieldCheck size={16} className="text-brand shrink-0 mt-0.5" />
        <p>
          <strong className="text-foreground">Biometric Privacy Standard:</strong> PhysIQx processes wearable health telemetry locally on-device. Your heart rate, sleep architecture, and biometric data are never sold or shared with third-party advertisers.
        </p>
      </div>
    </PageContainer>
  );
}
