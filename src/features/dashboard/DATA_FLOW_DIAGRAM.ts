/**
 * Dashboard Pro Card - Data Flow Diagram
 * 
 * This document illustrates the data flow for the professional card on the dashboard
 */

/*
┌─────────────────────────────────────────────────────────────────────────────┐
│                          API RESPONSE FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

   GET /api/v1/profiles/me
          │
          ▼
   ┌──────────────────┐
   │  API Response    │
   │  (Raw JSON)      │
   │                  │
   │ - userId         │
   │ - firstName      │
   │ - lastName       │
   │ - specialization │
   │ - hourlyRate     │
   │ - skills         │
   │ - available      │
   │ - verified       │
   │ - averageRating  │
   │ - ...            │
   └──────────────────┘
          │
          ▼
   ┌──────────────────────────────────────────┐
   │  useProfileQuery()                       │
   │  (TanStack Query Hook)                   │
   │                                          │
   │  - Fetches profile data                  │
   │  - Caches for 10 minutes                 │
   │  - Returns ApiResponse<Profile>          │
   └──────────────────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────────┐
   │  useDashboardProfile()                   │
   │  (Dashboard Hook)                        │
   │                                          │
   │  Transforms & Normalizes:                │
   │  - Extracts nested data                  │
   │  - Type-safe conversions                 │
   │  - Fallback values                       │
   │  - Computed fields (subtitle, fullName)  │
   └──────────────────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────────┐
   │  DashboardProfile                        │
   │  (Typed Object)                          │
   │                                          │
   │  {                                       │
   │    userId: "9c88153e-...",              │
   │    firstName: "nathan",                  │
   │    lastName: "ryle",                     │
   │    specialization: "Développeur Web...", │
   │    hourlyRate: 1500.0,                   │
   │    skills: [],                           │
   │    available: true,                      │
   │    verified: true,                       │
   │    averageRating: 0.0,                   │
   │    ...                                   │
   │  }                                       │
   └──────────────────────────────────────────┘
          │
          ├──────────────────┬──────────────────┐
          ▼                  ▼                  ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │  Sidebar    │  │ Card Form   │  │  Header     │
   │  Display    │  │ (editable)  │  │  Avatar     │
   │             │  │             │  │             │
   │ - Name      │  │ initialForm │  │ - Photo     │
   │ - Subtitle  │  │   │         │  └─────────────┘
   │ - Avatar    │  │   ▼         │
   │ - Rating    │  │ carteForm   │
   └─────────────┘  │ (useState)  │
                    │   │         │
                    │   ▼         │
                    │ Card        │
                    │ Preview     │
                    │             │
                    │ - Photo     │
                    │ - Name      │
                    │ - Location  │
                    │ - Rate      │
                    │ - Rating    │
                    │ - Badge     │
                    └─────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          FIELD MAPPING                                      │
└─────────────────────────────────────────────────────────────────────────────┘

API Field              →  Dashboard Field        →  Card Form Field
───────────────────────────────────────────────────────────────────────────────
userId                 →  userId                 →  id
firstName              →  firstName              →  prenom
lastName               →  lastName               →  nom
specialization         →  specialization         →  specialite
sector                 →  sector                 →  secteur
city                   →  city                   →  ville
country                →  country                →  pays
hourlyRate             →  hourlyRate             →  tarifHoraire
skills                 →  skills                 →  tags
available              →  available              →  disponible
actionButtonType       →  actionButtonType       →  typeBouton
avatarUrl              →  avatarUrl              →  photo
averageRating          →  averageRating          →  note (readonly)
reviewCount            →  reviewCount            →  nbAvis (readonly)
verified               →  verified               →  verified (readonly)
premium                →  premium                →  plan (readonly)

┌─────────────────────────────────────────────────────────────────────────────┐
│                    SYNCHRONIZATION STRATEGY                                 │
└─────────────────────────────────────────────────────────────────────────────┘

1. Initial Load
   ═══════════
   profile (API) → initialCarteForm (useMemo) → carteForm (useState)
   
   When profile loads first time, initialCarteForm is computed and 
   carteForm state is initialized

2. Profile Update
   ═══════════════
   New profile.userId detected → useEffect triggers → carteForm synced
   
   When user logs in or switches accounts, form resets to new profile data

3. User Edits
   ═══════════
   User changes form → setCarteForm() → carteForm updated
   
   Form state is independent and can be edited without affecting profile

4. Save Changes
   ════════════
   Form submitted → Update mutation → Profile invalidated → Re-fetch
   
   After save, profile query is invalidated and re-fetched, cycle repeats

┌─────────────────────────────────────────────────────────────────────────────┐
│                        TYPE SAFETY                                          │
└─────────────────────────────────────────────────────────────────────────────┘

ProfileApiResponse    (Raw backend response structure)
       │
       ▼
DashboardProfile      (Frontend normalized structure)
       │
       ▼
ProCardFormState      (Editable form state)
       │
       ▼
FreelanceCardData     (Display data with UI extras)

Each layer has strict TypeScript interfaces ensuring type safety

┌─────────────────────────────────────────────────────────────────────────────┐
│                     FALLBACK & ERROR HANDLING                               │
└─────────────────────────────────────────────────────────────────────────────┘

Missing Value Handling:
  - Strings: toStringValue() returns '' for null/undefined
  - Numbers: toNumberValue() returns 0 or custom default
  - Booleans: toBooleanValue() returns false or custom default
  - Arrays: Array.isArray() check with [] fallback

Avatar Fallback:
  avatarUrl || buildFallbackAvatar(seed)
  → Generates Dicebear avatar from user data if no avatar URL

Loading States:
  - isProfileLoading: true while fetching
  - Display skeleton or placeholder during load
  - Disable forms while loading

Error States:
  - TanStack Query error handling
  - Display error message if fetch fails
  - Retry mechanism built into useQuery

┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXAMPLE VALUES                                      │
└─────────────────────────────────────────────────────────────────────────────┘

Given API Response:
{
  "userId": "9c88153e-be44-43b3-82ea-0b789ac215c4",
  "firstName": "nathan",
  "lastName": "ryle",
  "specialization": "Développeur Web FullStack",
  "hourlyRate": 1500.0,
  "skills": [],
  "available": true,
  "verified": true,
  "averageRating": 0.0,
  "reviewCount": 0,
  "actionButtonType": "CONTACT"
}

Results in Card Form:
{
  prenom: "nathan",
  nom: "ryle",
  specialite: "Développeur Web FullStack",
  tarifHoraire: 1500,
  tags: [],
  disponible: true,
  typeBouton: "contacter",  // Mapped from "CONTACT"
  photo: "https://api.dicebear.com/...",  // Fallback avatar
  
  // Read-only display fields:
  note: 0.0,
  nbAvis: 0,
  verified: true,
  plan: "gratuit"  // false premium → "gratuit"
}

Card Display Shows:
  ┌─────────────────────────────────────┐
  │  [Freelance Badge]                  │
  │                                     │
  │  ┌────┐                             │
  │  │ 👤 │  nathan ryle                │
  │  └────┘  Développeur Web FullStack  │
  │  ✓       📍 Douala, Cameroun        │
  │          ⭐ 0.0 (0 avis)            │
  │                                     │
  │          [Disponible]               │
  │          💰 1500 FCFA/h             │
  │          [Contacter]                │
  └─────────────────────────────────────┘

*/

export {};
