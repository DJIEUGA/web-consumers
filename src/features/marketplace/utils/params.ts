import type { SearchRequest } from '../api/marketplaceTypes';

const readOptionalNumber = (value: string | null): number | undefined => {
  if (value === null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export type MarketplaceFilters = {
  search: string;
  secteur: string;
  pays: string;
  ville: string;
  specialization: string;
  type: string;
  minRating?: number;
  minRate?: number;
  maxRate?: number;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  minYearsOfOperation?: number;
  maxYearsOfOperation?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  page: number;
  size: number;
};

export const buildFiltersFromParams = (
  params: URLSearchParams,
  defaults: { page: number; size: number },
): MarketplaceFilters => {
  const parsedMinRate = readOptionalNumber(params.get('minRate'));
  const parsedMaxRate = readOptionalNumber(params.get('maxRate'));

  const parsedMinExperienceYears = readOptionalNumber(params.get('minExperienceYears'));
  const parsedMaxExperienceYears = readOptionalNumber(params.get('maxExperienceYears'));

  const parsedMinYearsOfOperation = readOptionalNumber(params.get('minYearsOfOperation'));
  const parsedMaxYearsOfOperation = readOptionalNumber(params.get('maxYearsOfOperation'));

  return {
    search: params.get('query') || '',
    secteur: params.get('sector') || '',
    pays: params.get('country') || '',
    ville: params.get('city') || '',
    specialization: params.get('specialization') || '',
    type: params.get('type') || '',
    minRating: readOptionalNumber(params.get('minRating')),
    minRate: parsedMinRate,
    maxRate: parsedMaxRate ?? parsedMinRate,
    minExperienceYears: parsedMinExperienceYears,
    maxExperienceYears: parsedMaxExperienceYears ?? parsedMinExperienceYears,
    minYearsOfOperation: parsedMinYearsOfOperation,
    maxYearsOfOperation: parsedMaxYearsOfOperation ?? parsedMinYearsOfOperation,
    lat: readOptionalNumber(params.get('lat')),
    lng: readOptionalNumber(params.get('lng')),
    radiusKm: readOptionalNumber(params.get('radiusKm')),
    page: readOptionalNumber(params.get('page')) ?? defaults.page,
    size: readOptionalNumber(params.get('size')) ?? defaults.size,
  };
};

export const buildQueryParams = (filters: MarketplaceFilters): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.search.trim()) params.set('query', filters.search.trim());
  if (filters.secteur.trim()) params.set('sector', filters.secteur.trim());
  if (filters.pays.trim()) params.set('country', filters.pays.trim());
  if (filters.ville.trim()) params.set('city', filters.ville.trim());
  if (filters.specialization.trim()) params.set('specialization', filters.specialization.trim());
  if (filters.type.trim()) params.set('type', filters.type.trim());

  if (filters.minRating !== undefined) params.set('minRating', String(filters.minRating));
  if (filters.minRate !== undefined) params.set('minRate', String(filters.minRate));
  if (filters.maxRate !== undefined) params.set('maxRate', String(filters.maxRate));
  if (filters.minExperienceYears !== undefined) {
    params.set('minExperienceYears', String(filters.minExperienceYears));
  }
  if (filters.maxExperienceYears !== undefined) {
    params.set('maxExperienceYears', String(filters.maxExperienceYears));
  }
  if (filters.minYearsOfOperation !== undefined) {
    params.set('minYearsOfOperation', String(filters.minYearsOfOperation));
  }
  if (filters.maxYearsOfOperation !== undefined) {
    params.set('maxYearsOfOperation', String(filters.maxYearsOfOperation));
  }

  if (filters.lat !== undefined) params.set('lat', String(filters.lat));
  if (filters.lng !== undefined) params.set('lng', String(filters.lng));
  if (filters.radiusKm !== undefined) params.set('radiusKm', String(filters.radiusKm));

  params.set('page', String(filters.page));
  params.set('size', String(filters.size));

  return params;
};

export const toSearchRequest = (filters: MarketplaceFilters): SearchRequest => ({
  ...(filters.search.trim() && { query: filters.search.trim() }),
  ...(filters.secteur.trim() && { sector: filters.secteur.trim() }),
  ...(filters.pays.trim() && { country: filters.pays.trim() }),
  ...(filters.ville.trim() && { city: filters.ville.trim() }),
  ...(filters.specialization.trim() && { specialization: filters.specialization.trim() }),
  ...(filters.minRating !== undefined && { minRating: filters.minRating }),
  ...(filters.minRate !== undefined && { minRate: filters.minRate }),
  ...(filters.maxRate !== undefined && { maxRate: filters.maxRate }),
  ...(filters.minExperienceYears !== undefined && { minExperienceYears: filters.minExperienceYears }),
  ...(filters.maxExperienceYears !== undefined && { maxExperienceYears: filters.maxExperienceYears }),
  ...(filters.minYearsOfOperation !== undefined && { minYearsOfOperation: filters.minYearsOfOperation }),
  ...(filters.maxYearsOfOperation !== undefined && { maxYearsOfOperation: filters.maxYearsOfOperation }),
  ...(filters.lat !== undefined && { lat: filters.lat }),
  ...(filters.lng !== undefined && { lng: filters.lng }),
  ...(filters.radiusKm !== undefined && { radiusKm: filters.radiusKm }),
  page: filters.page,
  size: filters.size,
});

export const validateMarketplaceFilters = (filters: MarketplaceFilters): string | null => {
  if (
    filters.minRate !== undefined &&
    filters.maxRate !== undefined &&
    filters.minRate > filters.maxRate
  ) {
    return 'Le tarif minimum ne peut pas etre superieur au tarif maximum.';
  }

  if (
    filters.minExperienceYears !== undefined &&
    filters.maxExperienceYears !== undefined &&
    filters.minExperienceYears > filters.maxExperienceYears
  ) {
    return "L'experience minimum ne peut pas depasser l'experience maximum.";
  }

  if (
    filters.minYearsOfOperation !== undefined &&
    filters.maxYearsOfOperation !== undefined &&
    filters.minYearsOfOperation > filters.maxYearsOfOperation
  ) {
    return "Les annees d'activite minimum ne peuvent pas depasser le maximum.";
  }

  const hasLat = filters.lat !== undefined;
  const hasLng = filters.lng !== undefined;
  const hasRadius = filters.radiusKm !== undefined;
  const locationPartsCount = Number(hasLat) + Number(hasLng) + Number(hasRadius);

  if (locationPartsCount > 0 && locationPartsCount < 3) {
    return 'Pour la recherche geographique, renseignez lat, lng et radiusKm ensemble.';
  }

  return null;
};
