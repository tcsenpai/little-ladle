import React, { useRef, useEffect, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { DraggableFoodBlock } from './DraggableFoodBlock';
import { Food } from '../types/food';

interface MealFood extends Food {
  id: string;
  portionSize: number;
  position: { x: number; y: number };
}

interface ConnectionLine {
  from: string;
  to: string;
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
}

interface MealCanvasProps {
  mealFoods: MealFood[];
  onPortionChange: (foodId: string, newSize: number) => void;
  onRemoveFood: (foodId: string) => void;
  onPositionChange: (foodId: string, position: { x: number; y: number }) => void;
  onInfoClick?: (food: Food) => void;
}

export function MealCanvas({ mealFoods, onPortionChange, onRemoveFood, onPositionChange, onInfoClick }: MealCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [connections, setConnections] = useState<ConnectionLine[]>([]);
  
  const GRID_SIZE = 40;
  const BLOCK_WIDTH = 200;
  const BLOCK_HEIGHT = 180;
  const CONNECTION_DISTANCE = 280; // Distance to show connections
  
  const { isOver, setNodeRef } = useDroppable({
    id: 'meal-canvas',
  });

  // Grid snapping function
  const snapToGrid = (x: number, y: number): { x: number; y: number } => {
    return {
      x: Math.round(x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(y / GRID_SIZE) * GRID_SIZE
    };
  };

  // Collision detection function
  const checkCollision = (newPos: { x: number; y: number }, excludeId?: string): boolean => {
    return mealFoods.some(food => {
      if (food.id === excludeId) return false;
      
      const dx = Math.abs(newPos.x - food.position.x);
      const dy = Math.abs(newPos.y - food.position.y);
      
      return dx < BLOCK_WIDTH && dy < BLOCK_HEIGHT;
    });
  };

  // Find nearest valid position
  const findValidPosition = (preferredPos: { x: number; y: number }, excludeId?: string): { x: number; y: number } => {
    let candidate = snapToGrid(preferredPos.x, preferredPos.y);
    
    if (!checkCollision(candidate, excludeId)) {
      return candidate;
    }

    // Try positions in expanding circles around the preferred position
    for (let radius = 1; radius <= 10; radius++) {
      for (let angle = 0; angle < 360; angle += 45) {
        const radian = (angle * Math.PI) / 180;
        const testPos = {
          x: preferredPos.x + Math.cos(radian) * radius * GRID_SIZE,
          y: preferredPos.y + Math.sin(radian) * radius * GRID_SIZE
        };
        
        candidate = snapToGrid(testPos.x, testPos.y);
        
        // Ensure position is within canvas bounds
        if (candidate.x >= 0 && candidate.y >= 0 && 
            candidate.x <= 800 - BLOCK_WIDTH && candidate.y <= 600 - BLOCK_HEIGHT) {
          if (!checkCollision(candidate, excludeId)) {
            return candidate;
          }
        }
      }
    }
    
    return snapToGrid(preferredPos.x, preferredPos.y); // Fallback to original position
  };

  // Calculate connections between nearby blocks
  useEffect(() => {
    const newConnections: ConnectionLine[] = [];
    
    for (let i = 0; i < mealFoods.length; i++) {
      for (let j = i + 1; j < mealFoods.length; j++) {
        const food1 = mealFoods[i];
        const food2 = mealFoods[j];
        
        const dx = food2.position.x - food1.position.x;
        const dy = food2.position.y - food1.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= CONNECTION_DISTANCE) {
          newConnections.push({
            from: food1.id,
            to: food2.id,
            fromPos: {
              x: food1.position.x + BLOCK_WIDTH / 2,
              y: food1.position.y + BLOCK_HEIGHT / 2
            },
            toPos: {
              x: food2.position.x + BLOCK_WIDTH / 2,
              y: food2.position.y + BLOCK_HEIGHT / 2
            }
          });
        }
      }
    }
    
    setConnections(newConnections);
  }, [mealFoods]);

  // Handle block repositioning
  const handleBlockMove = (foodId: string, newPos: { x: number; y: number }) => {
    const validPosition = findValidPosition(newPos, foodId);
    onPositionChange(foodId, validPosition);
  };
  
  // Calculate total nutrition
  const totalNutrition = mealFoods.reduce((total, mealFood) => {
    const multiplier = mealFood.portionSize;
    return {
      calories: total.calories + ((mealFood.nutrients.calories?.amount ?? 0) * multiplier),
      iron: total.iron + ((mealFood.nutrients.iron?.amount ?? 0) * multiplier),
      protein: total.protein + ((mealFood.nutrients.protein?.amount ?? 0) * multiplier),
      calcium: total.calcium + ((mealFood.nutrients.calcium?.amount ?? 0) * multiplier),
      fat: total.fat + ((mealFood.nutrients.fat?.amount ?? 0) * multiplier),
      carbs: total.carbs + ((mealFood.nutrients.carbs?.amount ?? 0) * multiplier)
    };
  }, {
    calories: 0,
    iron: 0, 
    protein: 0,
    calcium: 0,
    fat: 0,
    carbs: 0
  });

  // Nutrition targets for 7-month-old (approximate daily values)
  const targets = {
    calories: { target: 600, color: '#FF6B6B' },
    iron: { target: 11, color: '#DC3545' },
    protein: { target: 12, color: '#845EC2' },
    calcium: { target: 260, color: '#4ECDC4' }
  };

  const getNutritionProgress = (current: number, target: number) => {
    const percentage = Math.min((current / target) * 100, 100);
    return {
      percentage,
      status: percentage >= 80 ? 'excellent' : 
              percentage >= 60 ? 'good' : 
              percentage >= 40 ? 'okay' : 
              percentage >= 20 ? 'low' : 'missing'
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 min-h-[400px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🍽️ Sophie's Meal
          </h2>
          <div className="text-sm text-gray-600">
            {mealFoods.length} food{mealFoods.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Meal Canvas Area */}
        <div className="lg:col-span-2">
          <div
            ref={(el) => {
              setNodeRef(el);
              canvasRef.current = el;
            }}
            className={`
              relative min-h-[600px] p-4 rounded-lg border-2 border-dashed transition-all duration-200 overflow-hidden
              ${isOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 bg-gray-50'
              }
            `}
            style={{
              backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
              backgroundPosition: `${GRID_SIZE/2}px ${GRID_SIZE/2}px`
            }}
          >
            {/* Connection Lines SVG */}
            {connections.length > 0 && (
              <svg 
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 5 }}
              >
                <defs>
                  <marker
                    id="connection-dot"
                    markerWidth="4"
                    markerHeight="4"
                    refX="2"
                    refY="2"
                  >
                    <circle cx="2" cy="2" r="2" fill="#6366f1" />
                  </marker>
                </defs>
                {connections.map((conn, index) => (
                  <line
                    key={`${conn.from}-${conn.to}`}
                    x1={conn.fromPos.x}
                    y1={conn.fromPos.y}
                    x2={conn.toPos.x}
                    y2={conn.toPos.y}
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.6"
                    markerStart="url(#connection-dot)"
                    markerEnd="url(#connection-dot)"
                  />
                ))}
              </svg>
            )}
            
            {mealFoods.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-lg font-medium mb-2">Drag food blocks here!</p>
                <p className="text-sm text-center max-w-xs">
                  Create Sophie's meal by dragging food blocks from the left panel. Blocks will snap to grid and connect automatically!
                </p>
              </div>
            ) : (
              mealFoods.map((mealFood) => (
                <div key={mealFood.id} className="absolute" style={{ zIndex: 10 }}>
                  <DraggableFoodBlock
                    food={mealFood}
                    portionSize={mealFood.portionSize}
                    onPortionChange={(newSize) => onPortionChange(mealFood.id, newSize)}
                    showNutritionPreview={true}
                    isInMeal={true}
                    position={mealFood.position}
                    onInfoClick={onInfoClick}
                  />
                  
                  {/* Remove button */}
                  <button
                    onClick={() => onRemoveFood(mealFood.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors shadow-sm z-20"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Nutrition Dashboard */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              📊 Nutrition Dashboard
            </h3>
            
            {mealFoods.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-sm">Add foods to see nutrition analysis</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Key nutrients */}
                {Object.entries(targets).map(([nutrient, config]) => {
                  const current = totalNutrition[nutrient as keyof typeof totalNutrition];
                  const progress = getNutritionProgress(current, config.target);
                  
                  return (
                    <div key={nutrient} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {nutrient}
                        </span>
                        <span className="text-sm font-bold" style={{ color: config.color }}>
                          {current.toFixed(1)}{nutrient === 'calories' ? '' : nutrient === 'protein' || nutrient === 'fat' || nutrient === 'carbs' ? 'g' : 'mg'} / {config.target}{nutrient === 'calories' ? '' : nutrient === 'protein' || nutrient === 'fat' || nutrient === 'carbs' ? 'g' : 'mg'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${progress.percentage}%`,
                            backgroundColor: config.color
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 text-right">
                        {progress.percentage.toFixed(0)}% of daily target
                      </div>
                    </div>
                  );
                })}

                {/* Overall meal assessment */}
                <div className="mt-6 p-3 rounded-lg bg-white border border-gray-200">
                  <div className="text-sm font-medium text-gray-800 mb-2">Meal Assessment:</div>
                  {mealFoods.length >= 3 ? (
                    <div className="text-green-700 text-sm flex items-center gap-1">
                      <span>✅</span> Good variety! This looks like a balanced meal for Sophie.
                    </div>
                  ) : mealFoods.length >= 2 ? (
                    <div className="text-yellow-700 text-sm flex items-center gap-1">
                      <span>⚠️</span> Try adding one more food for better balance.
                    </div>
                  ) : (
                    <div className="text-gray-600 text-sm flex items-center gap-1">
                      <span>🎯</span> Add more foods to create a balanced meal.
                    </div>
                  )}
                </div>

                {/* Clear meal button */}
                <button
                  onClick={() => mealFoods.forEach(food => onRemoveFood(food.id))}
                  className="w-full mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                >
                  Clear Meal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate optimal position for new food item
export const getOptimalPosition = (
  mealFoods: MealFood[], 
  canvasWidth: number = 800, 
  canvasHeight: number = 600
): { x: number; y: number } => {
  const GRID_SIZE = 40;
  const BLOCK_WIDTH = 200;
  const BLOCK_HEIGHT = 180;
  
  if (mealFoods.length === 0) {
    return { x: GRID_SIZE * 2, y: GRID_SIZE * 2 };
  }
  
  // Try to place new items in a flowing layout
  for (let row = 0; row < Math.floor(canvasHeight / (BLOCK_HEIGHT + GRID_SIZE)); row++) {
    for (let col = 0; col < Math.floor(canvasWidth / (BLOCK_WIDTH + GRID_SIZE)); col++) {
      const candidate = {
        x: col * (BLOCK_WIDTH + GRID_SIZE) + GRID_SIZE,
        y: row * (BLOCK_HEIGHT + GRID_SIZE) + GRID_SIZE
      };
      
      const hasCollision = mealFoods.some(food => {
        const dx = Math.abs(candidate.x - food.position.x);
        const dy = Math.abs(candidate.y - food.position.y);
        return dx < BLOCK_WIDTH && dy < BLOCK_HEIGHT;
      });
      
      if (!hasCollision) {
        return candidate;
      }
    }
  }
  
  // Fallback to right of last item
  const lastFood = mealFoods[mealFoods.length - 1];
  return {
    x: lastFood.position.x + BLOCK_WIDTH + GRID_SIZE,
    y: lastFood.position.y
  };
};