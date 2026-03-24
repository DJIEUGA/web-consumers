import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchMarketplaceSearch, hasSearchCriteria } from '../api/marketplaceApi';
import type { SearchRequest } from '../api/marketplaceTypes';

export const useMarketplaceSearch = (filters: SearchRequest, enabled = true) =>
  useQuery({
    queryKey: ['marketplace-search', hasSearchCriteria(filters) ? 'search' : 'all', filters],
    queryFn: () => fetchMarketplaceSearch(filters),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });
