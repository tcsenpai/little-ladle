import { useState, useEffect } from 'react';
import { MealFood } from '../types/food';
import { dataService } from '../services/dataService';

interface Recipe {
  id?: string;
  name: string;
  foods: MealFood[];
  description?: string;
  createdAt?: string;
}

interface RecipesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMeal: MealFood[];
  onLoadRecipe: (foods: MealFood[]) => void;
}

export function RecipesModal({ isOpen, onClose, currentMeal, onLoadRecipe }: RecipesModalProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeDescription, setNewRecipeDescription] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  // Load recipes when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRecipes();
    }
  }, [isOpen]);

  const loadRecipes = async () => {
    setIsLoading(true);
    try {
      const loadedRecipes = await dataService.getRecipes();
      setRecipes(loadedRecipes);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    }
    setIsLoading(false);
  };

  const handleSaveCurrentMeal = async () => {
    if (!newRecipeName.trim() || currentMeal.length === 0) {
      alert('Please enter a recipe name and ensure you have foods in your meal');
      return;
    }

    setIsSaving(true);
    try {
      const newRecipe = await dataService.saveRecipe({
        name: newRecipeName,
        description: newRecipeDescription,
        foods: currentMeal,
      });

      if (newRecipe) {
        setRecipes(prev => [...prev, newRecipe]);
        setNewRecipeName('');
        setNewRecipeDescription('');
        setShowSaveForm(false);
        alert('Recipe saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save recipe:', error);
      alert('Failed to save recipe');
    }
    setIsSaving(false);
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    try {
      const success = await dataService.deleteRecipe(id);
      if (success) {
        setRecipes(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      alert('Failed to delete recipe');
    }
  };

  const handleLoadRecipe = (recipe: Recipe) => {
    onLoadRecipe(recipe.foods);
    onClose();
  };

  const totalNutrition = (foods: MealFood[]) => {
    return foods.reduce((total, mealFood) => {
      const multiplier = mealFood.servingGrams / 100;
      const food = mealFood.food;
      return {
        calories: total.calories + ((food.nutrients.calories?.amount ?? 0) * multiplier),
        iron: total.iron + ((food.nutrients.iron?.amount ?? 0) * multiplier),
        protein: total.protein + ((food.nutrients.protein?.amount ?? 0) * multiplier),
      };
    }, { calories: 0, iron: 0, protein: 0 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📖 Saved Recipes</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Save Current Meal Button */}
          {currentMeal.length > 0 && !showSaveForm && (
            <button
              onClick={() => setShowSaveForm(true)}
              className="w-full mb-4 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              💾 Save Current Meal as Recipe
            </button>
          )}

          {/* Save Form */}
          {showSaveForm && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Save New Recipe</h3>
              <input
                type="text"
                value={newRecipeName}
                onChange={(e) => setNewRecipeName(e.target.value)}
                placeholder="Recipe name"
                className="w-full p-2 mb-3 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
              />
              <textarea
                value={newRecipeDescription}
                onChange={(e) => setNewRecipeDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full p-2 mb-3 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveCurrentMeal}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Recipe'}
                </button>
                <button
                  onClick={() => {
                    setShowSaveForm(false);
                    setNewRecipeName('');
                    setNewRecipeDescription('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Recipes List */}
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading recipes...</div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No saved recipes yet</p>
              <p className="text-sm">Create a meal and save it as a recipe!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recipes.map((recipe) => {
                const nutrition = totalNutrition(recipe.foods);
                return (
                  <div key={recipe.id} className="border rounded-lg p-4 dark:border-gray-600">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {recipe.name}
                        </h3>
                        {recipe.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {recipe.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadRecipe(recipe)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteRecipe(recipe.id!)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {recipe.foods.length} items • {nutrition.calories.toFixed(0)} kcal • 
                      {nutrition.iron.toFixed(1)}mg iron • {nutrition.protein.toFixed(1)}g protein
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {recipe.foods.map((food, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                          {food.food.shortName} ({food.servingGrams}g)
                        </span>
                      ))}
                    </div>
                    
                    {recipe.createdAt && (
                      <div className="text-xs text-gray-500 mt-2">
                        Created: {new Date(recipe.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}