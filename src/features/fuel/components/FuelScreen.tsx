"use client";

import { useState } from "react";
import { Camera, Sparkles, Utensils } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/layout/Section";
import { iconSize } from "@/constants/icons";
import type { MealCategory } from "@/types/nutrition";
import { MacroGaugeCard } from "./MacroGaugeCard";
import { MealCategoryCard } from "./MealCategoryCard";
import { LogMealModal } from "./LogMealModal";

export function FuelScreen() {
  const [modalCategory, setModalCategory] = useState<MealCategory | null>(null);

  return (
    <PageContainer className="pb-28">
      {/* Screen Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Fuel & Nutrition
          </h1>
          <p className="text-xs text-foreground-secondary">
            Macronutrient adherence and metabolic fueling
          </p>
        </div>

        <Link
          href="/fuel/scanner"
          className="flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-3.5 py-2 text-xs font-semibold text-brand transition-colors hover:bg-brand/20"
        >
          <Camera size={iconSize.xs} />
          <span>Scan Food</span>
        </Link>
      </div>

      {/* Macro Gauge Card */}
      <Section title="Today's Macro Target">
        <MacroGaugeCard />
      </Section>

      {/* Meals Breakdown */}
      <Section title="Meals Ledger">
        <div className="flex flex-col gap-3">
          <MealCategoryCard
            category="breakfast"
            onOpenLogModal={(cat) => setModalCategory(cat)}
          />
          <MealCategoryCard
            category="lunch"
            onOpenLogModal={(cat) => setModalCategory(cat)}
          />
          <MealCategoryCard
            category="dinner"
            onOpenLogModal={(cat) => setModalCategory(cat)}
          />
          <MealCategoryCard
            category="snack"
            onOpenLogModal={(cat) => setModalCategory(cat)}
          />
        </div>
      </Section>

      {/* Modal */}
      {modalCategory && (
        <LogMealModal
          isOpen={!!modalCategory}
          category={modalCategory}
          onClose={() => setModalCategory(null)}
        />
      )}
    </PageContainer>
  );
}
