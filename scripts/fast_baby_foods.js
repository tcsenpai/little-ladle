#!/usr/bin/env node

/**
 * Fast Baby Foods Database Builder - Minimal delays
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

const API_KEY = process.env.USDA_API_KEY;
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

let requestCount = 0;
const MAX_REQUESTS = 300;

// Correct nutrient IDs
const nutrientMap = {
  1003: { key: 'protein', name: 'Protein' },
  1004: { key: 'fat', name: 'Total Fat' },
  1005: { key: 'carbs', name: 'Carbohydrates' },
  1087: { key: 'calcium', name: 'Calcium' },
  1089: { key: 'iron', name: 'Iron' },
  1106: { key: 'vitaminA', name: 'Vitamin A' },
  1162: { key: 'vitaminC', name: 'Vitamin C' },
  1179: { key: 'potassium', name: 'Potassium' }
};

// Core baby foods only
const CORE_FOODS = {
  essentials: [
    'avocado raw', 'banana raw', 'sweet potato cooked', 
    'apple raw', 'broccoli raw', 'chicken breast cooked',
    'salmon cooked', 'egg whole cooked', 'lentils cooked',
    'yogurt plain whole milk', 'cheddar cheese', 'quinoa cooked',
    'blueberries raw', 'spinach cooked', 'brown rice cooked',
    'oatmeal cooked', 'peas cooked', 'strawberries raw',
    'ground turkey cooked', 'butternut squash cooked'
  ]
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function searchFood(query) {
  if (requestCount >= MAX_REQUESTS) return [];
  
  const params = new URLSearchParams({
    api_key: API_KEY,
    query: query,
    dataType: ['Foundation', 'SR Legacy'].join(','),
    pageSize: 1
  });

  try {
    requestCount++;
    const response = await fetch(`${BASE_URL}/foods/search?${params}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.foods?.slice(0, 1) || [];
  } catch {
    return [];
  }
}

async function getFoodDetails(fdcId) {
  if (requestCount >= MAX_REQUESTS) return null;

  try {
    requestCount++;
    const response = await fetch(`${BASE_URL}/food/${fdcId}?api_key=${API_KEY}&format=full`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function processNutrients(foodNutrients) {
  const nutrients = {};
  for (const fn of foodNutrients || []) {
    if (fn.nutrient && nutrientMap[fn.nutrient.id] && fn.amount != null) {
      const mapping = nutrientMap[fn.nutrient.id];
      nutrients[mapping.key] = {
        name: mapping.name,
        amount: fn.amount,
        unit: fn.nutrient.unitName || 'g'
      };
    }
  }
  return nutrients;
}

function categorizeFood(description) {
  const desc = description.toLowerCase();
  if (/\b(chicken|turkey|beef|salmon|fish|egg|tofu|beans|lentil)\b/.test(desc)) return 'protein';
  if (/\b(apple|banana|berry|peach|orange|mango|melon)\b/.test(desc)) return 'fruit';
  if (/\b(broccoli|spinach|carrot|pea|squash)\b/.test(desc)) return 'vegetable';
  if (/\b(rice|oat|wheat|quinoa|cereal)\b/.test(desc)) return 'grain';
  if (/\b(milk|cheese|yogurt)\b/.test(desc)) return 'dairy';
  return 'other';
}

async function main() {
  console.log('🚀 Building core baby foods database (fast version)...\n');
  
  const allFoods = [];
  const seenIds = new Set();
  let processed = 0;

  for (const query of CORE_FOODS.essentials) {
    if (requestCount >= MAX_REQUESTS - 10) break;
    
    console.log(`[${++processed}/${CORE_FOODS.essentials.length}] ${query}`);
    
    const results = await searchFood(query);
    
    if (results.length > 0 && !seenIds.has(results[0].fdcId)) {
      const food = results[0];
      seenIds.add(food.fdcId);
      
      await delay(50); // Minimal delay
      const details = await getFoodDetails(food.fdcId);
      
      if (details) {
        const processedFood = {
          fdcId: food.fdcId,
          name: details.description,
          shortName: query,
          category: categorizeFood(details.description),
          nutrients: processNutrients(details.foodNutrients),
          ageGroup: '8+ months'
        };
        
        allFoods.push(processedFood);
        
        const iron = processedFood.nutrients.iron?.amount || 0;
        const protein = processedFood.nutrients.protein?.amount || 0;
        console.log(`  ✅ Iron: ${iron}mg, Protein: ${protein}g`);
      }
    }
    
    await delay(30); // Very short delay
  }

  // Save database
  const outputDir = path.join(__dirname, '..', 'data');
  await fs.mkdir(outputDir, { recursive: true });

  const database = {
    metadata: {
      createdAt: new Date().toISOString(),
      totalFoods: allFoods.length,
      apiRequestsUsed: requestCount,
      version: 'sophie-foods-v1'
    },
    foods: allFoods
  };

  const dbFile = path.join(outputDir, 'sophie_foods.json');
  await fs.writeFile(dbFile, JSON.stringify(database, null, 2));

  // Create quick analysis
  const highIron = allFoods
    .filter(f => f.nutrients.iron && f.nutrients.iron.amount > 1)
    .sort((a, b) => b.nutrients.iron.amount - a.nutrients.iron.amount);

  const highProtein = allFoods
    .filter(f => f.nutrients.protein && f.nutrients.protein.amount > 10)
    .sort((a, b) => b.nutrients.protein.amount - a.nutrients.protein.amount);

  console.log('\n🎉 Sophie\'s food database ready!');
  console.log(`📊 Total foods: ${allFoods.length}`);
  console.log(`🔌 API requests: ${requestCount}/${MAX_REQUESTS}`);
  
  console.log(`\n🥇 Best for Sophie (7 months):`);
  console.log(`🔥 Iron-rich foods (${highIron.length}):`);
  highIron.slice(0, 5).forEach(f => 
    console.log(`  • ${f.name.substring(0, 40)}: ${f.nutrients.iron.amount}mg`)
  );
  
  console.log(`💪 High-protein foods (${highProtein.length}):`);
  highProtein.slice(0, 5).forEach(f => 
    console.log(`  • ${f.name.substring(0, 40)}: ${f.nutrients.protein.amount}g`)
  );

  console.log(`\n📁 Saved: ./data/sophie_foods.json`);
}

main().catch(console.error);