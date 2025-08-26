import React, { useState } from 'react';
import { MealFood } from '../types/food';
import { ChildProfile } from '../types/child';

interface SaveMealOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveHistory: () => void;
  onSaveRecipe: () => void;
  onSaveBoth: () => void;
  mealFoods: MealFood[];
  activeChildProfile: ChildProfile | null;
}

export function SaveMealOptionsModal({
  isOpen,
  onClose,
  onSaveHistory,
  onSaveRecipe,
  onSaveBoth,
  mealFoods,
  activeChildProfile
}: SaveMealOptionsModalProps) {
  const [selectedOption, setSelectedOption] = useState<'history' | 'recipe' | 'both' | null>(null);

  const handleConfirm = () => {
    if (selectedOption === 'history') {
      onSaveHistory();
    } else if (selectedOption === 'recipe') {
      onSaveRecipe();
    } else if (selectedOption === 'both') {
      onSaveBoth();
    }
    setSelectedOption(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedOption(null);
    onClose();
  };

  if (!isOpen) return null;

  const totalFoods = mealFoods.length;
  const totalCalories = mealFoods.reduce((sum, mf) => {
    const calories = mf.food.nutrients.calories?.amount || 0;
    return sum + (calories * mf.servingGrams / 100);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-white/50 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-100 via-sky-100 to-violet-100 p-6 border-b-2 border-white/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">💾</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-transparent bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text">
                  Save Meal
                </h2>
                <p className="text-sm text-gray-600 font-medium">
                  {totalFoods} foods • {Math.round(totalCalories)} calories
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
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            What would you like to do with this meal for <span className="font-bold text-emerald-600">{activeChildProfile?.name || 'your child'}</span>?
          </p>

          {/* Options */}
          <div className="space-y-4">
            {/* Save to History */}
            <div 
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedOption === 'history' 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 ring-2 ring-blue-300' 
                  : 'bg-gray-50 border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'
              }`}
              onClick={() => setSelectedOption('history')}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-sm">📊</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">Save to Meal History</h3>
                  <p className="text-sm text-gray-600">Record this meal as eaten by {activeChildProfile?.name || 'your child'}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                  selectedOption === 'history' 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedOption === 'history' && (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save as Recipe */}
            <div 
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedOption === 'recipe' 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 ring-2 ring-green-300' 
                  : 'bg-gray-50 border-gray-200 hover:border-green-200 hover:bg-green-50/30'
              }`}
              onClick={() => setSelectedOption('recipe')}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-sm">📝</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">Save as Recipe</h3>
                  <p className="text-sm text-gray-600">Save this combination for easy reuse later</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                  selectedOption === 'recipe' 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedOption === 'recipe' && (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Both */}
            <div 
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedOption === 'both' 
                  ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-300 ring-2 ring-purple-300' 
                  : 'bg-gray-50 border-gray-200 hover:border-purple-200 hover:bg-purple-50/30'
              }`}
              onClick={() => setSelectedOption('both')}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-white text-sm">✨</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">Save Both</h3>
                  <p className="text-sm text-gray-600">Record as eaten AND save as a recipe for later</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                  selectedOption === 'both' 
                    ? 'bg-purple-500 border-purple-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedOption === 'both' && (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleClose}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedOption}
              className={`flex-1 py-3 font-bold rounded-xl transition-all duration-200 ${
                selectedOption
                  ? 'bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedOption === 'history' && '📊 Save to History'}
              {selectedOption === 'recipe' && '📝 Save as Recipe'}
              {selectedOption === 'both' && '✨ Save Both'}
              {!selectedOption && 'Select an option'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}