/**
 * Dashboard Data Services
 * API calls for dashboard metrics, transactions, projects, etc.
 * 
 * @pattern Returns data wrapped in simple success response shape
 * @status Backend endpoints NOT YET IMPLEMENTED - returns mock data
 */

import axios from '../../../api/axios';
import {
  DASHBOARD_ENDPOINTS,
  type StatsTodayDto,
  type StatsMonthDto,
  type StatsOverviewDto,
  type DashboardAlertDto,
  type TransactionDto,
  type ProjectDto,
  type DashboardUserDto,
  type KycQueueItemDto,
  type DisputeDto,
  type PaymentDto,
  type ServiceDto,
  type PostDto,
  type CollaborationDto,
  type AdCampaignDto,
  type AnalyticsDataDto,
} from '../../../api/dashboardEndpoints';

// Simple response wrapper for dashboard endpoints
interface DashboardResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/* ========================================
 * STATISTICS
 * ======================================== */

/**
 * Fetch today's real-time stats
 * @admin @moderator
 */
export async function fetchStatsToday(): Promise<DashboardResponse<StatsTodayDto>> {
  // TODO: Backend to implement GET /dashboard/stats/today
  // For now, return mock data wrapped in ApiResponse shape
  return {
    success: true,
    data: {
      nouveauxUsers: 127,
      nouveauxProjets: 45,
      commissions: 124500,
      satisfaction: 4.8,
      trendUsers: 23,
      trendProjets: 18,
      trendCommissions: 12,
    },
    message: 'Mock data - backend not implemented',
  };
}

/**
 * Fetch monthly stats overview
 * @admin @moderator
 */
export async function fetchStatsMonth(): Promise<DashboardResponse<StatsMonthDto>> {
  // TODO: Backend to implement GET /dashboard/stats/month
  return {
    success: true,
    data: {
      usersActifs: 2340,
      projets: 890,
      volume: 3200000,
      contrats: 234,
      quotaUsers: 78,
      trendProjets: 45,
      trendContrats: 32,
    },
    message: 'Mock data - backend not implemented',
  };
}

/**
 * Fetch user stats overview (pro/enterprise)
 * @pro @enterprise
 */
export async function fetchStatsOverview(): Promise<DashboardResponse<StatsOverviewDto>> {
  // TODO: Backend to implement GET /dashboard/stats/overview
  return {
    success: true,
    data: {
      gainsTotal: 425000,
      projetsEnCours: 3,
      projetsRealises: 23,
      noteMoyenne: 4.9,
      vuesProfile: 1234,
      messagesNonLus: 5,
    },
    message: 'Mock data - backend not implemented',
  };
}

/* ========================================
 * ALERTS
 * ======================================== */

/**
 * Fetch dashboard alerts
 * @all-roles
 */
export async function fetchAlerts(): Promise<DashboardResponse<DashboardAlertDto[]>> {
  // TODO: Backend to implement GET /dashboard/alerts
  return {
    success: true,
    data: [
      { type: 'warning', message: '12 litiges en attente de résolution' },
      { type: 'danger', message: '3 paiements bloqués depuis +48h' },
      { type: 'info', message: '8 vérifications KYC en attente' },
      { type: 'success', message: 'Pic d\'activité inhabituel détecté (Nigeria +340%)' },
    ],
    message: 'Mock data - backend not implemented',
  };
}

/* ========================================
 * TRANSACTIONS
 * ======================================== */

/**
 * Fetch recent transactions
 * @all-roles
 */
export async function fetchTransactions(): Promise<DashboardResponse<TransactionDto[]>> {
  // TODO: Backend to implement GET /dashboard/transactions/recent
  return {
    success: true,
    data: [
      {
          id: 'TX-001',
          type: 'depot',
          montant: 50000,
          statut: 'complete',
          date: '05/01/2025',
          description: 'Dépôt via Mobile Money',
          client: undefined,
          de: '',
          vers: '',
          methode: ''
      },
      {
          id: 'TX-002',
          type: 'paiement',
          montant: 125000,
          statut: 'en_attente',
          date: '04/01/2025',
          projet: 'App mobile e-commerce',
          client: undefined,
          de: '',
          vers: '',
          methode: ''
      },
    ],
    message: 'Mock data - backend not implemented',
  };
}

/* ========================================
 * PROJECTS
 * ======================================== */

/**
 * Fetch recent projects
 * @all-roles
 */
export async function fetchProjects(): Promise<DashboardResponse<ProjectDto[]>> {
  // TODO: Backend to implement GET /dashboard/projects/recent
  return {
    success: true,
    data: [
      {
        id: 'P-123',
        titre: 'App mobile e-commerce',
        client: 'Kofi Asante',
        clientId: 'USER-456',
        pays: 'Ghana',
        budget: 2500000,
        statut: 'ouvert',
        candidatures: 3,
        dateCreation: '02/01/2025',
      },
      {
        id: 'P-122',
        titre: 'Site vitrine',
        client: 'Fatima Kouassi',
        clientId: 'USER-67890',
        pays: 'Côte d\'Ivoire',
        budget: 500000,
        statut: 'en_cours',
        candidatures: 1,
        dateCreation: '01/01/2025',
      },
    ],
    message: 'Mock data - backend not implemented',
  };
}

/* ========================================
 * USERS (Admin/Moderator)
 * ======================================== */

/**
 * Fetch user list
 * @admin @moderator
 */
export async function fetchUsers(): Promise<DashboardResponse<DashboardUserDto[]>> {
  // TODO: Backend to implement GET /dashboard/users
  return {
    success: true,
    data: [
      {
        id: 'USER-12345',
        nom: 'Diallo',
        prenom: 'Amadou',
        email: 'amadou.diallo@email.com',
        tel: '+221 77 123 45 67',
        type: 'Pro',
        specialite: 'Développeur',
        pays: 'Sénégal',
        ville: 'Dakar',
        statut: 'actif',
        certifie: true,
        kyc: 'verifie',
        note: 4.9,
        nbAvis: 18,
        inscrit: '12/01/2025',
        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amadou',
        stats: {
          projetsCompletes: 23,
          volumeTotal: 2300000,
          tauxSucces: 92,
          tauxReponse: 98,
          delaiMoyen: 2.3,
          messagesEnvoyes: 234,
          projetsEnCours: 3,
        },
        finances: {
          revenusTotal: 2345000,
          enAttente: 125000,
          paye: 2220000,
          sequestreActif: 125000,
          dernierPaiement: '03/01/2025',
        },
      },
      {
        id: 'USER-67890',
        nom: 'Kouassi',
        prenom: 'Fatima',
        email: 'fatima.k@email.com',
        tel: '+225 07 12 34 56',
        type: 'Client',
        pays: 'Côte d\'Ivoire',
        ville: 'Abidjan',
        statut: 'suspendu',
        certifie: false,
        kyc: 'en_attente',
        note: 4.2,
        nbAvis: 5,
        inscrit: '08/01/2025',
        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
      },
    ],
    message: 'Mock data - backend not implemented',
  };
}

/* ========================================
 * KYC QUEUE (Admin/Moderator)
 * ======================================== */

/**
 * Fetch KYC verification queue
 * @admin @moderator
 */
export async function fetchKycQueue(): Promise<DashboardResponse<KycQueueItemDto[]>> {
  // TODO: Backend to implement GET /dashboard/kyc/queue
  return {
    success: true,
    data: [
      {
        id: 'KYC-7821',
        userId: 'USER-98765',
        nom: 'Mohammed',
        prenom: 'Ibrahim',
        type: 'Pro',
        specialite: 'Développeur',
        pays: 'Nigeria',
        typeDoc: 'CNI + Selfie',
        soumis: '03/01/2025',
        delai: '48h',
        priorite: 'urgent',
        documents: {
          cniRecto: '/docs/cni_recto.jpg',
          cniVerso: '/docs/cni_verso.jpg',
          selfie: '/docs/selfie.jpg',
        },
        scoreIA: 87,
        authenticite: 92,
        correspondance: 89,
      },
      {
        id: 'KYC-7822',
        userId: 'USER-11111',
        nom: 'Bah',
        prenom: 'Aïcha',
        type: 'Pro',
        specialite: 'Designer',
        pays: 'Sénégal',
        typeDoc: 'Passeport',
        soumis: '04/01/2025',
        delai: '12h',
        priorite: 'normal',
      },
    ],
    message: 'Mock data - backend not implemented',
  };
}

/* ========================================
 * DISPUTES (Admin/Moderator)
 * ======================================== */

/**
 * Fetch dispute/litigation list
 * @admin @moderator
 */
export async function fetchDisputes(): Promise<DashboardResponse<DisputeDto[]>> {
  // TODO: Backend to implement GET /dashboard/disputes
  return {
    success: true,
    data: [
      {
          id: 'L-789',
          projet: 'App mobile e-commerce',
          projetId: 'P-123',
          plaignant: 'Kofi Asante',
          defendeur: 'Amadou Diallo',
          motif: 'Retard de livraison',
          montant: 1250000,
          statut: 'ouvert',
          priorite: 'urgent',
          ouvert: '03/01/2025',
          titre: '',
          ouvertDepuis: ''
      },
    ],
    message: 'Mock data - backend not implemented',
  };
}

/* ========================================
 * PAYMENTS (Admin/Moderator)
 * ======================================== */

/**
 * Fetch payment queue
 * @admin @moderator
 */
export async function fetchPayments(): Promise<DashboardResponse<PaymentDto[]>> {
  // TODO: Backend to implement GET /dashboard/payments
  return {
    success: true,
    data: [
      {
        id: 'PAY-456',
        transaction: 'TX-789',
        user: 'Amadou Diallo',
        userId: 'USER-12345',
        montant: 125000,
        methode: 'Mobile Money',
        statut: 'traite',
        date: '03/01/2025',
        pays: 'Sénégal',
      },
    ],
    message: 'Mock data - backend not implemented',
  };
}

/* ========================================
 * SERVICES (Pro/Enterprise)
 * ======================================== */

/**
 * Fetch user services
 * @pro @enterprise
 */
export async function fetchServices(): Promise<DashboardResponse<ServiceDto[]>> {
  // TODO: Backend to implement GET /dashboard/services
  return {
    success: true,
    data: [
      {
          id: 'SVC-001',
          titre: 'Développement Web',
          categorie: 'Développement',
          prix: 50000,
          statut: 'actif',
          vues: 234,
          commandes: 12,
          image: undefined,
          actif: undefined,
          description: undefined,
          delai: undefined
      },
    ],
    message: 'Mock data - backend not implemented',
  };
}

/* ========================================
 * POSTS (Pro/Enterprise)
 * ======================================== */

/**
 * Fetch user posts/portfolio
 * @pro @enterprise
 */
export async function fetchPosts(): Promise<DashboardResponse<PostDto[]>> {
  // TODO: Backend to implement GET /dashboard/posts
  return {
    success: true,
    data: [
      {
          id: 'POST-001',
          titre: 'Mon dernier projet',
          categorie: 'Portfolio',
          date: '01/01/2025',
          likes: 45,
          commentaires: 12,
          statut: 'publie',
          type: '',
          medias: undefined,
          url: '',
          description: undefined
      },
    ],
    message: 'Mock data - backend not implemented',
  };
}

/* ========================================
 * COLLABORATIONS (Pro/Enterprise)
 * ======================================== */

/**
 * Fetch collaborations
 * @pro @enterprise
 */
export async function fetchCollaborations(): Promise<DashboardResponse<CollaborationDto[]>> {
  // TODO: Backend to implement GET /dashboard/collaborations
  return {
    success: true,
    data: [
      {
          id: 'COL-001',
          nom: 'Jean Kouadio',
          role: 'Designer',
          photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jean',
          statut: 'actif',
          clientPhoto: '',
          client: '',
          titre: undefined,
          montant: undefined,
          progression: undefined,
          prochaineLivraison: undefined,
          clientImage: undefined
      },
    ],
    message: 'Mock data - backend not implemented',
  };
}

/* ========================================
 * ADVERTISEMENTS (Pro/Enterprise)
 * ======================================== */

/**
 * Fetch ad campaigns
 * @pro @enterprise
 */
export async function fetchAdCampaigns(): Promise<DashboardResponse<AdCampaignDto[]>> {
  // TODO: Backend to implement GET /dashboard/ads
  return {
    success: true,
    data: [
      {
          id: 'AD-001',
          nom: 'Campagne Janvier',
          type: 'banniere',
          budget: 50000,
          depense: 23000,
          clics: 234,
          impressions: 5600,
          statut: 'actif',
          name: '',
          status: '',
          clicks: 0,
          ctr: 0,
          budgetDepense: undefined,
          spentBudget: undefined,
          budgetTotal: undefined,
          totalBudget: undefined,
          joursRestants: undefined,
          daysRemaining: undefined,
          zone: undefined,
          motsCles: undefined,
          keywords: undefined
      },
    ],
    message: 'Mock data - backend not implemented',
  };
}

/* ========================================
 * ANALYTICS (All Roles)
 * ======================================== */

/**
 * Fetch analytics chart data
 * @all-roles
 */
export async function fetchAnalytics(): Promise<DashboardResponse<AnalyticsDataDto[]>> {
  // TODO: Backend to implement GET /dashboard/analytics/chart
  return {
    success: true,
    data: [
      { date: '01/01', vues: 450, clics: 89, conversions: 12 },
      { date: '02/01', vues: 520, clics: 102, conversions: 15 },
      { date: '03/01', vues: 610, clics: 134, conversions: 18 },
      { date: '04/01', vues: 580, clics: 121, conversions: 16 },
      { date: '05/01', vues: 670, clics: 145, conversions: 21 },
    ],
    message: 'Mock data - backend not implemented',
  };
}
