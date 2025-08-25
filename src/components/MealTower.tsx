import React from 'react';
import { Food } from '../types/food';
import { categoryColors } from '../data/foodData';

interface MealFood {
  id: string;
  food: Food;
  portionSize: number;
  addedAt: number;
}

interface MealTowerProps {
  mealFoods: MealFood[];
  onRemoveFood: (foodId: string) => void;
  onUpdatePortion: (foodId: string, portion: number) => void;
  onClearMeal: () => void;
  onShowInfo: (food: Food) => void;
  selectedFood: Food | null;
}

const categoryIcons = {
  fruit: '🍎',
  vegetable: '🥦',
  protein: '🍗',
  grain: '🌾',
  dairy: '🥛',
  other: '🍽️'
} as const;

export function MealTower({
  mealFoods,
  onRemoveFood,
  onUpdatePortion,
  onClearMeal,
  onShowInfo,
  selectedFood
}: MealTowerProps) {
  // Calculate total nutrition
  const totalNutrition = mealFoods.reduce((total, mealFood) => {
    const mult = mealFood.portionSize;
    const food = mealFood.food;
    return {
      calories: total.calories + ((food.nutrients.calories?.amount ?? 0) * mult),
      iron: total.iron + ((food.nutrients.iron?.amount ?? 0) * mult),
      protein: total.protein + ((food.nutrients.protein?.amount ?? 0) * mult),
      calcium: total.calcium + ((food.nutrients.calcium?.amount ?? 0) * mult),
    };
  }, { calories: 0, iron: 0, protein: 0, calcium: 0 });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 min-h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 border-b border-gray-200 rounded-t-xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🏗️ Sophie's Meal Tower
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Stack foods to build the perfect meal!
            </p>
          </div>
          {mealFoods.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="bg-white px-3 py-1 rounded-full shadow-sm">
                <span className="text-sm text-gray-600">Foods: </span>
                <span className="font-bold text-green-600">{mealFoods.length}</span>
              </div>
              <button
                onClick={onClearMeal}
                className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tower Container */}
      <div className="p-6">
        {mealFoods.length === 0 ? (
          <EmptyTower />
        ) : (
          <>
            {/* Nutrition Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6 border border-green-200">
              <h3 className="text-sm font-bold text-gray-700 mb-2">📊 Meal Nutrition</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{Math.round(totalNutrition.calories)}</div>
                  <div className="text-xs text-gray-600">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{totalNutrition.iron.toFixed(1)}mg</div>
                  <div className="text-xs text-gray-600">Iron</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{totalNutrition.protein.toFixed(1)}g</div>
                  <div className="text-xs text-gray-600">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{Math.round(totalNutrition.calcium)}mg</div>
                  <div className="text-xs text-gray-600">Calcium</div>
                </div>
              </div>
            </div>

            {/* Food Tower */}
            <div className="space-y-3">
              {mealFoods.map((mealFood, index) => (
                <MealTowerItem
                  key={mealFood.id}
                  mealFood={mealFood}
                  isTop={index === 0}
                  isBottom={index === mealFoods.length - 1}
                  isSelected={selectedFood?.fdcId === mealFood.food.fdcId}
                  onRemove={() => onRemoveFood(mealFood.id)}
                  onUpdatePortion={(portion) => onUpdatePortion(mealFood.id, portion)}
                  onShowInfo={() => onShowInfo(mealFood.food)}
                />
              ))}
            </div>

            {/* Tower Base */}
            <div className="mt-4 h-4 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 rounded-lg shadow-sm">
              <div className="text-center text-xs text-gray-500 pt-1">
                Meal Foundation
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyTower() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
      <div className="text-8xl mb-6">🏗️</div>
      <h3 className="text-2xl font-bold mb-2">Start Building!</h3>
      <p className="text-lg text-center max-w-md mb-4">
        Click the <span className="text-green-500 font-bold">+</span> button next to foods to start building Sophie's meal tower
      </p>
      <div className="flex items-center gap-2 text-sm bg-green-50 px-4 py-2 rounded-lg border border-green-200">
        <span className="text-lg">💡</span>
        <span>Foods stack from bottom to top like building blocks!</span>
      </div>
    </div>
  );
}

interface MealTowerItemProps {
  mealFood: MealFood;
  isTop: boolean;
  isBottom: boolean;
  isSelected: boolean;
  onRemove: () => void;
  onUpdatePortion: (portion: number) => void;
  onShowInfo: () => void;
}

function MealTowerItem({
  mealFood,
  isTop,
  isBottom,
  isSelected,
  onRemove,
  onUpdatePortion,
  onShowInfo
}: MealTowerItemProps) {
  const { food, portionSize } = mealFood;
  const categoryColor = categoryColors[food.category];
  const categoryIcon = categoryIcons[food.category];

  return (
    <div className={`
      group relative transition-all duration-300 hover:shadow-lg
      ${isSelected ? 'ring-2 ring-blue-400' : ''}
      ${isTop ? 'animate-slideDown' : ''}
    `}>
      {/* Connection Line to Previous Item */}
      {!isBottom && (
        <div className="absolute left-1/2 -bottom-3 w-0.5 h-3 bg-gradient-to-b from-gray-300 to-transparent transform -translate-x-px z-10"></div>
      )}

      {/* Food Item */}
      <div
        className="
          flex items-center gap-4 p-4 rounded-xl border-2 shadow-sm
          bg-white hover:bg-gray-50 transition-all duration-200
          border-gray-200 hover:border-gray-300
        "
        style={{
          borderLeftColor: categoryColor,
          borderLeftWidth: '6px'
        }}
      >
        {/* Food Info - Clickable */}
        <button
          onClick={onShowInfo}
          className="flex items-center gap-3 flex-1 text-left hover:bg-gray-100 rounded-lg p-2 transition-colors"
        >
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold text-white shadow-sm"
            style={{ backgroundColor: categoryColor }}
          >
            {categoryIcon}
          </div>
          
          <div className="flex-1">
            <div className="font-bold text-gray-800">
              {food.shortName || food.name.substring(0, 30)}
            </div>
            <div className="text-sm text-gray-500 capitalize">
              {food.category} • {portionSize === 1 ? '1 serving' : `${portionSize} servings`}
            </div>
          </div>
        </button>

        {/* Portion Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Portion:</span>
          <div className="flex gap-1">
            {[0.5, 1, 1.5, 2].map(size => (
              <button
                key={size}
                onClick={() => onUpdatePortion(size)}
                className={`
                  w-8 h-8 rounded-lg text-xs font-bold transition-all duration-150
                  ${size === portionSize 
                    ? 'bg-green-500 text-white shadow-md transform scale-105' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {size === 0.5 ? '½' : size}
              </button>
            ))}
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="
            w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700
            text-white font-bold text-sm transition-all duration-150
            hover:scale-110 active:scale-95 shadow-sm hover:shadow-md
            opacity-0 group-hover:opacity-100 transition-opacity
          "
          title={`Remove ${food.shortName || food.name}`}
        >
          ×
        </button>
      </div>
    </div>
  );
}