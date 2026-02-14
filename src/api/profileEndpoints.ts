/**
 * Profile Update Endpoints
 * Maps to backend PATCH endpoints for different user roles
 */

/**
 * PROFILE_ENDPOINTS
 * Centralized profile-related endpoint paths. Keep these relative
 * to the configured Axios `baseURL` (do not hardcode host or /api/v1)
 */
export const PROFILE_ENDPOINTS = {
  BASE: '/profiles',
  ME: '/profiles/me',
  BY_ID: '/profiles/:id',

  // Role-specific update endpoints
  STANDARD: '/profiles/me/standard', // ROLE_CUSTOMER (Visiteur)
  PRO: '/profiles/me/pro', // ROLE_PRO (Freelance)
  ENTERPRISE: '/profiles/me/enterprise', // ROLE_ENTERPRISE

  // Common actions
  AVATAR: '/profiles/me/avatar',
  KYC: '/profiles/me/kyc',
  VERIFY_EMAIL: '/auth/confirm',
  CHANGE_PASSWORD: '/auth/password/change',
  DELETE: '/profiles/me/delete',

  // Public listing / search
  SEARCH: '/profiles',
  FOLLOW: '/profiles/:id/follow',
  UNFOLLOW: '/profiles/:id/unfollow',
  BLOCK: '/profiles/:id/block',
  UNBLOCK: '/profiles/:id/unblock',
} as const;

/**
 * UserProfileUpdateDto
 * For ROLE_CUSTOMER profile updates
 */
export interface UserProfileUpdateDto {
  country?: string;
  city?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
}

/**
 * ProProfileUpdateDto
 * For ROLE_PRO (Freelance) profile updates
 */
export interface ProProfileUpdateDto {
  country?: string;
  city?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  skills?: string[];
  hourlyRate?: number;
  latitude?: number;
  longitude?: number;
}

/**
 * EnterpriseProfileUpdateDto
 * For ROLE_ENTERPRISE profile updates
 */
export interface EnterpriseProfileUpdateDto {
  companyName?: string;
  registrationNumber?: string;
  industry?: string;
  websiteUrl?: string;
  description?: string;
  logoUrl?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Additional DTOs (optional) — expand as backend schema requires
 */
export interface FollowActionDto {
  userId: string;
}

export interface ProfileSearchParams {
  query?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}
