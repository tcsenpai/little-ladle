import React, { useState, useEffect } from 'react';
import { ChildProfile } from '../types/child';
import { Food } from '../types/food';
import { MealFood } from '../utils/whoCompliance';
import { 
  generateAutoChefRecommendations, 
  AutoChefRecommendation, 
  FEEDING_MODES, 
  FeedingMode,
  AutoChefSuggestion 
} from '../utils/autoChef';

interface AutoChefModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealFoods: MealFood[];
  childProfile: ChildProfile | null;
  availableFoods: Food[];
  onAddFood: (food: Food) => void;
  onApplySuggestion: (suggestion: AutoChefSuggestion) => void;
}

export function AutoChefModal({ 
  isOpen,
  onClose,
  mealFoods, 
  childProfile, 
  availableFoods, 
  onAddFood, 
  onApplySuggestion 
}: AutoChefModalProps) {
  const [feedingMode, setFeedingMode] = useState<FeedingMode>(FEEDING_MODES.complementary);
  const [recommendations, setRecommendations] = useState<AutoChefRecommendation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load feeding mode preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('pappobot-feeding-mode');
    if (savedMode && FEEDING_MODES[savedMode]) {
      setFeedingMode(FEEDING_MODES[savedMode]);
    }
  }, []);

  // Save feeding mode preference
  const handleModeChange = (modeKey: string) => {
    const mode = FEEDING_MODES[modeKey];
    setFeedingMode(mode);
    localStorage.setItem('pappobot-feeding-mode', modeKey);
  };

  // Generate recommendations when modal opens or mode changes
  useEffect(() => {
    if (!isOpen || !childProfile || availableFoods.length === 0) {
      return;
    }

    const generateRecs = async () => {
      setIsGenerating(true);
      try {
        const recs = await generateAutoChefRecommendations(
          mealFoods,
          availableFoods,
          childProfile,
          feedingMode
        );
        setRecommendations(recs);
      } catch (error) {
        console.error('Failed to generate auto-chef recommendations:', error);
        setRecommendations(null);
      } finally {
        setIsGenerating(false);
      }
    };

    generateRecs();
  }, [isOpen, mealFoods, childProfile, availableFoods, feedingMode]);

  const handleApplyAndClose = (suggestion: AutoChefSuggestion) => {
    onApplySuggestion(suggestion);
    onClose();
  };

  const handleQuickFixAndKeepOpen = (food: Food) => {
    onAddFood(food);
    // Keep modal open so user can see updated recommendations
  };

  if (!isOpen) return null;

  if (!childProfile) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-white/50 w-full max-w-md">
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">👨‍🍳</div>
            <h3 className="text-xl font-black text-gray-800 mb-2">Auto-Chef Assistant</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create a child profile to get personalized meal suggestions
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-white/50 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-100 via-pink-100 to-purple-100 p-6 border-b-2 border-white/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">👨‍🍳</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-transparent bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text">
                  Auto-Chef Assistant
                </h2>
                <p className="text-sm text-gray-600 font-medium">
                  AI-powered meal suggestions for {childProfile.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-lg transition-all duration-200 transform hover:scale-110"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Left Panel - Mode Settings and Current Status */}
          <div className="flex-1 p-6 border-r border-gray-200">
            {/* Feeding Mode Toggle */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">🎯 Feeding Mode</h3>
              <div className="space-y-3">
                {Object.entries(FEEDING_MODES).map(([key, mode]) => (
                  <button
                    key={key}
                    onClick={() => handleModeChange(key)}
                    className={`
                      w-full p-4 rounded-xl text-left transition-all duration-200 border-2
                      ${feedingMode.name === mode.name
                        ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white border-violet-500 shadow-xl'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-violet-300 hover:bg-violet-50'
                      }
                    `}
                  >
                    <div className="font-bold text-lg">{mode.name}</div>
                    <div className={`text-sm ${feedingMode.name === mode.name ? 'text-white/90' : 'text-gray-600'}`}>
                      Target: {mode.targetCompliance}% WHO compliance
                    </div>
                    <div className={`text-xs mt-1 ${feedingMode.name === mode.name ? 'text-white/80' : 'text-gray-500'}`}>
                      {mode.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Score */}
            {recommendations && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 mb-3">📊 Current Meal</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">WHO Compliance Score</span>
                  <div className={`px-3 py-1 rounded-lg font-bold ${
                    recommendations.currentMealScore >= recommendations.targetScore 
                      ? 'bg-emerald-100 text-emerald-800 text-lg' 
                      : recommendations.currentMealScore >= recommendations.targetScore * 0.7
                      ? 'bg-yellow-100 text-yellow-800 text-lg'
                      : 'bg-red-100 text-red-800 text-lg'
                  }`}>
                    {recommendations.currentMealScore}%
                  </div>
                </div>
                <div className="text-xs text-gray-600 mb-3">
                  Target: {recommendations.targetScore}% for {feedingMode.name}
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      recommendations.currentMealScore >= recommendations.targetScore 
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' 
                        : recommendations.currentMealScore >= recommendations.targetScore * 0.7
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                        : 'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    style={{ width: `${Math.min(recommendations.currentMealScore, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Recommendations */}
          <div className="flex-1 p-6 overflow-y-auto">
            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full mr-4"></div>
                <span className="text-gray-600 text-lg">Generating meal suggestions...</span>
              </div>
            ) : !recommendations ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🤔</div>
                <p className="text-lg font-medium">Unable to generate recommendations</p>
                <p className="text-sm">Please try again</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Quick Fixes */}
                {recommendations.quickFixes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      ⚡ Quick Fixes
                    </h3>
                    <div className="space-y-3">
                      {recommendations.quickFixes.map((fix, index) => (
                        <div key={index} className="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-200">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-bold text-gray-800">
                                {fix.food.shortName || fix.food.name.substring(0, 25)}
                              </div>
                              <div className="text-sm text-emerald-700">
                                Add {fix.servingGrams}g • {fix.reason}
                              </div>
                            </div>
                            <button
                              onClick={() => handleQuickFixAndKeepOpen(fix.food)}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                              +{fix.expectedImprovement}%
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Complete Meal Suggestions */}
                {recommendations.suggestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      🍽️ Complete Meal Suggestions
                    </h3>
                    <div className="space-y-4">
                      {recommendations.suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="bg-white rounded-xl p-4 border-2 border-gray-300 shadow-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="font-bold text-lg text-gray-800">{suggestion.name}</div>
                              <div className="text-sm text-gray-600">{suggestion.description}</div>
                            </div>
                            <div className={`px-3 py-2 rounded-xl font-bold ${
                              suggestion.predictedScore >= recommendations.targetScore 
                                ? 'bg-emerald-100 text-emerald-800 text-lg' 
                                : 'bg-yellow-100 text-yellow-800 text-lg'
                            }`}>
                              {suggestion.predictedScore}%
                            </div>
                          </div>
                          
                          {/* Foods in suggestion */}
                          <div className="mb-3">
                            <div className="text-sm font-bold text-gray-700 mb-2">Meal Components:</div>
                            <div className="space-y-1">
                              {suggestion.foods.map((food, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                  <span className="font-medium text-gray-800">
                                    {food.food.shortName || food.food.name.substring(0, 20)}
                                  </span>
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-gray-700">{food.servingGrams}g</div>
                                    <div className="text-xs text-gray-500">{food.reason}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Highlights */}
                          {suggestion.nutritionalHighlights.length > 0 && (
                            <div className="mb-4">
                              <div className="text-sm font-bold text-gray-700 mb-2">Nutritional Highlights:</div>
                              <div className="flex flex-wrap gap-2">
                                {suggestion.nutritionalHighlights.slice(0, 3).map((highlight, index) => (
                                  <span 
                                    key={index}
                                    className="text-xs bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-medium"
                                  >
                                    {highlight}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => handleApplyAndClose(suggestion)}
                            className="w-full py-3 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-black text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                          >
                            🍴 Apply This Meal ({suggestion.totalGrams}g total)
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gaps Summary */}
                {(recommendations.gaps.animalFoods || 
                  recommendations.gaps.fruitsVegetables || 
                  recommendations.gaps.diversity < 3 || 
                  recommendations.gaps.keyNutrients.length > 0) && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-300">
                    <h4 className="text-sm font-bold text-gray-800 mb-3">📊 Current Nutritional Gaps</h4>
                    <div className="space-y-2">
                      {recommendations.gaps.animalFoods && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <span>❌</span>
                          <span>Missing animal foods (essential protein and iron)</span>
                        </div>
                      )}
                      {recommendations.gaps.fruitsVegetables && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <span>❌</span>
                          <span>Missing fruits or vegetables (vitamins and minerals)</span>
                        </div>
                      )}
                      {recommendations.gaps.diversity < 3 && (
                        <div className="flex items-center gap-2 text-sm text-orange-600">
                          <span>⚠️</span>
                          <span>Low food diversity ({recommendations.gaps.diversity} categories, target: 4+)</span>
                        </div>
                      )}
                      {recommendations.gaps.keyNutrients.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <span>❌</span>
                          <span>Low key nutrients: {recommendations.gaps.keyNutrients.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}