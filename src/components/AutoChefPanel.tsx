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

interface AutoChefPanelProps {
  mealFoods: MealFood[];
  childProfile: ChildProfile | null;
  availableFoods: Food[];
  onAddFood: (food: Food) => void;
  onApplySuggestion: (suggestion: AutoChefSuggestion) => void;
}

export function AutoChefPanel({ 
  mealFoods, 
  childProfile, 
  availableFoods, 
  onAddFood, 
  onApplySuggestion 
}: AutoChefPanelProps) {
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

  // Generate recommendations when meal or mode changes
  useEffect(() => {
    if (!childProfile || availableFoods.length === 0) {
      setRecommendations(null);
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
  }, [mealFoods, childProfile, availableFoods, feedingMode]);

  if (!childProfile) {
    return (
      <div className="bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-white/50 h-full">
        <div className="p-6 h-full flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">👨‍🍳</div>
          <h3 className="text-xl font-black text-gray-800 mb-2">Auto-Chef Assistant</h3>
          <p className="text-sm text-gray-600 text-center">
            Create a child profile to get personalized meal suggestions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-white/50 h-full">
      {/* Header */}
      <div className="p-4 border-b-2 border-violet-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-xl">👨‍🍳</span>
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-800">Auto-Chef</h2>
            <p className="text-xs text-gray-600">AI Meal Assistant</p>
          </div>
        </div>
        
        {/* Feeding Mode Toggle */}
        <div className="mb-4">
          <div className="text-xs font-bold text-gray-700 mb-2">Feeding Mode:</div>
          <div className="flex gap-1">
            {Object.entries(FEEDING_MODES).map(([key, mode]) => (
              <button
                key={key}
                onClick={() => handleModeChange(key)}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200
                  ${feedingMode.name === mode.name
                    ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-violet-100'
                  }
                `}
                title={mode.description}
              >
                {mode.targetCompliance}% WHO
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">
            {feedingMode.description}
          </div>
        </div>
      </div>

      <div className="p-4 max-h-[70vh] overflow-y-auto">
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full mr-3"></div>
            <span className="text-gray-600 text-sm">Generating suggestions...</span>
          </div>
        ) : !recommendations ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-3">🤔</div>
            <p className="text-sm">Unable to generate recommendations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Score */}
            <div className="bg-white/50 rounded-xl p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-800">Current Score</span>
                <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  recommendations.currentMealScore >= recommendations.targetScore 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : recommendations.currentMealScore >= recommendations.targetScore * 0.7
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {recommendations.currentMealScore}%
                </div>
              </div>
              <div className="text-xs text-gray-600">
                Target: {recommendations.targetScore}% ({feedingMode.name})
              </div>
            </div>

            {/* Quick Fixes */}
            {recommendations.quickFixes.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-2">⚡ Quick Fixes</h4>
                <div className="space-y-2">
                  {recommendations.quickFixes.map((fix, index) => (
                    <div key={index} className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800">
                            {fix.food.shortName || fix.food.name.substring(0, 20)}
                          </span>
                          <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full">
                            {fix.servingGrams}g
                          </span>
                        </div>
                        <button
                          onClick={() => onAddFood(fix.food)}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          +{fix.expectedImprovement}%
                        </button>
                      </div>
                      <div className="text-xs text-emerald-700">{fix.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meal Suggestions */}
            {recommendations.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-2">🍽️ Meal Suggestions</h4>
                <div className="space-y-3">
                  {recommendations.suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="bg-white/70 rounded-xl p-3 border border-gray-300">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-bold text-sm text-gray-800">{suggestion.name}</div>
                          <div className="text-xs text-gray-600">{suggestion.description}</div>
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          suggestion.predictedScore >= recommendations.targetScore 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {suggestion.predictedScore}%
                        </div>
                      </div>
                      
                      {/* Foods in suggestion */}
                      <div className="mb-2">
                        <div className="text-xs font-bold text-gray-700 mb-1">Foods:</div>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.foods.map((food, index) => (
                            <span 
                              key={index}
                              className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full"
                            >
                              {food.food.shortName || food.food.name.substring(0, 15)} ({food.servingGrams}g)
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Highlights */}
                      {suggestion.nutritionalHighlights.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs font-bold text-gray-700 mb-1">Highlights:</div>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.nutritionalHighlights.slice(0, 2).map((highlight, index) => (
                              <span 
                                key={index}
                                className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full"
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => onApplySuggestion(suggestion)}
                        className="w-full py-2 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-bold text-xs rounded-lg transition-all duration-300 transform hover:scale-105"
                      >
                        🍴 Apply This Meal ({suggestion.totalGrams}g total)
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gaps Summary */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs font-bold text-gray-800 mb-2">📊 Current Gaps</div>
              <div className="space-y-1">
                {recommendations.gaps.animalFoods && (
                  <div className="text-xs text-red-600">• Missing animal foods (protein)</div>
                )}
                {recommendations.gaps.fruitsVegetables && (
                  <div className="text-xs text-red-600">• Missing fruits or vegetables</div>
                )}
                {recommendations.gaps.diversity < 3 && (
                  <div className="text-xs text-orange-600">
                    • Low food diversity ({recommendations.gaps.diversity} categories)
                  </div>
                )}
                {recommendations.gaps.keyNutrients.length > 0 && (
                  <div className="text-xs text-red-600">
                    • Low nutrients: {recommendations.gaps.keyNutrients.join(', ')}
                  </div>
                )}
                {!recommendations.gaps.animalFoods && 
                 !recommendations.gaps.fruitsVegetables && 
                 recommendations.gaps.diversity >= 3 && 
                 recommendations.gaps.keyNutrients.length === 0 && (
                  <div className="text-xs text-emerald-600">✅ No major gaps detected!</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}