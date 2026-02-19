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
    // @ts-ignore
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
  (response) => {
    console.log('[AXIOS] Response interceptor - full response:', {
      status: response.status,
      url: response.config.url,
      dataIsArray: Array.isArray(response.data),
      dataType: typeof response.data,
      dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
      data: response.data
    });
    return response.data; // Automatically extract ApiResponse.data
  },
  (error) => {
    console.error('[AXIOS] Error interceptor caught:', {
      status: error.response?.status,
      url: error.config?.url,
      skipAuth: error.config?.skipAuth,
      errorData: error.response?.data
    });
    
    const originalRequest = error.config;
    
    // Handle Session Expiry - trigger frontend logout
    // Skip logout for public endpoints (skipAuth=true) to avoid unnecessary redirects
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      // @ts-ignore
      !originalRequest.skipAuth
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
