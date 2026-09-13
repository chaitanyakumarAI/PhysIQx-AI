"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { PageContainer } from "@/components/layout/PageContainer";
import { SettingsPageHeader } from "@/features/profile/components/SettingsPageHeader";
import { useSessionStore, type CompletedSessionSummary } from "@/store/sessionStore";
import { useProfileStore } from "@/store/profileStore";
import { evaluateAchievements } from "@/lib/achievementEngine";
import { computeStreakSummary } from "@/lib/streakEngine";
import { mockHistoricalSessions } from "@/features/profile/mocks/historyData";

const includedItems = [
  "Complete workout history and set details",
  "Body stats and logged weight trend history",
  "Unlocked achievements and milestone progress",
  "Custom logging preferences and notification rules",
];

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ExportContent() {
  const [downloadState, setDownloadState] = useState<{
    format: "json" | "csv" | null;
    successMessage: string | null;
  }>({
    format: null,
    successMessage: null,
  });

  const sessionHistory = useSessionStore((state) => state.history);
  const profileState = useProfileStore();

  // Combine seeded history with any active session store records
  const allSessions: CompletedSessionSummary[] =
    sessionHistory.length > 0 ? sessionHistory : mockHistoricalSessions;
  const streak = computeStreakSummary(allSessions);
  const evalResult = evaluateAchievements({
    history: allSessions,
    streakDays: streak.currentStreakDays,
  });

  function exportJSON() {
    const timestamp = new Date().toISOString().slice(0, 10);
    const archive = {
      meta: {
        app: "PhysIQx AI",
        version: "2.0.0",
        exportedAt: new Date().toISOString(),
        totalWorkouts: allSessions.length,
      },
      profile: {
        identity: profileState.onboardingProfile,
        heightCm: profileState.heightCm,
        weightEntries: profileState.weightEntries,
        preferences: profileState.preferences,
        notifications: profileState.notificationPreferences,
      },
      training: {
        streak: {
          currentStreakDays: streak.currentStreakDays,
          longestStreakDays: streak.longestStreakDays,
          completionPercent: streak.completionPercent,
          activeStreak: streak.activeStreak,
        },
        sessions: allSessions,
      },
      achievements: evalResult.achievements.map((a) => ({
        id: a.id,
        name: a.name,
        rarity: a.rarity,
        state: a.state,
        progress: Math.round(a.progress * 100),
      })),
    };

    triggerDownload(
      JSON.stringify(archive, null, 2),
      `physiqx-archive-${timestamp}.json`,
      "application/json"
    );

    setDownloadState({
      format: "json",
      successMessage: `physiqx-archive-${timestamp}.json downloaded successfully with ${allSessions.length} workouts and profile data.`,
    });
  }

  function exportCSV() {
    const timestamp = new Date().toISOString().slice(0, 10);
    const headers = [
      "ID",
      "Date",
      "CompletedAt",
      "Title",
      "MissionId",
      "DurationMinutes",
      "SetsCompleted",
      "TotalVolumeKg",
      "XPEarned",
      "TopSetSummary",
      "Status",
    ];

    const rows = allSessions.map((s: CompletedSessionSummary) => {
      const topSet =
        s.topSets && s.topSets.length > 0
          ? `${s.topSets[0]?.exerciseName}: ${s.topSets[0]?.weightKg}kg x ${s.topSets[0]?.reps}`
          : "";
      return [
        `"${s.id}"`,
        `"${s.date}"`,
        `"${s.completedAt}"`,
        `"${s.title.replace(/"/g, '""')}"`,
        `"${s.missionId}"`,
        (s.durationSec / 60).toFixed(1),
        s.setsCompleted,
        s.totalVolumeKg,
        s.xpEarned,
        `"${topSet}"`,
        `"${s.status}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    triggerDownload(
      csvContent,
      `physiqx-workouts-${timestamp}.csv`,
      "text/csv;charset=utf-8;"
    );

    setDownloadState({
      format: "csv",
      successMessage: `physiqx-workouts-${timestamp}.csv downloaded successfully (${allSessions.length} sessions).`,
    });
  }

  return (
    <PageContainer>
      <SettingsPageHeader title="Export data" />
      <Card padding="lg" className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-elevated text-foreground-secondary">
            <FileText size={iconSize.md} aria-hidden />
          </span>
          <div>
            <p className="font-semibold">Export & Data Portability</p>
            <p className="text-xs text-foreground-secondary">
              Download an offline-first copy of everything PhysIQx tracks for you.
            </p>
          </div>
        </div>

        <ul className="flex flex-col gap-2 text-xs text-foreground-secondary">
          {includedItems.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand" />
              {item}
            </li>
          ))}
        </ul>

        {downloadState.successMessage && (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-field border border-brand/30 bg-brand/10 p-3.5 text-xs text-brand"
          >
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <div className="flex-1 font-medium leading-relaxed">
              {downloadState.successMessage}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5 pt-1">
          <Button
            size="lg"
            fullWidth
            onClick={exportJSON}
            className="flex items-center justify-center gap-2"
          >
            <Download size={iconSize.sm} aria-hidden />
            Export Full JSON Archive
          </Button>

          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={exportCSV}
            className="flex items-center justify-center gap-2"
          >
            <FileSpreadsheet size={iconSize.sm} aria-hidden />
            Export Workouts as CSV
          </Button>
        </div>

        <div className="flex items-center gap-2 border-t border-border/40 pt-3 text-[11px] text-foreground-secondary">
          <ShieldCheck size={14} className="text-brand shrink-0" />
          <span>Your data stays on your device. Exports are generated purely client-side.</span>
        </div>
      </Card>
    </PageContainer>
  );
}
