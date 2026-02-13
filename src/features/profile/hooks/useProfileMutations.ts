/**
 * Profile Mutations & Queries
 * TanStack Query hooks for profile operations
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';

import {
  getProfile,
  getProfileById,
  updateProfile,
  uploadAvatar,
  uploadKYC,
  verifyEmail,
  updatePassword,
  deleteAccount,
} from '../services/profileApi';

/**
 * Generic placeholders – replace with real domain types later
 */
type Profile = unknown;
type ApiError = unknown;

/**
 * Fetch current user's profile
 */
export const useProfileQuery = (
  options?: UseQueryOptions<Profile, ApiError>
): UseQueryResult<Profile, ApiError> => {
  return useQuery<Profile, ApiError>({
    queryKey: ['profile', 'current'],
    queryFn: getProfile,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Fetch user profile by ID
 */
export const useProfileByIdQuery = (
  userId?: string,
  options?: UseQueryOptions<Profile, ApiError>
): UseQueryResult<Profile, ApiError> => {
  return useQuery<Profile, ApiError>({
    queryKey: ['profile', userId],
    queryFn: () => getProfileById(userId as string),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Update user profile
 */
export const useUpdateProfileMutation = (
  options?: UseMutationOptions<Profile, ApiError, unknown>
) => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, unknown>({
    mutationFn: updateProfile,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};

/**
 * Upload avatar
 */
export const useUploadAvatarMutation = (
  options?: UseMutationOptions<Profile, ApiError, unknown>
) => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, unknown>({
    mutationFn: uploadAvatar,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
};

/**
 * Upload KYC documents
 */
export const useUploadKYCMutation = (
  options?: UseMutationOptions<Profile, ApiError, unknown>
) => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, unknown>({
    mutationFn: uploadKYC,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
};

/**
 * Verify email
 */
export const useVerifyEmailMutation = (
  options?: UseMutationOptions<Profile, ApiError, unknown>
) => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, unknown>({
    mutationFn: verifyEmail,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
};

/**
 * Change password
 */
export const useChangePasswordMutation = (
  options?: UseMutationOptions<void, ApiError, unknown>
) => {
  return useMutation<void, ApiError, unknown>({
    mutationFn: updatePassword,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
  });
};

/**
 * Delete account
 */
export const useDeleteAccountMutation = (
  options?: UseMutationOptions<void, ApiError, void>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, void>({
    mutationFn: deleteAccount,
    onSuccess: (data, variables, context) => {
      queryClient.clear();
      options?.onSuccess?.(data, variables, context);
    },
  });
};

export default {
  useProfileQuery,
  useProfileByIdQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useUploadKYCMutation,
  useVerifyEmailMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
};
