/**
 * Public Profiles API Service
 * Handles all requests to public profile endpoints
 */

import axiosInstance from '../../../api/axios';
import type { PublicProfile, PublicProfilesResponse, PaginatedPublicProfilesResponse } from '../types/publicProfile.d';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
}

const ENDPOINTS = {
  PUBLIC_PROFILES: '/public/profiles/all',
  PUBLIC_PROFILE_BY_ID: '/public/profiles/:userId/details',
} as const;

/**
 * Search and fetch public profiles with optional filtering
 * @param params Query parameters for filtering, sorting, pagination
 */
export const getPublicProfiles = async (params?: {
  page?: number;
  size?: number;
  search?: string;
  sector?: string;
  location?: string;
  minRating?: number;
  skills?: string[];
  sortBy?: 'rating' | 'recent' | 'popularity';
}): Promise<PaginatedPublicProfilesResponse> => {
  const response = await axiosInstance.get<PublicProfilesResponse>(ENDPOINTS.PUBLIC_PROFILES, {
    params,
    skipAuth: true,
  });

  const profiles = Array.isArray(response?.data) ? response.data : [];

  return {
    success: response.data?.success ?? true,
    data: {
      content: profiles,
      totalElements: profiles.length,
      totalPages: 1,
      currentPage: params?.page ?? 0,
      pageSize: params?.size ?? profiles.length,
    },
    message: response.data?.message,
    errors: response.data?.errors,
  };
};

/**
 * Fetch a single public profile by user ID
 * @param userId The user ID of the profile to fetch
 */
export const getPublicProfileById = async (userId: string): Promise<PublicProfilesResponse> => {
  const endpoint = ENDPOINTS.PUBLIC_PROFILE_BY_ID.replace(':userId', userId);
  const response = await axiosInstance.get<PublicProfilesResponse>(endpoint); // Authentication is now required for this endpoint
  return response.data;
};

/**
 * Search public profiles by simple text search
 */
export const searchPublicProfiles = async (query: string): Promise<PaginatedPublicProfilesResponse> => {
  return getPublicProfiles({ search: query });
};

/**
 * Fetch profiles filtered by sector
 */
export const getProfilesBySector = async (
  sector: string,
  pagination?: { page?: number; size?: number }
): Promise<PaginatedPublicProfilesResponse> => {
  return getPublicProfiles({
    sector,
    ...pagination,
  });
};

/**
 * Fetch profiles filtered by location
 */
export const getProfilesByLocation = async (
  location: string,
  pagination?: { page?: number; size?: number }
): Promise<PaginatedPublicProfilesResponse> => {
  return getPublicProfiles({
    location,
    ...pagination,
  });
};

/**
 * Extract profiles from the response
 * @param response The response object
 */
export const extractProfiles = (response: PublicProfilesResponse): PublicProfile[] => {
  const profiles = Array.isArray(response.data) 
    ? response.data 
    : response.data || [];
  return profiles;
};
