import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { useUIStore } from '../../../stores/ui.store';

import {
  getProfile,
  getProfileById,
  updateProfile,
  updateStandardProfile,
  updateProProfile,
  updateEnterpriseProfile,
  uploadAvatar,
  uploadKYC,
  updatePassword,
  deleteAccount,
} from '../services/profileApi';

type Profile = Record<string, any>;
type ApiError = Record<string, any>;
type Variables = unknown;

type MutationResponse = {
  success?: boolean;
  message?: string;
};

const getResponseMessage = (
  response: MutationResponse | undefined,
  fallback: string,
): string => {
  return response?.message || fallback;
};

const getErrorMessage = (error: ApiError): string => {
  return (
    error?.data?.message ||
    error?.message ||
    'Une erreur est survenue. Veuillez reessayer.'
  );
};

const notifySuccess = (message: string) => {
  toast.success(message);
  useUIStore.getState().addNotification({
    type: 'success',
    title: 'Succes',
    message,
  });
};

const notifyError = (message: string) => {
  toast.error(message);
  useUIStore.getState().addNotification({
    type: 'error',
    title: 'Erreur',
    message,
  });
};

const handleMutationFeedback = (
  data: MutationResponse,
  successFallback: string,
  errorFallback: string,
): boolean => {
  if (data?.success === false) {
    notifyError(getResponseMessage(data, errorFallback));
    return false;
  }

  notifySuccess(getResponseMessage(data, successFallback));
  return true;
};

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
export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, Variables, unknown>({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      const isSuccess = handleMutationFeedback(
        data,
        'Profil mis a jour avec succes.',
        'Echec de la mise a jour du profil.',
      );

      if (!isSuccess) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      notifyError(getErrorMessage(error));
    },
  });
};

/**
 * Update standard profile (ROLE_CUSTOMER)
 */
export const useUpdateStandardProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, Variables, unknown>({
    mutationFn: updateStandardProfile,
    onSuccess: (data) => {
      const isSuccess = handleMutationFeedback(
        data,
        'Profil mis a jour avec succes.',
        'Echec de la mise a jour du profil.',
      );

      if (!isSuccess) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      notifyError(getErrorMessage(error));
    },
  });
};

/**
 * Update pro profile (ROLE_PRO)
 */
export const useUpdateProProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, Variables, unknown>({
    mutationFn: updateProProfile,
    onSuccess: (data) => {
      const isSuccess = handleMutationFeedback(
        data,
        'Profil mis a jour avec succes.',
        'Echec de la mise a jour du profil.',
      );

      if (!isSuccess) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      notifyError(getErrorMessage(error));
    },
  });
};

/**
 * Update enterprise profile (ROLE_ENTERPRISE)
 */
export const useUpdateEnterpriseProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, Variables, unknown>({
    mutationFn: updateEnterpriseProfile,
    onSuccess: (data) => {
      const isSuccess = handleMutationFeedback(
        data,
        'Profil mis a jour avec succes.',
        'Echec de la mise a jour du profil.',
      );

      if (!isSuccess) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      notifyError(getErrorMessage(error));
    },
  });
};

/**
 * Upload avatar
 */
export const useUploadAvatarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, Variables, unknown>({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      const isSuccess = handleMutationFeedback(
        data,
        'Avatar mis a jour avec succes.',
        "Impossible de televerser l'avatar.",
      );

      if (!isSuccess) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      notifyError(getErrorMessage(error));
    },
  });
};

/**
 * Upload KYC documents
 */
export const useUploadKYCMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, Variables, unknown>({
    mutationFn: uploadKYC,
    onSuccess: (data) => {
      const isSuccess = handleMutationFeedback(
        data,
        'Documents KYC televerses avec succes.',
        'Impossible de televerser les documents KYC.',
      );

      if (!isSuccess) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      notifyError(getErrorMessage(error));
    },
  });
};

/**
 * Change password
 */
export const useChangePasswordMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, Variables, unknown>({
    mutationFn: updatePassword,
    onSuccess: (data) => {
      const isSuccess = handleMutationFeedback(
        data,
        'Mot de passe mis a jour avec succes.',
        'Impossible de mettre a jour le mot de passe.',
      );

      if (!isSuccess) {
        return;
      }

      // Invalidate profile queries as password change might affect session
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      notifyError(getErrorMessage(error));
    },
  });
};

/**
 * Delete account
 */
export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, string, unknown>({
    mutationFn: deleteAccount,
    onSuccess: (data) => {
      const isSuccess = handleMutationFeedback(
        data,
        'Compte supprime avec succes.',
        'Impossible de supprimer le compte.',
      );

      if (!isSuccess) {
        return;
      }

      queryClient.clear();
    },
    onError: (error) => {
      notifyError(getErrorMessage(error));
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
  useChangePasswordMutation,
  useDeleteAccountMutation,
};
