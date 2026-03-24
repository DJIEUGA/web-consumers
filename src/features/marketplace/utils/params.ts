import type { SearchRequest } from '../api/marketplaceTypes';
import { resolveSectorSlug } from '@/utils/sectorMapping';

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
    search: params.get('q') || '',
    secteur: resolveSectorSlug(params.get('sector') || ''),
    pays: params.get('country') || '',
    ville: params.get('city') || '',
    specialization: params.get('specialization') || '',
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

  if (filters.search.trim()) params.set('q', filters.search.trim());
  if (filters.secteur.trim()) params.set('sector', filters.secteur.trim());
  if (filters.pays.trim()) params.set('country', filters.pays.trim());
  if (filters.ville.trim()) params.set('city', filters.ville.trim());
  if (filters.specialization.trim()) params.set('specialization', filters.specialization.trim());

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
  query: filters.search.trim() || undefined,
  sector: filters.secteur.trim() || undefined,
  country: filters.pays.trim() || undefined,
  city: filters.ville.trim() || undefined,
  specialization: filters.specialization.trim() || undefined,
  minRating: filters.minRating,
  minRate: filters.minRate,
  maxRate: filters.maxRate,
  minExperienceYears: filters.minExperienceYears,
  maxExperienceYears: filters.maxExperienceYears,
  minYearsOfOperation: filters.minYearsOfOperation,
  maxYearsOfOperation: filters.maxYearsOfOperation,
  lat: filters.lat,
  lng: filters.lng,
  radiusKm: filters.radiusKm,
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
