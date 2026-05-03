import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import collaborationApi from '../services/collaborationApi';

/**
 * Polling hook to simulate real-time message reception.
 * Periodically checks for new messages in active collaboration spaces
 * and triggers a global UI notification if a new message from another user arrives.
 */
export const useMessagePolling = (intervalMs = 15000) => {
  const { user, isAuthenticated } = useAuthStore();
  const addNotification = useUIStore(state => state.addNotification);
  
  // Store the timestamp of the latest message we've seen for each space
  const lastSeenMap = useRef<Record<string, number>>({});
  
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    
    let isMounted = true;
    let isFirstRun = true;
    
    const pollMessages = async () => {
      try {
        const spaces = await collaborationApi.listMySpaces();
        
        for (const space of spaces) {
          if (!isMounted) break;
          
          const messages = await collaborationApi.listMessages(space.id);
          if (!messages || messages.length === 0) continue;
          
          // Messages are assumed to be chronological
          const latestMsg = messages[messages.length - 1];
          const latestTime = new Date(latestMsg.sentAt).getTime();
          const storedTime = lastSeenMap.current[space.id] || 0;
          
          // Only notify if:
          // 1. It's not the first run (we don't want a barrage of notifications on load)
          // 2. The message is newer than what we've seen
          // 3. The message wasn't sent by the current user
          if (!isFirstRun && latestTime > storedTime && String(latestMsg.senderId) !== String(user.id)) {
            // Determine a display name
            const isCurrentUserCustomer = user.role === 'ROLE_CUSTOMER' || user.role === 'ROLE_ENTERPRISE';
            const senderName = isCurrentUserCustomer ? space.proName : space.customerName;

            addNotification({
              type: 'info',
              title: 'Nouveau message',
              message: `vous avez recu un message de ${senderName || 'Un utilisateur'}`,
              metadata: { spaceId: space.id }
            });
          }
          
          // Update the record
          lastSeenMap.current[space.id] = Math.max(storedTime, latestTime);
        }
        
        isFirstRun = false;
      } catch (error) {
        console.error("Failed to poll messages:", error);
      }
    };
    
    // Initial fetch to set the baseline timestamps
    pollMessages();
    
    const intervalId = setInterval(() => {
      if (isMounted) pollMessages();
    }, intervalMs);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isAuthenticated, user?.id, intervalMs, addNotification]);
};
