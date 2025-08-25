# Docker Setup Testing Guide

## Quick Test Commands

### 1. Validate Configuration
```bash
# Check Docker Compose syntax
docker compose config --quiet

# View resolved configuration  
docker compose config
```

### 2. Build and Test
```bash
# Build the Docker image
docker compose build

# Run the application
docker compose up

# Run in background
docker compose up -d

# Check application health
curl http://localhost:3080

# View logs
docker compose logs -f pappobot
```

### 3. Production Testing
```bash
# Setup production environment
cp .env docker/config/.env.production
# Edit docker/config/.env.production with actual values

# Run without override (production mode)
docker compose -f docker-compose.yml up --build

# Test with file browser enabled
docker compose --profile management up -d
```

### 4. Data Persistence Test
```bash
# Start application
docker compose up -d

# Add some data (use the application)

# Stop and restart
docker compose down
docker compose up -d

# Verify data persisted
```

### 5. Cleanup
```bash
# Stop and remove containers
docker compose down

# Remove volumes (WARNING: deletes data)
docker compose down -v

# Remove images
docker rmi pappobot-pappobot
```

## File Structure Created

```
├── Dockerfile                      # Multi-stage build with Bun
├── docker-compose.yml             # Main orchestration
├── docker-compose.override.yml    # Development overrides  
├── nginx.conf                     # Nginx configuration
├── .dockerignore                  # Build context optimization
└── docker/
    ├── config/
    │   └── .env.production        # Production environment
    ├── data/
    │   └── sophie_foods.json      # Persistent data
    └── README.md                  # Docker documentation
```

## Architecture

- **Build Stage**: Bun-based multi-stage build for optimal image size
- **Production Stage**: Nginx serving optimized static files
- **Volumes**: Persistent data storage with local bind mounts
- **Networking**: Isolated bridge network for services
- **Health Checks**: Application health monitoring
- **Security**: Non-root user, security headers, minimal attack surface

## Performance Features

- **Gzip compression** for static assets
- **Caching headers** for optimal browser caching
- **Multi-stage build** for smaller production images
- **Nginx optimization** for serving React applications
- **Health checks** for container monitoring

## Production Considerations

- Update `docker/config/.env.production` with actual API keys
- Consider using Docker Secrets for sensitive data
- Monitor resource usage and adjust limits as needed
- Set up log rotation for production deployments
- Consider using a reverse proxy (Traefik/nginx) for SSL termination