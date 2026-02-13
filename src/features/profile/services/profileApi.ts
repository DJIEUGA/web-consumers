/**
 * Profile API Service
 * Handles all user profile-related API calls
 */

import { apiGet, apiPost, apiPut, apiPatch, apiUpload } from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../utils/constants';
import { 
  PROFILE_ENDPOINTS, 
  UserProfileUpdateDto, 
  ProProfileUpdateDto, 
  EnterpriseProfileUpdateDto 
} from '../../../api/profileEndpoints';

/**
 * Generic API response & error placeholders
 * Replace with real types when available
 */
export type ApiResponse<T = unknown> = T;

/**
 * Profile update payload
 * Extend as your domain grows
 */
export type UpdateProfilePayload = Record<string, unknown>;

/**
 * KYC payload (files + metadata)
 */
export type KycPayload = Record<string, File | string | Blob>;

/**
 * Password update payload
 */
export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Get current user's profile
 */
export const getProfile = async (): Promise<ApiResponse> => {
  return apiGet(API_ENDPOINTS.USERS.PROFILE);
};

/**
 * Get profile by user ID
 */
export const getProfileById = async (
  userId: string
): Promise<ApiResponse> => {
  return apiGet(`${API_ENDPOINTS.USERS.LIST}/${userId}`);
};

/**
 * Update user profile
 */
export const updateProfile = async (
  profileData: UpdateProfilePayload
): Promise<ApiResponse> => {
  return apiPut(API_ENDPOINTS.USERS.PROFILE, profileData);
};

/**
 * Upload avatar/profile picture
 */
export const uploadAvatar = async (
  file: File
): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('avatar', file);

  return apiUpload(`${API_ENDPOINTS.USERS.PROFILE}/avatar`, formData);
};

/**
 * Upload KYC documents (for freelancers)
 */
export const uploadKYC = async (
  kycData: KycPayload
): Promise<ApiResponse> => {
  const formData = new FormData();

  Object.entries(kycData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return apiUpload(`${API_ENDPOINTS.USERS.PROFILE}/kyc`, formData);
};

/**
 * Verify email
 */
export const verifyEmail = async (
  token: string
): Promise<ApiResponse> => {
  return apiPost(`${API_ENDPOINTS.USERS.PROFILE}/verify-email`, { token });
};

/**
 * Update password
 */
export const updatePassword = async (
  passwordData: UpdatePasswordPayload
): Promise<ApiResponse> => {
  return apiPost(
    `${API_ENDPOINTS.USERS.PROFILE}/change-password`,
    passwordData
  );
};

/**
 * Delete account
 */
export const deleteAccount = async (
  password: string
): Promise<ApiResponse> => {
  return apiPost(`${API_ENDPOINTS.USERS.PROFILE}/delete`, { password });
};

/**
 * Update standard profile (ROLE_CUSTOMER - Visiteur)
 * PATCH /api/v1/profiles/me/standard
 */
export const updateStandardProfile = async (
  profileData: UserProfileUpdateDto
): Promise<ApiResponse> => {
  return apiPatch(PROFILE_ENDPOINTS.STANDARD, profileData);
};

/**
 * Update professional profile (ROLE_PRO - Freelance)
 * PATCH /api/v1/profiles/me/pro
 */
export const updateProProfile = async (
  profileData: ProProfileUpdateDto
): Promise<ApiResponse> => {
  return apiPatch(PROFILE_ENDPOINTS.PRO, profileData);
};

/**
 * Update enterprise profile (ROLE_ENTERPRISE)
 * PATCH /api/v1/profiles/me/enterprise
 */
export const updateEnterpriseProfile = async (
  profileData: EnterpriseProfileUpdateDto
): Promise<ApiResponse> => {
  return apiPatch(PROFILE_ENDPOINTS.ENTERPRISE, profileData);
};

export default {
  getProfile,
  getProfileById,
  updateProfile,
  uploadAvatar,
  uploadKYC,
  verifyEmail,
  updatePassword,
  deleteAccount,
  updateStandardProfile,
  updateProProfile,
  updateEnterpriseProfile,
};
