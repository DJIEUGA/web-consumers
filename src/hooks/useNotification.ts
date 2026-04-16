/**
 * useNotification Hook
 * Simplified Sonner notification API for consistent UX across the app
 */

import { toast } from 'sonner';

export interface NotificationOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Hook for consistent notification handling
 * Provides simplified API over Sonner for common use cases
 */
export const useNotification = () => {
  return {
    /**
     * Show success message
     * @param title - Main message title
     * @param description - Optional detailed message
     * @param options - Toast options
     */
    success: (
      title: string,
      description?: string,
      options?: NotificationOptions
    ) => {
      return toast.success(title, {
        description,
        duration: options?.duration ?? 3000,
        action: options?.action,
      });
    },

    /**
     * Show error message
     * @param title - Main message title
     * @param description - Optional detailed message (e.g., server error)
     * @param options - Toast options
     */
    error: (
      title: string,
      description?: string,
      options?: NotificationOptions
    ) => {
      return toast.error(title, {
        description,
        duration: options?.duration ?? 5000,
        action: options?.action,
      });
    },

    /**
     * Show warning message
     * @param title - Main message title
     * @param description - Optional detailed message
     * @param options - Toast options
     */
    warning: (
      title: string,
      description?: string,
      options?: NotificationOptions
    ) => {
      return toast.warning(title, {
        description,
        duration: options?.duration ?? 4000,
        action: options?.action,
      });
    },

    /**
     * Show info message
     * @param title - Main message title
     * @param description - Optional detailed message
     * @param options - Toast options
     */
    info: (
      title: string,
      description?: string,
      options?: NotificationOptions
    ) => {
      return toast.info(title, {
        description,
        duration: options?.duration ?? 4000,
        action: options?.action,
      });
    },

    /**
     * Show loading message (persistent until dismissed)
     * Returns toast ID for later dismissal
     */
    loading: (title: string, description?: string) => {
      return toast.loading(title, {
        description,
      });
    },

    /**
     * Dismiss a specific toast by ID
     */
    dismiss: (toastId?: string | number) => {
      toast.dismiss(toastId);
    },

    /**
     * Dismiss all toasts
     */
    dismissAll: () => {
      toast.dismiss();
    },

    /**
     * Promise handler - shows loading, then success or error
     * Useful for async operations
     */
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
      },
      options?: NotificationOptions
    ) => {
      return toast.promise(promise, {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      });
    },
  };
};

export default useNotification;
