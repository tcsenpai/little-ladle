import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
} from '@dnd-kit/core';
import { DraggableFoodBlock } from './DraggableFoodBlock';
import { MealCanvas } from './MealCanvas';
import { foods, getFoodsByCategory } from '../data/foodData';
import { Food } from '../types/food';

interface MealFood extends Food {
  id: string;
  portionSize: number;
}

export function Phase12Demo() {
  const [mealFoods, setMealFoods] = useState<MealFood[]>([]);
  const [activeCategory, setActiveCategory] = useState<Food['category'] | 'all'>('all');
  const [activeDragFood, setActiveDragFood] = useState<Food | null>(null);

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

    if (active.data.current?.type === 'food') {
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
        // Add new food to meal
        const newMealFood: MealFood = {
          ...food,
          id: `meal-${food.fdcId}-${Date.now()}`,
          portionSize: 1
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Food Selection Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    🥗 Food Selection
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
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-7xl mx-auto px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              🎯 How to Use
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
              <div>
                <strong>1. Browse Foods:</strong> Use category filters to find specific food types for Sophie.
              </div>
              <div>
                <strong>2. Drag & Drop:</strong> Drag food blocks from the left panel into the meal area.
              </div>
              <div>
                <strong>3. Adjust Portions:</strong> Click portion buttons (½, 1, 1.5, 2x) to control serving sizes.
              </div>
            </div>
            <div className="mt-3 text-sm text-blue-600">
              <strong>✨ Smart Features:</strong> Duplicate foods increase portion size automatically • Real-time nutrition tracking • Age-appropriate recommendations
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