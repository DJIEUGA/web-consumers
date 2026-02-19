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
  updateStandardProfile,
  updateProProfile,
  updateEnterpriseProfile,
  uploadAvatar,
  uploadKYC,
  verifyEmail,
  updatePassword,
  deleteAccount,
} from '../services/profileApi';

type Profile = unknown;
type ApiError = unknown;
type Variables = unknown;

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
  options?: UseMutationOptions<Profile, ApiError, Variables, unknown>
) => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, Variables, unknown>({
    mutationFn: updateProfile,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      options?.onSuccess?.(data, variables, undefined, undefined);
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables, undefined, undefined);
    },
  });
};

/**
 * Update standard profile (ROLE_CUSTOMER)
 */
export const useUpdateStandardProfileMutation = (
  options?: UseMutationOptions<Profile, ApiError, Variables, unknown>
) => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, Variables, unknown>({
    mutationFn: updateStandardProfile,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      options?.onSuccess?.(data, variables, undefined, undefined);
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables, undefined, undefined);
    },
  });
};

/**
 * Update pro profile (ROLE_PRO)
 */
export const useUpdateProProfileMutation = (
  options?: UseMutationOptions<Profile, ApiError, Variables, unknown>
) => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, Variables, unknown>({
    mutationFn: updateProProfile,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      options?.onSuccess?.(data, variables, undefined, undefined);
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables, undefined, undefined);
    },
  });
};

/**
 * Update enterprise profile (ROLE_ENTERPRISE)
 */
export const useUpdateEnterpriseProfileMutation = (
  options?: UseMutationOptions<Profile, ApiError, Variables, unknown>
) => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, Variables, unknown>({
    mutationFn: updateEnterpriseProfile,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      options?.onSuccess?.(data, variables, undefined, undefined);
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables, undefined, undefined);
    },
  });
};

/**
 * Upload avatar
 */
export const useUploadAvatarMutation = (
  options?: UseMutationOptions<Profile, ApiError, Variables, unknown>
) => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, Variables, unknown>({
    mutationFn: uploadAvatar,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      options?.onSuccess?.(data, variables, undefined, undefined);
    },
  });
};

/**
 * Upload KYC documents
 */
export const useUploadKYCMutation = (
  options?: UseMutationOptions<Profile, ApiError, Variables, unknown>
) => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, Variables, unknown>({
    mutationFn: uploadKYC,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      options?.onSuccess?.(data, variables, undefined, undefined);
    },
  });
};

/**
 * Verify email
 */
export const useVerifyEmailMutation = (
  options?: UseMutationOptions<Profile, ApiError, Variables, unknown>
) => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, Variables, unknown>({
    mutationFn: verifyEmail,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      options?.onSuccess?.(data, variables, undefined, undefined);
    },
  });
};

/**
 * Change password
 */
export const useChangePasswordMutation = (
  options?: UseMutationOptions<Profile, ApiError, Variables, unknown>
) => {
  return useMutation<Profile, ApiError, Variables, unknown>({
    mutationFn: updatePassword,
    onSuccess: (data, variables) => {
      options?.onSuccess?.(data, variables, undefined, undefined);
    },
  });
};

/**
 * Delete account
 */
export const useDeleteAccountMutation = (
  options?: UseMutationOptions<Profile, ApiError, string, unknown>
) => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, string, unknown>({
    mutationFn: deleteAccount,
    onSuccess: (data, variables) => {
      queryClient.clear();
      options?.onSuccess?.(data, variables, undefined, undefined);
    },
  });
};

export default {
  useProfileQuery,
  useProfileByIdQuery,
  useUpdateProfileMutation,
  useUpdateStandardProfileMutation,
  useUpdateProProfileMutation,
  useUpdateEnterpriseProfileMutation,
  useUploadAvatarMutation,
  useUploadKYCMutation,
  useVerifyEmailMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
};
