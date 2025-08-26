import React, { useState, useEffect } from 'react';
import { MealFood, ChildProfile } from '../types/food';
import { dataService } from '../services/dataService';
import { formatDate } from '../utils/dateUtils';

interface MealHistory {
  id: string;
  childId: string;
  childName: string;
  date: string;
  foods: MealFood[];
  totalCalories: number;
  createdAt: string;
}

interface MealHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  childProfile: ChildProfile | null;
  onLoadMeal: (foods: MealFood[]) => void;
}

export function MealHistoryModal({ isOpen, onClose, childProfile, onLoadMeal }: MealHistoryModalProps) {
  const [mealHistory, setMealHistory] = useState<MealHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && childProfile) {
      loadMealHistory();
    }
  }, [isOpen, childProfile]);

  const loadMealHistory = async () => {
    if (!childProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      const history = await dataService.getMealHistory();
      // Filter history for the current child
      const childHistory = history.filter(meal => meal.childId === childProfile.id);
      // Sort by date (newest first)
      childHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMealHistory(childHistory);
    } catch (error) {
      console.error('Failed to load meal history:', error);
      setError('Failed to load meal history');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMealFromHistory = async (mealId: string) => {
    try {
      const history = await dataService.getMealHistory();
      const updatedHistory = history.filter(meal => meal.id !== mealId);
      const success = await dataService.saveMealHistory(updatedHistory);
      
      if (success) {
        setMealHistory(prev => prev.filter(meal => meal.id !== mealId));
      } else {
        setError('Failed to delete meal from history');
      }
    } catch (error) {
      console.error('Failed to delete meal:', error);
      setError('Failed to delete meal from history');
    }
  };

  const handleLoadMeal = (meal: MealHistory) => {
    onLoadMeal(meal.foods);
    onClose();
  };

  const handleClose = () => {
    setMealHistory([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-white/50 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 p-6 border-b-2 border-white/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                  Meal History
                </h2>
                <p className="text-sm text-gray-600 font-medium">
                  {childProfile ? `${childProfile.name}'s meal history` : 'No child profile selected'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-lg transition-all duration-200 transform hover:scale-110"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 h-[600px] overflow-hidden flex flex-col">
          {!childProfile ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
              <div className="text-6xl mb-4">👶</div>
              <p className="text-lg font-medium">No child profile selected</p>
              <p className="text-sm text-gray-500 mt-2">Please select a child profile to view meal history</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center flex-1">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-600">Loading meal history...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center flex-1 text-red-400">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-lg font-medium">{error}</p>
            </div>
          ) : mealHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-lg font-medium">No meal history yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Meals will appear here after you save them from the meal builder
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {mealHistory.length} meal{mealHistory.length !== 1 ? 's' : ''} for {childProfile.name}
                </h3>
              </div>

              <div className="overflow-y-auto h-full space-y-3">
                {mealHistory.map((meal) => (
                  <div
                    key={meal.id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    {/* Meal Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800">
                            {formatDate(meal.date)}
                          </span>
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                            {meal.totalCalories.toFixed(0)} cal
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Saved on {new Date(meal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLoadMeal(meal)}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors duration-200"
                        >
                          Load Meal
                        </button>
                        <button
                          onClick={() => deleteMealFromHistory(meal.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors duration-200"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Food List */}
                    <div className="space-y-2">
                      {meal.foods.slice(0, 3).map((mealFood, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm bg-white rounded-lg p-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">{mealFood.food.shortName || mealFood.food.name}</span>
                          </div>
                          <span className="text-gray-500 text-xs">{mealFood.servingGrams}g</span>
                        </div>
                      ))}
                      
                      {meal.foods.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{meal.foods.length - 3} more food{meal.foods.length - 3 !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}