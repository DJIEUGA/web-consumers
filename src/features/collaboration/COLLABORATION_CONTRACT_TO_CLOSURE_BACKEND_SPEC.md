# Collaboration Backend Specification — Contract to Closure

**Phases covered:** CONTRACT (step 4) → PAYMENT (step 5) → EXECUTION (step 6) → DELIVERY (step 7) → RELEASE (step 8) → CLOSURE (step 9)

**Scope:** Backend requirements to satisfy the existing frontend implementation.  
**Auth:** All endpoints require a valid JWT Bearer token. Role enforcement is noted per endpoint.  
**Response envelope:** All responses follow the existing `ApiResponse<T>` wrapper: `{ success: boolean, data: T, message?: string }`.  
**Base path:** `/api/v1`

---

## Table of Contents

1. [Status Model](#1-status-model)
2. [CONTRACT Phase](#2-contract-phase)
3. [PAYMENT Phase](#3-payment-phase)
4. [EXECUTION Phase — Etapes / Milestones](#4-execution-phase--etapes--milestones)
5. [DELIVERY Phase](#5-delivery-phase)
6. [RELEASE Phase](#6-release-phase)
7. [CLOSURE Phase](#7-closure-phase)
8. [Disputes & Mediation](#8-disputes--mediation)
9. [Push Notifications (FCM)](#9-push-notifications-fcm)
10. [Shared Rules & Invariants](#10-shared-rules--invariants)

---

## 1. Status Model

The `CollaborationStatus` enum must include every value below. Values marked **NEW** are additions to what the brief phase already established.

| Status | Step | Who can enter | Notes |
|---|---|---|---|
| `BRIEF` | 3 | system | After brief acknowledged |
| `CONTRACT` | 4 | system | After brief acknowledged |
| `PAYMENT` | 5 | system | After both parties sign contract |
| `ACTIVE` | 6 | system | After payment confirmed |
| `DISPUTED` | — | customer or pro | Freezes current phase; cross-phase |
| `DELIVERABLE` | 7 | system | After pro submits a deliverable |
| `PAYMENT_RELEASED` | 8 | system | After all milestones validated |
| `CLOSED` | 9 | system | After both parties leave a review |
| `COMPLETED` | 9 | alias for `CLOSED` | Accepted for backwards compat |

The `allowedActions` array on `CollaborationSpaceResponse` must be populated based on the viewer's role and current status. The frontend drives all action buttons from this array.

---

## 2. CONTRACT Phase

### Overview

The contract is auto-generated from the brief data. No manual input is needed. Both parties must click "sign" (a simple boolean flag — no e-signature service). When both have signed, the collaboration advances to `PAYMENT`.

### 2.1 Entity — `CollaborationContract`

```
id                 UUID, PK
collaborationId    UUID, FK → collaboration_spaces
objectif           TEXT  — copied from brief.objectif
livrables          JSONB/TEXT[]  — copied from brief.livrables
delai              VARCHAR  — copied from brief.delai
budget             DECIMAL(18,4)
currency           VARCHAR(3)  — default "XAF"
customerSigned     BOOLEAN, default false
proSigned          BOOLEAN, default false
customerSignedAt   TIMESTAMP, nullable
proSignedAt        TIMESTAMP, nullable
generatedAt        TIMESTAMP, default now()
```

### 2.2 Contract Generation

The contract is generated **automatically** when the brief is acknowledged (i.e., when the collaboration transitions to `CONTRACT` status). The backend copies the relevant brief fields into a `CollaborationContract` record. No endpoint is needed to trigger generation — it is a side effect of `POST /collaborations/{id}/brief/acknowledge`.

### 2.3 Endpoints

#### GET `/collaborations/{id}/contract`

Fetch the generated contract for display in the UI.

**Auth:** customer or pro of the collaboration.

**Response `200`:**
```json
{
  "id": "uuid",
  "collaborationId": "uuid",
  "objectif": "string",
  "livrables": ["CODE_SOURCE", "DOCUMENTATION"],
  "delai": "_1_2_SEMAINES",
  "budget": 250000,
  "currency": "XAF",
  "customerSigned": false,
  "proSigned": false,
  "customerSignedAt": null,
  "proSignedAt": null,
  "generatedAt": "ISO-8601"
}
```

**Error cases:**
- `404` — contract not found (collaboration not yet in CONTRACT phase)
- `403` — viewer is not a participant

---

#### POST `/collaborations/spaces/{id}/sign-contract`

The caller signs the contract. The backend resolves the caller's role (customer/pro) from the JWT and sets the corresponding flag.

**Auth:** customer or pro of the collaboration.  
**Body:** none.

**Business rules:**
1. Collaboration must have status `CONTRACT`. Return `409` otherwise.
2. The caller's flag must not already be `true`. Return `409` ("already signed") if it is.
3. Set `customerSigned = true` (or `proSigned = true`) and record the timestamp.
4. If **both** flags are now `true`, transition status → `PAYMENT` and emit a push notification to both parties.

**Response `200`:** Updated `CollaborationSpaceResponse` with the new `status` and `allowedActions`.

---

#### GET `/collaborations/{id}/contract/pdf`

Export the contract as a PDF. The backend renders the contract data into a PDF document server-side (using a library such as iText, Puppeteer, or similar) and returns it as a binary stream.

**Auth:** customer or pro of the collaboration.

**Response `200`:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="contract-{collaborationId}.pdf"
```

**PDF content must include:**
- Platform header (Jobty logo, date)
- Collaboration title and ID
- Customer name and pro name
- Objectif (full text)
- Livrables list (human-readable labels, not enum keys)
- Délai (human-readable label)
- Budget and currency
- Signature lines: name + "Signed on {ISO date}" for each signed party, or "Pending" if unsigned

---

## 3. PAYMENT Phase

### Overview

Payments are **simulated** in this version. The architecture must make it straightforward to wire in a real payment gateway later (Stripe, CinetPay, Wave, etc.) by encapsulating all payment logic behind a `PaymentService` interface.

### Payment Model

- The **full brief budget** is deposited into escrow at the PAYMENT step, **before** milestones are finalized.
- During EXECUTION, milestones are defined and their amounts must sum to the contract budget.
- When a milestone is validated, its amount is automatically released from escrow to the pro.
- Multi-currency is supported: store the currency on each transaction record; display and conversion are handled downstream.

### 3.1 Entity — `EscrowAccount`

```
id                 UUID, PK
collaborationId    UUID, FK, UNIQUE
totalAmount        DECIMAL(18,4)
currency           VARCHAR(3)
lockedAmount       DECIMAL(18,4)  — starts equal to totalAmount
releasedAmount     DECIMAL(18,4)  — starts 0; increments per milestone release
status             ENUM("OPEN", "PARTIALLY_RELEASED", "FULLY_RELEASED", "FROZEN")
createdAt          TIMESTAMP
updatedAt          TIMESTAMP
```

`FROZEN` status is set when a dispute is opened; no releases allowed while frozen.

### 3.2 Entity — `PaymentTransaction`

```
id                 UUID, PK
collaborationId    UUID, FK
escrowAccountId    UUID, FK
type               ENUM("DEPOSIT", "RELEASE", "REFUND", "REVERSAL")
amount             DECIMAL(18,4)
currency           VARCHAR(3)
etapeId            UUID, nullable  — set for RELEASE transactions
status             ENUM("PENDING", "CONFIRMED", "FAILED")
simulatedAt        TIMESTAMP, nullable  — set when simulation completes
createdAt          TIMESTAMP
```

### 3.3 Endpoints

#### POST `/collaborations/spaces/{id}/confirm-payment`

Customer confirms the payment deposit. In simulation mode this immediately marks the deposit as confirmed and transitions to `ACTIVE`.

**Auth:** customer only.

**Body:**
```json
{
  "currency": "XAF"
}
```
`currency` defaults to `"XAF"` if omitted.

**Business rules:**
1. Status must be `PAYMENT`. Return `409` otherwise.
2. Create an `EscrowAccount` with `totalAmount = contract.budget`, `lockedAmount = totalAmount`, `releasedAmount = 0`.
3. Create a `PaymentTransaction` of type `DEPOSIT`, `status = CONFIRMED`, `simulatedAt = now()`.
4. Transition collaboration status → `ACTIVE`.
5. Emit push notifications to both parties.

**Response `200`:** Updated `CollaborationSpaceResponse`.

---

#### GET `/collaborations/{id}/payment/summary`

Return escrow state and transaction history for display in the payment and release steps.

**Auth:** customer or pro.

**Response `200`:**
```json
{
  "escrow": {
    "totalAmount": 250000,
    "currency": "XAF",
    "lockedAmount": 200000,
    "releasedAmount": 50000,
    "status": "PARTIALLY_RELEASED"
  },
  "transactions": [
    {
      "id": "uuid",
      "type": "DEPOSIT",
      "amount": 250000,
      "currency": "XAF",
      "status": "CONFIRMED",
      "etapeId": null,
      "simulatedAt": "ISO-8601"
    },
    {
      "id": "uuid",
      "type": "RELEASE",
      "amount": 50000,
      "currency": "XAF",
      "status": "CONFIRMED",
      "etapeId": "uuid",
      "simulatedAt": "ISO-8601"
    }
  ]
}
```

---

## 4. EXECUTION Phase — Etapes / Milestones

### Overview

After the collaboration enters `ACTIVE` status, both parties negotiate and create milestones. Milestones must be "locked" (agreed by both) before work can begin on them. Milestone amounts must sum to the contract budget.

### 4.1 Entity — `CollaborationEtape`

```
id                 UUID, PK
collaborationId    UUID, FK
titre              VARCHAR(255)
description        TEXT, nullable
montant            DECIMAL(18,4)
currency           VARCHAR(3)
statut             ENUM("a_venir", "en_cours", "livree", "validee", "modification")
ordre              INTEGER  — display order (1-based, user-defined, reorderable)
revisionCount      INTEGER, default 0  — increments per MODIFICATION request
maxRevisions       INTEGER, default 2
lockedAt           TIMESTAMP, nullable  — set when both parties confirm the milestone plan
createdAt          TIMESTAMP
updatedAt          TIMESTAMP
```

### 4.2 Milestone Negotiation & Locking

Milestones are editable (create/update/reorder/delete) **until the collaboration-level milestone plan is locked**. Locking happens when both parties confirm they are satisfied with the milestone plan. A `milestonesPlanLocked` boolean on the `collaboration_spaces` table controls this. Once locked, milestone `titre`, `montant`, `ordre`, and `description` are immutable; only `statut` can change.

### 4.3 Endpoints

#### GET `/collaborations/{id}/etapes`

List all milestones for this collaboration.

**Auth:** customer or pro.

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "titre": "Maquette UI",
    "description": "Livrer les maquettes Figma",
    "montant": 50000,
    "currency": "XAF",
    "statut": "en_cours",
    "ordre": 1,
    "revisionCount": 0,
    "maxRevisions": 2,
    "lockedAt": null
  }
]
```

---

#### POST `/collaborations/{id}/etapes`

Create a new milestone. Only allowed while milestone plan is not locked.

**Auth:** customer or pro.

**Body:**
```json
{
  "titre": "string (required, max 255)",
  "description": "string (optional)",
  "montant": 50000,
  "ordre": 1
}
```

**Business rules:**
1. Status must be `ACTIVE`. Return `409` otherwise.
2. Milestone plan must not be locked. Return `409` ("Milestone plan is locked") if it is.
3. The sum of all milestone amounts (including this one) must not exceed `contract.budget`. Return `422` if exceeded.

**Response `201`:** The created `CollaborationEtape`.

---

#### PATCH `/collaborations/{id}/etapes/{etapeId}`

Update milestone fields. Only allowed while plan is unlocked.

**Auth:** customer or pro.

**Body (all fields optional):**
```json
{
  "titre": "string",
  "description": "string",
  "montant": 75000,
  "ordre": 2
}
```

**Business rules:**
- Plan must not be locked.
- Reordering: when `ordre` changes, the backend must re-sequence all sibling milestones to avoid gaps or collisions (a swap or push strategy).

**Response `200`:** Updated `CollaborationEtape`.

---

#### DELETE `/collaborations/{id}/etapes/{etapeId}`

Delete a milestone. Only allowed while plan is unlocked and milestone `statut` is `a_venir`.

**Auth:** customer or pro.  
**Response `204`:** No content.

---

#### POST `/collaborations/{id}/etapes/confirm-plan`

Both parties must each call this endpoint to confirm the milestone plan. When both have confirmed, the plan locks and work can begin.

**Auth:** customer or pro.

**Business rules:**
1. The sum of all milestone amounts must equal `contract.budget` exactly. Return `422` ("Milestone amounts must equal contract budget") if not.
2. There must be at least one milestone. Return `422` if none.
3. Record which parties have confirmed (two boolean flags on the collaboration or a join table).
4. When both have confirmed, set `milestonesPlanLocked = true`, set `lockedAt` on all milestones.

**Response `200`:**
```json
{
  "planLocked": true,
  "customerConfirmed": true,
  "proConfirmed": true
}
```

---

#### PATCH `/collaborations/{id}/etapes/{etapeId}/status`

Transition a milestone's status. Role enforcement applies.

**Auth:** customer or pro (role-specific rules below).

**Body:**
```json
{
  "statut": "en_cours" | "livree" | "validee" | "modification"
}
```

**Allowed transitions and who can trigger them:**

| From | To | Who | Condition |
|---|---|---|---|
| `a_venir` | `en_cours` | **pro only** | Plan must be locked |
| `en_cours` | `livree` | **pro only** | — |
| `livree` | `validee` | **customer only** | Triggers auto-release (see §6.1) |
| `livree` | `modification` | **customer only** | `revisionCount < maxRevisions` |
| `modification` | `en_cours` | **pro only** | Pro acknowledges revision request |

Any other transition returns `422`. Violations of the role rule return `403`.

**Side effects of `validee`:**
1. Auto-release this milestone's `montant` from escrow (see §6.1).
2. Cancel any pending auto-release reminder jobs for this milestone.
3. If **all** milestones are now `validee`, transition collaboration status → `PAYMENT_RELEASED` and emit notification.

**Side effects of `modification`:**
1. Increment `revisionCount`.
2. If `revisionCount >= maxRevisions` before the increment: return `422` ("Maximum revision limit reached").
3. Emit a push notification to the pro.

---

#### PATCH `/collaborations/{id}/etapes/reorder`

Reorder milestones after the plan is locked. `titre`, `montant` are immutable; only the display `ordre` can change.

**Auth:** customer or pro.

**Body:**
```json
{
  "order": [
    { "id": "uuid-etape-1", "ordre": 1 },
    { "id": "uuid-etape-2", "ordre": 2 },
    { "id": "uuid-etape-3", "ordre": 3 }
  ]
}
```

**Business rules:**
- All milestone IDs in the payload must belong to this collaboration.
- Ordinals must be a complete sequence (no gaps).
- Milestones with status `validee` cannot be reordered.

**Response `200`:** Updated list of `CollaborationEtape`.

---

## 5. DELIVERY Phase

### Overview

When the pro submits a deliverable for a milestone, the milestone transitions to `livree`. Deliverables can be a file (PDF or DOC, max 5 MB) or an external URL, or both.

### 5.1 Entity — `MilestoneDeliverable`

```
id                 UUID, PK
etapeId            UUID, FK → collaboration_etapes
submittedById      UUID  — pro's userId
fileUrl            VARCHAR(2048), nullable  — CDN URL if file uploaded
externalLink       VARCHAR(2048), nullable  — external URL if provided
notes              TEXT, nullable
revisionRound      INTEGER, default 0  — increments per revision cycle
submittedAt        TIMESTAMP
```

### 5.2 Endpoints

#### POST `/collaborations/{id}/etapes/{etapeId}/deliverables`

Submit a deliverable for a milestone. Transitions milestone to `livree`.

**Auth:** pro only.

**Body:** `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| `file` | File | if no `externalLink` | PDF or DOC only; max 5 MB |
| `externalLink` | string | if no `file` | Must be a valid URL |
| `notes` | string | no | Max 1000 chars |

**Business rules:**
1. Milestone must be in `en_cours` or `modification`. Return `409` otherwise.
2. Caller must be the pro of the collaboration.
3. At least one of `file` or `externalLink` must be present. Return `422` if neither.
4. File validation (server-side, regardless of client-side validation):
   - Allowed MIME types: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - Max size: 5 MB (5 242 880 bytes). Return `413` if exceeded.
5. Store the file to CDN/object storage; record the CDN URL in `fileUrl`.
6. Create a `MilestoneDeliverable` record with `revisionRound = etape.revisionCount`.
7. Transition milestone `statut` → `livree`.
8. Start the **auto-release timer** for this milestone (see §6.2).
9. Emit push notification to customer.

**Response `201`:**
```json
{
  "id": "uuid",
  "etapeId": "uuid",
  "fileUrl": "https://cdn.../file.pdf",
  "externalLink": null,
  "notes": "First delivery",
  "revisionRound": 0,
  "submittedAt": "ISO-8601"
}
```

---

#### GET `/collaborations/{id}/etapes/{etapeId}/deliverables`

List all deliverables for a milestone (all revision rounds).

**Auth:** customer or pro.

**Response `200`:** Array of `MilestoneDeliverable`.

---

## 6. RELEASE Phase

### 6.1 Auto-Release on Validation

When a customer sets a milestone to `validee` (via `PATCH /collaborations/{id}/etapes/{etapeId}/status`), the backend must atomically:

1. Debit `montant` from `escrow.lockedAmount`.
2. Credit `montant` to `escrow.releasedAmount`.
3. Create a `PaymentTransaction` of type `RELEASE`, `status = CONFIRMED`, `etapeId = etape.id`, `simulatedAt = now()`.
4. Update `escrow.status` to `PARTIALLY_RELEASED` (or `FULLY_RELEASED` if `releasedAmount = totalAmount`).
5. Cancel any pending auto-release reminder/auto-release scheduler jobs for this milestone.

If the escrow is `FROZEN` (dispute open), step 1–4 are blocked. Return `409` ("Cannot release payment — dispute in progress").

---

### 6.2 Auto-Release Timer

When a deliverable is submitted (`statut → livree`), a background job is scheduled:

**Job 1 — Reminder (T+2 days):**
- If the milestone is still `livree` (customer has not acted), send a push notification to the customer reminding them to validate or request revisions.
- Record `reminderSentAt` on the milestone (add this column to `CollaborationEtape`).

**Job 2 — Auto-release (T+3 days, i.e. T+1 day after reminder):**
- If the milestone is still `livree`, execute the auto-release logic from §6.1 on behalf of the platform.
- Set `statut → validee` with a system actor marker (e.g., `autoValidatedAt` timestamp on the milestone).
- Emit push notifications to both parties confirming the auto-release.

**Cancellation:** Both jobs must be cancelled if the customer acts first (validates or requests revision). Use a job scheduler that supports cancellation by a reference key such as `"auto-release-{etapeId}"`.

**Schema addition to `CollaborationEtape`:**
```
reminderSentAt     TIMESTAMP, nullable
autoValidatedAt    TIMESTAMP, nullable
```

---

#### POST `/collaborations/spaces/{id}/release-payment`

Manual endpoint called when the customer explicitly releases payment for the **current** milestone (as opposed to auto-release). Internally delegates to the same release logic as §6.1.

**Auth:** customer only.

**Body:**
```json
{
  "etapeId": "uuid"
}
```

**Business rules:**
1. Milestone must be `livree`.
2. Escrow must not be `FROZEN`.
3. Execute release logic from §6.1.

**Response `200`:** Updated `CollaborationSpaceResponse`.

---

## 7. CLOSURE Phase

### Overview

After all milestones are validated and all payments released, both parties must each submit a review. Submitting a review is **mandatory** to close the space. The space is archived (readable) — never deleted.

### 7.1 Entity — `CollaborationReview`

```
id                 UUID, PK
collaborationId    UUID, FK
reviewerId         UUID  — author (customer or pro)
reviewerRole       ENUM("customer", "pro")
targetId           UUID  — recipient of the review
rating             SMALLINT, nullable  — 1–5 stars
comment            TEXT, nullable
submittedAt        TIMESTAMP
```

**Constraint:** At least one of `rating` or `comment` must be non-null.

### 7.2 Endpoints

#### POST `/collaborations/spaces/{id}/close`

Submit a review and, if both parties have now reviewed, close the collaboration.

**Auth:** customer or pro.

**Body:**
```json
{
  "rating": 5,
  "comment": "Excellent collaboration."
}
```

**Business rules:**
1. Collaboration status must be `PAYMENT_RELEASED`. Return `409` otherwise.
2. Caller must not have already submitted a review for this collaboration. Return `409` ("Review already submitted") if they have.
3. At least one of `rating` or `comment` must be present. Return `422` if both are absent.
4. `rating`, if present, must be between 1 and 5 inclusive. Return `422` otherwise.
5. Resolve `targetId`: if caller is customer, `targetId = proId`; if caller is pro, `targetId = customerId`.
6. Create a `CollaborationReview` record.
7. Check whether **both** the customer review and the pro review now exist:
   - If both exist: transition status → `CLOSED`, set `archivedAt = now()` on the collaboration, emit push notifications to both parties.
   - If only one exists: return success but do not close yet. The `alreadyReviewed` flag on `CollaborationSpaceResponse` must return `true` for the caller going forward.

**Response `200`:** Updated `CollaborationSpaceResponse` (with `status: "CLOSED"` if fully closed, or `status: "PAYMENT_RELEASED"` if waiting on the other party).

---

#### GET `/collaborations/{id}/reviews`

List all reviews submitted for this collaboration.

**Auth:** customer or pro.

**Response `200`:** Array of `CollaborationReview`.

---

## 8. Disputes & Mediation

### What is already implemented (frontend + admin side)

The frontend and admin panel already model:

- `DisputeStatus`: `OPEN | IN_INVESTIGATION | RESOLVED | CLOSED`
- `DisputeResponse` DTO (see `src/api/adminEndpoints.ts`)
- Admin endpoints: `GET /admin/disputes`, `GET /admin/disputes/{id}`, `PUT /admin/disputes/{id}/status`, `PUT /admin/disputes/{id}/resolve`, `PUT /admin/disputes/{id}/close`
- Dashboard endpoint: `GET /dashboard/disputes`

### What is missing and must be added

#### 8.1 Entity additions — `CollaborationDispute`

The backend dispute entity must align with `DisputeResponse`:

```
id                    UUID, PK
collaborationSpaceId  UUID, FK
initiatorId           UUID  — userId of the party who raised the dispute
initiatorName         VARCHAR
respondentId          UUID  — the other party
respondentName        VARCHAR
reason                TEXT  — required, provided by initiator
status                ENUM("OPEN", "IN_INVESTIGATION", "RESOLVED", "CLOSED")
arbitrationDecision   TEXT, nullable  — admin's resolution note
refundAmount          DECIMAL(18,4), nullable  — amount to refund to customer
paymentAmount         DECIMAL(18,4), nullable  — amount to release to pro
resolvedAt            TIMESTAMP, nullable
createdAt             TIMESTAMP
updatedAt             TIMESTAMP
```

#### 8.2 Missing Collaboration-Side Endpoint

#### POST `/collaborations/spaces/{id}/dispute`

Either party can trigger a dispute. This is the missing link between the collaboration workflow and the admin dispute management system.

**Auth:** customer or pro.

**Body:**
```json
{
  "reason": "The deliverable does not match the agreed specifications."
}
```

**Business rules:**
1. Collaboration status must be `ACTIVE`, `DELIVERABLE`, or `PAYMENT_RELEASED`. Disputes cannot be opened after `CLOSED`. Return `409` for invalid statuses.
2. Only one open dispute is allowed per collaboration at a time. Return `409` ("A dispute is already open for this collaboration") if one exists with status `OPEN` or `IN_INVESTIGATION`.
3. Resolve `initiatorId` and `respondentId` from JWT and collaboration record.
4. Create a `CollaborationDispute` record with `status = OPEN`.
5. Set `escrow.status → FROZEN` — no payment releases allowed while the dispute is open.
6. Set collaboration status → `DISPUTED`.
7. Emit push notifications:
   - To the respondent: "A dispute has been opened on your collaboration."
   - To all platform admins/moderators: "New dispute requires review." (use an admin notification channel or a broadcast to admin FCM topic)

**Response `201`:**
```json
{
  "id": "uuid",
  "collaborationSpaceId": "uuid",
  "initiatorId": "uuid",
  "initiatorName": "string",
  "respondentId": "uuid",
  "respondentName": "string",
  "reason": "string",
  "status": "OPEN",
  "createdAt": "ISO-8601"
}
```

---

#### GET `/collaborations/{id}/dispute`

Fetch the active or most recent dispute for a collaboration.

**Auth:** customer or pro.

**Response `200`:** `DisputeResponse` or `404` if no dispute exists.

---

#### 8.3 Admin Resolution Flow (completing existing endpoints)

The existing admin endpoints must implement the following server-side logic:

**`PUT /admin/disputes/{disputeId}/status`**  
Body: `{ "status": "IN_INVESTIGATION" | "RESOLVED" | "CLOSED" }`  
- Update dispute status.
- Emit push notification to both parties with the new status.

**`PUT /admin/disputes/{disputeId}/resolve`**  
Body: `{ "arbitrationDecision": "string", "refundAmount": number?, "paymentAmount": number? }`  
- Record the decision.
- Execute fund distribution from escrow:
  - If `refundAmount > 0`: create a `PaymentTransaction` of type `REFUND` for the customer.
  - If `paymentAmount > 0`: create a `PaymentTransaction` of type `RELEASE` for the pro.
  - The sum of `refundAmount + paymentAmount` must not exceed `escrow.lockedAmount`. Return `422` if exceeded.
- Set `escrow.status → FULLY_RELEASED` (even if partial — the dispute closes the escrow).
- Set `resolvedAt = now()`.
- Transition dispute status → `RESOLVED`.
- Transition collaboration status → `CLOSED` (dispute resolution is a terminal event).
- Emit push notifications to both parties with the arbitration decision.

**`PUT /admin/disputes/{disputeId}/close`**  
- Mark dispute `status = CLOSED` without financial action (used for invalid or withdrawn disputes).
- Unfreeze escrow: set `escrow.status` back to its previous state.
- Restore collaboration status to the status it held before the dispute was opened (store `preDisputeStatus` on the dispute or on the collaboration).
- Emit push notifications to both parties.

**Schema addition to `CollaborationDispute`:**
```
preDisputeCollaborationStatus  VARCHAR  — snapshot of status before dispute opened
```

---

## 9. Push Notifications (FCM)

All phase transitions must trigger a FCM push notification to the affected parties. The backend implements this via a `NotificationService` that wraps the Firebase Admin SDK.

### 9.1 FCM Device Token Registration

#### POST `/notifications/fcm/register`

Register or update a device's FCM token for the authenticated user.

**Auth:** any authenticated user.

**Body:**
```json
{
  "token": "fcm-device-token-string",
  "platform": "web" | "android" | "ios"
}
```

**Response `200`:** `{ "registered": true }`

Store tokens in a `UserFcmToken` table:
```
id          UUID, PK
userId      UUID, FK
token       VARCHAR(512), UNIQUE
platform    VARCHAR(10)
createdAt   TIMESTAMP
updatedAt   TIMESTAMP
```

A user may have multiple active tokens (multiple devices). On login, the client registers its token. On logout, the client should deregister.

#### DELETE `/notifications/fcm/register/{token}`

Deregister a device token.

**Auth:** owner of the token.  
**Response `204`:** No content.

---

### 9.2 Notification Event Catalogue

The following events must each trigger a FCM notification to the listed recipients.

| Event | Trigger | Recipients | Title | Body |
|---|---|---|---|---|
| `CONTRACT_GENERATED` | Brief acknowledged | both | "Contrat prêt" | "Le contrat de votre collaboration est disponible." |
| `CONTRACT_SIGNED_PARTIAL` | One party signs | the other party | "Signature reçue" | "{name} a signé le contrat. À vous de signer." |
| `CONTRACT_FULLY_SIGNED` | Both sign | both | "Contrat signé" | "Les deux parties ont signé. Procédez au paiement." |
| `PAYMENT_CONFIRMED` | Customer confirms payment | both | "Paiement confirmé" | "Le paiement est en séquestre. La collaboration commence." |
| `MILESTONE_PLAN_LOCKED` | Both confirm plan | both | "Jalons verrouillés" | "Le plan de travail est confirmé. La collaboration peut démarrer." |
| `MILESTONE_STARTED` | Pro sets `en_cours` | customer | "Jalon démarré" | "Le prestataire a démarré le jalon "{titre}"." |
| `DELIVERABLE_SUBMITTED` | Pro submits deliverable | customer | "Livrable soumis" | "Un livrable a été déposé pour le jalon "{titre}"." |
| `REVISION_REQUESTED` | Customer sets `modification` | pro | "Révision demandée" | "Le client a demandé une révision sur "{titre}"." |
| `MILESTONE_VALIDATED` | Customer sets `validee` | pro | "Jalon validé" | "Le jalon "{titre}" a été validé et le paiement libéré." |
| `VALIDATION_REMINDER` | Auto-release T+2 reminder | customer | "Action requise" | "Vous avez 24h pour valider le jalon "{titre}" avant la libération automatique." |
| `AUTO_RELEASE` | Auto-release T+3 | both | "Paiement libéré automatiquement" | "Le jalon "{titre}" a été validé automatiquement après 3 jours." |
| `ALL_MILESTONES_VALIDATED` | Last milestone validated | both | "Collaboration terminée" | "Tous les jalons sont validés. Veuillez laisser un avis pour clore l'espace." |
| `REVIEW_SUBMITTED` | One party reviews | the other party | "Avis reçu" | "{name} a laissé un avis. Laissez le vôtre pour clôturer la collaboration." |
| `COLLABORATION_CLOSED` | Both parties reviewed | both | "Collaboration clôturée" | "La collaboration est clôturée. Merci d'avoir utilisé Jobty." |
| `DISPUTE_OPENED` | Dispute triggered | other party + admin topic | "Litige ouvert" | "Un litige a été ouvert sur la collaboration "{title}"." |
| `DISPUTE_STATUS_UPDATED` | Admin updates status | both parties | "Litige mis à jour" | "Le statut de votre litige est maintenant : {status}." |
| `DISPUTE_RESOLVED` | Admin resolves | both parties | "Litige résolu" | "L'arbitrage a été rendu. Décision : {arbitrationDecision}." |

---

## 10. Shared Rules & Invariants

### Role Resolution

Every endpoint resolves the caller's role (customer/pro/admin) from the JWT subject claim. The collaboration record contains `customerId` and `proId` UUIDs. The backend compares the JWT subject against these to determine the caller's role within the collaboration. Requests from unrelated users return `403`.

### `CollaborationSpaceResponse` — required fields for phases 4–9

The `GET /collaborations/{id}` detail endpoint must return these additional fields when the collaboration is in phases 4–9:

```json
{
  "id": "uuid",
  "status": "ACTIVE",
  "allowedActions": ["submit_deliverable", "request_dispute"],
  "alreadyReviewed": false,
  "milestonesPlanLocked": true,
  "uiHints": {
    "messageEnabled": true,
    "reviewAllowed": false,
    "canCustomerSubmitBrief": false,
    "canProDecide": false,
    "nextRecommendedAction": "await_deliverable"
  },
  "lifecycleStep": "6",
  "lifecycleStepLabel": "Collaboration",
  "lifecycleTimeline": [...]
}
```

The `allowedActions` array drives every action button on the frontend. Populate it based on the current status and the caller's role.

### Idempotency

Signing, confirming payment, and plan confirmation endpoints must be idempotent: calling them a second time when the action is already done must return `409` with a clear message, not a `5xx`.

### Archival

When a collaboration is `CLOSED`, the backend must never hard-delete any related record (brief, contract, etapes, deliverables, transactions, reviews). Set an `archivedAt` timestamp on `collaboration_spaces`. Archived spaces are still fetchable via `GET /collaborations/{id}` and `GET /collaborations/spaces/me` (include an `archived: true` flag in the response so the frontend can filter if needed).

### Currency

All monetary amounts are stored with full precision (`DECIMAL(18,4)`). The `currency` field is stored as an ISO 4217 code (e.g., `"XAF"`, `"EUR"`, `"USD"`). All amounts returned in API responses include both the value and the currency code:

```json
{ "amount": 250000, "currency": "XAF" }
```

---

**Document version:** 1.0  
**Last updated:** 2026-05-15  
**Authored for:** Jobty backend team  
**Frontend alignment:** `src/features/collaboration/` — steps 4–9
