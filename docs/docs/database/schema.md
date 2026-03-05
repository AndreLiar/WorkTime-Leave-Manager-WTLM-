---
sidebar_position: 1
---

# Database Schema

Complete database schema documentation using Prisma ORM.

## Overview

The application uses **PostgreSQL 16** as the database with **Prisma 7** as the ORM. All database operations are type-safe and validated at compile time.

## Schema Definition

Location: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model LeaveRequest {
  id         String   @id @default(cuid())
  employeeId String   @map("employee_id")
  leaveType  String   @map("leave_type")
  startDate  DateTime @map("start_date")
  endDate    DateTime @map("end_date")
  reason     String
  status     String   @default("pending")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@index([employeeId])
  @@index([status])
  @@map("leave_requests")
}
```

## Tables

### leave_requests

Primary table storing all leave request information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | TEXT | No | cuid() | Unique identifier (CUID format) |
| employee_id | TEXT | No | - | Employee identifier |
| leave_type | TEXT | No | - | Type of leave |
| start_date | TIMESTAMP | No | - | Leave start date |
| end_date | TIMESTAMP | No | - | Leave end date |
| reason | TEXT | No | - | Reason for leave |
| status | TEXT | No | 'pending' | Request status |
| created_at | TIMESTAMP | No | now() | Creation timestamp |
| updated_at | TIMESTAMP | No | now() | Last update timestamp |

## Indexes

### Performance Indexes

```sql
CREATE INDEX "leave_requests_employee_id_idx" ON "leave_requests"("employee_id");
CREATE INDEX "leave_requests_status_idx" ON "leave_requests"("status");
```

**Purpose:**
- `employee_id` index: Fast filtering by employee
- `status` index: Fast filtering by status

## Enums and Constants

### Leave Types

| Value | Description |
|-------|-------------|
| `vacation` | Paid vacation time |
| `sick` | Sick leave |
| `personal` | Personal leave |
| `unpaid` | Unpaid leave |

### Leave Status

| Value | Description |
|-------|-------------|
| `pending` | Awaiting approval |
| `approved` | Request approved |
| `rejected` | Request rejected |

## Relationships

Currently, the schema has no relationships as employee data is stored externally. Future versions may include:

- `Employee` table with one-to-many relationship
- `ApprovalHistory` table tracking approval workflow
- `Department` table for organizational structure

## Data Types

### CUID (Collision-resistant Unique Identifier)

```
Example: clx1a2b3c4d5e6f7g8h9
```

**Benefits:**
- URL-safe
- Lexicographically sortable
- 25 characters long
- Collision-resistant

### Timestamps

All timestamps are stored in UTC timezone:

```
2026-03-05T10:00:00.000Z
```

## Migrations

### Initial Migration

```sql
-- CreateTable
CREATE TABLE "leave_requests" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "leave_type" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leave_requests_employee_id_idx" ON "leave_requests"("employee_id");

-- CreateIndex
CREATE INDEX "leave_requests_status_idx" ON "leave_requests"("status");
```

Location: `prisma/migrations/20260305_init/migration.sql`

## Prisma Client Usage

### Querying Data

```typescript
// Find all leave requests
const requests = await prisma.leaveRequest.findMany();

// Find by employee
const employeeRequests = await prisma.leaveRequest.findMany({
  where: { employeeId: 'EMP001' }
});

// Find by status
const pending = await prisma.leaveRequest.findMany({
  where: { status: 'pending' }
});

// Find one by ID
const request = await prisma.leaveRequest.findUnique({
  where: { id: 'clx1a2b3c4d5e6f7g8h9' }
});
```

### Creating Data

```typescript
const request = await prisma.leaveRequest.create({
  data: {
    employeeId: 'EMP001',
    leaveType: 'vacation',
    startDate: new Date('2026-03-15'),
    endDate: new Date('2026-03-20'),
    reason: 'Family vacation',
    status: 'pending'
  }
});
```

### Updating Data

```typescript
const updated = await prisma.leaveRequest.update({
  where: { id: 'clx1a2b3c4d5e6f7g8h9' },
  data: { status: 'approved' }
});
```

### Deleting Data

```typescript
await prisma.leaveRequest.delete({
  where: { id: 'clx1a2b3c4d5e6f7g8h9' }
});
```

## Database Constraints

### Business Rules Enforced by Application

1. **No Past Dates**: Start date cannot be in the past
2. **Date Range**: End date must be >= start date
3. **No Overlaps**: Employee cannot have overlapping non-rejected requests
4. **Status Transitions**: Only pending requests can be approved/rejected
5. **Delete Restrictions**: Cannot delete approved requests

### Future Constraints

Planned database-level constraints:

```sql
-- Check constraint for valid leave types
ALTER TABLE leave_requests 
ADD CONSTRAINT check_leave_type 
CHECK (leave_type IN ('vacation', 'sick', 'personal', 'unpaid'));

-- Check constraint for valid status
ALTER TABLE leave_requests 
ADD CONSTRAINT check_status 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Check constraint for date range
ALTER TABLE leave_requests 
ADD CONSTRAINT check_date_range 
CHECK (end_date >= start_date);
```

## Database Configuration

### Connection String Format

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

Example:
```
postgresql://wtlm_user:wtlm_password@localhost:5432/wtlm_db
```

### Connection Pool Settings

```typescript
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Default pool settings:
- Max connections: 10
- Connection timeout: 10s
- Idle timeout: 600s

## Backup and Restore

### Backup Database

```bash
# Using Docker
docker exec wtlm-postgres pg_dump -U wtlm_user wtlm_db > backup.sql

# Using pg_dump
pg_dump postgresql://wtlm_user:wtlm_password@localhost:5432/wtlm_db > backup.sql
```

### Restore Database

```bash
# Using Docker
docker exec -i wtlm-postgres psql -U wtlm_user wtlm_db < backup.sql

# Using psql
psql postgresql://wtlm_user:wtlm_password@localhost:5432/wtlm_db < backup.sql
```

## Performance Considerations

### Query Optimization

1. **Use indexes**: Queries filtering by employeeId or status use indexes
2. **Limit results**: Use pagination for large datasets
3. **Select specific fields**: Use Prisma select to limit returned data
4. **Use transactions**: For multiple related operations

### Example: Efficient Pagination

```typescript
const page = 1;
const pageSize = 20;

const requests = await prisma.leaveRequest.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
});
```

## Database Monitoring

### Prisma Studio

Visual database browser:

```bash
npm run prisma:studio
```

Opens at: http://localhost:5555

### Query Logging

Enable in development:

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});
```

## Next Steps

- [API Reference](../api/endpoints)
- [Architecture Overview](../architecture/overview)
