import axiosInstance from '@/api/axios';
import type { AxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  MarketplaceAllData,
  MarketplaceSearchData,
  PageResult,
  ProEnterpriseCard,
  SearchRequest,
  SuggestionsData,
} from './marketplaceTypes';

const SEARCH_ENDPOINT = '/public/profiles/search';
const SUGGESTIONS_ENDPOINT = '/public/profiles/search/suggestions';
const ALL_ENDPOINT = '/public/profiles/all';

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 12;

const SEARCH_FILTER_KEYS: Array<keyof SearchRequest> = [
  'query',
  'sector',
  'country',
  'city',
  'specialization',
  'minRating',
  'minRate',
  'maxRate',
  'minExperienceYears',
  'maxExperienceYears',
  'minYearsOfOperation',
  'maxYearsOfOperation',
  'lat',
  'lng',
  'radiusKm',
];

const normalizeParams = (input: SearchRequest): SearchRequest =>
  Object.entries(input).reduce((acc, [key, value]) => {
    if (value === undefined || value === null || value === '') return acc;
    return { ...acc, [key]: value };
  }, {} as SearchRequest);

const toNumberOrDefault = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const emptyPage = (page: number, size: number): PageResult<ProEnterpriseCard> => ({
  content: [],
  totalElements: 0,
  totalPages: 0,
  size,
  number: page,
  first: true,
  last: true,
});

const emptySearchData = (page: number, size: number): MarketplaceSearchData => ({
  pros: emptyPage(page, size),
  enterprises: emptyPage(page, size),
  metadata: {
    appliedQueryTokens: [],
    resolvedSectors: [],
    resolvedSpecializations: [],
  },
});

const toPageResult = <T,>(items: T[], page: number, size: number): PageResult<T> => {
  const safeSize = Math.max(1, size);
  const safePage = Math.max(0, page);
  const totalElements = items.length;
  const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / safeSize);
  const start = safePage * safeSize;
  const end = start + safeSize;
  const content = start < totalElements ? items.slice(start, end) : [];

  return {
    content,
    totalElements,
    totalPages,
    size: safeSize,
    number: safePage,
    first: safePage <= 0,
    last: totalPages === 0 ? true : safePage >= totalPages - 1,
  };
};

const normalizeAllResponse = (
  payload: MarketplaceAllData | undefined,
  page: number,
  size: number,
): MarketplaceSearchData => {
  const pros = Array.isArray(payload?.pros) ? payload.pros : [];
  const enterprises = Array.isArray(payload?.enterprises) ? payload.enterprises : [];

  return {
    pros: toPageResult(pros, page, size),
    enterprises: toPageResult(enterprises, page, size),
    metadata: {
      appliedQueryTokens: [],
      resolvedSectors: [],
      resolvedSpecializations: [],
      rankingVersion: 'all-endpoint',
    },
  };
};

export const hasSearchCriteria = (input: SearchRequest): boolean =>
  SEARCH_FILTER_KEYS.some((key) => {
    const value = input[key];
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  });

const withPublicConfig = (params?: Record<string, unknown>): AxiosRequestConfig => ({
  params,
  skipAuth: true,
});

export const fetchMarketplaceSearch = async (
  input: SearchRequest,
): Promise<MarketplaceSearchData> => {
  const requestParams = normalizeParams({ page: DEFAULT_PAGE, size: DEFAULT_SIZE, ...input });
  const page = toNumberOrDefault(requestParams.page, DEFAULT_PAGE);
  const size = toNumberOrDefault(requestParams.size, DEFAULT_SIZE);

  try {
    if (!hasSearchCriteria(requestParams)) {
      const allResponse =
        (await axiosInstance.get<ApiResponse<MarketplaceAllData>>(
          ALL_ENDPOINT,
          withPublicConfig(),
        )) as unknown as ApiResponse<MarketplaceAllData>;

      if (!allResponse?.success) {
        return emptySearchData(page, size);
      }

      return normalizeAllResponse(allResponse.data, page, size);
    }

    const response =
      (await axiosInstance.get<ApiResponse<MarketplaceSearchData>>(
        SEARCH_ENDPOINT,
        withPublicConfig(requestParams),
      )) as unknown as ApiResponse<MarketplaceSearchData>;

    if (!response?.success || !response?.data) {
      return emptySearchData(page, size);
    }

    return response.data;
  } catch {
    return emptySearchData(page, size);
  }
};

export const fetchSearchSuggestions = async (query: string): Promise<SuggestionsData> => {
  try {
    const response =
      (await axiosInstance.get<ApiResponse<SuggestionsData>>(
        SUGGESTIONS_ENDPOINT,
        withPublicConfig({ query }),
      )) as unknown as ApiResponse<SuggestionsData>;

    if (!response?.success || !response?.data) {
      return {
        query,
        sectors: [],
        specializations: [],
        keywordAliases: [],
      };
    }

    return response.data;
  } catch {
    return {
      query,
      sectors: [],
      specializations: [],
      keywordAliases: [],
    };
  }
};
