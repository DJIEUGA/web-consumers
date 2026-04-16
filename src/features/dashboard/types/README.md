# Dashboard Types

Type definitions for dashboard-related data structures and API responses.

## Overview

This directory contains TypeScript type definitions used across dashboard features, ensuring type safety and consistency when working with profile data, statistics, and other dashboard-related information.

## Files

### `profile.types.ts`
Profile-related type definitions mapped to the `/api/v1/profiles/me` API response.

#### Types

**`ProfileApiResponse`**  
Raw API response structure from `/api/v1/profiles/me`

```typescript
interface ProfileApiResponse {
  userId: string;
  firstName: string;
  lastName: string;
  username: string | null;
  email: string;
  role: string;
  phoneNumber: number | string;
  country: string;
  city: string;
  description: string;
  sector: string;
  specialization: string;
  experienceYears: number;
  skills: string[];
  hourlyRate: number;
  averageRating: number;
  reviewCount: number;
  avatarUrl: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_SUBMITTED';
  actionButtonType: 'CONTACT' | 'COLLABORATE' | 'HIRE';
  verified: boolean;
  available: boolean;
  premium: boolean;
}
```

**`DashboardProfile`**  
Normalized profile structure used across dashboard components. Includes computed fields like `fullName` and `subtitle`.

**`ProCardFormState`**  
Form state for professional card editing in the dashboard.

**`FreelanceCardData`**  
Extended card data with additional UI fields (rating, verification, plan).

#### Constants

**`ROLE_LABELS`**  
Maps role codes to display labels:
```typescript
{
  ROLE_ADMIN: 'Administrateur',
  ROLE_PRO: 'Freelance',
  ROLE_ENTERPRISE: 'Entreprise',
  // ...
}
```

**`KYC_STATUS_LABELS`**  
Maps KYC status codes to French labels.

**`ACTION_BUTTON_LABELS`**  
Maps action button types to display labels.

## Usage Examples

### Using DashboardProfile

```typescript
import { DashboardProfile } from '@/features/dashboard/types';

function MyComponent() {
  const profile: DashboardProfile = useDashboardProfile();
  
  return (
    <div>
      <h1>{profile.fullName}</h1>
      <p>{profile.subtitle}</p>
      <p>Rating: {profile.averageRating} ({profile.reviewCount} reviews)</p>
    </div>
  );
}
```

### Using ProCardFormState

```typescript
import { ProCardFormState } from '@/features/dashboard/types';

function EditCard() {
  const [form, setForm] = useState<ProCardFormState>({
    photo: profile.avatarUrl,
    prenom: profile.firstName,
    nom: profile.lastName,
    // ...
  });
  
  // Form handling...
}
```

### Using Constants

```typescript
import { ROLE_LABELS, KYC_STATUS_LABELS } from '@/features/dashboard/types';

const roleDisplay = ROLE_LABELS[user.role]; // "Freelance"
const kycDisplay = KYC_STATUS_LABELS[profile.kycStatus]; // "Vérifié"
```

## Related Files

- `src/features/dashboard/hooks/useDashboardProfile.ts` - Hook that transforms API response to DashboardProfile
- `src/features/dashboard/pages/pro/index.tsx` - Pro dashboard component using these types
- `src/api/profileEndpoints.ts` - Profile API endpoint definitions

## Field Mappings

| API Field | Dashboard Type Field | Card Form Field |
|-----------|---------------------|-----------------|
| `firstName` | `firstName` | `prenom` |
| `lastName` | `lastName` | `nom` |
| `specialization` | `specialization` | `specialite` |
| `hourlyRate` | `hourlyRate` | `tarifHoraire` |
| `skills` | `skills` | `tags` |
| `available` | `available` | `disponible` |
| `actionButtonType` | `actionButtonType` | `typeBouton` |

See [DASHBOARD_PRO_CARD_HARMONIZATION.md](../../../DASHBOARD_PRO_CARD_HARMONIZATION.md) for complete field mapping documentation.

## Type Safety

All types are strictly typed to prevent runtime errors:

```typescript
// ✅ Type-safe
const rating: number = profile.averageRating;

// ❌ TypeScript error
const rating: string = profile.averageRating;
```

## Extending Types

When adding new fields from the API:

1. Add to `ProfileApiResponse` (raw API shape)
2. Add to `DashboardProfile` (normalized shape)
3. Update `useDashboardProfile` hook to map the field
4. If needed, add to `ProCardFormState` (editable fields only)

Example:

```typescript
// 1. Add to ProfileApiResponse
export interface ProfileApiResponse {
  // ... existing fields
  linkedinUrl?: string;
}

// 2. Add to DashboardProfile
export interface DashboardProfile {
  // ... existing fields
  linkedinUrl: string;
}

// 3. Update useDashboardProfile hook
const linkedinUrl = toStringValue(payload.linkedinUrl) || '';

return {
  // ... existing fields
  linkedinUrl,
};

// 4. Add to form if editable
export interface ProCardFormState {
  // ... existing fields
  linkedinUrl: string;
}
```

## Best Practices

1. **Use specific types, not `any`**
   ```typescript
   // ✅ Good
   const profile: DashboardProfile = useDashboardProfile();
   
   // ❌ Bad
   const profile: any = useDashboardProfile();
   ```

2. **Provide fallback values**
   ```typescript
   const rating = profile.averageRating || 0;
   const skills = profile.skills || [];
   ```

3. **Use type guards for nullable fields**
   ```typescript
   if (profile.username) {
     // username is string here, not null
   }
   ```

4. **Leverage constants for enums**
   ```typescript
   const roleLabel = ROLE_LABELS[profile.role] || 'Utilisateur';
   ```

## Changelog

### 2026-02-24
- Created comprehensive type definitions for dashboard profile
- Added `ProfileApiResponse`, `DashboardProfile`, `ProCardFormState`
- Added role, KYC status, and action button constants
- Harmonized with `/api/v1/profiles/me` response structure
