import axiosInstance from '@/api/axios';
import type { AxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  MarketplaceSearchData,
  PageResult,
  ProEnterpriseCard,
  SearchRequest,
  SuggestionsData,
} from './marketplaceTypes';

const SEARCH_ENDPOINT = '/public/profiles/search';
const SUGGESTIONS_ENDPOINT = '/public/profiles/search/suggestions';

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 12;

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
  page: {
    totalElements: 0,
    totalPages: 0,
    size,
    number: page,
  },
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

const withPublicConfig = (params?: Record<string, unknown>): AxiosRequestConfig => ({
  params,
  skipAuth: true,
});

export const fetchMarketplaceSearch = async (
  input: SearchRequest,
): Promise<MarketplaceSearchData> => {
  // Always include page and size, and pass through all input parameters
  const requestParams = { page: DEFAULT_PAGE, size: DEFAULT_SIZE, ...input };

  const page = toNumberOrDefault(requestParams.page, DEFAULT_PAGE);
  const size = toNumberOrDefault(requestParams.size, DEFAULT_SIZE);

  try {
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
