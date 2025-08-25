import React, { useState, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Food } from '../types/food';

interface PuzzlePiece {
  id: string;
  food: Food;
  position: { x: number; y: number };
  gridPosition: { row: number; col: number };
  portionSize: number;
  connectedTo: string[];
  edges: {
    top: 'tab' | 'blank' | 'slot';
    right: 'tab' | 'blank' | 'slot';
    bottom: 'tab' | 'blank' | 'slot';
    left: 'tab' | 'blank' | 'slot';
  };
}

interface PuzzleMealCanvasProps {
  pieces: PuzzlePiece[];
  onPiecePlace: (food: Food, gridPosition: { row: number; col: number }) => void;
  onPieceRemove: (pieceId: string) => void;
  onPortionChange: (pieceId: string, newSize: number) => void;
  onClearAll: () => void;
}

const GRID_SIZE = 100; // Size of each grid cell in pixels
const GRID_ROWS = 4;
const GRID_COLS = 6;

export function PuzzleMealCanvas({
  pieces,
  onPiecePlace,
  onPieceRemove,
  onPortionChange,
  onClearAll
}: PuzzleMealCanvasProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [connectionPreview, setConnectionPreview] = useState<string[]>([]);
  
  const { isOver, setNodeRef, active } = useDroppable({
    id: 'puzzle-canvas',
  });

  // Calculate total nutrition from connected pieces
  const calculateNutrition = useCallback(() => {
    const connectedGroups: Set<Set<string>> = new Set();
    
    // Group connected pieces
    pieces.forEach(piece => {
      if (piece.connectedTo.length > 0) {
        let foundGroup = false;
        connectedGroups.forEach(group => {
          if (piece.connectedTo.some(id => group.has(id))) {
            group.add(piece.id);
            piece.connectedTo.forEach(id => group.add(id));
            foundGroup = true;
          }
        });
        if (!foundGroup) {
          const newGroup = new Set([piece.id, ...piece.connectedTo]);
          connectedGroups.add(newGroup);
        }
      }
    });

    // Calculate nutrition for the largest connected group
    let largestGroup: string[] = [];
    connectedGroups.forEach(group => {
      if (group.size > largestGroup.length) {
        largestGroup = Array.from(group);
      }
    });

    const relevantPieces = largestGroup.length > 0 
      ? pieces.filter(p => largestGroup.includes(p.id))
      : pieces;

    return relevantPieces.reduce((total, piece) => {
      const multiplier = piece.portionSize;
      return {
        calories: total.calories + ((piece.food.nutrients.calories?.amount ?? 0) * multiplier),
        iron: total.iron + ((piece.food.nutrients.iron?.amount ?? 0) * multiplier),
        protein: total.protein + ((piece.food.nutrients.protein?.amount ?? 0) * multiplier),
        calcium: total.calcium + ((piece.food.nutrients.calcium?.amount ?? 0) * multiplier),
        connected: largestGroup.length
      };
    }, {
      calories: 0,
      iron: 0,
      protein: 0,
      calcium: 0,
      connected: 0
    });
  }, [pieces]);

  const nutrition = calculateNutrition();

  // Check if a grid position is occupied
  const isOccupied = (row: number, col: number) => {
    return pieces.some(p => p.gridPosition.row === row && p.gridPosition.col === col);
  };

  // Find valid connection points for the active piece
  const findValidConnections = useCallback((edges: any) => {
    const validCells: string[] = [];
    
    pieces.forEach(piece => {
      const { row, col } = piece.gridPosition;
      
      // Check top connection
      if (!isOccupied(row - 1, col) && canConnect(edges.bottom, piece.edges.top)) {
        validCells.push(`${row - 1}-${col}`);
      }
      // Check right connection
      if (!isOccupied(row, col + 1) && canConnect(edges.left, piece.edges.right)) {
        validCells.push(`${row}-${col + 1}`);
      }
      // Check bottom connection
      if (!isOccupied(row + 1, col) && canConnect(edges.top, piece.edges.bottom)) {
        validCells.push(`${row + 1}-${col}`);
      }
      // Check left connection
      if (!isOccupied(row, col - 1) && canConnect(edges.right, piece.edges.left)) {
        validCells.push(`${row}-${col - 1}`);
      }
    });
    
    return validCells;
  }, [pieces]);

  // Check if two edges can connect
  const canConnect = (edge1: string, edge2: string) => {
    return (edge1 === 'tab' && edge2 === 'slot') || (edge1 === 'slot' && edge2 === 'tab');
  };

  // Handle grid cell click for direct placement
  const handleCellClick = (row: number, col: number) => {
    if (!isOccupied(row, col) && active) {
      const food = active.data.current?.food;
      if (food) {
        onPiecePlace(food, { row, col });
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg border-2 border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            🧩 Sophie's Puzzle Meal
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Connect food pieces to create a balanced meal!
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pieces.length > 0 && (
            <>
              <div className="bg-white px-3 py-1 rounded-lg shadow-sm">
                <span className="text-sm font-medium text-gray-600">Pieces: </span>
                <span className="text-lg font-bold text-blue-600">{pieces.length}</span>
              </div>
              <div className="bg-white px-3 py-1 rounded-lg shadow-sm">
                <span className="text-sm font-medium text-gray-600">Connected: </span>
                <span className="text-lg font-bold text-green-600">{nutrition.connected}</span>
              </div>
              <button
                onClick={onClearAll}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-sm"
              >
                🔄 Clear Puzzle
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Puzzle Grid Area */}
        <div className="col-span-2">
          <div
            ref={setNodeRef}
            className={`
              relative bg-white rounded-lg shadow-inner
              transition-all duration-300
              ${isOver ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}
            `}
            style={{
              width: GRID_COLS * GRID_SIZE,
              height: GRID_ROWS * GRID_SIZE,
              backgroundImage: `
                repeating-linear-gradient(0deg, #e5e7eb 0px, transparent 1px, transparent ${GRID_SIZE - 1}px, #e5e7eb ${GRID_SIZE}px),
                repeating-linear-gradient(90deg, #e5e7eb 0px, transparent 1px, transparent ${GRID_SIZE - 1}px, #e5e7eb ${GRID_SIZE}px)
              `
            }}
          >
            {/* Grid cells for visual feedback */}
            {Array.from({ length: GRID_ROWS }).map((_, row) => (
              Array.from({ length: GRID_COLS }).map((_, col) => {
                const isHovered = hoveredCell?.row === row && hoveredCell?.col === col;
                const cellId = `${row}-${col}`;
                const isValidConnection = connectionPreview.includes(cellId);
                const occupied = isOccupied(row, col);
                
                return (
                  <div
                    key={cellId}
                    className={`
                      absolute border transition-all duration-200
                      ${occupied ? '' : 'hover:bg-blue-50'}
                      ${isHovered && !occupied ? 'bg-blue-100 border-blue-400' : 'border-transparent'}
                      ${isValidConnection ? 'bg-green-100 border-green-400 animate-pulse' : ''}
                    `}
                    style={{
                      left: col * GRID_SIZE,
                      top: row * GRID_SIZE,
                      width: GRID_SIZE,
                      height: GRID_SIZE
                    }}
                    onMouseEnter={() => !occupied && setHoveredCell({ row, col })}
                    onMouseLeave={() => setHoveredCell(null)}
                    onClick={() => handleCellClick(row, col)}
                  >
                    {isValidConnection && !occupied && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-green-500 text-3xl animate-bounce">✓</div>
                      </div>
                    )}
                  </div>
                );
              })
            ))}

            {/* Empty state */}
            {pieces.length === 0 && !isOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <div className="text-6xl mb-4">🧩</div>
                <p className="text-lg font-medium">Drag food pieces here</p>
                <p className="text-sm mt-2 text-center max-w-xs">
                  Pieces will snap together like a puzzle when they can connect!
                </p>
              </div>
            )}

            {/* Drag over indicator */}
            {isOver && pieces.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-blue-500 text-6xl animate-pulse">
                  <div className="bg-blue-100 rounded-full p-8">
                    ⬇️
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Connection hints */}
          {pieces.length > 0 && pieces.length < 3 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                💡 <strong>Tip:</strong> Puzzle pieces with matching edges will connect! 
                Look for tabs and slots that fit together.
              </p>
            </div>
          )}
        </div>

        {/* Nutrition & Score Panel */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              📊 Puzzle Score
            </h3>

            {pieces.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-sm">Start building to see nutrition</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Connection bonus */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">Connection Bonus</div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-8 h-8 rounded ${
                            i < nutrition.connected 
                              ? 'bg-green-500' 
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {nutrition.connected > 0 ? `+${nutrition.connected * 10}%` : '0%'}
                    </span>
                  </div>
                </div>

                {/* Nutrition bars */}
                <div className="space-y-3">
                  <NutritionBar 
                    label="Calories" 
                    value={nutrition.calories} 
                    target={150} 
                    unit="" 
                    color="#FF6B6B"
                  />
                  <NutritionBar 
                    label="Iron" 
                    value={nutrition.iron} 
                    target={3} 
                    unit="mg" 
                    color="#DC3545"
                  />
                  <NutritionBar 
                    label="Protein" 
                    value={nutrition.protein} 
                    target={4} 
                    unit="g" 
                    color="#845EC2"
                  />
                  <NutritionBar 
                    label="Calcium" 
                    value={nutrition.calcium} 
                    target={80} 
                    unit="mg" 
                    color="#4ECDC4"
                  />
                </div>

                {/* Puzzle completion message */}
                <div className="mt-4 p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="text-sm font-medium text-purple-800">
                    {nutrition.connected >= 4 ? (
                      <>🎉 Amazing puzzle! Sophie will love this balanced meal!</>
                    ) : nutrition.connected >= 2 ? (
                      <>👍 Good connections! Try adding more pieces.</>
                    ) : (
                      <>🧩 Connect the pieces to boost nutrition!</>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Nutrition bar component
function NutritionBar({ 
  label, 
  value, 
  target, 
  unit, 
  color 
}: { 
  label: string; 
  value: number; 
  target: number; 
  unit: string; 
  color: string;
}) {
  const percentage = Math.min((value / target) * 100, 100);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-700">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>
          {value.toFixed(1)}{unit} / {target}{unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
}