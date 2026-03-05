---
sidebar_position: 1
---

# Deployment Guide

Deployment options for WorkTime Leave Manager, from local Docker Compose to the Render-hosted production workflow.

## Prerequisites

- Docker 24+
- Docker Compose 2+
- Environment variables configured (copy `.env.example` to `.env`)

## Local Docker Compose (App + PostgreSQL)

```bash
docker-compose up --build -d
```

Services started:

- `postgres` on port `5432`
- `app` (NestJS API) on port `3000`

View logs:

```bash
docker-compose logs -f
docker-compose logs -f app
```

Shutdown:

```bash
docker-compose down
docker-compose down -v   # remove volumes
```

## Database-Only Compose (Development)

For local coding sessions you can run only PostgreSQL and keep the API on `npm run start:dev`:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

## Production Docker Image

The Dockerfile uses a multi-stage build:

1. Install dependencies & generate Prisma client
2. Compile the NestJS app
3. Copy the compiled artifacts into a slim runtime image
4. Run `npx prisma migrate deploy && node dist/main`

Build manually:

```bash
docker build -t wtlm-api .
docker run --env-file .env -p 3000:3000 wtlm-api
```

## CI/CD (GitHub Actions + Render)

- `ci.yml` runs lint, type-check, Jest, build, and the Newman integration suite on pull requests.
- `cd.yml` builds and pushes the Docker image to GHCR, then triggers a Render deployment using secrets `RENDER_DEPLOY_HOOK`, `RENDER_API_KEY`, and `RENDER_SERVICE_ID`.

To enable automatic production deploys, set those secrets plus optional `RENDER_APP_URL` for health checks.

## Environment Variables

Key variables consumed at runtime:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API port (default 3000) |
| `API_PREFIX` | Optional global prefix for routes |
| `NODE_ENV` | `development` or `production` |

## Post-Deployment Checks

1. Hit `/health` to confirm uptime and timestamps.
2. Run the Postman collection against the deployed base URL.
3. Monitor Render dashboard for deployment status and logs.

## Next Steps

- [Docker Setup](../getting-started/docker-setup)
- [RENDER-API-SETUP.md](../../RENDER-API-SETUP.md)
