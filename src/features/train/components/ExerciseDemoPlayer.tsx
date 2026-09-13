"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, FastForward, Activity } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import type { Exercise } from "@/types/exercise";

export interface ExerciseDemoPlayerProps {
  exercise: Exercise;
}

export function ExerciseDemoPlayer({ exercise }: ExerciseDemoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<0.5 | 1 | 1.5>(1);
  const [progress, setProgress] = useState(0); // 0 to 100 representing one rep cycle
  const [repCount, setRepCount] = useState(1);

  // Cycle animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 30;
    // Standard 4-second rep cycle (e.g. 2.5s down, 0.5s pause, 1s up)
    const step = (intervalMs / (4000 / speed)) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          setRepCount((r) => r + 1);
          return 0;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  // Determine movement trajectory archetype
  const name = exercise.name.toLowerCase();
  let movementType: "bench" | "squat" | "deadlift" | "overhead" | "general" = "general";
  if (name.includes("bench") || name.includes("push-up") || name.includes("chest press")) {
    movementType = "bench";
  } else if (name.includes("squat") || name.includes("leg press") || name.includes("lunge")) {
    movementType = "squat";
  } else if (name.includes("deadlift") || name.includes("rdl") || name.includes("good morning")) {
    movementType = "deadlift";
  } else if (name.includes("overhead") || name.includes("shoulder press") || name.includes("military")) {
    movementType = "overhead";
  }

  // Calculate phase and bar position
  let phaseName = "Eccentric (Lowering)";
  let phaseColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
  let barX = 100;
  let barY = 50;

  if (progress < 55) {
    // Phase 1: Eccentric Lowering (0-55%)
    phaseName = "Eccentric Lowering";
    phaseColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    const t = progress / 55;

    if (movementType === "bench") {
      barX = 100 + t * 25;
      barY = 50 + t * 90;
    } else if (movementType === "squat") {
      barX = 100;
      barY = 50 + t * 100;
    } else if (movementType === "deadlift") {
      barX = 100;
      barY = 50 + t * 100;
    } else if (movementType === "overhead") {
      barX = 100 - Math.sin(t * Math.PI) * 10;
      barY = 50 + t * 90;
    } else {
      barX = 100;
      barY = 50 + t * 80;
    }
  } else if (progress < 68) {
    // Phase 2: Bottom Reversal / Stretch Pause (55-68%)
    phaseName = "Bottom Stretch Pause";
    phaseColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
    if (movementType === "bench") {
      barX = 125;
      barY = 140;
    } else if (movementType === "squat") {
      barX = 100;
      barY = 150;
    } else if (movementType === "deadlift") {
      barX = 100;
      barY = 150;
    } else if (movementType === "overhead") {
      barX = 100;
      barY = 140;
    } else {
      barX = 100;
      barY = 130;
    }
  } else {
    // Phase 3: Concentric Drive (68-100%)
    phaseName = "Concentric Drive";
    phaseColor = "text-brand bg-brand/10 border-brand/30";
    const t = (progress - 68) / 32;

    if (movementType === "bench") {
      barX = 125 - t * 25;
      barY = 140 - t * 90;
    } else if (movementType === "squat") {
      barX = 100;
      barY = 150 - t * 100;
    } else if (movementType === "deadlift") {
      barX = 100;
      barY = 150 - t * 100;
    } else if (movementType === "overhead") {
      barX = 100 - Math.sin((1 - t) * Math.PI) * 10;
      barY = 140 - t * 90;
    } else {
      barX = 100;
      barY = 130 - t * 80;
    }
  }

  return (
    <Card padding="md" className="flex flex-col gap-4 border border-border/70">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={iconSize.sm} className="text-brand" />
          <h3 className="text-sm font-bold text-foreground">Kinetic Motion & Bar Path</h3>
        </div>

        {/* Phase Pill */}
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${phaseColor}`}
        >
          {phaseName}
        </span>
      </div>

      {/* Trajectory Canvas */}
      <div className="relative flex flex-col items-center justify-center rounded-2xl bg-neutral-950/90 p-5 border border-border/60 overflow-hidden">
        {/* SVG Path Animator */}
        <svg viewBox="0 0 200 200" className="h-56 w-full select-none">
          {/* Reference Grid lines */}
          <line x1="30" y1="50" x2="170" y2="50" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="30" y1="145" x2="170" y2="145" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="100" y1="25" x2="100" y2="175" stroke="#1E293B" strokeWidth="1" />

          {/* Guide Labels */}
          <text x="35" y="46" fill="#64748B" fontSize="9" fontWeight="600">
            LOCKOUT
          </text>
          <text x="35" y="156" fill="#64748B" fontSize="9" fontWeight="600">
            INFLECTION / DEPTH
          </text>

          {/* Ideal Trajectory Curve */}
          {movementType === "bench" && (
            <path
              d="M 100 50 Q 125 95 125 140"
              fill="none"
              stroke="#06B6D4"
              strokeWidth="2"
              strokeDasharray="3 3"
              className="opacity-40"
            />
          )}
          {movementType === "overhead" && (
            <path
              d="M 100 50 Q 90 95 100 140"
              fill="none"
              stroke="#06B6D4"
              strokeWidth="2"
              strokeDasharray="3 3"
              className="opacity-40"
            />
          )}
          {(movementType === "squat" || movementType === "deadlift" || movementType === "general") && (
            <line
              x1="100"
              y1="50"
              x2="100"
              y2="150"
              stroke="#06B6D4"
              strokeWidth="2"
              strokeDasharray="3 3"
              className="opacity-40"
            />
          )}

          {/* Animated Bar & Collar */}
          <g transform={`translate(${barX}, ${barY})`}>
            {/* Barbell sleeve cross-section */}
            <rect x="-35" y="-3" width="70" height="6" rx="2" fill="#94A3B8" />
            <rect x="-18" y="-7" width="4" height="14" rx="1" fill="#CBD5E1" />
            <rect x="14" y="-7" width="4" height="14" rx="1" fill="#CBD5E1" />
            {/* Olympic Weight Plates */}
            <rect x="-28" y="-18" width="7" height="36" rx="2" fill="#00F0FF" className="drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]" />
            <rect x="21" y="-18" width="7" height="36" rx="2" fill="#00F0FF" className="drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]" />
            {/* Center target indicator */}
            <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
          </g>
        </svg>

        {/* HUD Overlay Stats */}
        <div className="absolute top-3 left-3 flex items-center gap-2 rounded-lg bg-surface/80 px-2.5 py-1 text-xs border border-border/50">
          <span className="text-foreground-secondary">Rep:</span>
          <span className="font-display font-bold text-brand tabular-nums">{repCount}</span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-2 rounded-lg bg-surface/80 px-2.5 py-1 text-xs border border-border/50">
          <span className="text-foreground-secondary">Tempo:</span>
          <span className="font-semibold text-foreground">3-1-X-0</span>
        </div>
      </div>

      {/* Motion Controls Bar */}
      <div className="flex items-center justify-between rounded-xl bg-surface-elevated/70 p-2 border border-border/50">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface text-xs font-semibold text-foreground hover:text-brand border border-border/40 shadow-sm"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setProgress(0);
              setRepCount(1);
            }}
            className="p-1.5 rounded-lg hover:bg-surface text-foreground-secondary hover:text-foreground"
            title="Reset to Lockout"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Speed selection */}
        <div className="flex items-center gap-1 text-[11px] font-semibold">
          <span className="text-foreground-secondary mr-1">Speed:</span>
          {[0.5, 1, 1.5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s as any)}
              className={`px-2 py-0.5 rounded transition-colors ${
                speed === s
                  ? "bg-brand/15 text-brand font-bold"
                  : "text-foreground-secondary hover:text-foreground"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
