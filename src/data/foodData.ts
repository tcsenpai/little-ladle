import { Food } from '../types/food';
import sophieFoodsJson from '../../data/sophie_foods.json';

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

// Food category colors (from Tailwind config)
export const categoryColors = {
  fruit: '#FF6B6B',      // Warm red
  vegetable: '#51CF66',   // Fresh green  
  protein: '#845EC2',     // Purple
  grain: '#FEC868',       // Golden yellow
  dairy: '#4ECDC4',       // Soft teal
  other: '#95A5A6'        // Neutral gray
} as const;