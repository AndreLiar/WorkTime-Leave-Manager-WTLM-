---
sidebar_position: 1
---

# API Endpoints

Complete reference for all REST API endpoints.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

Currently, the API does not require authentication. This will be added in future versions.

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |
| POST | `/leave-requests` | Create leave request |
| GET | `/leave-requests` | List all leave requests |
| GET | `/leave-requests/:id` | Get specific leave request |
| GET | `/leave-requests/statistics` | Get statistics |
| PATCH | `/leave-requests/:id/approve` | Approve request |
| PATCH | `/leave-requests/:id/reject` | Reject request |
| DELETE | `/leave-requests/:id` | Delete request |

---

## General Endpoints

### Get API Information

```http
GET /
```

**Response:**

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

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-03-05T10:00:00.000Z",
  "uptime": 123.456
}
```

---

## Leave Request Endpoints

### Create Leave Request

```http
POST /leave-requests
Content-Type: application/json
```

**Request Body:**

```json
{
  "employeeId": "EMP001",
  "leaveType": "vacation",
  "startDate": "2026-03-15",
  "endDate": "2026-03-20",
  "reason": "Family vacation"
}
```

**Field Validation:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| employeeId | string | Yes | Non-empty string |
| leaveType | enum | Yes | `vacation`, `sick`, `personal`, `unpaid` |
| startDate | string | Yes | ISO 8601 date, not in past |
| endDate | string | Yes | ISO 8601 date, >= startDate |
| reason | string | Yes | Non-empty string |

**Response (201 Created):**

```json
{
  "id": "clx1a2b3c4d5e6f7g8h9",
  "employeeId": "EMP001",
  "leaveType": "vacation",
  "startDate": "2026-03-15T00:00:00.000Z",
  "endDate": "2026-03-20T00:00:00.000Z",
  "reason": "Family vacation",
  "status": "pending",
  "createdAt": "2026-03-05T10:00:00.000Z",
  "updatedAt": "2026-03-05T10:00:00.000Z"
}
```

**Error Responses:**

```json
// 400 Bad Request - Validation error
{
  "statusCode": 400,
  "message": "Start date must be before end date",
  "error": "Bad Request"
}

// 400 Bad Request - Overlapping request
{
  "statusCode": 400,
  "message": "Leave request overlaps with existing request",
  "error": "Bad Request"
}
```

### List Leave Requests

```http
GET /leave-requests
GET /leave-requests?employeeId=EMP001
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| employeeId | string | Filter by employee ID (optional) |

**Response (200 OK):**

```json
[
  {
    "id": "clx1a2b3c4d5e6f7g8h9",
    "employeeId": "EMP001",
    "leaveType": "vacation",
    "startDate": "2026-03-15T00:00:00.000Z",
    "endDate": "2026-03-20T00:00:00.000Z",
    "reason": "Family vacation",
    "status": "pending",
    "createdAt": "2026-03-05T10:00:00.000Z",
    "updatedAt": "2026-03-05T10:00:00.000Z"
  }
]
```

### Get Leave Request by ID

```http
GET /leave-requests/:id
```

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Leave request ID |

**Response (200 OK):**

```json
{
  "id": "clx1a2b3c4d5e6f7g8h9",
  "employeeId": "EMP001",
  "leaveType": "vacation",
  "startDate": "2026-03-15T00:00:00.000Z",
  "endDate": "2026-03-20T00:00:00.000Z",
  "reason": "Family vacation",
  "status": "pending",
  "createdAt": "2026-03-05T10:00:00.000Z",
  "updatedAt": "2026-03-05T10:00:00.000Z"
}
```

**Error Response (404 Not Found):**

```json
{
  "statusCode": 404,
  "message": "Leave request with ID clx1a2b3c4d5e6f7g8h9 not found",
  "error": "Not Found"
}
```

### Get Statistics

```http
GET /leave-requests/statistics
GET /leave-requests/statistics?employeeId=EMP001
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| employeeId | string | Filter by employee ID (optional) |

**Response (200 OK):**

```json
{
  "total": 10,
  "pending": 3,
  "approved": 5,
  "rejected": 2,
  "totalDaysRequested": 45
}
```

### Approve Leave Request

```http
PATCH /leave-requests/:id/approve
```

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Leave request ID |

**Response (200 OK):**

```json
{
  "id": "clx1a2b3c4d5e6f7g8h9",
  "employeeId": "EMP001",
  "leaveType": "vacation",
  "startDate": "2026-03-15T00:00:00.000Z",
  "endDate": "2026-03-20T00:00:00.000Z",
  "reason": "Family vacation",
  "status": "approved",
  "createdAt": "2026-03-05T10:00:00.000Z",
  "updatedAt": "2026-03-05T10:30:00.000Z"
}
```

**Error Response (400 Bad Request):**

```json
{
  "statusCode": 400,
  "message": "Cannot approve leave request with status: approved",
  "error": "Bad Request"
}
```

### Reject Leave Request

```http
PATCH /leave-requests/:id/reject
```

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Leave request ID |

**Response (200 OK):**

```json
{
  "id": "clx1a2b3c4d5e6f7g8h9",
  "employeeId": "EMP001",
  "leaveType": "vacation",
  "startDate": "2026-03-15T00:00:00.000Z",
  "endDate": "2026-03-20T00:00:00.000Z",
  "reason": "Family vacation",
  "status": "rejected",
  "createdAt": "2026-03-05T10:00:00.000Z",
  "updatedAt": "2026-03-05T10:30:00.000Z"
}
```

### Delete Leave Request

```http
DELETE /leave-requests/:id
```

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Leave request ID |

**Response (200 OK):**

```json
{
  "message": "Leave request deleted successfully"
}
```

**Error Response (400 Bad Request):**

```json
{
  "statusCode": 400,
  "message": "Cannot delete approved leave requests",
  "error": "Bad Request"
}
```

---

## Error Handling

All endpoints return consistent error responses:

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. This will be added in future versions.

## CORS

CORS is enabled for all origins in development. Configure for production in `main.ts`.

## Testing with Postman

Import the Postman collection:

```bash
File: WorkTime-Leave-Manager.postman_collection.json
```

The collection includes all endpoints with example requests.

## Next Steps

- [Database Schema](../database/schema)
- [Development Guide](../development/code-quality)
