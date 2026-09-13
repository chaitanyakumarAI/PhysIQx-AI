"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Dumbbell, Flame, Search, CheckCircle2, ChevronRight } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/sessionStore";
import { mockHistoricalSessions } from "@/features/profile/mocks/historyData";

export function HistoryContent() {
  const storeHistory = useSessionStore((state) => state.history);
  // Merge store history with seed mock data so demo view is always rich
  const allSessions = storeHistory.length > 0 ? storeHistory : mockHistoricalSessions;

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "strength">("all");

  const totalWorkouts = allSessions.length;
  const totalVolumeKg = allSessions.reduce((sum, s) => sum + (s.totalVolumeKg || 0), 0);
  const totalMinutes = Math.round(allSessions.reduce((sum, s) => sum + (s.durationSec || 0), 0) / 60);
  const totalXP = allSessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0);

  const filteredSessions = allSessions.filter((s) => {
    const matchesQuery = s.title.toLowerCase().includes(query.toLowerCase());
    if (!matchesQuery) return false;
    if (filter === "completed") return s.status === "completed";
    if (filter === "strength") return (s.totalVolumeKg || 0) > 0;
    return true;
  });

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center gap-3 pt-4">
        <Link
          href="/profile"
          aria-label="Back to Profile"
          className="grid size-10 place-items-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          <ArrowLeft size={iconSize.sm} aria-hidden />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">Workout History</h1>
          <p className="text-xs text-foreground-secondary">
            {totalWorkouts} sessions logged to your training ledger
          </p>
        </div>
      </div>

      {/* Aggregate Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card padding="sm" className="flex flex-col items-center text-center">
          <span className="font-display text-lg font-bold text-brand">
            {totalVolumeKg > 1000 ? `${(totalVolumeKg / 1000).toFixed(1)}k` : totalVolumeKg} kg
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-foreground-secondary">
            Total Volume
          </span>
        </Card>
        <Card padding="sm" className="flex flex-col items-center text-center">
          <span className="font-display text-lg font-bold">
            {totalMinutes} min
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-foreground-secondary">
            Time Under Bar
          </span>
        </Card>
        <Card padding="sm" className="flex flex-col items-center text-center">
          <span className="font-display text-lg font-bold text-brand">
            +{totalXP.toLocaleString()}
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-foreground-secondary">
            XP Gained
          </span>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-secondary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workouts..."
            className="w-full h-10 pl-10 pr-4 rounded-full border border-border bg-surface text-sm text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-brand/60"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition-colors",
              filter === "all" ? "bg-brand text-background" : "bg-surface-elevated text-foreground-secondary hover:text-foreground"
            )}
          >
            All ({allSessions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition-colors",
              filter === "completed" ? "bg-brand text-background" : "bg-surface-elevated text-foreground-secondary hover:text-foreground"
            )}
          >
            Completed
          </button>
          <button
            type="button"
            onClick={() => setFilter("strength")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition-colors",
              filter === "strength" ? "bg-brand text-background" : "bg-surface-elevated text-foreground-secondary hover:text-foreground"
            )}
          >
            Strength
          </button>
        </div>
      </div>

      {/* Session List */}
      <div className="flex flex-col gap-3 pb-6">
        {filteredSessions.map((session) => {
          const durationMins = Math.round(session.durationSec / 60);
          return (
            <Link
              key={session.id}
              href={`/session/${session.id}`}
              className="block group focus-visible:outline-none"
            >
              <Card
                padding="md"
                className="transition-all hover:border-brand/40 group-hover:bg-surface-elevated flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-base text-foreground group-hover:text-brand transition-colors">
                      {session.title}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={11} aria-hidden />
                      {session.status || "completed"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-foreground-secondary">
                    <span>{session.date}</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-4 gap-2 text-xs py-2 border-y border-border/40">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-foreground-secondary uppercase font-medium">Duration</span>
                    <span className="font-semibold text-foreground">{durationMins}m</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-foreground-secondary uppercase font-medium">Volume</span>
                    <span className="font-semibold text-foreground">
                      {session.totalVolumeKg ? `${session.totalVolumeKg.toLocaleString()}kg` : "—"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-foreground-secondary uppercase font-medium">Sets</span>
                    <span className="font-semibold text-foreground">{session.setsCompleted}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-foreground-secondary uppercase font-medium">XP</span>
                    <span className="font-semibold text-brand">+{session.xpEarned}</span>
                  </div>
                </div>

                {/* Top Set Highlight */}
                {session.topSets && session.topSets.length > 0 && session.topSets[0] && (
                  <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                    <Dumbbell size={12} className="text-brand shrink-0" />
                    <span className="truncate">
                      Top set: <strong className="text-foreground">{session.topSets[0].exerciseName}</strong> — {session.topSets[0].weightKg}kg &times; {session.topSets[0].reps}
                    </span>
                  </div>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}
