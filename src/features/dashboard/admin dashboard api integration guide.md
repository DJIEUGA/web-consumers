# admin dashboard api integration guide

Frontend integration reference for the Jobty admin dashboard APIs.

## Scope

This guide covers the admin-facing API contracts exposed by the backend. It focuses on request/response shapes only, so the frontend can map data safely and consistently.

Covered surfaces:
- `AdminAuthController` under `/api/v1/admin/auth/**`
- `AdminUserController` under `/api/v1/admin/users/**`
- `AdminProfileController` under `/api/v1/admin/profiles/**`
- `AdminProjectController` under `/api/v1/admin/**`

## Common rules

### Authentication
- All admin endpoints use Bearer authentication.
- Send the token in the `Authorization` header:

```http
Authorization: Bearer <jwt>
```

### Authorization
- Most admin endpoints require `ROLE_ADMIN`.
- Some review/dispute endpoints also allow `ROLE_MODERATOR`.
- The backend uses role strings such as `ROLE_ADMIN`, `ROLE_MODERATOR`, `ROLE_PRO`, `ROLE_CUSTOMER`, and `ROLE_ENTERPRISE`.

### Shared response envelope
Most admin endpoints return `ApiResponse<T>`.

```json
{
  "success": true,
  "status": 200,
  "message": "...",
  "data": {},
  "errors": null,
  "timestamp": "2026-05-07T10:15:30.123"
}
```

Envelope fields:
- `success`: boolean
- `status`: HTTP status code as number
- `message`: human-readable status text
- `data`: response DTO or collection
- `errors`: present only on error responses
- `timestamp`: server-generated ISO timestamp string

Notes:
- Null fields are omitted by Jackson where applicable.
- `timestamp` is produced by the server; do not generate it client-side.

## Endpoint contract matrix

| Method | Path | Roles | Request body / params | Response |
|---|---|---|---|---|
| `POST` | `/api/v1/admin/auth/moderators` | `ADMIN` | `ModeratorCreateRequest` | `ApiResponse<ModeratorResponse>` |
| `GET` | `/api/v1/admin/auth/moderators` | `ADMIN` | none | `ApiResponse<List<ModeratorResponse>>` |
| `GET` | `/api/v1/admin/auth/moderators/{id}` | `ADMIN` | path `id: UUID` | `ApiResponse<ModeratorResponse>` |
| `PUT` | `/api/v1/admin/auth/moderators/{id}` | `ADMIN` | path `id: UUID`, body `ModeratorUpdateRequest` | `ApiResponse<ModeratorResponse>` |
| `DELETE` | `/api/v1/admin/auth/moderators/{id}` | `ADMIN` | path `id: UUID` | `ApiResponse<Void>` with HTTP `204` |
| `GET` | `/api/v1/admin/users` | `ADMIN` | query `role?`, `verified?`, `search?` | `ApiResponse<List<AdminUserResponse>>` |
| `GET` | `/api/v1/admin/users/{userId}` | `ADMIN` | path `userId: UUID` | `ApiResponse<AdminUserResponse>` |
| `PATCH` | `/api/v1/admin/users/{userId}/role` | `ADMIN` | path `userId: UUID`, body `UpdateUserRoleRequest` | `ApiResponse<AdminUserResponse>` |
| `PATCH` | `/api/v1/admin/users/{userId}/verification` | `ADMIN` | path `userId: UUID`, body `UpdateUserVerificationRequest` | `ApiResponse<AdminUserResponse>` |
| `PATCH` | `/api/v1/admin/profiles/{userId}/kyc` | `ADMIN` or `MODERATOR` | path `userId: UUID`, query `status`, optional `comment` | raw `String` body |
| `GET` | `/api/v1/admin/profiles/kyc-profiles` | `ADMIN` or `MODERATOR` | none | `ApiResponse<List<ProProfileKycResponse>>` |
| `GET` | `/api/v1/admin/profiles/kyc-profiles/{userId}` | `ADMIN` or `MODERATOR` | path `userId: UUID` | `ApiResponse<ProProfileKycResponse>` |
| `GET` | `/api/v1/admin/profiles/kyc-profiles/{userId}/document` | `ADMIN` or `MODERATOR` | path `userId: UUID` | binary file download (`Resource`) |
| `GET` | `/api/v1/admin/projects` | `ADMIN` | query `status?`, `search?` | `ApiResponse<List<CollaborationSpaceResponse>>` |
| `PATCH` | `/api/v1/admin/projects/{projectId}/status` | `ADMIN` | path `projectId: UUID`, body `UpdateProjectStatusRequest` | `ApiResponse<CollaborationSpaceResponse>` |
| `DELETE` | `/api/v1/admin/projects/{projectId}` | `ADMIN` | path `projectId: UUID` | `ApiResponse<Void>` with HTTP `200` |
| `GET` | `/api/v1/admin/disputes` | `ADMIN` or `MODERATOR` | query `status?`, `search?` | `ApiResponse<List<DisputeResponse>>` |
| `GET` | `/api/v1/admin/disputes/{disputeId}` | `ADMIN` or `MODERATOR` | path `disputeId: UUID` | `ApiResponse<DisputeResponse>` |
| `PATCH` | `/api/v1/admin/disputes/{disputeId}/status` | `ADMIN` or `MODERATOR` | path `disputeId: UUID`, query `status` | `ApiResponse<DisputeResponse>` |
| `POST` | `/api/v1/admin/disputes/{disputeId}/resolve` | `ADMIN` or `MODERATOR` | path `disputeId: UUID`, body `DisputeResolutionRequest` | `ApiResponse<DisputeResponse>` |
| `POST` | `/api/v1/admin/disputes/{disputeId}/close` | `ADMIN` or `MODERATOR` | path `disputeId: UUID` | `ApiResponse<DisputeResponse>` |
| `DELETE` | `/api/v1/admin/disputes/{disputeId}` | `ADMIN` | path `disputeId: UUID` | `ApiResponse<Void>` with HTTP `200` |

## DTO mapping reference

### `ModeratorCreateRequest`
Used by `POST /api/v1/admin/auth/moderators`.

```json
{
  "firstName": "Sarah",
  "lastName": "Diaz",
  "email": "sarah.diaz@jobty.com",
  "password": "Secret123!"
}
```

Fields:
- `firstName`: required string
- `lastName`: required string
- `email`: required valid email
- `password`: required string

### `ModeratorUpdateRequest`
Used by `PUT /api/v1/admin/auth/moderators/{id}`.

```json
{
  "firstName": "Sarah",
  "lastName": "Diaz",
  "email": "sarah.diaz@jobty.com",
  "active": true
}
```

Fields:
- `firstName`: required string
- `lastName`: required string
- `email`: required valid email
- `active`: optional boolean

### `ModeratorResponse`
Returned by moderator endpoints.

```json
{
  "id": "9a57a6f3-4a8d-4c04-9d86-d4c7d48c4f87",
  "firstName": "Sarah",
  "lastName": "Diaz",
  "email": "sarah.diaz@jobty.com",
  "createdAt": "2026-05-07T10:15:30.123",
  "active": true
}
```

Fields:
- `id`: moderator UUID
- `firstName`: moderator first name
- `lastName`: moderator last name
- `email`: moderator email
- `createdAt`: creation timestamp
- `active`: boolean flag for account state

### `UpdateUserRoleRequest`
Used by `PATCH /api/v1/admin/users/{userId}/role`.

```json
{
  "role": "ROLE_PRO"
}
```

Fields:
- `role`: required enum value from `Role`

Valid values:
- `ROLE_CUSTOMER`
- `ROLE_PRO`
- `ROLE_ENTERPRISE`
- `ROLE_ADMIN`
- `ROLE_MODERATOR`

### `UpdateUserVerificationRequest`
Used by `PATCH /api/v1/admin/users/{userId}/verification`.

```json
{
  "verified": true
}
```

Fields:
- `verified`: required boolean

### `AdminUserResponse`
Returned by admin user endpoints.

```json
{
  "userId": "c2ed2a5a-7d3d-4d7f-a44a-8cb0d9c3f6a0",
  "firstName": "John",
  "lastName": "Smith",
  "username": "johnsmith",
  "email": "john.smith@example.com",
  "role": "ROLE_PRO",
  "verified": true,
  "createdAt": "2026-05-07T10:15:30.123",
  "permissions": ["PROFILE_READ", "JOB_CREATE"]
}
```

Fields:
- `userId`: user UUID
- `firstName`: first name
- `lastName`: last name
- `username`: public username if present
- `email`: email address
- `role`: enum value from `Role`
- `verified`: boolean verification state
- `createdAt`: account creation timestamp
- `permissions`: list of permission strings derived by the backend

Frontend mapping note:
- Treat `permissions` as display-only metadata unless the backend explicitly documents actions driven by it.
- Do not assume the list is exhaustive across roles.

### `UpdateProjectStatusRequest`
Used by `PATCH /api/v1/admin/projects/{projectId}/status`.

```json
{
  "status": "IN_PROGRESS"
}
```

Fields:
- `status`: required enum value from `CollaborationStatus`

### `CollaborationSpaceResponse`
Returned by collaboration project endpoints.

```json
{
  "id": "63d6e76e-8e4e-4da9-90a2-1ed38f0d2d30",
  "customerDetails": {
    "userId": "8f0f5c5b-1f47-40b9-8f2d-b0f7d9f9b9db",
    "fullName": "Alice Johnson"
  },
  "proDetails": {
    "userId": "5f77c2b4-3d31-43c0-8e28-4c0fbf4a5d11",
    "fullName": "Chris Martin"
  },
  "title": "Kitchen renovation",
  "brief": "Full renovation project",
  "status": "OPEN",
  "createdAt": "2026-05-07T10:15:30.123",
  "updatedAt": "2026-05-07T10:15:30.123"
}
```

Fields:
- `id`: project UUID
- `customerDetails`: nested customer profile summary
- `proDetails`: nested professional profile summary
- `title`: project title
- `brief`: project summary
- `status`: collaboration status enum
- `createdAt`: creation timestamp
- `updatedAt`: last update timestamp

### `DisputeResolutionRequest`
Used by `POST /api/v1/admin/disputes/{disputeId}/resolve`.

```json
{
  "arbitrationDecision": "Refund the customer and close the dispute.",
  "refundAmount": 150.0,
  "paymentAmount": 0.0
}
```

Fields:
- `arbitrationDecision`: required decision text
- `refundAmount`: optional non-negative decimal
- `paymentAmount`: optional non-negative decimal

### `DisputeResponse`
Returned by dispute endpoints.

```json
{
  "id": "1c7a0e57-0d51-4f71-b1f9-91c8af5a2bcb",
  "collaborationSpaceId": "63d6e76e-8e4e-4da9-90a2-1ed38f0d2d30",
  "initiatorId": "8f0f5c5b-1f47-40b9-8f2d-b0f7d9f9b9db",
  "initiatorName": "Alice Johnson",
  "respondentId": "5f77c2b4-3d31-43c0-8e28-4c0fbf4a5d11",
  "respondentName": "Chris Martin",
  "reason": "Work delivered late",
  "status": "IN_INVESTIGATION",
  "arbitrationDecision": null,
  "refundAmount": null,
  "paymentAmount": null,
  "createdAt": "2026-05-07T10:15:30.123",
  "updatedAt": "2026-05-07T10:20:30.123",
  "resolvedAt": null
}
```

Fields:
- `id`: dispute UUID
- `collaborationSpaceId`: related project UUID
- `initiatorId`: user UUID who opened the dispute
- `initiatorName`: initiator display name
- `respondentId`: user UUID of the other party
- `respondentName`: respondent display name
- `reason`: dispute reason
- `status`: dispute status enum
- `arbitrationDecision`: resolution text if resolved
- `refundAmount`: refund amount if applicable
- `paymentAmount`: payment amount if applicable
- `createdAt`: creation timestamp
- `updatedAt`: last update timestamp
- `resolvedAt`: resolution timestamp if resolved

## Frontend integration notes

### 1. Always unwrap `ApiResponse`
The UI should read the actual payload from `response.data.data` when using the standard envelope.

Example:

```ts
const users = response.data.data;
```

### 2. Handle non-standard endpoints separately
Two admin endpoints do not use the normal JSON envelope:
- `GET /api/v1/admin/profiles/{userId}/document` returns a file download
- `PATCH /api/v1/admin/profiles/{userId}/kyc` returns a plain string

### 3. Handle delete responses carefully
Some delete endpoints return `ApiResponse<Void>` with `204` or `200`.
In the UI, treat success as status-based and do not expect a populated `data` field.

### 4. Query filters
`GET /api/v1/admin/users`, `GET /api/v1/admin/projects`, and `GET /api/v1/admin/disputes` all support optional filters.
Omit a filter if the user has not selected one.

### 5. Enum mapping
Render role/status values as labels in the UI, but keep the raw enum string for round-tripping back to the API.

## Minimal example: user list mapping

```ts
type ApiResponse<T> = {
  success: boolean;
  status: number;
  message: string;
  data: T;
  errors?: unknown;
  timestamp: string;
};

type AdminUserResponse = {
  userId: string;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  role: 'ROLE_CUSTOMER' | 'ROLE_PRO' | 'ROLE_ENTERPRISE' | 'ROLE_ADMIN' | 'ROLE_MODERATOR';
  verified: boolean;
  createdAt: string;
  permissions: string[];
};

// use axios instead of fetch
const response = await fetch('/api/v1/admin/users', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const body = (await response.json()) as ApiResponse<AdminUserResponse[]>;
const users = body.data;
```

