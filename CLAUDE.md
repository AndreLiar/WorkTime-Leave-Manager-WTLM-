# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WorkTime Leave Manager (WTLM) is a NestJS REST API for managing employee leave requests. It is a pure backend application with no frontend — PostgreSQL via Prisma, deployed on Render.com via GitHub Actions CI/CD.

## Common Commands

```bash
# Development
npm run start:dev          # Start with hot reload (ts-node)
npm run start:prod         # Start compiled output

# Build & Type Check
npm run build              # Compile TypeScript to dist/
npm run ts                 # Type check only (no emit)

# Linting & Formatting
npm run lint               # ESLint with auto-fix

# Testing
npm test                   # Run all tests
npm run test:unit          # Run unit tests sequentially (--runInBand)
npm run test:watch         # Watch mode
npm run test:cov           # Coverage report (80% threshold)
npm run test:integration   # Postman/Newman integration tests

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Create and apply DB migration
npm run prisma:studio      # Open Prisma GUI dashboard

# Docker
docker compose up -d                    # Start full stack (app + postgres)
docker compose -f docker-compose.dev.yml up -d  # Start postgres only for local dev
```

## Architecture

### Module Structure

```
src/
├── app.module.ts              # Root module, imports all feature modules
├── main.ts                    # Bootstrap, global pipes (ValidationPipe)
├── app-info/                  # GET / — version, environment info
├── modules/
│   ├── health/                # GET /health — uptime and status
│   └── leave-request/         # Core domain — CRUD + approve/reject/statistics
│       ├── *.controller.ts    # Route handlers, DTO validation
│       ├── *.service.ts       # Business logic
│       ├── *.repository.ts    # Prisma queries (repository pattern)
│       └── dto/               # Request/response DTOs with class-validator
├── database/                  # DatabaseModule — PrismaService singleton
├── config/                    # AppConfig — reads env vars
├── common/                    # Shared response interfaces
└── types/                     # Global TypeScript definitions
```

### Data Model

Single Prisma model `LeaveRequest`:
- `employeeId`, `leaveType` (vacation/sick/personal/unpaid), `startDate`, `endDate`, `reason`
- `status`: pending → approved | rejected
- Indexes on `employeeId` and `status`

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| POST | `/leave-requests` | Create request |
| GET | `/leave-requests` | List (optional `?employeeId=`) |
| GET | `/leave-requests/statistics` | Stats (optional `?employeeId=`) |
| GET | `/leave-requests/:id` | Get by ID |
| PATCH | `/leave-requests/:id/approve` | Approve |
| PATCH | `/leave-requests/:id/reject` | Reject |
| DELETE | `/leave-requests/:id` | Delete |

## Testing

Tests live in `test/unit/` (not `src/`). Jest config in `jest.config.js` — pattern matches `**/*.spec.ts`.

Coverage threshold: **80%** on branches, functions, lines, and statements.

Run a single test file:
```bash
npx jest test/unit/modules/leave-request/leave-request.service.spec.ts
```

Integration tests use Newman (Postman CLI) against a running app with a real Postgres instance. See `test/postman/` for the collection.

## CI/CD

**Three CI jobs** (`.github/workflows/ci.yml`):
- `ci-develop` — triggered on PRs to develop: lint, type-check, unit tests, build, npm audit, Gitleaks
- `staging-validation` — triggered on push to staging: full suite + integration tests, CodeQL SAST, Docker build, Trivy scan
- `main-pr-check` — triggered on PRs to main: quick sanity (type-check, build, unit tests)

**CD pipeline** (`.github/workflows/cd.yml`):
- Triggered on push to main; supports manual `rollback` and `list-versions` actions
- Version tags format: `YYYY.MM.DD-<shortsha>`
- Deploys to Render via webhook, polls status, runs smoke tests, auto-rolls back on failure
- Docker images pushed to GHCR

**Release pipeline** (`.github/workflows/release.yml`):
- Triggered on every push to main
- Uses `googleapis/release-please-action@v4` with conventional commits
- Automatically creates/updates a Release PR with:
  - Bumped version in `package.json`
  - Generated `CHANGELOG.md` grouped by commit type
- When the Release PR is merged → publishes a GitHub Release with tag `vX.Y.Z`
- Version bumping rules (semver):
  - `feat:` commit → minor bump (1.0.0 → 1.1.0)
  - `fix:`, `perf:`, `ci:` commit → patch bump (1.0.0 → 1.0.1)
  - `feat!:` or `BREAKING CHANGE:` → major bump (1.0.0 → 2.0.0)
- Config: `release-please-config.json` and `.release-please-manifest.json`

## Commit Message Convention

This project uses **Conventional Commits** — required for auto-release to work correctly:

```
<type>: <short description>

Types:
  feat:     new feature            → minor version bump
  fix:      bug fix                → patch version bump
  perf:     performance improvement → patch version bump
  ci:       CI/CD changes          → patch version bump
  docs:     documentation only     → patch version bump
  refactor: code refactoring       → patch version bump
  test:     test changes           → no release (hidden)
  chore:    maintenance            → no release (hidden)

Breaking change → major version bump:
  feat!: remove endpoint
  or add "BREAKING CHANGE:" in commit body
```

Examples:
```bash
git commit -m "feat: Add pagination to GET /leave-requests"
git commit -m "fix: Fix seed husky not found error"
git commit -m "feat!: Require authentication on all endpoints"
```

## Environment

Required env vars (see `.env.example`):
```
DATABASE_URL="postgresql://wtlm_user:wtlm_password@localhost:5432/wtlm_db"
NODE_ENV="development"
```

## Git Workflow

Branches: `feature/*` → `develop` → `staging` → `main`

Pre-commit hooks (Husky + lint-staged) run ESLint and Prettier on staged files before every commit.
