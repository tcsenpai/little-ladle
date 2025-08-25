import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Food } from '../types/food';
import { categoryColors } from '../data/foodData';

interface ScratchFoodBlockProps {
  food: Food;
  size?: number;
  isPlaced?: boolean;
  isDragging?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  portionSize?: number;
  onPortionChange?: (newSize: number) => void;
  blockId?: string;
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

const ageIndicators = {
  '6+ months': { color: '#28A745', text: '6m+' },
  '8+ months': { color: '#6FB83F', text: '8m+' },
  '12+ months': { color: '#FFC107', text: '12m+' }
} as const;

export function ScratchFoodBlock({
  food,
  size = 120,
  isPlaced = false,
  isDragging = false,
  isSelected = false,
  onClick,
  portionSize = 1,
  onPortionChange,
  blockId
}: ScratchFoodBlockProps) {
  const [dragState, setDragState] = React.useState<{
    isDragging: boolean;
    startPos: { x: number; y: number } | null;
    startTime: number | null;
  }>({ isDragging: false, startPos: null, startTime: null });
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: isPlaced ? `placed-${blockId}` : `scratch-${food.fdcId}`,
    data: {
      type: isPlaced ? 'placed-food' : 'scratch-food',
      food: food,
      isPlaced: isPlaced,
      blockId: blockId
    },
    disabled: false // Always allow dragging
  });

  const categoryColor = categoryColors[food.category];
  const categoryIcon = categoryIcons[food.category];
  const ageInfo = ageIndicators[food.ageGroup];
  
  const style = {
    width: size,
    height: size * 0.7, // Scratch blocks are more rectangular
    ...(transform ? {
      transform: CSS.Transform.toString(transform),
    } : {}),
  };

  // Scratch-style block shape (no complex puzzle edges)
  const createScratchPath = () => {
    const w = size;
    const h = size * 0.7;
    const notchSize = 8;
    const cornerRadius = 8;
    
    // Simple Scratch-like block with notches for connection
    let path = `M ${cornerRadius} 0`;
    
    // Top edge with input notch (left side)
    path += ` L ${w/3 - notchSize} 0`;
    path += ` L ${w/3} ${notchSize}`;
    path += ` L ${w/3 + notchSize*2} ${notchSize}`;
    path += ` L ${w/3 + notchSize*3} 0`;
    path += ` L ${w - cornerRadius} 0`;
    
    // Top-right corner
    path += ` Q ${w} 0 ${w} ${cornerRadius}`;
    
    // Right edge
    path += ` L ${w} ${h - cornerRadius}`;
    
    // Bottom-right corner  
    path += ` Q ${w} ${h} ${w - cornerRadius} ${h}`;
    
    // Bottom edge with output notch
    path += ` L ${w/2 + notchSize*1.5} ${h}`;
    path += ` L ${w/2 + notchSize*0.5} ${h - notchSize}`;
    path += ` L ${w/2 - notchSize*0.5} ${h - notchSize}`;
    path += ` L ${w/2 - notchSize*1.5} ${h}`;
    path += ` L ${cornerRadius} ${h}`;
    
    // Bottom-left corner
    path += ` Q 0 ${h} 0 ${h - cornerRadius}`;
    
    // Left edge
    path += ` L 0 ${cornerRadius}`;
    
    // Top-left corner
    path += ` Q 0 0 ${cornerRadius} 0`;
    
    path += ` Z`;
    return path;
  };

  // Get key nutrients for quick display
  const iron = food.nutrients.iron?.amount ?? 0;
  const protein = food.nutrients.protein?.amount ?? 0;
  const calories = food.nutrients.calories?.amount ?? 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onMouseDown={(e) => {
        if (!isPlaced) {
          setDragState({
            isDragging: true,
            startPos: { x: e.clientX, y: e.clientY },
            startTime: Date.now()
          });
        }
      }}
      onMouseUp={(e) => {
        if (!isPlaced && dragState.startPos && dragState.startTime) {
          const endTime = Date.now();
          const distance = Math.sqrt(
            Math.pow(e.clientX - dragState.startPos.x, 2) + 
            Math.pow(e.clientY - dragState.startPos.y, 2)
          );
          const duration = endTime - dragState.startTime;
          
          // Only trigger click if it was a quick, short movement (not a drag)
          if (duration < 300 && distance < 10) {
            console.log('Sidebar block clicked (not dragged):', food.name);
            if (onClick) {
              onClick();
            }
          }
        }
        setDragState({ isDragging: false, startPos: null, startTime: null });
      }}
      onClick={(e) => {
        // Only handle click for placed blocks
        if (isPlaced) {
          e.preventDefault();
          e.stopPropagation();
          console.log('Placed block clicked:', food.name);
          if (onClick) {
            onClick();
          }
        }
        // For non-placed blocks, clicks are handled in onMouseUp to distinguish from drags
      }}
      className={`
        relative cursor-pointer select-none
        transition-all duration-200
        ${isDragging ? 'opacity-50' : ''}
        ${isSelected ? 'ring-4 ring-blue-400 ring-offset-2 rounded-lg' : ''}
        ${!isDragging ? 'hover:scale-[1.02]' : ''}
        ${isPlaced ? 'cursor-move' : 'cursor-grab active:cursor-grabbing'}
      `}
    >
      {/* Scratch-style block SVG */}
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox={`0 0 ${size} ${size * 0.7}`}
        style={{ 
          filter: isDragging 
            ? 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.3))' 
            : 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))'
        }}
      >
        <defs>
          {/* Scratch-style gradient */}
          <linearGradient id={`scratch-grad-${food.fdcId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: categoryColor }} />
            <stop offset="100%" style={{ stopColor: categoryColor, stopOpacity: 0.8 }} />
          </linearGradient>
          
          {/* Inner highlight */}
          <linearGradient id={`highlight-${food.fdcId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.4 }} />
            <stop offset="50%" style={{ stopColor: '#ffffff', stopOpacity: 0.1 }} />
            <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 0.1 }} />
          </linearGradient>
        </defs>
        
        {/* Main block */}
        <path
          d={createScratchPath()}
          fill={`url(#scratch-grad-${food.fdcId})`}
          stroke="none"
        />
        
        {/* Inner highlight for 3D effect */}
        <path
          d={createScratchPath()}
          fill={`url(#highlight-${food.fdcId})`}
        />
      </svg>

      {/* Content */}
      <div className="relative p-3 h-full flex flex-col justify-center text-white">
        {/* Age indicator */}
        <div 
          className="absolute top-1 right-2 px-1.5 py-0.5 rounded text-xs font-bold"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: ageInfo.color }}
        >
          {ageInfo.text}
        </div>
        
        {/* Main content */}
        <div className="flex items-center gap-2">
          <div className="text-2xl flex-shrink-0">
            {categoryIcon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm leading-tight">
              {food.shortName || food.name.substring(0, 20)}
            </div>
            <div className="text-xs opacity-90 capitalize">
              {food.category}
            </div>
          </div>
        </div>
        
        {/* Quick nutrition info */}
        {isPlaced && (
          <div className="mt-2 text-xs opacity-90">
            {calories > 0 && <div>{Math.round(calories * portionSize)} cal</div>}
            {iron > 0.5 && <div>{(iron * portionSize).toFixed(1)}mg Fe</div>}
            {protein > 2 && <div>{(protein * portionSize).toFixed(1)}g protein</div>}
          </div>
        )}
        
        {/* Portion controls for placed pieces */}
        {isPlaced && onPortionChange && (
          <div className="absolute bottom-1 right-1 flex gap-1">
            {[0.5, 1, 1.5, 2].map(size => (
              <button
                key={size}
                onClick={(e) => {
                  e.stopPropagation();
                  onPortionChange(size);
                }}
                className={`
                  w-5 h-5 rounded text-xs font-bold transition-all
                  ${size === portionSize 
                    ? 'bg-white text-gray-800 scale-110' 
                    : 'bg-gray-800 bg-opacity-50 text-white hover:bg-opacity-70'
                  }
                `}
                style={{ fontSize: '10px' }}
              >
                {size === 0.5 ? '½' : size}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}