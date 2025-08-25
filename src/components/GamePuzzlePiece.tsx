import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Food } from '../types/food';
import { categoryColors } from '../data/foodData';

interface GamePuzzlePieceProps {
  food: Food;
  size?: number;
  isPlaced?: boolean;
  isDragging?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  portionSize?: number;
  edges: {
    top: 'tab' | 'blank' | 'slot';
    right: 'tab' | 'blank' | 'slot';
    bottom: 'tab' | 'blank' | 'slot';
    left: 'tab' | 'blank' | 'slot';
  };
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

export function GamePuzzlePiece({
  food,
  size = 80,
  isPlaced = false,
  isDragging = false,
  isSelected = false,
  onClick,
  portionSize = 1,
  edges
}: GamePuzzlePieceProps) {
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: `puzzle-${food.fdcId}`,
    data: {
      type: 'puzzle-food',
      food: food,
      edges: edges
    },
    disabled: isPlaced
  });

  const categoryColor = categoryColors[food.category];
  const categoryIcon = categoryIcons[food.category];
  
  const style = {
    width: size,
    height: size,
    ...(transform ? {
      transform: CSS.Transform.toString(transform),
    } : {}),
  };

  // Create game-style puzzle piece SVG path
  const createPuzzlePath = () => {
    const tabSize = size * 0.25; // 25% of piece size
    const mid = size / 2;
    const padding = 2;
    
    let path = `M ${padding} ${padding}`; // Start at top-left
    
    // Top edge with smoother curves
    if (edges.top === 'tab') {
      path += ` L ${mid - tabSize/2} ${padding}`;
      path += ` Q ${mid - tabSize/2} ${-tabSize/3}, ${mid} ${-tabSize/3}`;
      path += ` Q ${mid + tabSize/2} ${-tabSize/3}, ${mid + tabSize/2} ${padding}`;
      path += ` L ${size - padding} ${padding}`;
    } else if (edges.top === 'slot') {
      path += ` L ${mid - tabSize/2} ${padding}`;
      path += ` Q ${mid - tabSize/2} ${tabSize/2}, ${mid} ${tabSize/2}`;
      path += ` Q ${mid + tabSize/2} ${tabSize/2}, ${mid + tabSize/2} ${padding}`;
      path += ` L ${size - padding} ${padding}`;
    } else {
      path += ` L ${size - padding} ${padding}`;
    }
    
    // Right edge
    if (edges.right === 'tab') {
      path += ` L ${size - padding} ${mid - tabSize/2}`;
      path += ` Q ${size + tabSize/3} ${mid - tabSize/2}, ${size + tabSize/3} ${mid}`;
      path += ` Q ${size + tabSize/3} ${mid + tabSize/2}, ${size - padding} ${mid + tabSize/2}`;
      path += ` L ${size - padding} ${size - padding}`;
    } else if (edges.right === 'slot') {
      path += ` L ${size - padding} ${mid - tabSize/2}`;
      path += ` Q ${size - tabSize/2} ${mid - tabSize/2}, ${size - tabSize/2} ${mid}`;
      path += ` Q ${size - tabSize/2} ${mid + tabSize/2}, ${size - padding} ${mid + tabSize/2}`;
      path += ` L ${size - padding} ${size - padding}`;
    } else {
      path += ` L ${size - padding} ${size - padding}`;
    }
    
    // Bottom edge (reversed for proper connection)
    if (edges.bottom === 'tab') {
      path += ` L ${mid + tabSize/2} ${size - padding}`;
      path += ` Q ${mid + tabSize/2} ${size + tabSize/3}, ${mid} ${size + tabSize/3}`;
      path += ` Q ${mid - tabSize/2} ${size + tabSize/3}, ${mid - tabSize/2} ${size - padding}`;
      path += ` L ${padding} ${size - padding}`;
    } else if (edges.bottom === 'slot') {
      path += ` L ${mid + tabSize/2} ${size - padding}`;
      path += ` Q ${mid + tabSize/2} ${size - tabSize/2}, ${mid} ${size - tabSize/2}`;
      path += ` Q ${mid - tabSize/2} ${size - tabSize/2}, ${mid - tabSize/2} ${size - padding}`;
      path += ` L ${padding} ${size - padding}`;
    } else {
      path += ` L ${padding} ${size - padding}`;
    }
    
    // Left edge
    if (edges.left === 'tab') {
      path += ` L ${padding} ${mid + tabSize/2}`;
      path += ` Q ${-tabSize/3} ${mid + tabSize/2}, ${-tabSize/3} ${mid}`;
      path += ` Q ${-tabSize/3} ${mid - tabSize/2}, ${padding} ${mid - tabSize/2}`;
      path += ` L ${padding} ${padding}`;
    } else if (edges.left === 'slot') {
      path += ` L ${padding} ${mid + tabSize/2}`;
      path += ` Q ${tabSize/2} ${mid + tabSize/2}, ${tabSize/2} ${mid}`;
      path += ` Q ${tabSize/2} ${mid - tabSize/2}, ${padding} ${mid - tabSize/2}`;
      path += ` L ${padding} ${padding}`;
    } else {
      path += ` L ${padding} ${padding}`;
    }
    
    path += ` Z`; // Close path
    return path;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick && !isPlaced) onClick();
      }}
      className={`
        relative cursor-grab active:cursor-grabbing
        transition-transform duration-200
        ${isDragging ? 'z-50 scale-110' : ''}
        ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2 rounded-lg' : ''}
        ${!isPlaced ? 'hover:scale-105' : ''}
      `}
    >
      {/* Game-style puzzle piece SVG */}
      <svg 
        className="absolute inset-0" 
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ 
          filter: isDragging 
            ? 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.4))' 
            : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
        }}
      >
        <defs>
          {/* Game-style gradient */}
          <linearGradient id={`game-grad-${food.fdcId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.9 }} />
            <stop offset="50%" style={{ stopColor: categoryColor, stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: categoryColor, stopOpacity: 1 }} />
          </linearGradient>
          
          {/* Inner shadow for depth */}
          <filter id={`inner-shadow-${food.fdcId}`}>
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="1" result="offsetblur"/>
            <feFlood floodColor="#000000" floodOpacity="0.2"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main puzzle piece with game aesthetics */}
        <path
          d={createPuzzlePath()}
          fill={`url(#game-grad-${food.fdcId})`}
          stroke={categoryColor}
          strokeWidth="2"
          filter={`url(#inner-shadow-${food.fdcId})`}
          className={`
            ${isDragging ? 'opacity-90' : 'opacity-100'}
          `}
        />
        
        {/* Glossy overlay for game feel */}
        <path
          d={createPuzzlePath()}
          fill="url(#gloss)"
          opacity="0.3"
        />
        
        <defs>
          <linearGradient id="gloss" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.6 }} />
            <stop offset="50%" style={{ stopColor: '#ffffff', stopOpacity: 0.1 }} />
            <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
      </svg>

      {/* Minimal content for smaller pieces */}
      <div className="relative flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-2xl">
            {categoryIcon}
          </div>
          {isPlaced && (
            <div className="text-xs font-bold text-gray-700 mt-1">
              {portionSize}x
            </div>
          )}
        </div>
      </div>
    </div>
  );
}