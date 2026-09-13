import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  DailyNutritionSummary,
  FoodItem,
  MealCategory,
  NutritionTargets,
} from "@/types/nutrition";

export const DEFAULT_NUTRITION_TARGETS: NutritionTargets = {
  dailyCalories: 2450,
  protein: 185,
  carbs: 240,
  fat: 65,
  fiber: 35,
  waterMl: 3500,
};

export const INITIAL_FOOD_ITEMS: FoodItem[] = [
  {
    id: "food-oats-whey",
    name: "Rolled Oats & Whey Isolate",
    brand: "Optimum Nutrition",
    category: "breakfast",
    calories: 420,
    protein: 38,
    carbs: 54,
    fat: 6,
    fiber: 7,
    servingSize: 80,
    servingUnit: "g",
    loggedAt: new Date().toISOString(),
  },
  {
    id: "food-chicken-rice",
    name: "Grilled Chicken Breast & Jasmine Rice",
    brand: "Meal Prep",
    category: "lunch",
    calories: 580,
    protein: 52,
    carbs: 68,
    fat: 10,
    fiber: 4,
    servingSize: 350,
    servingUnit: "g",
    loggedAt: new Date().toISOString(),
  },
  {
    id: "food-greek-yogurt",
    name: "Greek Yogurt 0% & Blueberries",
    brand: "Chobani",
    category: "snack",
    calories: 220,
    protein: 24,
    carbs: 22,
    fat: 2,
    fiber: 3,
    servingSize: 200,
    servingUnit: "g",
    loggedAt: new Date().toISOString(),
  },
];

export interface NutritionState {
  items: FoodItem[];
  targets: NutritionTargets;

  addFoodItem: (
    item: Omit<FoodItem, "id" | "loggedAt"> & { id?: string; loggedAt?: string },
  ) => string;
  removeFoodItem: (id: string) => void;
  updateTargets: (targets: Partial<NutritionTargets>) => void;
  resetTodayMeals: () => void;
  getTodayItems: () => FoodItem[];
  getCategoryItems: (category: MealCategory) => FoodItem[];
  getDailySummary: () => DailyNutritionSummary;
}

function isToday(isoString: string): boolean {
  try {
    const d = new Date(isoString);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      items: INITIAL_FOOD_ITEMS,
      targets: DEFAULT_NUTRITION_TARGETS,

      addFoodItem: (item) => {
        const id = item.id || `food-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const newItem: FoodItem = {
          ...item,
          id,
          loggedAt: item.loggedAt || new Date().toISOString(),
        };

        set((state) => ({
          items: [newItem, ...state.items],
        }));

        return id;
      },

      removeFoodItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateTargets: (partialTargets) => {
        set((state) => ({
          targets: {
            ...state.targets,
            ...partialTargets,
          },
        }));
      },

      resetTodayMeals: () => {
        set((state) => ({
          items: state.items.filter((item) => !isToday(item.loggedAt)),
        }));
      },

      getTodayItems: () => {
        return get().items.filter((item) => isToday(item.loggedAt));
      },

      getCategoryItems: (category) => {
        return get().items.filter(
          (item) => isToday(item.loggedAt) && item.category === category,
        );
      },

      getDailySummary: () => {
        const todayItems = get().items.filter((item) => isToday(item.loggedAt));
        const targets = get().targets;

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
      },
    }),
    {
      name: "physiqx-nutrition",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined" && window.localStorage) {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      skipHydration: true,
    },
  ),
);
