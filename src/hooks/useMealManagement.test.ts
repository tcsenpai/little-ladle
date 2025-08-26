import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useMealManagement } from './useMealManagement';
import { Food } from '../types/food';

// Mock logger to avoid console output in tests
vi.mock('../utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
    info: vi.fn(),
  },
}));

describe('useMealManagement', () => {
  const mockFood: Food = {
    fdcId: 123,
    name: 'Test Food',
    shortName: 'Test',
    category: 'fruit',
    nutrients: {
      calories: { name: 'Energy', amount: 100, unit: 'kcal' },
      protein: { name: 'Protein', amount: 2, unit: 'g' },
    },
    ageGroup: '6+ months',
  };

  it('should initialize with empty meal foods', () => {
    const { result } = renderHook(() => useMealManagement());
    expect(result.current.mealFoods).toEqual([]);
    expect(result.current.mealCount).toBe(0);
  });

  it('should add food to meal with default serving size', () => {
    const { result } = renderHook(() => useMealManagement());
    
    act(() => {
      result.current.addFood(mockFood);
    });

    expect(result.current.mealFoods).toHaveLength(1);
    expect(result.current.mealFoods[0].food).toEqual(mockFood);
    expect(result.current.mealFoods[0].servingGrams).toBe(5); // Default serving
    expect(result.current.mealCount).toBe(1);
  });

  it('should add food with custom serving size', () => {
    const { result } = renderHook(() => useMealManagement());
    
    act(() => {
      result.current.addFood(mockFood, 50);
    });

    expect(result.current.mealFoods[0].servingGrams).toBe(50);
  });

  it('should reject invalid serving sizes', () => {
    const { result } = renderHook(() => useMealManagement());
    
    act(() => {
      result.current.addFood(mockFood, -10); // Invalid size
    });

    // Should not add the food due to invalid serving size
    expect(result.current.mealFoods).toHaveLength(0);
  });

  it('should remove food from meal', () => {
    const { result } = renderHook(() => useMealManagement());
    
    // Add food first
    act(() => {
      result.current.addFood(mockFood);
    });

    const mealFoodId = result.current.mealFoods[0].id;

    // Remove the food
    act(() => {
      result.current.removeFood(mealFoodId);
    });

    expect(result.current.mealFoods).toHaveLength(0);
    expect(result.current.mealCount).toBe(0);
  });

  it('should update serving size', () => {
    const { result } = renderHook(() => useMealManagement());
    
    // Add food first
    act(() => {
      result.current.addFood(mockFood, 25);
    });

    const mealFoodId = result.current.mealFoods[0].id;

    // Update serving size
    act(() => {
      result.current.updateServingSize(mealFoodId, 75);
    });

    expect(result.current.mealFoods[0].servingGrams).toBe(75);
  });

  it('should clear all foods from meal', () => {
    const { result } = renderHook(() => useMealManagement());
    
    // Add multiple foods
    act(() => {
      result.current.addFood(mockFood);
      result.current.addFood({...mockFood, fdcId: 456, name: 'Another Food'});
    });

    expect(result.current.mealCount).toBe(2);

    // Clear meal
    act(() => {
      result.current.clearMeal();
    });

    expect(result.current.mealFoods).toHaveLength(0);
    expect(result.current.mealCount).toBe(0);
  });

  it('should duplicate food with new ID', () => {
    const { result } = renderHook(() => useMealManagement());
    
    // Add food first
    act(() => {
      result.current.addFood(mockFood);
    });

    const originalMealFood = result.current.mealFoods[0];

    // Duplicate the food
    act(() => {
      result.current.duplicateFood(originalMealFood);
    });

    expect(result.current.mealFoods).toHaveLength(2);
    expect(result.current.mealFoods[0].food).toEqual(mockFood);
    expect(result.current.mealFoods[1].food).toEqual(mockFood);
    // IDs should be different
    expect(result.current.mealFoods[0].id).not.toBe(result.current.mealFoods[1].id);
  });
});