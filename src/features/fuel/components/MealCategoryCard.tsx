"use client";

import { useMemo, useState } from "react";
import {
  Apple,
  Coffee,
  Plus,
  Sun,
  Trash2,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import type { FoodItem, MealCategory } from "@/types/nutrition";
import { useNutritionStore } from "@/store/nutritionStore";

interface MealCategoryCardProps {
  category: MealCategory;
  onOpenLogModal: (category: MealCategory) => void;
}

const CATEGORY_META: Record<
  MealCategory,
  { label: string; icon: LucideIcon; color: string }
> = {
  breakfast: { label: "Breakfast", icon: Coffee, color: "text-amber-400" },
  lunch: { label: "Lunch", icon: Sun, color: "text-emerald-400" },
  dinner: { label: "Dinner", icon: Utensils, color: "text-sky-400" },
  snack: { label: "Snacks", icon: Apple, color: "text-purple-400" },
};

export function MealCategoryCard({
  category,
  onOpenLogModal,
}: MealCategoryCardProps) {
  const meta = CATEGORY_META[category];
  const allItems = useNutritionStore((state) => state.items);
  const removeFood = useNutritionStore((state) => state.removeFoodItem);

  const items = useMemo<FoodItem[]>(() => {
    const today = new Date().toISOString().split("T")[0]!;
    return allItems.filter(
      (item: FoodItem) => item.category === category && item.loggedAt.startsWith(today),
    );
  }, [allItems, category]);

  const totalCalories = items.reduce((sum: number, item: FoodItem) => sum + item.calories, 0);
  const totalProtein = items.reduce((sum: number, item: FoodItem) => sum + item.protein, 0);
  const totalCarbs = items.reduce((sum: number, item: FoodItem) => sum + item.carbs, 0);
  const totalFat = items.reduce((sum: number, item: FoodItem) => sum + item.fat, 0);

  return (
    <Card className="flex flex-col gap-3 border-border/70 bg-surface/80 p-4">
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`grid size-8 place-items-center rounded-xl bg-surface-elevated ${meta.color}`}>
            <meta.icon size={iconSize.sm} />
          </span>
          <div>
            <h3 className="font-semibold">{meta.label}</h3>
            <span className="text-xs text-foreground-secondary">
              {totalCalories} kcal &bull; {totalProtein}g P &bull; {totalCarbs}g C &bull; {totalFat}g F
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenLogModal(category)}
          className="flex items-center gap-1 rounded-full border border-border/80 bg-surface-elevated px-3 py-1.5 text-xs font-semibold transition-colors hover:border-brand/40 hover:text-brand"
        >
          <Plus size={iconSize.xs} />
          <span>Add</span>
        </button>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="rounded-card border border-dashed border-border/60 p-4 text-center">
          <span className="text-xs text-foreground-secondary">
            No foods logged for {meta.label.toLowerCase()} yet.
          </span>
        </div>
      ) : (
        <ul className="divide-y divide-border/40">
          {items.map((item: FoodItem) => (
            <li
              key={item.id}
              className="flex items-center justify-between py-2.5 first:pt-1 last:pb-0"
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-sm font-medium">{item.name}</span>
                  {item.brand && (
                    <span className="text-[11px] text-foreground-secondary">
                      ({item.brand})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                  <span>
                    {item.servingSize} {item.servingUnit}
                  </span>
                  <span>&bull;</span>
                  <span>{item.calories} kcal</span>
                  <span>&bull;</span>
                  <span className="text-emerald-400 font-medium">
                    {item.protein}g P
                  </span>
                  <span>&bull;</span>
                  <span className="text-sky-400">{item.carbs}g C</span>
                  <span>&bull;</span>
                  <span className="text-amber-400">{item.fat}g F</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeFood(item.id)}
                aria-label={`Remove ${item.name}`}
                className="grid size-8 shrink-0 place-items-center rounded-lg text-foreground-secondary transition-colors hover:bg-rose-500/10 hover:text-rose-400"
              >
                <Trash2 size={iconSize.xs} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
