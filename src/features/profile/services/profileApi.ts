/**
 * Profile API Service
 * Handles all user profile-related API calls
 */

import {
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiUpload,
  ApiResponse
} from "../../../services/apiClient";
import {
  PROFILE_ENDPOINTS,
  UserProfileUpdateDto,
  ProProfileUpdateDto,
  EnterpriseProfileUpdateDto,
} from "../../../api/profileEndpoints";

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
  email: string;
  currPwd: string;
  newPwd: string;
}



/**
 * Get current user's profile
 */
export const getProfile = async (): Promise<ApiResponse> => {
  return apiGet(PROFILE_ENDPOINTS.ME);
};

/**
 * Get profile by user ID
 */
export const getProfileById = async (userId: string): Promise<ApiResponse> => {
  const path = PROFILE_ENDPOINTS.BY_ID.replace(":id", userId);
  return apiGet(path);
};

/**
 * Update user profile
 */
export const updateProfile = async (
  profileData: UpdateProfilePayload,
): Promise<ApiResponse> => {
  return apiPut(PROFILE_ENDPOINTS.ME, profileData);
};

/**
 * Upload avatar/profile picture
 */
export const uploadAvatar = async (file: File): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("avatar", file);

  return apiUpload(PROFILE_ENDPOINTS.AVATAR, formData);
};

/**
 * Upload KYC documents (for freelancers)
 */
export const uploadKYC = async (kycData: KycPayload): Promise<ApiResponse> => {
  const formData = new FormData();

  Object.entries(kycData).forEach(([key, value]) => {
    formData.append(key, value as any);
  });

  return apiUpload(PROFILE_ENDPOINTS.KYC, formData);
};

/**
 * Update password
 */
export const updatePassword = async (
  passwordData: UpdatePasswordPayload,
): Promise<ApiResponse> => {
  return apiPatch(PROFILE_ENDPOINTS.CHANGE_PASSWORD, passwordData);
};

/**
 * Delete account
 */
export const deleteAccount = async (password: string): Promise<ApiResponse> => {
  return apiPost(PROFILE_ENDPOINTS.DELETE, { password });
};

/**
 * Update standard profile (ROLE_CUSTOMER - Visiteur)
 * PATCH /api/v1/profiles/me/standard
 */
export const updateStandardProfile = async (
  profileData: UserProfileUpdateDto,
): Promise<ApiResponse> => {
  return apiPatch(PROFILE_ENDPOINTS.STANDARD, profileData);
};

/**
 * Update professional profile (ROLE_PRO - Freelance)
 * PATCH /api/v1/profiles/me/profile/card
 */
export const updateProProfile = async (
  profileData: ProProfileUpdateDto,
): Promise<ApiResponse> => {
  return apiPatch(PROFILE_ENDPOINTS.PRO_CARD, profileData);
};

/**
 * Update enterprise profile (ROLE_ENTERPRISE)
 * PATCH /api/v1/profiles/me/enterprise
 */
export const updateEnterpriseProfile = async (
  profileData: EnterpriseProfileUpdateDto,
): Promise<ApiResponse> => {
  return apiPatch(PROFILE_ENDPOINTS.ENTERPRISE, profileData);
};

export default {
  getProfile,
  getProfileById,
  updateProfile,
  uploadAvatar,
  uploadKYC,
  updatePassword,
  deleteAccount,
  updateStandardProfile,
  updateProProfile,
  updateEnterpriseProfile,
};
