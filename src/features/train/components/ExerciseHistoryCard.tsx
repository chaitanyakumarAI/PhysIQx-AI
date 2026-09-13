"use client";

import { Trophy, Calendar, Dumbbell, History } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { useSessionStore } from "@/store/sessionStore";

function formatDisplayDate(dateStr: string) {
  try {
    const d = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export interface ExerciseHistoryCardProps {
  exerciseId: string;
  exerciseName: string;
}

export function ExerciseHistoryCard({ exerciseId, exerciseName }: ExerciseHistoryCardProps) {
  const history = useSessionStore((state) => state.history);

  // Find all historical sets logged for this exercise
  const matchLogs: {
    date: string;
    sessionTitle: string;
    weightKg: number;
    reps: number;
    est1RM: number;
  }[] = [];

  history.forEach((session) => {
    session.topSets?.forEach((ts) => {
      if (ts.exerciseId === exerciseId && ts.weightKg && ts.reps) {
        const est1RM = Math.round(ts.weightKg * (1 + ts.reps / 30) * 2) / 2;
        matchLogs.push({
          date: session.completedAt || session.date,
          sessionTitle: session.title,
          weightKg: ts.weightKg,
          reps: ts.reps,
          est1RM,
        });
      }
    });
  });

  // Sort newest first
  matchLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Personal Record is the highest estimated 1RM
  const personalBest = [...matchLogs].sort((a, b) => b.est1RM - a.est1RM)[0];

  return (
    <Card padding="md" className="flex flex-col gap-4 border border-border/70">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={iconSize.sm} className="text-brand" />
          <h3 className="text-sm font-bold text-foreground">Personal History & PRs</h3>
        </div>

        {personalBest && (
          <span className="flex items-center gap-1 rounded-full bg-legendary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-legendary border border-legendary/30">
            <Trophy size={11} /> PR: {personalBest.weightKg}kg × {personalBest.reps}
          </span>
        )}
      </div>

      {personalBest ? (
        <div className="flex flex-col gap-3">
          {/* PR & Next Target Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col rounded-xl bg-surface-elevated/70 p-3 border border-border/40">
              <span className="text-[11px] font-semibold text-foreground-secondary uppercase tracking-wider">
                Estimated 1RM
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-display text-xl font-bold tabular-nums text-foreground">
                  {personalBest.est1RM}
                </span>
                <span className="text-xs font-semibold text-foreground-secondary">kg</span>
              </div>
            </div>

            <div className="flex flex-col rounded-xl bg-surface-elevated/70 p-3 border border-border/40">
              <span className="text-[11px] font-semibold text-foreground-secondary uppercase tracking-wider">
                Next Overload Goal
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-display text-xl font-bold tabular-nums text-brand">
                  {personalBest.weightKg + 2.5}
                </span>
                <span className="text-xs font-semibold text-foreground-secondary">kg (+2.5)</span>
              </div>
            </div>
          </div>

          {/* Recent Training Logs */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-foreground">Recent Session Performances</span>
            {matchLogs.slice(0, 3).map((log, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl bg-surface-elevated/50 p-2.5 text-xs border border-border/30"
              >
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-foreground-secondary" />
                  <span className="text-foreground-secondary">
                    {formatDisplayDate(log.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-display tabular-nums">
                  <span className="font-bold text-foreground">
                    {log.weightKg} kg × {log.reps} reps
                  </span>
                  <span className="text-[11px] text-foreground-secondary">
                    (Est. {log.est1RM}k)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-xl bg-surface-elevated/40 p-6 text-center border border-border/40">
          <Dumbbell size={28} className="text-foreground-secondary mb-2 opacity-50" />
          <p className="text-xs font-bold text-foreground">No Logged Sessions Yet</p>
          <p className="text-[11px] text-foreground-secondary mt-1 max-w-xs leading-relaxed">
            Sets logged for {exerciseName} in active workout sessions will appear here with automated 1RM trend tracking.
          </p>
        </div>
      )}
    </Card>
  );
}
