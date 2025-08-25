/**
 * Compatibility layer between USDA food data and WHO nutritional requirements
 */

export interface NutrientConversion {
  usdaUnit: string;
  whoUnit: string;
  conversionFactor: number;
  notes?: string;
}

/**
 * Unit conversion mapping between USDA and WHO standards
 */
export const NUTRIENT_CONVERSIONS: { [key: string]: NutrientConversion } = {
  'vitaminA': {
    usdaUnit: 'µg',           // USDA uses micrograms
    whoUnit: 'μg RAE',        // WHO uses Retinol Activity Equivalents
    conversionFactor: 1,      // Direct conversion for most foods
    notes: 'USDA vitamin A values are typically already in RAE'
  },
  'iron': {
    usdaUnit: 'mg',
    whoUnit: 'mg',
    conversionFactor: 1,      // Same units
    notes: 'Direct conversion'
  },
  'calcium': {
    usdaUnit: 'mg',
    whoUnit: 'mg',
    conversionFactor: 1,      // Same units
    notes: 'Direct conversion'
  },
  'vitaminC': {
    usdaUnit: 'mg',
    whoUnit: 'mg',
    conversionFactor: 1,      // Same units
    notes: 'Direct conversion'
  },
  'protein': {
    usdaUnit: 'g',
    whoUnit: 'g',
    conversionFactor: 1,      // Same units
    notes: 'Direct conversion'
  },
  'zinc': {
    usdaUnit: 'mg',
    whoUnit: 'mg',
    conversionFactor: 1,      // Same units
    notes: 'Direct conversion'
  }
};

/**
 * Convert USDA nutrient values to WHO-compatible values
 */
export function convertUsdaToWho(nutrientKey: string, usdaValue: number): number {
  const conversion = NUTRIENT_CONVERSIONS[nutrientKey];
  
  if (!conversion) {
    console.warn(`No conversion available for nutrient: ${nutrientKey}`);
    return usdaValue; // Return as-is if no conversion defined
  }
  
  const convertedValue = usdaValue * conversion.conversionFactor;
  
  // Apply special handling for vitamin A
  if (nutrientKey === 'vitaminA') {
    // USDA vitamin A values should already be in RAE (Retinol Activity Equivalents)
    // Most food values are under 1000 µg RAE per 100g, so no conversion needed
    // The original logic was incorrect - USDA FoodData Central already provides RAE values
    console.log(`Vitamin A conversion: ${usdaValue} µg RAE (no conversion applied)`);
  }
  
  return convertedValue;
}

/**
 * Validate nutrient values against expected ranges
 */
export function validateNutrientValue(nutrientKey: string, value: number): boolean {
  const validRanges: { [key: string]: { min: number; max: number } } = {
    'vitaminA': { min: 0, max: 1500 },      // µg RAE - most foods are under 1000, organ meats can be higher
    'iron': { min: 0, max: 30 },            // mg - reasonable range for food (organ meats highest)
    'calcium': { min: 0, max: 2000 },       // mg - reasonable range for food
    'vitaminC': { min: 0, max: 500 },       // mg - reasonable range for food
    'protein': { min: 0, max: 100 },        // g - per 100g of food
    'zinc': { min: 0, max: 50 }             // mg - reasonable range for food
  };
  
  const range = validRanges[nutrientKey];
  if (!range) return true; // No validation if no range defined
  
  const isValid = value >= range.min && value <= range.max;
  
  if (!isValid) {
    console.warn(`Nutrient ${nutrientKey} value ${value} is outside expected range ${range.min}-${range.max}`);
  }
  
  return isValid;
}

/**
 * Enhanced nutrient intake calculation with compatibility layer
 */
export function calculateCompatibleNutrientIntake(mealFoods: any[]): any {
  const intake: any = {};
  
  for (const mealFood of mealFoods) {
    const { food, servingGrams } = mealFood;
    const multiplier = servingGrams / 100; // USDA data is per 100g
    
    // Process each nutrient with compatibility conversion
    Object.entries(food.nutrients).forEach(([nutrientKey, nutrient]: [string, any]) => {
      if (!intake[nutrientKey]) {
        intake[nutrientKey] = {
          amount: 0,
          unit: nutrient.unit,
          percentDaily: 0
        };
      }
      
      // Convert USDA value to WHO-compatible value
      const usdaAmount = nutrient.amount * multiplier;
      const whoCompatibleAmount = convertUsdaToWho(nutrientKey, usdaAmount);
      
      // Always use converted value for better traceability
      intake[nutrientKey].amount += whoCompatibleAmount;
      
      // Log validation issues but don't reject values
      if (!validateNutrientValue(nutrientKey, whoCompatibleAmount)) {
        console.warn(`${nutrientKey} value ${whoCompatibleAmount.toFixed(2)} outside expected range, but using anyway`);
      }
    });
  }
  
  return intake;
}

/**
 * Debug function to compare USDA vs WHO values
 */
export function debugNutrientConversion(nutrientKey: string, usdaValue: number): void {
  const whoValue = convertUsdaToWho(nutrientKey, usdaValue);
  const conversion = NUTRIENT_CONVERSIONS[nutrientKey];
  
  console.log(`=== ${nutrientKey.toUpperCase()} CONVERSION ===`);
  console.log(`USDA: ${usdaValue} ${conversion?.usdaUnit || 'unknown'}`);
  console.log(`WHO:  ${whoValue} ${conversion?.whoUnit || 'unknown'}`);
  console.log(`Factor: ${conversion?.conversionFactor || 'N/A'}`);
  console.log(`Valid: ${validateNutrientValue(nutrientKey, whoValue)}`);
  console.log('==========================================');
}