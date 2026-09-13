import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_NUTRITION_TARGETS,
  useNutritionStore,
} from "./nutritionStore";

describe("nutritionStore", () => {
  beforeEach(() => {
    useNutritionStore.setState({
      items: [],
      targets: { ...DEFAULT_NUTRITION_TARGETS },
    });
  });

  it("initializes with default targets", () => {
    const targets = useNutritionStore.getState().targets;
    expect(targets.dailyCalories).toBe(2450);
    expect(targets.protein).toBe(185);
    expect(targets.carbs).toBe(240);
    expect(targets.fat).toBe(65);
  });

  it("adds food items and calculates daily summary accurately", () => {
    const store = useNutritionStore.getState();

    store.addFoodItem({
      name: "Whey Protein Shake",
      brand: "Optimum Nutrition",
      category: "breakfast",
      calories: 140,
      protein: 24,
      carbs: 3,
      fat: 1.5,
      fiber: 0,
      servingSize: 31,
      servingUnit: "g",
    });

    store.addFoodItem({
      name: "Chicken & Rice",
      category: "lunch",
      calories: 500,
      protein: 45,
      carbs: 60,
      fat: 8,
      fiber: 4,
      servingSize: 300,
      servingUnit: "g",
    });

    const summary = useNutritionStore.getState().getDailySummary();
    expect(summary.consumedCalories).toBe(640);
    expect(summary.consumedProtein).toBe(69);
    expect(summary.consumedCarbs).toBe(63);
    expect(summary.consumedFat).toBe(9.5);
    expect(summary.consumedFiber).toBe(4);

    expect(summary.remainingCalories).toBe(2450 - 640);
    expect(summary.remainingProtein).toBe(185 - 69);
  });

  it("filters items by meal category", () => {
    const store = useNutritionStore.getState();

    store.addFoodItem({
      name: "Eggs & Toast",
      category: "breakfast",
      calories: 350,
      protein: 20,
      carbs: 30,
      fat: 14,
      servingSize: 200,
      servingUnit: "g",
    });

    store.addFoodItem({
      name: "Salmon Salad",
      category: "dinner",
      calories: 450,
      protein: 38,
      carbs: 12,
      fat: 22,
      servingSize: 250,
      servingUnit: "g",
    });

    expect(store.getCategoryItems("breakfast")).toHaveLength(1);
    expect(store.getCategoryItems("breakfast")[0]?.name).toBe("Eggs & Toast");
    expect(store.getCategoryItems("dinner")).toHaveLength(1);
    expect(store.getCategoryItems("dinner")[0]?.name).toBe("Salmon Salad");
    expect(store.getCategoryItems("lunch")).toHaveLength(0);
  });

  it("removes a food item by id", () => {
    const store = useNutritionStore.getState();
    const id = store.addFoodItem({
      name: "Apple",
      category: "snack",
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3,
      servingSize: 180,
      servingUnit: "g",
    });

    expect(useNutritionStore.getState().items).toHaveLength(1);
    store.removeFoodItem(id);
    expect(useNutritionStore.getState().items).toHaveLength(0);
  });

  it("updates nutrition targets dynamically", () => {
    const store = useNutritionStore.getState();
    store.updateTargets({ dailyCalories: 2800, protein: 200 });

    const updated = useNutritionStore.getState().targets;
    expect(updated.dailyCalories).toBe(2800);
    expect(updated.protein).toBe(200);
    expect(updated.carbs).toBe(240); // Preserved
  });

  it("resets today's meals without affecting past days", () => {
    const store = useNutritionStore.getState();
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);

    store.addFoodItem({
      name: "Yesterday Meal",
      category: "dinner",
      calories: 600,
      protein: 40,
      carbs: 50,
      fat: 15,
      servingSize: 300,
      servingUnit: "g",
      loggedAt: pastDate.toISOString(),
    });

    store.addFoodItem({
      name: "Today Breakfast",
      category: "breakfast",
      calories: 300,
      protein: 20,
      carbs: 30,
      fat: 10,
      servingSize: 150,
      servingUnit: "g",
    });

    expect(useNutritionStore.getState().items).toHaveLength(2);
    store.resetTodayMeals();

    const remaining = useNutritionStore.getState().items;
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.name).toBe("Yesterday Meal");
  });
});
