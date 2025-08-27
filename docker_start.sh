#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting PappoBot (Little Ladle)${NC}"
echo ""

# Check if running in detached mode
DETACHED=""
if [ "$1" == "-d" ] || [ "$1" == "@" ]; then
    DETACHED="-d"
    echo -e "${YELLOW}Running in detached mode${NC}"
fi

# Step 1: Ensure data directory exists with proper permissions
echo -e "${GREEN}📁 Setting up data directory...${NC}"
mkdir -p data-local
chmod 777 data-local
echo -e "   ✅ data-local directory ready"
echo ""

# Step 2: Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo -e "${YELLOW}Please create .env file with your USDA API key:${NC}"
    echo "   VITE_USDA_API_KEY=your_api_key_here"
    exit 1
fi
echo -e "${GREEN}✅ Environment file found${NC}"
echo ""

# Step 3: Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${GREEN}📦 Installing dependencies...${NC}"
    bun install
    echo -e "   ✅ Dependencies installed"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi
echo ""

# Step 4: Build the project if needed
if [ ! -d "dist" ]; then
    echo -e "${GREEN}🔨 Building the application with Bun...${NC}"
    # Use bun's bundler directly instead of vite
    source .env && VITE_USDA_API_KEY=$VITE_USDA_API_KEY bun run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed. Trying alternative build method...${NC}"
        # Alternative: just run the server without pre-building
        echo -e "${YELLOW}Will build inside Docker container instead${NC}"
    else
        echo -e "   ✅ Application built"
    fi
else
    echo -e "${GREEN}✅ Application already built${NC}"
    echo -e "${YELLOW}   (Delete 'dist' folder and re-run to rebuild)${NC}"
fi
echo ""

# Step 5: Start Docker containers
echo -e "${GREEN}🐳 Starting Docker containers...${NC}"
echo ""

# Export user ID for permissions (avoid UID conflict)
export USER_ID=$(id -u)
export GROUP_ID=$(id -g)

# Run docker compose
if [ "$DETACHED" == "-d" ]; then
    docker compose --env-file .env up -d
    echo ""
    echo -e "${GREEN}✅ PappoBot is running in background!${NC}"
    echo -e "${YELLOW}📍 Access the app at: http://localhost:3080${NC}"
    echo ""
    echo -e "To view logs: ${YELLOW}docker compose logs -f${NC}"
    echo -e "To stop: ${YELLOW}docker compose down${NC}"
else
    echo -e "${YELLOW}📍 The app will be available at: http://localhost:3080${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    docker compose --env-file .env up
fi
