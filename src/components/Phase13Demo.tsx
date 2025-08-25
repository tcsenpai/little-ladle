import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  DragOverEvent,
} from '@dnd-kit/core';
import { PuzzleFoodBlock } from './PuzzleFoodBlock';
import { PuzzleMealCanvas } from './PuzzleMealCanvas';
import { foods, getFoodsByCategory } from '../data/foodData';
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

// Generate consistent puzzle edges based on food ID
function getPuzzleEdges(fdcId: number) {
  const hash = fdcId % 16;
  return {
    top: hash & 1 ? 'tab' : hash & 2 ? 'slot' : 'blank',
    right: hash & 4 ? 'tab' : hash & 8 ? 'slot' : 'blank',
    bottom: (hash & 1) === 0 ? 'tab' : (hash & 2) === 0 ? 'slot' : 'blank',
    left: (hash & 4) === 0 ? 'tab' : (hash & 8) === 0 ? 'slot' : 'blank'
  } as const;
}

// Check if two edges can connect
function canConnect(edge1: string, edge2: string): boolean {
  return (edge1 === 'tab' && edge2 === 'slot') || (edge1 === 'slot' && edge2 === 'tab');
}

const GRID_SIZE = 100;

export function Phase13Demo() {
  const [puzzlePieces, setPuzzlePieces] = useState<PuzzlePiece[]>([]);
  const [activeCategory, setActiveCategory] = useState<Food['category'] | 'all'>('all');
  const [activeDragFood, setActiveDragFood] = useState<Food | null>(null);
  const [draggedPieceId, setDraggedPieceId] = useState<string | null>(null);

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

  // Check if position is occupied
  const isOccupied = useCallback((row: number, col: number) => {
    return puzzlePieces.some(p => p.gridPosition.row === row && p.gridPosition.col === col);
  }, [puzzlePieces]);

  // Find connections for a piece at a position
  const findConnections = useCallback((piece: PuzzlePiece, row: number, col: number) => {
    const connections: string[] = [];
    
    puzzlePieces.forEach(existingPiece => {
      if (existingPiece.id === piece.id) return;
      
      const { row: eRow, col: eCol } = existingPiece.gridPosition;
      
      // Check if adjacent
      if (eRow === row - 1 && eCol === col && canConnect(piece.edges.top, existingPiece.edges.bottom)) {
        connections.push(existingPiece.id);
      }
      if (eRow === row + 1 && eCol === col && canConnect(piece.edges.bottom, existingPiece.edges.top)) {
        connections.push(existingPiece.id);
      }
      if (eRow === row && eCol === col - 1 && canConnect(piece.edges.left, existingPiece.edges.right)) {
        connections.push(existingPiece.id);
      }
      if (eRow === row && eCol === col + 1 && canConnect(piece.edges.right, existingPiece.edges.left)) {
        connections.push(existingPiece.id);
      }
    });
    
    return connections;
  }, [puzzlePieces]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    if (active.data.current?.type === 'puzzle-food') {
      setActiveDragFood(active.data.current.food);
    } else if (active.id.toString().startsWith('placed-')) {
      const pieceId = active.id.toString().replace('placed-', '');
      setDraggedPieceId(pieceId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragFood(null);
    setDraggedPieceId(null);

    if (!over || over.id !== 'puzzle-canvas') return;

    // Get drop position (simplified - you'd calculate actual grid position from mouse coordinates)
    const dropX = event.delta.x;
    const dropY = event.delta.y;
    
    // Calculate grid position (simplified)
    const gridCol = Math.floor(Math.random() * 6); // This should be calculated from actual position
    const gridRow = Math.floor(Math.random() * 4);

    if (active.data.current?.type === 'puzzle-food') {
      const food = active.data.current.food as Food;
      
      // Check if position is available
      if (!isOccupied(gridRow, gridCol)) {
        const newPiece: PuzzlePiece = {
          id: `piece-${food.fdcId}-${Date.now()}`,
          food: food,
          position: { x: gridCol * GRID_SIZE, y: gridRow * GRID_SIZE },
          gridPosition: { row: gridRow, col: gridCol },
          portionSize: 1,
          connectedTo: [],
          edges: getPuzzleEdges(food.fdcId)
        };
        
        // Check for connections
        const connections = findConnections(newPiece, gridRow, gridCol);
        newPiece.connectedTo = connections;
        
        // Update connected pieces
        setPuzzlePieces(prev => {
          const updated = prev.map(p => {
            if (connections.includes(p.id)) {
              return { ...p, connectedTo: [...p.connectedTo, newPiece.id] };
            }
            return p;
          });
          return [...updated, newPiece];
        });
        
        // Play snap sound effect (you could add actual sound here)
        if (connections.length > 0) {
          console.log('SNAP! Connected to', connections.length, 'pieces');
        }
      }
    }
  };

  const handlePiecePlace = useCallback((food: Food, gridPosition: { row: number; col: number }) => {
    if (isOccupied(gridPosition.row, gridPosition.col)) return;
    
    const newPiece: PuzzlePiece = {
      id: `piece-${food.fdcId}-${Date.now()}`,
      food: food,
      position: { 
        x: gridPosition.col * GRID_SIZE, 
        y: gridPosition.row * GRID_SIZE 
      },
      gridPosition: gridPosition,
      portionSize: 1,
      connectedTo: [],
      edges: getPuzzleEdges(food.fdcId)
    };
    
    const connections = findConnections(newPiece, gridPosition.row, gridPosition.col);
    newPiece.connectedTo = connections;
    
    setPuzzlePieces(prev => {
      const updated = prev.map(p => {
        if (connections.includes(p.id)) {
          return { ...p, connectedTo: [...p.connectedTo, newPiece.id] };
        }
        return p;
      });
      return [...updated, newPiece];
    });
  }, [isOccupied, findConnections]);

  const handlePieceRemove = useCallback((pieceId: string) => {
    setPuzzlePieces(prev => {
      const piece = prev.find(p => p.id === pieceId);
      if (!piece) return prev;
      
      // Remove connections
      const updated = prev.map(p => {
        if (p.id === pieceId) return null;
        if (p.connectedTo.includes(pieceId)) {
          return { ...p, connectedTo: p.connectedTo.filter(id => id !== pieceId) };
        }
        return p;
      }).filter(Boolean) as PuzzlePiece[];
      
      return updated;
    });
  }, []);

  const handlePortionChange = useCallback((pieceId: string, newSize: number) => {
    setPuzzlePieces(prev => 
      prev.map(p => p.id === pieceId ? { ...p, portionSize: newSize } : p)
    );
  }, []);

  const handleClearAll = useCallback(() => {
    setPuzzlePieces([]);
  }, []);

  return (
    <DndContext 
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                  🧩 PappoBot - Phase 1.3
                </h1>
                <p className="text-gray-600 mt-1">
                  Connect puzzle pieces to build Sophie's meal!
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500 bg-gradient-to-r from-purple-100 to-blue-100 px-3 py-2 rounded-lg">
                  🎮 Puzzle Mode Active
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Food Selection Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    🥗 Puzzle Pieces
                  </h2>
                  
                  {/* Category filters */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`
                          px-3 py-1 rounded-full text-xs font-medium transition-colors
                          ${activeCategory === category
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                      >
                        {categoryNames[category]} ({category === 'all' ? foods.length : getFoodsByCategory(category).length})
                      </button>
                    ))}
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                    <p className="text-xs text-purple-700">
                      🎯 <strong>Tip:</strong> Look for matching edges! Tabs fit into slots.
                    </p>
                  </div>
                </div>

                {/* Puzzle pieces list */}
                <div className="max-h-[600px] overflow-y-auto p-4 space-y-4">
                  {filteredFoods.map((food) => (
                    <div key={food.fdcId} className="flex justify-center">
                      <PuzzleFoodBlock
                        food={food}
                        showNutritionPreview={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Puzzle Canvas */}
            <div className="lg:col-span-3">
              <PuzzleMealCanvas
                pieces={puzzlePieces}
                onPiecePlace={handlePiecePlace}
                onPieceRemove={handlePieceRemove}
                onPortionChange={handlePortionChange}
                onClearAll={handleClearAll}
              />
              
              {/* Placed puzzle pieces (rendered absolutely within canvas) */}
              <div className="relative">
                {puzzlePieces.map(piece => (
                  <div
                    key={piece.id}
                    style={{
                      position: 'absolute',
                      left: piece.position.x,
                      top: piece.position.y - 500, // Offset to position within canvas area
                      zIndex: 10
                    }}
                  >
                    <PuzzleFoodBlock
                      food={piece.food}
                      portionSize={piece.portionSize}
                      onPortionChange={(size) => handlePortionChange(piece.id, size)}
                      isPlaced={true}
                      connectedTo={piece.connectedTo}
                      position={piece.position}
                      connectionSides={{
                        top: piece.connectedTo.some(id => {
                          const connected = puzzlePieces.find(p => p.id === id);
                          return connected && connected.gridPosition.row < piece.gridPosition.row;
                        }),
                        right: piece.connectedTo.some(id => {
                          const connected = puzzlePieces.find(p => p.id === id);
                          return connected && connected.gridPosition.col > piece.gridPosition.col;
                        }),
                        bottom: piece.connectedTo.some(id => {
                          const connected = puzzlePieces.find(p => p.id === id);
                          return connected && connected.gridPosition.row > piece.gridPosition.row;
                        }),
                        left: piece.connectedTo.some(id => {
                          const connected = puzzlePieces.find(p => p.id === id);
                          return connected && connected.gridPosition.col < piece.gridPosition.col;
                        })
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-7xl mx-auto px-6 pb-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              🧩 How to Play the Puzzle
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-purple-700">
              <div>
                <strong>1. Pick Pieces:</strong> Choose food puzzle pieces from the left panel.
              </div>
              <div>
                <strong>2. Connect:</strong> Drag pieces to the canvas - tabs fit into slots!
              </div>
              <div>
                <strong>3. Build Meals:</strong> Connect 4+ pieces for maximum nutrition bonus.
              </div>
              <div>
                <strong>4. Portion Control:</strong> Adjust serving sizes after placing pieces.
              </div>
            </div>
            <div className="mt-3 text-sm text-purple-600">
              <strong>🎮 Puzzle Power:</strong> Connected pieces give nutrition bonuses! • Each connection adds 10% • Create chains for Sophie's perfect meal!
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDragFood ? (
          <div className="transform scale-110 rotate-3">
            <PuzzleFoodBlock 
              food={activeDragFood} 
              isDragging={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}