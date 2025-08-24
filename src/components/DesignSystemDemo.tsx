import React, { useState } from 'react';
import { FoodBlock } from './FoodBlock';
import { foods, getFoodsByCategory, categoryColors } from '../data/foodData';
import type { FoodCategory } from '../types/food';

export function DesignSystemDemo() {
  const [selectedFood, setSelectedFood] = useState<number | null>(null);
  const [hoveredFood, setHoveredFood] = useState<number | null>(null);

  const categories: FoodCategory[] = ['fruit', 'vegetable', 'protein', 'grain', 'dairy', 'other'];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🍼 PappoBot Design System
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Visual food blocks for Sophie's meal planning
          </p>
          <div className="text-sm text-gray-500">
            Phase 1.1: ADHD-friendly colors, shapes, and interactions
          </div>
        </div>

        {/* Color Palette */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            🎨 Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <div 
                key={category}
                className="bg-white rounded-lg p-4 shadow-sm border"
              >
                <div 
                  className="w-full h-16 rounded-lg mb-3"
                  style={{ backgroundColor: categoryColors[category] }}
                />
                <div className="text-sm font-medium capitalize text-gray-800">
                  {category}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {categoryColors[category]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Food Blocks by Category */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            🧩 Food Blocks
          </h2>
          <div className="space-y-8">
            {categories.map(category => {
              const categoryFoods = getFoodsByCategory(category);
              if (categoryFoods.length === 0) return null;
              
              return (
                <div key={category}>
                  <h3 className="text-lg font-medium mb-4 capitalize flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: categoryColors[category] }}
                    />
                    {category} ({categoryFoods.length} foods)
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {categoryFoods.slice(0, 4).map(food => (
                      <FoodBlock
                        key={food.fdcId}
                        food={food}
                        isSelected={selectedFood === food.fdcId}
                        isHovered={hoveredFood === food.fdcId}
                        onClick={() => setSelectedFood(
                          selectedFood === food.fdcId ? null : food.fdcId
                        )}
                        onMouseEnter={() => setHoveredFood(food.fdcId)}
                        onMouseLeave={() => setHoveredFood(null)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interaction States Demo */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            ⚡ Interaction States
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-600">Default</h4>
              <FoodBlock food={foods[0]} />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-600">Hovered</h4>
              <FoodBlock food={foods[1]} isHovered={true} />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-600">Selected</h4>
              <FoodBlock food={foods[2]} isSelected={true} />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-600">Dragging</h4>
              <FoodBlock food={foods[3]} isDragging={true} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            📊 Database Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <div key={category} className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {getFoodsByCategory(category).length}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {category}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-500 text-center">
            Total: {foods.length} foods loaded from Sophie's database
          </div>
        </div>
      </div>
    </div>
  );
}