// Server-side data structures

export interface JsonData {
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ServerConfig {
  port: number;
  env: 'development' | 'production' | 'test';
  corsOrigin: string;
}

export interface StorageData {
  childProfiles?: import('./child').ChildProfile[];
  userPreferences?: import('./user').UserPreferences;
  mealHistory?: import('./user').MealHistoryEntry[];
  recipes?: import('./user').Recipe[];
  customFoods?: import('./user').CustomFood[];
  currentMeal?: import('./food').MealFood[];
  preferences?: Record<string, unknown>;
}

// Nutritional analysis types
export interface NutrientIntake {
  [nutrient: string]: {
    amount: number;
    unit: string;
    percentDaily?: number;
  };
}

export interface NutritionalGaps {
  deficient: string[];
  excessive: string[];
  balanced: string[];
  recommendations: string[];
}

export interface ComplianceAnalysis {
  score: number; // 0-1
  level: 'poor' | 'fair' | 'good' | 'excellent';
  gaps: NutritionalGaps;
  suggestions: string[];
}