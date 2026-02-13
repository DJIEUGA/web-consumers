/**
 * Profile Update Endpoints
 * Maps to backend PATCH endpoints for different user roles
 */

export const PROFILE_ENDPOINTS = {
  STANDARD: '/profiles/me/standard',      // ROLE_CUSTOMER (Visiteur)
  PRO: '/profiles/me/pro',                 // ROLE_PRO (Freelance)
  ENTERPRISE: '/profiles/me/enterprise',   // ROLE_ENTERPRISE
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
