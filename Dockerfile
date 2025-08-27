# Simple single-stage Docker build for PappoBot React application
FROM oven/bun:1-alpine

# Set working directory
WORKDIR /app

# Install required system dependencies
RUN apk add --no-cache curl

# Note: The entire project will be mounted at runtime via docker-compose
# Bun will handle everything inside the container

# Expose port
EXPOSE 3000

# Create an entrypoint script to handle the startup sequence
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'set -e' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo 'echo "🚀 Starting PappoBot in Docker..."' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Step 1: Install dependencies if needed' >> /entrypoint.sh && \
    echo 'if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/vite" ]; then' >> /entrypoint.sh && \
    echo '  echo "📦 Installing dependencies with Bun..."' >> /entrypoint.sh && \
    echo '  bun install' >> /entrypoint.sh && \
    echo '  echo "✅ Dependencies installed"' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Step 2: Build the application if needed' >> /entrypoint.sh && \
    echo 'if [ ! -d "dist" ]; then' >> /entrypoint.sh && \
    echo '  echo "🔨 Building application with Bun..."' >> /entrypoint.sh && \
    echo '  bun run build' >> /entrypoint.sh && \
    echo '  echo "✅ Application built"' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Step 3: Start the server' >> /entrypoint.sh && \
    echo 'echo "🌐 Starting server on port 3000..."' >> /entrypoint.sh && \
    echo 'exec bun run server.ts' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Use the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]