import { create } from 'zustand';

/**
 * Global UI Store
 * Manages theme, global modals, and notifications
 */

/**
 * Theme type
 */
export type Theme = 'light' | 'dark';

/**
 * Notification model
 */
export interface Notification {
  id: number;
  type?: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

/**
 * Modal state
 */
export interface ModalState<T = unknown> {
  isOpen: boolean;
  data: T;
}

/**
 * UI Store shape
 */
export interface UIState {
  theme: Theme;
  notifications: Notification[];
  modals: Record<string, ModalState>;

  setTheme: (theme: Theme) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: number) => void;
  openModal: <T = unknown>(modalName: string, data?: T) => void;
  closeModal: (modalName: string) => void;
}

/**
 * Zustand store
 */
export const useUIStore = create<UIState>((set) => ({
  theme: (localStorage.getItem('theme') as Theme) || 'light',
  notifications: [],
  modals: {},

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: Date.now() },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  openModal: (modalName, data = {}) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: { isOpen: true, data },
      },
    })),

  closeModal: (modalName) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: { isOpen: false, data: {} },
      },
    })),
}));
