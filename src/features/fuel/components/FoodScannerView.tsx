"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Barcode,
  Check,
  ChevronRight,
  Flashlight,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { iconSize } from "@/constants/icons";
import { SAMPLE_BARCODES } from "../data/sampleBarcodes";
import type { BarcodeScanResult, MealCategory } from "@/types/nutrition";
import { useNutritionStore } from "@/store/nutritionStore";
import { playScanSuccess, playSetComplete } from "@/lib/audioEngine";

export function FoodScannerView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMeal = (searchParams.get("meal") as MealCategory) || "lunch";

  const [torchOn, setTorchOn] = useState(false);
  const [activeCamera, setActiveCamera] = useState<"back" | "front">("back");
  const [scannedResult, setScannedResult] = useState<BarcodeScanResult | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealCategory>(initialMeal);
  const [isScanning, setIsScanning] = useState(true);

  const addFood = useNutritionStore((state) => state.addFoodItem);

  const handleSelectSample = (sample: BarcodeScanResult) => {
    setIsScanning(false);
    playScanSuccess();
    setScannedResult(sample);
  };

  const handleConfirmLog = () => {
    if (!scannedResult) return;

    addFood({
      name: scannedResult.name,
      brand: scannedResult.brand,
      category: selectedMeal,
      calories: scannedResult.calories,
      protein: scannedResult.protein,
      carbs: scannedResult.carbs,
      fat: scannedResult.fat,
      fiber: scannedResult.fiber,
      servingSize: scannedResult.servingSize,
      servingUnit: scannedResult.servingUnit,
      barcode: scannedResult.barcode,
    });

    playSetComplete();
    router.push("/fuel");
  };

  const handleScanAgain = () => {
    setScannedResult(null);
    setIsScanning(true);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-950 text-foreground">
      {/* Top Camera Controls Bar */}
      <div className="z-20 flex items-center justify-between p-4 backdrop-blur-md bg-zinc-950/40">
        <Link
          href="/fuel"
          className="grid size-10 place-items-center rounded-full bg-zinc-900/80 text-foreground transition-colors hover:bg-zinc-800"
        >
          <ArrowLeft size={iconSize.sm} />
        </Link>

        <div className="flex items-center gap-1.5 rounded-full bg-zinc-900/80 px-3 py-1 text-xs font-semibold">
          <span className="size-2 rounded-full bg-brand animate-pulse" />
          <span>AI Vision Scanner</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTorchOn(!torchOn)}
            className={`grid size-10 place-items-center rounded-full transition-colors ${
              torchOn
                ? "bg-amber-400 text-zinc-950"
                : "bg-zinc-900/80 text-foreground hover:bg-zinc-800"
            }`}
            title="Toggle Flashlight"
          >
            <Flashlight size={iconSize.sm} />
          </button>
          <button
            type="button"
            onClick={() =>
              setActiveCamera(activeCamera === "back" ? "front" : "back")
            }
            className="grid size-10 place-items-center rounded-full bg-zinc-900/80 text-foreground transition-colors hover:bg-zinc-800"
            title="Switch Camera"
          >
            <RefreshCw size={iconSize.sm} />
          </button>
        </div>
      </div>

      {/* Viewfinder Canvas Area */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-6">
        {/* Background Simulated Camera Feed */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 opacity-90" />

        {/* Viewfinder Reticle Frame */}
        <div className="relative z-10 aspect-square w-full max-w-xs rounded-3xl border-2 border-white/20 p-4">
          {/* 4 Corner Accents */}
          <div className="absolute -top-1 -left-1 size-6 rounded-tl-xl border-t-4 border-l-4 border-brand" />
          <div className="absolute -top-1 -right-1 size-6 rounded-tr-xl border-t-4 border-r-4 border-brand" />
          <div className="absolute -bottom-1 -left-1 size-6 rounded-bl-xl border-b-4 border-l-4 border-brand" />
          <div className="absolute -bottom-1 -right-1 size-6 rounded-br-xl border-b-4 border-r-4 border-brand" />

          {/* Sweeping Laser Line */}
          {isScanning && (
            <div className="pointer-events-none absolute inset-x-4 top-4 h-0.5 bg-gradient-to-r from-transparent via-brand to-transparent shadow-[0_0_15px_#22c55e] animate-bounce" />
          )}

          {/* Center Target Indicator */}
          <div className="grid h-full place-items-center text-center">
            {isScanning ? (
              <div className="flex flex-col items-center gap-2 text-zinc-400">
                <Barcode size={40} className="text-zinc-500 animate-pulse" />
                <span className="text-xs font-medium">
                  Align barcode or nutrition label within frame
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-brand">
                <div className="grid size-12 place-items-center rounded-full bg-brand/20">
                  <Check size={28} className="text-brand" />
                </div>
                <span className="text-xs font-bold">Product Identified!</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Sample Selector for Instant Testing */}
        <div className="z-10 mt-6 w-full max-w-md">
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
            <span>Instant Barcode Simulator</span>
            <span className="text-[11px] text-brand">Tap to test</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SAMPLE_BARCODES.map((sample) => (
              <button
                key={sample.barcode}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-left transition-colors hover:border-brand/40 hover:bg-zinc-800 active:scale-95"
              >
                <span className="block text-xs font-semibold text-zinc-200">
                  {sample.brand}
                </span>
                <span className="block max-w-[140px] truncate text-[11px] text-zinc-400">
                  {sample.name}
                </span>
                <span className="mt-1 block text-[10px] font-bold text-emerald-400">
                  {sample.calories} kcal &bull; {sample.protein}g P
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scanned Result Bottom Sheet Modal */}
      {scannedResult && (
        <div className="fixed inset-x-0 bottom-0 z-30 max-h-[80vh] overflow-y-auto rounded-t-3xl border-t border-border/80 bg-surface p-5 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-border/80" />

          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1 pr-3">
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                Verified Match (99%)
              </span>
              <h2 className="mt-1 font-display text-base font-bold">
                {scannedResult.name}
              </h2>
              <span className="text-xs text-foreground-secondary">
                {scannedResult.brand} &bull; Barcode: {scannedResult.barcode}
              </span>
            </div>

            <div className="text-right">
              <span className="font-display text-xl font-bold">
                {scannedResult.calories}
              </span>
              <span className="block text-[11px] text-foreground-secondary">
                kcal / {scannedResult.servingSize} {scannedResult.servingUnit}
              </span>
            </div>
          </div>

          {/* Macro Breakdown Chips */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5 text-center">
              <span className="block text-[10px] font-medium text-emerald-400">
                Protein
              </span>
              <span className="font-display text-base font-bold text-foreground">
                {scannedResult.protein}g
              </span>
            </div>
            <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-2.5 text-center">
              <span className="block text-[10px] font-medium text-sky-400">
                Carbs
              </span>
              <span className="font-display text-base font-bold text-foreground">
                {scannedResult.carbs}g
              </span>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-2.5 text-center">
              <span className="block text-[10px] font-medium text-amber-400">
                Fat
              </span>
              <span className="font-display text-base font-bold text-foreground">
                {scannedResult.fat}g
              </span>
            </div>
          </div>

          {/* Meal Category Target */}
          <div className="mt-4">
            <span className="block text-xs font-semibold text-foreground-secondary">
              Log to Meal
            </span>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {(["breakfast", "lunch", "dinner", "snack"] as MealCategory[]).map(
                (meal) => (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => setSelectedMeal(meal)}
                    className={`rounded-xl py-2 text-xs font-semibold capitalize transition-colors ${
                      selectedMeal === meal
                        ? "bg-brand text-zinc-950"
                        : "bg-surface-elevated text-foreground-secondary hover:text-foreground"
                    }`}
                  >
                    {meal}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex gap-2.5">
            <button
              type="button"
              onClick={handleScanAgain}
              className="flex-1 rounded-full border border-border/80 bg-surface-elevated py-3 text-xs font-semibold transition-colors hover:bg-surface-elevated/80"
            >
              Scan Another
            </button>
            <button
              type="button"
              onClick={handleConfirmLog}
              className="flex-[2] rounded-full bg-brand py-3 text-xs font-bold text-zinc-950 transition-colors hover:bg-brand/90"
            >
              Log to {selectedMeal}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
