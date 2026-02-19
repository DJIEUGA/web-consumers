import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '../stores/auth.store';

const BASE_URL = import.meta.env.VITE_API_URL;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': "application/json",
  },
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
});
/**
 * Request Interceptor
 * Injects the Bearer token from localStorage into every outgoing request.
 * Uses 'jwt_token' key to match the auth store persistence
 */
axiosInstance.interceptors.request.use(
  (config) => {
    if (!config.skipAuth) {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Standardizes error handling and catches 401 Unauthorized to trigger logout.
 */
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const originalRequest = error.config;
    const requestUrl = (originalRequest?.url || '').toLowerCase();
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/verify') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/confirm');
    
    // Handle Session Expiry - trigger frontend logout
    // Skip logout for public endpoints (skipAuth=true) to avoid unnecessary redirects
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.skipAuth &&
      !isAuthEndpoint
    ) {
      // Mark request as retried to prevent infinite loops
      originalRequest._retry = true;
      
      // Trigger frontend-only logout (clears token and redirects)
      const authStore = useAuthStore.getState();
      authStore.logout();
    }

    // Return the error envelope for TanStack Query to catch
    return Promise.reject(error.response?.data || { 
      success: false, 
      message: 'Network error occurred',
      status: 500 
    });
  }
);
export default axiosInstance;
