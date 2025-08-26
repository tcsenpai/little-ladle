import { Food } from '../types/food';
import sophieFoodsJson from './sophie_foods.json';
import { dataService } from '../services/dataService';

// Transform the JSON data into our Food interface
const baseFoods: Food[] = sophieFoodsJson.foods.map(food => ({
  fdcId: food.fdcId,
  name: food.name,
  shortName: food.shortName,
  category: food.category as Food['category'],
  nutrients: food.nutrients,
  ageGroup: food.ageGroup as Food['ageGroup']
}));

// Dynamic foods array that includes custom foods
let allFoods: Food[] = baseFoods;
let customFoodsCache: Food[] = [];

// Load custom foods and merge with base foods
export const loadAllFoods = async (): Promise<Food[]> => {
  try {
    const customFoods = await dataService.getCustomFoods();
    customFoodsCache = customFoods;
    
    // Merge base foods with custom foods (custom foods can override base foods by fdcId)
    const customFoodIds = new Set(customFoods.map(f => f.fdcId));
    const filteredBaseFoods = baseFoods.filter(f => !customFoodIds.has(f.fdcId));
    
    allFoods = [...filteredBaseFoods, ...customFoods];
    return allFoods;
  } catch (error) {
    console.error('Failed to load custom foods:', error);
    allFoods = baseFoods;
    return allFoods;
  }
};

// Get all foods (base + custom)
export const getAllFoods = (): Food[] => allFoods;

// Export foods with getter that always returns current state
export const foods = new Proxy({} as Food[], {
  get: (target, prop) => {
    if (prop === 'length') return allFoods.length;
    if (prop === Symbol.iterator) return () => allFoods[Symbol.iterator]();
    if (typeof prop === 'string' && !isNaN(Number(prop))) {
      return allFoods[Number(prop)];
    }
    if (typeof prop === 'string' && prop in Array.prototype) {
      const method = allFoods[prop as keyof Food[]];
      if (typeof method === 'function') {
        return method.bind(allFoods);
      }
    }
    return (allFoods as any)[prop];
  }
});

// Get foods by category for easy access
export const getFoodsByCategory = (category: Food['category']) => 
  foods.filter(food => food.category === category);

// Get foods by age group
export const getFoodsByAge = (ageGroup: Food['ageGroup']) => 
  foods.filter(food => food.ageGroup === ageGroup);

// Get food by ID
export const getFoodById = (fdcId: number) => 
  foods.find(food => food.fdcId === fdcId);

// Nurturing color palette for baby nutrition
export const categoryColors = {
  fruit: '#F97316',       // Warm orange - energy and vitality
  vegetable: '#10B981',   // Fresh green - growth and health  
  protein: '#8B5CF6',     // Gentle purple - strength
  grain: '#F59E0B',       // Golden amber - nourishment
  dairy: '#06B6D4',       // Soft cyan - purity and calcium
  other: '#64748B'        // Professional slate
} as const;

// Semantic color system for nutrition UI
export const nutritionColors = {
  excellent: '#10B981',   // Emerald green
  good: '#3B82F6',        // Blue  
  fair: '#F59E0B',        // Amber
  poor: '#EF4444',        // Red
  neutral: '#6B7280'      // Gray
} as const;