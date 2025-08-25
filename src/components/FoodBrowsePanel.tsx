import React, { useState, useMemo, memo, useCallback } from 'react';
import { Food } from '../types/food';
import { ChildProfile } from '../types/child';
import { categoryColors } from '../data/foodData';
import { isAgeAppropriate } from '../utils/whoCompliance';
import { calculateAge } from '../utils/ageCalculation';
import { MEAL_CONFIG, DEBOUNCE_DELAYS } from '../constants/config';

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

const FoodBrowsePanelComponent: React.FC<FoodBrowsePanelProps> = ({
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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomServing, setIsCustomServing] = useState(false);
  const [customServingValue, setCustomServingValue] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    nutrientFocus: 'all', // 'iron', 'protein', 'calcium', 'all'
    textureType: 'all', // 'smooth', 'chunky', 'finger', 'all'
    allergenFree: 'all' // 'dairy-free', 'gluten-free', 'all'
  });

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

  // Enhanced smart filtering logic
  const filteredFoods = useMemo(() => {
    let result = foods;
    
    // Filter by category first
    if (activeCategory !== 'all') {
      result = result.filter(food => food.category === activeCategory);
    }
    
    // Filter by search query with enhanced matching
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(food => 
        food.name.toLowerCase().includes(query) ||
        food.shortName?.toLowerCase().includes(query) ||
        food.category.toLowerCase().includes(query) ||
        // Enhanced nutrient-based search
        (query.includes('iron') && (food.nutrients.iron?.amount ?? 0) > 1) ||
        (query.includes('protein') && (food.nutrients.protein?.amount ?? 0) > 3) ||
        (query.includes('calcium') && (food.nutrients.calcium?.amount ?? 0) > 10) ||
        // Texture-based search
        (query.includes('smooth') && ['banana', 'avocado', 'sweet potato'].some(smooth => food.name.toLowerCase().includes(smooth))) ||
        (query.includes('finger') && ['cheese', 'crackers', 'blueberries'].some(finger => food.name.toLowerCase().includes(finger)))
      );
    }
    
    // Apply nutrient focus filter
    if (searchFilters.nutrientFocus !== 'all') {
      result = result.filter(food => {
        switch (searchFilters.nutrientFocus) {
          case 'iron':
            return (food.nutrients.iron?.amount ?? 0) > 1;
          case 'protein':
            return (food.nutrients.protein?.amount ?? 0) > 3;
          case 'calcium':
            return (food.nutrients.calcium?.amount ?? 0) > 10;
          default:
            return true;
        }
      });
    }
    
    // Apply texture type filter (simplified categorization)
    if (searchFilters.textureType !== 'all') {
      result = result.filter(food => {
        const foodName = food.name.toLowerCase();
        switch (searchFilters.textureType) {
          case 'smooth':
            return ['banana', 'avocado', 'sweet potato', 'applesauce', 'yogurt'].some(smooth => foodName.includes(smooth));
          case 'finger':
            return ['cheese', 'crackers', 'blueberries', 'cheerios', 'toast'].some(finger => foodName.includes(finger));
          case 'chunky':
            return ['chicken', 'beef', 'broccoli', 'carrots', 'rice'].some(chunky => foodName.includes(chunky));
          default:
            return true;
        }
      });
    }
    
    // Apply allergen-free filter (simplified)
    if (searchFilters.allergenFree !== 'all') {
      result = result.filter(food => {
        const foodName = food.name.toLowerCase();
        switch (searchFilters.allergenFree) {
          case 'dairy-free':
            return !['milk', 'cheese', 'yogurt', 'butter'].some(dairy => foodName.includes(dairy));
          case 'gluten-free':
            return !['wheat', 'bread', 'crackers', 'cereal'].some(gluten => foodName.includes(gluten));
          default:
            return true;
        }
      });
    }
    
    return result;
  }, [foods, activeCategory, searchQuery, searchFilters]);

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
        
        {/* Smart Search Filters */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-slate-400 transition-colors duration-300">🎯 Smart Filters:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Nutrient Focus Filter */}
            <select
              value={searchFilters.nutrientFocus}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, nutrientFocus: e.target.value }))}
              className="px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-xs font-medium text-gray-900 dark:text-slate-100 focus:border-indigo-400 dark:focus:border-indigo-400 focus:outline-none transition-colors duration-200"
            >
              <option value="all">All Nutrients</option>
              <option value="iron">🩸 High Iron</option>
              <option value="protein">💪 High Protein</option>
              <option value="calcium">🦴 High Calcium</option>
            </select>
            
            {/* Texture Type Filter */}
            <select
              value={searchFilters.textureType}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, textureType: e.target.value }))}
              className="px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-xs font-medium text-gray-900 dark:text-slate-100 focus:border-indigo-400 dark:focus:border-indigo-400 focus:outline-none transition-colors duration-200"
            >
              <option value="all">All Textures</option>
              <option value="smooth">🥄 Smooth/Pureed</option>
              <option value="finger">👶 Finger Foods</option>
              <option value="chunky">🍽️ Chunky/Textured</option>
            </select>
            
            {/* Allergen-Free Filter */}
            <select
              value={searchFilters.allergenFree}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, allergenFree: e.target.value }))}
              className="px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-xs font-medium text-gray-900 dark:text-slate-100 focus:border-indigo-400 dark:focus:border-indigo-400 focus:outline-none transition-colors duration-200"
            >
              <option value="all">All Foods</option>
              <option value="dairy-free">🚫🥛 Dairy-Free</option>
              <option value="gluten-free">🚫🌾 Gluten-Free</option>
            </select>
          </div>
          
          {/* Active Filters Display */}
          {(searchFilters.nutrientFocus !== 'all' || searchFilters.textureType !== 'all' || searchFilters.allergenFree !== 'all') && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs text-gray-500 dark:text-slate-500">Active:</span>
              {searchFilters.nutrientFocus !== 'all' && (
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded-lg font-medium">
                  {searchFilters.nutrientFocus === 'iron' ? '🩸 High Iron' : 
                   searchFilters.nutrientFocus === 'protein' ? '💪 High Protein' : 
                   '🦴 High Calcium'}
                </span>
              )}
              {searchFilters.textureType !== 'all' && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-lg font-medium">
                  {searchFilters.textureType === 'smooth' ? '🥄 Smooth' : 
                   searchFilters.textureType === 'finger' ? '👶 Finger Foods' : 
                   '🍽️ Chunky'}
                </span>
              )}
              {searchFilters.allergenFree !== 'all' && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-lg font-medium">
                  {searchFilters.allergenFree === 'dairy-free' ? '🚫🥛 Dairy-Free' : '🚫🌾 Gluten-Free'}
                </span>
              )}
              <button
                onClick={() => setSearchFilters({ nutrientFocus: 'all', textureType: 'all', allergenFree: 'all' })}
                className="px-2 py-1 bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300 text-xs rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-slate-500 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
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
                  {grams}g • {grams === 5 ? '🥄 Tiny taste (1 tsp)' : grams === 10 ? '🍓 Small bite (2 tsp)' : grams === 15 ? '🫐 Medium portion (1 tbsp)' : '🍇 Large serving (4 tsp)'}
                </option>
              ))}
              <option value="custom">🎯 Custom amount</option>
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
          
          {/* Visual Portion Guide */}
          {!isCustomServing && (
            <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl border border-blue-200 dark:border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">👶</span>
                <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">Visual Portion Guide</span>
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-200 space-y-1">
                {selectedServingSize === 5 && (
                  <div>🥄 <strong>Tiny taste (5g)</strong> • Perfect for first tries • About 1 teaspoon • Size of baby's fingertip</div>
                )}
                {selectedServingSize === 10 && (
                  <div>🍓 <strong>Small bite (10g)</strong> • Early feeding • About 2 teaspoons • Size of a grape</div>
                )}
                {selectedServingSize === 15 && (
                  <div>🫐 <strong>Medium portion (15g)</strong> • Regular serving • About 1 tablespoon • Size of a large berry</div>
                )}
                {selectedServingSize === 20 && (
                  <div>🍇 <strong>Large serving (20g)</strong> • For hungry babies • About 4 teaspoons • Size of a walnut</div>
                )}
                {!servingOptions.includes(selectedServingSize) && (
                  <div>🎯 <strong>Custom amount ({selectedServingSize}g)</strong> • Your personalized serving size</div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Search Results Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              {filteredFoods.length} food{filteredFoods.length !== 1 ? 's' : ''} found
            </span>
            {(searchQuery || searchFilters.nutrientFocus !== 'all' || searchFilters.textureType !== 'all' || searchFilters.allergenFree !== 'all') && (
              <span className="text-xs text-gray-500 dark:text-slate-500">
                (filtered from {foods.length})
              </span>
            )}
          </div>
          {filteredFoods.length === 0 && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchFilters({ nutrientFocus: 'all', textureType: 'all', allergenFree: 'all' });
                onCategoryChange('all');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Search Hints */}
        {searchQuery.trim() && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
            <div className="text-xs text-blue-800 dark:text-blue-300 font-medium mb-1">💡 Search Tips:</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <div>• Try "iron", "protein", or "calcium" to find nutrient-rich foods</div>
              <div>• Use "smooth", "finger", or "chunky" to find foods by texture</div>
              <div>• Search by category like "fruit", "vegetable", "protein"</div>
            </div>
          </div>
        )}

        {/* Compact Category Icons Bar */}
        <div className="flex items-center justify-center gap-1 py-2 mb-4 bg-gradient-to-r from-gray-50 to-white dark:from-slate-700 dark:to-slate-800 rounded-xl border border-gray-200 dark:border-slate-600 transition-colors duration-300 overflow-x-auto">
          {categories.map(category => {
            const categoryColor = category !== 'all' ? categoryColors[category as keyof typeof categoryColors] : '#6B7280';
            const isActive = activeCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`
                  relative group flex flex-col items-center px-2 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex-shrink-0
                  ${isActive 
                    ? 'bg-white dark:bg-slate-600 shadow-md ring-2' 
                    : 'hover:bg-white/50 dark:hover:bg-slate-600/50'
                  }
                `}
                style={{ 
                  ringColor: isActive ? categoryColor : 'transparent'
                }}
                title={`${categoryNames[category]} - ${category === 'all' ? 'All foods' : categoryDescriptions[category as keyof typeof categoryDescriptions]}`}
              >
                <div 
                  className="text-xl mb-0.5 transition-all duration-200 group-hover:scale-110"
                  style={{ 
                    filter: isActive ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' : 'none'
                  }}
                >
                  {category === 'all' ? '🍽️' : categoryIcons[category as keyof typeof categoryIcons]}
                </div>
                <div 
                  className={`text-xs font-bold transition-colors duration-200 leading-tight ${
                    isActive 
                      ? 'text-gray-800 dark:text-slate-100' 
                      : 'text-gray-600 dark:text-slate-400 group-hover:text-gray-800 dark:group-hover:text-slate-200'
                  }`}
                >
                  {category === 'all' ? 'All' : categoryNames[category]}
                </div>
                {isActive && (
                  <div 
                    className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: categoryColor }}
                  ></div>
                )}
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
};

// Memoize the component for better performance
export const FoodBrowsePanel = memo(FoodBrowsePanelComponent, (prevProps, nextProps) => {
  return (
    prevProps.activeCategory === nextProps.activeCategory &&
    prevProps.selectedServingSize === nextProps.selectedServingSize &&
    prevProps.selectedFood?.fdcId === nextProps.selectedFood?.fdcId &&
    prevProps.childProfile?.id === nextProps.childProfile?.id &&
    prevProps.foods.length === nextProps.foods.length
  );
});

interface FoodBrowseItemProps {
  food: Food;
  isSelected: boolean;
  onAddFood: (food: Food) => void;
  onShowInfo: (food: Food) => void;
  childProfile?: ChildProfile | null;
}

const FoodBrowseItem: React.FC<FoodBrowseItemProps> = ({ food, isSelected, onAddFood, onShowInfo, childProfile }) => {
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
        group flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl transition-all duration-300 border-2 transform hover:scale-[1.02] active:scale-[0.98] relative touch-manipulation
        ${isSelected 
          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-indigo-300 dark:border-indigo-600 shadow-xl' 
          : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-slate-700 dark:hover:to-slate-600 hover:border-gray-300 dark:hover:border-slate-500 shadow-md hover:shadow-xl active:shadow-sm'
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

      {/* Touch-Optimized Add Button */}
      <button
        onClick={() => onAddFood(food)}
        className="add-food-btn min-w-[48px] min-h-[48px] w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:from-emerald-700 active:to-emerald-800 text-white rounded-2xl font-black text-lg md:text-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-300 focus:ring-offset-2 shadow-lg hover:shadow-xl active:shadow-md flex items-center justify-center transform hover:scale-110 hover:rotate-12 active:scale-90 relative overflow-hidden group touch-manipulation flex-shrink-0"
        title={`Add ${food.shortName || food.name} to meal`}
      >
        {/* Touch feedback ripple effect */}
        <div className="absolute inset-0 bg-white rounded-2xl opacity-0 group-active:opacity-30 transition-opacity duration-100"></div>
        <span className="relative z-10 transform group-hover:scale-110 group-active:scale-95 transition-transform duration-200">+</span>
        
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm scale-110"></div>
        
        {/* Touch state indicator */}
        <div className="absolute inset-0 bg-emerald-300 rounded-2xl opacity-0 group-active:opacity-20 transition-opacity duration-75"></div>
      </button>
    </div>
  );
};