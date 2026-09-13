export type FuelKind = "hydration";

export interface FuelProgress {
  kind: FuelKind;
  label: string;
  current: number;
  goal: number;
  unit: string;
  /** Derived — always current/goal, never hand-authored. */
  percent: number;
}

export type MealCategory = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  category: MealCategory;
  calories: number; // kcal
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  servingSize: number;
  servingUnit: string; // "g", "ml", "scoop", "bar", "serving"
  barcode?: string;
  loggedAt: string; // ISO timestamp
}

export interface NutritionTargets {
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  waterMl: number;
}

export interface DailyNutritionSummary {
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFat: number;
  consumedFiber: number;
  remainingCalories: number;
  remainingProtein: number;
  remainingCarbs: number;
  remainingFat: number;
}

export interface BarcodeScanResult {
  barcode: string;
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: number;
  servingUnit: string;
  confidence: number;
}
