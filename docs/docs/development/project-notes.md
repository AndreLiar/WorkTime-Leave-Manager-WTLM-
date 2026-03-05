---
sidebar_position: 2
---

# Project Notes

Operational highlights migrated from the root documentation files.

## Documentation Platform Snapshot

- Docusaurus 3.9.2 with the TypeScript template powers the docs site.
- Docs run at `routeBasePath: '/'`, blog disabled.
- Sidebar groups: Intro, Getting Started (Quick Start, Docker Setup), Architecture, Development, Testing, API Reference, Database, Deployment.
- Development workflow: `cd docs && npm install && npm start`; production build via `npm run build` inside `docs/`.

## Husky + lint-staged Workflow

- Husky installs via the `prepare` script during `npm install` and registers `.husky/pre-commit`.
- Pre-commit hook executes `npx lint-staged`, which runs ESLint and Prettier on staged `.ts` files; failures block the commit.
- Manual quality commands remain available: `npm run lint`, `npm run ts`, `npm test`, `npm run build`.

## Testing & Coverage

- Jest + `ts-jest` power all unit specs (`npm run test:unit`).
- `npm run test:cov` enables coverage reporting with global thresholds (80% branches/functions/lines/statements) as configured in `jest.config.js`.
- Specs live under `test/unit/**`, mirroring modules (controllers, services, repositories, DTOs).
- Integration checks reuse the Newman Postman collection via `npm run test:integration`.

## PostgreSQL + Prisma Migration

- Added `docker-compose.yml` (prod) and `docker-compose.dev.yml` (dev) with health checks and persistent volumes.
- Prisma introduced with schema, migrations (`prisma/migrations/20260305_init`), `PrismaService`, and `DatabaseModule` replacing the old SQLite service.
- `package.json`, Dockerfile, and README updated with Prisma scripts and workflow; `.env.example` created.
- Development flow: `docker-compose -f docker-compose.dev.yml up -d`, `npm run prisma:generate`, `npm run prisma:migrate`, `npm run start:dev`.

## Render Deployment Verification

- Preferred CD verification uses Render's API: store `RENDER_API_KEY`, `RENDER_SERVICE_ID`, and `RENDER_DEPLOY_HOOK` secrets in GitHub; optional `RENDER_APP_URL` for fallback health checks.
- Steps: create API key (`rnd_…`), capture service ID (`srv-…`), add secrets under Repository → Settings → Actions.
- CI polls Render every 15 seconds (up to 20 minutes) and fails on `build_failed`, `update_failed`, or `deactivated`; fallback `/health` checks remain but may report stale deployments.

## TypeScript Build Fix

- Addressed missing Node types by creating `src/types/global.d.ts` and pointing `tsconfig.build.json` `typeRoots` to both `node_modules/@types` and `src/types`.
- Ensures `npm run build` succeeds consistently even if `@types/node` installation is flaky.
