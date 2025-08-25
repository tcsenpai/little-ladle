import { Food } from '../types/food';
import sophieFoodsJson from './sophie_foods.json';

// Transform the JSON data into our Food interface
export const foods: Food[] = sophieFoodsJson.foods.map(food => ({
  fdcId: food.fdcId,
  name: food.name,
  shortName: food.shortName,
  category: food.category as Food['category'],
  nutrients: food.nutrients,
  ageGroup: food.ageGroup as Food['ageGroup']
}));

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