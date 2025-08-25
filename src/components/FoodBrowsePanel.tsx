import React, { useState, useMemo } from 'react';
import { Food } from '../types/food';
import { ChildProfile } from '../types/child';
import { categoryColors } from '../data/foodData';
import { isAgeAppropriate } from '../utils/whoCompliance';
import { calculateAge } from '../utils/ageCalculation';

interface FoodBrowsePanelProps {
  foods: Food[];
  categories: (Food['category'] | 'all')[];
  categoryNames: Record<Food['category'] | 'all', string>;
  activeCategory: Food['category'] | 'all';
  onCategoryChange: (category: Food['category'] | 'all') => void;
  onAddFood: (food: Food) => void;
  onShowInfo: (food: Food) => void;
  selectedFood: Food | null;
  childProfile?: ChildProfile | null;
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
  '6+ months': { color: '#28A745', text: '6m+' },
  '8+ months': { color: '#6FB83F', text: '8m+' },
  '12+ months': { color: '#FFC107', text: '12m+' }
} as const;

export function FoodBrowsePanel({
  foods,
  categories,
  categoryNames,
  activeCategory,
  onCategoryChange,
  onAddFood,
  onShowInfo,
  selectedFood,
  childProfile
}: FoodBrowsePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter foods based on search query and category
  const filteredFoods = useMemo(() => {
    let result = foods;
    
    // Filter by category first
    if (activeCategory !== 'all') {
      result = result.filter(food => food.category === activeCategory);
    }
    
    // Then filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(food => 
        food.name.toLowerCase().includes(query) ||
        food.shortName?.toLowerCase().includes(query) ||
        food.category.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [foods, activeCategory, searchQuery]);

  return (
    <div className="bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-white/50 h-full">
      {/* Header */}
      <div className="p-6 border-b-2 border-emerald-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-xl">🥗</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800">Food Collection</h2>
            <p className="text-sm text-gray-600">Choose your ingredients!</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search foods..."
              className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-gray-300 focus:border-emerald-500 focus:outline-none text-sm bg-white/90 placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-400 hover:bg-gray-600 text-white text-xs font-bold transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        {/* Category Power-Up Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 transform hover:scale-105 shadow-lg
                ${activeCategory === category
                  ? 'bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-xl scale-105'
                  : 'bg-white/80 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-sky-100 border-2 border-emerald-200'
                }
              `}
            >
              {categoryNames[category]}
            </button>
          ))}
        </div>
      </div>

      {/* Food List */}
      <div className="p-3 max-h-[70vh] overflow-y-auto">
        <div className="space-y-2">
          {filteredFoods.length > 0 ? (
            filteredFoods.map((food) => (
              <FoodBrowseItem
                key={food.fdcId}
                food={food}
                isSelected={selectedFood?.fdcId === food.fdcId}
                onAddFood={onAddFood}
                onShowInfo={onShowInfo}
                childProfile={childProfile}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? (
                <div>
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="font-medium">No foods found for "{searchQuery}"</p>
                  <p className="text-sm mt-2">Try different keywords or browse by category</p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-3">🍽️</div>
                  <p className="font-medium">No foods in {categoryNames[activeCategory].toLowerCase()}</p>
                  <p className="text-sm mt-2">Try a different category or search</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FoodBrowseItemProps {
  food: Food;
  isSelected: boolean;
  onAddFood: (food: Food) => void;
  onShowInfo: (food: Food) => void;
  childProfile?: ChildProfile | null;
}

function FoodBrowseItem({ food, isSelected, onAddFood, onShowInfo, childProfile }: FoodBrowseItemProps) {
  const categoryColor = categoryColors[food.category];
  const categoryIcon = categoryIcons[food.category];
  const ageInfo = ageIndicators[food.ageGroup];
  
  // Check age appropriateness with WHO compliance
  const isAppropriate = childProfile ? isAgeAppropriate(food, calculateAge(childProfile.birthday)) : true;
  const showAgeWarning = childProfile && !isAppropriate;

  return (
    <div 
      className={`
        flex items-center gap-3 p-4 rounded-xl transition-all duration-200
        ${isSelected 
          ? 'bg-indigo-50 border-2 border-indigo-200 shadow-md' 
          : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md'
        }
      `}
    >
      {/* Food Icon & Info */}
      <button
        onClick={() => onShowInfo(food)}
        className="flex-1 flex items-center gap-4 text-left hover:bg-white/50 rounded-xl p-3 transition-all duration-200"
      >
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg text-white shadow-sm"
          style={{ backgroundColor: categoryColor }}
        >
          {categoryIcon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm leading-tight">
            {food.shortName || food.name.substring(0, 30)}
            {food.name.length > 30 && '...'}
          </div>
          <div className="text-xs text-gray-500 capitalize mt-1">
            {food.category}
          </div>
        </div>

        {/* Age Indicator with WHO compliance */}
        <div className="flex items-center gap-2">
          <div 
            className="px-2 py-1 rounded-lg text-xs font-medium text-white"
            style={{ backgroundColor: ageInfo.color }}
          >
            {ageInfo.text}
          </div>
          {showAgeWarning && (
            <div 
              className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shadow-lg"
              title="May be too advanced for child's current age (2-month buffer applied)"
            >
              <span className="text-xs text-white">⚠</span>
            </div>
          )}
        </div>
      </button>

      {/* Simple Add Button */}
      <button
        onClick={() => onAddFood(food)}
        className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm hover:shadow-md flex items-center justify-center"
        title={`Add ${food.shortName || food.name} to meal`}
      >
        +
      </button>
    </div>
  );
}