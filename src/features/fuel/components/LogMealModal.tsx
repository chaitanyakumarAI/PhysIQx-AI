"use client";

import { useState } from "react";
import { Camera, Check, Plus, Search, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { iconSize } from "@/constants/icons";
import { FITNESS_STAPLES, type FoodPreset } from "../data/staples";
import type { MealCategory } from "@/types/nutrition";
import { useNutritionStore } from "@/store/nutritionStore";
import { playSetComplete } from "@/lib/audioEngine";

interface LogMealModalProps {
  isOpen: boolean;
  category: MealCategory;
  onClose: () => void;
}

export function LogMealModal({ isOpen, category, onClose }: LogMealModalProps) {
  const [activeTab, setActiveTab] = useState<"staples" | "custom">("staples");
  const [searchQuery, setSearchQuery] = useState("");
  const [multiplier, setMultiplier] = useState<Record<string, number>>({});

  // Custom food form
  const [customName, setCustomName] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [customCalories, setCustomCalories] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarbs, setCustomCarbs] = useState("");
  const [customFat, setCustomFat] = useState("");
  const [customServing, setCustomServing] = useState("100");
  const [customUnit, setCustomUnit] = useState("g");

  const addFood = useNutritionStore((state) => state.addFoodItem);

  if (!isOpen) return null;

  const filteredStaples = FITNESS_STAPLES.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (food.brand && food.brand.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleAddStaple = (food: FoodPreset) => {
    const factor = multiplier[food.id] || 1;
    addFood({
      name: food.name,
      brand: food.brand,
      category,
      calories: Math.round(food.calories * factor),
      protein: Math.round(food.protein * factor * 10) / 10,
      carbs: Math.round(food.carbs * factor * 10) / 10,
      fat: Math.round(food.fat * factor * 10) / 10,
      fiber: Math.round(food.fiber * factor * 10) / 10,
      servingSize: Math.round(food.servingSize * factor),
      servingUnit: food.servingUnit,
    });
    playSetComplete();
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customCalories) return;

    addFood({
      name: customName.trim(),
      brand: customBrand.trim() || undefined,
      category,
      calories: Number(customCalories) || 0,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fat: Number(customFat) || 0,
      servingSize: Number(customServing) || 1,
      servingUnit: customUnit.trim() || "serving",
    });

    playSetComplete();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl border border-border/80 bg-surface p-5 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div>
            <h2 className="font-display text-lg font-bold capitalize">
              Log {category}
            </h2>
            <p className="text-xs text-foreground-secondary">
              Record macronutrients and fuel intake
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-surface-elevated text-foreground-secondary hover:text-foreground"
          >
            <X size={iconSize.sm} />
          </button>
        </div>

        {/* Barcode scanner action button */}
        <Link
          href={`/fuel/scanner?meal=${category}`}
          onClick={onClose}
          className="mb-4 flex items-center justify-between rounded-card border border-brand/30 bg-brand/10 p-3 text-brand transition-colors hover:bg-brand/15"
        >
          <div className="flex items-center gap-2.5">
            <Camera size={iconSize.sm} />
            <span className="text-xs font-semibold">
              Scan Barcode / Packaging Label
            </span>
          </div>
          <span className="rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-bold text-zinc-950">
            Instant
          </span>
        </Link>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border/60 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("staples")}
            className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "staples"
                ? "bg-brand text-zinc-950"
                : "bg-surface-elevated text-foreground-secondary hover:text-foreground"
            }`}
          >
            Fitness Staples
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "custom"
                ? "bg-brand text-zinc-950"
                : "bg-surface-elevated text-foreground-secondary hover:text-foreground"
            }`}
          >
            Custom Entry
          </button>
        </div>

        {/* Content */}
        {activeTab === "staples" ? (
          <div className="flex flex-col gap-3 overflow-hidden pt-3">
            {/* Search Input */}
            <div className="relative">
              <Search
                size={iconSize.xs}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staples (chicken, oats, whey)..."
                className="w-full rounded-xl border border-border/70 bg-surface-elevated py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-foreground-secondary focus:border-brand focus:outline-none"
              />
            </div>

            {/* Staples list */}
            <div className="max-h-72 overflow-y-auto divide-y divide-border/40 pr-1">
              {filteredStaples.map((staple) => {
                const currentMult = multiplier[staple.id] || 1;
                return (
                  <div
                    key={staple.id}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <span className="block truncate text-xs font-semibold">
                        {staple.name}
                      </span>
                      <span className="block text-[11px] text-foreground-secondary">
                        {Math.round(staple.calories * currentMult)} kcal &bull;{" "}
                        <span className="text-emerald-400 font-medium">
                          {Math.round(staple.protein * currentMult)}g P
                        </span>{" "}
                        &bull; {Math.round(staple.carbs * currentMult)}g C &bull;{" "}
                        {Math.round(staple.fat * currentMult)}g F
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={currentMult}
                        onChange={(e) =>
                          setMultiplier({
                            ...multiplier,
                            [staple.id]: Number(e.target.value),
                          })
                        }
                        className="rounded-lg border border-border/60 bg-surface-elevated px-1.5 py-1 text-[11px] text-foreground focus:outline-none"
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={1}>1.0x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2.0x</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleAddStaple(staple)}
                        className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-zinc-950 transition-transform active:scale-95"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="flex flex-col gap-3 pt-3">
            <div>
              <label className="block text-[11px] font-medium text-foreground-secondary">
                Food / Dish Name
              </label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Ribeye Steak & Sweet Potato"
                className="mt-1 w-full rounded-xl border border-border/70 bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-brand focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-foreground-secondary">
                  Brand (Optional)
                </label>
                <input
                  type="text"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  placeholder="e.g. Homemade"
                  className="mt-1 w-full rounded-xl border border-border/70 bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-foreground-secondary">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  required
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                  placeholder="e.g. 450"
                  className="mt-1 w-full rounded-xl border border-border/70 bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-emerald-400">
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  placeholder="35"
                  className="mt-1 w-full rounded-xl border border-border/70 bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-sky-400">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                  placeholder="40"
                  className="mt-1 w-full rounded-xl border border-border/70 bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-amber-400">
                  Fat (g)
                </label>
                <input
                  type="number"
                  value={customFat}
                  onChange={(e) => setCustomFat(e.target.value)}
                  placeholder="12"
                  className="mt-1 w-full rounded-xl border border-border/70 bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-brand py-2.5 text-xs font-bold text-zinc-950 transition-colors hover:bg-brand/90"
            >
              Add to {category}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
