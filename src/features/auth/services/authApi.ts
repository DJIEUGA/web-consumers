import { apiGet, apiPost } from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../utils/constants';

export const loginUser = async (email: string, password: string) => apiPost(API_ENDPOINTS.AUTH.LOGIN, { email, password });

export const registerUser = async (userData: any) => apiPost(API_ENDPOINTS.AUTH.REGISTER, userData);

export const logoutUser = async () => apiPost(API_ENDPOINTS.AUTH.LOGOUT);

export const refreshAuthToken = async () => apiPost(API_ENDPOINTS.AUTH.REFRESH);

export const verifySession = async () => apiGet(API_ENDPOINTS.AUTH.VERIFY);

export default { loginUser, registerUser, logoutUser, refreshAuthToken, verifySession };
