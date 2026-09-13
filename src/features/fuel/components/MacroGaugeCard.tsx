"use client";

import { useMemo } from "react";
import { Droplets, Flame, Zap } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { useHydrationStore, getTodayHydrationTotal } from "@/store/hydrationStore";
import { useNutritionStore } from "@/store/nutritionStore";
import { playWaterDrop } from "@/lib/audioEngine";

export function MacroGaugeCard() {
  const targets = useNutritionStore((state) => state.targets);
  const items = useNutritionStore((state) => state.items);
  const hydrationEntries = useHydrationStore((state) => state.entries);
  const addWater = useHydrationStore((state) => state.addWater);

  const waterConsumed = useMemo(
    () => getTodayHydrationTotal(hydrationEntries),
    [hydrationEntries],
  );

  const summary = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]!;
    const todayItems = items.filter((item) => item.loggedAt.startsWith(today));

    const consumedCalories = todayItems.reduce((sum, item) => sum + item.calories, 0);
    const consumedProtein = todayItems.reduce((sum, item) => sum + item.protein, 0);
    const consumedCarbs = todayItems.reduce((sum, item) => sum + item.carbs, 0);
    const consumedFat = todayItems.reduce((sum, item) => sum + item.fat, 0);
    const consumedFiber = todayItems.reduce((sum, item) => sum + (item.fiber || 0), 0);

    return {
      consumedCalories,
      consumedProtein,
      consumedCarbs,
      consumedFat,
      consumedFiber,
      remainingCalories: Math.max(0, targets.dailyCalories - consumedCalories),
      remainingProtein: Math.max(0, targets.protein - consumedProtein),
      remainingCarbs: Math.max(0, targets.carbs - consumedCarbs),
      remainingFat: Math.max(0, targets.fat - consumedFat),
    };
  }, [items, targets]);

  const calPercent = Math.min(
    100,
    Math.round((summary.consumedCalories / targets.dailyCalories) * 100),
  );
  const proteinPercent = Math.min(
    100,
    Math.round((summary.consumedProtein / targets.protein) * 100),
  );
  const carbsPercent = Math.min(
    100,
    Math.round((summary.consumedCarbs / targets.carbs) * 100),
  );
  const fatPercent = Math.min(
    100,
    Math.round((summary.consumedFat / targets.fat) * 100),
  );

  const handleQuickWater = () => {
    addWater(250);
    playWaterDrop();
  };

  return (
    <Card className="flex flex-col gap-5 border-border/80 bg-surface/90">
      {/* Top Calorie Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-amber-500/15 text-amber-400">
            <Flame size={iconSize.md} aria-hidden />
          </span>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
              Energy Budget
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-bold tracking-tight text-foreground">
                {summary.consumedCalories.toLocaleString()}
              </span>
              <span className="text-sm text-foreground-secondary">
                / {targets.dailyCalories.toLocaleString()} kcal
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-block rounded-full bg-surface-elevated px-3 py-1 text-xs font-semibold text-brand">
            {summary.remainingCalories.toLocaleString()} kcal left
          </span>
        </div>
      </div>

      {/* Main Calorie Bar */}
      <div className="space-y-1.5">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-elevated">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-brand transition-all duration-500"
            style={{ width: `${calPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-medium text-foreground-secondary">
          <span>{calPercent}% consumed</span>
          <span>Target: {targets.dailyCalories} kcal</span>
        </div>
      </div>

      {/* 3 Macro Pillars */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        {/* Protein */}
        <div className="flex flex-col gap-1.5 rounded-card border border-border/50 bg-surface-elevated/40 p-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-400">Protein</span>
            <span className="text-[11px] text-foreground-secondary">{proteinPercent}%</span>
          </div>
          <span className="font-display text-base font-bold">
            {summary.consumedProtein}g
          </span>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-foreground-secondary">
            Goal: {targets.protein}g
          </span>
        </div>

        {/* Carbs */}
        <div className="flex flex-col gap-1.5 rounded-card border border-border/50 bg-surface-elevated/40 p-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-sky-400">Carbs</span>
            <span className="text-[11px] text-foreground-secondary">{carbsPercent}%</span>
          </div>
          <span className="font-display text-base font-bold">
            {summary.consumedCarbs}g
          </span>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-sky-400 transition-all duration-500"
              style={{ width: `${carbsPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-foreground-secondary">
            Goal: {targets.carbs}g
          </span>
        </div>

        {/* Fats */}
        <div className="flex flex-col gap-1.5 rounded-card border border-border/50 bg-surface-elevated/40 p-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-400">Fats</span>
            <span className="text-[11px] text-foreground-secondary">{fatPercent}%</span>
          </div>
          <span className="font-display text-base font-bold">
            {summary.consumedFat}g
          </span>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-500"
              style={{ width: `${fatPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-foreground-secondary">
            Goal: {targets.fat}g
          </span>
        </div>
      </div>

      {/* Hydration Synchronizer Strip */}
      <div className="flex items-center justify-between rounded-card border border-sky-500/20 bg-sky-950/20 px-3.5 py-2.5 text-xs">
        <div className="flex items-center gap-2.5 text-sky-300">
          <Droplets size={iconSize.sm} className="shrink-0 text-sky-400" />
          <span>
            Hydration: <strong>{waterConsumed.toLocaleString()}</strong> / {targets.waterMl.toLocaleString()} ml
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleQuickWater}
            className="rounded-full border border-sky-500/40 bg-sky-500/20 px-2.5 py-1 text-[11px] font-semibold text-sky-300 transition-colors hover:bg-sky-500/30"
          >
            +250ml
          </button>
          <Link
            href="/home?log=water"
            className="text-[11px] font-medium text-sky-400 underline underline-offset-2 hover:text-sky-300"
          >
            Ledger
          </Link>
        </div>
      </div>
    </Card>
  );
}
