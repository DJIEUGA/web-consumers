import { useMutation } from '@tanstack/react-query';
// import { toast } from 'sonner';

import apiClient from '@/api/axios';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import type {
  ApiEnvelope,
  AuthConfirmResponseData,
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  RegisterResponseData,
} from '@/types/api';

const AUTH_ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  CONFIRM: '/api/v1/auth/confirm',
} as const;

type MutationError = {
  message?: string;
  success?: boolean;
  status?: number;
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
  return (
    error?.data?.message ||
    error?.message ||
    'Une erreur est survenue. Veuillez réessayer.'
  );
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

export const login = async (
  payload: LoginRequest
): Promise<ApiEnvelope<LoginResponseData>> => {
  const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, payload);
  return toEnvelope<LoginResponseData>(response);
};

export const register = async (
  payload: RegisterRequest
): Promise<ApiEnvelope<RegisterResponseData>> => {
  const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, payload);
  return toEnvelope<RegisterResponseData>(response);
};

export const confirmEmail = async (
  token: string
): Promise<ApiEnvelope<AuthConfirmResponseData>> => {
  const response = await apiClient.get(AUTH_ENDPOINTS.CONFIRM, {
    params: { token },
  });

  return toEnvelope<AuthConfirmResponseData>(response);
};

export const useLogin = () => {
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: login,
    onMutate: () => {
      authStore.setLoading(true);
      authStore.setError(null);
    },
    onSuccess: (envelope) => {
      const token = envelope.data?.token;
      const user = envelope.data?.user;

      if (token) {
        authStore.setToken(token);
        localStorage.setItem('jobty_token', token);
      }

      if (user) {
        authStore.setUser({
          id: user.id,
          email: user.email,
          role: user.role as any,
          firstName: user.firstName ?? undefined,
          lastName: user.lastName ?? undefined,
          avatar: user.avatarUrl ?? undefined,
        });
        authStore.setRole(user.role);
      }

      notifySuccess(envelope.message || 'Connexion réussie.');
    },
    onError: (error: MutationError) => {
      const message = getErrorMessage(error);
      authStore.setError(message);
      notifyError(message);
    },
    onSettled: () => {
      authStore.setLoading(false);
    },
  });
};

interface RegisterHookOptions {
  onCheckEmail?: (email: string) => void;
}

export const useRegister = (options?: RegisterHookOptions) => {
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: register,
    onMutate: () => {
      authStore.setLoading(true);
      authStore.setError(null);
    },
    onSuccess: (envelope, variables) => {
      notifySuccess(
        envelope.message ||
          'Inscription réussie. Vérifiez votre email pour confirmer votre compte.'
      );
      options?.onCheckEmail?.(envelope.data?.email || variables.email);
    },
    onError: (error: MutationError) => {
      const message = getErrorMessage(error);
      authStore.setError(message);
      notifyError(message);
    },
    onSettled: () => {
      authStore.setLoading(false);
    },
  });
};

export const useConfirmEmail = () => {
  return useMutation({
    mutationFn: confirmEmail,
    onSuccess: (envelope) => {
      notifySuccess(envelope.message || 'Email confirmé avec succès.');
    },
    onError: (error: MutationError) => {
      notifyError(getErrorMessage(error));
    },
  });
};
