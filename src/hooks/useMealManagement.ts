import { useState, useCallback, useEffect } from 'react';
import { MealFood, Food } from '../types/food';
import { MEAL_CONFIG } from '../constants/config';
import { logger } from '../utils/logger';
import { dataService } from '../services/dataService';

export const useMealManagement = () => {
  const [mealFoods, setMealFoods] = useState<MealFood[]>([]);

  const addFood = useCallback((food: Food, servingSize: number = MEAL_CONFIG.SERVING_OPTIONS[0]) => {
    if (servingSize < MEAL_CONFIG.MIN_CUSTOM_SERVING || servingSize > MEAL_CONFIG.MAX_CUSTOM_SERVING) {
      logger.warn(`Invalid serving size: ${servingSize}`);
      return;
    }

    const newMealFood: MealFood = {
      id: `${food.fdcId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      food,
      servingGrams: servingSize,
      addedAt: Date.now(),
    };

    setMealFoods(prev => [newMealFood, ...prev]);
  }, []);

  const removeFood = useCallback((foodId: string) => {
    setMealFoods(prev => prev.filter(mf => mf.id !== foodId));
  }, []);

  const updateServingSize = useCallback((foodId: string, newServingSize: number) => {
    if (newServingSize < MEAL_CONFIG.MIN_CUSTOM_SERVING || newServingSize > MEAL_CONFIG.MAX_CUSTOM_SERVING) {
      logger.warn(`Invalid serving size: ${newServingSize}`);
      return;
    }

    setMealFoods(prev => prev.map(mf => 
      mf.id === foodId 
        ? { ...mf, servingGrams: newServingSize }
        : mf
    ));
  }, []);

  const clearMeal = useCallback(() => {
    setMealFoods([]);
  }, []);

  const duplicateFood = useCallback((mealFood: MealFood) => {
    const duplicated: MealFood = {
      ...mealFood,
      id: `${mealFood.food.fdcId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      addedAt: Date.now(),
    };
    setMealFoods(prev => [duplicated, ...prev]);
  }, []);

  const loadRecipe = useCallback((foods: MealFood[]) => {
    // Generate new IDs for loaded foods to avoid conflicts
    const newFoods = foods.map(food => ({
      ...food,
      id: `${food.food.fdcId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      addedAt: Date.now(),
    }));
    setMealFoods(newFoods);
  }, []);

  return {
    mealFoods,
    addFood,
    removeFood,
    updateServingSize,
    clearMeal,
    duplicateFood,
    loadRecipe,
    mealCount: mealFoods.length,
  };
};