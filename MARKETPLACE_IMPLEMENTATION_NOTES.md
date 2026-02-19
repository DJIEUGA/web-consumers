# Marketplace Public Profiles Implementation Plan

## Summary of What's Been Created

I've set up the foundation for loading public profiles from the API while maintaining the design system consistency you provided. Here's what's in place:

### 1. **Type Definitions** (`src/features/marketplace/types/publicProfile.d.ts`)
- Complete TypeScript types matching the API response structure
- Includes: `PublicProfile`, `PublicProfileStats`, `PublicProfileService`, `PublicProfileReview`, etc.
- Both single and paginated response wrappers

### 2. **API Service** (`src/features/marketplace/services/publicProfilesApi.ts`)
- Functions to fetch public profiles with filters:
  - `getPublicProfiles()` - Main fetch with pagination and filtering
  - `getPublicProfileById()` - Single profile fetch
  - `searchPublicProfiles()` - Text search
  - `getProfilesBySector()` - Filter by sector
  - `getProfilesByLocation()` - Filter by location

### 3. **React Query Hooks** (`src/features/marketplace/hooks/usePublicProfiles.ts`)
- Reusable hooks for different queries:
  - `usePublicProfiles()` - Main hook with all filters
  - `usePublicProfileById()` - Single profile
  - `useSearchPublicProfiles()` - Search functionality
  - `usePublicProfilesBySector()` - Sector filtering
  - `usePublicProfilesByLocation()` - Location filtering
- Includes proper cache times and stale times

### 4. **Data Mapper** (`src/features/marketplace/utils/profileMapper.ts`)
- `mapPublicProfileToFreelanceCard()` - Transform API data to freelance card format
- `mapPublicProfileToEnterpriseCard()` - Transform to enterprise card format
- Utility functions for sorting, filtering, and grouping profiles

### 5. **Design System Documentation** (`DESIGN_SYSTEM_MARKETPLACE.md`)
- Comprehensive design guide including:
  - Color palette (with hex values)
  - Typography standards
  - Card layouts and spacing
  - Button styles
  - Responsive breakpoints
  - Accessibility guidelines

---

## Questions for Implementation Details

Before I integrate this into the marketplace page, I need clarification on:

### 1. **Data Source & Fallback Strategy**
   - Should I replace the mock data entirely with API data?
   - Or keep mock data as fallback if API fails?
   - Load mock data on component mount and replace with real data when API succeeds?

### 2. **Pagination Handling**
   - How should "Voir plus" / "Load More" button work?
   - Infinite scroll vs. pagination buttons?
   - How many items per page? (currently 4 items visible)

### 3. **Filtering & Search**
   - Which filters to implement first?
     - Text search (name/skill)?
     - Location dropdown?
     - Sector dropdown?
     - Price range slider?
     - Rating filter?
   - Should filters be applied immediately or with a "Filter" button?

### 4. **Profile Separation**
   - The API seems to return all public profiles in one endpoint
   - The current UI separates "Freelance" and "Entreprise" sections
   - Should I:
     - Fetch all and separate by role/type in the UI?
     - Have separate API calls for each type?
     - Use `projectTypes` or another field to determine type?

### 5. **Loading & Error States**
   - Current mockdatafeeds 4 cards per section. Should loading skeletons match this?
   - How to handle API errors gracefully?
   - Retry mechanism?

### 6. **Rating Display**
   - API provides `averageRating` (number)
   - UI currently shows 5 gold stars. Should I:
     - Use gold stars with numeric value (⭐⭐⭐⭐⭐ 4.5)?
     - Convert to visual representation (partial stars)?
     - Show both stars and number?

### 7. **Missing Fields**
   - API doesn't have `tarifMin` (minimum rate)
   - API has `hourlyRate` but UI shows "À partir de: X FCFA/H"
   - Should I use `hourlyRate` directly or create a formula?
   - Pricing mode (from services) might be more accurate?

---

## Next Steps (Once You Clarify)

1. Integrate hooks into marketplace component
2. Update card rendering with real data
3. Implement loading states with skeleton cards
4. Add filter functionality
5. Handle error states and retry logic
6. Update "Voir plus" pagination
7. Test with real API and design validation

---

## Design Consistency Notes

✅ All components will follow the design system I documented:
- Color scheme: Teal accent (`#3DC7C9`), Purple headers (`#6B4FC9`)
- Typography: Bold names, gray secondary text
- Cards: Rounded corners (12-16px), subtle shadows, proper spacing
- Buttons: Pill-shaped "Contacter" buttons with outlined style
- Stars: Gold color (`#FFB800`)
- Responsive: Mobile (1 col), Tablet (2 cols), Desktop (3-4 cols)

