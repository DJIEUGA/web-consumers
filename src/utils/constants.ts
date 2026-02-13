/**
 * Global Constants
 */

/**
 * API endpoints
 * `as const` ensures literal string types
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/profile',
    SEARCH: '/users/search',
  },
  FREELANCERS: {
    LIST: '/freelancers',
    DETAIL: '/freelancers/:id',
    SEARCH: '/freelancers/search',
  },
} as const;

/**
 * UI-related constants
 */
export const UI_CONSTANTS = {
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

/**
 * User roles (single source of truth)
 */
export const USER_ROLES = {
  USER: 'user',
  FREELANCER: 'freelancer',
  ADMIN: 'admin',
} as const;

/**
 * Derived union type: 'user' | 'freelancer' | 'admin'
 */
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Optional helpers
 */
export const isAdmin = (role?: UserRole): boolean => role === USER_ROLES.ADMIN;
export const isFreelancer = (role?: UserRole): boolean =>
  role === USER_ROLES.FREELANCER;

export default {
  API_ENDPOINTS,
  UI_CONSTANTS,
  USER_ROLES,
};
