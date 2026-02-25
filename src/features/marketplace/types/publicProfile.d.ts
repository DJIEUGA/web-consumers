/**
 * Public Profile Types
 * Matches the API response structure from /public/profiles/all endpoint
 */

/**
 * Minimal public profile as returned by the API
 */
export interface PublicProfile {
  userId: string;
  username?: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  specialization: string | null;
  sector: string | null;
  hourlyRate: number;
  averageRating: number;
  reviewCount: number;
  city: string | null;
  country: string | null;
  topSkills: string[];
  premium: boolean;
  verified: boolean;
}

export interface PublicProfilesResponse {
  success: boolean;
  data: PublicProfile[];
  message?: string;
  errors?: Record<string, string>;
}

export interface PaginatedPublicProfilesResponse {
  success: boolean;
  data: {
    content: PublicProfile[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  message?: string;
  errors?: Record<string, string>;
}
