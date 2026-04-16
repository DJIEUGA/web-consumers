import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * User roles
 */
export type UserRole =
  | "ROLE_CUSTOMER"
  | "ROLE_PRO"
  | "ROLE_ADMIN"
  | "ROLE_ENTERPRISE"
  | "ROLE_MODERATOR";

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
  username?: string;
}

/**
 * Auth store state
 */
export interface AuthState {
  user: User | null;
  role: string | null;
  token: string | null;
  tokenExpiry: number | null; // Timestamp when token expires
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean; // Track if store has rehydrated from localStorage

  setRole: (role: string | null) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  login: (role: string, token: string, user?: User | null) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  refreshToken: (token: string) => void;
  checkTokenExpiry: () => boolean;

  getPostLoginRoute: (role?: UserRole) => string;
  getDashboardRoute: (role?: UserRole) => string;
  initializeAuth: () => void;
  setHydrated: (hydrated: boolean) => void;
}

/**
 * Safe localStorage helpers (SSR-friendly)
 */
const storage = {
  get: (key: string) =>
    typeof window !== "undefined" ? localStorage.getItem(key) : null,
  set: (key: string, value: string) => {
    if (typeof window !== "undefined") localStorage.setItem(key, value);
  },
  remove: (key: string) => {
    if (typeof window !== "undefined") localStorage.removeItem(key);
  },
};

/**
 * Token expiry duration: 1 hour (in milliseconds)
 */
const TOKEN_EXPIRY_DURATION = 60 * 60 * 1000; // 1 hour

const toStringValue = (value: unknown): string =>
  value === null || value === undefined ? "" : String(value);

const normalizeUser = (
  incomingUser: unknown,
  incomingRole?: string | null,
): User | null => {
  if (!incomingUser || typeof incomingUser !== "object") return null;

  const rawUser = incomingUser as Record<string, unknown>;
  const nestedUser =
    rawUser.user && typeof rawUser.user === "object"
      ? (rawUser.user as Record<string, unknown>)
      : {};

  const id =
    toStringValue(rawUser.id) ||
    toStringValue(rawUser.userId) ||
    toStringValue(nestedUser.id);

  const email =
    toStringValue(rawUser.email) ||
    toStringValue(nestedUser.email);

  const role =
    toStringValue(rawUser.role) ||
    toStringValue(nestedUser.role) ||
    toStringValue(incomingRole);

  if (!id || !email || !role) return null;

  return {
    id,
    email,
    role: role as UserRole,
    firstName:
      toStringValue(rawUser.firstName) ||
      toStringValue(rawUser.prenom) ||
      toStringValue(nestedUser.firstName) ||
      undefined,
    lastName:
      toStringValue(rawUser.lastName) ||
      toStringValue(rawUser.nom) ||
      toStringValue(nestedUser.lastName) ||
      undefined,
    avatar:
      toStringValue(rawUser.avatar) ||
      toStringValue(rawUser.avatarUrl) ||
      toStringValue(nestedUser.avatar) ||
      toStringValue(nestedUser.avatarUrl) ||
      undefined,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      token: storage.get("jwt_token"),
      tokenExpiry: null,
      isAuthenticated: !!storage.get("jwt_token"),
      isLoading: false,
      error: null,
      isHydrated: false,

      setUser: (user) => set({ user: user, error: null }),
      setRole: (role) => set({ role: role }),

      setToken: (token) => {
        if (token) {
          const expiry = Date.now() + TOKEN_EXPIRY_DURATION;
          storage.set("jwt_token", token);
          storage.set("jwt_token_expiry", expiry.toString());
          set({ token, tokenExpiry: expiry, isAuthenticated: true, error: null });
        } else {
          storage.remove("jwt_token");
          storage.remove("jwt_token_expiry");
          set({ token: null, tokenExpiry: null, isAuthenticated: false });
        }
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      login: (role, token, user = null) => {
        const expiry = Date.now() + TOKEN_EXPIRY_DURATION;
        storage.set("jwt_token", token);
        storage.set("jwt_token_expiry", expiry.toString());

        const normalizedUser = normalizeUser(user, role);
        const normalizedRole = normalizedUser?.role || role;

        set({
          role: normalizedRole,
          token,
          tokenExpiry: expiry,
          user: normalizedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      /**
       * Logout - clears all auth data WITHOUT calling API
       * Frontend-only logout to avoid 500 errors from backend
       */
      logout: () => {
        // Clear localStorage
        storage.remove("jwt_token");
        storage.remove("jwt_token_expiry");
        
        // Clear Zustand state
        set({
          user: null,
          role: null,
          token: null,
          tokenExpiry: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      refreshToken: (token) => {
        const expiry = Date.now() + TOKEN_EXPIRY_DURATION;
        storage.set("jwt_token", token);
        storage.set("jwt_token_expiry", expiry.toString());
        set({ token, tokenExpiry: expiry });
      },

      /**
       * Check if token has expired
       * Returns true if token is valid, false if expired
       */
      checkTokenExpiry: () => {
        const state = get();
        const expiryStr = storage.get("jwt_token_expiry");
        
        if (!state.token || !expiryStr) {
          return false;
        }

        const expiry = parseInt(expiryStr, 10);
        const now = Date.now();

        if (now >= expiry) {
          // Token expired - logout
          get().logout();
          return false;
        }

        return true;
      },

      getPostLoginRoute: (role) => {
        const r = role ?? get().user?.role;

        if (!r) return "/";
        if (r === "ROLE_CUSTOMER") return "/marketplace";
        return "/dashboard";
      },

      getDashboardRoute: (role) => {
        const r = role ?? get().user?.role;

        if (!r) return "/";
        return "/dashboard";
      },

      initializeAuth: () => {
        const token = storage.get("jwt_token");
        const expiryStr = storage.get("jwt_token_expiry");

        if (token && expiryStr) {
          const expiry = parseInt(expiryStr, 10);
          const now = Date.now();

          // Check if token is still valid
          if (now < expiry) {
            set({ 
              token, 
              tokenExpiry: expiry,
              isAuthenticated: true,
              isHydrated: true
            });
          } else {
            // Token expired - clean up
            storage.remove("jwt_token");
            storage.remove("jwt_token_expiry");
            set({ 
              token: null, 
              tokenExpiry: null,
              isAuthenticated: false,
              isHydrated: true
            });
          }
        } else {
          // No token found - mark as hydrated
          set({ isHydrated: true });
        }
      },

      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        token: state.token,
        tokenExpiry: state.tokenExpiry,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
    },
  ),
);
