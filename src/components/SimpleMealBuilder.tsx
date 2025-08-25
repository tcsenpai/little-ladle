import React, { useState, useCallback, useEffect } from 'react';
import { FoodBrowsePanel } from './FoodBrowsePanel';
import { MealTower } from './MealTower';
import { FoodInfoPanel } from './FoodInfoPanel';
import { AddFoodModal } from './AddFoodModal';
import { ChildProfileModal } from './ChildProfileModal';
import { ChildProfileBar } from './ChildProfileBar';
import { WHOCompliancePanel } from './WHOCompliancePanel';
import { AutoChefModal } from './AutoChefModal';
import { foods, getFoodsByCategory } from '../data/foodData';
import { Food } from '../types/food';
import { ChildProfile } from '../types/child';
import { MealFood } from '../utils/whoCompliance';
import { AutoChefSuggestion } from '../utils/autoChef';

// USDA standard serving sizes in grams
const SERVING_OPTIONS = [5, 10, 15, 20] as const;

export function SimpleMealBuilder() {
  const [mealFoods, setMealFoods] = useState<MealFood[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [activeCategory, setActiveCategory] = useState<Food['category'] | 'all'>('all');
  const [selectedServingSize, setSelectedServingSize] = useState<number>(10); // Default 10g
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [availableFoods, setAvailableFoods] = useState<Food[]>(foods); // Dynamic food list
  
  // Child profile state
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [isChildProfileModalOpen, setIsChildProfileModalOpen] = useState(false);
  const [isAutoChefModalOpen, setIsAutoChefModalOpen] = useState(false);

  // Load child profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('pappobot-child-profile');
    if (savedProfile) {
      try {
        setChildProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Failed to load child profile:', error);
      }
    }
  }, []);

  // No need to filter here anymore - FoodBrowsePanel handles filtering internally

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
      servingGrams: selectedServingSize,
      addedAt: Date.now()
    };
    
    console.log('Adding food to meal:', food.name, 'with serving size:', selectedServingSize, 'g');
    setMealFoods(prev => [newMealFood, ...prev]); // Add to top of tower
  }, [selectedServingSize]);

  const handleRemoveFood = useCallback((foodId: string) => {
    console.log('Removing food from meal:', foodId);
    setMealFoods(prev => prev.filter(mealFood => mealFood.id !== foodId));
  }, []);

  const handleUpdateServing = useCallback((foodId: string, newServingGrams: number) => {
    console.log('Updating serving for:', foodId, 'to:', newServingGrams, 'g');
    setMealFoods(prev => 
      prev.map(mealFood => 
        mealFood.id === foodId 
          ? { ...mealFood, servingGrams: newServingGrams }
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

  const handleAddNewFood = useCallback((food: Food) => {
    // Add to the dynamic food list
    setAvailableFoods(prev => [...prev, food]);
    console.log('Added new food to database:', food.name);
    setIsAddFoodModalOpen(false);
  }, []);

  const handleSaveChildProfile = useCallback((profile: ChildProfile) => {
    setChildProfile(profile);
    localStorage.setItem('pappobot-child-profile', JSON.stringify(profile));
    console.log('Saved child profile:', profile.name);
  }, []);

  const handleEditChildProfile = useCallback(() => {
    setIsChildProfileModalOpen(true);
  }, []);

  const handleCreateChildProfile = useCallback(() => {
    setIsChildProfileModalOpen(true);
  }, []);

  const handleApplySuggestion = useCallback((suggestion: AutoChefSuggestion) => {
    // Clear current meal
    setMealFoods([]);
    
    // Add all foods from suggestion
    const newMealFoods: MealFood[] = suggestion.foods.map((food, index) => ({
      id: `suggested-${Date.now()}-${index}`,
      food: food.food,
      servingGrams: food.servingGrams,
      addedAt: Date.now() + index
    }));
    
    setMealFoods(newMealFoods);
    console.log('Applied auto-chef suggestion:', suggestion.name);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-violet-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl border-b-2 border-gradient-to-r from-emerald-200 to-violet-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-transparent bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text flex items-center gap-3">
                🍽️ PappoBot
                <span className="text-lg font-bold text-gray-600">Meal Builder</span>
              </h1>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                🎮 Select serving size → Click + to build Sophie's meal tower!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsAutoChefModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-black text-sm rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center gap-2"
              >
                <span className="text-lg">👨‍🍳</span>
                Auto-Chef
              </button>
              <button
                onClick={() => setIsAddFoodModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-black text-sm rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center gap-2"
              >
                <span className="text-lg">🔍</span>
                Add New Food
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Child Profile Bar */}
        <ChildProfileBar
          profile={childProfile}
          onEditProfile={handleEditChildProfile}
          onCreateProfile={handleCreateChildProfile}
        />

        {/* Compact Serving Selector */}
        <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-emerald-200 shadow-lg">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚖️</span>
              <span className="font-bold text-gray-800 text-sm">Serving Size:</span>
            </div>
            <div className="flex gap-2">
              {SERVING_OPTIONS.map(grams => (
                <button
                  key={grams}
                  onClick={() => setSelectedServingSize(grams)}
                  className={`
                    px-3 py-2 rounded-lg font-bold text-sm transition-all duration-200 
                    ${selectedServingSize === grams
                      ? 'bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-emerald-100 border border-gray-300'
                    }
                  `}
                >
                  {grams}g
                </button>
              ))}
            </div>
            <div className="text-sm font-bold text-emerald-600">
              Active: {selectedServingSize}g
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          
          {/* Food Browse Panel - Left */}
          <div className="col-span-3">
            <FoodBrowsePanel
              foods={availableFoods}
              categories={categories}
              categoryNames={categoryNames}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              onAddFood={handleAddFood}
              onShowInfo={handleFoodInfo}
              selectedFood={selectedFood}
              childProfile={childProfile}
            />
          </div>

          {/* Meal Tower - Center */}
          <div className="col-span-4">
            <MealTower
              mealFoods={mealFoods}
              onRemoveFood={handleRemoveFood}
              onUpdateServing={handleUpdateServing}
              onClearMeal={handleClearMeal}
              onShowInfo={handleFoodInfo}
              selectedFood={selectedFood}
              servingOptions={SERVING_OPTIONS}
            />
          </div>

          {/* Right Column - Split between Food Info and WHO Compliance */}
          <div className="col-span-5 space-y-6">
            {/* Food Details Panel */}
            <div className="h-80">
              <FoodInfoPanel 
                food={selectedFood}
              />
            </div>
            
            {/* WHO Compliance Panel */}
            <div className="h-96">
              <WHOCompliancePanel
                mealFoods={mealFoods}
                childProfile={childProfile}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Food Modal */}
      <AddFoodModal
        isOpen={isAddFoodModalOpen}
        onClose={() => setIsAddFoodModalOpen(false)}
        onAddFood={handleAddNewFood}
      />

      {/* Child Profile Modal */}
      <ChildProfileModal
        isOpen={isChildProfileModalOpen}
        onClose={() => setIsChildProfileModalOpen(false)}
        onSave={handleSaveChildProfile}
        existingProfile={childProfile}
      />

      {/* Auto-Chef Modal */}
      <AutoChefModal
        isOpen={isAutoChefModalOpen}
        onClose={() => setIsAutoChefModalOpen(false)}
        mealFoods={mealFoods}
        childProfile={childProfile}
        availableFoods={availableFoods}
        onAddFood={handleAddFood}
        onApplySuggestion={handleApplySuggestion}
      />
    </div>
  );
}