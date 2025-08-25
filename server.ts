import { serve } from "bun";
import { existsSync, mkdirSync } from "fs";
import path from "path";

const PORT = process.env.PORT || 3000;
const DATA_DIR = "/app/data";
const STATIC_DIR = "/app/dist";

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// Data file paths
const CHILD_PROFILES_FILE = path.join(DATA_DIR, "child-profiles.json");
const USER_PREFERENCES_FILE = path.join(DATA_DIR, "user-preferences.json");
const MEAL_HISTORY_FILE = path.join(DATA_DIR, "meal-history.json");

// Helper functions for file operations
async function readJsonFile(filePath: string, defaultValue: any = null) {
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

async function writeJsonFile(filePath: string, data: any) {
  try {
    await Bun.write(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

// CORS headers for React app
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Server
const server = serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method;

    // Handle CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
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

      // API route not found
      return new Response("API endpoint not found", { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Serve static files (React app)
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

console.log(`🚀 PappoBot server running at http://localhost:${PORT}`);
console.log(`📁 Data directory: ${DATA_DIR}`);
console.log(`📂 Static files: ${STATIC_DIR}`);