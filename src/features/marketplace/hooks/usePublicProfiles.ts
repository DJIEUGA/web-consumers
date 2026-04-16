/**
 * Public Profiles Hooks
 * TanStack Query hooks for fetching and managing public profile data
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { PublicProfile, PaginatedPublicProfilesResponse } from '../types/publicProfile.d';
import {
  getPublicProfiles,
  getPublicProfileById,
  searchPublicProfiles,
  getProfilesBySector,
  getProfilesByLocation,
} from '../services/publicProfilesApi';

/**
 * Hook to fetch paginated public profiles
 */
export const usePublicProfiles = (params?: {
  page?: number;
  size?: number;
  search?: string;
  sector?: string;
  location?: string;
  minRating?: number;
  skills?: string[];
  sortBy?: 'rating' | 'recent' | 'popularity';
  enabled?: boolean;
}): UseQueryResult<PaginatedPublicProfilesResponse, Error> => {
  const { enabled = true, ...queryParams } = params || {};

  return useQuery({
    queryKey: ['publicProfiles', queryParams],
    queryFn: () => getPublicProfiles(queryParams),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

/**
 * Hook to fetch a single public profile by user ID
 */
export const usePublicProfileById = (userId: string): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: ['publicProfile', userId],
    queryFn: () => getPublicProfileById(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook to search public profiles by query
 */
export const useSearchPublicProfiles = (
  query: string,
  options?: { enabled?: boolean; page?: number; size?: number }
): UseQueryResult<PaginatedPublicProfilesResponse, Error> => {
  const { enabled = !!query, page = 0, size = 12 } = options || {};

  return useQuery({
    queryKey: ['searchPublicProfiles', query, page, size],
    queryFn: () => searchPublicProfiles(query),
    enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch profiles by sector
 */
export const usePublicProfilesBySector = (
  sector: string,
  pagination?: { page?: number; size?: number }
): UseQueryResult<PaginatedPublicProfilesResponse, Error> => {
  return useQuery({
    queryKey: ['publicProfilesBySector', sector, pagination],
    queryFn: () => getProfilesBySector(sector, pagination),
    enabled: !!sector,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch profiles by location
 */
export const usePublicProfilesByLocation = (
  location: string,
  pagination?: { page?: number; size?: number }
): UseQueryResult<PaginatedPublicProfilesResponse, Error> => {
  return useQuery({
    queryKey: ['publicProfilesByLocation', location, pagination],
    queryFn: () => getProfilesByLocation(location, pagination),
    enabled: !!location,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
