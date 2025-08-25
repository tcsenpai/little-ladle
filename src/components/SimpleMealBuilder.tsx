import React, { useState, useCallback } from 'react';
import { FoodBrowsePanel } from './FoodBrowsePanel';
import { MealTower } from './MealTower';
import { FoodInfoPanel } from './FoodInfoPanel';
import { foods, getFoodsByCategory } from '../data/foodData';
import { Food } from '../types/food';

interface MealFood {
  id: string;
  food: Food;
  portionSize: number;
  addedAt: number;
}

export function SimpleMealBuilder() {
  const [mealFoods, setMealFoods] = useState<MealFood[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [activeCategory, setActiveCategory] = useState<Food['category'] | 'all'>('all');

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

  const handleAddFood = useCallback((food: Food) => {
    const newMealFood: MealFood = {
      id: `meal-${food.fdcId}-${Date.now()}`,
      food: food,
      portionSize: 1,
      addedAt: Date.now()
    };
    
    console.log('Adding food to meal:', food.name);
    setMealFoods(prev => [newMealFood, ...prev]); // Add to top of tower
  }, []);

  const handleRemoveFood = useCallback((foodId: string) => {
    console.log('Removing food from meal:', foodId);
    setMealFoods(prev => prev.filter(mealFood => mealFood.id !== foodId));
  }, []);

  const handleUpdatePortion = useCallback((foodId: string, newPortion: number) => {
    console.log('Updating portion for:', foodId, 'to:', newPortion);
    setMealFoods(prev => 
      prev.map(mealFood => 
        mealFood.id === foodId 
          ? { ...mealFood, portionSize: newPortion }
          : mealFood
      )
    );
  }, []);

  const handleFoodInfo = useCallback((food: Food) => {
    console.log('Showing info for:', food.name);
    setSelectedFood(food);
  }, []);

  const handleClearMeal = useCallback(() => {
    setMealFoods([]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                🍽️ PappoBot - Simple Meal Builder
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Click + to add foods to your meal tower!
              </p>
            </div>
            <div className="text-xs text-gray-500 bg-gradient-to-r from-green-100 to-blue-100 px-3 py-1.5 rounded-full">
              🏗️ Tower Builder
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Food Browse Panel - Left */}
          <div className="col-span-3">
            <FoodBrowsePanel
              foods={filteredFoods}
              categories={categories}
              categoryNames={categoryNames}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              onAddFood={handleAddFood}
              onShowInfo={handleFoodInfo}
              selectedFood={selectedFood}
            />
          </div>

          {/* Meal Tower - Center */}
          <div className="col-span-6">
            <MealTower
              mealFoods={mealFoods}
              onRemoveFood={handleRemoveFood}
              onUpdatePortion={handleUpdatePortion}
              onClearMeal={handleClearMeal}
              onShowInfo={handleFoodInfo}
              selectedFood={selectedFood}
            />
          </div>

          {/* Nutrition Dashboard - Right */}
          <div className="col-span-3">
            <FoodInfoPanel 
              food={selectedFood}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-center gap-8 text-sm text-green-700">
            <div className="flex items-center gap-2">
              <span className="text-lg">👆</span>
              <span><strong>Click</strong> food names for nutrition info</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">➕</span>
              <span><strong>Click +</strong> to add foods to your meal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🏗️</span>
              <span><strong>Build</strong> Sophie's perfect meal tower!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}