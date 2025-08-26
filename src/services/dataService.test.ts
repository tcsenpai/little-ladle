import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dataService } from './dataService';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock logger
vi.mock('../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    log: vi.fn(),
    info: vi.fn(),
  },
}));

describe('DataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Child Profiles', () => {
    it('should fetch child profiles successfully', async () => {
      const mockProfiles = [
        { id: '1', name: 'Test Child', birthday: '2023-01-01' }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfiles,
      });

      const result = await dataService.getChildProfiles();
      expect(result).toEqual(mockProfiles);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/child-profiles');
    });

    it('should handle fetch error for child profiles', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await dataService.getChildProfiles();
      expect(result).toEqual([]);
    });

    it('should save child profiles successfully', async () => {
      const mockProfiles = [
        { id: '1', name: 'Test Child', birthday: '2023-01-01' }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await dataService.saveChildProfiles(mockProfiles);
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/child-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockProfiles),
      });
    });
  });

  describe('Custom Foods', () => {
    it('should fetch custom foods successfully', async () => {
      const mockFoods = [
        {
          fdcId: 123,
          name: 'Custom Food',
          shortName: 'Custom',
          category: 'other',
          nutrients: {},
          ageGroup: '6+ months'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFoods,
      });

      const result = await dataService.getCustomFoods();
      expect(result).toEqual(mockFoods);
    });

    it('should save custom food successfully', async () => {
      const mockFood = {
        fdcId: 123,
        name: 'Custom Food',
        shortName: 'Custom',
        category: 'other',
        nutrients: {},
        ageGroup: '6+ months'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, food: mockFood }),
      });

      const result = await dataService.saveCustomFood(mockFood);
      expect(result).toEqual(mockFood);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/custom-foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockFood),
      });
    });

    it('should handle save custom food error', async () => {
      const mockFood = {
        fdcId: 123,
        name: 'Custom Food',
        shortName: 'Custom',
        category: 'other',
        nutrients: {},
        ageGroup: '6+ months'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false }),
      });

      const result = await dataService.saveCustomFood(mockFood);
      expect(result).toBeNull();
    });
  });

  describe('Meal History', () => {
    it('should fetch meal history successfully', async () => {
      const mockHistory = [
        {
          id: 'meal-1',
          childId: 'child-1',
          childName: 'Test Child',
          date: '2024-01-01T00:00:00Z',
          foods: [],
          totalCalories: 100
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHistory,
      });

      const result = await dataService.getMealHistory();
      expect(result).toEqual(mockHistory);
    });

    it('should save meal history successfully', async () => {
      const mockHistory = [];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await dataService.saveMealHistory(mockHistory);
      expect(result).toBe(true);
    });
  });
});