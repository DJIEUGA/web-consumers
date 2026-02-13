// import axiosInstance from './axios';
// import axios from 'axios';
// import { useAuthStore } from '../stores/useAuthStore';
// import { API_ENDPOINTS } from '../utils/constants';

// /**
//  * Response/Request interceptors for axiosInstance
//  */

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = useAuthStore.getState().token;
//     if (token) {
//       // eslint-disable-next-line no-param-reassign
//       config.headers = config.headers || {};
//       // @ts-ignore
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     // @ts-ignore
//     config.headers = config.headers || {};
//     // @ts-ignore
//     config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const status = error.response?.status;
//     const originalRequest = error.config || {};

//     // Attempt refresh on 401 once
//     if (status === 401 && !originalRequest._retry) {
//       // mark retry
//       // @ts-ignore
//       originalRequest._retry = true;
//       try {
//         const baseURL = axiosInstance.defaults.baseURL;
//         const refreshResponse = await axios({
//           method: 'post',
//           url: API_ENDPOINTS.AUTH.REFRESH,
//           baseURL,
//           withCredentials: true,
//         });

//         const newToken = refreshResponse?.data?.data?.token || refreshResponse?.data?.token;
//         if (newToken) {
//           useAuthStore.getState().setToken(newToken);
//           originalRequest.headers = originalRequest.headers || {};
//           originalRequest.headers.Authorization = `Bearer ${newToken}`;
//           return axiosInstance(originalRequest);
//         }
//       } catch (e) {
//         // fallthrough to logout
//       }

//       const authStore = useAuthStore.getState();
//       if (authStore.isAuthenticated) {
//         authStore.logout();
//       }
//       if (typeof window !== 'undefined') window.location.href = '/connexion';
//       return Promise.reject(error);
//     }

//     return Promise.reject(error);
//   },
// );

// export default axiosInstance;
