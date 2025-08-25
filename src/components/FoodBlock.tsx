import React, { memo, useMemo, useCallback } from 'react';
import { Food } from '../types/food';
import { categoryColors } from '../data/foodData';
import { UI_CONFIG } from '../constants/config';

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

const FoodBlockComponent = ({ 
  food, 
  portionSize = 1, 
  isHovered = false,
  isSelected = false,
  isDragging = false,
  onClick,
  onMouseEnter,
  onMouseLeave 
}: FoodBlockProps) => {
  
  // Memoize expensive calculations
  const { categoryColor, categoryIcon, ageInfo } = useMemo(() => ({
    categoryColor: categoryColors[food.category],
    categoryIcon: categoryIcons[food.category],
    ageInfo: ageIndicators[food.ageGroup],
  }), [food.category, food.ageGroup]);

  // Memoize nutrient calculations
  const nutrients = useMemo(() => ({
    iron: food.nutrients.iron?.amount ?? 0,
    protein: food.nutrients.protein?.amount ?? 0,
    calcium: food.nutrients.calcium?.amount ?? 0,
  }), [food.nutrients]);

  // Memoize display name
  const displayName = useMemo(() => 
    food.shortName || food.name.substring(0, 30), 
    [food.shortName, food.name]
  );

  // Memoize dynamic styles
  const dynamicStyles = useMemo(() => ({
    borderColor: categoryColor,
    borderWidth: isHovered || isSelected ? '3px' : '2px',
  }), [categoryColor, isHovered, isSelected]);

  // Memoize CSS classes
  const containerClasses = useMemo(() => `
    relative bg-white rounded-food-block p-4 cursor-pointer
    border-2 transition-all duration-200 ease-in-out
    min-w-[160px] max-w-[200px] select-none
    ${isDragging ? 'shadow-food-block-active scale-105 z-50' : ''}
    ${isHovered && !isDragging ? 'shadow-food-block-hover scale-102' : 'shadow-food-block'}
    ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
  `, [isDragging, isHovered, isSelected]);

  // Optimize event handlers
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const handleMouseEnter = useCallback(() => {
    onMouseEnter?.();
  }, [onMouseEnter]);

  const handleMouseLeave = useCallback(() => {
    onMouseLeave?.();
  }, [onMouseLeave]);
  
  return (
    <div
      className={containerClasses}
      style={dynamicStyles}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
        {displayName}
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
        {nutrients.iron > 0.5 && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Iron</span>
            <span className="font-medium text-red-600">{nutrients.iron.toFixed(1)}mg</span>
          </div>
        )}
        {nutrients.protein > 2 && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Protein</span>
            <span className="font-medium text-purple-600">{nutrients.protein.toFixed(1)}g</span>
          </div>
        )}
        {nutrients.calcium > 10 && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Calcium</span>
            <span className="font-medium text-blue-600">{nutrients.calcium.toFixed(0)}mg</span>
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
};

// Memoize the component with custom comparison
export const FoodBlock = memo(FoodBlockComponent, (prevProps, nextProps) => {
  return (
    prevProps.food.fdcId === nextProps.food.fdcId &&
    prevProps.portionSize === nextProps.portionSize &&
    prevProps.isHovered === nextProps.isHovered &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isDragging === nextProps.isDragging
  );
});