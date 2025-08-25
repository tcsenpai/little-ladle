# USDA FoodData Central API Integration Plan

## API Overview

The USDA FoodData Central API provides comprehensive nutritional data for foods. This document outlines our integration strategy for PappoBot.

## Authentication & Access

- **API Key Required**: Sign up at data.gov for free API key
- **Rate Limits**: 1,000 requests/hour per IP
- **Base URL**: `https://api.nal.usda.gov/fdc`
- **Demo Key**: Use `DEMO_KEY` for initial development

## Key Endpoints for PappoBot

### 1. Search Foods (`/v1/foods/search`)
- **Purpose**: Find foods by name for our puzzle blocks
- **Method**: GET or POST
- **Key Parameters**:
  - `query`: Search term (e.g., "banana", "sweet potato")
  - `dataType`: Filter by ["Foundation", "SR Legacy"] for whole foods
  - `pageSize`: Max 200 results per page
  - `nutrients`: Specify which nutrients to return (up to 25)

### 2. Get Food Details (`/v1/food/{fdcId}`)
- **Purpose**: Get full nutritional data for selected foods
- **Method**: GET
- **Parameters**:
  - `format`: "full" for complete data
  - `nutrients`: Specific nutrients for 7-month-olds

### 3. Get Multiple Foods (`/v1/foods`)
- **Purpose**: Batch retrieve nutritional data for meal composition
- **Method**: GET or POST
- **Limit**: Up to 20 FDC IDs per request

## Important Nutrients for 7-Month-Olds

Based on the API schema, these nutrient IDs are critical:
- **Protein**: 203
- **Total Fat**: 204
- **Carbohydrates**: 205
- **Calcium**: 301
- **Iron**: 303 (critical at 7 months!)
- **Vitamin A**: 318
- **Vitamin C**: 401
- **Vitamin D**: 328
- **Fiber**: 291

## Data Types to Use

For baby food, focus on:
1. **Foundation Foods**: Whole, unprocessed foods
2. **SR Legacy**: Standard reference foods
3. **Avoid**: Branded foods (too processed for babies)

## Integration Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React Frontend │────▶│  API Service     │────▶│  USDA FDC API   │
│  (Puzzle UI)    │◀────│  (Node.js)       │◀────│                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Local Database  │
                        │  (PostgreSQL)    │
                        └──────────────────┘
```

## Database Schema (Proposed)

```sql
-- Foods table (cached from USDA)
CREATE TABLE foods (
  id SERIAL PRIMARY KEY,
  fdc_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  food_category VARCHAR(100),
  data_type VARCHAR(50),
  suitable_age_months INTEGER[],
  texture VARCHAR(50), -- puree, mashed, soft chunks
  allergens TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nutrients table
CREATE TABLE nutrients (
  id SERIAL PRIMARY KEY,
  nutrient_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  unit VARCHAR(20),
  important_for_babies BOOLEAN DEFAULT FALSE
);

-- Food nutrients junction table
CREATE TABLE food_nutrients (
  food_id INTEGER REFERENCES foods(id),
  nutrient_id INTEGER REFERENCES nutrients(id),
  amount DECIMAL(10, 4),
  PRIMARY KEY (food_id, nutrient_id)
);

-- Baby profiles
CREATE TABLE baby_profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  age_months INTEGER,
  allergies TEXT[],
  preferences JSONB
);

-- Meals
CREATE TABLE meals (
  id SERIAL PRIMARY KEY,
  baby_id INTEGER REFERENCES baby_profiles(id),
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meal foods
CREATE TABLE meal_foods (
  meal_id INTEGER REFERENCES meals(id),
  food_id INTEGER REFERENCES foods(id),
  serving_size_g DECIMAL(6, 2),
  position_x INTEGER, -- for puzzle UI
  position_y INTEGER
);
```

## Implementation Steps

### Phase 1: Data Collection
1. Create API wrapper service
2. Fetch and cache common baby foods:
   - Fruits: banana, apple, pear, avocado
   - Vegetables: sweet potato, carrot, broccoli, peas
   - Grains: oatmeal, rice cereal
   - Proteins: chicken, turkey, tofu
3. Store in local database with age appropriateness

### Phase 2: API Service
```javascript
// Example API wrapper
class FoodDataService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.nal.usda.gov/fdc/v1';
  }

  async searchFoods(query, options = {}) {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      query,
      dataType: ['Foundation', 'SR Legacy'],
      pageSize: 50,
      ...options
    });
    
    const response = await fetch(`${this.baseUrl}/foods/search?${params}`);
    return response.json();
  }

  async getFoodDetails(fdcId, nutrients = BABY_NUTRIENTS) {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      format: 'full',
      nutrients: nutrients.join(',')
    });
    
    const response = await fetch(`${this.baseUrl}/food/${fdcId}?${params}`);
    return response.json();
  }
}
```

### Phase 3: Caching Strategy
- Cache food data for 30 days
- Update nutritional data weekly
- Store user's frequently used foods
- Offline mode with cached data

## Sample API Calls

### Search for baby-appropriate foods:
```bash
curl "https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=banana&dataType=Foundation,SR%20Legacy"
```

### Get full nutritional data:
```bash
curl "https://api.nal.usda.gov/fdc/v1/food/1102644?api_key=DEMO_KEY&nutrients=203,204,205,301,303"
```

## Next Steps
1. Register for API key at data.gov
2. Create Node.js API wrapper
3. Build initial food database
4. Design food block components with nutritional data
5. Implement puzzle logic with real-time nutrition calculation