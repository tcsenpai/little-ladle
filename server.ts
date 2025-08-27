import { serve } from "bun";
import { existsSync, mkdirSync } from "fs";
import * as path from "path";
import type { Recipe, CustomFood } from "./src/types/user";

// Environment detection
const isDevelopment = process.env.NODE_ENV === "development" || !existsSync("./dist");
const PORT = isDevelopment ? 3001 : (process.env.PORT || 3000);
const DATA_DIR = isDevelopment ? "./data-local" : (process.env.DATA_DIR || "./data");
const STATIC_DIR = "./dist";

// Ensure data directory exists
try {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (error) {
  console.warn(`Note: Could not create ${DATA_DIR} directory. It may already exist or you may need to create it manually.`);
  // Continue anyway - the directory might already exist
}

// Data file paths
const CHILD_PROFILES_FILE = path.join(DATA_DIR, "baby_data_child-profiles.json");
const USER_PREFERENCES_FILE = path.join(DATA_DIR, "baby_data_user-preferences.json");
const MEAL_HISTORY_FILE = path.join(DATA_DIR, "baby_data_meal-history.json");
const RECIPES_FILE = path.join(DATA_DIR, "favorite_meal_recipes.json");
const CUSTOM_FOODS_FILE = path.join(DATA_DIR, "baby_data_custom-foods.json");

// Helper functions for file operations
async function readJsonFile<T = unknown>(filePath: string, defaultValue: T | null = null): Promise<T | null> {
  try {
    if (!existsSync(filePath)) {
      return defaultValue;
    }
    const content = await Bun.file(filePath).text();
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultValue;
  }
}

async function writeJsonFile(filePath: string, data: unknown): Promise<boolean> {
  try {
    await Bun.write(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

// CORS headers for React app
function getCorsHeaders(origin: string | null) {
  const allowedOrigins = [
    /^http:\/\/localhost:\d+$/,  // Any localhost port
    /^https:\/\/localhost:\d+$/, // HTTPS localhost
    /^https?:\/\/.*\.tcsenpai\.com$/, // Any subdomain of tcsenpai.com
  ];
  
  const isAllowed = origin && allowedOrigins.some(pattern => pattern.test(origin));
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Server
const server = serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method;
    const origin = request.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    // Handle CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Serve static data files (WHO guidelines, etc.)
    if (url.pathname.startsWith("/data/")) {
      const dataFilePath = path.join(STATIC_DIR, url.pathname);
      try {
        const file = Bun.file(dataFilePath);
        const exists = await file.exists();
        
        if (exists) {
          return new Response(file, {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          });
        }
      } catch (error) {
        console.error(`Error serving data file ${url.pathname}:`, error);
      }
      
      return new Response("Data file not found", { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // API Routes
    if (url.pathname.startsWith("/api")) {
      
      // Child Profiles API
      if (url.pathname === "/api/child-profiles") {
        if (method === "GET") {
          const profiles = await readJsonFile(CHILD_PROFILES_FILE, []);
          return new Response(JSON.stringify(profiles), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        if (method === "POST") {
          const profiles = await request.json();
          const success = await writeJsonFile(CHILD_PROFILES_FILE, profiles);
          return new Response(JSON.stringify({ success }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: success ? 200 : 500,
          });
        }
      }

      // User Preferences API
      if (url.pathname === "/api/user-preferences") {
        if (method === "GET") {
          const preferences = await readJsonFile(USER_PREFERENCES_FILE, {});
          return new Response(JSON.stringify(preferences), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        if (method === "POST") {
          const preferences = await request.json();
          const success = await writeJsonFile(USER_PREFERENCES_FILE, preferences);
          return new Response(JSON.stringify({ success }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: success ? 200 : 500,
          });
        }
      }

      // Meal History API
      if (url.pathname === "/api/meal-history") {
        if (method === "GET") {
          const history = await readJsonFile(MEAL_HISTORY_FILE, []);
          return new Response(JSON.stringify(history), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        if (method === "POST") {
          const history = await request.json();
          const success = await writeJsonFile(MEAL_HISTORY_FILE, history);
          return new Response(JSON.stringify({ success }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: success ? 200 : 500,
          });
        }
      }

      // Recipes API
      if (url.pathname === "/api/recipes") {
        if (method === "GET") {
          const recipes = await readJsonFile(RECIPES_FILE, []);
          return new Response(JSON.stringify(recipes), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        if (method === "POST") {
          const recipe = await request.json();
          const recipes = await readJsonFile(RECIPES_FILE, []);
          recipe.id = Date.now().toString(); // Simple ID generation
          recipe.createdAt = new Date().toISOString();
          recipes.push(recipe);
          const success = await writeJsonFile(RECIPES_FILE, recipes);
          return new Response(JSON.stringify({ success, recipe }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: success ? 200 : 500,
          });
        }
        
        if (method === "DELETE") {
          const { id } = await request.json();
          const recipes = await readJsonFile(RECIPES_FILE, []);
          const filteredRecipes = recipes.filter((r: Recipe) => r.id !== id);
          const success = await writeJsonFile(RECIPES_FILE, filteredRecipes);
          return new Response(JSON.stringify({ success }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: success ? 200 : 500,
          });
        }
      }

      // Custom Foods API
      if (url.pathname === "/api/custom-foods") {
        if (method === "GET") {
          const customFoods = await readJsonFile(CUSTOM_FOODS_FILE, []);
          return new Response(JSON.stringify(customFoods), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        if (method === "POST") {
          const customFood = await request.json();
          const customFoods = await readJsonFile(CUSTOM_FOODS_FILE, []);
          
          // Check if food already exists (by fdcId or name)
          const existingIndex = customFoods.findIndex((f: CustomFood) => 
            f.fdcId === customFood.fdcId || f.name === customFood.name
          );
          
          if (existingIndex >= 0) {
            // Update existing food
            customFoods[existingIndex] = { ...customFood, updatedAt: new Date().toISOString() };
          } else {
            // Add new food
            customFood.addedAt = new Date().toISOString();
            customFoods.push(customFood);
          }
          
          const success = await writeJsonFile(CUSTOM_FOODS_FILE, customFoods);
          return new Response(JSON.stringify({ success, food: customFood }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: success ? 200 : 500,
          });
        }
        
        if (method === "DELETE") {
          const { fdcId } = await request.json();
          const customFoods = await readJsonFile(CUSTOM_FOODS_FILE, []);
          const filteredFoods = customFoods.filter((f: CustomFood) => f.fdcId !== fdcId);
          const success = await writeJsonFile(CUSTOM_FOODS_FILE, filteredFoods);
          return new Response(JSON.stringify({ success }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: success ? 200 : 500,
          });
        }
      }

      // API route not found
      return new Response("API endpoint not found", { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // In development mode, don't serve static files - let Vite handle that
    if (isDevelopment) {
      return new Response("Development API server - use Vite for frontend", { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Serve static files (React app) in production
    const filePath = url.pathname === "/" ? "/index.html" : url.pathname;
    const fullPath = path.join(STATIC_DIR, filePath);
    
    try {
      const file = Bun.file(fullPath);
      const exists = await file.exists();
      
      if (exists) {
        const contentType = getContentType(filePath);
        return new Response(file, {
          headers: {
            "Content-Type": contentType,
            ...corsHeaders,
          },
        });
      }
      
      // For React Router - serve index.html for non-API routes
      const indexFile = Bun.file(path.join(STATIC_DIR, "index.html"));
      return new Response(indexFile, {
        headers: {
          "Content-Type": "text/html",
          ...corsHeaders,
        },
      });
    } catch (error) {
      console.error("Error serving file:", error);
      return new Response("Internal Server Error", { 
        status: 500,
        headers: corsHeaders 
      });
    }
  },
});

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes: { [key: string]: string } = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
  };
  return contentTypes[ext] || 'text/plain';
}

if (isDevelopment) {
  console.log(`🚀 Little Ladle API server (dev) running at http://localhost:${PORT}`);
  console.log(`📁 Data directory: ${DATA_DIR}`);
  console.log(`🔗 Connect from Vite dev server at http://localhost:5173 or 3000`);
} else {
  console.log(`🚀 Little Ladle server (prod) running at http://localhost:${PORT}`);
  console.log(`📁 Data directory: ${DATA_DIR}`);
  console.log(`📂 Static files: ${STATIC_DIR}`);
}