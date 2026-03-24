# Job Alert Backend Implementation Spec

## Scope
This document describes the current Job Alert frontend behavior and the backend APIs needed to support it.

Source implementation:
- src/features/jobalerte/pages/index.tsx
- src/features/jobalerte/styles/JobAlerte.css

Route:
- /job-alerte

## Current Frontend Behavior
The current page is fully client-side and uses in-memory mock data. No API calls are made yet.

### User flow state machine
The page behaves like a multi-step workflow:
1. Step 1: user selects a service category
2. Step 2: user enters details (urgency, description, address, city, phone, optional photos)
3. Step 3: confirmation view and submit alert
4. Searching phase: simulated provider matching for 3 seconds
5. Provider offers list: user chooses one offer
6. Ticket modal: service summary and amount
7. Payment modal: payment method and phone
8. Success modal: payment confirmed and provider dispatched

### Core local state
- currentStep
- showTicketPopup
- showPaymentPopup
- showSuccessPopup
- alerteEnvoyee
- professionnelTrouve
- searchingPro
- selectedTicket
- alerteForm
- menuOpen

### Frontend data currently mocked
- categories list (12 categories)
- urgency levels list (3 levels)
- available professionals list with pricing and ETA
- recent alerts history

## Frontend Data Model to Support

### Alert form payload expected by UI
- categorie: string
- description: string
- urgence: normale | urgente | critique
- adresse: string
- ville: string
- telephone: string
- photos: array (optional, not wired yet)

### Category shape
- id: string
- nom: string
- description: string
- color: string (optional if backend wants to control display)
- icon: frontend-resolved (backend does not need to send icon component)

### Urgency shape
- id: normale | urgente | critique
- label: string
- description: string
- color: string

### Professional offer shape
- id: string | number
- nom: string
- profession: string
- photo: string
- note: number
- avis: number
- distance: number
- tempsArrivee: string
- verifie: boolean
- montant: number
- devise: string

### Alert history shape
- id: string | number
- categorie: string
- description: string
- statut: terminee | en_cours | annulee
- date: ISO string or display string
- professionnel: string
- montant: number

## Required Backend Capabilities

### 1) Catalog endpoints
- categories endpoint
- urgency levels endpoint

Purpose:
- remove hardcoded service categories and urgency metadata from frontend

### 2) Alert creation and lifecycle
- create alert endpoint
- get alert by id endpoint
- list my alerts endpoint
- cancel alert endpoint

Purpose:
- replace local workflow state with persisted alert records

### 3) Alert matching and offers
- alert offers endpoint (list providers for an alert)
- accept offer endpoint
- optional realtime channel for offers arriving asynchronously

Purpose:
- replace simulated 3-second timeout and hardcoded professionals

### 4) Payment flow
- create payment ticket endpoint
- list payment methods endpoint
- confirm payment endpoint
- get payment status endpoint

Purpose:
- replace static payment modal behavior

### 5) Dispatch and tracking
- dispatch status endpoint (provider notified, on the way, arrived)
- optional phone masking and call relay endpoint

Purpose:
- support post-payment status shown in success phase

## Suggested Endpoint Blueprint

### Categories and urgency
GET /api/v1/job-alert/categories
GET /api/v1/job-alert/urgency-levels

### Alerts
POST /api/v1/job-alert/alerts
GET /api/v1/job-alert/alerts/{alertId}
GET /api/v1/job-alert/alerts/me?page=0&size=10
PATCH /api/v1/job-alert/alerts/{alertId}/cancel

### Matching and offers
GET /api/v1/job-alert/alerts/{alertId}/offers
POST /api/v1/job-alert/offers/{offerId}/accept

Optional realtime:
GET /api/v1/job-alert/alerts/{alertId}/events/stream

### Payments
POST /api/v1/job-alert/offers/{offerId}/ticket
GET /api/v1/job-alert/payments/methods
POST /api/v1/job-alert/payments/{ticketId}/confirm
GET /api/v1/job-alert/payments/{ticketId}/status

## Suggested Request and Response Shapes

### Create alert request
{
  "categorie": "plomberie",
  "description": "Fuite d'eau importante dans la cuisine",
  "urgence": "urgente",
  "adresse": "Rue des Jardins, Cocody",
  "ville": "Abidjan",
  "telephone": "+2250700000000",
  "photos": ["https://..."]
}

### Create alert response
{
  "success": true,
  "status": 201,
  "message": "Alerte créée",
  "data": {
    "alertId": "ALR_123",
    "status": "SEARCHING_PROFESSIONAL",
    "createdAt": "2026-03-23T14:00:00Z"
  },
  "errors": null,
  "timestamp": "2026-03-23T14:00:00Z"
}

### Offers response
{
  "success": true,
  "status": 200,
  "message": "Offres récupérées",
  "data": {
    "alertId": "ALR_123",
    "offers": [
      {
        "offerId": "OFF_1",
        "professional": {
          "id": "PRO_1",
          "nom": "Mamadou Diallo",
          "profession": "Plombier certifié",
          "photo": "https://...",
          "note": 4.8,
          "avis": 156,
          "verifie": true
        },
        "distance": 1.2,
        "tempsArrivee": "15-20 min",
        "montant": 15000,
        "devise": "FCFA"
      }
    ]
  },
  "errors": null,
  "timestamp": "2026-03-23T14:00:10Z"
}

### Confirm payment request
{
  "ticketId": "TCK_1",
  "method": "orange_money",
  "phone": "+2250700000000"
}

### Confirm payment response
{
  "success": true,
  "status": 200,
  "message": "Paiement confirmé",
  "data": {
    "ticketId": "TCK_1",
    "paymentStatus": "SUCCESS",
    "dispatchStatus": "PROFESSIONAL_NOTIFIED"
  },
  "errors": null,
  "timestamp": "2026-03-23T14:05:00Z"
}

## Validation Rules Required on Backend
- categorie must be supported
- urgence must be one of normale, urgente, critique
- description required and non-empty
- adresse required
- ville required
- telephone required and normalized to E.164 where possible
- montant in offers must be positive
- offer acceptance idempotency: only one accepted offer per alert
- payment confirmation idempotency and replay-safe

## Authentication and Authorization
- create alert should support authenticated users
- if guest alerts are allowed, backend must issue temporary alert ownership token
- list my alerts requires authenticated identity
- payment and offer acceptance must verify alert ownership

## Realtime Considerations
Recommended for production UX:
- Server-Sent Events or WebSocket for alert status updates
- updates for offer arrival, offer expiry, payment status, provider dispatch

## Minimal Delivery Order for Backend Team
1. Categories + create alert + list my alerts
2. Offers retrieval + accept offer
3. Payment ticket + confirm payment
4. Realtime events
5. History pagination and filtering
