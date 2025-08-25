# Docker Setup for PappoBot

This directory contains Docker configuration and persistent data for PappoBot.

## Directory Structure

```
docker/
├── config/                 # Configuration files
│   └── .env.production    # Production environment variables
└── data/                  # Persistent application data
    └── sophie_foods.json  # Food database
```

## Configuration

### Environment Variables

1. Copy your production environment variables to `config/.env.production`
2. Update the USDA API key and other settings as needed
3. The configuration is mounted read-only in the container

### Data Persistence

- Application data is stored in `docker/data/`
- This directory is mounted as a volume in the container
- Data persists between container restarts and rebuilds

## Usage

See the main project README.md for Docker Compose usage instructions.