import { useMutation } from '@tanstack/react-query';
import { apiPost } from '../../../services/apiClient';
import { useAuthStore } from '../../../stores/auth.store';
import { API_ENDPOINTS } from '../../../utils/constants';

/**
 * Login mutation hook
 * Handles user login with email/password
 */
export const useLoginMutation = () => {
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      authStore.setLoading(true);
      
      try {
        const response = await apiPost(API_ENDPOINTS.AUTH.LOGIN, credentials);
        authStore.setLoading(false);

        // If the API returned a normalized error response, throw it so react-query triggers onError
        if (!response.success) {
          const err: any = new Error(response.message || 'Login failed');
          err.response = response;
          err.statusCode = response.status;
          throw err;
        }
        
        return response;
      } catch (error: any) {
        authStore.setLoading(false);
        throw error;
      }
    },
  });
};

/**
 * Register mutation hook
 * Handles user registration with email/password/role
 */
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
      // User is verified immediately from the backend, no need to confirm email.
      return response;
    },
  });
};

/**
 * Logout mutation - Frontend only (no API call)
 * Clears local auth state
 *
 * Note: Does NOT call the API to avoid 500 errors from backend
 * Token expiry is handled automatically by the auth store
 */
export const useLogoutMutation = () => {
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      // Simulate async operation for consistent behavior
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          authStore.logout();
          resolve();
        }, 100);
      });
    },
    onSuccess: () => {
      // State already cleared by authStore.logout()
    },
    onError: () => {
      // Failsafe: always logout even if something goes wrong
      authStore.logout();
    },
  });
};

export default { useLoginMutation, useRegisterMutation, useLogoutMutation };
