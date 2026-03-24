# Localization Backend Implementation Spec

## Scope
This document describes the current Localization frontend behavior and the backend APIs needed to support it.

Source implementation:
- src/features/localisation/pages/index.tsx
- src/features/localisation/styles/localisation/style.css

Route:
- /localisation

## Current Frontend Behavior
The current page is client-side and based on mock locations data. No backend API is called yet.

### Main user capabilities
- Search places by free text
- Filter by category
- Browse places list and map markers
- Open place detail popup
- Add or remove local favorites (frontend-only)
- View popular places section
- Call place directly via tel link
- Open external route via Google Maps query

### Core local state
- searchQuery
- selectedCategory
- selectedPlace
- showPopup
- userLocation
- favorites
- menuOpen

### Geolocation usage
- Browser geolocation requested on page load
- coordinates stored locally in userLocation
- currently used only for displaying a user marker
- no distance recomputation from userLocation is done; distance is mock data field

## Frontend Data Model to Support

### Category shape
- id: string
- nom: string
- color: string
- icon: frontend-resolved

### Place shape used by UI
- id: string | number
- nom: string
- categorie: string
- adresse: string
- ville: string
- pays: string
- telephone: string
- horaires: string
- ouvert24h: boolean
- note: number
- avis: number
- image: string
- services: string[]
- lat: number
- lng: number
- distance: number

### Favorites shape (currently local)
- placeId list in local state

## Required Backend Capabilities

### 1) Places search and filtering
- search places endpoint with:
  - query
  - category
  - city
  - country
  - lat, lng, radiusKm (optional)
  - page, size
  - sort (distance, rating, popularity)

Purpose:
- replace static filtering over mock array

### 2) Categories endpoint
- categories endpoint

Purpose:
- remove hardcoded categories and allow backend-driven catalog

### 3) Place details endpoint
- get place details by id

Purpose:
- support richer popup data and reduce list payload size

### 4) Popular places endpoint
- top places endpoint by location and optional category

Purpose:
- replace current suggestion list generated from local sorting

### 5) Favorites persistence
- add favorite endpoint
- remove favorite endpoint
- list my favorites endpoint

Purpose:
- synchronize favorites across devices and sessions

### 6) Optional advanced features
- open-now filtering
- service tag filtering
- autocomplete suggestions
- place reporting/verification signals

## Suggested Endpoint Blueprint

### Categories
GET /api/v1/public/localisation/categories

### Places search
GET /api/v1/public/localisation/places
Query params:
- query
- category
- city
- country
- lat
- lng
- radiusKm
- openNow
- minRating
- services (comma-separated)
- sort
- page
- size

### Place details
GET /api/v1/public/localisation/places/{placeId}

### Popular places
GET /api/v1/public/localisation/places/popular?city=Abidjan&category=pharmacie&size=6

### Favorites (authenticated)
GET /api/v1/localisation/favorites
POST /api/v1/localisation/favorites/{placeId}
DELETE /api/v1/localisation/favorites/{placeId}

## Suggested Request and Response Shapes

### Places search response
{
  "success": true,
  "status": 200,
  "message": "Lieux récupérés",
  "data": {
    "content": [
      {
        "id": "PLC_1",
        "nom": "Pharmacie du Plateau",
        "categorie": "pharmacie",
        "adresse": "Avenue Franchet d'Esperey, Plateau",
        "ville": "Abidjan",
        "pays": "Côte d'Ivoire",
        "telephone": "+2252720213456",
        "horaires": "7h00 - 22h00",
        "ouvert24h": false,
        "note": 4.5,
        "avis": 128,
        "image": "https://...",
        "services": ["Médicaments", "Parapharmacie"],
        "lat": 5.3197,
        "lng": -4.0219,
        "distance": 0.5
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "size": 12,
    "number": 0,
    "first": true,
    "last": true
  },
  "errors": null,
  "timestamp": "2026-03-23T14:00:00Z"
}

### Place details response
{
  "success": true,
  "status": 200,
  "message": "Détail du lieu",
  "data": {
    "id": "PLC_1",
    "nom": "Pharmacie du Plateau",
    "categorie": "pharmacie",
    "adresse": "Avenue Franchet d'Esperey, Plateau",
    "ville": "Abidjan",
    "pays": "Côte d'Ivoire",
    "telephone": "+2252720213456",
    "horaires": "7h00 - 22h00",
    "ouvert24h": false,
    "note": 4.5,
    "avis": 128,
    "images": ["https://..."],
    "services": ["Médicaments", "Parapharmacie"],
    "lat": 5.3197,
    "lng": -4.0219,
    "distance": 0.5
  },
  "errors": null,
  "timestamp": "2026-03-23T14:00:00Z"
}

### Favorites list response
{
  "success": true,
  "status": 200,
  "message": "Favoris récupérés",
  "data": {
    "placeIds": ["PLC_1", "PLC_8"]
  },
  "errors": null,
  "timestamp": "2026-03-23T14:00:00Z"
}

## Validation and Business Rules
- lat and lng should be validated as geographic coordinates
- radiusKm should have a safe max (example: 50 km for urban queries)
- category must exist in categories catalog
- sort options should be explicit and validated
- if query is empty and no filters are provided, backend should return nearest or popular defaults
- phone should be normalized for tel links

## Performance Requirements for Backend
- paginated list endpoints mandatory
- support partial responses for list cards to reduce payload
- cache categories and popular places
- index by category, geolocation, city, normalized name

## Security and Access
- public search endpoints can be unauthenticated
- favorites endpoints require authentication and user ownership checks
- apply rate limiting on public search endpoints

## Recommended Backend Delivery Order
1. Categories and places search endpoint
2. Place details endpoint
3. Popular places endpoint
4. Favorites endpoints
5. Advanced filters and autocomplete
