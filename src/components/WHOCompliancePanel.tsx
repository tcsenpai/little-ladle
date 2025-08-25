import React, { useState, useEffect } from 'react';
import { ChildProfile } from '../types/child';
import { WHOComplianceScore, MealFood, calculateWHOCompliance } from '../utils/whoCompliance';
import { calculateAge } from '../utils/ageCalculation';

interface WHOCompliancePanelProps {
  mealFoods: MealFood[];
  childProfile: ChildProfile | null;
}

export function WHOCompliancePanel({ mealFoods, childProfile }: WHOCompliancePanelProps) {
  const [complianceScore, setComplianceScore] = useState<WHOComplianceScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate compliance score when meal or profile changes
  useEffect(() => {
    if (!childProfile || mealFoods.length === 0) {
      setComplianceScore(null);
      return;
    }

    const calculateCompliance = async () => {
      setIsLoading(true);
      try {
        const score = await calculateWHOCompliance(mealFoods, childProfile);
        setComplianceScore(score);
      } catch (error) {
        console.error('Failed to calculate WHO compliance:', error);
        setComplianceScore(null);
      } finally {
        setIsLoading(false);
      }
    };

    calculateCompliance();
  }, [mealFoods, childProfile]);

  if (!childProfile) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
        <div className="p-6 h-full flex flex-col items-center justify-center">
          <div className="text-5xl mb-4 text-gray-400">👶</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Create Child Profile</h3>
          <p className="text-sm text-gray-500 text-center">
            Add your child's profile to get personalized WHO nutrition compliance scoring
          </p>
        </div>
      </div>
    );
  }

  const ageCalc = calculateAge(childProfile.birthday);
  
  if (ageCalc.ageGroup === 'under_6_months' || ageCalc.ageGroup === 'over_24_months') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
        <div className="p-6 h-full flex flex-col items-center justify-center">
          <div className="text-5xl mb-4 text-gray-400">
            {ageCalc.ageGroup === 'under_6_months' ? '🍼' : '🧒'}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {ageCalc.ageGroup === 'under_6_months' ? 'Too Young' : 'Beyond Guidelines'}
          </h3>
          <p className="text-sm text-gray-500 text-center">
            WHO complementary feeding guidelines apply to children 6-23 months old
          </p>
        </div>
      </div>
    );
  }

  if (mealFoods.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
        <div className="p-6 h-full flex flex-col items-center justify-center">
          <div className="text-5xl mb-4 text-gray-400">🍽️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Build a Meal</h3>
          <p className="text-sm text-gray-500 text-center">
            Add foods to your meal tower to see WHO compliance scoring for {childProfile.name}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !complianceScore) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
        <div className="p-6 h-full flex flex-col items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Calculating WHO compliance...</p>
        </div>
      </div>
    );
  }

  // Determine overall score color and icon
  const getScoreStyle = (score: number) => {
    if (score >= 80) return { color: 'from-emerald-500 to-green-500', icon: '🌟', label: 'Excellent' };
    if (score >= 60) return { color: 'from-yellow-500 to-orange-500', icon: '⭐', label: 'Good' };
    if (score >= 40) return { color: 'from-orange-500 to-red-500', icon: '⚠️', label: 'Needs Work' };
    return { color: 'from-red-500 to-red-600', icon: '❌', label: 'Poor' };
  };

  const scoreStyle = getScoreStyle(complianceScore.overallScore);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
      {/* Header */}
      <div className="p-6 border-b-2 border-emerald-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-xl">🏥</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800">WHO Compliance</h2>
            <p className="text-sm text-gray-600">for {childProfile.name}</p>
          </div>
        </div>
        
        {/* Overall Score */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className={`w-16 h-16 bg-gradient-to-r ${scoreStyle.color} rounded-full flex items-center justify-center shadow-xl`}>
              <span className="text-2xl">{scoreStyle.icon}</span>
            </div>
            <div>
              <div className={`text-3xl font-black text-transparent bg-gradient-to-r ${scoreStyle.color} bg-clip-text`}>
                {complianceScore.overallScore}%
              </div>
              <div className={`text-sm font-bold text-transparent bg-gradient-to-r ${scoreStyle.color} bg-clip-text`}>
                {scoreStyle.label}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-600">WHO Complementary Feeding Compliance</div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="p-4 max-h-[60vh] overflow-y-auto">
        <div className="space-y-3">
          
          {/* Animal Source Foods */}
          <div className="bg-white/50 rounded-xl p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍗</span>
                <span className="text-sm font-bold text-gray-800">Animal Foods</span>
              </div>
              <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                complianceScore.breakdown.animalSourceFoods.met 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {complianceScore.breakdown.animalSourceFoods.score}/25
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {complianceScore.breakdown.animalSourceFoods.message}
            </div>
          </div>

          {/* Fruits and Vegetables */}
          <div className="bg-white/50 rounded-xl p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥬</span>
                <span className="text-sm font-bold text-gray-800">Fruits & Vegetables</span>
              </div>
              <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                complianceScore.breakdown.fruitsAndVegetables.met 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {complianceScore.breakdown.fruitsAndVegetables.score}/25
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {complianceScore.breakdown.fruitsAndVegetables.message}
            </div>
          </div>

          {/* Food Diversity */}
          <div className="bg-white/50 rounded-xl p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌈</span>
                <span className="text-sm font-bold text-gray-800">Food Diversity</span>
              </div>
              <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                complianceScore.breakdown.foodDiversity.count >= 4
                  ? 'bg-emerald-100 text-emerald-800' 
                  : complianceScore.breakdown.foodDiversity.count >= 3
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {Math.round(complianceScore.breakdown.foodDiversity.score)}/25
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {complianceScore.breakdown.foodDiversity.message}
            </div>
          </div>

          {/* Age Appropriate */}
          <div className="bg-white/50 rounded-xl p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">👶</span>
                <span className="text-sm font-bold text-gray-800">Age Appropriate</span>
              </div>
              <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                complianceScore.breakdown.ageAppropriate.inappropriate === 0
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {complianceScore.breakdown.ageAppropriate.score}/15
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {complianceScore.breakdown.ageAppropriate.message}
            </div>
          </div>

          {/* Key Nutrients */}
          <div className="bg-white/50 rounded-xl p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">💊</span>
                <span className="text-sm font-bold text-gray-800">Key Nutrients</span>
              </div>
              <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                complianceScore.breakdown.keyNutrients.deficient.length === 0
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {Math.round(complianceScore.breakdown.keyNutrients.score)}/10
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {complianceScore.breakdown.keyNutrients.message}
            </div>
          </div>
        </div>

        {/* Risk Alerts */}
        {complianceScore.riskAlerts.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Alerts & Recommendations</h4>
            <div className="space-y-3">
              {complianceScore.riskAlerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border text-sm ${
                  alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="font-medium text-gray-900 mb-1">{alert.message}</div>
                  <div className="text-gray-600 text-xs">{alert.recommendation}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* General Recommendations */}
        {complianceScore.recommendations.length > 0 && complianceScore.riskAlerts.length === 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Suggestions</h4>
            <div className="space-y-2">
              {complianceScore.recommendations.map((rec, index) => (
                <div key={index} className="text-xs text-gray-700 bg-gray-50 rounded-md p-2 border border-gray-200">
                  {rec}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}