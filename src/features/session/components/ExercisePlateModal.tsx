"use client";

import { useState, useId } from "react";
import { X, Dumbbell, Flame, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { iconSize } from "@/constants/icons";
import {
  calculatePlates,
  generateWarmupSets,
  type PlateCount,
  type WarmupSet,
} from "@/lib/barbellCalculator";

export interface ExercisePlateModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  initialWeight?: number | null;
  onApplyWeight?: (weight: number) => void;
}

interface BarOption {
  id: string;
  name: string;
  weightKg: number;
}

const BAR_OPTIONS: BarOption[] = [
  { id: "olympic", name: "Olympic Bar", weightKg: 20 },
  { id: "womens", name: "Women's Bar", weightKg: 15 },
  { id: "technique", name: "Technique Bar", weightKg: 10 },
  { id: "trap", name: "Trap Bar", weightKg: 25 },
];

export function ExercisePlateModal({
  isOpen,
  onClose,
  exerciseName,
  initialWeight,
  onApplyWeight,
}: ExercisePlateModalProps) {
  const [targetWeight, setTargetWeight] = useState<number>(
    initialWeight && initialWeight > 0 ? initialWeight : 60
  );
  const [selectedBar, setSelectedBar] = useState<BarOption>(BAR_OPTIONS[0]!); // Olympic 20kg default
  const [viewMode, setViewMode] = useState<"plates" | "warmup">("plates");
  const weightInputId = useId();

  if (!isOpen) return null;

  const plateResult = calculatePlates(targetWeight, selectedBar.weightKg);
  const warmupSets = generateWarmupSets(targetWeight, selectedBar.weightKg);

  function adjustWeight(delta: number) {
    setTargetWeight((prev) => Math.max(selectedBar.weightKg, Math.round((prev + delta) * 2) / 2));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plate-modal-title"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-surface p-5 shadow-2xl border border-border sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-brand/15 text-brand">
              <Dumbbell size={iconSize.sm} />
            </span>
            <div>
              <h2 id="plate-modal-title" className="text-base font-bold text-foreground line-clamp-1">
                {exerciseName}
              </h2>
              <p className="text-xs text-foreground-secondary">Plate Math & Warmup Ladder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="grid size-8 place-items-center rounded-full text-foreground-secondary hover:bg-surface-elevated hover:text-foreground"
          >
            <X size={iconSize.sm} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="mt-4 flex rounded-xl bg-surface-elevated p-1">
          <button
            type="button"
            onClick={() => setViewMode("plates")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              viewMode === "plates"
                ? "bg-surface text-brand shadow-sm font-bold"
                : "text-foreground-secondary hover:text-foreground"
            }`}
          >
            <Dumbbell size={14} /> Plate Visualizer
          </button>
          <button
            type="button"
            onClick={() => setViewMode("warmup")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              viewMode === "warmup"
                ? "bg-surface text-brand shadow-sm font-bold"
                : "text-foreground-secondary hover:text-foreground"
            }`}
          >
            <Flame size={14} /> Warmup Ladder
          </button>
        </div>

        {/* Weight & Bar Controls */}
        <div className="mt-4 flex flex-col gap-3">
          {/* Target Weight row */}
          <div className="flex items-center justify-between rounded-xl bg-surface-elevated/70 p-3 border border-border/60">
            <div className="flex flex-col">
              <label htmlFor={weightInputId} className="text-[11px] font-semibold uppercase tracking-wider text-foreground-secondary">
                Target Load
              </label>
              <div className="flex items-baseline gap-1 mt-0.5">
                <input
                  id={weightInputId}
                  type="number"
                  step="0.5"
                  min={selectedBar.weightKg}
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(Number(e.target.value) || selectedBar.weightKg)}
                  className="w-20 bg-transparent text-2xl font-bold font-display text-foreground focus:outline-none focus:ring-1 focus:ring-brand rounded"
                />
                <span className="text-sm font-semibold text-foreground-secondary">kg</span>
              </div>
            </div>

            {/* Quick Adjust Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => adjustWeight(-5)}
                className="px-2 py-1 rounded bg-surface-elevated hover:bg-surface-elevated/80 text-xs font-semibold border border-border/50 text-foreground"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => adjustWeight(-2.5)}
                className="px-2 py-1 rounded bg-surface-elevated hover:bg-surface-elevated/80 text-xs font-semibold border border-border/50 text-foreground"
              >
                -2.5
              </button>
              <button
                type="button"
                onClick={() => adjustWeight(2.5)}
                className="px-2 py-1 rounded bg-surface-elevated hover:bg-surface-elevated/80 text-xs font-semibold border border-border/50 text-foreground"
              >
                +2.5
              </button>
              <button
                type="button"
                onClick={() => adjustWeight(5)}
                className="px-2 py-1 rounded bg-surface-elevated hover:bg-surface-elevated/80 text-xs font-semibold border border-border/50 text-foreground"
              >
                +5
              </button>
            </div>
          </div>

          {/* Bar Selection */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {BAR_OPTIONS.map((bar: BarOption) => (
              <button
                key={bar.id}
                type="button"
                onClick={() => {
                  setSelectedBar(bar);
                  if (targetWeight < bar.weightKg) setTargetWeight(bar.weightKg);
                }}
                className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors border ${
                  selectedBar.id === bar.id
                    ? "bg-brand/15 text-brand border-brand/40 font-semibold"
                    : "bg-surface-elevated text-foreground-secondary border-transparent hover:text-foreground"
                }`}
              >
                {bar.name} ({bar.weightKg}kg)
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          {viewMode === "plates" ? (
            <div className="flex flex-col gap-4">
              {/* Barbell Sleeve Graphic */}
              <div className="relative flex flex-col items-center justify-center rounded-2xl bg-black/40 p-5 border border-border/80">
                <div className="relative flex items-center justify-center h-28 w-full max-w-sm">
                  {/* Shaft & Collar */}
                  <div className="h-4 w-16 bg-neutral-600 rounded-l-sm" />
                  <div className="h-10 w-3 bg-neutral-400 rounded-sm" />
                  <div className="h-6 flex-1 max-w-[200px] bg-neutral-500 relative flex items-center px-1">
                    {/* Stacked plates */}
                    <div className="flex items-center gap-1">
                      {plateResult.platesPerSide.map((plate: PlateCount, idx: number) => {
                        const heightPx = Math.min(100, Math.max(36, plate.weight * 3.6));
                        return (
                          <div
                            key={`${plate.weight}-${idx}`}
                            className={`flex items-center justify-center rounded-sm font-bold text-[10px] text-white shadow-md ${plate.color}`}
                            style={{
                              height: `${heightPx}px`,
                              width: `${Math.max(14, Math.min(24, plate.weight * 0.7))}px`,
                            }}
                            title={`${plate.count}x ${plate.weight}kg plate`}
                          >
                            <span className="[writing-mode:vertical-rl] rotate-180">
                              {plate.weight}
                            </span>
                          </div>
                        );
                      })}
                      {plateResult.platesPerSide.length === 0 && (
                        <span className="text-[11px] text-foreground-secondary ml-2 italic">Empty sleeve</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Per Side Breakdown */}
                <div className="mt-2 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
                    Per Side Loading
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {plateResult.platesPerSide.length > 0
                      ? plateResult.platesPerSide
                          .map((p: PlateCount) => `${p.count} × ${p.weight}kg`)
                          .join(", ")
                      : "Collar only (bar weight)"}
                  </p>
                  {plateResult.remainder > 0 && (
                    <p className="mt-1 text-xs text-warning">
                      Note: {plateResult.remainder} kg cannot be loaded with available plates.
                    </p>
                  )}
                </div>
              </div>

              {/* Breakdown summary pills */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-surface-elevated p-2.5">
                  <span className="text-foreground-secondary">Bar Weight:</span>
                  <p className="font-semibold text-foreground">{selectedBar.weightKg} kg</p>
                </div>
                <div className="rounded-xl bg-surface-elevated p-2.5">
                  <span className="text-foreground-secondary">Plates Total:</span>
                  <p className="font-semibold text-foreground">
                    {targetWeight - selectedBar.weightKg - plateResult.remainder} kg
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Warmup Ladder View */
            <div className="flex flex-col gap-2.5">
              <p className="text-xs text-foreground-secondary">
                Progressive neuromuscular warmup ladder up to {targetWeight}kg working weight:
              </p>
              {warmupSets.map((ws: WarmupSet, i: number) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    ws.percent === 100
                      ? "bg-brand/10 border-brand/40 text-brand"
                      : "bg-surface-elevated/70 border-border/50 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-6 place-items-center rounded-full bg-surface text-xs font-bold font-display">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold">
                        {ws.purpose}{" "}
                        <span className="text-[11px] text-foreground-secondary">
                          ({ws.percent}%)
                        </span>
                      </p>
                      <p className="text-[11px] text-foreground-secondary">
                        {ws.platesPerSide ? `Per side: ${ws.platesPerSide}` : "Empty bar"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold font-display tabular-nums">
                      {ws.weight} kg
                    </span>
                    <p className="text-[10px] text-foreground-secondary">× {ws.reps} reps</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center gap-2 border-t border-border pt-3">
          {onApplyWeight && (
            <Button
              size="md"
              variant="primary"
              className="flex-1"
              onClick={() => {
                onApplyWeight(targetWeight);
                onClose();
              }}
            >
              <Check size={iconSize.xs} /> Apply {targetWeight} kg to Set
            </Button>
          )}
          <Button size="md" variant="secondary" onClick={onClose} className={onApplyWeight ? "" : "w-full"}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
