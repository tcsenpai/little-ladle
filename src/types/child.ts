export interface ChildProfile {
  id: string;
  name: string;
  birthday: string; // ISO date string
  sex: 'male' | 'female';
  createdAt: string;
  updatedAt: string;
}

export interface AgeCalculation {
  totalDays: number;
  months: number;
  days: number;
  ageGroup: '6-12_months' | '12-24_months' | 'under_6_months' | 'over_24_months';
  displayAge: string; // e.g., "7 months, 15 days"
}

export interface NutritionalRequirements {
  ageGroup: string;
  label: string;
  complementaryFoodEnergyNeeds: {
    breastfed: { value: number; unit: string; note: string };
    non_breastfed: { value: number; unit: string; note: string };
  };
  dailyRequirements: {
    [nutrient: string]: {
      value: number;
      unit: string;
      note: string;
      criticalPeriod?: boolean;
    };
  };
  feedingFrequency: {
    meals: string;
    snacks: string;
    note: string;
  };
}