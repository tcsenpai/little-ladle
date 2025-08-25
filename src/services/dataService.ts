// Data service for server-side persistence
class DataService {
  private baseUrl = window.location.origin;

  // Child Profiles
  async getChildProfiles(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/child-profiles`);
      if (!response.ok) throw new Error('Failed to fetch child profiles');
      return await response.json();
    } catch (error) {
      console.error('Error fetching child profiles:', error);
      return [];
    }
  }

  async saveChildProfiles(profiles: any[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/child-profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profiles),
      });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error saving child profiles:', error);
      return false;
    }
  }

  // User Preferences
  async getUserPreferences(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/user-preferences`);
      if (!response.ok) throw new Error('Failed to fetch user preferences');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return {};
    }
  }

  async saveUserPreferences(preferences: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/user-preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
  }

  // Meal History
  async getMealHistory(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/meal-history`);
      if (!response.ok) throw new Error('Failed to fetch meal history');
      return await response.json();
    } catch (error) {
      console.error('Error fetching meal history:', error);
      return [];
    }
  }

  async saveMealHistory(history: any[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/meal-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(history),
      });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error saving meal history:', error);
      return false;
    }
  }

  // Generic preference getters/setters with server fallback
  async getPreference(key: string, defaultValue: any = null): Promise<any> {
    const preferences = await this.getUserPreferences();
    return preferences[key] ?? defaultValue;
  }

  async setPreference(key: string, value: any): Promise<boolean> {
    const preferences = await this.getUserPreferences();
    preferences[key] = value;
    return await this.saveUserPreferences(preferences);
  }
}

export const dataService = new DataService();