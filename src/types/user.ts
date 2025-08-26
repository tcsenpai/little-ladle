export interface UserPreferences {
  darkMode?: boolean;
  measurementUnit?: 'metric' | 'imperial';
  language?: string;
  notifications?: {
    mealReminders?: boolean;
    nutritionAlerts?: boolean;
  };
  feedingGuidelines?: {
    preferredMealTimes?: string[];
    averageMealDuration?: number;
  };
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: MealFood[];
  instructions?: string;
  servings: number;
  prepTime?: number;
  nutritionInfo?: Nutrients;
  ageGroup: AgeGroup;
  category?: FoodCategory;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface MealHistoryEntry {
  id: string;
  date: string; // ISO date string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: MealFood[];
  totalNutrition: Nutrients;
  childId: string;
  notes?: string;
  createdAt: string;
}

export interface CustomFood extends Food {
  isCustom: true;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Import types from other files for consistency
import { MealFood } from './food';
import { Nutrients, AgeGroup, FoodCategory } from './food';