import { AgeCalculation } from '../types/child';

/**
 * Calculate child's age from birthday and determine WHO age group
 */
export function calculateAge(birthday: string): AgeCalculation {
  const birthDate = new Date(birthday);
  const today = new Date();
  
  // Calculate total days
  const totalDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate months and remaining days
  const months = Math.floor(totalDays / 30.44); // Average days per month
  const remainingDays = Math.floor(totalDays % 30.44);
  
  // Determine WHO age group
  let ageGroup: AgeCalculation['ageGroup'];
  if (totalDays < 180) { // Less than 6 months
    ageGroup = 'under_6_months';
  } else if (totalDays < 365) { // 6-12 months
    ageGroup = '6-12_months';
  } else if (totalDays < 730) { // 12-24 months
    ageGroup = '12-24_months';
  } else {
    ageGroup = 'over_24_months';
  }
  
  // Create display string
  let displayAge: string;
  if (months < 1) {
    displayAge = `${totalDays} days`;
  } else if (months < 12) {
    displayAge = `${months} month${months > 1 ? 's' : ''}${remainingDays > 0 ? `, ${remainingDays} days` : ''}`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    displayAge = `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
  }
  
  return {
    totalDays,
    months,
    days: remainingDays,
    ageGroup,
    displayAge
  };
}

/**
 * Get WHO nutritional requirements for a specific age group
 */
export async function getNutritionalRequirements(ageGroup: AgeCalculation['ageGroup']) {
  try {
    const response = await fetch('/data/who_nutrition_guidelines.json');
    const guidelines = await response.json();
    
    if (ageGroup === 'under_6_months' || ageGroup === 'over_24_months') {
      return null; // No complementary feeding guidelines for these ages
    }
    
    return guidelines.ageGroups[ageGroup] || null;
  } catch (error) {
    console.error('Failed to load WHO guidelines:', error);
    return null;
  }
}

/**
 * Calculate protein requirements based on weight (if available)
 */
export function calculateProteinRequirements(ageGroup: AgeCalculation['ageGroup'], weightKg?: number) {
  if (!weightKg) return null;
  
  const proteinPerKg = ageGroup === '6-12_months' ? 1.1 : 1.0; // g/kg/day
  return {
    dailyProtein: Math.round(weightKg * proteinPerKg * 10) / 10, // Round to 1 decimal
    unit: 'g/day',
    note: `Based on ${weightKg}kg body weight`
  };
}