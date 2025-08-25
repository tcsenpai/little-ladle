import React from 'react';
import { ChildProfile } from '../types/child';
import { MealFood } from '../utils/whoCompliance';
import { Food } from '../types/food';
import { foods } from '../data/foodData';
import { calculateAge } from '../utils/ageCalculation';

interface QuickStartTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (templateFoods: MealFood[]) => void;
  childProfile: ChildProfile | null;
}

interface MealTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  ageGroup: string;
  foods: {
    foodName: string;
    servingGrams: number;
  }[];
}

const mealTemplates: MealTemplate[] = [
  // 6-12 months templates
  {
    id: 'first-breakfast',
    name: 'First Breakfast',
    description: 'Iron-rich start to the day',
    icon: '🌅',
    ageGroup: '6-12_months',
    foods: [
      { foodName: 'Infant cereal, rice, prepared with water, without salt, strained', servingGrams: 15 },
      { foodName: 'Bananas, raw', servingGrams: 10 },
      { foodName: 'Applesauce, canned, unsweetened, without added ascorbic acid', servingGrams: 10 }
    ]
  },
  {
    id: 'veggie-lunch',
    name: 'Veggie Discovery',
    description: 'Colorful vegetables for exploration',
    icon: '🥕',
    ageGroup: '6-12_months',
    foods: [
      { foodName: 'Sweet potato, cooked, baked in skin, flesh, without salt', servingGrams: 15 },
      { foodName: 'Carrots, cooked, boiled, drained, without salt', servingGrams: 10 },
      { foodName: 'Avocados, raw, all commercial varieties', servingGrams: 10 }
    ]
  },
  {
    id: 'protein-power',
    name: 'Protein Power',
    description: 'Essential amino acids for growth',
    icon: '💪',
    ageGroup: '6-12_months',
    foods: [
      { foodName: 'Chicken breast tenders, breaded, cooked, microwaved', servingGrams: 15 },
      { foodName: 'Sweet potato, cooked, baked in skin, flesh, without salt', servingGrams: 10 },
      { foodName: 'Broccoli, cooked, boiled, drained, without salt', servingGrams: 10 }
    ]
  },
  // 12-24 months templates
  {
    id: 'toddler-breakfast',
    name: 'Toddler Breakfast',
    description: 'Hearty morning meal for active toddlers',
    icon: '🍓',
    ageGroup: '12-24_months',
    foods: [
      { foodName: 'Infant cereal, rice, prepared with water, without salt, strained', servingGrams: 20 },
      { foodName: 'Bananas, raw', servingGrams: 15 },
      { foodName: 'Strawberries, raw', servingGrams: 10 },
      { foodName: 'Milk, whole, 3.25% milkfat, with added vitamin D', servingGrams: 10 }
    ]
  },
  {
    id: 'balanced-lunch',
    name: 'Balanced Lunch',
    description: 'Complete meal with all food groups',
    icon: '🍽️',
    ageGroup: '12-24_months',
    foods: [
      { foodName: 'Chicken breast tenders, breaded, cooked, microwaved', servingGrams: 20 },
      { foodName: 'Rice, brown, long-grain, cooked', servingGrams: 15 },
      { foodName: 'Broccoli, cooked, boiled, drained, without salt', servingGrams: 15 },
      { foodName: 'Avocados, raw, all commercial varieties', servingGrams: 10 }
    ]
  },
  {
    id: 'finger-foods',
    name: 'Finger Food Fun',
    description: 'Self-feeding development meal',
    icon: '👶',
    ageGroup: '12-24_months',
    foods: [
      { foodName: 'Cheese, cheddar', servingGrams: 10 },
      { foodName: 'Crackers, standard snack-type, regular', servingGrams: 5 },
      { foodName: 'Blueberries, raw', servingGrams: 15 },
      { foodName: 'Carrots, cooked, boiled, drained, without salt', servingGrams: 10 }
    ]
  }
];

export function QuickStartTemplates({ isOpen, onClose, onApplyTemplate, childProfile }: QuickStartTemplatesProps) {
  if (!isOpen) return null;

  const ageCalc = childProfile ? calculateAge(childProfile.birthday) : null;
  const relevantTemplates = mealTemplates.filter(template => 
    !ageCalc || template.ageGroup === ageCalc.ageGroup || template.ageGroup === 'all'
  );

  const findFood = (foodName: string): Food | undefined => {
    return foods.find(food => food.name === foodName);
  };

  const applyTemplate = (template: MealTemplate) => {
    const templateFoods: MealFood[] = [];
    
    template.foods.forEach((templateFood, index) => {
      const food = findFood(templateFood.foodName);
      if (food) {
        templateFoods.push({
          id: `template-${template.id}-${Date.now()}-${index}`,
          food: food,
          servingGrams: templateFood.servingGrams,
          addedAt: Date.now() + index
        });
      }
    });
    
    onApplyTemplate(templateFoods);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black mb-2">🚀 Quick-Start Meal Templates</h2>
              <p className="text-indigo-100 text-sm">
                {childProfile && ageCalc 
                  ? `Meals designed for ${childProfile.name} (${ageCalc.displayAge})`
                  : 'Age-appropriate meal templates for quick meal planning'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <span className="text-white text-xl font-bold">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relevantTemplates.map(template => (
              <div 
                key={template.id}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-700 dark:to-slate-800 border-2 border-gray-200 dark:border-slate-600 rounded-xl p-5 hover:shadow-lg transition-all duration-300 group hover:border-indigo-300 dark:hover:border-indigo-500"
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{template.icon}</div>
                  <h3 className="text-lg font-black text-gray-800 dark:text-slate-100 mb-1 transition-colors duration-300">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 transition-colors duration-300">
                    {template.description}
                  </p>
                </div>

                {/* Food List */}
                <div className="space-y-2 mb-4">
                  {template.foods.map((templateFood, index) => {
                    const food = findFood(templateFood.foodName);
                    return (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-slate-300 truncate transition-colors duration-300">
                          {food?.shortName || templateFood.foodName}
                        </span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold ml-auto">
                          {templateFood.servingGrams}g
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Age Group Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-xs font-bold rounded-lg transition-colors duration-300">
                    {template.ageGroup === '6-12_months' ? '6-12m' : '12-24m'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-500 transition-colors duration-300">
                    {template.foods.length} foods
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => applyTemplate(template)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold rounded-xl transition-all duration-200 transform group-hover:scale-105 shadow-md hover:shadow-lg"
                >
                  🍽️ Use This Template
                </button>
              </div>
            ))}
          </div>

          {relevantTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-600 dark:text-slate-400 mb-2 transition-colors duration-300">
                No templates available
              </h3>
              <p className="text-gray-500 dark:text-slate-500 transition-colors duration-300">
                Add a child profile to see age-appropriate meal templates
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}