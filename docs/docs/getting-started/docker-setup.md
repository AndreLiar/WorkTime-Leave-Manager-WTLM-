---
sidebar_position: 2
---

# Docker Setup

Deploy the entire application stack using Docker Compose.

## Overview

The project includes two Docker Compose configurations:

1. **docker-compose.dev.yml** - PostgreSQL only (for local development)
2. **docker-compose.yml** - Full stack (PostgreSQL + API)

## Development Setup (Database Only)

### Start PostgreSQL

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Configuration

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: wtlm-postgres-dev
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: wtlm_user
      POSTGRES_PASSWORD: wtlm_password
      POSTGRES_DB: wtlm_db
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
```

### Connect to Database

```bash
# Using psql
docker exec -it wtlm-postgres-dev psql -U wtlm_user -d wtlm_db

# Or from host (if psql installed)
psql postgresql://wtlm_user:wtlm_password@localhost:5432/wtlm_db
```

### Stop Database

```bash
docker-compose -f docker-compose.dev.yml down

# Remove data volumes
docker-compose -f docker-compose.dev.yml down -v
```

## Production Setup (Full Stack)

### Start All Services

```bash
docker-compose up --build -d
```

This starts:
- PostgreSQL database on port 5432
- NestJS API on port 3000

### Configuration

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: wtlm_user
      POSTGRES_PASSWORD: wtlm_password
      POSTGRES_DB: wtlm_db
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready']
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: postgresql://wtlm_user:wtlm_password@postgres:5432/wtlm_db
    depends_on:
      postgres:
        condition: service_healthy
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Test the API

```bash
curl http://localhost:3000/health
```

### Stop All Services

```bash
docker-compose down

# Remove everything including volumes
docker-compose down -v
```

## Dockerfile Breakdown

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --only=production --ignore-scripts
RUN npx prisma generate
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
```

### Key Features:
- **Multi-stage build** - Smaller production image
- **Prisma migration** - Runs automatically on startup
- **Health checks** - Ensures database is ready before app starts
- **Volume persistence** - Data survives container restarts

## Docker Commands Reference

### Images

```bash
# Build image
docker build -t wtlm-api .

# List images
docker images

# Remove image
docker rmi wtlm-api
```

### Containers

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Stop container
docker stop wtlm-app

# Remove container
docker rm wtlm-app

# Execute command in container
docker exec -it wtlm-app sh
```

### Volumes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect wtlm-postgres_data

# Remove volume
docker volume rm wtlm-postgres_data
```

## Environment Variables

Create a `.env` file for production:

```bash
# Database
DATABASE_URL=postgresql://wtlm_user:wtlm_password@postgres:5432/wtlm_db

# Application
NODE_ENV=production
PORT=3000

# Optional
LOG_LEVEL=info
```

## Troubleshooting

### Port Conflicts

```bash
# Change ports in docker-compose.yml
ports:
  - '3001:3000'  # Host:Container
```

### Build Failures

```bash
# Clean build
docker-compose build --no-cache

# Check build logs
docker-compose build app
```

### Database Connection Issues

```bash
# Check if postgres is healthy
docker-compose ps

# View postgres logs
docker-compose logs postgres

# Manually run migrations
docker-compose exec app npx prisma migrate deploy
```

### Container Won't Start

```bash
# View startup logs
docker-compose logs app

# Check resources
docker stats

# Restart services
docker-compose restart
```

## Production Best Practices

1. **Use secrets management** for sensitive data
2. **Set resource limits** in docker-compose.yml
3. **Enable logging drivers** for centralized logs
4. **Use health checks** for all services
5. **Back up database volumes** regularly
6. **Monitor container metrics** with tools like Prometheus

## Next Steps

- [Code Quality Guide](../development/code-quality)
- [Architecture Overview](../architecture/overview)
