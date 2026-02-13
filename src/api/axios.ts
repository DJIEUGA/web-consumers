import axios, { AxiosInstance } from 'axios';

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
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jobty_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (response) => response.data, // Automatically extract ApiResponse.data
  (error) => {
    const originalRequest = error.config;
    
    // Handle Session Expiry
    if (error.response?.status === 401 && !originalRequest._retry) {
      localStorage.removeItem('jobty_token');
      // Optional: window.location.href = '/login?expired=true';
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
