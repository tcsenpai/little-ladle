import React from 'react';
import { Food } from '../types/food';
import { categoryColors } from '../data/foodData';

interface MealFood {
  id: string;
  food: Food;
  servingGrams: number;
  addedAt: number;
}

interface MealTowerProps {
  mealFoods: MealFood[];
  onRemoveFood: (foodId: string) => void;
  onUpdateServing: (foodId: string, servingGrams: number) => void;
  onClearMeal: () => void;
  onShowInfo: (food: Food) => void;
  selectedFood: Food | null;
  servingOptions: readonly number[];
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
  onUpdateServing,
  onClearMeal,
  onShowInfo,
  selectedFood,
  servingOptions
}: MealTowerProps) {
  // Calculate total nutrition (USDA values are per 100g, so we multiply by servingGrams/100)
  const totalNutrition = mealFoods.reduce((total, mealFood) => {
    const multiplier = mealFood.servingGrams / 100; // Convert from per 100g to actual serving
    const food = mealFood.food;
    return {
      calories: total.calories + ((food.nutrients.calories?.amount ?? 0) * multiplier),
      iron: total.iron + ((food.nutrients.iron?.amount ?? 0) * multiplier),
      protein: total.protein + ((food.nutrients.protein?.amount ?? 0) * multiplier),
      calcium: total.calcium + ((food.nutrients.calcium?.amount ?? 0) * multiplier),
    };
  }, { calories: 0, iron: 0, protein: 0, calcium: 0 });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px]">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🏗️</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Meal Builder
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Add foods to build a balanced meal
              </p>
            </div>
          </div>
          {mealFoods.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 px-3 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Items: </span>
                <span className="font-semibold text-gray-900">{mealFoods.length}</span>
              </div>
              <button
                onClick={onClearMeal}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                🗑️ Reset Tower
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
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>📊</span>
                Nutrition Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{Math.round(totalNutrition.calories)}</div>
                  <div className="text-xs text-gray-500">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{totalNutrition.iron.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Iron (mg)</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{totalNutrition.protein.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Protein (g)</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{Math.round(totalNutrition.calcium)}</div>
                  <div className="text-xs text-gray-500">Calcium (mg)</div>
                </div>
              </div>
            </div>

            {/* Food Tower - Scrollable with 4 visible items */}
            <div className="relative">
              <div 
                className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                style={{ 
                  maxHeight: `${4 * 85}px`, // Show 4 items (approximate 85px per item)
                }}
              >
                {mealFoods.map((mealFood, index) => (
                  <MealTowerItem
                    key={mealFood.id}
                    mealFood={mealFood}
                    isTop={index === 0}
                    isBottom={index === mealFoods.length - 1}
                    isSelected={selectedFood?.fdcId === mealFood.food.fdcId}
                    onRemove={() => onRemoveFood(mealFood.id)}
                    onUpdateServing={(servingGrams) => onUpdateServing(mealFood.id, servingGrams)}
                    onShowInfo={() => onShowInfo(mealFood.food)}
                    servingOptions={servingOptions}
                  />
                ))}
              </div>
              
              {/* Scroll indicator when there are more than 4 items */}
              {mealFoods.length > 4 && (
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-1 text-gray-400">
                  <div className="text-xs font-medium">Scroll</div>
                  <div className="flex flex-col gap-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <div className="text-xs font-medium">{mealFoods.length - 4}+ more</div>
                </div>
              )}
            </div>

            {/* Meal Foundation */}
            <div className="mt-6 p-3 bg-gray-100 rounded-xl">
              <div className="text-center text-xs text-gray-500">
                Meal Foundation • {mealFoods.length} items
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
      <div className="text-6xl mb-6">🍽️</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Building</h3>
      <p className="text-sm text-center max-w-md mb-4 text-gray-500">
        Click the <span className="text-indigo-600 font-semibold">+</span> button next to foods to add them to your meal
      </p>
      <div className="flex items-center gap-2 text-sm bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-100">
        <span className="text-lg">💡</span>
        <span className="text-indigo-700">Add foods from different categories for balanced nutrition</span>
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
  onUpdateServing: (servingGrams: number) => void;
  onShowInfo: () => void;
  servingOptions: readonly number[];
}

function MealTowerItem({
  mealFood,
  isTop,
  isBottom,
  isSelected,
  onRemove,
  onUpdateServing,
  onShowInfo,
  servingOptions
}: MealTowerItemProps) {
  const { food, servingGrams } = mealFood;
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
              {food.category} • {servingGrams}g serving
            </div>
          </div>
        </button>

        {/* Serving Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Serving:</span>
          <div className="flex gap-1">
            {servingOptions.map(grams => (
              <button
                key={grams}
                onClick={() => onUpdateServing(grams)}
                className={`
                  w-10 h-8 rounded-lg text-xs font-bold transition-all duration-150
                  ${grams === servingGrams 
                    ? 'bg-green-500 text-white shadow-md transform scale-105' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {grams}g
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