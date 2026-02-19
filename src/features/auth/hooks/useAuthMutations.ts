import { useMutation } from '@tanstack/react-query';
import { apiPost } from '../../../services/apiClient';
import {useAuthStore} from '../../../stores/auth.store';
import { API_ENDPOINTS } from '../../../utils/constants';

export const useLoginMutation = () => {
  const authStore = useAuthStore();
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      console.log('[LOGIN] Starting login mutation with credentials:', credentials.email);
      authStore.setLoading(true);
      const response = await apiPost(API_ENDPOINTS.AUTH.LOGIN, credentials);
      authStore.setLoading(false);
      console.log('[LOGIN] API Response:', { success: response.success, hasData: !!response.data, hasToken: !!response.data?.token });
      // If the API returned a normalized error response, throw it so react-query triggers onError
      if (!response.success) {
        console.error('[LOGIN] API returned success=false:', response.message);
        const err: any = new Error(response.message || 'Login failed');
        err.response = response;
        throw err;
      }
      return response;
    },
    onSuccess: (data: any) => {
      console.log('[LOGIN] onSuccess callback fired with data:', { hasData: !!data.data, role: data.data?.role, token: data.data?.token?.substring(0, 20) + '...' });
      if (data.data) {
        const { role, token } = data.data;
        console.log('[LOGIN] Calling authStore.login() with role:', role);
        authStore.login(role, token);
        
        // Debug: Check store state after login
        const state = useAuthStore.getState();
        console.log('[LOGIN] Store state after login:', {
          isAuthenticated: state.isAuthenticated,
          token: state.token?.substring(0, 20) + '...',
          role: state.role,
          isHydrated: state.isHydrated
        });
        
        // Debug: Check localStorage
        console.log('[LOGIN] localStorage check:', {
          jwt_token: localStorage.getItem('jwt_token')?.substring(0, 20) + '...',
          jwt_token_expiry: localStorage.getItem('jwt_token_expiry')
        });
      } else {
        console.warn('[LOGIN] response.data is null/undefined, cannot extract token');
      }
    },
    onError: (error: any) => {
      console.error('[LOGIN] onError fired:', error.message);
      authStore.setError('Login failed. Please try again.');
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

/**
 * Logout mutation - Frontend only (no API call)
 * Clears local auth state and redirects to login
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
      // Already handled by authStore.logout() which redirects to /connexion
      console.log('User logged out successfully (frontend-only)');
    },
    onError: (error: any) => {
      // Failsafe: always logout even if something goes wrong
      console.error('Logout error:', error);
      authStore.logout();
    },
  });
};

export default { useLoginMutation, useRegisterMutation, useLogoutMutation };
