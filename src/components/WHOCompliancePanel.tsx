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
    const nutritionalTips = [
      "🥦 Vegetables provide essential vitamins and minerals for healthy growth",
      "🍗 Iron-rich foods help prevent anemia and support brain development",
      "🥛 Dairy products are excellent sources of calcium for strong bones",
      "🍎 Fruits offer natural sweetness and important antioxidants",
      "🌾 Whole grains provide sustained energy for active toddlers",
      "🍽️ Food variety ensures a balanced intake of all essential nutrients"
    ];
    
    const randomTip = nutritionalTips[Math.floor(Math.random() * nutritionalTips.length)];
    
    return (
      <div className="bg-gradient-to-br from-white via-emerald-50/20 to-green-50/30 dark:from-slate-800 dark:via-slate-700/30 dark:to-slate-800 rounded-2xl shadow-xl border-2 border-emerald-200/50 dark:border-slate-600/50 h-full overflow-hidden transition-colors duration-300">
        <div className="p-8 h-full flex flex-col items-center justify-center">
          <div className="relative mb-6">
            <div className="animate-spin w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            <div className="absolute inset-0 animate-ping w-16 h-16 border-4 border-emerald-300 border-t-transparent rounded-full opacity-20"></div>
          </div>
          <p className="text-lg font-bold text-gray-800 mb-4">Analyzing WHO Compliance...</p>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-emerald-200 shadow-lg max-w-md">
            <p className="text-sm text-gray-700 text-center leading-relaxed">
              <span className="text-emerald-600 font-bold">💡 Nutrition Tip:</span>
              <br />
              {randomTip}
            </p>
          </div>
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
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
    <div className="bg-gradient-to-br from-white via-emerald-50/20 to-green-50/30 rounded-2xl shadow-xl border-2 border-emerald-200/50 h-full overflow-hidden">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-500 dark:from-emerald-600 dark:to-green-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
              <span className="text-lg">🏥</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">WHO Compliance</h2>
              <p className="text-emerald-100 text-xs font-medium">for {childProfile.name}</p>
            </div>
          </div>
          
          {/* Compact Score Display */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-12 h-12 bg-gradient-to-r ${scoreStyle.color} rounded-full flex items-center justify-center shadow-xl ring-2 ring-white/30`}>
                <span className="text-lg">{scoreStyle.icon}</span>
              </div>
              {/* Pulse animation for excellent scores */}
              {complianceScore.overallScore >= 80 && (
                <div className={`absolute inset-0 w-12 h-12 bg-gradient-to-r ${scoreStyle.color} rounded-full animate-ping opacity-20`}></div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white drop-shadow-lg">
                {complianceScore.overallScore}%
              </div>
              <div className="text-xs font-bold text-emerald-100">
                {scoreStyle.label}
              </div>
            </div>
          </div>
        </div>
        
        {/* Compact Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-white/20 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full bg-gradient-to-r ${scoreStyle.color} transition-all duration-1000 ease-out shadow-sm`}
              style={{ width: `${complianceScore.overallScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Compact Breakdown */}
      <div className="p-4 max-h-[50vh] overflow-y-auto">
        <h3 className="text-md font-black text-gray-800 dark:text-slate-100 mb-3 flex items-center gap-2 transition-colors duration-300">
          <span className="text-lg">📊</span>
          Analysis
        </h3>
        <div className="space-y-3">
          
          {/* Animal Source Foods */}
          <div className={`bg-gradient-to-r p-4 rounded-2xl border-2 shadow-md transition-all duration-300 hover:shadow-lg ${
            complianceScore.breakdown.animalSourceFoods.met 
              ? 'from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-300' 
              : 'from-red-50 to-orange-50 border-red-200 hover:border-red-300'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                  complianceScore.breakdown.animalSourceFoods.met 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  <span className="text-xl">🍗</span>
                </div>
                <span className="text-sm font-black text-gray-800">Animal Foods</span>
              </div>
              <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                complianceScore.breakdown.animalSourceFoods.met 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {complianceScore.breakdown.animalSourceFoods.score}/25
              </div>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed">
              {complianceScore.breakdown.animalSourceFoods.message}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  complianceScore.breakdown.animalSourceFoods.met 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                    : 'bg-gradient-to-r from-red-400 to-red-500'
                }`}
                style={{ width: `${(complianceScore.breakdown.animalSourceFoods.score / 25) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Fruits and Vegetables */}
          <div className={`bg-gradient-to-r p-4 rounded-2xl border-2 shadow-md transition-all duration-300 hover:shadow-lg ${
            complianceScore.breakdown.fruitsAndVegetables.met 
              ? 'from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-300' 
              : 'from-red-50 to-orange-50 border-red-200 hover:border-red-300'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                  complianceScore.breakdown.fruitsAndVegetables.met 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  <span className="text-xl">🥬</span>
                </div>
                <span className="text-sm font-black text-gray-800">Fruits & Vegetables</span>
              </div>
              <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                complianceScore.breakdown.fruitsAndVegetables.met 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {complianceScore.breakdown.fruitsAndVegetables.score}/25
              </div>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed">
              {complianceScore.breakdown.fruitsAndVegetables.message}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  complianceScore.breakdown.fruitsAndVegetables.met 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                    : 'bg-gradient-to-r from-red-400 to-red-500'
                }`}
                style={{ width: `${(complianceScore.breakdown.fruitsAndVegetables.score / 25) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Food Diversity */}
          <div className={`bg-gradient-to-r p-4 rounded-2xl border-2 shadow-md transition-all duration-300 hover:shadow-lg ${
            complianceScore.breakdown.foodDiversity.count >= 4
              ? 'from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-300' 
              : complianceScore.breakdown.foodDiversity.count >= 3
              ? 'from-yellow-50 to-orange-50 border-yellow-200 hover:border-yellow-300'
              : 'from-red-50 to-orange-50 border-red-200 hover:border-red-300'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                  complianceScore.breakdown.foodDiversity.count >= 4
                    ? 'bg-emerald-100 text-emerald-700' 
                    : complianceScore.breakdown.foodDiversity.count >= 3
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  <span className="text-xl">🌈</span>
                </div>
                <span className="text-sm font-black text-gray-800">Food Diversity</span>
              </div>
              <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                complianceScore.breakdown.foodDiversity.count >= 4
                  ? 'bg-emerald-500 text-white' 
                  : complianceScore.breakdown.foodDiversity.count >= 3
                  ? 'bg-yellow-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {Math.round(complianceScore.breakdown.foodDiversity.score)}/25
              </div>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed">
              {complianceScore.breakdown.foodDiversity.message}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  complianceScore.breakdown.foodDiversity.count >= 4
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                    : complianceScore.breakdown.foodDiversity.count >= 3
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-red-400 to-red-500'
                }`}
                style={{ width: `${(Math.round(complianceScore.breakdown.foodDiversity.score) / 25) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Age Appropriate */}
          <div className={`bg-gradient-to-r p-4 rounded-2xl border-2 shadow-md transition-all duration-300 hover:shadow-lg ${
            complianceScore.breakdown.ageAppropriate.inappropriate === 0
              ? 'from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-300' 
              : 'from-yellow-50 to-orange-50 border-yellow-200 hover:border-yellow-300'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                  complianceScore.breakdown.ageAppropriate.inappropriate === 0
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  <span className="text-xl">👶</span>
                </div>
                <span className="text-sm font-black text-gray-800">Age Appropriate</span>
              </div>
              <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                complianceScore.breakdown.ageAppropriate.inappropriate === 0
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-yellow-500 text-white'
              }`}>
                {complianceScore.breakdown.ageAppropriate.score}/15
              </div>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed">
              {complianceScore.breakdown.ageAppropriate.message}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  complianceScore.breakdown.ageAppropriate.inappropriate === 0
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                }`}
                style={{ width: `${(complianceScore.breakdown.ageAppropriate.score / 15) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Key Nutrients */}
          <div className={`bg-gradient-to-r p-4 rounded-2xl border-2 shadow-md transition-all duration-300 hover:shadow-lg ${
            complianceScore.breakdown.keyNutrients.deficient.length === 0
              ? 'from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-300' 
              : 'from-red-50 to-orange-50 border-red-200 hover:border-red-300'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                  complianceScore.breakdown.keyNutrients.deficient.length === 0
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  <span className="text-xl">💊</span>
                </div>
                <span className="text-sm font-black text-gray-800">Key Nutrients</span>
              </div>
              <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                complianceScore.breakdown.keyNutrients.deficient.length === 0
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {Math.round(complianceScore.breakdown.keyNutrients.score)}/10
              </div>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed">
              {complianceScore.breakdown.keyNutrients.message}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  complianceScore.breakdown.keyNutrients.deficient.length === 0
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                    : 'bg-gradient-to-r from-red-400 to-red-500'
                }`}
                style={{ width: `${(Math.round(complianceScore.breakdown.keyNutrients.score) / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Risk Alerts */}
        {complianceScore.riskAlerts.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-black text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">🚨</span>
              Alerts
            </h4>
            <div className="space-y-4">
              {complianceScore.riskAlerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-2xl border-2 text-sm shadow-md transition-all duration-300 hover:shadow-lg ${
                  alert.severity === 'high' ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-300' :
                  alert.severity === 'medium' ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300' :
                  'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-600' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <span className="text-sm">{
                        alert.severity === 'high' ? '⚠️' :
                        alert.severity === 'medium' ? '💡' : 'ℹ️'
                      }</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 mb-2">{alert.message}</div>
                      <div className="text-gray-700 leading-relaxed">{alert.recommendation}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* General Recommendations */}
        {complianceScore.recommendations.length > 0 && complianceScore.riskAlerts.length === 0 && (
          <div className="mt-6">
            <h4 className="text-md font-black text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">💡</span>
              Tips
            </h4>
            <div className="space-y-3">
              {complianceScore.recommendations.map((rec, index) => (
                <div key={index} className="text-sm text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs">✨</span>
                    </div>
                    <div className="leading-relaxed">{rec}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}