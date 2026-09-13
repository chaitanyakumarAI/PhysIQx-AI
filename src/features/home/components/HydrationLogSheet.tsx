"use client";

import { useState } from "react";
import { Droplet, Plus, X, RotateCcw, Check, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { useHydrationStore, getTodayHydrationTotal } from "@/store/hydrationStore";
import { playWaterDrop } from "@/lib/audioEngine";

export interface HydrationLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PRESETS = [
  { label: "Glass", amount: 250, icon: "🥛" },
  { label: "Bottle", amount: 500, icon: "💧" },
  { label: "Shaker", amount: 750, icon: "🥤" },
  { label: "Flask", amount: 1000, icon: "🍶" },
];

export function HydrationLogSheet({ isOpen, onClose }: HydrationLogSheetProps) {
  const entries = useHydrationStore((state) => state.entries);
  const dailyGoalMl = useHydrationStore((state) => state.dailyGoalMl);
  const addWater = useHydrationStore((state) => state.addWater);
  const resetToday = useHydrationStore((state) => state.resetToday);

  const [customAmount, setCustomAmount] = useState("");
  const [justLogged, setJustLogged] = useState<number | null>(null);

  if (!isOpen) return null;

  const todayTotal = getTodayHydrationTotal(entries);
  const percent = Math.min(100, Math.round((todayTotal / dailyGoalMl) * 100));

  function handleAddWater(amount: number) {
    addWater(amount);
    playWaterDrop();
    setJustLogged(amount);
    setTimeout(() => setJustLogged(null), 1500);
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = parseInt(customAmount, 10);
    if (!isNaN(val) && val > 0) {
      handleAddWater(val);
      setCustomAmount("");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hydration Quick Log"
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl border-t border-border/80 bg-surface p-6 pb-24 shadow-2xl transition-transform animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-info/15 text-info">
              <Droplet size={18} aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">Quick Log Water</h2>
              <p className="text-xs text-foreground-secondary">
                Daily goal: {(dailyGoalMl / 1000).toFixed(1)}L
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close hydration sheet"
            className="grid size-8 place-items-center rounded-full text-foreground-secondary hover:bg-surface-elevated hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Gauge */}
        <div className="my-5 flex flex-col items-center gap-2 text-center">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-4xl font-extrabold text-info tabular-nums">
              {(todayTotal / 1000).toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-foreground-secondary">
              / {(dailyGoalMl / 1000).toFixed(1)} L
            </span>
          </div>

          <ProgressBar value={percent} tone="info" className="w-full h-3" />

          <div className="flex w-full items-center justify-between text-xs text-foreground-secondary pt-1">
            <span>{percent}% of daily target</span>
            {percent >= 100 ? (
              <span className="flex items-center gap-1 font-semibold text-brand">
                <Sparkles size={12} /> Target Met!
              </span>
            ) : (
              <span>{Math.max(0, dailyGoalMl - todayTotal)} ml remaining</span>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {justLogged && (
          <div className="mb-4 flex items-center justify-center gap-1.5 rounded-field bg-info/15 py-1.5 text-xs font-semibold text-info animate-in fade-in">
            <Check size={14} />
            <span>Added +{justLogged} ml</span>
          </div>
        )}

        {/* Quick Increment Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.amount}
              type="button"
              onClick={() => handleAddWater(preset.amount)}
              className="flex flex-col items-center justify-center gap-1 rounded-card border border-border/80 bg-surface-elevated/70 py-3 transition-all hover:border-info/60 hover:bg-info/10 active:scale-95"
            >
              <span className="text-xl">{preset.icon}</span>
              <span className="font-bold text-xs text-foreground">+{preset.amount}</span>
              <span className="text-[10px] text-foreground-secondary">{preset.label}</span>
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="number"
            step="50"
            min="50"
            max="3000"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Custom amount (ml)..."
            className="flex-1 rounded-full border border-border/80 bg-surface-elevated/40 px-4 text-xs placeholder:text-foreground-secondary focus:border-info focus:outline-none"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!customAmount}
            className="rounded-full bg-info text-background hover:bg-info/90 font-semibold"
          >
            <Plus size={14} aria-hidden />
            Add
          </Button>
        </form>

        {/* Footer Reset & Dismiss */}
        <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-[11px] text-foreground-secondary">
          <button
            type="button"
            onClick={resetToday}
            className="flex items-center gap-1 hover:text-rose-400 transition-colors"
          >
            <RotateCcw size={11} />
            Reset today's log
          </button>
          <button
            type="button"
            onClick={onClose}
            className="font-medium text-foreground hover:underline"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
