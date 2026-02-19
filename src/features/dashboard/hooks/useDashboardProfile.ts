import { useMemo } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useProfileQuery } from '@/features/profile/hooks/useProfileMutations';

type ProfilePayload = Record<string, any>;

const roleLabel: Record<string, string> = {
  ROLE_ADMIN: 'Administrateur',
  ROLE_MODERATOR: 'Modérateur',
  ROLE_PRO: 'Freelance',
  ROLE_ENTERPRISE: 'Entreprise',
  ROLE_CUSTOMER: 'Client',
};

const toStringValue = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);

const getProfilePayload = (profile: unknown): ProfilePayload => {
  if (!profile) return {};
  const dataLevel = (profile as any)?.data ?? profile;
  return ((dataLevel as any)?.data ?? dataLevel) as ProfilePayload;
};

const buildFallbackAvatar = (seed: string): string =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed || 'jobty-user')}`;

export const useDashboardProfile = () => {
  const { user, role, isAuthenticated } = useAuthStore();
  const { data: profileData, isLoading } = useProfileQuery({
    enabled: isAuthenticated,
    queryKey: ['profile', 'current'],
  });

  const profile = useMemo(() => {
    const payload = getProfilePayload(profileData);
    const userPayload = (payload.user as Record<string, unknown>) || {};

    const firstName =
      toStringValue(userPayload.firstName) ||
      toStringValue(payload.firstName) ||
      toStringValue(payload.prenom) ||
      user?.firstName ||
      '';

    const lastName =
      toStringValue(userPayload.lastName) ||
      toStringValue(payload.lastName) ||
      toStringValue(payload.nom) ||
      user?.lastName ||
      '';

    const email =
      toStringValue(userPayload.email) ||
      toStringValue(payload.email) ||
      user?.email ||
      '';

    const specialization =
      toStringValue(payload.specialization) || toStringValue(payload.specialite);

    const companyName =
      toStringValue(payload.companyName) || toStringValue(payload.nomEntreprise);

    const sector = toStringValue(payload.sector) || toStringValue(payload.secteur);
    const city = toStringValue(payload.city) || toStringValue(payload.ville);
    const country = toStringValue(payload.country) || toStringValue(payload.pays);

    const subtitle =
      companyName ||
      specialization ||
      sector ||
      roleLabel[role || user?.role || ''] ||
      'Utilisateur';

    const avatarUrl =
      toStringValue(payload.avatarUrl) ||
      toStringValue(payload.avatar) ||
      toStringValue(userPayload.avatarUrl) ||
      toStringValue(userPayload.avatar) ||
      user?.avatar ||
      buildFallbackAvatar(`${firstName}-${lastName}-${email}`);

    return {
      firstName: firstName || 'Utilisateur',
      lastName,
      fullName: [firstName, lastName].filter(Boolean).join(' ') || 'Utilisateur',
      email,
      subtitle,
      avatarUrl,
      specialization,
      companyName,
      sector,
      city,
      country,
    };
  }, [profileData, role, user]);

  return {
    profile,
    isLoading,
  };
};

export default useDashboardProfile;
