import axiosInstance from '../api/axios';
import type { AxiosRequestConfig } from 'axios';

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, any>;
  status?: number;
};

const normalizeError = (error: any): ApiResponse => {
  const errorData = error?.response || {};
  return {
    success: false,
    message: errorData.message || error.message || 'An error occurred',
    errors: errorData.errors || {},
    status: error?.response?.status,
  };
};

export const apiGet = async <T = any>(url: string, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance.get(url, config);
    return { success: true, data: response.data, message: response.data?.message };
  } catch (error) {
    return normalizeError(error);
  }
};

export const apiPost = async <T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance.post(url, data, config);
    return { success: true, data: response.data, message: response.data?.message };
  } catch (error) {
    return normalizeError(error);
  }
};

export const apiPut = async <T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance.put(url, data, config);
    return { success: true, data: response.data, message: response.data?.message };
  } catch (error) {
    return normalizeError(error);
  }
};

export const apiPatch = async <T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance.patch(url, data, config);
    return { success: true, data: response.data, message: response.data?.message };
  } catch (error) {
    return normalizeError(error);
  }
};

export const apiDelete = async <T = any>(url: string, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance.delete(url, config);
    return { success: true, data: response.data, message: response.data?.message };
  } catch (error) {
    return normalizeError(error);
  }
};

export const apiUpload = async <T = any>(url: string, formData: FormData, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' }, ...config });
    return { success: true, data: response.data, message: response.data?.message };
  } catch (error) {
    return normalizeError(error);
  }
};

export default { apiGet, apiPost, apiPut, apiPatch, apiDelete, apiUpload };
