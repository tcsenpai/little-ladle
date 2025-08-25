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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Modern Material Header */}
      <header className="bg-white shadow-sm">
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                <span className="text-2xl">🍽️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  PappoBot
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                  WHO-Compliant Baby Nutrition Tracker
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsAutoChefModalOpen(true)}
                className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Auto-Chef
              </button>
              <button
                onClick={() => setIsAddFoodModalOpen(true)}
                className="inline-flex items-center px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Food
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-6 py-8">
        {/* Child Profile Section */}
        <div className="mb-8">
          <ChildProfileBar
            profile={childProfile}
            onEditProfile={handleEditChildProfile}
            onCreateProfile={handleCreateChildProfile}
          />
        </div>

        {/* Modern Serving Size Selector */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Serving Size</h3>
                <p className="text-sm text-gray-500">Select portion size for each food item</p>
              </div>
              <div className="flex items-center space-x-2">
                {SERVING_OPTIONS.map(grams => (
                  <button
                    key={grams}
                    onClick={() => setSelectedServingSize(grams)}
                    className={`
                      px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                      ${selectedServingSize === grams
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {grams}g
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          
          {/* Food Browse Panel */}
          <div className="lg:col-span-3">
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

          {/* Meal Tower */}
          <div className="lg:col-span-4">
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

          {/* Info and Compliance Panels */}
          <div className="lg:col-span-5 space-y-6">
            {/* Food Details Panel */}
            <div className="min-h-[320px]">
              <FoodInfoPanel 
                food={selectedFood}
              />
            </div>
            
            {/* WHO Compliance Panel */}
            <div className="min-h-[384px]">
              <WHOCompliancePanel
                mealFoods={mealFoods}
                childProfile={childProfile}
              />
            </div>
          </div>
        </div>
      </main>

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