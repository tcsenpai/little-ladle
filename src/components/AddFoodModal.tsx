import React, { useState, useEffect } from 'react';
import { Food } from '../types/food';

interface SearchResult {
  fdcId: number;
  description: string;
  dataType: string;
  foodCategory?: string;
}

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (food: Food) => void;
}

const API_KEY = import.meta.env.VITE_USDA_API_KEY || process.env.USDA_API_KEY;
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// Nutrient mapping for processing USDA data
const nutrientMap = {
  1008: { key: 'calories', name: 'Energy' },
  1003: { key: 'protein', name: 'Protein' },
  1004: { key: 'fat', name: 'Total Fat' },
  1005: { key: 'carbs', name: 'Carbohydrates' },
  1087: { key: 'calcium', name: 'Calcium' },
  1089: { key: 'iron', name: 'Iron' },
  1106: { key: 'vitaminA', name: 'Vitamin A' },
  1162: { key: 'vitaminC', name: 'Vitamin C' },
  1179: { key: 'potassium', name: 'Potassium' }
} as const;

function categorizeFood(description: string): Food['category'] {
  const desc = description.toLowerCase();
  if (/\b(chicken|turkey|beef|salmon|fish|egg|tofu|beans|lentil)\b/.test(desc)) return 'protein';
  if (/\b(apple|banana|berry|peach|orange|mango|melon)\b/.test(desc)) return 'fruit';
  if (/\b(broccoli|spinach|carrot|pea|squash|zucchini)\b/.test(desc)) return 'vegetable';
  if (/\b(rice|oat|wheat|quinoa|cereal)\b/.test(desc)) return 'grain';
  if (/\b(milk|cheese|yogurt)\b/.test(desc)) return 'dairy';
  return 'other';
}

function processNutrients(foodNutrients: any[]) {
  const nutrients: any = {};
  for (const fn of foodNutrients || []) {
    if (fn.nutrient && nutrientMap[fn.nutrient.id as keyof typeof nutrientMap] && fn.amount != null) {
      const mapping = nutrientMap[fn.nutrient.id as keyof typeof nutrientMap];
      nutrients[mapping.key] = {
        name: mapping.name,
        amount: fn.amount,
        unit: fn.nutrient.unitName || 'g'
      };
    }
  }
  return nutrients;
}

export function AddFoodModal({ isOpen, onClose, onAddFood }: AddFoodModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedFood, setSelectedFood] = useState<SearchResult | null>(null);
  const [foodDetails, setFoodDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchFoods(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const searchFoods = async (query: string) => {
    if (!API_KEY) {
      setError('USDA API key not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        api_key: API_KEY,
        query: query,
        dataType: ['Foundation', 'SR Legacy'].join(','),
        pageSize: '10'
      });

      const response = await fetch(`${BASE_URL}/foods/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.foods || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search foods');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFoodDetails = async (fdcId: number) => {
    if (!API_KEY) {
      setError('USDA API key not configured');
      return;
    }

    setIsLoadingDetails(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/food/${fdcId}?api_key=${API_KEY}&format=full`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setFoodDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch food details');
      setFoodDetails(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleFoodSelect = (food: SearchResult) => {
    setSelectedFood(food);
    fetchFoodDetails(food.fdcId);
  };

  const handleConfirmAdd = () => {
    if (!selectedFood || !foodDetails) return;

    const processedFood: Food = {
      fdcId: selectedFood.fdcId,
      name: foodDetails.description,
      shortName: selectedFood.description.split(',')[0], // Use first part as short name
      category: categorizeFood(foodDetails.description),
      nutrients: processNutrients(foodDetails.foodNutrients || []),
      ageGroup: '8+ months' // Default for manually added foods
    };

    onAddFood(processedFood);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFood(null);
    setFoodDetails(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-white/50 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-100 via-sky-100 to-violet-100 p-6 border-b-2 border-white/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">🔍</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-transparent bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text">
                  Add New Food
                </h2>
                <p className="text-sm text-gray-600 font-medium">
                  Search USDA database and add to Sophie's collection
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-lg transition-all duration-200 transform hover:scale-110"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Search Panel */}
          <div className="flex-1 p-6 border-r border-gray-200">
            {/* Search Input */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                🔍 Search for food
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., chicken breast, broccoli, apple..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-emerald-500 focus:outline-none text-lg"
                autoFocus
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
                ❌ {error}
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                <span className="ml-3 text-gray-600">Searching USDA database...</span>
              </div>
            )}

            {/* Search Results */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((food) => (
                <button
                  key={food.fdcId}
                  onClick={() => handleFoodSelect(food)}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all duration-200 text-left
                    ${selectedFood?.fdcId === food.fdcId
                      ? 'bg-gradient-to-r from-emerald-50 to-sky-50 border-emerald-300 ring-2 ring-emerald-300'
                      : 'bg-white border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30'
                    }
                  `}
                >
                  <div className="font-bold text-gray-800 text-sm leading-tight">
                    {food.description}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {food.dataType} • FDC ID: {food.fdcId}
                  </div>
                </button>
              ))}
            </div>

            {searchQuery.length > 0 && searchQuery.length < 3 && (
              <div className="text-center text-gray-500 py-8">
                Type at least 3 characters to search
              </div>
            )}

            {searchQuery.length >= 3 && searchResults.length === 0 && !isLoading && (
              <div className="text-center text-gray-500 py-8">
                No foods found for "{searchQuery}"
              </div>
            )}
          </div>

          {/* Details Panel */}
          <div className="flex-1 p-6 flex flex-col">
            {!selectedFood ? (
              <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
                <div className="text-6xl mb-4">🍎</div>
                <p className="text-lg font-medium">Select a food to see details</p>
              </div>
            ) : isLoadingDetails ? (
              <div className="flex items-center justify-center flex-1">
                <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
                <span className="ml-3 text-gray-600">Loading details...</span>
              </div>
            ) : foodDetails ? (
              <>
                {/* Fixed Header */}
                <div className="mb-4">
                  <h3 className="text-xl font-black text-gray-800 mb-4">Food Details</h3>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-800">{foodDetails.description}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Category: {categorizeFood(foodDetails.description)} • FDC ID: {selectedFood.fdcId}
                    </p>
                  </div>
                </div>

                {/* Scrollable Nutrition Preview */}
                <div className="flex-1 overflow-hidden mb-6">
                  <h4 className="font-bold text-gray-800 mb-3 sticky top-0 bg-white">Nutrition (per 100g)</h4>
                  <div className="overflow-y-auto max-h-64 space-y-3 pr-2">
                    {Object.entries(processNutrients(foodDetails.foodNutrients || [])).map(([key, nutrient]: [string, any]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-700">{nutrient.name}</span>
                        <span className="font-bold text-gray-800">
                          {nutrient.amount.toFixed(1)} {nutrient.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fixed Add Button */}
                <div className="mt-auto">
                  <button
                    onClick={handleConfirmAdd}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-black text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                  >
                    ✅ Add to Sophie's Foods
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center flex-1 text-red-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <p className="text-lg font-medium">Failed to load food details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}