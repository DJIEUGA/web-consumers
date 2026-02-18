import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
// import { toast } from 'sonner';

import apiClient from '@/api/axios';
import { useUIStore } from '@/stores/ui.store';
import type {
  ApiEnvelope,
  PortfolioItemDto,
  PortfolioRequest,
  PortfolioUpdateRequest,
  PrivateDashboardResponse,
  PublicProfileResponse,
  ServiceDto,
  ServiceRequest,
  ServiceUpdateRequest,
} from '@/types/api';

const PROFILE_ENDPOINTS = {
  PUBLIC: (id: string) => `/api/v1/public/profiles/${id}`,
  ME: '/api/v1/profiles/me',
  SERVICES: '/api/v1/profiles/me/services',
  SERVICE_BY_ID: (serviceId: string) => `/api/v1/profiles/me/services/${serviceId}`,
  PORTFOLIO: '/api/v1/profiles/me/portfolio',
  PORTFOLIO_BY_ID: (portfolioId: string) =>
    `/api/v1/profiles/me/portfolio/${portfolioId}`,
} as const;

export const profileQueryKeys = {
  publicProfile: (id: string) => ['public-profile', id] as const,
  me: ['profile', 'me'] as const,
  services: ['profile', 'me', 'services'] as const,
  portfolio: ['profile', 'me', 'portfolio'] as const,
};

type MutationError = {
  message?: string;
  data?: {
    message?: string;
  };
};

const toEnvelope = <T>(value: unknown): ApiEnvelope<T> => {
  if (value && typeof value === 'object') {
    const asEnvelope = value as ApiEnvelope<T>;
    if ('success' in asEnvelope && 'data' in asEnvelope) {
      return asEnvelope;
    }

    const maybeResponse = value as { data?: ApiEnvelope<T> };
    if (maybeResponse.data && 'success' in maybeResponse.data) {
      return maybeResponse.data;
    }
  }

  throw new Error('Invalid API response envelope');
};

const getErrorMessage = (error: MutationError): string => {
  return error?.data?.message || error?.message || 'Action impossible pour le moment.';
};

const notifySuccess = (message: string) => {
  // toast.success(message);
  useUIStore.getState().addNotification({
    type: 'success',
    title: 'Succès',
    message,
  });
};

const notifyError = (message: string) => {
  // toast.error(message);
  useUIStore.getState().addNotification({
    type: 'error',
    title: 'Erreur',
    message,
  });
};

export const getPublicProfile = async (
  id: string
): Promise<ApiEnvelope<PublicProfileResponse>> => {
  const response = await apiClient.get(PROFILE_ENDPOINTS.PUBLIC(id));
  return toEnvelope<PublicProfileResponse>(response);
};

export const getMyProfile = async (): Promise<ApiEnvelope<PrivateDashboardResponse>> => {
  const response = await apiClient.get(PROFILE_ENDPOINTS.ME);
  return toEnvelope<PrivateDashboardResponse>(response);
};

export const usePublicProfile = (
  id?: string
): UseQueryResult<ApiEnvelope<PublicProfileResponse>, MutationError> => {
  return useQuery({
    queryKey: profileQueryKeys.publicProfile(id || 'unknown'),
    queryFn: () => getPublicProfile(id as string),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
};

export const useMyProfile = (): UseQueryResult<
  ApiEnvelope<PrivateDashboardResponse>,
  MutationError
> => {
  return useQuery({
    queryKey: profileQueryKeys.me,
    queryFn: getMyProfile,
    staleTime: 1000 * 60 * 2,
  });
};

const createService = async (
  payload: ServiceRequest
): Promise<ApiEnvelope<ServiceDto>> => {
  const response = await apiClient.post(PROFILE_ENDPOINTS.SERVICES, payload);
  return toEnvelope<ServiceDto>(response);
};

const updateService = async ({
  serviceId,
  payload,
}: {
  serviceId: string;
  payload: ServiceUpdateRequest;
}): Promise<ApiEnvelope<ServiceDto>> => {
  const response = await apiClient.patch(
    PROFILE_ENDPOINTS.SERVICE_BY_ID(serviceId),
    payload
  );
  return toEnvelope<ServiceDto>(response);
};

const deleteService = async (
  serviceId: string
): Promise<ApiEnvelope<null>> => {
  const response = await apiClient.delete(PROFILE_ENDPOINTS.SERVICE_BY_ID(serviceId));
  return toEnvelope<null>(response);
};

const createPortfolioItem = async (
  payload: PortfolioRequest
): Promise<ApiEnvelope<PortfolioItemDto>> => {
  const response = await apiClient.post(PROFILE_ENDPOINTS.PORTFOLIO, payload);
  return toEnvelope<PortfolioItemDto>(response);
};

const updatePortfolioItem = async ({
  portfolioId,
  payload,
}: {
  portfolioId: string;
  payload: PortfolioUpdateRequest;
}): Promise<ApiEnvelope<PortfolioItemDto>> => {
  const response = await apiClient.patch(
    PROFILE_ENDPOINTS.PORTFOLIO_BY_ID(portfolioId),
    payload
  );
  return toEnvelope<PortfolioItemDto>(response);
};

const deletePortfolioItem = async (
  portfolioId: string
): Promise<ApiEnvelope<null>> => {
  const response = await apiClient.delete(
    PROFILE_ENDPOINTS.PORTFOLIO_BY_ID(portfolioId)
  );
  return toEnvelope<null>(response);
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createService,
    onSuccess: (envelope) => {
      notifySuccess(envelope.message || 'Service créé avec succès.');
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.me });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.services });
    },
    onError: (error: MutationError) => {
      notifyError(getErrorMessage(error));
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateService,
    onSuccess: (envelope) => {
      notifySuccess(envelope.message || 'Service mis à jour avec succès.');
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.me });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.services });
    },
    onError: (error: MutationError) => {
      notifyError(getErrorMessage(error));
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteService,
    onSuccess: (envelope) => {
      notifySuccess(envelope.message || 'Service supprimé.');
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.me });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.services });
    },
    onError: (error: MutationError) => {
      notifyError(getErrorMessage(error));
    },
  });
};

export const useCreatePortfolioItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPortfolioItem,
    onSuccess: (envelope) => {
      notifySuccess(envelope.message || 'Élément portfolio créé avec succès.');
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.me });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.portfolio });
    },
    onError: (error: MutationError) => {
      notifyError(getErrorMessage(error));
    },
  });
};

export const useUpdatePortfolioItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePortfolioItem,
    onSuccess: (envelope) => {
      notifySuccess(envelope.message || 'Élément portfolio mis à jour.');
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.me });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.portfolio });
    },
    onError: (error: MutationError) => {
      notifyError(getErrorMessage(error));
    },
  });
};

export const useDeletePortfolioItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePortfolioItem,
    onSuccess: (envelope) => {
      notifySuccess(envelope.message || 'Élément portfolio supprimé.');
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.me });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.portfolio });
    },
    onError: (error: MutationError) => {
      notifyError(getErrorMessage(error));
    },
  });
};
