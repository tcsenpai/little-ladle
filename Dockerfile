# Simple single-stage Docker build for PappoBot React application
FROM oven/bun:1-alpine

# Set working directory
WORKDIR /app

# Install bun dependencies globally that might be needed
RUN apk add --no-cache curl

# Note: The entire project will be mounted at runtime via docker-compose
# Running as root to avoid permission issues with mounted volumes

# Expose port
EXPOSE 3000

# When container starts, install deps if needed, build if needed, and run the server
CMD ["sh", "-c", "if [ ! -d node_modules ]; then bun install; fi && if [ ! -d dist ]; then VITE_USDA_API_KEY=${VITE_USDA_API_KEY} bun run build; fi && bun run server.ts"]