---
sidebar_position: 1
---

# Quick Start

Get the WorkTime Leave Manager API up and running in **5 minutes**.

## Prerequisites

- Node.js 20+ installed
- Docker and Docker Compose installed
- Git installed

## Step 1: Clone the Repository

```bash
git clone https://github.com/AndreLiar/WorkTime-Leave-Manager-WTLM-.git
cd WorkTime-Leave-Manager-WTLM-
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Start PostgreSQL Database

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This starts a PostgreSQL 16 container with the following credentials:
- **Database**: `wtlm_db`
- **User**: `wtlm_user`
- **Password**: `wtlm_password`
- **Port**: `5432`

## Step 4: Setup Environment Variables

The `.env` file already exists with default values:

```bash
DATABASE_URL="postgresql://wtlm_user:wtlm_password@localhost:5432/wtlm_db"
NODE_ENV="development"
```

## Step 5: Generate Prisma Client

```bash
npm run prisma:generate
```

## Step 6: Run Database Migrations

```bash
npm run prisma:migrate
```

When prompted for a migration name, use: `init`

## Step 7: Start the Application

```bash
npm run start:dev
```

The API will be available at: **http://localhost:3000**

## Step 8: Test the API

### Check Health Status

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-05T10:00:00.000Z",
  "uptime": 123.456
}
```

### Get API Information

```bash
curl http://localhost:3000
```

Expected response:
```json
{
  "message": "Welcome to WorkTime Leave Manager API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "root": "/"
  }
}
```

## Next Steps

- 📖 [API Documentation](../api/endpoints) - Explore all available endpoints
- 🧪 [Testing Guide](../testing/unit-tests) - Run tests
- 🐳 [Docker Deployment](./docker-setup) - Deploy with Docker Compose
- 📊 [Database Schema](../database/schema) - Understand the data model

## Troubleshooting

### Port 5432 Already in Use

```bash
# Check what's using the port
lsof -i :5432

# Stop local PostgreSQL
brew services stop postgresql  # macOS
sudo systemctl stop postgresql  # Linux
```

### Port 3000 Already in Use

```bash
# Change the port in .env
PORT=3001

# Or kill the process
lsof -ti:3000 | xargs kill
```

### Database Connection Errors

```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs postgres

# Restart the database
docker-compose -f docker-compose.dev.yml restart postgres
```
