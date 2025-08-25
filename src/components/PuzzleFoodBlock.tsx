import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Food } from '../types/food';
import { categoryColors } from '../data/foodData';

interface PuzzleFoodBlockProps {
  food: Food;
  portionSize?: number;
  onPortionChange?: (newSize: number) => void;
  isPlaced?: boolean;
  connectionSides?: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  position?: { x: number; y: number };
  isValidConnection?: boolean;
  connectedTo?: string[];
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

// Puzzle piece edge types
type EdgeType = 'tab' | 'blank' | 'slot';

// Generate consistent puzzle edges based on food ID
function getPuzzleEdges(fdcId: number): { top: EdgeType; right: EdgeType; bottom: EdgeType; left: EdgeType } {
  // Use food ID to generate consistent but varied edge patterns
  const hash = fdcId % 16;
  return {
    top: hash & 1 ? 'tab' : hash & 2 ? 'slot' : 'blank',
    right: hash & 4 ? 'tab' : hash & 8 ? 'slot' : 'blank',
    bottom: (hash & 1) === 0 ? 'tab' : (hash & 2) === 0 ? 'slot' : 'blank',
    left: (hash & 4) === 0 ? 'tab' : (hash & 8) === 0 ? 'slot' : 'blank'
  };
}

// Check if two edges can connect
function canConnect(edge1: EdgeType, edge2: EdgeType): boolean {
  return (edge1 === 'tab' && edge2 === 'slot') || (edge1 === 'slot' && edge2 === 'tab');
}

export function PuzzleFoodBlock({
  food,
  portionSize = 1,
  onPortionChange,
  isPlaced = false,
  connectionSides = { top: false, right: false, bottom: false, left: false },
  position,
  isValidConnection = true,
  connectedTo = []
}: PuzzleFoodBlockProps) {
  const [showNutrition, setShowNutrition] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: `puzzle-${food.fdcId}`,
    data: {
      type: 'puzzle-food',
      food: food,
      edges: getPuzzleEdges(food.fdcId)
    },
    disabled: isPlaced && connectedTo.length > 0 // Can't drag if connected to other pieces
  });

  const categoryColor = categoryColors[food.category];
  const categoryIcon = categoryIcons[food.category];
  const ageInfo = ageIndicators[food.ageGroup];
  const edges = getPuzzleEdges(food.fdcId);
  
  // Calculate nutrition based on portion size
  const getNutrientValue = (nutrientAmount: number | undefined) => {
    return ((nutrientAmount ?? 0) * portionSize).toFixed(1);
  };
  
  const iron = parseFloat(getNutrientValue(food.nutrients.iron?.amount));
  const protein = parseFloat(getNutrientValue(food.nutrients.protein?.amount));
  const calcium = parseFloat(getNutrientValue(food.nutrients.calcium?.amount));

  const style = {
    ...(transform ? {
      transform: CSS.Transform.toString(transform),
    } : {}),
    ...(position && isPlaced ? {
      position: 'absolute' as const,
      left: position.x,
      top: position.y,
    } : {})
  };

  // Create puzzle piece SVG path
  const createPuzzlePath = () => {
    const size = 180;
    const tabSize = 30;
    const mid = size / 2;
    
    let path = `M 20 20`; // Start at top-left (with padding)
    
    // Top edge
    if (edges.top === 'tab') {
      path += ` L ${mid - tabSize/2} 20`;
      path += ` C ${mid - tabSize/2} 5, ${mid + tabSize/2} 5, ${mid + tabSize/2} 20`;
      path += ` L ${size - 20} 20`;
    } else if (edges.top === 'slot') {
      path += ` L ${mid - tabSize/2} 20`;
      path += ` C ${mid - tabSize/2} 35, ${mid + tabSize/2} 35, ${mid + tabSize/2} 20`;
      path += ` L ${size - 20} 20`;
    } else {
      path += ` L ${size - 20} 20`;
    }
    
    // Right edge
    if (edges.right === 'tab') {
      path += ` L ${size - 20} ${mid - tabSize/2}`;
      path += ` C ${size - 5} ${mid - tabSize/2}, ${size - 5} ${mid + tabSize/2}, ${size - 20} ${mid + tabSize/2}`;
      path += ` L ${size - 20} ${size - 20}`;
    } else if (edges.right === 'slot') {
      path += ` L ${size - 20} ${mid - tabSize/2}`;
      path += ` C ${size - 35} ${mid - tabSize/2}, ${size - 35} ${mid + tabSize/2}, ${size - 20} ${mid + tabSize/2}`;
      path += ` L ${size - 20} ${size - 20}`;
    } else {
      path += ` L ${size - 20} ${size - 20}`;
    }
    
    // Bottom edge
    if (edges.bottom === 'tab') {
      path += ` L ${mid + tabSize/2} ${size - 20}`;
      path += ` C ${mid + tabSize/2} ${size - 5}, ${mid - tabSize/2} ${size - 5}, ${mid - tabSize/2} ${size - 20}`;
      path += ` L 20 ${size - 20}`;
    } else if (edges.bottom === 'slot') {
      path += ` L ${mid + tabSize/2} ${size - 20}`;
      path += ` C ${mid + tabSize/2} ${size - 35}, ${mid - tabSize/2} ${size - 35}, ${mid - tabSize/2} ${size - 20}`;
      path += ` L 20 ${size - 20}`;
    } else {
      path += ` L 20 ${size - 20}`;
    }
    
    // Left edge
    if (edges.left === 'tab') {
      path += ` L 20 ${mid + tabSize/2}`;
      path += ` C 5 ${mid + tabSize/2}, 5 ${mid - tabSize/2}, 20 ${mid - tabSize/2}`;
      path += ` L 20 20`;
    } else if (edges.left === 'slot') {
      path += ` L 20 ${mid + tabSize/2}`;
      path += ` C 35 ${mid + tabSize/2}, 35 ${mid - tabSize/2}, 20 ${mid - tabSize/2}`;
      path += ` L 20 20`;
    } else {
      path += ` L 20 20`;
    }
    
    path += ` Z`; // Close path
    return path;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...((!isPlaced || connectedTo.length === 0) ? { ...listeners, ...attributes } : {})}
      className={`
        relative select-none transition-all duration-300
        ${isDragging ? 'z-50 scale-110 rotate-3' : 'z-10'}
        ${isPlaced ? 'shadow-2xl' : ''}
        ${!isValidConnection && isPlaced ? 'animate-pulse ring-4 ring-red-400' : ''}
        ${connectedTo.length > 0 ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
      `}
      onMouseEnter={() => setShowNutrition(true)}
      onMouseLeave={() => setShowNutrition(false)}
    >
      {/* Puzzle piece SVG background */}
      <svg 
        className="absolute inset-0 w-[200px] h-[200px]" 
        viewBox="0 0 200 200"
        style={{ filter: isDragging ? 'drop-shadow(0 20px 25px rgb(0 0 0 / 0.3))' : 'drop-shadow(0 4px 6px rgb(0 0 0 / 0.1))' }}
      >
        <defs>
          <linearGradient id={`grad-${food.fdcId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: categoryColor, stopOpacity: 0.1 }} />
            <stop offset="100%" style={{ stopColor: categoryColor, stopOpacity: 0.2 }} />
          </linearGradient>
        </defs>
        
        {/* Main puzzle piece */}
        <path
          d={createPuzzlePath()}
          fill={`url(#grad-${food.fdcId})`}
          stroke={categoryColor}
          strokeWidth={isPlaced && connectedTo.length > 0 ? "3" : "2"}
          className={`
            ${isDragging ? 'opacity-90' : 'opacity-100'}
            ${connectionSides.top || connectionSides.right || connectionSides.bottom || connectionSides.left 
              ? 'filter brightness-110' : ''}
          `}
        />
        
        {/* Connection indicators */}
        {isPlaced && (
          <>
            {connectionSides.top && (
              <circle cx="100" cy="20" r="4" fill="#10b981" className="animate-pulse" />
            )}
            {connectionSides.right && (
              <circle cx="180" cy="100" r="4" fill="#10b981" className="animate-pulse" />
            )}
            {connectionSides.bottom && (
              <circle cx="100" cy="180" r="4" fill="#10b981" className="animate-pulse" />
            )}
            {connectionSides.left && (
              <circle cx="20" cy="100" r="4" fill="#10b981" className="animate-pulse" />
            )}
          </>
        )}
      </svg>

      {/* Content inside puzzle piece */}
      <div className="relative p-6 w-[200px] h-[200px] flex flex-col justify-center items-center">
        {/* Age indicator */}
        <div 
          className="absolute top-6 right-6 px-2 py-1 rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: ageInfo.color }}
        >
          {ageInfo.text}
        </div>
        
        {/* Food icon and name */}
        <div className="text-center mb-2">
          <div className="text-3xl mb-1">
            {categoryIcon}
          </div>
          <h3 className="font-semibold text-xs text-gray-800 leading-tight">
            {food.shortName || food.name.substring(0, 20)}
          </h3>
        </div>
        
        {/* Portion size for placed pieces */}
        {isPlaced && onPortionChange && (
          <div className="flex gap-1 mb-2">
            {[0.5, 1, 1.5, 2].map(size => (
              <button
                key={size}
                onClick={(e) => {
                  e.stopPropagation();
                  onPortionChange(size);
                }}
                className={`
                  w-5 h-5 rounded-full text-xs font-bold transition-all
                  ${size === portionSize 
                    ? 'bg-blue-500 text-white scale-110' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }
                `}
                style={{ fontSize: '10px' }}
              >
                {size === 0.5 ? '½' : size}
              </button>
            ))}
          </div>
        )}
        
        {/* Quick nutrition for placed pieces */}
        {isPlaced && (
          <div className="text-xs space-y-1">
            {iron > 0.5 && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-600">Fe</span>
                <span className="font-bold text-red-600">{iron}mg</span>
              </div>
            )}
            {protein > 1 && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-600">Pro</span>
                <span className="font-bold text-purple-600">{protein}g</span>
              </div>
            )}
          </div>
        )}

        {/* Connection status */}
        {isPlaced && connectedTo.length > 0 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              🔗 {connectedTo.length}
            </div>
          </div>
        )}
      </div>

      {/* Hover nutrition tooltip */}
      {showNutrition && !isPlaced && (
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white p-2 rounded-lg text-xs whitespace-nowrap z-50">
          <div className="font-bold mb-1">{food.name}</div>
          <div>Iron: {iron}mg | Protein: {protein}g | Calcium: {calcium}mg</div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="border-8 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}