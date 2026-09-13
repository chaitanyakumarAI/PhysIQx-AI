"use client";

import { useMemo, useState } from "react";
import { Gauge, Ruler, Scale } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatTile } from "@/components/ui/StatTile";
import { TrendChart } from "@/components/charts/TrendChart";
import { HologramBodyScan } from "@/components/ui/HologramBodyScan";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { SettingsPageHeader } from "@/features/profile/components/SettingsPageHeader";
import {
  SEED_HEIGHT_CM,
  bmiCategory,
  computeBmi,
  mergeWeightEntries,
  seedWeightEntries,
} from "@/features/profile/lib/bodyStats";
import { useProfileStore } from "@/store/profileStore";
import type { BodyShapeCategory, HeightTier, ViewAngle } from "@/types/bodyScan";

const WEIGHT_RANGE = { min: 30, max: 300 };
const HEIGHT_RANGE = { min: 100, max: 250 };

function formatEntryDate(isoDate: string): string {
  // Fixed locale so server and client render identical strings.
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Body Stats — current height/weight/BMI, a log-update form, and the weight
 * trend over time. BMI is shown as context only: the score's
 * body-composition signal is the selected Body Shape pillar, so this page
 * never claims BMI moves the score.
 */
export function BodyContent() {
  const storedHeightCm = useProfileStore((state) => state.heightCm);
  const loggedEntries = useProfileStore((state) => state.weightEntries);
  const setHeight = useProfileStore((state) => state.setHeight);
  const logWeight = useProfileStore((state) => state.logWeight);
  const onboardingProfile = useProfileStore((state) => state.onboardingProfile);

  const [scanAngle, setScanAngle] = useState<ViewAngle>("front");
  const [scanGender, setScanGender] = useState<"male" | "female">("male");

  const heightCm = storedHeightCm ?? SEED_HEIGHT_CM;
  const heightTier: HeightTier =
    heightCm < 168 ? "short" : heightCm > 183 ? "tall" : "average";
  const bodyShape =
    (onboardingProfile?.goalBodyShape as BodyShapeCategory) || "athletic";
  const entries = useMemo(
    () => mergeWeightEntries(seedWeightEntries(), loggedEntries),
    [loggedEntries],
  );
  const latest = entries[entries.length - 1];
  const bmi = latest ? computeBmi(latest.weightKg, heightCm) : null;

  const [weightInput, setWeightInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const weight = weightInput ? Number(weightInput) : null;
    const height = heightInput ? Number(heightInput) : null;

    if (weight === null && height === null) {
      setFormError("Enter a weight or height to save.");
      return;
    }
    if (
      weight !== null &&
      (!Number.isFinite(weight) || weight < WEIGHT_RANGE.min || weight > WEIGHT_RANGE.max)
    ) {
      setFormError(`Weight should be ${WEIGHT_RANGE.min}–${WEIGHT_RANGE.max} kg.`);
      return;
    }
    if (
      height !== null &&
      (!Number.isFinite(height) || height < HEIGHT_RANGE.min || height > HEIGHT_RANGE.max)
    ) {
      setFormError(`Height should be ${HEIGHT_RANGE.min}–${HEIGHT_RANGE.max} cm.`);
      return;
    }

    if (weight !== null) {
      logWeight(Math.round(weight * 10) / 10, new Date().toISOString().slice(0, 10));
    }
    if (height !== null) setHeight(Math.round(height));
    setWeightInput("");
    setHeightInput("");
    setFormError(null);
    setSaved(true);
  }

  const recentEntries = [...entries].reverse().slice(0, 6);

  return (
    <PageContainer>
      <SettingsPageHeader title="Body Stats" />

      <div className="grid grid-cols-3 gap-3">
        <StatTile icon={Ruler} value={`${heightCm}`} label="Height (cm)" />
        <StatTile
          icon={Scale}
          value={latest ? `${latest.weightKg}` : "—"}
          label="Weight (kg)"
          tone="brand"
        />
        <StatTile
          icon={Gauge}
          value={bmi !== null ? `${bmi}` : "—"}
          label={bmi !== null ? `BMI · ${bmiCategory(bmi)}` : "BMI"}
          tone="info"
        />
      </div>

      <Section title="Digital Twin Hologram Scan">
        <Card padding="md" className="flex flex-col items-center gap-4">
          <div className="w-full max-w-[280px]">
            <HologramBodyScan
              heightTier={heightTier}
              bodyShape={bodyShape}
              gender={scanGender}
              viewAngle={scanAngle}
              showHudBrackets={true}
              showStatureBadge={true}
              aspectRatio={scanAngle === "icon" ? "1/1" : "3/4"}
            />
          </div>

          {/* Scanner Controls */}
          <div className="flex w-full max-w-[320px] items-center justify-between gap-2">
            <div className="flex items-center rounded-lg bg-surface/80 p-0.5 border border-border/60">
              {(["front", "side", "45deg", "icon"] as const).map((angle) => (
                <button
                  key={angle}
                  type="button"
                  onClick={() => setScanAngle(angle)}
                  className={`rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                    scanAngle === angle
                      ? "bg-brand text-black font-bold shadow-sm"
                      : "text-foreground-secondary hover:text-foreground"
                  }`}
                >
                  {angle === "45deg" ? "45°" : angle}
                </button>
              ))}
            </div>

            <div className="flex items-center rounded-lg bg-surface/80 p-0.5 border border-border/60">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setScanGender(g)}
                  className={`rounded-md px-2 py-1 text-[11px] font-semibold capitalize transition-colors ${
                    scanGender === g
                      ? "bg-brand text-black font-bold shadow-sm"
                      : "text-foreground-secondary hover:text-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <p className="text-center text-xs text-foreground-secondary">
            Calibrated for {heightTier} stature ({heightCm} cm) • {bodyShape} archetype
          </p>
        </Card>
      </Section>

      <Section title="Log an update">
        <Card padding="md" className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Weight (kg)"
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder={latest ? `${latest.weightKg}` : "75"}
              value={weightInput}
              onChange={(event) => setWeightInput(event.target.value)}
            />
            <Input
              label="Height (cm)"
              type="number"
              inputMode="numeric"
              placeholder={`${heightCm}`}
              value={heightInput}
              onChange={(event) => setHeightInput(event.target.value)}
            />
          </div>
          <Button fullWidth onClick={handleSave}>
            Save
          </Button>
          {formError && (
            <p role="alert" className="text-sm text-danger">
              {formError}
            </p>
          )}
          {saved && !formError && (
            <p role="status" className="text-sm text-foreground-secondary">
              Saved. If your physique has changed, review your body type — it
              powers your Body Shape pillar.
            </p>
          )}
        </Card>
      </Section>

      <Section title="Weight trend">
        <Card padding="md">
          <TrendChart
            interactive
            detail
            aria-label="Weight over time"
            points={entries.map((entry) => ({
              value: entry.weightKg,
              date: entry.date,
            }))}
          />
        </Card>
      </Section>

      <Section title="History">
        <Card padding="md">
          <ul aria-label="Recent weight entries" className="divide-y divide-border/60">
            {recentEntries.map((entry, index) => {
              const previous = recentEntries[index + 1];
              const delta = previous
                ? Math.round((entry.weightKg - previous.weightKg) * 10) / 10
                : null;
              return (
                <li
                  key={entry.date}
                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                >
                  <span className="text-sm text-foreground-secondary">
                    {formatEntryDate(entry.date)}
                  </span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-display font-bold tabular-nums">
                      {entry.weightKg} kg
                    </span>
                    {delta !== null && delta !== 0 && (
                      <span
                        className={
                          delta < 0
                            ? "text-xs tabular-nums text-brand"
                            : "text-xs tabular-nums text-foreground-secondary"
                        }
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </Section>

    </PageContainer>
  );
}
