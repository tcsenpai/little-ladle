import React, { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
} from '@dnd-kit/core';
import { ScratchFoodBlock } from './ScratchFoodBlock';
import { ScratchMealCanvas } from './ScratchMealCanvas';
import { FoodInfoPanel } from './FoodInfoPanel';
import { foods, getFoodsByCategory } from '../data/foodData';
import { Food } from '../types/food';

interface PlacedBlock {
  id: string;
  food: Food;
  x: number;
  y: number;
  portionSize: number;
  connectedTo: string[];
}

// Grid-based system - no overlaps possible
const GRID_COLS = 6;
const GRID_ROWS = 4;
const CELL_WIDTH = 120;
const CELL_HEIGHT = 100;

export function ScratchDemo() {
  const [placedBlocks, setPlacedBlocks] = useState<PlacedBlock[]>([]);
  const [activeCategory, setActiveCategory] = useState<Food['category'] | 'all'>('all');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [activeDragFood, setActiveDragFood] = useState<Food | null>(null);
  const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  // Grid system - track occupied cells (true = occupied, false = free)
  const [gridOccupied, setGridOccupied] = useState<boolean[][]>(() => 
    Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(false))
  );

  // Grid helper functions
  const findNearestFreeCell = (targetX: number, targetY: number): { row: number; col: number } | null => {
    // Convert screen coordinates to grid coordinates
    const targetCol = Math.floor(targetX / CELL_WIDTH);
    const targetRow = Math.floor(targetY / CELL_HEIGHT);
    
    // Start from target and expand outward in a spiral pattern
    for (let radius = 0; radius < Math.max(GRID_ROWS, GRID_COLS); radius++) {
      for (let row = Math.max(0, targetRow - radius); row <= Math.min(GRID_ROWS - 1, targetRow + radius); row++) {
        for (let col = Math.max(0, targetCol - radius); col <= Math.min(GRID_COLS - 1, targetCol + radius); col++) {
          if (!gridOccupied[row][col]) {
            return { row, col };
          }
        }
      }
    }
    return null; // All cells occupied
  };

  const gridToPixels = (row: number, col: number) => ({
    x: col * CELL_WIDTH,
    y: row * CELL_HEIGHT
  });

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter foods by category
  const filteredFoods = activeCategory === 'all' 
    ? foods 
    : getFoodsByCategory(activeCategory);

  const categories: (Food['category'] | 'all')[] = ['all', 'fruit', 'vegetable', 'protein', 'grain', 'dairy', 'other'];
  
  const categoryNames = {
    all: 'All',
    fruit: 'Fruits',
    vegetable: 'Vegetables', 
    protein: 'Proteins',
    grain: 'Grains',
    dairy: 'Dairy',
    other: 'Other'
  };

  // Responsive layout detection
  const isMobile = screenSize.width < 768;
  const isTablet = screenSize.width >= 768 && screenSize.width < 1024;
  const isDesktop = screenSize.width >= 1024;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'scratch-food') {
      setActiveDragFood(active.data.current.food);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('Drag ended:', { active: active?.id, over: over?.id }); // Debug log
    setActiveDragFood(null);

    if (!over || over.id !== 'scratch-canvas') {
      console.log('Drop rejected - not over canvas'); // Debug log
      return;
    }

    if (active.data.current?.type === 'scratch-food') {
      const food = active.data.current.food as Food;
      console.log('Dropping food:', food.name); // Debug log
      
      // Get canvas dimensions (more accurate)
      const canvasElement = document.querySelector('[data-droppable-id="scratch-canvas"]');
      const canvasRect = canvasElement?.getBoundingClientRect();
      const canvasWidth = canvasRect?.width || 800;
      const canvasHeight = canvasRect?.height || 500;
      
      // Calculate mouse drop position relative to canvas
      const mouseX = event.activatorEvent?.clientX || 0;
      const mouseY = event.activatorEvent?.clientY || 0;
      const canvasLeft = canvasRect?.left || 0;
      const canvasTop = canvasRect?.top || 0;
      
      let x = mouseX - canvasLeft - (CELL_WIDTH / 2); // Center block on cursor
      let y = mouseY - canvasTop - (CELL_HEIGHT / 2);
      
      // GRID-BASED SYSTEM: No overlaps possible
      console.log('Drop coordinates:', { relativeX: x, relativeY: y });
      
      // Find nearest free cell using grid system
      const freeCell = findNearestFreeCell(x, y);
      
      if (!freeCell) {
        console.log('No free cells available!');
        return; // Canvas is full
      }
      
      console.log('Found free cell:', freeCell);
      
      // Convert grid cell to pixel position
      const position = gridToPixels(freeCell.row, freeCell.col);
      x = position.x;
      y = position.y;
      
      // Mark cell as occupied
      setGridOccupied(prev => {
        const newGrid = prev.map(row => [...row]);
        newGrid[freeCell.row][freeCell.col] = true;
        return newGrid;
      });

      const newBlock: PlacedBlock = {
        id: `block-${food.fdcId}-${Date.now()}`,
        food: food,
        x: x,
        y: y,
        portionSize: 1,
        connectedTo: []
      };
      
      console.log('Adding block at grid position:', freeCell, 'pixels:', { x, y }); // Debug log
      setPlacedBlocks(prev => [...prev, newBlock]);
    }
  };

  const handleBlockRemove = useCallback((blockId: string) => {
    const blockToRemove = placedBlocks.find(block => block.id === blockId);
    if (blockToRemove) {
      // Convert pixel position back to grid cell
      const col = Math.floor(blockToRemove.x / CELL_WIDTH);
      const row = Math.floor(blockToRemove.y / CELL_HEIGHT);
      
      // Free up the grid cell
      setGridOccupied(prev => {
        const newGrid = prev.map(row => [...row]);
        newGrid[row][col] = false;
        return newGrid;
      });
      
      console.log('Freed grid cell:', { row, col });
    }
    
    setPlacedBlocks(prev => prev.filter(block => block.id !== blockId));
  }, [placedBlocks]);

  const handlePortionChange = useCallback((blockId: string, newSize: number) => {
    setPlacedBlocks(prev => 
      prev.map(block => block.id === blockId ? { ...block, portionSize: newSize } : block)
    );
  }, []);

  const handleClear = useCallback(() => {
    setPlacedBlocks([]);
  }, []);

  const handleFoodClick = useCallback((food: Food) => {
    console.log('🎯 handleFoodClick called with:', food.name); // Debug log
    console.log('🎯 Current selectedFood:', selectedFood?.name || 'none');
    console.log('🎯 Setting selectedFood to:', food); // Debug log
    setSelectedFood(food);
    setTimeout(() => {
      console.log('🎯 selectedFood after setState:', selectedFood?.name || 'none');
    }, 100);
  }, [selectedFood]);

  // Responsive grid classes
  const getGridClasses = () => {
    if (isMobile) return "grid-cols-1"; // Stack everything on mobile
    if (isTablet) return "grid-cols-8"; // 3-4-1 layout on tablet
    return "grid-cols-12"; // 3-6-3 layout on desktop
  };

  const getSidebarClasses = () => {
    if (isMobile) return "col-span-1";
    if (isTablet) return "col-span-2";
    return "col-span-2";
  };

  const getCanvasClasses = () => {
    if (isMobile) return "col-span-1";
    if (isTablet) return "col-span-4";
    return "col-span-7";
  };

  const getInfoClasses = () => {
    if (isMobile) return "col-span-1";
    if (isTablet) return "col-span-2";
    return "col-span-3";
  };

  return (
    <DndContext 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        {/* Responsive Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  🍽️ PappoBot - Meal Builder
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Drag and connect food blocks like Scratch programming!
                </p>
              </div>
              <div className="text-xs text-gray-500 bg-gradient-to-r from-purple-100 to-indigo-100 px-3 py-1.5 rounded-full">
                🧩 Scratch-like Interface
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className={`grid ${getGridClasses()} gap-4`}>
            
            {/* Food Selection Panel */}
            <div className={getSidebarClasses()}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
                <div className="p-3 border-b border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-800 mb-2">
                    🥗 Food Blocks
                  </h2>
                  
                  {/* Responsive category filters */}
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`
                          px-2 py-1 rounded text-xs font-medium transition-colors text-left
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

                {/* Food blocks */}
                <div className="p-2 max-h-[50vh] sm:max-h-[60vh] lg:max-h-[70vh] overflow-y-auto">
                  <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                    {filteredFoods.map((food) => (
                      <div 
                        key={food.fdcId} 
                        className="flex justify-center"
                        onClick={(e) => {
                          console.log('Food div clicked:', food.name); // Debug log
                          e.stopPropagation();
                          handleFoodClick(food);
                        }}
                      >
                        <ScratchFoodBlock
                          food={food}
                          size={isMobile ? CELL_WIDTH : Math.min(CELL_WIDTH, 100)}
                          isSelected={selectedFood?.fdcId === food.fdcId}
                          onClick={() => {
                            console.log('ScratchFoodBlock onClick triggered for:', food.name); // Debug log
                            handleFoodClick(food);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Canvas */}
            <div className={getCanvasClasses()}>
              <ScratchMealCanvas
                blocks={placedBlocks}
                onBlockDrop={() => {}} // Not used in this implementation
                onBlockRemove={handleBlockRemove}
                onPortionChange={handlePortionChange}
                onClear={handleClear}
                onBlockClick={handleFoodClick}
                selectedFood={selectedFood}
                gridCols={GRID_COLS}
                gridRows={GRID_ROWS}
                cellWidth={CELL_WIDTH}
                cellHeight={CELL_HEIGHT}
              />
            </div>

            {/* Food Info Panel - Hidden on mobile when no selection */}
            {(!isMobile || selectedFood) && (
              <div className={`${getInfoClasses()} ${isMobile && selectedFood ? 'fixed inset-0 bg-white z-50' : ''}`}>
                <div className="h-full">
                  <FoodInfoPanel 
                    food={selectedFood}
                    onClose={isMobile ? () => setSelectedFood(null) : undefined}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mobile-friendly instructions */}
          <div className="mt-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200">
              <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center gap-6'} text-xs text-indigo-700`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <span><strong>Drag</strong> food blocks to canvas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔗</span>
                  <span><strong>Any block</strong> connects to any other</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  <span><strong>Click</strong> blocks for nutrition info</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍽️</span>
                  <span><strong>Build</strong> Sophie's perfect meal!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDragFood ? (
          <div className="transform rotate-1 scale-110 opacity-90">
            <ScratchFoodBlock 
              food={activeDragFood} 
              size={CELL_WIDTH}
              isDragging={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}