import React from 'react';
import { Food } from '../types/food';
import { categoryColors } from '../data/foodData';

interface FoodBlockProps {
  food: Food;
  portionSize?: number;
  isHovered?: boolean;
  isSelected?: boolean;
  isDragging?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
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

export function FoodBlock({ 
  food, 
  portionSize = 1, 
  isHovered = false,
  isSelected = false,
  isDragging = false,
  onClick,
  onMouseEnter,
  onMouseLeave 
}: FoodBlockProps) {
  
  const categoryColor = categoryColors[food.category];
  const categoryIcon = categoryIcons[food.category];
  const ageInfo = ageIndicators[food.ageGroup];
  
  // Get key nutrients for display
  const iron = food.nutrients.iron?.amount ?? 0;
  const protein = food.nutrients.protein?.amount ?? 0;
  const calcium = food.nutrients.calcium?.amount ?? 0;
  
  return (
    <div
      className={`
        relative bg-white rounded-food-block p-4 cursor-pointer
        border-2 transition-all duration-200 ease-in-out
        min-w-[160px] max-w-[200px] select-none
        ${isDragging ? 'shadow-food-block-active scale-105 z-50' : ''}
        ${isHovered && !isDragging ? 'shadow-food-block-hover scale-102' : 'shadow-food-block'}
        ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
      `}
      style={{ 
        borderColor: categoryColor,
        borderWidth: isHovered || isSelected ? '3px' : '2px'
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
      
      {/* Food icon */}
      <div className="text-3xl mb-2 mt-2">
        {categoryIcon}
      </div>
      
      {/* Food name */}
      <h3 className="font-semibold text-sm text-gray-800 mb-2 leading-tight">
        {food.shortName || food.name.substring(0, 30)}
      </h3>
      
      {/* Portion size indicator */}
      <div className="flex items-center gap-1 mb-3">
        <span className="text-xs text-gray-600">Portion:</span>
        <div className="flex gap-1">
          {[0.5, 1, 1.5, 2].map(size => (
            <div
              key={size}
              className={`w-2 h-2 rounded-full ${
                size <= portionSize 
                  ? 'bg-blue-400' 
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Key nutrition preview */}
      <div className="space-y-1">
        {iron > 0.5 && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Iron</span>
            <span className="font-medium text-red-600">{iron.toFixed(1)}mg</span>
          </div>
        )}
        {protein > 2 && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Protein</span>
            <span className="font-medium text-purple-600">{protein.toFixed(1)}g</span>
          </div>
        )}
        {calcium > 10 && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Calcium</span>
            <span className="font-medium text-blue-600">{calcium.toFixed(0)}mg</span>
          </div>
        )}
      </div>
      
      {/* Connection points (for future drag-and-drop) */}
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
    </div>
  );
}