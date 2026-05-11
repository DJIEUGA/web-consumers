# Backend Spec — Collaboration Brief

## 1. Data Model

### `CollaborationBrief` entity

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | UUID PK | No | |
| `collaboration_id` | UUID FK → `collaborations` | No | One brief per collaboration |
| `objectif` | TEXT | No | Free text, project objective |
| `livrables` | TEXT[] (or JSON array) | No | Min 1 item from allowed set |
| `delai` | ENUM | No | See allowed values below |
| `budget` | INTEGER | No | Positive, in FCFA |
| `status` | ENUM | No | `draft` \| `submitted` \| `acknowledged` |
| `submitted_at` | TIMESTAMPTZ | Yes | Set when customer submits |
| `acknowledged_at` | TIMESTAMPTZ | Yes | Set when professional confirms receipt |
| `created_at` | TIMESTAMPTZ | No | |
| `updated_at` | TIMESTAMPTZ | No | |

### `BriefFile` entity

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | UUID PK | No | |
| `brief_id` | UUID FK → `collaboration_briefs` | No | |
| `original_name` | VARCHAR(255) | No | |
| `storage_key` | VARCHAR(512) | No | S3/storage path |
| `mime_type` | VARCHAR(100) | No | |
| `size_bytes` | INTEGER | No | Max 10 485 760 (10 MB) |
| `uploaded_by` | UUID FK → `users` | No | Must be collaboration customer |
| `created_at` | TIMESTAMPTZ | No | |

---

## 2. Enums

```
delai:
  - "moins_1_semaine"
  - "1_2_semaines"
  - "2_4_semaines"
  - "1_2_mois"
  - "plus_2_mois"

livrables (allowed set):
  - "maquette_graphique"
  - "code_source"
  - "documentation"
  - "formation_tutoriel"
  - "fichiers_sources"
  - "revisions_incluses"
  - "support_post_livraison"

brief_status:
  - "draft"        → customer is still editing
  - "submitted"    → customer validated (all 4 required fields complete)
  - "acknowledged" → professional confirmed receipt
```

---

## 3. Endpoints

### `POST /collaborations/:id/brief`

Create or upsert the brief for a collaboration (idempotent — one brief per collaboration).

**Auth:** Customer of the collaboration only.

**Request body:**
```json
{
  "objectif": "string",
  "livrables": ["code_source", "documentation"],
  "delai": "2_4_semaines",
  "budget": 200000
}
```

**Validation:**
- `collaboration.status` must be in `"brief"` phase
- Caller must be `collaboration.customer_id`
- `objectif`: required, non-empty, max 2000 chars
- `livrables`: required, non-empty array, each value from allowed enum set
- `delai`: required, must be valid enum value
- `budget`: required, positive integer, max 999 999 999

**Response `201`:**
```json
{
  "id": "uuid",
  "collaboration_id": "uuid",
  "objectif": "...",
  "livrables": ["code_source", "documentation"],
  "delai": "2_4_semaines",
  "budget": 200000,
  "status": "draft",
  "progress": 100,
  "files": []
}
```

---

### `PATCH /collaborations/:id/brief`

Partial update of the brief (while in `draft` status).

**Auth:** Customer only.

**Business rule:** Brief must not be in `submitted` or `acknowledged` status.

**Request body:** Any subset of the 4 required fields.

**Response `200`:** Same shape as POST, with updated `progress` field (0–100 computed server-side).

---

### `POST /collaborations/:id/brief/submit`

Customer finalizes and submits the brief.

**Auth:** Customer only.

**Business rules:**
- All 4 required fields must be present and valid (`progress === 100`)
- Sets `status → "submitted"`, records `submitted_at`
- Triggers notification to the professional (email + in-app)
- Moves collaboration phase forward if applicable

**Response `200`:**
```json
{
  "status": "submitted",
  "submitted_at": "2026-05-08T10:00:00Z"
}
```

---

### `POST /collaborations/:id/brief/acknowledge`

Professional confirms receipt of the brief.

**Auth:** Professional of the collaboration only.

**Business rules:**
- Brief must be in `submitted` status
- Sets `status → "acknowledged"`, records `acknowledged_at`
- Triggers notification to the customer
- Unlocks next collaboration stage (contract phase)

**Response `200`:**
```json
{
  "status": "acknowledged",
  "acknowledged_at": "2026-05-08T10:05:00Z"
}
```

---

### `GET /collaborations/:id/brief`

Fetch the brief and its attached files.

**Auth:** Customer or Professional of the collaboration.

**Response `200`:**
```json
{
  "id": "uuid",
  "objectif": "...",
  "livrables": ["code_source", "documentation"],
  "delai": "2_4_semaines",
  "budget": 200000,
  "status": "submitted",
  "progress": 100,
  "submitted_at": "2026-05-08T10:00:00Z",
  "acknowledged_at": null,
  "files": [
    {
      "id": "uuid",
      "original_name": "design-ref.pdf",
      "mime_type": "application/pdf",
      "size_bytes": 204800,
      "url": "https://cdn.example.com/..."
    }
  ]
}
```

---

### `POST /collaborations/:id/brief/files`

Upload one or more files attached to the brief.

**Auth:** Customer only.

**Request:** `multipart/form-data`, field name `files`.

**Validation:**
- Brief must be in `draft` status
- Each file: max 10 MB (10 485 760 bytes)
- Allowed MIME types: `application/pdf`, `image/*`, `application/msword`, `application/vnd.openxmlformats-officedocument.*`
- Max 10 files per brief

**Response `201`:**
```json
{
  "uploaded": [
    {
      "id": "uuid",
      "original_name": "spec.pdf",
      "size_bytes": 102400,
      "url": "https://cdn.example.com/..."
    }
  ]
}
```

---

### `DELETE /collaborations/:id/brief/files/:fileId`

Remove an uploaded file.

**Auth:** Customer only.

**Business rule:** Brief must be in `draft` status.

**Response `204`:** No content.

---

## 4. Progress Computation (server-side)

Progress is calculated server-side and always returned in brief responses.

```
progress = 0
if objectif is not empty         → +25
if livrables has ≥ 1 item        → +25
if delai is set (non-null)       → +25
if budget > 0                    → +25
return progress  // 0 | 25 | 50 | 75 | 100
```

The brief can only be submitted when `progress === 100`.

---

## 5. Permissions Summary

| Action | Customer | Professional |
|---|---|---|
| Create / update brief | Yes | No |
| Submit brief | Yes | No |
| Acknowledge receipt | No | Yes |
| Upload files | Yes | No |
| Delete files | Yes | No |
| Read brief | Yes | Yes |

---

## 6. Events & Notifications

| Trigger | Recipient | Message |
|---|---|---|
| Brief submitted | Professional | "New brief ready for review" |
| Brief acknowledged | Customer | "Professional confirmed brief receipt" |
| File uploaded (brief already submitted) | Professional | "New file added to brief" |

---

## 7. Error Responses

| HTTP Status | Code | Scenario |
|---|---|---|
| `400` | `BRIEF_INCOMPLETE` | Submit attempted with `progress < 100` |
| `400` | `BRIEF_ALREADY_SUBMITTED` | PATCH/upload after `submitted` or `acknowledged` |
| `400` | `INVALID_LIVRABLE` | Livrable value not in allowed enum set |
| `400` | `INVALID_DELAI` | Delai value not in allowed enum set |
| `400` | `FILE_TOO_LARGE` | File exceeds 10 MB |
| `400` | `UNSUPPORTED_FILE_TYPE` | MIME type not allowed |
| `403` | `FORBIDDEN` | Action not allowed for caller's role |
| `404` | `BRIEF_NOT_FOUND` | Brief does not exist yet |
| `409` | `BRIEF_NOT_SUBMITTED` | Acknowledge attempted before submission |
