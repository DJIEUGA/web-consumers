import { useQuery } from '@tanstack/react-query';
import { fetchSearchSuggestions } from '../api/marketplaceApi';

export const useSearchSuggestions = (query: string) =>
  useQuery({
    queryKey: ['marketplace-suggestions', query],
    queryFn: () => fetchSearchSuggestions(query),
    enabled: query.trim().length >= 2,
    staleTime: 30_000,
  });
