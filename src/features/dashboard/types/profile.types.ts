/**
 * Dashboard Profile Types
 * Type definitions for profile data used in dashboard views
 * Maps to /api/v1/profiles/me response structure
 */

/**
 * Profile API Response (from /api/v1/profiles/me)
 * This represents the raw structure returned by the backend
 */
export interface ProfileApiResponse {
  userId: string;
  firstName: string;
  lastName: string;
  username: string | null;
  email: string;
  role: string;
  phoneNumber: number | string;
  country: string;
  city: string;
  description: string;
  sector: string;
  specialization: string;
  experienceYears: number;
  skills: string[];
  hourlyRate: number;
  averageRating: number;
  reviewCount: number;
  avatarUrl: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_SUBMITTED';
  actionButtonType: 'CONTACT' | 'COLLABORATE' | 'HIRE';
  verified: boolean;
  available: boolean;
  premium: boolean;
}

/**
 * Dashboard Profile
 * Normalized profile structure used across dashboard components
 */
export interface DashboardProfile {
  // User identification
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string | null;
  email: string;
  role: string;
  
  // Contact info
  phoneNumber: string;
  country: string;
  city: string;
  
  // Professional info
  description: string;
  sector: string;
  specialization: string;
  experienceYears: number;
  skills: string[];
  hourlyRate: number;
  
  // Rating & verification
  averageRating: number;
  reviewCount: number;
  verified: boolean;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_SUBMITTED';
  
  // Availability & premium
  available: boolean;
  premium: boolean;
  
  // Display fields
  avatarUrl: string;
  actionButtonType: 'CONTACT' | 'COLLABORATE' | 'HIRE';
  subtitle: string; // Computed field: specialization or sector or role label
}

/**
 * Card Form State
 * Form state for professional card editing
 */
export interface ProCardFormState {
  photo: string;
  nom: string;
  prenom: string;
  secteur: string;
  specialite: string;
  ville: string;
  pays: string;
  tarifHoraire: number;
  tags: string[];
  disponible: boolean;
  typeBouton: 'contacter' | 'collaborer';
}

/**
 * Freelance Card Data
 * Extended card data with additional UI fields
 */
export interface FreelanceCardData extends ProCardFormState {
  id: string | number;
  note: number;
  nbAvis: number;
  verified: boolean;
  plan: 'gratuit' | 'premium';
}

/**
 * Role Labels
 */
export const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN: 'Administrateur',
  ROLE_MODERATOR: 'Modérateur',
  ROLE_PRO: 'Freelance',
  ROLE_ENTERPRISE: 'Entreprise',
  ROLE_CUSTOMER: 'Client',
} as const;

/**
 * KYC Status Labels
 */
export const KYC_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  VERIFIED: 'Vérifié',
  REJECTED: 'Rejeté',
  NOT_SUBMITTED: 'Non soumis',
} as const;

/**
 * Action Button Type Labels
 */
export const ACTION_BUTTON_LABELS: Record<string, string> = {
  CONTACT: 'Contacter',
  COLLABORATE: 'Collaborer',
  HIRE: 'Recruter',
} as const;
