# Little Ladle

A modern React application for baby-led weaning and complementary feeding guidance, following WHO/FAO guidelines.

## Features

- 🍎 Age-appropriate food recommendations (6+ months, 8+ months, 12+ months)
- 📊 Nutritional analysis with iron, protein, and calcium tracking
- 👶 Child profile management with personalized recommendations
- 🤖 AI-powered meal suggestions (AutoChef)
- 📱 Mobile-first responsive design
- 🌙 Dark mode support
- ♿ Accessibility features
- 📋 Quick start meal templates

## Development

### Prerequisites

- [Bun](https://bun.sh) runtime

### Installation

```bash
bun install
```

### Development Server

```bash
bun run dev
```

Visit [http://localhost:5173](http://localhost:5173) to view the application.

### Build for Production

```bash
bun run build
```

### Preview Production Build

```bash
bun run preview
```

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Emoji-based design system
- **Drag & Drop**: @dnd-kit
- **Runtime**: Bun

## Docker Deployment

### Quick Start with Docker

1. **Build and run with Docker Compose:**
   ```bash
   docker compose up --build
   ```

2. **Access the application:**
   - Main application: http://localhost:3080
   - File browser (optional): http://localhost:3081

3. **Stop the application:**
   ```bash
   docker compose down
   ```

### Docker Configuration

- **Multi-stage build** using Bun for optimal performance
- **Nginx** serving optimized static files  
- **Persistent data volumes** for application data
- **Health checks** and proper security headers
- **Optional file browser** for data management

### Production Deployment

1. **Copy production environment:**
   ```bash
   cp .env docker/config/.env.production
   # Edit docker/config/.env.production with production values
   ```

2. **Run in production mode:**
   ```bash
   docker compose -f docker-compose.yml up -d
   ```

3. **Enable file browser (optional):**
   ```bash
   docker compose --profile management up -d
   ```

### Docker Commands

```bash
# Build only
docker compose build

# Run in background
docker compose up -d

# View logs
docker compose logs -f

# Update and restart
docker compose up --build -d

# Clean up
docker compose down -v
```

## Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── data/               # Food database and constants
├── constants/          # Configuration constants
└── styles/             # Global styles

docker/
├── config/             # Docker configuration
│   └── .env.production # Production environment
└── data/               # Persistent application data
```
