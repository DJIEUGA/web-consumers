export type ApiResponse<T> = {
  success: boolean;
  status: number;
  message: string;
  data: T;
  errors?: unknown;
  timestamp: string;
};

export type SearchRequest = {
  query?: string;
  sector?: string;
  country?: string;
  city?: string;
  specialization?: string;
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
  page?: number;
  size?: number;
};

export type ProEnterpriseCard = {
  userId: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  avatarUrl?: string;
  type: 'PRO' | 'ENTERPRISE' | string;
  specialization?: string;
  sector?: string;
  hourlyRate?: number;
  averageRating?: number;
  reviewCount?: number;
  city?: string;
  country?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  verified?: boolean;
  premium?: boolean;
  relevanceScore?: number;
  availabilityStatus?: string;
  isAvailable?: boolean;
  actionButtonType?: 'CONTACT' | 'COLLABORATE' |  null;
  available?: boolean;
  disponible?: boolean;
};

export type PageInfo = {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
};

export type PageResult<T> = {
  content: T[];
  page: PageInfo;
};

export type MarketplaceSearchMetadata = {
  appliedQueryTokens?: string[];
  resolvedSectors?: string[];
  resolvedSpecializations?: string[];
  minimumTokenMatches?: number;
  rankingVersion?: string;
};

export type MarketplaceSearchData = {
  pros: PageResult<ProEnterpriseCard>;
  enterprises: PageResult<ProEnterpriseCard>;
  metadata?: MarketplaceSearchMetadata;
};

export type MarketplaceAllData = {
  pros: ProEnterpriseCard[];
  enterprises: ProEnterpriseCard[];
};

export type SuggestionsData = {
  query: string;
  sectors: string[];
  specializations: string[];
  keywordAliases: string[];
};
