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
  selectedServingSize: number;
  servingOptions: readonly number[];
  onServingSizeChange: (size: number) => void;
}

const categoryIcons = {
  fruit: '🍎',
  vegetable: '🥦',
  protein: '🍗',
  grain: '🌾',
  dairy: '🥛',
  other: '🍽️'
} as const;

const categoryDescriptions = {
  fruit: 'Natural sweetness & vitamins',
  vegetable: 'Essential minerals & fiber',
  protein: 'Growth & development',
  grain: 'Energy & complex carbs',
  dairy: 'Calcium & healthy fats',
  other: 'Special ingredients'
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
  childProfile,
  selectedServingSize,
  servingOptions,
  onServingSizeChange
}: FoodBrowsePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomServing, setIsCustomServing] = useState(false);
  const [customServingValue, setCustomServingValue] = useState('');

  const handleServingChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomServing(true);
      setCustomServingValue(selectedServingSize.toString());
    } else {
      setIsCustomServing(false);
      onServingSizeChange(Number(value));
    }
  };

  const handleCustomServingChange = (value: string) => {
    setCustomServingValue(value);
    const numValue = Number(value);
    if (numValue > 0 && numValue <= 200) { // Reasonable limits for baby food
      onServingSizeChange(numValue);
    }
  };

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
    <div className="bg-gradient-to-b from-white/90 to-white/70 dark:from-slate-800/90 dark:to-slate-900/70 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-white/50 dark:border-slate-600/50 h-full transition-colors duration-300">
      {/* Header */}
      <div className="p-6 border-b-2 border-emerald-100 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-xl">🥗</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800 dark:text-slate-100 transition-colors duration-300">Food Collection</h2>
            <p className="text-sm text-gray-600 dark:text-slate-300 transition-colors duration-300">Choose your ingredients!</p>
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
              className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-gray-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none text-sm bg-white/90 dark:bg-slate-700/90 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 transition-colors duration-300"
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
        
        {/* Serving Size Dropdown */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 min-w-0 flex items-center gap-2 transition-colors duration-300">
              <span className="text-lg">🥄</span>
              Serving Size:
            </label>
            <select
              value={isCustomServing ? 'custom' : selectedServingSize}
              onChange={(e) => handleServingChange(e.target.value)}
              className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-gray-900 dark:text-slate-100 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none transition-colors duration-200 hover:border-gray-400 dark:hover:border-slate-500"
            >
              {servingOptions.map(grams => (
                <option key={grams} value={grams}>
                  {grams}g {grams === 5 ? '(taste)' : grams === 10 ? '(small)' : grams === 15 ? '(medium)' : '(large)'}
                </option>
              ))}
              <option value="custom">Custom amount</option>
            </select>
          </div>
          
          {/* Custom Serving Input */}
          {isCustomServing && (
            <div className="mt-2 pl-14">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={customServingValue}
                  onChange={(e) => handleCustomServingChange(e.target.value)}
                  placeholder="Enter grams"
                  min="1"
                  max="200"
                  className="w-20 px-2 py-1 bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-gray-900 dark:text-slate-100 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none transition-colors duration-200"
                />
                <span className="text-xs text-gray-600 dark:text-slate-400 font-medium transition-colors duration-300">grams (1-200g)</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Category Power-Up Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map(category => {
            const categoryColor = category !== 'all' ? categoryColors[category as keyof typeof categoryColors] : '#6B7280';
            const isActive = activeCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`
                  relative group p-3 rounded-2xl text-xs font-black transition-all duration-300 transform hover:scale-105 shadow-md overflow-hidden
                  ${isActive
                    ? 'text-white shadow-xl scale-105'
                    : 'bg-white text-gray-700 hover:shadow-lg border-2 hover:border-opacity-50'
                  }
                `}
                style={{
                  backgroundColor: isActive ? categoryColor : 'white',
                  borderColor: isActive ? 'transparent' : `${categoryColor}40`
                }}
              >
                {/* Background pattern for active state */}
                {isActive && (
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.1) 75%)`
                    }}
                  />
                )}
                
                <div className="relative flex flex-col items-center gap-2">
                  <div 
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-100 group-hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : `${categoryColor}15`,
                      color: isActive ? 'white' : categoryColor
                    }}
                  >
                    <span className="text-lg">
                      {category === 'all' ? '🍽️' : categoryIcons[category as keyof typeof categoryIcons]}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="font-black text-xs leading-tight">
                      {categoryNames[category]}
                    </div>
                    {category !== 'all' && (
                      <div className={`text-xs opacity-75 leading-tight mt-0.5 ${
                        isActive ? 'text-white' : 'text-gray-500'
                      }`}>
                        {categoryDescriptions[category as keyof typeof categoryDescriptions]}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Hover glow effect */}
                <div 
                  className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
                    isActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-20'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${categoryColor}20, ${categoryColor}40)`
                  }}
                />
              </button>
            );
          })}
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
  
  // Calculate basic nutrition preview for hover tooltip
  const nutritionPreview = {
    calories: food.nutrients.calories?.amount || 0,
    protein: food.nutrients.protein?.amount || 0,
    iron: food.nutrients.iron?.amount || 0,
    calcium: food.nutrients.calcium?.amount || 0
  };

  return (
    <div 
      data-food-id={food.fdcId}
      className={`
        group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border-2 transform hover:scale-[1.02] relative
        ${isSelected 
          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-indigo-300 dark:border-indigo-600 shadow-xl' 
          : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-slate-700 dark:hover:to-slate-600 hover:border-gray-300 dark:hover:border-slate-500 shadow-md hover:shadow-xl'
        }
      `}
      style={{
        boxShadow: isSelected 
          ? `0 8px 25px -5px ${categoryColor}30, 0 4px 6px -2px ${categoryColor}20` 
          : undefined
      }}
    >
      {/* Nutrition Preview Tooltip */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-900 dark:bg-slate-800 text-white dark:text-slate-100 text-xs rounded-xl px-4 py-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 whitespace-nowrap shadow-2xl border border-gray-700 dark:border-slate-600">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="text-orange-400">🔥</span>
            {Math.round(nutritionPreview.calories)} cal
          </span>
          <span className="flex items-center gap-1">
            <span className="text-purple-400">💪</span>
            {nutritionPreview.protein.toFixed(1)}g protein
          </span>
          <span className="flex items-center gap-1">
            <span className="text-red-400">🩸</span>
            {nutritionPreview.iron.toFixed(1)}mg iron
          </span>
          <span className="flex items-center gap-1">
            <span className="text-blue-400">🦴</span>
            {Math.round(nutritionPreview.calcium)}mg calcium
          </span>
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-slate-800"></div>
      </div>
      {/* Food Icon & Info */}
      <button
        onClick={() => onShowInfo(food)}
        className="flex-1 flex items-center gap-4 text-left hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-xl p-3 transition-all duration-200"
      >
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl text-white shadow-lg ring-2 ring-white/20 transition-all duration-300 group-hover:scale-110"
          style={{ 
            backgroundColor: categoryColor,
            boxShadow: `0 4px 12px ${categoryColor}30, 0 0 0 1px ${categoryColor}20`
          }}
        >
          {categoryIcon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 dark:text-slate-100 text-sm leading-tight group-hover:text-gray-700 dark:group-hover:text-slate-200 transition-colors duration-200">
            {food.shortName || food.name.substring(0, 30)}
            {food.name.length > 30 && '...'}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div 
              className="text-xs font-bold px-2 py-0.5 rounded-lg text-white shadow-sm"
              style={{ backgroundColor: categoryColor }}
            >
              {food.category}
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400">
              {categoryDescriptions[food.category]}
            </div>
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

      {/* Enhanced Add Button with Success Feedback */}
      <button
        onClick={() => onAddFood(food)}
        className="add-food-btn w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-black text-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300 focus:ring-offset-2 shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-110 hover:rotate-12 active:scale-95 relative overflow-hidden group"
        title={`Add ${food.shortName || food.name} to meal`}
      >
        {/* Success ripple effect */}
        <div className="absolute inset-0 bg-white rounded-2xl opacity-0 group-active:opacity-20 transition-opacity duration-150"></div>
        <span className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">+</span>
        
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm scale-110"></div>
      </button>
    </div>
  );
}