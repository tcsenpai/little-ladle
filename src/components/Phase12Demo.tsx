import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
} from '@dnd-kit/core';
import { DraggableFoodBlock } from './DraggableFoodBlock';
import { MealCanvas, getOptimalPosition } from './MealCanvas';
import { FoodInfoPanel } from './FoodInfoPanel';
import { foods, getFoodsByCategory } from '../data/foodData';
import { Food } from '../types/food';

interface MealFood extends Food {
  id: string;
  portionSize: number;
  position: { x: number; y: number };
}

export function Phase12Demo() {
  const [mealFoods, setMealFoods] = useState<MealFood[]>([]);
  const [activeCategory, setActiveCategory] = useState<Food['category'] | 'all'>('all');
  const [activeDragFood, setActiveDragFood] = useState<Food | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'food') {
      setActiveDragFood(active.data.current.food);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragFood(null);

    if (!over || over.id !== 'meal-canvas') return;

    if (active.data.current?.type === 'food' && active.data.current?.isFromSidebar) {
      const food = active.data.current.food as Food;
      
      // Check if food already exists in meal
      const existingFood = mealFoods.find(mf => mf.fdcId === food.fdcId);
      if (existingFood) {
        // Increase portion size instead of adding duplicate
        setMealFoods(prev => 
          prev.map(mf => 
            mf.fdcId === food.fdcId 
              ? { ...mf, portionSize: Math.min(mf.portionSize + 0.5, 2) }
              : mf
          )
        );
      } else {
        // Calculate optimal position for new block
        const position = getOptimalPosition(mealFoods);
        
        // Add new food to meal
        const newMealFood: MealFood = {
          ...food,
          id: `meal-${food.fdcId}-${Date.now()}`,
          portionSize: 1,
          position
        };
        setMealFoods(prev => [...prev, newMealFood]);
      }
    }
  };

  const handlePortionChange = (foodId: string, newSize: number) => {
    setMealFoods(prev =>
      prev.map(food =>
        food.id === foodId ? { ...food, portionSize: newSize } : food
      )
    );
  };

  const handleRemoveFood = (foodId: string) => {
    setMealFoods(prev => prev.filter(food => food.id !== foodId));
  };

  const handlePositionChange = (foodId: string, newPosition: { x: number; y: number }) => {
    setMealFoods(prev => 
      prev.map(food => 
        food.id === foodId 
          ? { ...food, position: newPosition }
          : food
      )
    );
  };

  const handleInfoClick = (food: Food) => {
    setSelectedFood(food);
  };

  const handleCloseInfo = () => {
    setSelectedFood(null);
  };

  return (
    <DndContext 
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                  🧩 PappoBot - Phase 1.2
                </h1>
                <p className="text-gray-600 mt-1">
                  Drag-and-drop food blocks to create Sophie's balanced meal!
                </p>
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                Phase 1.2: Interactive Food Blocks
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Food Selection Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    🥗 Food Selection
                  </h2>
                  <p className="text-xs text-gray-600 mb-3">
                    Click for info • Drag to add
                  </p>
                  
                  {/* Category filters */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`
                          px-3 py-1 rounded-full text-xs font-medium transition-colors
                          ${activeCategory === category
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                      >
                        {categoryNames[category]} ({category === 'all' ? foods.length : getFoodsByCategory(category).length})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Draggable food list */}
                <div className="max-h-[600px] overflow-y-auto p-4 space-y-3">
                  {filteredFoods.map((food, index) => (
                    <DraggableFoodBlock
                      key={food.fdcId}
                      food={food}
                      showNutritionPreview={true}
                      onInfoClick={handleInfoClick}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Meal Canvas */}
            <div className="lg:col-span-3">
              <MealCanvas
                mealFoods={mealFoods}
                onPortionChange={handlePortionChange}
                onRemoveFood={handleRemoveFood}
                onPositionChange={handlePositionChange}
                onInfoClick={handleInfoClick}
              />
            </div>

            {/* Food Info Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <FoodInfoPanel 
                  food={selectedFood} 
                  onClose={handleCloseInfo}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-7xl mx-auto px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              🎯 How to Use
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-blue-700">
              <div>
                <strong>1. Browse Foods:</strong> Click food blocks to see details and nutrition info.
              </div>
              <div>
                <strong>2. Drag & Drop:</strong> Drag food blocks into the canvas to create Sophie's meal.
              </div>
              <div>
                <strong>3. Auto-Connect:</strong> Blocks snap to grid and connect automatically when near each other.
              </div>
              <div>
                <strong>4. Adjust Portions:</strong> Use portion buttons (½, 1, 1.5, 2x) to control serving sizes.
              </div>
            </div>
            <div className="mt-3 text-sm text-blue-600">
              <strong>✨ Smart Features:</strong> No overlapping blocks • Grid snapping • Diagram-style connections • Real-time nutrition tracking • ADHD-friendly design
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDragFood ? (
          <DraggableFoodBlock 
            food={activeDragFood} 
            isDragging={true}
            showNutritionPreview={false}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}