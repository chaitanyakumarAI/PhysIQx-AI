"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Calculator,
  ChevronRight,
  Dumbbell,
  Flame,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Weight,
} from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import {
  calculateOneRepMax,
  calculatePlates,
  generatePercentageTable,
  generateWarmupSets,
  STANDARD_OLYMPIC_PLATES,
} from "@/lib/barbellCalculator";

export function PlateCalculatorScreen() {
  const [activeTab, setActiveTab] = useState<"plates" | "warmup" | "onerep">("plates");

  // Plate Loader state
  const [targetWeight, setTargetWeight] = useState(100);
  const [barWeight, setBarWeight] = useState(20);

  // Warmup state
  const [workingWeight, setWorkingWeight] = useState(100);

  // 1RM state
  const [repWeight, setRepWeight] = useState(100);
  const [repsDone, setRepsDone] = useState(5);

  const plateResult = useMemo(
    () => calculatePlates(targetWeight, barWeight),
    [targetWeight, barWeight],
  );

  const warmupSets = useMemo(
    () => generateWarmupSets(workingWeight, barWeight),
    [workingWeight, barWeight],
  );

  const oneRepMax = useMemo(
    () => calculateOneRepMax(repWeight, repsDone),
    [repWeight, repsDone],
  );

  const percentageTable = useMemo(
    () => generatePercentageTable(oneRepMax.average),
    [oneRepMax.average],
  );

  return (
    <PageContainer className="pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4">
        <Link
          href="/train"
          aria-label="Back to Train"
          className="grid size-11 place-items-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          <ArrowLeft size={iconSize.sm} aria-hidden />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Barbell & Strength Lab
          </h1>
          <p className="text-xs text-foreground-secondary">
            Plate math, scientific warmups, and 1RM standards
          </p>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex gap-2 rounded-2xl border border-border/60 bg-surface p-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("plates")}
          className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${
            activeTab === "plates"
              ? "bg-brand text-zinc-950 font-bold"
              : "text-foreground-secondary hover:text-foreground"
          }`}
        >
          Plate Math
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("warmup")}
          className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${
            activeTab === "warmup"
              ? "bg-brand text-zinc-950 font-bold"
              : "text-foreground-secondary hover:text-foreground"
          }`}
        >
          Warm-up Sets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("onerep")}
          className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${
            activeTab === "onerep"
              ? "bg-brand text-zinc-950 font-bold"
              : "text-foreground-secondary hover:text-foreground"
          }`}
        >
          1RM & % Table
        </button>
      </div>

      {/* Tab 1: Plate Loader */}
      {activeTab === "plates" && (
        <div className="flex flex-col gap-4">
          {/* Target Weight Card */}
          <Card className="flex flex-col gap-4 border-border/80 bg-surface/90">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
                Target Barbell Weight
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setBarWeight(20)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    barWeight === 20
                      ? "bg-brand text-zinc-950"
                      : "bg-surface-elevated text-foreground-secondary"
                  }`}
                >
                  20kg Bar
                </button>
                <button
                  type="button"
                  onClick={() => setBarWeight(15)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    barWeight === 15
                      ? "bg-brand text-zinc-950"
                      : "bg-surface-elevated text-foreground-secondary"
                  }`}
                >
                  15kg Bar
                </button>
              </div>
            </div>

            {/* Stepper Display */}
            <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface-elevated/60 p-4">
              <button
                type="button"
                onClick={() => setTargetWeight(Math.max(barWeight, targetWeight - 2.5))}
                className="grid size-12 place-items-center rounded-xl bg-surface text-foreground hover:bg-surface-elevated active:scale-95 transition-transform"
              >
                <Minus size={iconSize.md} />
              </button>

              <div className="text-center">
                <span className="font-display text-4xl font-black tracking-tight text-foreground">
                  {targetWeight}
                </span>
                <span className="text-sm font-semibold text-foreground-secondary ml-1">
                  kg
                </span>
                <span className="block text-xs text-foreground-secondary">
                  {plateResult.weightPerSide} kg per side
                </span>
              </div>

              <button
                type="button"
                onClick={() => setTargetWeight(targetWeight + 2.5)}
                className="grid size-12 place-items-center rounded-xl bg-surface text-foreground hover:bg-surface-elevated active:scale-95 transition-transform"
              >
                <Plus size={iconSize.md} />
              </button>
            </div>

            {/* Quick Increment Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[60, 80, 100, 120, 140, 160, 180, 200].map((wt) => (
                <button
                  key={wt}
                  type="button"
                  onClick={() => setTargetWeight(wt)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    targetWeight === wt
                      ? "bg-brand text-zinc-950"
                      : "bg-surface-elevated text-foreground-secondary hover:text-foreground"
                  }`}
                >
                  {wt} kg
                </button>
              ))}
            </div>
          </Card>

          {/* Barbell Visual Sleeve Graphic */}
          <Card className="flex flex-col gap-3 border-border/80 bg-surface/90">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
              Sleeve Loading (Per Side)
            </span>

            {plateResult.platesPerSide.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-xs text-foreground-secondary">
                Empty barbell sleeve (Collar only)
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Visual Plates Stack */}
                <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-border/40 bg-zinc-950 p-4">
                  {/* Barbell Sleeve Collar */}
                  <div className="h-16 w-3 rounded-sm bg-zinc-700 shrink-0" title="Barbell Collar" />
                  <div className="h-6 w-4 bg-zinc-600 shrink-0" />

                  {/* Loaded Plates */}
                  {plateResult.platesPerSide.flatMap((plate, pIdx) =>
                    Array.from({ length: plate.count }).map((_, cIdx) => (
                      <div
                        key={`${pIdx}-${cIdx}`}
                        className={`flex h-20 min-w-[28px] shrink-0 items-center justify-center rounded-md border border-black/30 font-display text-[10px] font-bold shadow-md ${plate.color}`}
                      >
                        {plate.label.replace("kg", "")}
                      </div>
                    )),
                  )}

                  {/* Free Sleeve Bar */}
                  <div className="h-6 flex-1 min-w-[30px] rounded-r-md bg-zinc-700" />
                </div>

                {/* Textual Plate List */}
                <div className="grid grid-cols-2 gap-2">
                  {plateResult.platesPerSide.map((plate) => (
                    <div
                      key={plate.weight}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-surface-elevated/40 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`size-3 rounded-full ${plate.color.split(" ")[0]}`} />
                        <span className="font-semibold">{plate.label}</span>
                      </div>
                      <span className="font-bold text-foreground">
                        {plate.count} &times; side ({plate.count * 2} total)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 2: Warm-up Sets */}
      {activeTab === "warmup" && (
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3 border-border/80 bg-surface/90">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
              Working Weight Target
            </span>

            <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface-elevated/60 p-3.5">
              <button
                type="button"
                onClick={() => setWorkingWeight(Math.max(25, workingWeight - 5))}
                className="grid size-10 place-items-center rounded-xl bg-surface text-foreground hover:bg-surface-elevated active:scale-95"
              >
                <Minus size={iconSize.sm} />
              </button>

              <div className="text-center">
                <span className="font-display text-3xl font-black text-foreground">
                  {workingWeight} kg
                </span>
                <span className="block text-[11px] text-foreground-secondary">
                  Target Work Sets Load
                </span>
              </div>

              <button
                type="button"
                onClick={() => setWorkingWeight(workingWeight + 5)}
                className="grid size-10 place-items-center rounded-xl bg-surface text-foreground hover:bg-surface-elevated active:scale-95"
              >
                <Plus size={iconSize.sm} />
              </button>
            </div>
          </Card>

          <Card className="flex flex-col gap-3 border-border/80 bg-surface/90">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
                Pyramid Warm-up Protocol
              </span>
              <span className="text-[11px] text-brand font-semibold">
                4 Ramp Sets
              </span>
            </div>

            <div className="divide-y divide-border/40">
              {warmupSets.map((set) => (
                <div key={set.setNumber} className="py-3 first:pt-1 last:pb-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-7 place-items-center rounded-lg bg-surface-elevated font-display text-xs font-bold text-foreground">
                        {set.setNumber}
                      </span>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-base font-bold text-foreground">
                            {set.weight} kg
                          </span>
                          <span className="text-xs font-semibold text-emerald-400">
                            &times; {set.reps} reps
                          </span>
                        </div>
                        <span className="text-[11px] text-foreground-secondary">
                          {set.purpose}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-foreground">
                        {set.platesPerSide}
                      </span>
                      <span className="block text-[10px] text-foreground-secondary">
                        {set.percent}% load
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: 1RM & Percentage Matrix */}
      {activeTab === "onerep" && (
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-4 border-border/80 bg-surface/90">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
              Completed Lift Metrics
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-foreground-secondary">
                  Weight Lifted (kg)
                </label>
                <input
                  type="number"
                  value={repWeight}
                  onChange={(e) => setRepWeight(Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded-xl border border-border/70 bg-surface-elevated px-3 py-2 text-sm font-bold text-foreground focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-foreground-secondary">
                  Reps Completed
                </label>
                <input
                  type="number"
                  value={repsDone}
                  onChange={(e) => setRepsDone(Number(e.target.value) || 1)}
                  className="mt-1 w-full rounded-xl border border-border/70 bg-surface-elevated px-3 py-2 text-sm font-bold text-foreground focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            {/* Computed 1RM Highlight */}
            <div className="flex items-center justify-between rounded-2xl border border-brand/40 bg-brand/10 p-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand">
                  Estimated 1RM
                </span>
                <span className="block font-display text-3xl font-black text-foreground">
                  {oneRepMax.average} kg
                </span>
              </div>
              <div className="text-right text-xs text-foreground-secondary">
                <span>Epley: {oneRepMax.epley} kg</span>
                <span className="block">Brzycki: {oneRepMax.brzycki} kg</span>
              </div>
            </div>
          </Card>

          {/* Training Percentages Grid */}
          <Card className="flex flex-col gap-3 border-border/80 bg-surface/90">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
              Training Intensity Zones
            </span>

            <div className="grid grid-cols-2 gap-2">
              {percentageTable.map((row) => (
                <div
                  key={row.percent}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-surface-elevated/40 p-2.5 text-xs"
                >
                  <div>
                    <span className="font-bold text-brand">{row.percent}%</span>
                    <span className="block text-[11px] text-foreground-secondary">
                      ~{row.targetReps} reps
                    </span>
                  </div>
                  <span className="font-display text-sm font-bold">
                    {row.weight} kg
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
