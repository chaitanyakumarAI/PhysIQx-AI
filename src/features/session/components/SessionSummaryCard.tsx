"use client";

import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { Mascot } from "@/components/mascots/Mascot";
import { StatChipRow, type StatEntry } from "@/features/shared/components/StatChipRow";
import { formatElapsedTime } from "../lib/derive";
import { playCelebrationFanfare } from "@/lib/audioEngine";
import { WorkoutShareModal } from "./WorkoutShareModal";
import { iconSize } from "@/constants/icons";

export interface SessionSummaryCardProps {
  durationSeconds: number;
  volume: number;
  unit: string;
  xpReward: number;
  workoutTitle?: string;
  className?: string;
}

/** The completed-session celebration — Kix's flagship surface: his
 *  proud-of-you face inside the CircularProgress glow ring (the same
 *  celebratory pattern as Onboarding's DNAResultStep). */
export function SessionSummaryCard({
  durationSeconds,
  volume,
  unit,
  xpReward,
  workoutTitle = "Training Mission",
  className,
}: SessionSummaryCardProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    playCelebrationFanfare();
  }, []);

  const stats: StatEntry[] = [
    { label: "Duration", value: formatElapsedTime(durationSeconds) },
    { label: "Volume", value: `${volume.toLocaleString()}${unit}` },
    { label: "XP Earned", value: `+${xpReward}` },
  ];

  return (
    <div className={className}>
      <Card variant="accent" padding="lg" className="flex flex-col items-center gap-4 text-center">
        <CircularProgress value={100} size={112} strokeWidth={6} glow>
          <Mascot pose="kix-proud" size={92} shape="circle" />
        </CircularProgress>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-secondary">
            Workout complete
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-brand">Nice work.</h2>
        </div>
      </Card>
      <StatChipRow stats={stats} className="mt-4" />

      <div className="mt-4">
        <Button
          size="md"
          variant="secondary"
          fullWidth
          onClick={() => setIsShareOpen(true)}
          className="border border-brand/30 hover:bg-brand/10 hover:text-brand"
        >
          <Share2 size={iconSize.xs} />
          <span>Share Workout Victory</span>
        </Button>
      </div>

      <WorkoutShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        workoutTitle={workoutTitle}
        durationSeconds={durationSeconds}
        volumeKg={volume}
        xpReward={xpReward}
      />
    </div>
  );
}
