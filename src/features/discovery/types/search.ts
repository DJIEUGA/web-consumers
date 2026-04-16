export interface PublicProfilesSearchRequest {
  query?: string;
  sector?: string;
  country?: string;
  city?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  specialization?: string;
  minRate?: number;
  maxRate?: number;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  minYearsOfOperation?: number;
  maxYearsOfOperation?: number;
  minRating?: number;
  verifiedOnly?: boolean;
  premiumOnly?: boolean;
  minProjects?: number;
  maxHourlyRate?: number;
  page: number;
  size: number;
}

export interface PublicSearchProfileItem {
  userId: string;
  firstName: string | null;
  companyName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  type: 'PRO' | 'ENTERPRISE' | string;
  specialization: string | null;
  sector: string | null;
  hourlyRate: number | null;
  averageRating: number | null;
  reviewCount: number | null;
  city: string | null;
  country: string | null;
  experienceYears?: number | null;
  yearsOfOperation?: number | null;
  premium?: boolean;
  verified?: boolean;
  isPremium?: boolean;
  isVerified?: boolean;
}

export interface PublicSearchPageMeta {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PublicSearchPageData {
  content: PublicSearchProfileItem[];
  page: PublicSearchPageMeta;
}

export interface PublicProfilesSearchResponseData {
  pros: PublicSearchPageData;
  enterprises: PublicSearchPageData;
}

export interface PublicApiEnvelope<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
  timestamp?: string;
}
