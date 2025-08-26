#!/bin/bash

# Kill any existing dev servers
pkill -f "NODE_ENV=development.*server.ts" 2>/dev/null || true

echo "Starting API server on port 3001..."
NODE_ENV=development bun run server.ts &
API_PID=$!

echo "Starting Vite dev server..."
vite

# When Vite exits, kill the API server
kill $API_PID 2>/dev/null || true