import { useMutation } from '@tanstack/react-query';
import { apiPost } from '../../../services/apiClient';
import {useAuthStore} from '../../../stores/auth.store';
import { API_ENDPOINTS } from '../../../utils/constants';

export const useLoginMutation = () => {
  const authStore = useAuthStore();
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      authStore.setLoading(true);
      const response = await apiPost(API_ENDPOINTS.AUTH.LOGIN, credentials);
      authStore.setLoading(false);
      // If the API returned a normalized error response, throw it so react-query triggers onError
      if (!response.success) {
        const err: any = new Error(response.message || 'Login failed');
        err.response = response;
        throw err;
      }
      return response;
    },
    onSuccess: (data: any) => {
      if (data.data) {
        const { role, token } = data.data;
        authStore.login(role, token);
      }
    },
    onError: (error: any) => {
      authStore.setError('Login failed. Please try again.');
      // Provide richer diagnostics in console
      console.error('Login error:', error);
      if (error?.response) console.error('API response:', error.response);
    },
  });
};

export const useRegisterMutation = () => {
  const authStore = useAuthStore();
  return useMutation({
    mutationFn: async (userData: any) => {
      authStore.setLoading(true);
      const response = await apiPost(API_ENDPOINTS.AUTH.REGISTER, userData);
      authStore.setLoading(false);
      if (!response.success) {
        const err: any = new Error(response.message || 'Registration failed');
        err.response = response;
        throw err;
      }
      // Registration returns ApiResponseVoid (no token, no data field)
      // User must confirm email first via GET /auth/confirm with token from email link
      return response;
    },
    onError: (error: any) => {
      authStore.setError('Registration failed. Please try again.');
      console.error('Register error:', error);
      if (error?.response) console.error('API response:', error.response);
    },
  });
};

export const useLogoutMutation = () => {
  const authStore = useAuthStore();
  return useMutation({
    mutationFn: async () => {
      const response = await apiPost(API_ENDPOINTS.AUTH.LOGOUT);
      if (!response.success) {
        const err: any = new Error(response.message || 'Logout failed');
        err.response = response;
        throw err;
      }
      return response;
    },
    onSuccess: () => authStore.logout(),
    onError: (error: any) => {
      console.error('Logout error:', error);
      if (error?.response) console.error('API response:', error.response);
      authStore.logout();
    },
  });
};

export default { useLoginMutation, useRegisterMutation, useLogoutMutation };
