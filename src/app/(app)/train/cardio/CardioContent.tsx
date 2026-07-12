"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FilterChipRow, type FilterChipOption } from "@/components/ui/FilterChipRow";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { iconSize } from "@/constants/icons";
import {
  cardioActivityLabels,
  useCardioStore,
  type CardioActivity,
} from "@/store/cardioStore";

/** WHO guideline: 150 min of moderate cardio per week. */
const WEEKLY_TARGET_MINUTES = 150;

const activityOptions: FilterChipOption[] = (
  Object.entries(cardioActivityLabels) as [CardioActivity, string][]
).map(([id, label]) => ({ id, label }));

const durationOptions: FilterChipOption[] = ["10", "15", "20", "30", "45", "60"].map(
  (minutes) => ({ id: minutes, label: `${minutes} min` }),
);

function formatSessionDate(isoDate: string): string {
  // Fixed locale so server and client render identical strings.
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Cardio logging — the Cardio pillar's input surface, kept to three taps:
 * activity chip, duration chip, Save. Backdating is deliberately absent
 * (log-as-you-go keeps the habit honest and the form friction-free).
 */
export function CardioContent() {
  const router = useRouter();
  const sessions = useCardioStore((state) => state.sessions);
  const logSession = useCardioStore((state) => state.logSession);
  const removeSession = useCardioStore((state) => state.removeSession);

  const [activity, setActivity] = useState<CardioActivity | null>(null);
  const [duration, setDuration] = useState<string | null>("20");
  const [customMinutes, setCustomMinutes] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const minutes = customMinutes ? Number(customMinutes) : Number(duration ?? 0);
  const canSave =
    activity !== null && Number.isFinite(minutes) && minutes >= 5 && minutes <= 300;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekAgoIso = weekAgo.toISOString().slice(0, 10);
  const weekSessions = sessions.filter((session) => session.date >= weekAgoIso);
  const weekMinutes = weekSessions.reduce((sum, session) => sum + session.minutes, 0);

  const recent = [...sessions].reverse().slice(0, 6);

  function handleSave() {
    if (!activity || !canSave) return;
    logSession(activity, Math.round(minutes), new Date().toISOString().slice(0, 10));
    setSavedMessage(
      `${cardioActivityLabels[activity]} · ${Math.round(minutes)} min logged — feeds your Cardio pillar.`,
    );
    setCustomMinutes("");
  }

  return (
    <PageContainer>
      <div className="flex items-center gap-3 pt-6">
        <IconButton label="Back to Train" variant="ghost" onClick={() => router.push("/train")}>
          <ArrowLeft size={iconSize.sm} aria-hidden />
        </IconButton>
        <h1 className="font-display text-2xl font-bold">Log Cardio</h1>
      </div>

      <Card padding="md" className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold">This week</span>
          <span className="text-sm text-foreground-secondary">
            {weekMinutes} / {WEEKLY_TARGET_MINUTES} min · {weekSessions.length}{" "}
            {weekSessions.length === 1 ? "session" : "sessions"}
          </span>
        </div>
        <ProgressBar
          value={Math.min(100, (weekMinutes / WEEKLY_TARGET_MINUTES) * 100)}
          tone="brand"
          aria-label={`${weekMinutes} of ${WEEKLY_TARGET_MINUTES} weekly cardio minutes`}
        />
      </Card>

      <Section title="What did you do?">
        <FilterChipRow
          label="Activity"
          variant="accent"
          options={activityOptions}
          selectedId={activity}
          onSelect={(id) => setActivity(id as CardioActivity)}
        />
        <FilterChipRow
          label="Duration"
          options={durationOptions}
          selectedId={customMinutes ? null : duration}
          onSelect={(id) => {
            setDuration(id);
            setCustomMinutes("");
          }}
        />
        <Input
          label="Custom duration (min)"
          type="number"
          inputMode="numeric"
          placeholder="e.g. 25"
          value={customMinutes}
          onChange={(event) => setCustomMinutes(event.target.value)}
        />
        <Button fullWidth disabled={!canSave} onClick={handleSave}>
          Save session
        </Button>
        {savedMessage && (
          <p role="status" className="text-sm text-brand">
            {savedMessage}
          </p>
        )}
      </Section>

      {recent.length > 0 && (
        <Section title="Recent sessions">
          <Card padding="md">
            <ul aria-label="Recent cardio sessions" className="divide-y divide-border/60">
              {recent.map((session) => (
                <li
                  key={session.id}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <span className="flex-1 text-sm font-semibold">
                    {cardioActivityLabels[session.activity]}
                  </span>
                  <span className="text-sm tabular-nums text-foreground-secondary">
                    {session.minutes} min
                  </span>
                  <span className="text-sm text-foreground-secondary">
                    {formatSessionDate(session.date)}
                  </span>
                  <IconButton
                    label={`Remove ${cardioActivityLabels[session.activity]} session`}
                    variant="ghost"
                    onClick={() => removeSession(session.id)}
                  >
                    <X size={iconSize.xs} aria-hidden />
                  </IconButton>
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      )}
    </PageContainer>
  );
}
