import { Food } from '../types/food';
import { ChildProfile, AgeCalculation } from '../types/child';
import { calculateAge } from './ageCalculation';
import { calculateCompatibleNutrientIntake, debugNutrientConversion } from './nutritionCompatibility';
import { debugLog } from './logger';

export interface MealFood {
  id: string;
  food: Food;
  servingGrams: number;
  addedAt: number;
}

export interface NutrientIntake {
  [nutrient: string]: {
    amount: number;
    unit: string;
    percentDaily: number;
  };
}

export interface WHOComplianceScore {
  overallScore: number; // 0-100
  breakdown: {
    animalSourceFoods: { score: number; met: boolean; message: string };
    fruitsAndVegetables: { score: number; met: boolean; message: string };
    foodDiversity: { score: number; count: number; message: string };
    ageAppropriate: { score: number; inappropriate: number; message: string };
    keyNutrients: { score: number; deficient: string[]; message: string };
  };
  riskAlerts: Array<{
    severity: 'low' | 'medium' | 'high';
    message: string;
    recommendation: string;
  }>;
  recommendations: string[];
}

/**
 * Check if a food is age-appropriate with 2-month buffer zone
 */
export function isAgeAppropriate(food: Food, childAge: AgeCalculation): boolean {
  const ageInMonths = childAge.months;
  
  // Parse the food's age requirement (e.g., "8+ months")
  const ageMatch = food.ageGroup.match(/(\d+)\+/);
  if (!ageMatch) return true; // If no age specified, assume appropriate
  
  const requiredMonths = parseInt(ageMatch[1]);
  
  // Apply 2-month buffer zone (can introduce food 2 months early)
  const bufferedRequirement = Math.max(requiredMonths - 2, 6); // Never below 6 months
  
  return ageInMonths >= bufferedRequirement;
}

/**
 * Calculate nutritional intake from meal foods with WHO compatibility
 */
export function calculateNutrientIntake(mealFoods: MealFood[]): NutrientIntake {
  // Use the compatibility layer for proper USDA-to-WHO conversion
  return calculateCompatibleNutrientIntake(mealFoods);
}

/**
 * Get daily nutritional requirements based on child's age
 */
export async function getDailyRequirements(childProfile: ChildProfile) {
  try {
    const response = await fetch('/data/who_nutrition_guidelines.json');
    const guidelines = await response.json();
    
    const ageCalc = calculateAge(childProfile.birthday);
    
    if (ageCalc.ageGroup === 'under_6_months' || ageCalc.ageGroup === 'over_24_months') {
      return null; // No complementary feeding guidelines
    }
    
    return guidelines.ageGroups[ageCalc.ageGroup]?.dailyRequirements || null;
  } catch (error) {
    console.error('Failed to load WHO requirements:', error);
    return null;
  }
}

/**
 * Calculate percent of daily value for nutrients
 */
export function calculatePercentDaily(intake: NutrientIntake, requirements: any): NutrientIntake {
  const result = { ...intake };
  
  // Nutrient mapping between our food data and WHO requirements
  const nutrientMapping: { [key: string]: string } = {
    'iron': 'iron',
    'calcium': 'calcium',
    'vitaminA': 'vitaminA',
    'vitaminC': 'vitaminC',
    'protein': 'protein'
  };
  
  Object.entries(result).forEach(([nutrientKey, nutrient]) => {
    const whoKey = nutrientMapping[nutrientKey];
    if (whoKey && requirements[whoKey]) {
      const dailyRequirement = requirements[whoKey].value;
      result[nutrientKey].percentDaily = (nutrient.amount / dailyRequirement) * 100;
      console.log(`${nutrientKey}: ${nutrient.amount}${nutrient.unit} / ${dailyRequirement}${requirements[whoKey].unit} = ${result[nutrientKey].percentDaily.toFixed(1)}%`);
    } else {
      console.log(`No WHO requirement found for: ${nutrientKey} (WHO key: ${whoKey})`);
    }
  });
  
  return result;
}

/**
 * Calculate WHO compliance score for current meal
 */
export async function calculateWHOCompliance(
  mealFoods: MealFood[],
  childProfile: ChildProfile
): Promise<WHOComplianceScore> {
  const ageCalc = calculateAge(childProfile.birthday);
  const intake = calculateNutrientIntake(mealFoods);
  const requirements = await getDailyRequirements(childProfile);
  
  debugLog('WHO COMPLIANCE ANALYSIS', {
    childAge: `${ageCalc.displayAge} (${ageCalc.ageGroup})`,
    mealFoods: mealFoods.map(mf => `${mf.food.shortName} (${mf.servingGrams}g)`),
    intake,
    requirements
  });
  
  if (!requirements) {
    return {
      overallScore: 0,
      breakdown: {
        animalSourceFoods: { score: 0, met: false, message: 'No WHO guidelines for this age' },
        fruitsAndVegetables: { score: 0, met: false, message: 'No WHO guidelines for this age' },
        foodDiversity: { score: 0, count: 0, message: 'No WHO guidelines for this age' },
        ageAppropriate: { score: 100, inappropriate: 0, message: 'All foods appropriate' },
        keyNutrients: { score: 0, deficient: [], message: 'No WHO guidelines for this age' }
      },
      riskAlerts: [],
      recommendations: ['Child is outside WHO complementary feeding age range (6-23 months)']
    };
  }
  
  const intakeWithPercents = calculatePercentDaily(intake, requirements);
  
  // 1. Animal Source Foods Score (25 points)
  const animalFoods = mealFoods.filter(mf => mf.food.category === 'protein');
  const hasAnimalFoods = animalFoods.length > 0;
  const animalScore = hasAnimalFoods ? 25 : 0;
  
  // 2. Fruits and Vegetables Score (25 points)
  const fruitsVeggies = mealFoods.filter(mf => 
    mf.food.category === 'fruit' || mf.food.category === 'vegetable'
  );
  const hasFruitsVeggies = fruitsVeggies.length > 0;
  const fruitsVeggiesScore = hasFruitsVeggies ? 25 : 0;
  
  // 3. Food Diversity Score (25 points)
  const categories = new Set(mealFoods.map(mf => mf.food.category));
  const diversityCount = categories.size;
  const diversityScore = Math.min((diversityCount / 3) * 25, 25); // Max at 3+ categories
  
  // 4. Age Appropriate Score (15 points)
  const inappropriateFoods = mealFoods.filter(mf => !isAgeAppropriate(mf.food, ageCalc));
  const inappropriateCount = inappropriateFoods.length;
  const ageScore = inappropriateCount === 0 ? 15 : Math.max(15 - (inappropriateCount * 5), 0);
  
  // 5. Key Nutrients Score (10 points) - Iron and Vitamin A priority
  const keyNutrients = ['iron', 'vitaminA'];
  const adequateNutrients = keyNutrients.filter(nutrient => {
    const percentDaily = intakeWithPercents[nutrient]?.percentDaily || 0;
    const actualAmount = intakeWithPercents[nutrient]?.amount || 0;
    console.log(`${nutrient}: ${actualAmount.toFixed(2)}${intakeWithPercents[nutrient]?.unit || ''} (${percentDaily.toFixed(1)}% of daily needs)`);
    
    // Realistic thresholds for complementary feeding with small serving sizes
    // A single meal with 2-3 foods of 10-20g each typically provides 5-10% of daily needs
    // This is normal and expected for complementary feeding
    const threshold = nutrient === 'iron' ? 5 : 3; // Iron: 5%, Vitamin A: 3%
    
    return percentDaily >= threshold;
  });
  const nutrientScore = (adequateNutrients.length / keyNutrients.length) * 10;
  
  console.log('Adequate nutrients:', adequateNutrients);
  console.log('Nutrient score:', nutrientScore);
  
  // Calculate overall score
  const overallScore = Math.round(animalScore + fruitsVeggiesScore + diversityScore + ageScore + nutrientScore);
  
  // Generate risk alerts
  const riskAlerts: WHOComplianceScore['riskAlerts'] = [];
  
  if (!hasAnimalFoods) {
    riskAlerts.push({
      severity: 'high',
      message: 'No animal source foods in meal',
      recommendation: 'Add meat, fish, eggs, or dairy for essential nutrients'
    });
  }
  
  if (!hasFruitsVeggies) {
    riskAlerts.push({
      severity: 'high',
      message: 'No fruits or vegetables in meal',
      recommendation: 'Add colorful fruits or vegetables for vitamins and minerals'
    });
  }
  
  if (diversityCount < 3) {
    riskAlerts.push({
      severity: 'medium',
      message: `Low food diversity (${diversityCount} categories)`,
      recommendation: 'Include foods from more categories for balanced nutrition'
    });
  }
  
  if (inappropriateCount > 0) {
    riskAlerts.push({
      severity: 'medium',
      message: `${inappropriateCount} food(s) may be too advanced for child's age`,
      recommendation: 'Consider age-appropriate alternatives'
    });
  }
  
  const deficientNutrients = keyNutrients.filter(nutrient => {
    // Very low thresholds for deficiency - complementary feeding with small portions
    const threshold = nutrient === 'iron' ? 3 : 2; // Iron: 3%, Vitamin A: 2%
    return (intakeWithPercents[nutrient]?.percentDaily || 0) < threshold;
  });
  
  if (deficientNutrients.length > 0) {
    riskAlerts.push({
      severity: 'high',
      message: `Low intake of critical nutrients: ${deficientNutrients.join(', ')}`,
      recommendation: 'Add iron-rich and vitamin A-rich foods'
    });
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (overallScore < 60) {
    recommendations.push('Meal needs improvement to meet WHO guidelines');
  }
  if (!hasAnimalFoods) {
    recommendations.push('Add a protein source like meat, fish, or eggs');
  }
  if (!hasFruitsVeggies) {
    recommendations.push('Include fruits or vegetables for essential vitamins');
  }
  if (diversityCount < 3) {
    recommendations.push('Add more food variety for balanced nutrition');
  }
  if (overallScore >= 80) {
    recommendations.push('Excellent meal composition following WHO guidelines!');
  }
  
  return {
    overallScore,
    breakdown: {
      animalSourceFoods: {
        score: animalScore,
        met: hasAnimalFoods,
        message: hasAnimalFoods ? 'Animal foods included ✓' : 'No animal foods found'
      },
      fruitsAndVegetables: {
        score: fruitsVeggiesScore,
        met: hasFruitsVeggies,
        message: hasFruitsVeggies ? 'Fruits/vegetables included ✓' : 'No fruits or vegetables found'
      },
      foodDiversity: {
        score: diversityScore,
        count: diversityCount,
        message: `${diversityCount} food categories (target: 3+)`
      },
      ageAppropriate: {
        score: ageScore,
        inappropriate: inappropriateCount,
        message: inappropriateCount === 0 ? 'All foods age-appropriate ✓' : `${inappropriateCount} foods may be too advanced`
      },
      keyNutrients: {
        score: nutrientScore,
        deficient: deficientNutrients,
        message: `${adequateNutrients.length}/${keyNutrients.length} key nutrients adequate`
      }
    },
    riskAlerts,
    recommendations
  };
}