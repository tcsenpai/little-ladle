import React from 'react';
import { Food } from '../types/food';
import { categoryColors } from '../data/foodData';

interface FoodInfoPanelProps {
  food: Food | null;
  onClose?: () => void;
}

const categoryIcons = {
  fruit: '🍎',
  vegetable: '🥦',
  protein: '🍗',
  grain: '🌾',
  dairy: '🥛',
  other: '🍽️'
} as const;

const ageIndicators = {
  '6+ months': { color: '#28A745', text: '6m+', description: 'Safe from 6 months' },
  '8+ months': { color: '#6FB83F', text: '8m+', description: 'Recommended from 8 months' },
  '12+ months': { color: '#FFC107', text: '12m+', description: 'Better for 12+ months' }
} as const;

export function FoodInfoPanel({ food, onClose }: FoodInfoPanelProps) {
  console.log('🍽️ FoodInfoPanel rendered with food:', food?.name || 'null');
  
  if (!food) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 h-full">
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-lg font-medium">Food Information</p>
          <p className="text-sm mt-2">Click on a puzzle piece to see details</p>
        </div>
      </div>
    );
  }

  const categoryColor = categoryColors[food.category];
  const categoryIcon = categoryIcons[food.category];
  const ageInfo = ageIndicators[food.ageGroup];

  // Get all nutrients
  const nutrients = food.nutrients;
  const mainNutrients = [
    { key: 'calories', label: 'Calories', value: nutrients.calories?.amount ?? 0, unit: 'kcal', color: '#FF6B6B' },
    { key: 'protein', label: 'Protein', value: nutrients.protein?.amount ?? 0, unit: 'g', color: '#845EC2' },
    { key: 'fat', label: 'Fat', value: nutrients.fat?.amount ?? 0, unit: 'g', color: '#FEC868' },
    { key: 'carbs', label: 'Carbs', value: nutrients.carbs?.amount ?? 0, unit: 'g', color: '#4ECDC4' },
  ];

  const minerals = [
    { key: 'iron', label: 'Iron', value: nutrients.iron?.amount ?? 0, unit: 'mg', color: '#DC3545', important: true },
    { key: 'calcium', label: 'Calcium', value: nutrients.calcium?.amount ?? 0, unit: 'mg', color: '#007BFF', important: true },
    { key: 'zinc', label: 'Zinc', value: nutrients.zinc?.amount ?? 0, unit: 'mg', color: '#6C757D' },
    { key: 'magnesium', label: 'Magnesium', value: nutrients.magnesium?.amount ?? 0, unit: 'mg', color: '#28A745' },
  ];

  const vitamins = [
    { key: 'vitaminA', label: 'Vitamin A', value: nutrients.vitaminA?.amount ?? 0, unit: 'µg', color: '#FFC107' },
    { key: 'vitaminC', label: 'Vitamin C', value: nutrients.vitaminC?.amount ?? 0, unit: 'mg', color: '#FF6B6B' },
    { key: 'vitaminD', label: 'Vitamin D', value: nutrients.vitaminD?.amount ?? 0, unit: 'µg', color: '#17A2B8' },
    { key: 'folate', label: 'Folate', value: nutrients.folate?.amount ?? 0, unit: 'µg', color: '#6F42C1' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${categoryColor}20` }}
          >
            {categoryIcon}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">{food.name}</h3>
            <p className="text-sm text-gray-600 capitalize">{food.category}</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Age recommendation */}
      <div 
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
        style={{ backgroundColor: `${ageInfo.color}20` }}
      >
        <span 
          className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: ageInfo.color }}
        >
          {ageInfo.text}
        </span>
        <span className="text-sm text-gray-700">{ageInfo.description}</span>
      </div>

      {/* Main Nutrients */}
      <div className="mb-4">
        <h4 className="text-sm font-bold text-gray-700 mb-2">Macronutrients (per 100g)</h4>
        <div className="grid grid-cols-2 gap-2">
          {mainNutrients.map(nutrient => (
            <div 
              key={nutrient.key}
              className="bg-gray-50 rounded-lg p-2 border border-gray-200"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">{nutrient.label}</span>
                <span 
                  className="text-sm font-bold"
                  style={{ color: nutrient.color }}
                >
                  {nutrient.value.toFixed(1)}{nutrient.unit}
                </span>
              </div>
              {/* Mini bar */}
              <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${Math.min((nutrient.value / (nutrient.key === 'calories' ? 200 : 20)) * 100, 100)}%`,
                    backgroundColor: nutrient.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Minerals */}
      <div className="mb-4">
        <h4 className="text-sm font-bold text-gray-700 mb-2">Minerals</h4>
        <div className="space-y-1">
          {minerals.map(mineral => (
            <div 
              key={mineral.key}
              className={`flex justify-between items-center py-1 px-2 rounded ${
                mineral.important ? 'bg-yellow-50' : ''
              }`}
            >
              <span className="text-xs text-gray-600">
                {mineral.label}
                {mineral.important && <span className="text-yellow-600 ml-1">⭐</span>}
              </span>
              <span 
                className="text-sm font-bold"
                style={{ color: mineral.color }}
              >
                {mineral.value.toFixed(2)}{mineral.unit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Vitamins */}
      <div className="mb-4">
        <h4 className="text-sm font-bold text-gray-700 mb-2">Vitamins</h4>
        <div className="space-y-1">
          {vitamins.filter(v => v.value > 0).map(vitamin => (
            <div 
              key={vitamin.key}
              className="flex justify-between items-center py-1 px-2"
            >
              <span className="text-xs text-gray-600">{vitamin.label}</span>
              <span 
                className="text-sm font-bold"
                style={{ color: vitamin.color }}
              >
                {vitamin.value.toFixed(2)}{vitamin.unit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sophie's tip */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 mt-4">
        <p className="text-xs text-purple-700">
          <strong>💡 Sophie's Tip:</strong> 
          {nutrients.iron && nutrients.iron.amount > 1 && " Great source of iron for brain development!"}
          {nutrients.calcium && nutrients.calcium.amount > 50 && " Excellent for strong bones!"}
          {nutrients.protein && nutrients.protein.amount > 3 && " Good protein for growing muscles!"}
          {(!nutrients.iron || nutrients.iron.amount <= 1) && 
           (!nutrients.calcium || nutrients.calcium.amount <= 50) && 
           (!nutrients.protein || nutrients.protein.amount <= 3) && 
           " A nice addition to a balanced meal!"}
        </p>
      </div>
    </div>
  );
}