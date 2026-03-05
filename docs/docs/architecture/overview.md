---
sidebar_position: 1
---

# System Architecture

Detailed technical architecture of the WorkTime Leave Manager application.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │   Web    │  │  Mobile  │  │   API    │            │
│  │  Client  │  │   App    │  │ Consumer │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ HTTP/REST (Port 3000)
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │              NestJS Framework                     │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │         HTTP Module (Express)               │ │ │
│  │  └────────────────┬────────────────────────────┘ │ │
│  │                   │                               │ │
│  │  ┌────────────────▼────────────────────────────┐ │ │
│  │  │           Controllers                       │ │ │
│  │  │  - AppInfoController                        │ │ │
│  │  │  - HealthController                         │ │ │
│  │  │  - LeaveRequestController                   │ │ │
│  │  └────────────────┬────────────────────────────┘ │ │
│  │                   │                               │ │
│  │  ┌────────────────▼────────────────────────────┐ │ │
│  │  │           Services (Business Logic)         │ │ │
│  │  │  - AppInfoService                           │ │ │
│  │  │  - HealthService                            │ │ │
│  │  │  - LeaveRequestService                      │ │ │
│  │  └────────────────┬────────────────────────────┘ │ │
│  │                   │                               │ │
│  │  ┌────────────────▼────────────────────────────┐ │ │
│  │  │         Data Access Layer                   │ │ │
│  │  │         PrismaService (Global)              │ │ │
│  │  └────────────────┬────────────────────────────┘ │ │
│  └───────────────────┼───────────────────────────────┘ │
└────────────────────┼─────────────────────────────────┘
                     │
                     │ Prisma Client
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Data Layer                            │
│  ┌───────────────────────────────────────────────────┐ │
│  │              PostgreSQL 16                        │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │  Tables:                                    │ │ │
│  │  │  - leave_requests                          │ │ │
│  │  │                                             │ │ │
│  │  │  Indexes:                                   │ │ │
│  │  │  - employee_id_idx                         │ │ │
│  │  │  - status_idx                              │ │ │
│  │  └─────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### Module Structure

```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
├── app-info/                  # App info module
│   ├── app-info.module.ts
│   ├── app-info.controller.ts
│   └── app-info.service.ts
├── modules/
│   ├── health/                # Health check module
│   │   ├── health.module.ts
│   │   ├── health.controller.ts
│   │   ├── health.service.ts
│   │   └── interfaces/
│   └── leave-request/         # Leave request module
│       ├── leave-request.module.ts
│       ├── leave-request.controller.ts
│       ├── leave-request.service.ts
│       ├── leave-request.entity.ts
│       ├── leave-request.repository.ts
│       └── dto/
│           ├── create-leave-request.dto.ts
│           └── leave-request-response.dto.ts
├── database/                  # Database module (Global)
│   ├── database.module.ts
│   └── prisma.service.ts
├── config/                    # Configuration
│   └── app.config.ts
├── common/                    # Shared utilities
│   └── interfaces/
└── types/                     # Type definitions
    └── global.d.ts
```

## Design Patterns

### How the Layers Fit Together

- **Controller** – HTTP entry point; consumes incoming DTOs, calls the service, and maps entities into response DTOs before returning JSON.
- **Service** – Business logic and orchestration; validates domain rules (date windows, overlaps, status transitions) and delegates persistence to the repository.
- **Repository** – Prisma-only layer; exposes CRUD helpers (`findById`, `findOverlapping`, `updateStatus`...) and converts records to the `LeaveRequest` entity.
- **Entity** – Domain representation with helper methods like `getDaysRequested`; never leaked to clients directly.
- **DTOs** – Boundary contracts. `CreateLeaveRequestDto` validates inbound payloads; `LeaveRequestResponseDto` shapes outbound payloads.
- **Validation** – Global `ValidationPipe` (configured in `main.ts`) enforces the decorators automatically so controllers receive typed objects.

### Dependency Injection

NestJS uses dependency injection for loose coupling:

### Repository Pattern

Prisma access is wrapped inside a repository that services depend on:

```typescript
@Injectable()
export class LeaveRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany() {
    return this.prisma.leaveRequest.findMany();
  }
}

@Injectable()
export class LeaveRequestService {
  constructor(private readonly repository: LeaveRequestRepository) {}

  async findAll() {
    return this.repository.findMany();
  }
}
```

### DTO & Validation Pattern

Incoming DTOs describe and validate payloads using `class-validator`, enforced by a global `ValidationPipe`:

```typescript
export class CreateLeaveRequestDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsIn(['vacation', 'sick', 'personal', 'unpaid'])
  leaveType: LeaveType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

// main.ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
```

With this setup controllers receive validated DTO instances and services focus purely on business rules (date windows, overlaps, etc.).

### Response DTO Pattern

Controllers map entities returned by services into response DTOs, ensuring consistent payloads and hiding internal fields:

```typescript
export class LeaveRequestResponseDto {
  static fromEntity(entity: LeaveRequest) {
    return {
      id: entity.id,
      employeeId: entity.employeeId,
      status: entity.status,
      // ...other fields
    };
  }
}

return LeaveRequestResponseDto.fromEntity(request);
```

### Module Pattern

Each feature is encapsulated in a module:

```typescript
@Module({
  controllers: [LeaveRequestController],
  providers: [LeaveRequestService],
})
export class LeaveRequestModule {}
```

## Request Flow

### 1. Incoming Request

```
POST /leave-requests
```

### 2. HTTP Layer (Express)

- Receives HTTP request
- Parses body, headers, query params
- Routes to appropriate controller

### 3. Controller Layer

```typescript
@Controller('leave-requests')
export class LeaveRequestController {
  @Post()
  create(@Body() dto: CreateLeaveRequestDto) {
    return this.service.create(dto);
  }
}
```

**Responsibilities:**
- HTTP request/response handling
- Input validation via DTOs
- Delegate to service layer

### 4. Service Layer

```typescript
@Injectable()
export class LeaveRequestService {
  async create(dto: CreateLeaveRequestDto) {
    // Business logic
    // Validation
    // Data transformation
    return await this.prisma.leaveRequest.create({...});
  }
}
```

**Responsibilities:**
- Business logic
- Data validation
- Orchestration
- Error handling

### 5. Data Access Layer

```typescript
@Injectable()
export class PrismaService extends PrismaClient {}
```

**Responsibilities:**
- Database connections
- Query execution
- Transaction management
- Type-safe data access

### 6. Database Layer

PostgreSQL executes queries and returns results.

### 7. Response Flow

Results flow back through the layers:
1. Database → Prisma Client
2. Prisma → Service
3. Service → Controller
4. Controller → HTTP Response

## Data Flow Diagram

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /leave-requests
       │    { employeeId, leaveType, ... }
       ▼
┌──────────────────────┐
│    Controller        │
│  validate DTO        │
└──────┬───────────────┘
       │
       │ 2. create(dto)
       ▼
┌──────────────────────┐
│     Service          │
│  - Check date range  │
│  - Check overlaps    │
│  - Business logic    │
└──────┬───────────────┘
       │
       │ 3. prisma.leaveRequest.create()
       ▼
┌──────────────────────┐
│  Prisma Service      │
│  - Type checking     │
│  - Query building    │
└──────┬───────────────┘
       │
       │ 4. SQL INSERT
       ▼
┌──────────────────────┐
│   PostgreSQL         │
│  - Validate          │
│  - Insert row        │
│  - Return result     │
└──────┬───────────────┘
       │
       │ 5. Result set
       ▼
    (Flow back through layers)
       │
       ▼
┌──────────────────────┐
│     Client           │
│  201 Created         │
│  { id, status, ... } │
└──────────────────────┘
```

## Error Handling Flow

```
Error occurs
    │
    ▼
Is it a known exception?
    │
    ├─ Yes → Custom Exception Filter
    │           │
    │           ▼
    │       Format error response
    │           │
    │           ▼
    │       Return HTTP error
    │
    └─ No → Global Exception Filter
                │
                ▼
            Log error
                │
                ▼
            Return 500 Internal Server Error
```

## Security Architecture

### Current Implementation

- ✅ Input validation with DTOs
- ✅ Type safety with TypeScript
- ✅ SQL injection prevention (Prisma)
- ✅ CORS configuration
- ✅ Error message sanitization

### Future Enhancements

- 🔄 JWT Authentication
- 🔄 Role-based authorization
- 🔄 Rate limiting
- 🔄 API key management
- 🔄 Request logging
- 🔄 Security headers (Helmet)

## Scalability Considerations

### Horizontal Scaling

```
┌─────────────┐
│   Load      │
│  Balancer   │
└──────┬──────┘
       │
       ├──────────┬──────────┐
       ▼          ▼          ▼
   ┌─────┐    ┌─────┐    ┌─────┐
   │ API │    │ API │    │ API │
   │ #1  │    │ #2  │    │ #3  │
   └──┬──┘    └──┬──┘    └──┬──┘
      └──────────┴──────────┘
                 │
                 ▼
          ┌──────────────┐
          │  PostgreSQL  │
          │  (Primary)   │
          └──────────────┘
```

### Database Scaling

- Read replicas for reporting
- Connection pooling
- Query optimization
- Caching layer (Redis)

## Technology Choices

### Why NestJS?

- ✅ Modular architecture
- ✅ Dependency injection
- ✅ TypeScript native
- ✅ Extensive ecosystem
- ✅ Good documentation

### Why Prisma?

- ✅ Type-safe queries
- ✅ Auto-generated types
- ✅ Migration management
- ✅ Excellent DX
- ✅ SQL injection prevention

### Why PostgreSQL?

- ✅ ACID compliance
- ✅ JSON support
- ✅ Full-text search
- ✅ Proven reliability
- ✅ Strong community

## Performance Optimization

### Application Level

- Async/await for non-blocking I/O
- Connection pooling
- Query optimization
- Caching strategies

### Database Level

- Indexes on frequently queried fields
- Query execution plans
- Table partitioning (future)
- Materialized views (future)

## Monitoring Points

```
1. Application Metrics
   - Request rate
   - Response time
   - Error rate
   - CPU/Memory usage

2. Database Metrics
   - Query duration
   - Connection pool usage
   - Slow query log
   - Table sizes

3. Business Metrics
   - Leave requests created
   - Approval/rejection rates
   - Average processing time
```

## Next Steps

- [API Reference](../api/endpoints)
- [Database Schema](../database/schema)
