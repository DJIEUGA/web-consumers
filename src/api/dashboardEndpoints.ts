/**
 * Dashboard Endpoints
 * Centralized dashboard/analytics API endpoint paths
 * 
 * @pattern All paths relative to Axios baseURL (e.g., /api/v1)
 * @author Dashboard Integration - Phase 3 (Metrics)
 */

import { ReactNode } from "react";

/**
 * DASHBOARD_ENDPOINTS
 * Maps to backend dashboard/analytics routes
 * 
 * TODO: Backend team to implement these endpoints
 * Expected data shapes documented in types below
 */
export const DASHBOARD_ENDPOINTS = {
  // Statistics
  STATS_TODAY: '/dashboard/stats/today',
  STATS_MONTH: '/dashboard/stats/month',
  STATS_OVERVIEW: '/pro/dashboard/overview',

  // Transactions
  TRANSACTIONS: '/dashboard/transactions',
  TRANSACTIONS_RECENT: '/dashboard/transactions/recent',
  TRANSACTION_BY_ID: '/dashboard/transactions/:id',

  // Projects
  PROJECTS: '/dashboard/projects',
  PROJECTS_RECENT: '/dashboard/projects/recent',
  PROJECT_BY_ID: '/dashboard/projects/:id',

  // Users (admin/moderator only)
  USERS: '/dashboard/users',
  USER_BY_ID: '/dashboard/users/:id',
  USER_STATS: '/dashboard/users/:id/stats',

  // KYC queue (admin/moderator only)
  KYC_QUEUE: '/dashboard/kyc/queue',
  KYC_VERIFY: '/dashboard/kyc/:id/verify',
  KYC_REJECT: '/dashboard/kyc/:id/reject',

  // Disputes (admin/moderator)
  DISPUTES: '/dashboard/disputes',
  DISPUTE_BY_ID: '/dashboard/disputes/:id',

  // Payments (admin/moderator)
  PAYMENTS: '/dashboard/payments',
  PAYMENT_BY_ID: '/dashboard/payments/:id',

  // Analytics
  ANALYTICS: '/dashboard/analytics',
  ANALYTICS_CHART: '/dashboard/analytics/chart',

  // Alerts
  ALERTS: '/dashboard/alerts',
  ALERTS_UNREAD: '/dashboard/alerts/unread',

  // Services (pro/enterprise)
  SERVICES: '/dashboard/services',
  SERVICE_BY_ID: '/dashboard/services/:id',
  ME_SERVICES: '/profiles/me/services',

  // Posts (pro/enterprise)
  POSTS: '/dashboard/posts',
  POST_BY_ID: '/dashboard/posts/:id',
  ME_PORTFOLIO: '/profiles/me/portfolio',

  // Collaborations (pro/enterprise)
  COLLABORATIONS: '/dashboard/collaborations',
  COLLABORATION_BY_ID: '/dashboard/collaborations/:id',

  // Advertisements (pro/enterprise)
  ADS: '/dashboard/ads',
  AD_BY_ID: '/dashboard/ads/:id',
} as const;

/* ========================================
 * TYPE DEFINITIONS
 * Expected response shapes from backend
 * ======================================== */

/**
 * Stats Today (Real-time dashboard metrics)
 */
export interface StatsTodayDto {
  nouveauxUsers: number;
  nouveauxProjets: number;
  commissions: number;
  satisfaction: number;
  trendUsers: number;
  trendProjets: number;
  trendCommissions: number;
}

/**
 * Stats Month (Monthly overview)
 */
export interface StatsMonthDto {
  usersActifs: number;
  projets: number;
  volume: number;
  contrats: number;
  quotaUsers: number;
  trendProjets: number;
  trendContrats: number;
}

/**
 * Stats Overview (Pro/Enterprise earnings metrics)
 */
export interface StatsOverviewDto {
  gainsTotal: number;
  projetsEnCours: number;
  projetsRealises: number;
  noteMoyenne: number;
  vuesProfile: number;
  messagesNonLus: number;
  messagesRecus?: number;
  favoritesCount?: number;
  ongoingProjects?: DashboardOverviewOngoingProjectDto[];
}

/**
 * Ongoing project item from dashboard overview
 */
export interface DashboardOverviewOngoingProjectDto {
  title: string;
  clientName: string;
  amount: number;
  progressPercentage: number;
  deadlineDescription: string;
}

/**
 * Raw dashboard overview payload returned by backend endpoint
 */
export interface DashboardOverviewApiDataDto {
  totalEarnings: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
  profileViews: number;
  messagesReceived: number;
  favoritesCount: number;
  ongoingProjects: DashboardOverviewOngoingProjectDto[];
}

/**
 * Dashboard Alert
 */
export interface DashboardAlertDto {
  id?: string;
  type: 'success' | 'info' | 'warning' | 'danger';
  message: string;
  timestamp?: string;
}

/**
 * Transaction Record
 */
export interface TransactionDto {
  de: ReactNode;
  vers: ReactNode;
  methode: ReactNode;
  client: ReactNode;
  id: string;
  type: 'depot' | 'retrait' | 'paiement' | 'commission';
  montant: number;
  devise?: string;
  statut: 'en_attente' | 'complete' | 'annule' | 'echoue';
  date: string;
  projet?: string;
  projetId?: string;
  description?: string;
  reference?: string;
}

/**
 * Project Record
 */
export interface ProjectDto {
  id: string;
  titre: string;
  client?: string;
  clientId?: string;
  pays?: string;
  budget: number;
  statut: 'ouvert' | 'en_cours' | 'termine' | 'annule' | 'en_attente';
  candidatures?: number;
  dateCreation: string;
  dateExpiration?: string;
  description?: string;
}

/**
 * User Record (Admin/Moderator view)
 */
export interface DashboardUserDto {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  tel?: string;
  type: 'Pro' | 'Client' | 'Entreprise';
  specialite?: string;
  pays?: string;
  ville?: string;
  statut: 'actif' | 'suspendu' | 'inactif';
  certifie?: boolean;
  kyc?: 'non_verifie' | 'en_attente' | 'verifie' | 'rejete';
  note?: number;
  nbAvis?: number;
  inscrit: string;
  photo?: string;
  stats?: {
    projetsCompletes?: number;
    volumeTotal?: number;
    tauxSucces?: number;
    tauxReponse?: number;
    delaiMoyen?: number;
    messagesEnvoyes?: number;
    projetsEnCours?: number;
  };
  finances?: {
    revenusTotal?: number;
    enAttente?: number;
    paye?: number;
    sequestreActif?: number;
    dernierPaiement?: string;
  };
}

/**
 * KYC Verification Request
 */
export interface KycQueueItemDto {
  id: string;
  userId: string;
  nom: string;
  prenom: string;
  type: 'Pro' | 'Client' | 'Entreprise';
  specialite?: string;
  pays: string;
  typeDoc: string;
  soumis: string;
  delai: string;
  priorite: 'urgent' | 'normal' | 'faible';
  documents?: {
    cniRecto?: string;
    cniVerso?: string;
    selfie?: string;
    passeport?: string;
    permis?: string;
  };
  scoreIA?: number;
  authenticite?: number;
  correspondance?: number;
}

/**
 * Dispute Record
 */
export interface DisputeDto {
  titre: ReactNode;
  ouvertDepuis: ReactNode;
  id: string;
  projet: string;
  projetId: string;
  plaignant: string;
  defendeur: string;
  motif: string;
  montant: number;
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'clos';
  priorite: 'urgent' | 'normal' | 'faible';
  ouvert: string;
}

/**
 * Payment Record
 */
export interface PaymentDto {
  id: string;
  transaction: string;
  user: string;
  userId: string;
  montant: number;
  methode: string;
  statut: 'en_attente' | 'traite' | 'bloque' | 'annule';
  date: string;
  pays: string;
}

/**
 * Service Record (Pro/Enterprise)
 */
export interface ServiceDto {
  image: any;
  active: any;
  description: string;
  deliveryTime: string;
  id: string;
  title: string;
  categorie: string;
  price: number;
  isActive?: 'actif' | 'pause' | 'brouillon';
  views?: number;
  commandes?: number;
}

/**
 * Post/Portfolio Record (Pro/Enterprise)
 */
export interface PostDto {
  type: string;
  medias: any;
  url: string;
  description: ReactNode;
  id: string;
  titre: string;
  categorie?: string;
  date: string;
  likes?: number;
  commentaires?: number;
  statut?: 'publie' | 'brouillon';
}

/**
 * Collaboration Record (Pro/Enterprise)
 */
export interface CollaborationDto {
  clientPhoto: string;
  client: string;
  titre: ReactNode;
  montant: any;
  progression: any;
  prochaineLivraison: any;
  clientImage: any;
  id: string;
  nom: string;
  role: string;
  photo?: string;
  statut: 'actif' | 'inactif' | 'en_attente';
}

/**
 * Advertisement Campaign (Pro/Enterprise)
 */
export interface AdCampaignDto {
  name: string;
  status: string;
  clicks: number;
  ctr: number;
  budgetDepense: any;
  spentBudget: any;
  budgetTotal: any;
  totalBudget: any;
  joursRestants: any;
  daysRemaining: any;
  zone: any;
  motsCles: any;
  keywords: any;
  id: string;
  nom: string;
  type: 'banniere' | 'search' | 'sponsor';
  budget: number;
  depense: number;
  clics: number;
  impressions: number;
  statut: 'actif' | 'pause' | 'termine';
}

/**
 * Analytics Data Point
 */
export interface AnalyticsDataDto {
  date: string;
  vues?: number;
  clics?: number;
  conversions?: number;
  revenus?: number;
  users?: number;
  projets?: number;
}
