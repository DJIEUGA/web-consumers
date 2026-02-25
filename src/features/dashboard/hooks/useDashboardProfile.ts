import { useMemo } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useProfileQuery } from '@/features/profile/hooks/useProfileMutations';
import { DashboardProfile, ROLE_LABELS } from '../types/profile.types';

type ProfilePayload = Record<string, any>;

const toStringValue = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);

const toNumberValue = (value: unknown, defaultValue: number = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

const toBooleanValue = (value: unknown, defaultValue: boolean = false): boolean => {
  if (value === null || value === undefined) return defaultValue;
  return Boolean(value);
};

const getProfilePayload = (profile: unknown): ProfilePayload => {
  if (!profile) return {};
  const dataLevel = (profile as any)?.data ?? profile;
  return ((dataLevel as any)?.data ?? dataLevel) as ProfilePayload;
};

const buildFallbackAvatar = (seed: string): string =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed || 'jobty-user')}`;

const normalizeActionButtonType = (
  value: unknown,
): DashboardProfile['actionButtonType'] => {
  if (value === 0 || value === '0') return 'CONTACT';
  if (value === 1 || value === '1') return 'COLLABORATE';

  const normalized = toStringValue(value).trim().toUpperCase();
  if (normalized === 'CONTACT') return 'CONTACT';
  if (normalized === 'COLLABORATE') return 'COLLABORATE';
  if (normalized === 'HIRE') return 'HIRE';
  return 'CONTACT';
};

export const useDashboardProfile = () => {
  const { user: authUser, role, isAuthenticated } = useAuthStore();
  const { data: profileData, isLoading } = useProfileQuery({
    enabled: isAuthenticated,
    queryKey: ['profile', 'current'],
  });

  const profile = useMemo(() => {
    const payload = getProfilePayload(profileData);

    // Auth store is the source of truth for session identity
    const userId =
      toStringValue(authUser?.id) ||
      toStringValue(payload.userId) ||
      toStringValue(payload.id) ||
      '';
    
    const firstName =
      toStringValue(authUser?.firstName) ||
      toStringValue(payload.firstName) ||
      toStringValue(payload.prenom) ||
      '';

    const lastName =
      toStringValue(authUser?.lastName) ||
      toStringValue(payload.lastName) ||
      toStringValue(payload.nom) ||
      '';

    const username = toStringValue(payload.username) || null;

    const email =
      toStringValue(authUser?.email) ||
      toStringValue(payload.email) ||
      '';

    const userRole =
      toStringValue(authUser?.role) ||
      toStringValue(role) ||
      toStringValue(payload.role) ||
      '';

    // Contact information
    const phoneNumber = toStringValue(payload.phoneNumber) || '';
    const country = toStringValue(payload.country) || toStringValue(payload.pays) || '';
    const city = toStringValue(payload.city) || toStringValue(payload.ville) || '';

    // Professional information
    const description = toStringValue(payload.description) || toStringValue(payload.bio) || '';
    const sector = toStringValue(payload.sector) || toStringValue(payload.secteur) || '';
    const specialization = toStringValue(payload.specialization) || toStringValue(payload.specialite) || '';
    const companyName = toStringValue(payload.companyName) || toStringValue(payload.nomEntreprise) || '';
    const experienceYears = toNumberValue(payload.experienceYears);
    const skills = Array.isArray(payload.skills) ? payload.skills : [];
    const hourlyRate = toNumberValue(payload.hourlyRate);

    // Rating & verification
    const averageRating = toNumberValue(payload.averageRating);
    const reviewCount = toNumberValue(payload.reviewCount);
    const verified = toBooleanValue(payload.verified);
    const kycStatus = (payload.kycStatus || 'NOT_SUBMITTED') as DashboardProfile['kycStatus'];

    // Availability & premium
    const available = toBooleanValue(payload.available, true);
    const premium = toBooleanValue(payload.premium);

    // Action button type
    const actionButtonType = normalizeActionButtonType(payload.actionButtonType);

    // Display fields
    const subtitle =
      companyName ||
      specialization ||
      sector ||
      ROLE_LABELS[userRole] ||
      'Utilisateur';

    const avatarUrl =
      toStringValue(authUser?.avatar) ||
      toStringValue(payload.avatarUrl) ||
      toStringValue(payload.avatar) ||
      buildFallbackAvatar(`${firstName}-${lastName}-${email}`);

    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Utilisateur';

    const dashboardProfile: DashboardProfile = {
      // User identification
      userId,
      firstName: firstName || 'Utilisateur',
      lastName,
      fullName,
      username,
      email,
      role: userRole,
      
      // Contact info
      phoneNumber,
      country,
      city,
      
      // Professional info
      description,
      sector,
      specialization,
      experienceYears,
      skills,
      hourlyRate,
      
      // Rating & verification
      averageRating,
      reviewCount,
      verified,
      kycStatus,
      
      // Availability & premium
      available,
      premium,
      
      // Display fields
      avatarUrl,
      actionButtonType,
      subtitle,
    };

    return dashboardProfile;
  }, [authUser, profileData, role]);

  return {
    profile,
    isLoading,
  };
};

export default useDashboardProfile;
