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
    <div className="bg-gradient-to-b from-white via-orange-50/30 to-yellow-50/30 dark:from-slate-800 dark:via-slate-700/30 dark:to-slate-800 rounded-2xl shadow-xl border-2 border-orange-200/50 dark:border-slate-600/50 min-h-[600px] overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 dark:from-orange-600 dark:to-yellow-600 p-6 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
              <span className="text-3xl">🏗️</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Meal Builder
              </h2>
              <p className="text-orange-100 font-medium">
                Stack foods to create balanced nutrition
              </p>
            </div>
          </div>
          {mealFoods.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30 shadow-lg">
                <span className="text-sm text-orange-100">Items: </span>
                <span className="font-black text-white text-lg">{mealFoods.length}</span>
              </div>
              <button
                onClick={onClearMeal}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/30 hover:shadow-lg transform hover:scale-105"
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
            {/* Enhanced Nutrition Summary with Distribution Chart */}
            <div className="bg-gradient-to-r from-white via-orange-50/50 to-yellow-50/50 dark:from-slate-800 dark:via-slate-700/50 dark:to-slate-800 rounded-2xl p-6 mb-6 border-2 border-orange-100 dark:border-slate-600 shadow-lg transition-colors duration-300">
              <h3 className="text-lg font-black text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2 transition-colors duration-300">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                  <span className="text-sm">📊</span>
                </div>
                Nutrition Overview
              </h3>
              
              {/* Main Nutrition Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-700 p-4 rounded-xl text-center shadow-sm border border-gray-100 dark:border-slate-600 hover:shadow-md transition-all duration-300">
                  <div className="text-2xl font-black text-orange-600 mb-1">{Math.round(totalNutrition.calories)}</div>
                  <div className="text-sm font-medium text-gray-600">Calories</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full animate-fillProgress transition-all duration-1000" style={{ width: `${Math.min((totalNutrition.calories / 300) * 100, 100)}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Target: 300 cal</div>
                </div>
                <div className="bg-white dark:bg-slate-700 p-4 rounded-xl text-center shadow-sm border border-gray-100 dark:border-slate-600 hover:shadow-md transition-all duration-300">
                  <div className="text-2xl font-black text-red-600 mb-1">{totalNutrition.iron.toFixed(1)}</div>
                  <div className="text-sm font-medium text-gray-600">Iron (mg)</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full animate-fillProgress transition-all duration-1000" style={{ width: `${Math.min((totalNutrition.iron / 10) * 100, 100)}%`, animationDelay: '0.2s' }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Target: 10mg</div>
                </div>
                <div className="bg-white dark:bg-slate-700 p-4 rounded-xl text-center shadow-sm border border-gray-100 dark:border-slate-600 hover:shadow-md transition-all duration-300">
                  <div className="text-2xl font-black text-purple-600 mb-1">{totalNutrition.protein.toFixed(1)}</div>
                  <div className="text-sm font-medium text-gray-600">Protein (g)</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full animate-fillProgress transition-all duration-1000" style={{ width: `${Math.min((totalNutrition.protein / 15) * 100, 100)}%`, animationDelay: '0.4s' }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Target: 15g</div>
                </div>
                <div className="bg-white dark:bg-slate-700 p-4 rounded-xl text-center shadow-sm border border-gray-100 dark:border-slate-600 hover:shadow-md transition-all duration-300">
                  <div className="text-2xl font-black text-blue-600 mb-1">{Math.round(totalNutrition.calcium)}</div>
                  <div className="text-sm font-medium text-gray-600">Calcium (mg)</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full animate-fillProgress transition-all duration-1000" style={{ width: `${Math.min((totalNutrition.calcium / 300) * 100, 100)}%`, animationDelay: '0.6s' }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Target: 300mg</div>
                </div>
              </div>
              
              {/* Category Distribution Mini-Chart */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-emerald-600">🌈</span>
                  Food Category Distribution
                </h4>
                <div className="flex items-center space-x-1 mb-2">
                  {(() => {
                    const categoryCount = mealFoods.reduce((acc, mealFood) => {
                      acc[mealFood.food.category] = (acc[mealFood.food.category] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    
                    const totalFoods = mealFoods.length;
                    const segments: JSX.Element[] = [];
                    
                    Object.entries(categoryCount).forEach(([category, count]) => {
                      const percentage = (count / totalFoods) * 100;
                      const categoryColor = categoryColors[category as keyof typeof categoryColors] || '#6B7280';
                      
                      segments.push(
                        <div
                          key={category}
                          className="h-3 rounded transition-all duration-500 hover:scale-y-150 relative group"
                          style={{ 
                            width: `${percentage}%`, 
                            backgroundColor: categoryColor,
                            minWidth: '4px'
                          }}
                          title={`${category}: ${count} items (${percentage.toFixed(1)}%)`}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            {category}: {count}
                          </div>
                        </div>
                      );
                    });
                    
                    return segments;
                  })()
                }
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {(() => {
                    const categoryCount = mealFoods.reduce((acc, mealFood) => {
                      acc[mealFood.food.category] = (acc[mealFood.food.category] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    
                    return Object.entries(categoryCount).map(([category, count]) => {
                      const categoryColor = categoryColors[category as keyof typeof categoryColors] || '#6B7280';
                      return (
                        <div key={category} className="flex items-center gap-1">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: categoryColor }}
                          ></div>
                          <span className="text-gray-600 capitalize">{category} ({count})</span>
                        </div>
                      );
                    });
                  })()
                }
                </div>
              </div>
            </div>

            {/* Food Tower - Scrollable with 4 visible items */}
            <div className="relative">
              <div 
                data-meal-tower
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
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-8xl mb-6 animate-bounce">🍽️</div>
      <h3 className="text-2xl font-black text-gray-800 mb-3">Ready to Build!</h3>
      <p className="text-sm text-center max-w-md mb-6 text-gray-600 leading-relaxed">
        Click the <span className="bg-emerald-500 text-white px-2 py-1 rounded-lg font-bold text-xs">+</span> button next to foods to add them to your meal tower
      </p>
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 px-6 py-4 rounded-2xl shadow-lg max-w-md">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white text-xs">💡</span>
          </div>
          <div className="text-orange-700 font-medium leading-relaxed">
            Add foods from different categories for balanced nutrition and higher WHO compliance
          </div>
        </div>
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
    <div 
      data-meal-food-id={mealFood.id}
      className={`
        group relative transition-all duration-500 hover:shadow-xl transform hover:scale-[1.02] animate-scaleUp
        ${isSelected ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}
        ${isTop ? 'animate-celebrate' : ''}
      `}
    >
      {/* Connection Line to Previous Item */}
      {!isBottom && (
        <div className="absolute left-1/2 -bottom-3 w-0.5 h-3 bg-gradient-to-b from-gray-300 to-transparent transform -translate-x-px z-10"></div>
      )}

      {/* Food Item */}
      <div
        className="
          flex items-center gap-4 p-5 rounded-2xl border-2 shadow-lg
          bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 transition-all duration-300
          border-gray-200 hover:border-gray-300 group-hover:shadow-2xl
        "
        style={{
          borderLeftColor: categoryColor,
          borderLeftWidth: '8px',
          boxShadow: `0 4px 15px -3px ${categoryColor}20, 0 0 0 1px ${categoryColor}10`
        }}
      >
        {/* Food Info - Clickable */}
        <button
          onClick={onShowInfo}
          className="flex items-center gap-3 flex-1 text-left hover:bg-gray-100 rounded-lg p-2 transition-colors"
        >
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg ring-2 ring-white/20 transition-all duration-300 group-hover:scale-110"
            style={{ 
              backgroundColor: categoryColor,
              boxShadow: `0 6px 20px -5px ${categoryColor}40, 0 0 0 1px ${categoryColor}20`
            }}
          >
            {categoryIcon}
          </div>
          
          <div className="flex-1">
            <div className="font-black text-gray-900 text-lg group-hover:text-gray-700 transition-colors duration-200">
              {food.shortName || food.name.substring(0, 30)}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div 
                className="text-xs font-bold px-2 py-1 rounded-lg text-white shadow-sm"
                style={{ backgroundColor: categoryColor }}
              >
                {food.category}
              </div>
              <div className="text-sm font-medium text-gray-600">
                {servingGrams}g serving
              </div>
            </div>
          </div>
        </button>

        {/* Serving Controls - 2x2 Grid Layout */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-slate-400">Serving:</span>
          <div className="grid grid-cols-2 gap-1">
            {servingOptions.map(grams => (
              <button
                key={grams}
                onClick={() => onUpdateServing(grams)}
                className={`
                  w-10 h-7 rounded-lg text-xs font-bold transition-all duration-200 shadow-sm
                  ${grams === servingGrams 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md ring-1 ring-emerald-200' 
                    : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
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
            w-10 h-10 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800
            text-white font-black text-lg transition-all duration-300
            hover:scale-125 active:scale-95 shadow-lg hover:shadow-xl
            opacity-0 group-hover:opacity-100 transform group-hover:rotate-12 hover:rotate-0
            ring-2 ring-red-200 hover:ring-red-300
          "
          title={`Remove ${food.shortName || food.name}`}
        >
          ×
        </button>
      </div>
    </div>
  );
}