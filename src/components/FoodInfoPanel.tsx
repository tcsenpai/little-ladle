import React from 'react';
import { Food } from '../types/food';
import { categoryColors } from '../data/foodData';

interface FoodInfoPanelProps {
  food: Food | null;
  onClose?: () => void;
}

const categoryIconComponents = {
  fruit: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  ),
  vegetable: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
    </svg>
  ),
  protein: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
    </svg>
  ),
  grain: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
    </svg>
  ),
  dairy: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0110 0V3a1 1 0 112 0v2.101a7.002 7.002 0 01-10 0V3a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  ),
  other: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  )
} as const;

const ageIndicators = {
  '6+ months': { colorClass: 'text-green-700 bg-green-100', text: '6m+', description: 'Safe from 6 months' },
  '8+ months': { colorClass: 'text-green-700 bg-green-100', text: '8m+', description: 'Recommended from 8 months' },
  '12+ months': { colorClass: 'text-amber-700 bg-amber-100', text: '12m+', description: 'Better for 12+ months' }
} as const;

export function FoodInfoPanel({ food, onClose }: FoodInfoPanelProps) {
  console.log('🍽️ FoodInfoPanel rendered with food:', food?.name || 'null');
  
  if (!food) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Food Information</h3>
          <p className="text-sm text-gray-600 text-center">Select a food to view detailed nutrition information</p>
        </div>
      </div>
    );
  }

  const categoryIcon = categoryIconComponents[food.category];
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
              {categoryIcon}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{food.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{food.category}</p>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Close food information"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Age recommendation */}
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${ageInfo.colorClass.split(' ')[1]}`}>
          <span className={`text-xs font-medium px-2 py-1 rounded-md ${ageInfo.colorClass}`}>
            {ageInfo.text}
          </span>
          <span className="text-sm text-gray-700">{ageInfo.description}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Main Nutrients */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Macronutrients (per 100g)</h4>
          <div className="grid grid-cols-2 gap-3">
            {mainNutrients.map(nutrient => (
              <div key={nutrient.key} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-600">{nutrient.label}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {nutrient.value.toFixed(1)}{nutrient.unit}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((nutrient.value / (nutrient.key === 'calories' ? 200 : 20)) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Minerals */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Essential Minerals</h4>
          <div className="space-y-2">
            {minerals.map(mineral => (
              <div 
                key={mineral.key}
                className={`flex justify-between items-center py-2 px-3 rounded-lg border ${
                  mineral.important ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  {mineral.label}
                  {mineral.important && (
                    <span className="w-4 h-4 text-amber-500" title="Critical for development">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </span>
                  )}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {mineral.value.toFixed(2)}{mineral.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Vitamins */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Vitamins</h4>
          <div className="space-y-2">
            {vitamins.filter(v => v.value > 0).map(vitamin => (
              <div 
                key={vitamin.key}
                className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <span className="text-sm font-medium text-gray-900">{vitamin.label}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {vitamin.value.toFixed(2)}{vitamin.unit}
                </span>
              </div>
            ))}
            {vitamins.filter(v => v.value > 0).length === 0 && (
              <p className="text-xs text-gray-500 italic py-2">No significant vitamin content detected</p>
            )}
          </div>
        </div>

        {/* Nutritional Insights */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 text-blue-600 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h5 className="text-sm font-medium text-blue-900 mb-1">Nutritional Insight</h5>
              <p className="text-xs text-blue-800">
                {nutrients.iron && nutrients.iron.amount > 1 && "Great source of iron for brain development and preventing anemia. "}
                {nutrients.calcium && nutrients.calcium.amount > 50 && "Excellent calcium content for strong bones and teeth. "}
                {nutrients.protein && nutrients.protein.amount > 3 && "Good protein source for growing muscles and tissue development. "}
                {(!nutrients.iron || nutrients.iron.amount <= 1) && 
                 (!nutrients.calcium || nutrients.calcium.amount <= 50) && 
                 (!nutrients.protein || nutrients.protein.amount <= 3) && 
                 "A valuable addition to create a balanced, nutritious meal for your little one."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}