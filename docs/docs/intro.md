---
sidebar_position: 1
slug: /
---

# WorkTime Leave Manager (WTLM)

## Overview

WorkTime Leave Manager is a modern, production-ready REST API built with **NestJS** and **TypeScript** for managing employee work time and leave requests. The system uses **PostgreSQL** as its database with **Prisma ORM** for type-safe data access.

## Key Features

- 🚀 **RESTful API** - Built with NestJS framework
- 🗄️ **PostgreSQL Database** - Production-ready relational database  
- 🔄 **Prisma ORM** - Type-safe database access with auto-generated types
- 🐳 **Docker Support** - Containerized deployment with Docker Compose
- ✅ **Type Safety** - Full TypeScript implementation
- 🧪 **Testing** - Unit and integration tests with Jest
- 📊 **Code Quality** - ESLint and Prettier for code standards
- 🔄 **CI/CD** - Automated testing and deployment pipelines

## Architecture

```text
┌─────────────────────────────────────────────────┐
│              Client Applications                │
└───────────────────┬─────────────────────────────┘
                    │
                    │ HTTP/REST
                    ▼
┌─────────────────────────────────────────────────┐
│            NestJS API Server                    │
│  ┌─────────────────────────────────────────┐   │
│  │  Controllers (HTTP Layer)               │   │
│  └──────────────┬──────────────────────────┘   │
│                 │                               │
│  ┌──────────────▼──────────────────────────┐   │
│  │  Services (Business Logic)              │   │
│  └──────────────┬──────────────────────────┘   │
│                 │                               │
│  ┌──────────────▼──────────────────────────┐   │
│  │  Prisma Service (Data Access Layer)     │   │
│  └──────────────┬──────────────────────────┘   │
└─────────────────┼───────────────────────────────┘
                  │
                  │ Prisma Client
                  ▼
┌─────────────────────────────────────────────────┐
│         PostgreSQL Database                     │
│  ┌──────────────────────────────────────────┐  │
│  │  leave_requests table                    │  │
│  │  - id, employeeId, leaveType            │  │
│  │  - startDate, endDate, status           │  │
│  │  - reason, createdAt, updatedAt         │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Runtime | Node.js | 20+ |
| Framework | NestJS | 11.x |
| Language | TypeScript | 5.9+ |
| Database | PostgreSQL | 16 |
| ORM | Prisma | 7.x |
| Testing | Jest | 30.x |
| Containerization | Docker | Latest |
| CI/CD | GitHub Actions | - |

## Core Modules

### Health Module
Provides application health checks and monitoring endpoints.

### Leave Request Module
Manages all leave request operations including:
- Creating leave requests
- Approving/rejecting requests
- Viewing request history
- Generating statistics

### App Info Module
Provides API version and general information.

### Database Module
Global module providing Prisma service for database access.

## Next Steps

- [Quick Start Guide](./getting-started/quick-start) - Get running in 5 minutes
- [Docker Setup](./getting-started/docker-setup) - Containerized deployment
- [Architecture Overview](./architecture/overview) - System design

## Project Status

- ✅ Core API implementation complete
- ✅ Database migrations ready
- ✅ Docker Compose configuration
- ✅ CI/CD pipelines configured
- ✅ Unit tests implemented
- ✅ Integration tests ready
- ✅ Production deployment ready

## License

ISC License - See repository for details.
