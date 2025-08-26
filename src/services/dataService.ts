import { logger } from '../utils/logger';
import type { ChildProfile } from '../types/child';
import type { UserPreferences, Recipe, MealHistoryEntry, CustomFood } from '../types/user';
import type { MealFood } from '../types/food';
import type { ApiResponse } from '../types/server';

// Data service for server-side persistence
class DataService {
  private baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin;

  // Child Profiles
  async getChildProfiles(): Promise<ChildProfile[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/child-profiles`);
      if (!response.ok) throw new Error('Failed to fetch child profiles');
      return await response.json();
    } catch (error) {
      logger.error('Error fetching child profiles:', error);
      return [];
    }
  }

  async saveChildProfiles(profiles: ChildProfile[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/child-profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profiles),
      });
      const result: ApiResponse = await response.json();
      return result.success;
    } catch (error) {
      logger.error('Error saving child profiles:', error);
      return false;
    }
  }

  // User Preferences
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const response = await fetch(`${this.baseUrl}/api/user-preferences`);
      if (!response.ok) throw new Error('Failed to fetch user preferences');
      return await response.json();
    } catch (error) {
      logger.error('Error fetching user preferences:', error);
      return {} as UserPreferences;
    }
  }

  async saveUserPreferences(preferences: UserPreferences): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/user-preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      const result: ApiResponse = await response.json();
      return result.success;
    } catch (error) {
      logger.error('Error saving user preferences:', error);
      return false;
    }
  }

  // Meal History
  async getMealHistory(): Promise<MealHistoryEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/meal-history`);
      if (!response.ok) throw new Error('Failed to fetch meal history');
      return await response.json();
    } catch (error) {
      logger.error('Error fetching meal history:', error);
      return [];
    }
  }

  async saveMealHistory(history: MealHistoryEntry[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/meal-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(history),
      });
      const result: ApiResponse = await response.json();
      return result.success;
    } catch (error) {
      logger.error('Error saving meal history:', error);
      return false;
    }
  }

  // Recipes API
  async getRecipes(): Promise<Recipe[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/recipes`);
      if (!response.ok) throw new Error('Failed to fetch recipes');
      return await response.json();
    } catch (error) {
      logger.error('Error fetching recipes:', error);
      return [];
    }
  }

  async saveRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recipe | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe),
      });
      const result: ApiResponse<{recipe: Recipe}> = await response.json();
      return result.success ? result.data!.recipe : null;
    } catch (error) {
      logger.error('Error saving recipe:', error);
      return null;
    }
  }

  async deleteRecipe(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/recipes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const result: ApiResponse = await response.json();
      return result.success;
    } catch (error) {
      logger.error('Error deleting recipe:', error);
      return false;
    }
  }

  // Custom Foods API
  async getCustomFoods(): Promise<CustomFood[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/custom-foods`);
      if (!response.ok) throw new Error('Failed to fetch custom foods');
      return await response.json();
    } catch (error) {
      logger.error('Error fetching custom foods:', error);
      return [];
    }
  }

  async saveCustomFood(food: Omit<CustomFood, 'id' | 'createdAt' | 'updatedAt' | 'isCustom'>): Promise<CustomFood | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/custom-foods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(food),
      });
      const result: ApiResponse<{food: CustomFood}> = await response.json();
      return result.success ? result.data!.food : null;
    } catch (error) {
      logger.error('Error saving custom food:', error);
      return null;
    }
  }

  async deleteCustomFood(fdcId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/custom-foods`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fdcId }),
      });
      const result: ApiResponse = await response.json();
      return result.success;
    } catch (error) {
      logger.error('Error deleting custom food:', error);
      return false;
    }
  }

  // Current meal state (auto-save)
  async getCurrentMeal(): Promise<MealFood[]> {
    try {
      const preferences = await this.getUserPreferences();
      return preferences['current-meal'] || [];
    } catch (error) {
      logger.error('Error getting current meal:', error);
      return [];
    }
  }

  async saveCurrentMeal(mealFoods: MealFood[]): Promise<boolean> {
    try {
      return await this.setPreference('current-meal', mealFoods);
    } catch (error) {
      logger.error('Error saving current meal:', error);
      return false;
    }
  }

  async clearCurrentMeal(): Promise<boolean> {
    try {
      return await this.setPreference('current-meal', []);
    } catch (error) {
      logger.error('Error clearing current meal:', error);
      return false;
    }
  }

  // Generic preference getters/setters with server fallback
  async getPreference<T = unknown>(key: string, defaultValue: T | null = null): Promise<T | null> {
    const preferences = await this.getUserPreferences();
    return preferences[key] ?? defaultValue;
  }

  async setPreference<T = unknown>(key: string, value: T): Promise<boolean> {
    const preferences = await this.getUserPreferences();
    preferences[key] = value;
    return await this.saveUserPreferences(preferences);
  }
}

export const dataService = new DataService();