import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import apiClient from "@/api/axios";
import { useAuthStore } from "@/stores/auth.store";
import { useUIStore } from "@/stores/ui.store";
import type {
  ApiEnvelope,
  AuthConfirmResponseData,
  ForgotPasswordRequest,
  ForgotPasswordResponseData,
  LoginRequest,
  LoginResponseData,
  ResetPasswordRequest,
  ResetPasswordResponseData,
  RegisterRequest,
  RegisterResponseData,
} from "@/types/api";

const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  CONFIRM: "/auth/confirm",
  FORGOT_PASSWORD: "/auth/password/forgot",
  RESET_PASSWORD: "/auth/password/reset",
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
  if (value && typeof value === "object") {
    const asEnvelope = value as any;

    // If response has success and data, return as-is
    if ("success" in asEnvelope && "data" in asEnvelope) {
      return asEnvelope as ApiEnvelope<T>;
    }

    // If response has success but no data field (e.g., confirmation endpoint)
    // Add empty data object to satisfy ApiEnvelope type
    if ("success" in asEnvelope) {
      return {
        ...asEnvelope,
        data: asEnvelope.data || ({} as T),
      } as ApiEnvelope<T>;
    }

    // Check if response is nested under data property
    const maybeResponse = value as { data?: ApiEnvelope<T> };
    if (maybeResponse.data && "success" in maybeResponse.data) {
      return maybeResponse.data;
    }
  }

  throw new Error("Invalid API response envelope");
};

const getErrorMessage = (error: MutationError): string => {
  return (
    error?.data?.message ||
    error?.message ||
    "Une erreur est survenue. Veuillez réessayer."
  );
};

const notifySuccess = (message: string) => {
  toast.success(message);
  useUIStore.getState().addNotification({
    type: "success",
    title: "Succès",
    message,
  });
};

const notifyError = (message: string) => {
  toast.error(message);
  useUIStore.getState().addNotification({
    type: "error",
    title: "Erreur",
    message,
  });
};

export const login = async (
  payload: LoginRequest,
): Promise<ApiEnvelope<LoginResponseData>> => {
  const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, payload);
  return toEnvelope<LoginResponseData>(response);
};

export const register = async (
  payload: RegisterRequest,
): Promise<ApiEnvelope<RegisterResponseData>> => {
  const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, payload);
  return toEnvelope<RegisterResponseData>(response);
};

export const confirmEmail = async (
  token: string,
): Promise<ApiEnvelope<AuthConfirmResponseData>> => {
  const response = await apiClient.get(AUTH_ENDPOINTS.CONFIRM, {
    params: { token },
  });

  return toEnvelope<AuthConfirmResponseData>(response);
};

export const forgotPassword = async (
  payload: ForgotPasswordRequest,
): Promise<ApiEnvelope<ForgotPasswordResponseData>> => {
  const response = await apiClient.post(
    AUTH_ENDPOINTS.FORGOT_PASSWORD,
    payload,
  );
  return toEnvelope<ForgotPasswordResponseData>(response);
};

export const resetPassword = async (
  payload: ResetPasswordRequest,
): Promise<ApiEnvelope<ResetPasswordResponseData>> => {
  const response = await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, payload);
  return toEnvelope<ResetPasswordResponseData>(response);
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

      notifySuccess(envelope.message || "Connexion réussie.");
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
          "Inscription réussie. Vérifiez votre email pour confirmer votre compte.",
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
      notifySuccess(envelope.message || "Email confirmé avec succès.");
    },
    onError: (error: MutationError) => {
      notifyError(getErrorMessage(error));
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: (envelope) => {
      notifySuccess(
        envelope.message ||
          "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
      );
    },
    onError: (error: MutationError) => {
      notifyError(getErrorMessage(error));
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
    onSuccess: (envelope) => {
      notifySuccess(
        envelope.message || "Mot de passe réinitialisé avec succès.",
      );
    },
    onError: (error: MutationError) => {
      const message = getErrorMessage(error);
      notifyError(message);
      if (
        message === "Cette session de réinitialisation n'est plus active."
      ) {
        setTimeout(() => {
          window.location.href = "/forgot-password";
        }, 1000);
      }
    },
  });
};
