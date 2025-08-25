import { Food } from '../types/food';
import { ChildProfile } from '../types/child';
import { MealFood, calculateWHOCompliance, isAgeAppropriate } from './whoCompliance';
import { calculateAge } from './ageCalculation';

export interface FeedingMode {
  name: string;
  targetCompliance: number; // 50% for complementary, 100% for full
  description: string;
}

export const FEEDING_MODES: { [key: string]: FeedingMode } = {
  complementary: {
    name: 'Complementary Feeding',
    targetCompliance: 60, // 60% WHO compliance target for smarter recommendations
    description: 'Complementary to breast/formula feeding (recommended for 6-23 months)'
  },
  full: {
    name: 'Full Nutrition',
    targetCompliance: 80, // 80% WHO compliance target for highest tier
    description: 'Complete nutritional requirements from solid foods'
  }
};

export interface AutoChefSuggestion {
  id: string;
  name: string;
  description: string;
  foods: Array<{
    food: Food;
    servingGrams: number;
    reason: string;
  }>;
  predictedScore: number;
  complianceGaps: string[];
  nutritionalHighlights: string[];
  ageAppropriate: boolean;
  totalGrams: number;
}

export interface AutoChefRecommendation {
  currentMealScore: number;
  targetScore: number;
  mode: FeedingMode;
  gaps: {
    animalFoods: boolean;
    fruitsVegetables: boolean;
    diversity: number; // current diversity count
    keyNutrients: string[];
  };
  suggestions: AutoChefSuggestion[];
  quickFixes: Array<{
    food: Food;
    servingGrams: number;
    expectedImprovement: number;
    reason: string;
  }>;
}

/**
 * Analyze current meal and generate auto-chef recommendations
 */
export async function generateAutoChefRecommendations(
  currentMealFoods: MealFood[],
  availableFoods: Food[],
  childProfile: ChildProfile,
  feedingMode: FeedingMode
): Promise<AutoChefRecommendation> {
  
  // Get current WHO compliance
  const currentCompliance = await calculateWHOCompliance(currentMealFoods, childProfile);
  const ageCalc = calculateAge(childProfile.birthday);
  
  // Filter age-appropriate foods
  const appropriateFoods = availableFoods.filter(food => 
    isAgeAppropriate(food, ageCalc)
  );
  
  // Identify gaps based on current meal
  const gaps = {
    animalFoods: !currentCompliance.breakdown.animalSourceFoods.met,
    fruitsVegetables: !currentCompliance.breakdown.fruitsAndVegetables.met,
    diversity: currentCompliance.breakdown.foodDiversity.count,
    keyNutrients: currentCompliance.breakdown.keyNutrients.deficient
  };
  
  // Generate meal suggestions
  const suggestions = await generateMealSuggestions(
    currentMealFoods,
    appropriateFoods,
    childProfile,
    feedingMode,
    gaps
  );
  
  // Generate quick fixes for immediate improvements
  const quickFixes = generateQuickFixes(
    currentMealFoods,
    appropriateFoods,
    gaps,
    feedingMode
  );
  
  return {
    currentMealScore: currentCompliance.overallScore,
    targetScore: feedingMode.targetCompliance,
    mode: feedingMode,
    gaps,
    suggestions,
    quickFixes
  };
}

/**
 * Generate complete meal suggestions
 */
async function generateMealSuggestions(
  currentMealFoods: MealFood[],
  availableFoods: Food[],
  childProfile: ChildProfile,
  feedingMode: FeedingMode,
  gaps: any
): Promise<AutoChefSuggestion[]> {
  
  const suggestions: AutoChefSuggestion[] = [];
  
  // Template 1: Balanced Starter Meal (if no current foods)
  if (currentMealFoods.length === 0) {
    const balancedMeal = await createBalancedMeal(availableFoods, childProfile, feedingMode);
    if (balancedMeal) suggestions.push(balancedMeal);
  }
  
  // Template 2: Gap-filling suggestions (build on current meal)
  if (currentMealFoods.length > 0) {
    const gapFillingSuggestions = await createGapFillingMeals(
      currentMealFoods,
      availableFoods,
      childProfile,
      feedingMode,
      gaps
    );
    suggestions.push(...gapFillingSuggestions);
  }
  
  // Template 3: High-nutrition power meals
  const powerMeal = await createPowerMeal(availableFoods, childProfile, feedingMode);
  if (powerMeal) suggestions.push(powerMeal);
  
  // Template 4: Simple introduction meal (for new eaters)
  const ageCalc = calculateAge(childProfile.birthday);
  if (ageCalc.months <= 8) {
    const introMeal = await createIntroductionMeal(availableFoods, childProfile, feedingMode);
    if (introMeal) suggestions.push(introMeal);
  }
  
  return suggestions.slice(0, 3); // Return top 3 suggestions
}

/**
 * Create a balanced starter meal
 */
async function createBalancedMeal(
  availableFoods: Food[],
  childProfile: ChildProfile,
  feedingMode: FeedingMode
): Promise<AutoChefSuggestion | null> {
  
  const mealFoods: Array<{ food: Food; servingGrams: number; reason: string }> = [];
  
  // Add protein source
  const proteins = availableFoods.filter(f => f.category === 'protein');
  if (proteins.length > 0) {
    const protein = proteins[Math.floor(Math.random() * proteins.length)];
    mealFoods.push({
      food: protein,
      servingGrams: 15,
      reason: 'Essential protein and iron source'
    });
  }
  
  // Add vegetable
  const vegetables = availableFoods.filter(f => f.category === 'vegetable');
  if (vegetables.length > 0) {
    const vegetable = vegetables[Math.floor(Math.random() * vegetables.length)];
    mealFoods.push({
      food: vegetable,
      servingGrams: 10,
      reason: 'Vitamins and minerals'
    });
  }
  
  // Add fruit
  const fruits = availableFoods.filter(f => f.category === 'fruit');
  if (fruits.length > 0) {
    const fruit = fruits[Math.floor(Math.random() * fruits.length)];
    mealFoods.push({
      food: fruit,
      servingGrams: 10,
      reason: 'Natural sweetness and vitamin C'
    });
  }
  
  if (mealFoods.length === 0) return null;
  
  // Create meal foods for scoring
  const testMealFoods: MealFood[] = mealFoods.map((mf, index) => ({
    id: `test-${index}`,
    food: mf.food,
    servingGrams: mf.servingGrams,
    addedAt: Date.now()
  }));
  
  const predictedCompliance = await calculateWHOCompliance(testMealFoods, childProfile);
  
  return {
    id: `balanced-${Date.now()}`,
    name: 'Balanced Starter Meal',
    description: 'A well-rounded meal with protein, vegetables, and fruits',
    foods: mealFoods,
    predictedScore: predictedCompliance.overallScore,
    complianceGaps: predictedCompliance.riskAlerts.map(alert => alert.message),
    nutritionalHighlights: predictedCompliance.recommendations,
    ageAppropriate: true,
    totalGrams: mealFoods.reduce((sum, mf) => sum + mf.servingGrams, 0)
  };
}

/**
 * Create gap-filling meal suggestions
 */
async function createGapFillingMeals(
  currentMealFoods: MealFood[],
  availableFoods: Food[],
  childProfile: ChildProfile,
  feedingMode: FeedingMode,
  gaps: any
): Promise<AutoChefSuggestion[]> {
  
  const suggestions: AutoChefSuggestion[] = [];
  
  // If missing animal foods
  if (gaps.animalFoods) {
    const proteinSuggestion = await createProteinBoostMeal(
      currentMealFoods,
      availableFoods,
      childProfile,
      feedingMode
    );
    if (proteinSuggestion) suggestions.push(proteinSuggestion);
  }
  
  // If missing fruits/vegetables
  if (gaps.fruitsVegetables) {
    const veggieSuggestion = await createVeggieBoostMeal(
      currentMealFoods,
      availableFoods,
      childProfile,
      feedingMode
    );
    if (veggieSuggestion) suggestions.push(veggieSuggestion);
  }
  
  // If low diversity
  if (gaps.diversity < 3) {
    const diversitySuggestion = await createDiversityBoostMeal(
      currentMealFoods,
      availableFoods,
      childProfile,
      feedingMode
    );
    if (diversitySuggestion) suggestions.push(diversitySuggestion);
  }
  
  return suggestions;
}

/**
 * Create a high-nutrition power meal
 */
async function createPowerMeal(
  availableFoods: Food[],
  childProfile: ChildProfile,
  feedingMode: FeedingMode
): Promise<AutoChefSuggestion | null> {
  
  // Select nutrient-dense foods
  const powerFoods: Array<{ food: Food; servingGrams: number; reason: string }> = [];
  
  // High-iron foods
  const ironRichFoods = availableFoods.filter(f => 
    f.nutrients.iron && f.nutrients.iron.amount > 1
  );
  if (ironRichFoods.length > 0) {
    const ironFood = ironRichFoods[0];
    powerFoods.push({
      food: ironFood,
      servingGrams: 15,
      reason: 'High iron content for brain development'
    });
  }
  
  // High-vitamin A foods
  const vitaminAFoods = availableFoods.filter(f => 
    f.nutrients.vitaminA && f.nutrients.vitaminA.amount > 50
  );
  if (vitaminAFoods.length > 0) {
    const vitAFood = vitaminAFoods[0];
    powerFoods.push({
      food: vitAFood,
      servingGrams: 10,
      reason: 'Rich in vitamin A for vision and immunity'
    });
  }
  
  if (powerFoods.length === 0) return null;
  
  const testMealFoods: MealFood[] = powerFoods.map((mf, index) => ({
    id: `power-${index}`,
    food: mf.food,
    servingGrams: mf.servingGrams,
    addedAt: Date.now()
  }));
  
  const predictedCompliance = await calculateWHOCompliance(testMealFoods, childProfile);
  
  return {
    id: `power-${Date.now()}`,
    name: 'Nutrition Power Meal',
    description: 'Nutrient-dense foods for optimal development',
    foods: powerFoods,
    predictedScore: predictedCompliance.overallScore,
    complianceGaps: predictedCompliance.riskAlerts.map(alert => alert.message),
    nutritionalHighlights: ['High iron', 'Rich in vitamin A', 'Supports brain development'],
    ageAppropriate: true,
    totalGrams: powerFoods.reduce((sum, mf) => sum + mf.servingGrams, 0)
  };
}

/**
 * Create introduction meal for new eaters
 */
async function createIntroductionMeal(
  availableFoods: Food[],
  childProfile: ChildProfile,
  feedingMode: FeedingMode
): Promise<AutoChefSuggestion | null> {
  
  const gentleFoods: Array<{ food: Food; servingGrams: number; reason: string }> = [];
  
  // Simple, gentle foods for introduction
  const suitableCategories = ['fruit', 'vegetable'];
  
  suitableCategories.forEach(category => {
    const categoryFoods = availableFoods.filter(f => f.category === category);
    if (categoryFoods.length > 0) {
      const food = categoryFoods[0];
      gentleFoods.push({
        food,
        servingGrams: 5,
        reason: `Gentle introduction to ${category}s`
      });
    }
  });
  
  if (gentleFoods.length === 0) return null;
  
  const testMealFoods: MealFood[] = gentleFoods.map((mf, index) => ({
    id: `intro-${index}`,
    food: mf.food,
    servingGrams: mf.servingGrams,
    addedAt: Date.now()
  }));
  
  const predictedCompliance = await calculateWHOCompliance(testMealFoods, childProfile);
  
  return {
    id: `intro-${Date.now()}`,
    name: 'Gentle Introduction Meal',
    description: 'Perfect for new eaters - simple and gentle foods',
    foods: gentleFoods,
    predictedScore: predictedCompliance.overallScore,
    complianceGaps: [],
    nutritionalHighlights: ['Easy to digest', 'Gentle introduction', 'Age-appropriate'],
    ageAppropriate: true,
    totalGrams: gentleFoods.reduce((sum, mf) => sum + mf.servingGrams, 0)
  };
}

/**
 * Generate quick fixes for immediate meal improvements
 */
function generateQuickFixes(
  currentMealFoods: MealFood[],
  availableFoods: Food[],
  gaps: any,
  feedingMode: FeedingMode
): Array<{ food: Food; servingGrams: number; expectedImprovement: number; reason: string }> {
  
  const quickFixes: Array<{ food: Food; servingGrams: number; expectedImprovement: number; reason: string }> = [];
  
  // Quick protein fix
  if (gaps.animalFoods) {
    const proteins = availableFoods.filter(f => f.category === 'protein');
    if (proteins.length > 0) {
      quickFixes.push({
        food: proteins[0],
        servingGrams: 10,
        expectedImprovement: 25,
        reason: 'Add essential protein and iron'
      });
    }
  }
  
  // Quick fruit/vegetable fix
  if (gaps.fruitsVegetables) {
    const produce = availableFoods.filter(f => 
      f.category === 'fruit' || f.category === 'vegetable'
    );
    if (produce.length > 0) {
      quickFixes.push({
        food: produce[0],
        servingGrams: 10,
        expectedImprovement: 25,
        reason: 'Add essential vitamins and minerals'
      });
    }
  }
  
  return quickFixes.slice(0, 3); // Top 3 quick fixes
}

// Helper functions for specific meal types
async function createProteinBoostMeal(
  currentMealFoods: MealFood[],
  availableFoods: Food[],
  childProfile: ChildProfile,
  feedingMode: FeedingMode
): Promise<AutoChefSuggestion | null> {
  
  const proteins = availableFoods.filter(f => f.category === 'protein');
  if (proteins.length === 0) return null;
  
  const proteinFood = proteins[Math.floor(Math.random() * proteins.length)];
  
  const foods = [{
    food: proteinFood,
    servingGrams: 15,
    reason: 'Adds essential protein and iron to your meal'
  }];
  
  const testMealFoods: MealFood[] = [
    ...currentMealFoods,
    {
      id: `protein-boost`,
      food: proteinFood,
      servingGrams: 15,
      addedAt: Date.now()
    }
  ];
  
  const predictedCompliance = await calculateWHOCompliance(testMealFoods, childProfile);
  
  return {
    id: `protein-boost-${Date.now()}`,
    name: 'Protein Power-Up',
    description: 'Add protein to complete your meal',
    foods,
    predictedScore: predictedCompliance.overallScore,
    complianceGaps: predictedCompliance.riskAlerts.map(alert => alert.message),
    nutritionalHighlights: ['Complete protein', 'Iron for development'],
    ageAppropriate: true,
    totalGrams: 15
  };
}

async function createVeggieBoostMeal(
  currentMealFoods: MealFood[],
  availableFoods: Food[],
  childProfile: ChildProfile,
  feedingMode: FeedingMode
): Promise<AutoChefSuggestion | null> {
  
  const produce = availableFoods.filter(f => 
    f.category === 'fruit' || f.category === 'vegetable'
  );
  if (produce.length === 0) return null;
  
  const produceFood = produce[Math.floor(Math.random() * produce.length)];
  
  const foods = [{
    food: produceFood,
    servingGrams: 10,
    reason: 'Adds essential vitamins and natural flavors'
  }];
  
  const testMealFoods: MealFood[] = [
    ...currentMealFoods,
    {
      id: `veggie-boost`,
      food: produceFood,
      servingGrams: 10,
      addedAt: Date.now()
    }
  ];
  
  const predictedCompliance = await calculateWHOCompliance(testMealFoods, childProfile);
  
  return {
    id: `veggie-boost-${Date.now()}`,
    name: 'Vitamin Boost',
    description: 'Add fruits or vegetables for essential vitamins',
    foods,
    predictedScore: predictedCompliance.overallScore,
    complianceGaps: predictedCompliance.riskAlerts.map(alert => alert.message),
    nutritionalHighlights: ['Rich in vitamins', 'Natural flavors'],
    ageAppropriate: true,
    totalGrams: 10
  };
}

async function createDiversityBoostMeal(
  currentMealFoods: MealFood[],
  availableFoods: Food[],
  childProfile: ChildProfile,
  feedingMode: FeedingMode
): Promise<AutoChefSuggestion | null> {
  
  // Find categories not in current meal
  const currentCategories = new Set(currentMealFoods.map(mf => mf.food.category));
  const availableCategories = ['fruit', 'vegetable', 'protein', 'grain', 'dairy'];
  const missingCategories = availableCategories.filter(cat => !currentCategories.has(cat));
  
  if (missingCategories.length === 0) return null;
  
  const targetCategory = missingCategories[0];
  const categoryFoods = availableFoods.filter(f => f.category === targetCategory);
  
  if (categoryFoods.length === 0) return null;
  
  const diversityFood = categoryFoods[0];
  
  const foods = [{
    food: diversityFood,
    servingGrams: 10,
    reason: `Adds ${targetCategory} variety to your meal`
  }];
  
  const testMealFoods: MealFood[] = [
    ...currentMealFoods,
    {
      id: `diversity-boost`,
      food: diversityFood,
      servingGrams: 10,
      addedAt: Date.now()
    }
  ];
  
  const predictedCompliance = await calculateWHOCompliance(testMealFoods, childProfile);
  
  return {
    id: `diversity-boost-${Date.now()}`,
    name: 'Variety Booster',
    description: `Add ${targetCategory} for better food diversity`,
    foods,
    predictedScore: predictedCompliance.overallScore,
    complianceGaps: predictedCompliance.riskAlerts.map(alert => alert.message),
    nutritionalHighlights: ['Increases food diversity', 'Balanced nutrition'],
    ageAppropriate: true,
    totalGrams: 10
  };
}