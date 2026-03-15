import { useQuery } from '@tanstack/react-query';
import { searchPublicProfiles } from '../services/publicSearchApi';
import type { PublicProfilesSearchRequest } from '../types/search';

export const usePublicProfileSearch = (
  payload: PublicProfilesSearchRequest,
  options?: { enabled?: boolean },
) => {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: ['discoveryPublicProfilesSearch', payload],
    queryFn: () => searchPublicProfiles(payload),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
};
