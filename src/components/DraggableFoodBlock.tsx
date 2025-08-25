import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Food } from '../types/food';
import { categoryColors } from '../data/foodData';

interface DraggableFoodBlockProps {
  food: Food;
  portionSize?: number;
  onPortionChange?: (newSize: number) => void;
  showNutritionPreview?: boolean;
  isInMeal?: boolean;
  isDragging?: boolean;
}

// Simple food category icons using emoji
const categoryIcons = {
  fruit: '🍎',
  vegetable: '🥦',
  protein: '🍗',
  grain: '🌾',
  dairy: '🥛',
  other: '🍽️'
} as const;

// Age group indicators
const ageIndicators = {
  '6+ months': { color: '#28A745', text: '6m+' },
  '8+ months': { color: '#6FB83F', text: '8m+' },
  '12+ months': { color: '#FFC107', text: '12m+' }
} as const;

// Portion size options
const portionSizes = [0.5, 1, 1.5, 2] as const;

export function DraggableFoodBlock({ 
  food, 
  portionSize = 1, 
  onPortionChange,
  showNutritionPreview = false,
  isInMeal = false,
  isDragging = false
}: DraggableFoodBlockProps) {
  
  const [showNutrition, setShowNutrition] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: `food-${food.fdcId}`,
    data: {
      type: 'food',
      food: food
    }
  });

  const categoryColor = categoryColors[food.category];
  const categoryIcon = categoryIcons[food.category];
  const ageInfo = ageIndicators[food.ageGroup];
  
  // Calculate nutrition based on portion size
  const getNutrientValue = (nutrientAmount: number | undefined) => {
    return ((nutrientAmount ?? 0) * portionSize).toFixed(1);
  };
  
  const iron = parseFloat(getNutrientValue(food.nutrients.iron?.amount));
  const protein = parseFloat(getNutrientValue(food.nutrients.protein?.amount));
  const calcium = parseFloat(getNutrientValue(food.nutrients.calcium?.amount));
  const calories = parseFloat(getNutrientValue(food.nutrients.calories?.amount));

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(2deg)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        relative bg-white rounded-food-block p-4 cursor-grab active:cursor-grabbing
        border-2 transition-all duration-200 ease-in-out
        min-w-[180px] max-w-[220px] select-none
        ${isDragging ? 'shadow-food-block-active scale-105 z-50' : 'shadow-food-block'}
        ${showNutrition ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
        ${isInMeal ? 'bg-blue-50' : ''}
      `}
      style={{ 
        borderColor: categoryColor,
        borderWidth: isDragging ? '3px' : '2px',
        ...style
      }}
      onMouseEnter={() => setShowNutrition(showNutritionPreview)}
      onMouseLeave={() => setShowNutrition(false)}
    >
          {/* Category color bar */}
          <div 
            className="absolute top-0 left-0 right-0 h-2 rounded-t-food-block"
            style={{ backgroundColor: categoryColor }}
          />
          
          {/* Age indicator */}
          <div 
            className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: ageInfo.color }}
          >
            {ageInfo.text}
          </div>
          
          {/* Food icon and name */}
          <div className="flex items-center gap-3 mb-3 mt-3">
            <div className="text-3xl flex-shrink-0">
              {categoryIcon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-800 leading-tight truncate">
                {food.shortName || food.name.substring(0, 25)}
              </h3>
              <p className="text-xs text-gray-500 capitalize">
                {food.category}
              </p>
            </div>
          </div>
          
          {/* Portion size controls */}
          {onPortionChange && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 font-medium">Portion:</span>
                <span className="text-xs text-gray-800 font-semibold">{portionSize}x</span>
              </div>
              <div className="flex gap-1">
                {portionSizes.map(size => (
                  <button
                    key={size}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPortionChange(size);
                    }}
                    className={`
                      w-6 h-6 rounded-full text-xs font-bold transition-all duration-150
                      ${size === portionSize 
                        ? 'bg-blue-500 text-white shadow-sm' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }
                    `}
                  >
                    {size === 0.5 ? '½' : size}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Nutrition preview */}
          {(showNutrition || isInMeal) && (
            <div className="bg-gray-50 rounded-lg p-2 mb-2">
              <div className="text-xs font-medium text-gray-700 mb-1">Nutrition (portion {portionSize}x):</div>
              <div className="space-y-1">
                {calories > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Calories</span>
                    <span className="font-medium text-orange-600">{calories}</span>
                  </div>
                )}
                {iron > 0.1 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Iron</span>
                    <span className="font-medium text-red-600">{iron}mg</span>
                  </div>
                )}
                {protein > 0.5 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Protein</span>
                    <span className="font-medium text-purple-600">{protein}g</span>
                  </div>
                )}
                {calcium > 5 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Calcium</span>
                    <span className="font-medium text-blue-600">{calcium}mg</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Quick nutrition indicators */}
          {!showNutrition && !isInMeal && (
            <div className="flex gap-1 flex-wrap">
              {iron > 1 && (
                <div className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                  Iron Rich
                </div>
              )}
              {protein > 5 && (
                <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                  High Protein
                </div>
              )}
              {calcium > 50 && (
                <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                  Calcium+
                </div>
              )}
            </div>
          )}
          
          {/* Connection points */}
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
            <div 
              className="w-4 h-4 rounded-connection-point border-2 border-white shadow-sm"
              style={{ backgroundColor: categoryColor }}
            />
          </div>
          
          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
            <div 
              className="w-4 h-4 rounded-connection-point border-2 border-white shadow-sm"
              style={{ backgroundColor: categoryColor }}
            />
          </div>
          
          {/* Drag indicator */}
          <div className="absolute top-2 left-2 text-gray-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
            </svg>
          </div>
    </div>
  );
}