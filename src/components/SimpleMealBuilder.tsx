import React, { useState, useCallback, useEffect } from 'react';
import { FoodBrowsePanel } from './FoodBrowsePanel';
import { MealTower } from './MealTower';
import { FoodInfoPanel } from './FoodInfoPanel';
import { AddFoodModal } from './AddFoodModal';
import { ChildProfileModal } from './ChildProfileModal';
import { ChildProfileBar } from './ChildProfileBar';
import { WHOCompliancePanel } from './WHOCompliancePanel';
import { AutoChefModal } from './AutoChefModal';
import { RecipesModal } from './RecipesModal';
import { MealHistoryModal } from './MealHistoryModal';
import { SaveMealOptionsModal } from './SaveMealOptionsModal';
import { foods, getFoodsByCategory, loadAllFoods } from '../data/foodData';
import { Food } from '../types/food';
import { ChildProfile } from '../types/child';
import { MealFood } from '../utils/whoCompliance';
import { AutoChefSuggestion } from '../utils/autoChef';
import { DarkModeToggle } from './DarkModeToggle';
import { QuickStartTemplates } from './QuickStartTemplates';
import { MobileDrawer } from './MobileDrawer';
import { ErrorBoundary, MealBuilderErrorFallback } from './ErrorBoundary';

// Import custom hooks
import { useMealManagement } from '../hooks/useMealManagement';
import { useModalManager } from '../hooks/useModalManager';
import { useServingSize } from '../hooks/useServingSize';
import { useMobileResponsive } from '../hooks/useMobileResponsive';

// Import constants
import { MEAL_CONFIG, STORAGE_KEYS, ServingSize } from '../constants/config';
import { dataService } from '../services/dataService';
import { logger, debugLog } from '../utils/logger';

export function SimpleMealBuilder() {
  // Use custom hooks for better organization
  const { mealFoods, addFood, removeFood, updateServingSize, clearMeal, loadRecipe } = useMealManagement();
  const { activeModal, openModal, closeModal, isModalOpen } = useModalManager();
  const { selectedSize, getCurrentSize, selectServingSize, servingOptions } = useServingSize();
  const { isMobile, isMobileDrawerOpen, openMobileDrawer, closeMobileDrawer } = useMobileResponsive();

  // Remaining state
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [activeCategory, setActiveCategory] = useState<Food['category'] | 'all'>('all');
  const [availableFoods, setAvailableFoods] = useState<Food[]>(foods); // Dynamic food list
  
  // Child profile state - supporting multiple children
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [activeChildProfile, setActiveChildProfile] = useState<ChildProfile | null>(null);

  // Load child profiles from server on mount
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const profiles = await dataService.getChildProfiles();
        const savedActiveId = await dataService.getPreference('active-child-id');
        
        setChildProfiles(profiles);
        
        if (savedActiveId && profiles.length > 0) {
          const activeProfile = profiles.find((p: ChildProfile) => p.id === savedActiveId) || profiles[0];
          setActiveChildProfile(activeProfile);
        } else if (profiles.length > 0) {
          setActiveChildProfile(profiles[0]);
        }
      } catch (error) {
        logger.error('Failed to load child profiles:', error);
      }
    };
    
    const loadData = async () => {
      await Promise.all([
        loadProfiles(),
        (async () => {
          const allFoods = await loadAllFoods(); // Load all foods including custom ones
          setAvailableFoods(allFoods); // Update state with loaded foods
        })()
      ]);
    };
    
    loadData();
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
    const servingSize = getCurrentSize();
    debugLog(`Adding food to meal: ${food.name} with serving size: ${servingSize}g`);
    
    // Add satisfying feedback animation
    const button = document.querySelector(`[data-food-id="${food.fdcId}"] .add-food-btn`);
    if (button) {
      button.classList.add('animate-celebrate');
      setTimeout(() => {
        button.classList.remove('animate-celebrate');
      }, 600);
    }
    
    addFood(food, servingSize);
  }, [addFood, getCurrentSize]);

  const handleRemoveFood = useCallback((foodId: string) => {
    debugLog(`Removing food from meal: ${foodId}`);
    
    // Add removal animation before actually removing
    const foodElement = document.querySelector(`[data-meal-food-id="${foodId}"]`);
    if (foodElement) {
      foodElement.classList.add('animate-fadeOut');
      setTimeout(() => {
        removeFood(foodId);
      }, 200); // Match fadeOut animation duration
    } else {
      removeFood(foodId);
    }
  }, [removeFood]);

  const handleUpdateServing = useCallback((foodId: string, newServingGrams: number) => {
    debugLog(`Updating serving for: ${foodId} to: ${newServingGrams}g`);
    updateServingSize(foodId, newServingGrams);
  }, [updateServingSize]);

  const handleFoodInfo = useCallback((food: Food) => {
    debugLog(`Showing info for: ${food.name}`);
    setSelectedFood(food);
  }, []);

  const handleClearMeal = useCallback(() => {
    clearMeal();
  }, [clearMeal]);

  const refreshAvailableFoods = useCallback(async () => {
    try {
      const allFoods = await loadAllFoods();
      setAvailableFoods(allFoods);
      debugLog(`Refreshed available foods, total count: ${allFoods.length}`);
    } catch (error) {
      logger.error('Failed to refresh available foods:', error);
    }
  }, []);

  const handleAddNewFood = useCallback(async (food: Food) => {
    debugLog(`Added new food to database: ${food.name}`);
    await refreshAvailableFoods(); // Refresh from server to get the complete merged list
    closeModal();
  }, [closeModal, refreshAvailableFoods]);

  const handleSaveChildProfile = useCallback(async (profile: ChildProfile) => {
    try {
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
        
        // Save to server
        dataService.saveChildProfiles(newProfiles);
        return newProfiles;
      });
      
      setActiveChildProfile(profile);
      await dataService.setPreference('active-child-id', profile.id);
      debugLog(`Saved child profile: ${profile.name}`);
    } catch (error) {
      logger.error('Failed to save child profile:', error);
    }
  }, []);
  
  const handleSelectChildProfile = useCallback(async (profile: ChildProfile) => {
    try {
      setActiveChildProfile(profile);
      await dataService.setPreference('active-child-id', profile.id);
      debugLog(`Selected child profile: ${profile.name}`);
    } catch (error) {
      logger.error('Failed to select child profile:', error);
    }
  }, []);

  const handleEditChildProfile = useCallback(() => {
    openModal('childProfile');
  }, []);

  const handleCreateChildProfile = useCallback(() => {
    openModal('childProfile');
  }, []);

  const handleApplyTemplate = useCallback((templateFoods: MealFood[]) => {
    debugLog(`Applying meal template with ${templateFoods.length} foods`);
    
    // Clear current meal first
    clearMeal();
    
    // Add template foods with staggered animation
    templateFoods.forEach((mealFood, index) => {
      setTimeout(() => {
        addFood(mealFood.food, mealFood.servingGrams);
      }, index * 150); // 150ms delay between each food
    });
  }, [clearMeal, addFood]);

  const handleApplySuggestion = useCallback((suggestion: AutoChefSuggestion) => {
    debugLog(`Applying auto-chef suggestion: ${suggestion.name}`);
    
    // Clear current meal first (always, even if empty)
    clearMeal();
    
    // If there were existing foods, add animation delay
    if (mealFoods.length > 0) {
      const tower = document.querySelector('[data-meal-tower]');
      if (tower) {
        tower.classList.add('animate-fadeOut');
        setTimeout(() => {
          // Add foods with staggered timing for smooth effect
          suggestion.foods.forEach((food, index) => {
            setTimeout(() => {
              addFood(food.food, food.servingGrams);
            }, index * 150); // 150ms delay between each food
          });
          tower.classList.remove('animate-fadeOut');
        }, 200);
      } else {
        // Fallback: add foods with stagger effect
        suggestion.foods.forEach((food, index) => {
          setTimeout(() => {
            addFood(food.food, food.servingGrams);
          }, index * 100);
        });
      }
    } else {
      // No existing foods, add immediately with stagger effect
      suggestion.foods.forEach((food, index) => {
        setTimeout(() => {
          addFood(food.food, food.servingGrams);
        }, index * 100); // Faster animation when starting from empty
      });
    }
  }, [mealFoods.length, clearMeal, addFood]);

  const saveMealToHistory = useCallback(async () => {
    if (!activeChildProfile || mealFoods.length === 0) {
      return;
    }

    try {
      // Calculate total calories
      const totalCalories = mealFoods.reduce((total, mealFood) => {
        const calories = mealFood.food.nutrients?.calories?.amount || 0;
        return total + (calories * mealFood.servingGrams / 100);
      }, 0);

      // Create meal history entry
      const mealHistoryEntry = {
        id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        childId: activeChildProfile.id,
        childName: activeChildProfile.name,
        date: new Date().toISOString(),
        foods: mealFoods,
        totalCalories,
        createdAt: new Date().toISOString(),
      };

      // Get existing history and add new entry
      const history = await dataService.getMealHistory();
      history.push(mealHistoryEntry);
      
      // Save updated history
      const success = await dataService.saveMealHistory(history);
      
      if (success) {
        debugLog('Meal saved to history', mealHistoryEntry);
        // Optionally clear the meal after saving
        clearMeal();
      } else {
        logger.error('Failed to save meal to history');
      }
    } catch (error) {
      logger.error('Error saving meal to history:', error);
    }
  }, [activeChildProfile, mealFoods, clearMeal]);

  // Save to history without clearing meal
  const saveMealToHistoryOnly = useCallback(async () => {
    if (!activeChildProfile || mealFoods.length === 0) {
      return false;
    }

    try {
      // Calculate total calories
      const totalCalories = mealFoods.reduce((total, mealFood) => {
        const calories = mealFood.food.nutrients?.calories?.amount || 0;
        return total + (calories * mealFood.servingGrams / 100);
      }, 0);

      // Create meal history entry
      const mealHistoryEntry = {
        id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        childId: activeChildProfile.id,
        childName: activeChildProfile.name,
        date: new Date().toISOString(),
        foods: mealFoods,
        totalCalories,
        createdAt: new Date().toISOString(),
      };

      // Get existing history and add new entry
      const history = await dataService.getMealHistory();
      history.push(mealHistoryEntry);
      
      // Save updated history
      const success = await dataService.saveMealHistory(history);
      
      if (success) {
        debugLog('Meal saved to history', mealHistoryEntry);
        return true;
      } else {
        logger.error('Failed to save meal to history');
        return false;
      }
    } catch (error) {
      logger.error('Error saving meal to history:', error);
      return false;
    }
  }, [activeChildProfile, mealFoods]);

  // Handle save meal options
  const handleSaveMealHistory = useCallback(async () => {
    await saveMealToHistory();
    closeModal();
  }, [saveMealToHistory, closeModal]);

  const handleSaveMealRecipe = useCallback(() => {
    // Open the recipes modal for saving
    closeModal();
    openModal('recipes');
  }, [closeModal, openModal]);

  const handleSaveMealBoth = useCallback(async () => {
    // Save to history first (without clearing meal)
    const success = await saveMealToHistoryOnly();
    if (success) {
      // Then open recipes modal with the meal still intact
      closeModal();
      openModal('recipes');
    }
  }, [saveMealToHistoryOnly, closeModal, openModal]);

  const handleSaveMealOptions = useCallback(() => {
    if (mealFoods.length === 0) {
      logger.warn('No foods in meal to save');
      return;
    }
    openModal('saveMealOptions');
  }, [mealFoods.length, openModal]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Mobile-First Responsive Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700 transition-colors duration-300">
        <div className="w-full px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo - Responsive sizing */}
            <div className="flex items-center space-x-3 md:space-x-4 flex-shrink-0">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-md">
                <span className="text-xl md:text-2xl">🍽️</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">
                  Little Ladle
                </h1>
                <p className="text-xs md:text-sm text-gray-500 dark:text-slate-300 font-medium transition-colors duration-300 hidden md:block">
                  WHO-Compliant Baby Nutrition Tracker
                </p>
              </div>
            </div>

            {/* Mobile-Optimized Action Buttons */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Mobile Hamburger Menu - Only visible on mobile */}
              <button
                onClick={openMobileDrawer}
                className="md:hidden flex flex-col items-center justify-center w-10 h-10 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-colors duration-200 space-y-1 touch-manipulation"
                aria-label="Open mobile menu"
              >
                <div className="w-5 h-0.5 bg-gray-600 dark:bg-slate-300 rounded-full"></div>
                <div className="w-5 h-0.5 bg-gray-600 dark:bg-slate-300 rounded-full"></div>
                <div className="w-5 h-0.5 bg-gray-600 dark:bg-slate-300 rounded-full"></div>
              </button>
              
              <DarkModeToggle />
              
              {/* Quick-Start - Hidden on small screens */}
              <button
                onClick={() => openModal('quickStart')}
                className="hidden sm:inline-flex items-center px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs md:text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transform hover:scale-105 active:scale-95 min-h-[44px] touch-manipulation"
              >
                <span className="text-sm mr-1 md:mr-2">🚀</span>
                <span className="hidden md:inline">Quick-Start</span>
                <span className="md:hidden">Quick</span>
              </button>

              {/* Recipes - Hidden on small screens */}
              <button
                onClick={() => openModal('recipes')}
                className="hidden sm:inline-flex items-center px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white text-xs md:text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transform hover:scale-105 active:scale-95 min-h-[44px] touch-manipulation"
              >
                <span className="text-sm mr-1 md:mr-2">📖</span>
                <span className="hidden md:inline">Recipes</span>
                <span className="md:hidden">Save</span>
              </button>

              {/* Meal History - Hidden on small screens */}
              <button
                onClick={() => openModal('mealHistory')}
                className="hidden sm:inline-flex items-center px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs md:text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transform hover:scale-105 active:scale-95 min-h-[44px] touch-manipulation"
              >
                <span className="text-sm mr-1 md:mr-2">📊</span>
                <span className="hidden md:inline">History</span>
                <span className="md:hidden">Log</span>
              </button>
              
              {/* Auto-Chef - Primary action */}
              <button
                onClick={() => openModal('autoChef')}
                className="inline-flex items-center px-3 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 active:from-emerald-700 active:to-green-700 text-white text-xs md:text-sm font-black rounded-xl shadow-lg hover:shadow-xl active:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transform hover:scale-105 active:scale-95 relative overflow-hidden group min-h-[44px] touch-manipulation"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <span className="text-base md:text-lg mr-1 md:mr-2 relative z-10">⚡</span>
                <span className="relative z-10 hidden sm:inline">Auto-Chef</span>
                <span className="relative z-10 sm:hidden">AI</span>
                <div className="ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 md:py-1 bg-white/20 rounded-lg text-xs font-bold relative z-10 animate-pulse">AI</div>
              </button>
              
              {/* Add Food - Compact on mobile */}
              <button
                onClick={() => openModal('addFood')}
                className="inline-flex items-center px-3 md:px-5 py-2.5 bg-white dark:bg-slate-700 hover:bg-orange-50 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 hover:text-orange-700 dark:hover:text-orange-400 text-xs md:text-sm font-semibold rounded-xl border border-orange-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 min-h-[44px] touch-manipulation transform active:scale-95"
              >
                <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">Add Food</span>
                <span className="sm:hidden">Add</span>
              </button>

              {/* Save Meal - Compact on mobile */}
              <button
                onClick={handleSaveMealOptions}
                disabled={!activeChildProfile || mealFoods.length === 0}
                className="inline-flex items-center px-3 md:px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-400 text-white text-xs md:text-sm font-semibold rounded-xl shadow-sm hover:shadow-md disabled:shadow-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 min-h-[44px] touch-manipulation transform hover:scale-105 active:scale-95 disabled:transform-none disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="hidden sm:inline">Save Meal</span>
                <span className="sm:hidden">Save</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 md:px-6 py-4 md:py-8">
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


        {/* Adaptive Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 md:gap-6 w-full">
          
          {/* Food Browse Panel - Full width on mobile, left column on tablet, left sidebar on desktop */}
          <div className="md:col-span-1 xl:col-span-3 order-1">
            <ErrorBoundary fallback={MealBuilderErrorFallback}>
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
                selectedServingSize={selectedSize}
                servingOptions={servingOptions}
                onServingSizeChange={(size: number) => {
                  const validSize = MEAL_CONFIG.SERVING_OPTIONS.includes(size as ServingSize) 
                    ? size as ServingSize 
                    : MEAL_CONFIG.SERVING_OPTIONS[0];
                  selectServingSize(validSize);
                }}
              />
            </ErrorBoundary>
          </div>

          {/* Meal Tower - Center focus on all screens */}
          <div className="md:col-span-1 xl:col-span-4 order-2 md:order-2">
            <ErrorBoundary fallback={MealBuilderErrorFallback}>
              <MealTower
                mealFoods={mealFoods}
                onRemoveFood={handleRemoveFood}
                onUpdateServing={handleUpdateServing}
                onClearMeal={handleClearMeal}
                onShowInfo={handleFoodInfo}
                selectedFood={selectedFood}
                servingOptions={servingOptions}
              />
            </ErrorBoundary>
          </div>

          {/* Info and Compliance Panels - Stack vertically on mobile and tablet */}
          <div className="md:col-span-2 xl:col-span-5 order-3 space-y-3">
            
            {/* Mobile: Stack panels vertically with reduced heights */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-3">
              
              {/* WHO Compliance Panel */}
              <div className="min-h-[200px] md:min-h-[250px] xl:min-h-[280px]">
                <WHOCompliancePanel
                  mealFoods={mealFoods}
                  childProfile={activeChildProfile}
                />
              </div>
              
              {/* Food Details Panel */}
              <div className="min-h-[250px] md:min-h-[300px] xl:min-h-[320px]">
                <FoodInfoPanel 
                  food={selectedFood}
                />
              </div>
              
            </div>
          </div>
        </div>
      </main>

      {/* Add Food Modal */}
      <AddFoodModal
        isOpen={isModalOpen('addFood')}
        onClose={() => closeModal()}
        onAddFood={handleAddNewFood}
      />

      {/* Child Profile Modal */}
      <ChildProfileModal
        isOpen={isModalOpen('childProfile')}
        onClose={() => closeModal()}
        onSave={handleSaveChildProfile}
        existingProfile={activeChildProfile}
      />

      {/* Auto-Chef Modal */}
      <AutoChefModal
        isOpen={isModalOpen('autoChef')}
        onClose={() => closeModal()}
        mealFoods={mealFoods}
        childProfile={activeChildProfile}
        availableFoods={availableFoods}
        onAddFood={handleAddFood}
        onApplySuggestion={handleApplySuggestion}
      />

      {/* Quick-Start Templates Modal */}
      <QuickStartTemplates
        isOpen={isModalOpen('quickStart')}
        onClose={() => closeModal()}
        onApplyTemplate={handleApplyTemplate}
        childProfile={activeChildProfile}
      />

      {/* Recipes Modal */}
      <RecipesModal
        isOpen={isModalOpen('recipes')}
        onClose={() => closeModal()}
        currentMeal={mealFoods}
        onLoadRecipe={loadRecipe}
      />

      {/* Meal History Modal */}
      <MealHistoryModal
        isOpen={isModalOpen('mealHistory')}
        onClose={() => closeModal()}
        childProfile={activeChildProfile}
        onLoadMeal={loadRecipe}
      />

      {/* Save Meal Options Modal */}
      <SaveMealOptionsModal
        isOpen={isModalOpen('saveMealOptions')}
        onClose={() => closeModal()}
        onSaveHistory={handleSaveMealHistory}
        onSaveRecipe={handleSaveMealRecipe}
        onSaveBoth={handleSaveMealBoth}
        mealFoods={mealFoods}
        activeChildProfile={activeChildProfile}
      />

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={closeMobileDrawer}
        onQuickStart={() => openModal('quickStart')}
        onRecipes={() => openModal('recipes')}
        onAutoChef={() => openModal('autoChef')}
        onAddFood={() => openModal('addFood')}
        onMealHistory={() => openModal('mealHistory')}
        childProfile={activeChildProfile}
        onCreateProfile={() => openModal('childProfile')}
        onEditProfile={() => openModal('childProfile')}
      />
    </div>
  );
}