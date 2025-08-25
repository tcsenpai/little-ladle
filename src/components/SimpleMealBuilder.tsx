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
import { DarkModeToggle } from './DarkModeToggle';
import { QuickStartTemplates } from './QuickStartTemplates';

// USDA standard serving sizes in grams
const SERVING_OPTIONS = [5, 10, 15, 20] as const;

export function SimpleMealBuilder() {
  const [mealFoods, setMealFoods] = useState<MealFood[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [activeCategory, setActiveCategory] = useState<Food['category'] | 'all'>('all');
  const [selectedServingSize, setSelectedServingSize] = useState<number>(10); // Default 10g
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [availableFoods, setAvailableFoods] = useState<Food[]>(foods); // Dynamic food list
  
  // Child profile state - supporting multiple children
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [activeChildProfile, setActiveChildProfile] = useState<ChildProfile | null>(null);
  const [isChildProfileModalOpen, setIsChildProfileModalOpen] = useState(false);
  const [isAutoChefModalOpen, setIsAutoChefModalOpen] = useState(false);
  const [isQuickStartTemplatesOpen, setIsQuickStartTemplatesOpen] = useState(false);

  // Load child profiles from localStorage on mount
  useEffect(() => {
    const savedProfiles = localStorage.getItem('pappobot-child-profiles');
    const savedActiveId = localStorage.getItem('pappobot-active-child-id');
    
    if (savedProfiles) {
      try {
        const profiles = JSON.parse(savedProfiles);
        setChildProfiles(profiles);
        
        if (savedActiveId && profiles.length > 0) {
          const activeProfile = profiles.find((p: ChildProfile) => p.id === savedActiveId) || profiles[0];
          setActiveChildProfile(activeProfile);
        } else if (profiles.length > 0) {
          setActiveChildProfile(profiles[0]);
        }
      } catch (error) {
        console.error('Failed to load child profiles:', error);
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
    
    // Add satisfying feedback animation
    const button = document.querySelector(`[data-food-id="${food.fdcId}"] .add-food-btn`);
    if (button) {
      button.classList.add('animate-celebrate');
      setTimeout(() => {
        button.classList.remove('animate-celebrate');
      }, 600);
    }
    
    setMealFoods(prev => [newMealFood, ...prev]); // Add to top of tower with animation
  }, [selectedServingSize]);

  const handleRemoveFood = useCallback((foodId: string) => {
    console.log('Removing food from meal:', foodId);
    
    // Add removal animation before actually removing
    const foodElement = document.querySelector(`[data-meal-food-id="${foodId}"]`);
    if (foodElement) {
      foodElement.classList.add('animate-fadeOut');
      setTimeout(() => {
        setMealFoods(prev => prev.filter(mealFood => mealFood.id !== foodId));
      }, 200); // Match fadeOut animation duration
    } else {
      setMealFoods(prev => prev.filter(mealFood => mealFood.id !== foodId));
    }
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
    setChildProfiles(prev => {
      const existing = prev.find(p => p.id === profile.id);
      let newProfiles;
      
      if (existing) {
        // Update existing profile
        newProfiles = prev.map(p => p.id === profile.id ? profile : p);
      } else {
        // Add new profile
        newProfiles = [...prev, profile];
      }
      
      localStorage.setItem('pappobot-child-profiles', JSON.stringify(newProfiles));
      return newProfiles;
    });
    
    setActiveChildProfile(profile);
    localStorage.setItem('pappobot-active-child-id', profile.id);
    console.log('Saved child profile:', profile.name);
  }, []);
  
  const handleSelectChildProfile = useCallback((profile: ChildProfile) => {
    setActiveChildProfile(profile);
    localStorage.setItem('pappobot-active-child-id', profile.id);
    console.log('Selected child profile:', profile.name);
  }, []);

  const handleEditChildProfile = useCallback(() => {
    setIsChildProfileModalOpen(true);
  }, []);

  const handleCreateChildProfile = useCallback(() => {
    setIsChildProfileModalOpen(true);
  }, []);

  const handleApplyTemplate = useCallback((templateFoods: MealFood[]) => {
    console.log('Applying meal template with', templateFoods.length, 'foods');
    
    // Clear current meal first
    setMealFoods([]);
    
    // Add template foods with staggered animation
    templateFoods.forEach((mealFood, index) => {
      setTimeout(() => {
        setMealFoods(prev => [...prev, mealFood]);
      }, index * 150); // 150ms delay between each food
    });
  }, []);

  const handleApplySuggestion = useCallback((suggestion: AutoChefSuggestion) => {
    console.log('Applying auto-chef suggestion:', suggestion.name);
    
    // Clear current meal first (always, even if empty)
    setMealFoods([]);
    
    // Create new meal foods from suggestion
    const newMealFoods: MealFood[] = suggestion.foods.map((food, index) => ({
      id: `suggested-${Date.now()}-${index}`,
      food: food.food,
      servingGrams: food.servingGrams,
      addedAt: Date.now() + index
    }));
    
    // If there were existing foods, add animation delay
    if (mealFoods.length > 0) {
      const tower = document.querySelector('[data-meal-tower]');
      if (tower) {
        tower.classList.add('animate-fadeOut');
        setTimeout(() => {
          // Add foods with staggered timing for smooth effect
          newMealFoods.forEach((mealFood, index) => {
            setTimeout(() => {
              setMealFoods(prev => [...prev, mealFood]);
            }, index * 150); // 150ms delay between each food
          });
          tower.classList.remove('animate-fadeOut');
        }, 200);
      } else {
        // Fallback: add foods with stagger effect
        newMealFoods.forEach((mealFood, index) => {
          setTimeout(() => {
            setMealFoods(prev => [...prev, mealFood]);
          }, index * 100);
        });
      }
    } else {
      // No existing foods, add immediately with stagger effect
      newMealFoods.forEach((mealFood, index) => {
        setTimeout(() => {
          setMealFoods(prev => [...prev, mealFood]);
        }, index * 100); // Faster animation when starting from empty
      });
    }
  }, [mealFoods.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Modern Material Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700 transition-colors duration-300">
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-md">
                <span className="text-2xl">🍽️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">
                  PappoBot
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-300 font-medium transition-colors duration-300">
                  WHO-Compliant Baby Nutrition Tracker
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <DarkModeToggle />
              <button
                onClick={() => setIsQuickStartTemplatesOpen(true)}
                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transform hover:scale-105"
              >
                <span className="text-sm mr-2">🚀</span>
                Quick-Start
              </button>
              <button
                onClick={() => setIsAutoChefModalOpen(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 active:from-emerald-700 active:to-green-700 text-white text-sm font-black rounded-xl shadow-lg hover:shadow-xl active:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transform hover:scale-105 active:scale-95 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <span className="text-lg mr-2 relative z-10">⚡</span>
                <span className="relative z-10">Auto-Chef</span>
                <div className="ml-2 px-2 py-1 bg-white/20 rounded-lg text-xs font-bold relative z-10 animate-pulse">AI</div>
              </button>
              <button
                onClick={() => setIsAddFoodModalOpen(true)}
                className="inline-flex items-center px-5 py-2.5 bg-white dark:bg-slate-700 hover:bg-orange-50 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 hover:text-orange-700 dark:hover:text-orange-400 text-sm font-semibold rounded-xl border border-orange-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
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
        <div className="mb-4">
          <ChildProfileBar
            profiles={childProfiles}
            activeProfile={activeChildProfile}
            onSelectProfile={handleSelectChildProfile}
            onEditProfile={handleEditChildProfile}
            onCreateProfile={handleCreateChildProfile}
          />
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
              childProfile={activeChildProfile}
              selectedServingSize={selectedServingSize}
              servingOptions={SERVING_OPTIONS}
              onServingSizeChange={setSelectedServingSize}
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
          <div className="lg:col-span-5 space-y-3">
            {/* WHO Compliance Panel - Now on top and thinner */}
            <div className="min-h-[280px]">
              <WHOCompliancePanel
                mealFoods={mealFoods}
                childProfile={activeChildProfile}
              />
            </div>
            
            {/* Food Details Panel - Now below with reduced gap */}
            <div className="min-h-[320px]">
              <FoodInfoPanel 
                food={selectedFood}
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
        existingProfile={activeChildProfile}
      />

      {/* Auto-Chef Modal */}
      <AutoChefModal
        isOpen={isAutoChefModalOpen}
        onClose={() => setIsAutoChefModalOpen(false)}
        mealFoods={mealFoods}
        childProfile={activeChildProfile}
        availableFoods={availableFoods}
        onAddFood={handleAddFood}
        onApplySuggestion={handleApplySuggestion}
      />

      {/* Quick-Start Templates Modal */}
      <QuickStartTemplates
        isOpen={isQuickStartTemplatesOpen}
        onClose={() => setIsQuickStartTemplatesOpen(false)}
        onApplyTemplate={handleApplyTemplate}
        childProfile={activeChildProfile}
      />
    </div>
  );
}