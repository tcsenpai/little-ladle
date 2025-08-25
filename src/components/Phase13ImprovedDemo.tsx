import React, { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragMoveEvent,
  closestCenter,
} from '@dnd-kit/core';
import { GamePuzzlePiece } from './GamePuzzlePiece';
import { GamePuzzleCanvas } from './GamePuzzleCanvas';
import { FoodInfoPanel } from './FoodInfoPanel';
import { foods, getFoodsByCategory } from '../data/foodData';
import { Food } from '../types/food';

interface PlacedPiece {
  id: string;
  food: Food;
  gridX: number;
  gridY: number;
  portionSize: number;
  edges: {
    top: 'tab' | 'blank' | 'slot';
    right: 'tab' | 'blank' | 'slot';
    bottom: 'tab' | 'blank' | 'slot';
    left: 'tab' | 'blank' | 'slot';
  };
  connections: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

const PIECE_SIZE = 80;

// Generate consistent puzzle edges based on food ID
function getPuzzleEdges(fdcId: number) {
  const hash = fdcId % 16;
  return {
    top: (hash & 1) ? 'tab' as const : (hash & 2) ? 'slot' as const : 'blank' as const,
    right: (hash & 4) ? 'tab' as const : (hash & 8) ? 'slot' as const : 'blank' as const,
    bottom: ((hash & 1) === 0) ? 'tab' as const : ((hash & 2) === 0) ? 'slot' as const : 'blank' as const,
    left: ((hash & 4) === 0) ? 'tab' as const : ((hash & 8) === 0) ? 'slot' as const : 'blank' as const
  };
}

// Check if two edges can connect
function canConnect(edge1: string, edge2: string): boolean {
  return (edge1 === 'tab' && edge2 === 'slot') || (edge1 === 'slot' && edge2 === 'tab');
}

export function Phase13ImprovedDemo() {
  const [placedPieces, setPlacedPieces] = useState<PlacedPiece[]>([]);
  const [activeCategory, setActiveCategory] = useState<Food['category'] | 'all'>('all');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [activeDragFood, setActiveDragFood] = useState<Food | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  // Filter foods by category
  const filteredFoods = activeCategory === 'all' 
    ? foods 
    : getFoodsByCategory(activeCategory);

  const categories: (Food['category'] | 'all')[] = ['all', 'fruit', 'vegetable', 'protein', 'grain', 'dairy', 'other'];
  
  const categoryNames = {
    all: 'All Foods',
    fruit: 'Fruits',
    vegetable: 'Vegetables', 
    protein: 'Proteins',
    grain: 'Grains',
    dairy: 'Dairy',
    other: 'Other'
  };

  // Find best snap position
  const findSnapPosition = useCallback((x: number, y: number, draggedEdges: any) => {
    let bestSnap = null;
    let minDistance = Infinity;
    
    placedPieces.forEach(piece => {
      // Check each side for valid connection
      const positions = [
        { x: piece.gridX - 1, y: piece.gridY, side: 'left', connects: 'right' },
        { x: piece.gridX + 1, y: piece.gridY, side: 'right', connects: 'left' },
        { x: piece.gridX, y: piece.gridY - 1, side: 'top', connects: 'bottom' },
        { x: piece.gridX, y: piece.gridY + 1, side: 'bottom', connects: 'top' },
      ];
      
      positions.forEach(pos => {
        if (!isPositionOccupied(pos.x, pos.y)) {
          const edgeKey = pos.connects as keyof typeof draggedEdges;
          const pieceEdgeKey = pos.side as keyof typeof piece.edges;
          
          if (canConnect(draggedEdges[edgeKey], piece.edges[pieceEdgeKey])) {
            const distance = Math.sqrt(Math.pow(x - pos.x * PIECE_SIZE, 2) + Math.pow(y - pos.y * PIECE_SIZE, 2));
            if (distance < minDistance && distance < PIECE_SIZE * 1.5) {
              minDistance = distance;
              bestSnap = { x: pos.x, y: pos.y, connectTo: piece.id, side: pos.side };
            }
          }
        }
      });
    });
    
    // If no snap point but canvas is empty, allow free placement
    if (!bestSnap && placedPieces.length === 0) {
      const gridX = Math.floor(x / PIECE_SIZE);
      const gridY = Math.floor(y / PIECE_SIZE);
      if (gridX >= 0 && gridX < 8 && gridY >= 0 && gridY < 5) {
        return { x: gridX, y: gridY, connectTo: null, side: null };
      }
    }
    
    return bestSnap;
  }, [placedPieces]);

  const isPositionOccupied = useCallback((x: number, y: number) => {
    return placedPieces.some(p => p.gridX === x && p.gridY === y);
  }, [placedPieces]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'puzzle-food') {
      setActiveDragFood(active.data.current.food);
    }
  };

  const handleDragMove = (event: DragMoveEvent) => {
    if (event.delta) {
      setDragPosition({ x: event.delta.x, y: event.delta.y });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveDragFood(null);
    setDragPosition(null);

    if (!over || over.id !== 'game-puzzle-canvas') return;

    if (active.data.current?.type === 'puzzle-food') {
      const food = active.data.current.food as Food;
      const edges = getPuzzleEdges(food.fdcId);
      
      // Calculate drop position relative to canvas
      // This is simplified - in production you'd calculate actual mouse position
      const dropX = Math.floor(Math.random() * 4) + 2; // Center area
      const dropY = Math.floor(Math.random() * 3) + 1;
      
      const snapPos = findSnapPosition(dropX * PIECE_SIZE, dropY * PIECE_SIZE, edges);
      
      if (snapPos) {
        const newPiece: PlacedPiece = {
          id: `piece-${food.fdcId}-${Date.now()}`,
          food: food,
          gridX: snapPos.x,
          gridY: snapPos.y,
          portionSize: 1,
          edges: edges,
          connections: {}
        };
        
        // Update connections
        if (snapPos.connectTo) {
          setPlacedPieces(prev => {
            const updated = prev.map(p => {
              if (p.id === snapPos.connectTo) {
                const updatedPiece = { ...p };
                updatedPiece.connections[snapPos.side as keyof typeof p.connections] = newPiece.id;
                return updatedPiece;
              }
              return p;
            });
            
            // Set reverse connection
            const reverseMap = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' } as const;
            newPiece.connections[reverseMap[snapPos.side as keyof typeof reverseMap] || 'left'] = snapPos.connectTo;
            
            return [...updated, newPiece];
          });
        } else {
          setPlacedPieces(prev => [...prev, newPiece]);
        }
      }
    }
  };

  const handlePieceDrop = useCallback((food: Food, x: number, y: number, edges: any) => {
    const newPiece: PlacedPiece = {
      id: `piece-${food.fdcId}-${Date.now()}`,
      food: food,
      gridX: x,
      gridY: y,
      portionSize: 1,
      edges: edges,
      connections: {}
    };
    
    setPlacedPieces(prev => [...prev, newPiece]);
  }, []);

  const handlePieceRemove = useCallback((pieceId: string) => {
    setPlacedPieces(prev => {
      const piece = prev.find(p => p.id === pieceId);
      if (!piece) return prev;
      
      // Remove connections from other pieces
      return prev
        .filter(p => p.id !== pieceId)
        .map(p => {
          const updated = { ...p };
          Object.keys(updated.connections).forEach(key => {
            if (updated.connections[key as keyof typeof updated.connections] === pieceId) {
              delete updated.connections[key as keyof typeof updated.connections];
            }
          });
          return updated;
        });
    });
  }, []);

  const handlePortionChange = useCallback((pieceId: string, newSize: number) => {
    setPlacedPieces(prev => 
      prev.map(p => p.id === pieceId ? { ...p, portionSize: newSize } : p)
    );
  }, []);

  const handleFoodClick = useCallback((food: Food) => {
    setSelectedFood(food);
  }, []);

  return (
    <DndContext 
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  🎮 PappoBot Puzzle - Phase 1.3
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Connect the puzzle pieces to build Sophie's perfect meal!
                </p>
              </div>
              <div className="text-xs text-gray-500 bg-gradient-to-r from-purple-100 to-indigo-100 px-3 py-1.5 rounded-full">
                🧩 Game Mode
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-12 gap-4">
            
            {/* Food Selection Panel - Left */}
            <div className="col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-3 border-b border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-800 mb-2">
                    🧩 Puzzle Pieces
                  </h2>
                  
                  {/* Category filters */}
                  <div className="flex flex-wrap gap-1">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`
                          px-2 py-0.5 rounded-full text-xs font-medium transition-colors
                          ${activeCategory === category
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                      >
                        {categoryNames[category]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Puzzle pieces grid */}
                <div className="p-3 max-h-[500px] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {filteredFoods.map((food) => (
                      <div 
                        key={food.fdcId} 
                        className="flex justify-center"
                        onClick={() => handleFoodClick(food)}
                      >
                        <GamePuzzlePiece
                          food={food}
                          size={70}
                          edges={getPuzzleEdges(food.fdcId)}
                          isSelected={selectedFood?.fdcId === food.fdcId}
                          onClick={() => handleFoodClick(food)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Puzzle Canvas - Center */}
            <div className="col-span-6">
              <GamePuzzleCanvas
                pieces={placedPieces}
                onPieceDrop={handlePieceDrop}
                onPieceRemove={handlePieceRemove}
                onPortionChange={handlePortionChange}
                activeDraggedPiece={activeDragFood ? { 
                  food: activeDragFood, 
                  edges: getPuzzleEdges(activeDragFood.fdcId) 
                } : null}
                selectedFood={selectedFood}
              />
            </div>

            {/* Food Info Panel - Right */}
            <div className="col-span-3">
              <FoodInfoPanel 
                food={selectedFood}
                onClose={() => setSelectedFood(null)}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200">
            <div className="flex items-center gap-6 text-xs text-indigo-700">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <span><strong>Drag</strong> pieces to canvas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🧲</span>
                <span><strong>Magnetic snap</strong> for perfect fit</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🔗</span>
                <span><strong>Connect</strong> tabs to slots</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                <span><strong>Click</strong> pieces for nutrition info</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDragFood ? (
          <div className="transform rotate-6 scale-125">
            <GamePuzzlePiece 
              food={activeDragFood} 
              size={80}
              isDragging={true}
              edges={getPuzzleEdges(activeDragFood.fdcId)}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}