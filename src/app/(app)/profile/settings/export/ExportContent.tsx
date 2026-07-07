"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { PageContainer } from "@/components/layout/PageContainer";
import { SettingsPageHeader } from "@/features/profile/components/SettingsPageHeader";

const includedItems = [
  "Workout history and personal records",
  "Nutrition logs (protein and hydration)",
  "XP, level, and achievement progress",
  "PhysIQ Score history",
];

export function ExportContent() {
  const [status, setStatus] = useState<"idle" | "preparing" | "ready">("idle");

  function handleExport() {
    setStatus("preparing");
    // No backend yet — this is the seam where a real export job would run.
    // The delay is honest feedback (the loading state is otherwise
    // imperceptible), not a simulation of real functionality.
    setTimeout(() => setStatus("ready"), 900);
  }

  return (
    <PageContainer>
      <SettingsPageHeader title="Export data" />
      <Card padding="lg" className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-elevated text-foreground-secondary">
            <FileText size={iconSize.md} aria-hidden />
          </span>
          <div>
            <p className="font-semibold">Your data, in one file</p>
            <p className="text-sm text-foreground-secondary">
              A complete copy of everything PhysIQx tracks for you.
            </p>
          </div>
        </div>

        <ul className="flex flex-col gap-2 text-sm text-foreground-secondary">
          {includedItems.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand" />
              {item}
            </li>
          ))}
        </ul>

        {status === "ready" ? (
          <p
            role="status"
            className="rounded-field border border-brand/20 bg-brand/10 p-3 text-center text-sm text-foreground-secondary"
          >
            Your export is ready.{" "}
            <span className="font-semibold text-foreground">physiqx-data.json</span>{" "}
            would download here once a backend exists.
          </p>
        ) : (
          <Button size="lg" fullWidth loading={status === "preparing"} onClick={handleExport}>
            <Download size={iconSize.sm} aria-hidden />
            Export my data
          </Button>
        )}
      </Card>
    </PageContainer>
  );
}
