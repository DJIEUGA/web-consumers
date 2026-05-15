import { useMutation } from '@tanstack/react-query';
import { collaborationService } from '../services/collaboration.service';
import type { FcmTokenRequest } from '../services/collaborationApi';

/**
 * Register or deregister a device's FCM token with the backend.
 * Call registerToken() after the user logs in or when the browser grants notification permission.
 * Call deregisterToken() on logout.
 */
export function useFcmRegistration() {
  const registerToken = useMutation({
    mutationFn: (payload: FcmTokenRequest) => collaborationService.registerFcmToken(payload),
  });

  const deregisterToken = useMutation({
    mutationFn: (token: string) => collaborationService.deregisterFcmToken(token),
  });

  return { registerToken, deregisterToken };
}
