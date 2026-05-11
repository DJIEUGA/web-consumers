# Collaboration Brief API Integration Guide

**Last Updated:** May 11, 2026  
**Version:** 1.0  
**API Base URL:** `/api/v1/collaborations/{collaborationId}/brief`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Response Envelope](#response-envelope)
4. [Brief Lifecycle](#brief-lifecycle)
5. [API Endpoints](#api-endpoints)
6. [Data Transfer Objects (DTOs)](#data-transfer-objects-dtos)
7. [Error Handling](#error-handling)
8. [Integration Workflow](#integration-workflow)
9. [Code Examples](#code-examples)

---

## Overview

The **Collaboration Brief API** enables customers and professionals to collaborate on project briefs during the editable brief workflow. Customers can save draft brief details while the collaboration is in an editable collaboration state, then submit once the collaboration is ready for handoff.

### Key Features

- **Create/Update Brief**: Customers define project details (objective, deliverables, timeline, budget)
- **File Management**: Upload and manage supporting documents (specifications, design files, etc.)
- **Brief Submission**: Customer submits completed brief for professional review
- **Acknowledgment**: Professional acknowledges and accepts the brief, moving collaboration forward
- **Progress Tracking**: Real-time progress indicator shows brief completion status
- **Collaborative Iteration**: Customers can update brief details, professionals can request clarifications

### Editable Collaboration States for Draft Saving

Draft save endpoints (`POST`, `PATCH`, file upload/delete) are accepted when the collaboration is in one of these states:

- `PENDING`
- `REQUEST_INFO`
- `MATCH_CONFIRMED`
- `ACCEPTED`
- `BRIEF`

Final submission remains stricter and still requires the collaboration to be in `BRIEF`.

### Brief Statuses

```
DRAFT
  ↓
SUBMITTED
  ↓
ACKNOWLEDGED (→ CONTRACT phase)
```

---

## Authentication & Authorization

All endpoints require **JWT Bearer Token** in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

### Role-Based Access Control

| Endpoint | Required Role | Description |
|----------|---------------|-------------|
| Create/Update Brief | `CUSTOMER` | Only customers can define brief details |
| Submit Brief | `CUSTOMER` | Only customers can submit brief |
| Acknowledge Brief | `PRO` | Only professionals can acknowledge brief |
| Get Brief | `CUSTOMER` or `PRO` | Both parties can view the brief |
| Upload Files | `CUSTOMER` | Only customers can upload support documents |
| Delete Files | `CUSTOMER` | Only customers can manage files |

---

## Response Envelope

All API responses follow a **standardized envelope structure**:

```json
{
  "success": true,
  "status": 200,
  "message": "Brief retrieved successfully",
  "data": {
    // Response payload
  },
  "errors": null,
  "timestamp": "2026-05-11T12:30:45.123456"
}
```

### Response Envelope Schema

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Indicates if request succeeded |
| `status` | `integer` | HTTP status code (e.g., 200, 201, 400, 404, 500) |
| `message` | `string` | Human-readable operation result message |
| `data` | `object` | Response payload (null if no data returned) |
| `errors` | `object` | Error details (null if no errors) |
| `timestamp` | `string` | ISO 8601 timestamp of response |

---

## Brief Lifecycle

### Flow Diagram

```
┌─────────────────────────────────────────────────┐
│ BRIEF PHASE WORKFLOW                            │
├─────────────────────────────────────────────────┤
│                                                  │
│ 1. CUSTOMER: Create Draft Brief                │
│    POST /api/v1/collaborations/{id}/brief      │
│    ↓                                             │
│ 2. CUSTOMER: Upload Supporting Files           │
│    POST /api/v1/collaborations/{id}/brief/files│
│    ↓                                             │
│ 3. CUSTOMER: Review & Update Brief (Optional)  │
│    PATCH /api/v1/collaborations/{id}/brief     │
│    ↓                                             │
│ 4. CUSTOMER: Submit Brief                      │
│    POST /api/v1/collaborations/{id}/brief/submit
│    Status: SUBMITTED                            │
│    ↓                                             │
│ 5. PRO: Get & Review Brief                     │
│    GET /api/v1/collaborations/{id}/brief       │
│    ↓                                             │
│ 6. PRO: Acknowledge Brief                      │
│    POST /api/v1/collaborations/{id}/brief/acknowledge
│    Status: ACKNOWLEDGED                        │
│    → Moves collaboration to CONTRACT phase     │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Status Transitions

| Status | Created By | Can Transition To | Meaning |
|--------|-----------|-------------------|---------|
| **DRAFT** | Customer (implicit on create) | SUBMITTED | Brief is being edited, not yet submitted |
| **SUBMITTED** | Customer (via /submit) | ACKNOWLEDGED | Professional can now review and respond |
| **ACKNOWLEDGED** | Professional (via /acknowledge) | — (→ CONTRACT phase) | Professional accepts brief, collaboration advances |

### Progress Calculation

The `progress` field in `CollaborationBriefResponse` indicates brief completion:
- **0-99%**: Incomplete (missing required fields)
- **100%**: Complete (all required fields filled)

Required fields for 100% completion:
- ✓ `objectif` (not blank)
- ✓ `livrables` (at least one selected)
- ✓ `delai` (selected)
- ✓ `budget` (positive value)

---

## API Endpoints

### 1. Create or Update Brief

**Endpoint:** `POST /api/v1/collaborations/{collaborationId}/brief`

**Role:** `CUSTOMER`  
**Status Code:** `201 Created`

Creates a new brief or updates an existing one for the collaboration. Use this endpoint to save draft brief data.

This endpoint is accepted while the collaboration is in an editable brief state: `PENDING`, `REQUEST_INFO`, `MATCH_CONFIRMED`, `ACCEPTED`, or `BRIEF`.

#### Request

```json
{
  "objectif": "Build a responsive e-commerce website with product catalog and checkout",
  "livrables": [
    "CODE_SOURCE",
    "DOCUMENTATION",
    "FORMATION_TUTORIEL"
  ],
  "delai": "_1_2_SEMAINES",
  "budget": 250000
}
```

#### Request DTO: `CollaborationBriefRequest`

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `objectif` | `string` | ✓ | Max 2000 chars, non-blank | Project objective and scope |
| `livrables` | `array[enum]` | ✓ | Min 1 item | Deliverables list (see enum below) |
| `delai` | `enum` | ✓ | Predefined values | Project deadline/timeline |
| `budget` | `integer` | ✓ | 1–999,999,999 | Budget in cents (multiply by 100) |

#### Livrable Enum Values

```
- MAQUETTE_GRAPHIQUE      (Graphic Design/Mockup)
- CODE_SOURCE             (Source Code)
- DOCUMENTATION           (Documentation)
- FORMATION_TUTORIEL      (Training/Tutorial)
- FICHIERS_SOURCES        (Source Files)
- REVISIONS_INCLUSES      (Included Revisions)
- SUPPORT_POST_LIVRAISON  (Post-Delivery Support)
```

#### Delai Enum Values

```
- MOINS_1_SEMAINE    (Less than 1 week)
- _1_2_SEMAINES      (1-2 weeks)
- _2_4_SEMAINES      (2-4 weeks)
- _1_2_MOIS          (1-2 months)
- PLUS_2_MOIS        (More than 2 months)
```

#### Response

```json
{
  "success": true,
  "status": 201,
  "message": "Brief created or updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "collaborationId": "660e8400-e29b-41d4-a716-446655440000",
    "objectif": "Build a responsive e-commerce website with product catalog and checkout",
    "livrables": [
      "CODE_SOURCE",
      "DOCUMENTATION",
      "FORMATION_TUTORIEL"
    ],
    "delai": "_1_2_SEMAINES",
    "budget": 250000,
    "status": "DRAFT",
    "progress": 100,
    "submittedAt": null,
    "acknowledgedAt": null,
    "files": []
  },
  "timestamp": "2026-05-11T14:22:30.123456"
}
```

#### Response DTO: `CollaborationBriefResponse`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `UUID` | Unique brief identifier |
| `collaborationId` | `UUID` | Parent collaboration ID |
| `objectif` | `string` | Project objective |
| `livrables` | `array[enum]` | Selected deliverables |
| `delai` | `enum` | Timeline/deadline |
| `budget` | `integer` | Budget amount |
| `status` | `enum` | Current brief status (DRAFT, SUBMITTED, ACKNOWLEDGED) |
| `progress` | `integer` | Completion percentage (0-100), computed from the required draft fields |
| `submittedAt` | `datetime` | When brief was submitted (null if not submitted) |
| `acknowledgedAt` | `datetime` | When brief was acknowledged (null if not acknowledged) |
| `files` | `array[BriefFileResponse]` | Attached support documents |

---

### 2. Update Brief (Partial)

**Endpoint:** `PATCH /api/v1/collaborations/{collaborationId}/brief`

**Role:** `CUSTOMER`  
**Status Code:** `200 OK`

Partially updates the brief. Any null fields are **not updated** (preserves existing values).

#### Request

```json
{
  "budget": 300000
}
```

Only `budget` is updated; other fields remain unchanged.

#### Response

```json
{
  "success": true,
  "status": 200,
  "message": "Brief updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "collaborationId": "660e8400-e29b-41d4-a716-446655440000",
    "objectif": "Build a responsive e-commerce website...",
    "livrables": ["CODE_SOURCE", "DOCUMENTATION", "FORMATION_TUTORIEL"],
    "delai": "_1_2_SEMAINES",
    "budget": 300000,
    "status": "DRAFT",
    "progress": 100,
    "submittedAt": null,
    "acknowledgedAt": null,
    "files": []
  },
  "timestamp": "2026-05-11T14:25:15.123456"
}
```

---

### 3. Submit Brief

**Endpoint:** `POST /api/v1/collaborations/{collaborationId}/brief/submit`

**Role:** `CUSTOMER`  
**Status Code:** `200 OK`

Submits the brief for professional review. Brief must be **100% complete** (all required fields filled) and the collaboration must be in `BRIEF`.

#### Request

```
(No request body)
```

#### Response

```json
{
  "success": true,
  "status": 200,
  "message": "Brief submitted successfully",
  "data": {
    "status": "SUBMITTED",
    "submittedAt": "2026-05-11T14:30:00.000000"
  },
  "timestamp": "2026-05-11T14:30:00.123456"
}
```

#### Response DTO: `CollaborationBriefSubmitResponse`

| Field | Type | Description |
|-------|------|-------------|
| `status` | `enum` | Brief status after submission (SUBMITTED) |
| `submittedAt` | `datetime` | Submission timestamp |

#### Error Scenarios

| Condition | Status | Error |
|-----------|--------|-------|
| Brief is incomplete (progress < 100) | `400 Bad Request` | "Brief is incomplete and cannot be submitted." |
| Brief already submitted/acknowledged | `400 Bad Request` | "Brief has already been submitted or acknowledged." |
| Collaboration not in BRIEF phase | `403 Forbidden` | "Collaboration is not in the 'BRIEF' phase." |
| Collaboration not found | `404 Not Found` | "Collaboration or brief not found" |

---

### 4. Acknowledge Brief

**Endpoint:** `POST /api/v1/collaborations/{collaborationId}/brief/acknowledge`

**Role:** `PRO`  
**Status Code:** `200 OK`

Professional acknowledges and accepts the submitted brief. This action advances the collaboration to the **CONTRACT phase**.

#### Request

```
(No request body)
```

#### Response

```json
{
  "success": true,
  "status": 200,
  "message": "Brief acknowledged successfully",
  "data": {
    "status": "ACKNOWLEDGED",
    "acknowledgedAt": "2026-05-11T15:00:00.000000"
  },
  "timestamp": "2026-05-11T15:00:00.123456"
}
```

#### Response DTO: `CollaborationBriefAcknowledgeResponse`

| Field | Type | Description |
|-------|------|-------------|
| `status` | `enum` | Brief status after acknowledgment (ACKNOWLEDGED) |
| `acknowledgedAt` | `datetime` | Acknowledgment timestamp |

#### Error Scenarios

| Condition | Status | Error |
|-----------|--------|-------|
| Brief not in SUBMITTED status | `409 Conflict` | "Brief must be in 'submitted' status to be acknowledged." |
| Professional not assigned to collaboration | `403 Forbidden` | "You are not a participant in this collaboration" |

---

### 5. Get Brief

**Endpoint:** `GET /api/v1/collaborations/{collaborationId}/brief`

**Role:** `CUSTOMER` or `PRO`  
**Status Code:** `200 OK`

Retrieves the current brief for a collaboration. Both customer and professional can view.

This endpoint only requires collaboration participation; it does not require the collaboration to be in `BRIEF`.

#### Request

```
(No request body, no query parameters)
```

#### Response

```json
{
  "success": true,
  "status": 200,
  "message": "Brief retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "collaborationId": "660e8400-e29b-41d4-a716-446655440000",
    "objectif": "Build a responsive e-commerce website with product catalog and checkout",
    "livrables": [
      "CODE_SOURCE",
      "DOCUMENTATION",
      "FORMATION_TUTORIEL"
    ],
    "delai": "_1_2_SEMAINES",
    "budget": 250000,
    "status": "SUBMITTED",
    "progress": 100,
    "submittedAt": "2026-05-11T14:30:00.000000",
    "acknowledgedAt": null,
    "files": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "originalName": "project-requirements.pdf",
        "mimeType": "application/pdf",
        "sizeBytes": 245632,
        "url": "https://jobty.online/uploads/briefs/660e8400-e29b-41d4-a716-446655440000/project-requirements.pdf"
      }
    ]
  },
  "timestamp": "2026-05-11T15:05:20.123456"
}
```

#### Error Scenarios

| Condition | Status | Error |
|-----------|--------|-------|
| Brief not found | `404 Not Found` | "Brief not found" |
| User not participant | `403 Forbidden` | "You are not a participant in this collaboration" |

---

### 6. Upload Brief Files

**Endpoint:** `POST /api/v1/collaborations/{collaborationId}/brief/files`

**Role:** `CUSTOMER`  
**Status Code:** `201 Created`  
**Content-Type:** `multipart/form-data`

Uploads supporting documents (specifications, designs, etc.) to attach to the brief.

This endpoint follows the same editable brief-state rule as draft save.

#### Request

```
multipart/form-data:
  files: [file1.pdf, file2.docx, file3.jpg]
```

#### Request Parameters

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `files` | `array[file]` | ✓ | Min 1 file |
| | | | Max 10 MB per file |
| | | | Supported types: `application/pdf`, `image/jpeg`, `image/png`, `image/gif`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `application/vnd.openxmlformats-officedocument.presentationml.presentation` |

#### Response

```json
{
  "success": true,
  "status": 201,
  "message": "Brief files uploaded successfully",
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "originalName": "project-requirements.pdf",
      "mimeType": "application/pdf",
      "sizeBytes": 245632,
      "url": "https://jobty.online/uploads/briefs/660e8400-e29b-41d4-a716-446655440000/project-requirements.pdf"
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "originalName": "design-mockup.jpg",
      "mimeType": "image/jpeg",
      "sizeBytes": 512000,
      "url": "https://jobty.online/uploads/briefs/660e8400-e29b-41d4-a716-446655440000/design-mockup.jpg"
    }
  ],
  "timestamp": "2026-05-11T14:35:00.123456"
}
```

#### Response DTO: `BriefFileResponse`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `UUID` | Unique file identifier |
| `originalName` | `string` | File name as uploaded |
| `mimeType` | `string` | MIME type (e.g., application/pdf, image/jpeg) |
| `sizeBytes` | `integer` | File size in bytes |
| `url` | `string` | CDN URL to download file (public, no auth required) |

#### Error Scenarios

| Condition | Status | Error |
|-----------|--------|-------|
| File too large (>10 MB) | `400 Bad Request` | "File exceeds maximum allowed size of 10 MB." |
| Unsupported file type | `400 Bad Request` | "File type 'application/exe' is not supported." |
| Brief not in editable phase | `403 Forbidden` | "Collaboration is not in a brief-editable phase." |

---

### 7. Delete Brief File

**Endpoint:** `DELETE /api/v1/collaborations/{collaborationId}/brief/files/{fileId}`

**Role:** `CUSTOMER`  
**Status Code:** `204 No Content`

Deletes an attached file from the brief.

This endpoint is also restricted to editable brief states.

#### Request

```
(No request body, no query parameters)
```

#### Response

```json
{
  "success": true,
  "status": 204,
  "message": "Brief file deleted successfully",
  "data": null,
  "timestamp": "2026-05-11T14:40:00.123456"
}
```

#### Error Scenarios

| Condition | Status | Error |
|-----------|--------|-------|
| File not found | `404 Not Found` | "File not found" |
| Unauthorized (not brief owner) | `403 Forbidden` | "You cannot delete this file" |

---

## Data Transfer Objects (DTOs)

### CollaborationBriefRequest

**Used in:** `POST`, `PATCH` endpoints

```json
{
  "objectif": "string (required, 1-2000 chars)",
  "livrables": "array[enum] (required, 1+ items)",
  "delai": "enum (required)",
  "budget": "integer (required, 1-999999999)"
}
```

**Validation Rules:**
- `objectif`: Non-blank, max 2000 characters
- `livrables`: At least one selected
- `delai`: Must be one of the predefined enum values
- `budget`: Positive integer, max 999,999,999

### CollaborationBriefResponse

**Used in:** `POST`, `PATCH`, `GET` endpoints

```json
{
  "id": "UUID",
  "collaborationId": "UUID",
  "objectif": "string",
  "livrables": "array[enum]",
  "delai": "enum",
  "budget": "integer",
  "status": "enum (DRAFT | SUBMITTED | ACKNOWLEDGED)",
  "progress": "integer (0-100); each required field contributes 25%",
  "submittedAt": "ISO-8601 datetime or null",
  "acknowledgedAt": "ISO-8601 datetime or null",
  "files": "array[BriefFileResponse]"
}
```

### CollaborationBriefSubmitResponse

**Used in:** `POST /submit` endpoint

```json
{
  "status": "enum (SUBMITTED)",
  "submittedAt": "ISO-8601 datetime"
}
```

### CollaborationBriefAcknowledgeResponse

**Used in:** `POST /acknowledge` endpoint

```json
{
  "status": "enum (ACKNOWLEDGED)",
  "acknowledgedAt": "ISO-8601 datetime"
}
```

### BriefFileResponse

**Used in:** `POST /files`, `GET` endpoints

```json
{
  "id": "UUID",
  "originalName": "string",
  "mimeType": "string",
  "sizeBytes": "integer",
  "url": "string (HTTPS URL)"
}
```

#### `BriefFileResponse` Field Mapping

| Field | Type | Description |
|-------|------|-------------|
| `id` | `UUID` | Uploaded file identifier |
| `originalName` | `string` | Original uploaded file name |
| `mimeType` | `string` | MIME type of the uploaded file |
| `sizeBytes` | `integer` | File size in bytes |
| `url` | `string` | Download URL generated by the backend |

---

## Error Handling

### Error Response Format

All errors follow the standardized response envelope:

```json
{
  "success": false,
  "status": 400,
  "message": "Brief is incomplete and cannot be submitted.",
  "errors": {
    "reason": "BRIEF_INCOMPLETE",
    "details": "Missing required fields: budget"
  },
  "timestamp": "2026-05-11T14:45:00.123456"
}
```

### Common HTTP Status Codes

| Status | Scenario | Example |
|--------|----------|---------|
| **400** | Validation error, business rule violation | Incomplete brief, invalid file type |
| **401** | Missing/invalid JWT token | No Authorization header |
| **403** | Insufficient role, collaboration phase, or ownership | PRO trying to update brief; customer saving draft outside editable phase |
| **404** | Resource not found | Brief or collaboration doesn't exist |
| **409** | State conflict | Trying to acknowledge non-submitted brief |
| **422** | Unprocessable request | Invalid enum value |
| **500** | Server error | Unexpected exception |

### Frontend Error Handling Checklist

- [ ] Check `success` field first
- [ ] If `success: false`, display `message` to user
- [ ] Log `errors` object for debugging
- [ ] Handle 401 → redirect to login
- [ ] Handle 403 → show "Permission denied" or "Brief cannot be edited in the current collaboration phase"
- [ ] Handle 404 → show "Resource not found"
- [ ] Handle 5xx → show "Server error, please retry"

---

## Integration Workflow

### Step-by-Step Customer Integration

#### 1. **Create Brief (Initial)**
```
POST /api/v1/collaborations/{collaborationId}/brief
Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json

Body:
{
  "objectif": "...",
  "livrables": [...],
  "delai": "...",
  "budget": ...
}

→ 201 Created, status: DRAFT

This same endpoint is also used later to save draft changes while the collaboration remains in an editable brief state.
```

#### 2. **Upload Files (Optional)**
```
POST /api/v1/collaborations/{collaborationId}/brief/files
Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: multipart/form-data

Body:
  files: [file1.pdf, file2.jpg]

→ 201 Created, array of BriefFileResponse

Only call this when the collaboration is still editable for brief changes.
```

#### 3. **Review & Update (Optional)**
```
PATCH /api/v1/collaborations/{collaborationId}/brief
Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json

Body:
{
  "budget": 300000
}

→ 200 OK, updated brief

PATCH preserves existing values for any omitted fields.
```

#### 4. **Get Current Brief**
```
GET /api/v1/collaborations/{collaborationId}/brief
Headers:
  Authorization: Bearer {jwt_token}

→ 200 OK, full brief with files
```

#### 5. **Submit Brief**
```
POST /api/v1/collaborations/{collaborationId}/brief/submit
Headers:
  Authorization: Bearer {jwt_token}

→ 200 OK, status: SUBMITTED
```

### Step-by-Step Professional Integration

#### 1. **Get Brief**
```
GET /api/v1/collaborations/{collaborationId}/brief
Headers:
  Authorization: Bearer {jwt_token}

→ 200 OK, full brief with files
```

#### 2. **Review Brief Details**
- Examine `objectif`, `livrables`, `delai`, `budget`
- Download attached files via `url` in `files` array
- Check `status`: should be `SUBMITTED`

#### 3. **Acknowledge Brief**
```
POST /api/v1/collaborations/{collaborationId}/brief/acknowledge
Headers:
  Authorization: Bearer {jwt_token}

→ 200 OK, status: ACKNOWLEDGED
→ Collaboration advances to CONTRACT phase
```

---

## Code Examples

### JavaScript / TypeScript (Fetch API)

#### Create Brief
```javascript
const collaborationId = "660e8400-e29b-41d4-a716-446655440000";
const token = localStorage.getItem("authToken");

const response = await fetch(
  `/api/v1/collaborations/${collaborationId}/brief`,
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      objectif: "Build responsive website",
      livrables: ["CODE_SOURCE", "DOCUMENTATION"],
      delai: "_1_2_SEMAINES",
      budget: 250000
    })
  }
);

const data = await response.json();
if (data.success) {
  console.log("Brief created:", data.data);
  // Display brief details to user
} else {
  console.error("Error:", data.message);
  // Show error message
}
```

#### Upload Files
```javascript
const formData = new FormData();
formData.append("files", fileInput1.files[0]);
formData.append("files", fileInput2.files[0]);

const response = await fetch(
  `/api/v1/collaborations/${collaborationId}/brief/files`,
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  }
);

const data = await response.json();
if (data.success) {
  console.log("Files uploaded:", data.data);
  // Update file list in UI
} else {
  console.error("Upload error:", data.message);
}
```

#### Submit Brief
```javascript
const response = await fetch(
  `/api/v1/collaborations/${collaborationId}/brief/submit`,
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  }
);

const data = await response.json();
if (data.success) {
  console.log("Brief submitted at:", data.data.submittedAt);
  // Move to "waiting for professional" UI state
} else {
  console.error("Submit error:", data.message);
}
```

#### Get Brief
```javascript
const response = await fetch(
  `/api/v1/collaborations/${collaborationId}/brief`,
  {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  }
);

const data = await response.json();
if (data.success) {
  const brief = data.data;
  console.log("Progress:", brief.progress + "%");
  console.log("Status:", brief.status);
  // Render brief details
} else {
  console.error("Error:", data.message);
}
```

### React Hook Example

```typescript
import { useState, useEffect } from "react";

interface BriefData {
  id: string;
  objectif: string;
  livrables: string[];
  delai: string;
  budget: number;
  status: "DRAFT" | "SUBMITTED" | "ACKNOWLEDGED";
  progress: number;
  files: BriefFile[];
}

interface BriefFile {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
}

export function BriefForm({ collaborationId }: { collaborationId: string }) {
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBrief();
  }, [collaborationId]);

  const fetchBrief = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/v1/collaborations/${collaborationId}/brief`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setBrief(data.data);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch brief");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Partial<BriefData>) => {
    try {
      const response = await fetch(
        `/api/v1/collaborations/${collaborationId}/brief`,
        {
          method: brief?.id ? "PATCH" : "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );
      const data = await response.json();
      if (data.success) {
        setBrief(data.data);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to save brief");
    }
  };

  if (loading) return <div>Loading brief...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="brief-form">
      {brief && (
        <>
          <h2>Project Brief - {brief.progress}% Complete</h2>
          <p>Status: {brief.status}</p>
          {/* Form fields */}
          <button onClick={() => handleSubmit(brief)}>Save Brief</button>
          {brief.progress === 100 && brief.status === "DRAFT" && (
            <button onClick={submitBrief}>Submit for Review</button>
          )}
        </>
      )}
    </div>
  );
}
```

---

## UI/UX Recommendations

### Customer Brief Form

- **Progress Indicator:** Show real-time progress (0-100%)
- **Required Field Markers:** Clearly mark required fields
- **Budget Input:** Use number input with currency formatting
- **Deliverables Checklist:** Multi-select checkbox list
- **Timeline Dropdown:** Pre-populated with delai options
- **File Uploader:** Drag-and-drop with progress bar
- **Submit Button:** Disabled until progress = 100%

### Professional Brief Review

- **Read-Only Display:** Show brief as read-only (no edits)
- **File Viewer:** Direct download links for all files
- **Status Badge:** Display current status prominently
- **Timeline Info:** Show submission and acknowledgment timestamps
- **Acknowledge Button:** Large, prominent action button
- **Timestamps:** Show when brief was submitted

---

## Testing Checklist

### API Contract Testing

- [ ] **Create Brief:** Verify all fields returned in response
- [ ] **Progress Calculation:** 0% when incomplete, 100% when complete
- [ ] **Submit Brief:** Fails if progress < 100%
- [ ] **Acknowledge Brief:** Only works when status = SUBMITTED
- [ ] **File Upload:** Returns correct file metadata (id, url, size)
- [ ] **File Delete:** Removes file and updates brief response

### Role-Based Access Control

- [ ] **CUSTOMER:** Can create, update, submit, view, upload/delete files
- [ ] **PRO:** Can only view brief and acknowledge
- [ ] **Other roles:** 403 Forbidden on all endpoints

### Error Scenarios

- [ ] **Incomplete Brief:** Submit returns 400 with error message
- [ ] **Already Submitted:** Can't submit twice (returns 400)
- [ ] **Non-SUBMITTED Brief:** Acknowledge returns 409
- [ ] **Unsupported File Type:** Upload returns 400
- [ ] **File Too Large:** Upload returns 400
- [ ] **Not Authenticated:** Returns 401
- [ ] **Not Authorized:** Returns 403

### Integration Flow

- [ ] Create → Upload → Update → Submit → Acknowledge (full flow)
- [ ] Get brief at each step returns correct status
- [ ] Timestamps are accurate and in ISO 8601 format
- [ ] File URLs are valid and accessible

---

## Support & Troubleshooting

### Common Issues

**Q: Getting 401 Unauthorized**  
A: Ensure JWT token is included in `Authorization: Bearer <token>` header and is not expired.

**Q: Getting 403 Forbidden**  
A: Check the user role, collaboration ownership, and whether the collaboration is in an editable brief state (`PENDING`, `REQUEST_INFO`, `MATCH_CONFIRMED`, `ACCEPTED`, or `BRIEF`).

**Q: Progress shows 0% even with all fields filled**  
A: Ensure `budget` > 0, `livrables` is not empty array, and `objectif` is not blank.

**Q: File upload fails**  
A: Check file size (<10 MB) and type. Supported MIME types are `application/pdf`, `image/jpeg`, `image/png`, `image/gif`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, and `application/vnd.openxmlformats-officedocument.presentationml.presentation`.

**Q: Can't acknowledge brief**  
A: Brief must be in `SUBMITTED` status. Verify with GET endpoint first.

---

## Related Documentation

- **Collaboration API Specification:** See main collaboration module docs
- **Authentication Guide:** JWT token generation and refresh
- **File Storage:** CDN URLs and access policies

---

**Last Updated:** May 11, 2026  
**API Version:** 1.0  
**Maintained By:** Jobty Backend Team

