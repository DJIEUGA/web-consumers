/**
 * useProfileUpdateMutation Hook
 * Handles background profile updates after registration
 * Runs asynchronously without blocking the UX
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  updateStandardProfile, 
  updateProProfile, 
  updateEnterpriseProfile 
} from '../../profile/services/profileApi';
import { 
  UserProfileUpdateDto, 
  ProProfileUpdateDto, 
  EnterpriseProfileUpdateDto 
} from '../../../api/profileEndpoints';

export type ProfileUpdateData = UserProfileUpdateDto | ProProfileUpdateDto | EnterpriseProfileUpdateDto;

/**
 * Hook for background profile updates
 * Does not affect UX — errors are logged but not shown to user
 */
export const useBackgroundProfileUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { role: string; profileData: ProfileUpdateData }) => {
      const { role, profileData } = data;
      
      switch (role) {
        case 'ROLE_CUSTOMER':
          return updateStandardProfile(profileData as UserProfileUpdateDto);
        case 'ROLE_PRO':
          return updateProProfile(profileData as ProProfileUpdateDto);
        case 'ROLE_ENTERPRISE':
          return updateEnterpriseProfile(profileData as EnterpriseProfileUpdateDto);
        default:
          throw new Error(`Unknown role: ${role}`);
      }
    },
    onError: (error: any) => {
      // Log error but don't disrupt UX
      console.warn('Background profile update failed:', error);
      if (error?.response) {
        console.warn('API response:', error.response);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.refetchQueries({
        queryKey: ['profile', 'current'],
        exact: true,
        type: 'active',
      });
    },
  });
};

export default { useBackgroundProfileUpdate };
