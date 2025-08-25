import React from 'react';
import { Food } from '../types/food';
import { categoryColors } from '../data/foodData';

interface FoodBrowsePanelProps {
  foods: Food[];
  categories: (Food['category'] | 'all')[];
  categoryNames: Record<Food['category'] | 'all', string>;
  activeCategory: Food['category'] | 'all';
  onCategoryChange: (category: Food['category'] | 'all') => void;
  onAddFood: (food: Food) => void;
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

const ageIndicators = {
  '6+ months': { color: '#28A745', text: '6m+' },
  '8+ months': { color: '#6FB83F', text: '8m+' },
  '12+ months': { color: '#FFC107', text: '12m+' }
} as const;

export function FoodBrowsePanel({
  foods,
  categories,
  categoryNames,
  activeCategory,
  onCategoryChange,
  onAddFood,
  onShowInfo,
  selectedFood
}: FoodBrowsePanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          🥗 Browse Foods
        </h2>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${activeCategory === category
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {categoryNames[category]}
            </button>
          ))}
        </div>
      </div>

      {/* Food List */}
      <div className="p-3 max-h-[70vh] overflow-y-auto">
        <div className="space-y-2">
          {foods.map((food) => (
            <FoodBrowseItem
              key={food.fdcId}
              food={food}
              isSelected={selectedFood?.fdcId === food.fdcId}
              onAddFood={onAddFood}
              onShowInfo={onShowInfo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface FoodBrowseItemProps {
  food: Food;
  isSelected: boolean;
  onAddFood: (food: Food) => void;
  onShowInfo: (food: Food) => void;
}

function FoodBrowseItem({ food, isSelected, onAddFood, onShowInfo }: FoodBrowseItemProps) {
  const categoryColor = categoryColors[food.category];
  const categoryIcon = categoryIcons[food.category];
  const ageInfo = ageIndicators[food.ageGroup];

  return (
    <div 
      className={`
        flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-md
        ${isSelected 
          ? 'ring-2 ring-blue-400 border-blue-200 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
    >
      {/* Food Icon & Info */}
      <button
        onClick={() => onShowInfo(food)}
        className="flex-1 flex items-center gap-3 text-left hover:bg-gray-50 rounded-md p-2 transition-colors"
      >
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white"
          style={{ backgroundColor: categoryColor }}
        >
          {categoryIcon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-800 text-sm leading-tight">
            {food.shortName || food.name.substring(0, 25)}
            {food.name.length > 25 && '...'}
          </div>
          <div className="text-xs text-gray-500 capitalize mt-0.5">
            {food.category}
          </div>
        </div>

        {/* Age Indicator */}
        <div 
          className="px-2 py-1 rounded text-xs font-bold text-white"
          style={{ backgroundColor: ageInfo.color }}
        >
          {ageInfo.text}
        </div>
      </button>

      {/* Add Button */}
      <button
        onClick={() => onAddFood(food)}
        className="
          w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 active:bg-green-700
          text-white font-bold text-lg transition-all duration-150
          hover:scale-105 active:scale-95 shadow-sm hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2
        "
        title={`Add ${food.shortName || food.name} to meal`}
      >
        +
      </button>
    </div>
  );
}