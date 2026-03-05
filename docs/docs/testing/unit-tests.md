---
sidebar_position: 1
---

# Testing Guide

How to run the automated test suites for WorkTime Leave Manager.

## Overview

The project uses **Jest** for unit tests plus a Newman-powered Postman collection for integration checks. Tests run in CI on every pull request, so keeping them green locally avoids surprises.

## Prerequisites

- PostgreSQL running locally (use `docker-compose -f docker-compose.dev.yml up -d`)
- Database migrations applied (`npm run prisma:migrate`)

## Unit Tests

```bash
npm run test:unit
```

Runs all specs in `test/unit/**`. Use watch mode to iterate quickly:

```bash
npm run test:watch
```

## Coverage

```bash
npm run test:cov
```

Generates coverage reports and enforces ≥80% branch coverage, matching the CI requirements.

## Full Test Suite

```bash
npm test
```

Executes the default Jest runner (useful before pushing changes).

## Integration / API Tests

```bash
npm run test:integration
```

This command builds the project, starts the compiled API, and executes the Postman collection found at `test/postman/leave-request-api.postman_collection.json`.

## Troubleshooting

- **Database errors**: Confirm PostgreSQL is running and `.env` matches the Docker compose credentials.
- **Timeouts**: Increase Jest timeout via `--testTimeout` when debugging long-running specs.
- **Stale schema**: Re-run `npm run prisma:generate` and `npm run prisma:migrate` after schema changes.

## Next Steps

- [Quick Start](../getting-started/quick-start)
- [API Reference](../api/endpoints)
