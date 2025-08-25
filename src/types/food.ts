export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
}

export interface Nutrients {
  calories?: Nutrient;
  protein?: Nutrient;
  fat?: Nutrient;
  carbs?: Nutrient;
  calcium?: Nutrient;
  iron?: Nutrient;
  vitaminA?: Nutrient;
  vitaminC?: Nutrient;
  potassium?: Nutrient;
}

export interface Food {
  fdcId: number;
  name: string;
  shortName: string;
  category: 'fruit' | 'vegetable' | 'protein' | 'grain' | 'dairy' | 'other';
  nutrients: Nutrients;
  ageGroup: '6+ months' | '8+ months' | '12+ months';
  servingSize?: number;
  servingSizeUnit?: string;
}

export interface FoodBlock {
  id: string;
  food: Food;
  portionSize: number; // 0.5 = half serving, 1 = full serving, 2 = double
  position: {
    x: number;
    y: number;
  };
  connections?: string[]; // IDs of connected blocks
}

export interface MealFood {
  id: string;
  food: Food;
  servingGrams: number;
  addedAt: number;
}

export type FoodCategory = Food['category'];
export type AgeGroup = Food['ageGroup'];