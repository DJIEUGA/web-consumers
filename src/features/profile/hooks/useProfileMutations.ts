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
import { useAuthStore } from '../../../stores/auth.store';

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

type MutationContext = {
  previousProfile?: Profile;
};

const toStringValue = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value).trim();

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

const persistAvatarToAuthStore = (variables: unknown, responseData?: unknown) => {
  const source = isObjectRecord(variables)
    ? variables
    : isObjectRecord(responseData)
      ? responseData
      : null;

  if (!source) return;

  const nestedData = isObjectRecord(source.data)
    ? (source.data as Record<string, unknown>)
    : null;

  const avatarCandidate =
    toStringValue(source.avatarUrl) ||
    toStringValue(source.avatar) ||
    toStringValue(nestedData?.avatarUrl) ||
    toStringValue(nestedData?.avatar) ||
    '';

  if (!avatarCandidate) return;

  useAuthStore.getState().updateUser({ avatar: avatarCandidate });
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

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const patchCurrentProfileCache = (
  current: Profile | undefined,
  patch: Record<string, unknown>,
): Profile | undefined => {
  if (!current || !isObjectRecord(current) || !Object.keys(patch).length) {
    return current;
  }

  const hasLevelOneData = isObjectRecord(current.data);
  const levelOne = hasLevelOneData
    ? (current.data as Record<string, unknown>)
    : (current as Record<string, unknown>);

  const hasLevelTwoData = isObjectRecord(levelOne.data);
  const levelTwo = hasLevelTwoData
    ? (levelOne.data as Record<string, unknown>)
    : levelOne;

  const mergedPayload = {
    ...levelTwo,
    ...patch,
  };

  if (hasLevelTwoData) {
    const nextLevelOne = {
      ...levelOne,
      data: mergedPayload,
    };

    if (hasLevelOneData) {
      return {
        ...(current as Record<string, unknown>),
        data: nextLevelOne,
      } as Profile;
    }

    return nextLevelOne as Profile;
  }

  if (hasLevelOneData) {
    return {
      ...(current as Record<string, unknown>),
      data: mergedPayload,
    } as Profile;
  }

  return mergedPayload as Profile;
};

const applyOptimisticProfilePatch = async (
  queryClient: ReturnType<typeof useQueryClient>,
  variables: unknown,
): Promise<MutationContext> => {
  await queryClient.cancelQueries({
    queryKey: ['profile', 'current'],
    exact: true,
  });

  const previousProfile = queryClient.getQueryData<Profile>(['profile', 'current']);

  if (isObjectRecord(variables)) {
    queryClient.setQueryData<Profile | undefined>(['profile', 'current'], (current) =>
      patchCurrentProfileCache(current, variables),
    );
  }

  return { previousProfile };
};

const refreshProfileQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['profile'] });
  queryClient.refetchQueries({
    queryKey: ['profile', 'current'],
    exact: true,
    type: 'active',
  });
};

export const useProfileQuery = (
  options?: UseQueryOptions<Profile, ApiError>
): UseQueryResult<Profile, ApiError> => {
  return useQuery<Profile, ApiError>({
    queryKey: ['profile', 'current'],
    queryFn: getProfile,
    staleTime: 0,
    refetchOnMount: true,
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

  return useMutation<Profile, ApiError, Variables, MutationContext>({
    mutationFn: updateProfile,
    onMutate: (variables) => applyOptimisticProfilePatch(queryClient, variables),
    onSuccess: (data, variables) => {
      const isSuccess = handleMutationFeedback(
        data,
        'Profil mis a jour avec succes.',
        'Echec de la mise a jour du profil.',
      );

      if (!isSuccess) {
        return;
      }

      persistAvatarToAuthStore(variables, data);
      refreshProfileQueries(queryClient);
    },
    onError: (error, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile', 'current'], context.previousProfile);
      }
      notifyError(getErrorMessage(error));
    },
  });
};

/**
 * Update standard profile (ROLE_CUSTOMER)
 */
export const useUpdateStandardProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, Variables, MutationContext>({
    mutationFn: updateStandardProfile,
    onMutate: (variables) => applyOptimisticProfilePatch(queryClient, variables),
    onSuccess: (data, variables) => {
      const isSuccess = handleMutationFeedback(
        data,
        'Profil mis a jour avec succes.',
        'Echec de la mise a jour du profil.',
      );

      if (!isSuccess) {
        return;
      }

      persistAvatarToAuthStore(variables, data);
      refreshProfileQueries(queryClient);
    },
    onError: (error, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile', 'current'], context.previousProfile);
      }
      notifyError(getErrorMessage(error));
    },
  });
};

/**
 * Update pro profile (ROLE_PRO)
 */
export const useUpdateProProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, Variables, MutationContext>({
    mutationFn: updateProProfile,
    onMutate: (variables) => applyOptimisticProfilePatch(queryClient, variables),
    onSuccess: (data, variables) => {
      const isSuccess = handleMutationFeedback(
        data,
        'Profil mis a jour avec succes.',
        'Echec de la mise a jour du profil.',
      );

      if (!isSuccess) {
        return;
      }

      persistAvatarToAuthStore(variables, data);
      refreshProfileQueries(queryClient);
    },
    onError: (error, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile', 'current'], context.previousProfile);
      }
      notifyError(getErrorMessage(error));
    },
  });
};

/**
 * Update enterprise profile (ROLE_ENTERPRISE)
 */
export const useUpdateEnterpriseProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Profile, ApiError, Variables, MutationContext>({
    mutationFn: updateEnterpriseProfile,
    onMutate: (variables) => applyOptimisticProfilePatch(queryClient, variables),
    onSuccess: (data, variables) => {
      const isSuccess = handleMutationFeedback(
        data,
        'Profil mis a jour avec succes.',
        'Echec de la mise a jour du profil.',
      );

      if (!isSuccess) {
        return;
      }

      persistAvatarToAuthStore(variables, data);
      refreshProfileQueries(queryClient);
    },
    onError: (error, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile', 'current'], context.previousProfile);
      }
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

      refreshProfileQueries(queryClient);
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

      refreshProfileQueries(queryClient);
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

      refreshProfileQueries(queryClient);
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
