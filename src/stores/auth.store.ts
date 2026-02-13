import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * User roles
 */
export type UserRole = 'ROLE_CUSTOMER' | 'ROLE_PRO' | 'ROLE_ADMIN' | 'ROLE_ENTERPRISE' | 'ROLE_MODERATOR';

/**
 * Authenticated user shape
 * Extend freely as backend grows
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

/**
 * Auth store state
 */
export interface AuthState {
  user: User | null;
  role: string | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setRole: (role: string | null) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  login: (role: string, token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  refreshToken: (token: string) => void;

  getDashboardRoute: (role?: UserRole) => string;
  initializeAuth: () => void;
}

/**
 * Safe localStorage helpers (SSR-friendly)
 */
const storage = {
  get: (key: string) =>
    typeof window !== 'undefined' ? localStorage.getItem(key) : null,
  set: (key: string, value: string) => {
    if (typeof window !== 'undefined') localStorage.setItem(key, value);
  },
  remove: (key: string) => {
    if (typeof window !== 'undefined') localStorage.removeItem(key);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      token: storage.get('jwt_token'),
      isAuthenticated: !!storage.get('jwt_token'),
      isLoading: false,
      error: null,

      setUser: (user) => set({ user: user, error: null }),
      setRole: (role) => set({role: role}),

      setToken: (token) => {
        if (token) {
          storage.set('jwt_token', token);
          set({ token, isAuthenticated: true, error: null });
        } else {
          storage.remove('jwt_token');
          set({ token: null, isAuthenticated: false });
        }
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      login: (role, token) => {
        storage.set('jwt_token', token);
        set({
          role,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: () => {
        storage.remove('jwt_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      refreshToken: (token) => {
        storage.set('jwt_token', token);
        set({ token });
      },

      getDashboardRoute: (role) => {
        const r = role ?? get().user?.role;
        console.log(r)

        switch (r) {
          case 'ROLE_PRO':
            return '/dashboard-freelance';
          case 'ROLE_ADMIN':
            return '/dashboard-admin';
          case 'ROLE_CUSTOMER':
            return '/dashboard-admin';
          default:
            return '/';
        }
      },

      initializeAuth: () => {
        const token = storage.get('jwt_token');
        if (token) {
          set({ token, isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
