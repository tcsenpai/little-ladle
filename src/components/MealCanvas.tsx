import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { DraggableFoodBlock } from './DraggableFoodBlock';
import { Food } from '../types/food';

interface MealFood extends Food {
  id: string;
  portionSize: number;
}

interface MealCanvasProps {
  mealFoods: MealFood[];
  onPortionChange: (foodId: string, newSize: number) => void;
  onRemoveFood: (foodId: string) => void;
}

export function MealCanvas({ mealFoods, onPortionChange, onRemoveFood }: MealCanvasProps) {
  
  const { isOver, setNodeRef } = useDroppable({
    id: 'meal-canvas',
  });
  
  // Calculate total nutrition
  const totalNutrition = mealFoods.reduce((total, mealFood) => {
    const multiplier = mealFood.portionSize;
    return {
      calories: total.calories + ((mealFood.nutrients.calories?.amount ?? 0) * multiplier),
      iron: total.iron + ((mealFood.nutrients.iron?.amount ?? 0) * multiplier),
      protein: total.protein + ((mealFood.nutrients.protein?.amount ?? 0) * multiplier),
      calcium: total.calcium + ((mealFood.nutrients.calcium?.amount ?? 0) * multiplier),
      fat: total.fat + ((mealFood.nutrients.fat?.amount ?? 0) * multiplier),
      carbs: total.carbs + ((mealFood.nutrients.carbs?.amount ?? 0) * multiplier)
    };
  }, {
    calories: 0,
    iron: 0, 
    protein: 0,
    calcium: 0,
    fat: 0,
    carbs: 0
  });

  // Nutrition targets for 7-month-old (approximate daily values)
  const targets = {
    calories: { target: 600, color: '#FF6B6B' },
    iron: { target: 11, color: '#DC3545' },
    protein: { target: 12, color: '#845EC2' },
    calcium: { target: 260, color: '#4ECDC4' }
  };

  const getNutritionProgress = (current: number, target: number) => {
    const percentage = Math.min((current / target) * 100, 100);
    return {
      percentage,
      status: percentage >= 80 ? 'excellent' : 
              percentage >= 60 ? 'good' : 
              percentage >= 40 ? 'okay' : 
              percentage >= 20 ? 'low' : 'missing'
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 min-h-[400px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🍽️ Sophie's Meal
          </h2>
          <div className="text-sm text-gray-600">
            {mealFoods.length} food{mealFoods.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Meal Foods Area */}
        <div className="lg:col-span-2">
          <div
            ref={setNodeRef}
            className={`
              min-h-[300px] p-4 rounded-lg border-2 border-dashed transition-all duration-200
              ${isOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 bg-gray-50'
              }
            `}
          >
                {mealFoods.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-lg font-medium mb-2">Drag food blocks here!</p>
                    <p className="text-sm text-center max-w-xs">
                      Create Sophie's meal by dragging food blocks from the left panel into this area.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {mealFoods.map((mealFood, index) => (
                      <div key={mealFood.id} className="relative">
                        <DraggableFoodBlock
                          food={mealFood}
                          portionSize={mealFood.portionSize}
                          onPortionChange={(newSize) => onPortionChange(mealFood.id, newSize)}
                          showNutritionPreview={true}
                          isInMeal={true}
                        />
                        
                        {/* Remove button */}
                        <button
                          onClick={() => onRemoveFood(mealFood.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors shadow-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
          </div>
        </div>

        {/* Nutrition Dashboard */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              📊 Nutrition Dashboard
            </h3>
            
            {mealFoods.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-sm">Add foods to see nutrition analysis</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Key nutrients */}
                {Object.entries(targets).map(([nutrient, config]) => {
                  const current = totalNutrition[nutrient as keyof typeof totalNutrition];
                  const progress = getNutritionProgress(current, config.target);
                  
                  return (
                    <div key={nutrient} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {nutrient}
                        </span>
                        <span className="text-sm font-bold" style={{ color: config.color }}>
                          {current.toFixed(1)}{nutrient === 'calories' ? '' : nutrient === 'protein' || nutrient === 'fat' || nutrient === 'carbs' ? 'g' : 'mg'} / {config.target}{nutrient === 'calories' ? '' : nutrient === 'protein' || nutrient === 'fat' || nutrient === 'carbs' ? 'g' : 'mg'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${progress.percentage}%`,
                            backgroundColor: config.color
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 text-right">
                        {progress.percentage.toFixed(0)}% of daily target
                      </div>
                    </div>
                  );
                })}

                {/* Overall meal assessment */}
                <div className="mt-6 p-3 rounded-lg bg-white border border-gray-200">
                  <div className="text-sm font-medium text-gray-800 mb-2">Meal Assessment:</div>
                  {mealFoods.length >= 3 ? (
                    <div className="text-green-700 text-sm flex items-center gap-1">
                      <span>✅</span> Good variety! This looks like a balanced meal for Sophie.
                    </div>
                  ) : mealFoods.length >= 2 ? (
                    <div className="text-yellow-700 text-sm flex items-center gap-1">
                      <span>⚠️</span> Try adding one more food for better balance.
                    </div>
                  ) : (
                    <div className="text-gray-600 text-sm flex items-center gap-1">
                      <span>🎯</span> Add more foods to create a balanced meal.
                    </div>
                  )}
                </div>

                {/* Clear meal button */}
                <button
                  onClick={() => mealFoods.forEach(food => onRemoveFood(food.id))}
                  className="w-full mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                >
                  Clear Meal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}