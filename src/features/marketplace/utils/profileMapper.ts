/**
 * Public Profile Mapper
 * Transforms API response data to card component props
 */

import type { PublicProfile } from '../types/publicProfile.d';

const getActionButtonLabel = (actionButtonType: PublicProfile['actionButtonType']) => {
  const normalized = String(actionButtonType ?? '').trim().toUpperCase();
  
  if (normalized === 'COLLABORATE') return 'Collaborer';
  if (normalized === 'HIRE') return 'Recruter';
  if (normalized === 'CONTACT') return 'Contacter';

  return 'Contacter';
};

/**
 * Transforms a PublicProfile from API to FreelanceCard data structure
 */
export const mapPublicProfileToFreelanceCard = (profile: PublicProfile) => {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  return {
    id: profile.userId,
    username: profile.username || '',
    nom: fullName,
    profession: profile.specialization || 'Professionnel',
    photo: profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`,
    ville: profile.city || '',
    pays: profile.country || '',
    tarifMin: Math.ceil(profile.hourlyRate || 0),
    devise: 'FCFA/H',
    disponible: true,
    verifie: profile.verified,
    note: profile.averageRating || 0,
    skills: profile.topSkills || [],
    projectsCompletes: 0,
    projectsEnCours: 0,
    actionButtonType: profile.actionButtonType,
    actionLabel: getActionButtonLabel(profile.actionButtonType),
  };
};

/**
 * Transforms a PublicProfile from API to EntrepriseCard data structure
 */
export const mapPublicProfileToEnterpriseCard = (profile: PublicProfile) => {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  return {
    id: profile.userId,
    nom: fullName,
    type: 'Entreprise',
    secteurs: profile.sector ? [profile.sector] : [],
    photo: profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`,
    image: profile.avatarUrl || 'https://via.placeholder.com/400',
    note: profile.averageRating || 0,
    isPro: profile.verified,
    description: profile.specialization || '',
    location: `${profile.city || ''}, ${profile.country || ''}`.trim(),
    visitCount: 0,
  };
};

/**
 * Group profiles by type or sector
 */
export const groupProfilesByType = (profiles: PublicProfile[], typeField: keyof PublicProfile) => {
  const grouped: Record<string, PublicProfile[]> = {};

  profiles.forEach(profile => {
    const type = (profile[typeField] as string) || 'Other';
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(profile);
  });

  return grouped;
};

/**
 * Filter profiles by minimum rating
 */
export const filterByRating = (profiles: PublicProfile[], minRating: number): PublicProfile[] => {
  return profiles.filter(p => (p.averageRating || 0) >= minRating);
};

/**
 * Sort profiles by a specific field
 */
export const sortProfiles = (
  profiles: PublicProfile[],
  sortBy: 'rating' | 'recent' | 'price'
): PublicProfile[] => {
  const sorted = [...profiles];

  switch (sortBy) {
    case 'rating':
      return sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    case 'price':
      return sorted.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
    case 'recent':
      return sorted.reverse(); // Assumes API returns newest first
    default:
      return sorted;
  }
};
