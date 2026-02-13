/**
 * Profile Type Definitions
 * All profile-related types and interfaces
 */

/**
 * User roles
 */
export type UserRole = 'user' | 'freelancer' | 'admin';

/**
 * Address information
 */
export interface Address {
  country?: string;
  city?: string;
  state?: string;
}

/**
 * KYC verification details
 */
export interface KYCInfo {
  verified?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
}

/**
 * User profile
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;

  avatar?: string;
  phone?: string;
  bio?: string;

  address?: Address;

  emailVerified?: boolean;
  kyc?: KYCInfo;

  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * API response for profile-related endpoints
 */
export interface ProfileResponse {
  success: boolean;
  data: User;
  message?: string;
  errors?: string[];
}

/**
 * Update profile request payload
 */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  country?: string;
  city?: string;
  state?: string;
}

/**
 * Change password request payload
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Delete account request payload
 */
export interface DeleteAccountRequest {
  password: string;
}

/**
 * KYC upload payload
 */
export interface KYCUpload {
  idDocument: File;
  proofOfAddress?: File;
  idDocumentType?: string;
  idDocumentNumber?: string;
}
