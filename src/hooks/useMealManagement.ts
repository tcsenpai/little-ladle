import { useState, useCallback } from 'react';
import { MealFood, Food } from '../types/food';
import { MEAL_CONFIG } from '../constants/config';

export const useMealManagement = () => {
  const [mealFoods, setMealFoods] = useState<MealFood[]>([]);

  const addFood = useCallback((food: Food, servingSize: number = MEAL_CONFIG.SERVING_OPTIONS[0]) => {
    if (servingSize < MEAL_CONFIG.MIN_CUSTOM_SERVING || servingSize > MEAL_CONFIG.MAX_CUSTOM_SERVING) {
      console.warn('Invalid serving size:', servingSize);
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
      console.warn('Invalid serving size:', newServingSize);
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

  return {
    mealFoods,
    addFood,
    removeFood,
    updateServingSize,
    clearMeal,
    duplicateFood,
    mealCount: mealFoods.length,
  };
};