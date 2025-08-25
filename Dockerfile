# Simple single-stage Docker build for PappoBot React application
FROM oven/bun:1-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies with Bun
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Create directory for application data and set permissions in one step
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 -G appuser && \
    mkdir -p /app/data && \
    chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 3000

# Run our custom server
CMD ["bun", "run", "server.ts"]