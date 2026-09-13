"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import type { MuscleGroup } from "@/types/exercise";
import { muscleGroupLabels } from "@/types/exercise";

export interface MuscleAnatomyVisualizerProps {
  muscleHit: Partial<Record<MuscleGroup, number>>;
  exerciseName: string;
}

export function MuscleAnatomyVisualizer({ muscleHit, exerciseName }: MuscleAnatomyVisualizerProps) {
  const [activeTab, setActiveTab] = useState<"anterior" | "posterior">("anterior");
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);

  // Helper to get fill color and glow based on activation share
  function getMuscleStyle(group: MuscleGroup) {
    const share = muscleHit[group] ?? 0;
    if (share >= 40) {
      return {
        fill: "#10B981", // Emerald brand tone
        stroke: "#34D399",
        className: "drop-shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse",
        tier: "Primary Agonist",
      };
    }
    if (share >= 15) {
      return {
        fill: "#06B6D4", // Cyan
        stroke: "#38BDF8",
        className: "drop-shadow-[0_0_4px_rgba(6,182,212,0.5)]",
        tier: "Secondary Synergist",
      };
    }
    if (share > 0) {
      return {
        fill: "#3B82F6", // Blue
        stroke: "#60A5FA",
        className: "",
        tier: "Dynamic Stabilizer",
      };
    }
    return {
      fill: "#1E293B", // Inactive slate
      stroke: "#334155",
      className: "opacity-40",
      tier: "Passive",
    };
  }

  const chestStyle = getMuscleStyle("chest");
  const shouldersStyle = getMuscleStyle("shoulders");
  const armsStyle = getMuscleStyle("arms");
  const coreStyle = getMuscleStyle("core");
  const legsStyle = getMuscleStyle("legs");
  const backStyle = getMuscleStyle("back");

  return (
    <Card padding="md" className="flex flex-col gap-4 overflow-hidden border border-border/70">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">EMG Stimulus Anatomy</h3>
          <p className="text-xs text-foreground-secondary">
            Biomechanical activation mapped across kinetic chain
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex rounded-lg bg-surface-elevated p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("anterior")}
            className={`rounded-md px-2.5 py-1 transition-colors ${
              activeTab === "anterior"
                ? "bg-surface text-brand shadow-sm font-bold"
                : "text-foreground-secondary hover:text-foreground"
            }`}
          >
            Anterior (Front)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("posterior")}
            className={`rounded-md px-2.5 py-1 transition-colors ${
              activeTab === "posterior"
                ? "bg-surface text-brand shadow-sm font-bold"
                : "text-foreground-secondary hover:text-foreground"
            }`}
          >
            Posterior (Back)
          </button>
        </div>
      </div>

      {/* SVG Muscular Silhouette Canvas */}
      <div className="relative flex items-center justify-center rounded-2xl bg-neutral-950/80 p-6 border border-border/60">
        <svg
          viewBox="0 0 200 300"
          className="h-64 w-auto select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Head & Neck */}
          <circle cx="100" cy="30" r="16" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
          <path d="M 94 46 L 94 56 L 106 56 L 106 46 Z" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />

          {activeTab === "anterior" ? (
            /* ANTERIOR (FRONT) VIEW */
            <g id="anterior-muscles">
              {/* Shoulders (Deltoids) */}
              <path
                d="M 66 58 C 60 62 52 75 52 88 C 58 92 68 85 70 75 Z"
                fill={shouldersStyle.fill}
                stroke={shouldersStyle.stroke}
                strokeWidth="1.5"
                className={`cursor-pointer transition-all hover:opacity-80 ${shouldersStyle.className}`}
                onClick={() => setSelectedMuscle("shoulders")}
              />
              <path
                d="M 134 58 C 140 62 148 75 148 88 C 142 92 132 85 130 75 Z"
                fill={shouldersStyle.fill}
                stroke={shouldersStyle.stroke}
                strokeWidth="1.5"
                className={`cursor-pointer transition-all hover:opacity-80 ${shouldersStyle.className}`}
                onClick={() => setSelectedMuscle("shoulders")}
              />

              {/* Chest (Pectoralis Major) */}
              <path
                d="M 72 65 C 82 62 98 68 98 90 C 85 92 70 85 68 76 Z"
                fill={chestStyle.fill}
                stroke={chestStyle.stroke}
                strokeWidth="1.5"
                className={`cursor-pointer transition-all hover:opacity-80 ${chestStyle.className}`}
                onClick={() => setSelectedMuscle("chest")}
              />
              <path
                d="M 128 65 C 118 62 102 68 102 90 C 115 92 130 85 132 76 Z"
                fill={chestStyle.fill}
                stroke={chestStyle.stroke}
                strokeWidth="1.5"
                className={`cursor-pointer transition-all hover:opacity-80 ${chestStyle.className}`}
                onClick={() => setSelectedMuscle("chest")}
              />

              {/* Arms (Biceps & Forearms) */}
              <path
                d="M 50 90 C 46 102 44 118 48 132 C 54 130 58 116 56 102 Z"
                fill={armsStyle.fill}
                stroke={armsStyle.stroke}
                strokeWidth="1.5"
                className={`cursor-pointer transition-all hover:opacity-80 ${armsStyle.className}`}
                onClick={() => setSelectedMuscle("arms")}
              />
              <path
                d="M 150 90 C 154 102 156 118 152 132 C 146 130 142 116 144 102 Z"
                fill={armsStyle.fill}
                stroke={armsStyle.stroke}
                strokeWidth="1.5"
                className={`cursor-pointer transition-all hover:opacity-80 ${armsStyle.className}`}
                onClick={() => setSelectedMuscle("arms")}
              />
              {/* Forearms */}
              <path
                d="M 46 135 C 42 152 40 170 42 185 C 48 185 52 168 52 150 Z"
                fill={armsStyle.fill}
                stroke={armsStyle.stroke}
                strokeWidth="1.5"
                className={armsStyle.className}
              />
              <path
                d="M 154 135 C 158 152 160 170 158 185 C 152 185 148 168 148 150 Z"
                fill={armsStyle.fill}
                stroke={armsStyle.stroke}
                strokeWidth="1.5"
                className={armsStyle.className}
              />

              {/* Core (Abs & Obliques) */}
              <rect
                x="82"
                y="95"
                width="36"
                height="50"
                rx="6"
                fill={coreStyle.fill}
                stroke={coreStyle.stroke}
                strokeWidth="1.5"
                className={`cursor-pointer transition-all hover:opacity-80 ${coreStyle.className}`}
                onClick={() => setSelectedMuscle("core")}
              />
              {/* Abdominal dividing lines */}
              <line x1="100" y1="95" x2="100" y2="145" stroke="#090d16" strokeWidth="1.5" />
              <line x1="82" y1="112" x2="118" y2="112" stroke="#090d16" strokeWidth="1.5" />
              <line x1="82" y1="128" x2="118" y2="128" stroke="#090d16" strokeWidth="1.5" />

              {/* Pelvis */}
              <path d="M 80 147 L 120 147 L 112 165 L 88 165 Z" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />

              {/* Legs (Quadriceps & Adductors) */}
              <path
                d="M 78 168 C 72 195 72 225 76 242 C 84 242 94 220 95 190 C 96 172 90 168 78 168 Z"
                fill={legsStyle.fill}
                stroke={legsStyle.stroke}
                strokeWidth="1.5"
                className={`cursor-pointer transition-all hover:opacity-80 ${legsStyle.className}`}
                onClick={() => setSelectedMuscle("legs")}
              />
              <path
                d="M 122 168 C 128 195 128 225 124 242 C 116 242 106 220 105 190 C 104 172 110 168 122 168 Z"
                fill={legsStyle.fill}
                stroke={legsStyle.stroke}
                strokeWidth="1.5"
                className={`cursor-pointer transition-all hover:opacity-80 ${legsStyle.className}`}
                onClick={() => setSelectedMuscle("legs")}
              />

              {/* Calves (Anterior Tibialis) */}
              <path
                d="M 75 248 C 72 265 74 285 78 292 C 82 292 86 280 86 265 C 86 250 82 248 75 248 Z"
                fill={legsStyle.fill}
                stroke={legsStyle.stroke}
                strokeWidth="1.5"
                className={legsStyle.className}
              />
              <path
                d="M 125 248 C 128 265 126 285 122 292 C 118 292 114 280 114 265 C 114 250 118 248 125 248 Z"
                fill={legsStyle.fill}
                stroke={legsStyle.stroke}
                strokeWidth="1.5"
                className={legsStyle.className}
              />
            </g>
          ) : (
            /* POSTERIOR (BACK) VIEW */
            <g id="posterior-muscles">
              {/* Trapezius & Upper Back */}
              <path
                d="M 85 54 L 115 54 L 128 78 L 100 105 L 72 78 Z"
                fill={backStyle.fill}
                stroke={backStyle.stroke}
                strokeWidth="1.5"
                className={`cursor-pointer transition-all hover:opacity-80 ${backStyle.className}`}
                onClick={() => setSelectedMuscle("back")}
              />

              {/* Rear Deltoids */}
              <path
                d="M 64 62 C 58 68 52 78 52 90 C 58 92 68 85 70 78 Z"
                fill={shouldersStyle.fill}
                stroke={shouldersStyle.stroke}
                strokeWidth="1.5"
                className={shouldersStyle.className}
              />
              <path
                d="M 136 62 C 142 68 148 78 148 90 C 142 92 132 85 130 78 Z"
                fill={shouldersStyle.fill}
                stroke={shouldersStyle.stroke}
                strokeWidth="1.5"
                className={shouldersStyle.className}
              />

              {/* Latissimus Dorsi & Lower Back */}
              <path
                d="M 72 82 C 70 105 76 135 84 145 C 92 145 96 125 96 105 Z"
                fill={backStyle.fill}
                stroke={backStyle.stroke}
                strokeWidth="1.5"
                className={`cursor-pointer transition-all hover:opacity-80 ${backStyle.className}`}
                onClick={() => setSelectedMuscle("back")}
              />
              <path
                d="M 128 82 C 130 105 124 135 116 145 C 108 145 104 125 104 105 Z"
                fill={backStyle.fill}
                stroke={backStyle.stroke}
                strokeWidth="1.5"
                className={`cursor-pointer transition-all hover:opacity-80 ${backStyle.className}`}
                onClick={() => setSelectedMuscle("back")}
              />

              {/* Arms (Triceps) */}
              <path
                d="M 50 92 C 46 104 44 120 48 132 C 54 130 58 116 56 102 Z"
                fill={armsStyle.fill}
                stroke={armsStyle.stroke}
                strokeWidth="1.5"
                className={armsStyle.className}
              />
              <path
                d="M 150 92 C 154 104 156 120 152 132 C 146 130 142 116 144 102 Z"
                fill={armsStyle.fill}
                stroke={armsStyle.stroke}
                strokeWidth="1.5"
                className={armsStyle.className}
              />

              {/* Gluteus Maximus */}
              <path
                d="M 78 148 C 72 165 72 185 86 188 C 96 188 98 165 98 150 Z"
                fill={legsStyle.fill}
                stroke={legsStyle.stroke}
                strokeWidth="1.5"
                className={`cursor-pointer transition-all hover:opacity-80 ${legsStyle.className}`}
                onClick={() => setSelectedMuscle("legs")}
              />
              <path
                d="M 122 148 C 128 165 128 185 114 188 C 104 188 102 165 102 150 Z"
                fill={legsStyle.fill}
                stroke={legsStyle.stroke}
                strokeWidth="1.5"
                className={`cursor-pointer transition-all hover:opacity-80 ${legsStyle.className}`}
                onClick={() => setSelectedMuscle("legs")}
              />

              {/* Hamstrings */}
              <path
                d="M 76 190 C 70 215 72 235 76 244 C 84 244 94 228 95 205 C 96 192 88 190 76 190 Z"
                fill={legsStyle.fill}
                stroke={legsStyle.stroke}
                strokeWidth="1.5"
                className={legsStyle.className}
              />
              <path
                d="M 124 190 C 130 215 128 235 124 244 C 116 244 106 228 105 205 C 104 192 112 190 124 190 Z"
                fill={legsStyle.fill}
                stroke={legsStyle.stroke}
                strokeWidth="1.5"
                className={legsStyle.className}
              />

              {/* Calves (Gastrocnemius & Soleus) */}
              <path
                d="M 74 248 C 70 268 72 288 78 294 C 84 294 88 282 86 262 Z"
                fill={legsStyle.fill}
                stroke={legsStyle.stroke}
                strokeWidth="1.5"
                className={legsStyle.className}
              />
              <path
                d="M 126 248 C 130 268 128 288 122 294 C 116 294 112 282 114 262 Z"
                fill={legsStyle.fill}
                stroke={legsStyle.stroke}
                strokeWidth="1.5"
                className={legsStyle.className}
              />
            </g>
          )}
        </svg>

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1 rounded-lg bg-surface/90 p-2 backdrop-blur-sm text-[10px] border border-border/60">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-brand" />
            <span className="text-foreground-secondary">Primary (&gt;40%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-cyan-500" />
            <span className="text-foreground-secondary">Secondary (15–39%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-500" />
            <span className="text-foreground-secondary">Stabilizer (&lt;15%)</span>
          </div>
        </div>
      </div>

      {/* Selected Muscle detail card */}
      {selectedMuscle && (
        <div className="flex items-start gap-2.5 rounded-xl bg-surface-elevated/80 p-3 text-xs border border-border/50">
          <Info size={iconSize.xs} className="text-brand shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-foreground capitalize">
                {muscleGroupLabels[selectedMuscle]}
              </span>
              <span className="font-display font-bold text-brand tabular-nums">
                {muscleHit[selectedMuscle] ?? 0}% Stimulus Share
              </span>
            </div>
            <p className="mt-0.5 text-foreground-secondary text-[11px]">
              {getMuscleStyle(selectedMuscle).tier} in {exerciseName}.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
