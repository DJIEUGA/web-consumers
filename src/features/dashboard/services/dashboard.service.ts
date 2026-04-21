/**
 * Dashboard Data Services
 * API calls for dashboard metrics, transactions, projects, etc.
 * 
 * @pattern Returns data wrapped in simple success response shape
 * @status Backend endpoints NOT YET IMPLEMENTED - returns mock data
 */

import axios from '../../../api/axios';
import { PROFILE_ENDPOINTS } from '../../../api/profileEndpoints';
import { collaborationApi, type CollaborationStatus, type CollaborationSpaceResponse } from '../../collaboration/services/collaborationApi';
import { mapBackendStatusToUiStatut } from '../utils/collaborationStatus';
import {
  DASHBOARD_ENDPOINTS,
  type StatsTodayDto,
  type StatsMonthDto,
  type StatsOverviewDto,
  type DashboardOverviewApiDataDto,
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

const extractEnvelope = <T>(rawResponse: unknown): DashboardResponse<T> | null => {
  const directEnvelope = rawResponse as DashboardResponse<T>;
  if (directEnvelope && typeof directEnvelope.success === 'boolean') {
    return directEnvelope;
  }

  const wrappedEnvelope = (rawResponse as { data?: DashboardResponse<T> })?.data;
  if (wrappedEnvelope && typeof wrappedEnvelope.success === 'boolean') {
    return wrappedEnvelope;
  }

  return null;
};

const normalizeService = (service: any): ServiceDto => {
  const id = service.id || service._id || '';
  const title = service.title || service.titre || '';
  const description = service.description || '';
  const image = service.image || service.imageUrl || '';
  const deliveryTime = service.deliveryTime || service.duration || service.delai || '';
  const price = Number(service.price ?? service.prix ?? 0);

  const rawStatus =
    service.status || service.statut || service.isActive || service.active || service.actif;

  const isServiceActive =
    rawStatus === true ||
    rawStatus === 'actif' ||
    rawStatus === 'active' ||
    rawStatus === 'published';

  return {
    id,
    title,
    description,
    image,
    deliveryTime,
    price,
    categorie: service.categorie || service.category || 'Général',
    views: Number(service.views ?? service.vues ?? 0),
    commandes: Number(service.commandes ?? service.orders ?? 0),
    active: isServiceActive,
    isActive: isServiceActive ? 'actif' : 'pause',
  } as ServiceDto;
};

const normalizePortfolioItem = (post: any): PostDto => {
  const id = post.id || post._id || '';
  const title = post.titre || post.title || '';
  const description = post.description || '';
  const url = post.projectLink || post.url || '';
  const image = post.imageUrl || post.image || (Array.isArray(post.medias) ? post.medias[0] : '');
  const createdAt = post.createdAt || post.date || new Date().toISOString();

  return {
    id,
    titre: title,
    description,
    url,
    medias: image ? [image] : [],
    type: image ? 'image' : 'link',
    categorie: post.categorie || post.category || 'Portfolio',
    date: createdAt,
    likes: Number(post.likes ?? 0),
    commentaires: Number(post.commentaires ?? post.comments ?? 0),
    statut: post.statut || post.status || 'publie',
  } as PostDto;
};

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
  const rawResponse: unknown = await axios.get<DashboardResponse<DashboardOverviewApiDataDto>>(
    DASHBOARD_ENDPOINTS.STATS_OVERVIEW
  );

  const directEnvelope = rawResponse as DashboardResponse<DashboardOverviewApiDataDto>;
  const wrappedEnvelope = (rawResponse as { data?: DashboardResponse<DashboardOverviewApiDataDto> })?.data;

  const envelope =
    directEnvelope && typeof directEnvelope.success === 'boolean' && directEnvelope.data
      ? directEnvelope
      : wrappedEnvelope;

  const payload = envelope?.data;

  return {
    success: envelope?.success ?? false,
    message: envelope?.message,
    data: {
      gainsTotal: payload?.totalEarnings ?? 0,
      projetsEnCours: payload?.activeProjectsCount ?? 0,
      projetsRealises: payload?.completedProjectsCount ?? 0,
      noteMoyenne: 0,
      vuesProfile: payload?.profileViews ?? 0,
      messagesNonLus: payload?.messagesReceived ?? 0,
      messagesRecus: payload?.messagesReceived ?? 0,
      favoritesCount: payload?.favoritesCount ?? 0,
      ongoingProjects: payload?.ongoingProjects ?? [],
    },
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
  const rawResponse: unknown = await axios.get(PROFILE_ENDPOINTS.SERVICES);
  const envelope = extractEnvelope<any[]>(rawResponse);

  if (envelope) {
    const rows = Array.isArray(envelope.data) ? envelope.data : [];
    return {
      success: envelope.success,
      message: envelope.message,
      data: rows.map(normalizeService),
    };
  }

  const rows = Array.isArray(rawResponse) ? rawResponse : [];
  return {
    success: true,
    data: rows.map(normalizeService),
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
  const rawResponse: unknown = await axios.get(PROFILE_ENDPOINTS.PORTFOLIO);
  const envelope = extractEnvelope<any[]>(rawResponse);

  if (envelope) {
    const rows = Array.isArray(envelope.data) ? envelope.data : [];
    return {
      success: envelope.success,
      message: envelope.message,
      data: rows.map(normalizePortfolioItem),
    };
  }

  const rows = Array.isArray(rawResponse) ? rawResponse : [];
  return {
    success: true,
    data: rows.map(normalizePortfolioItem),
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
  const mapSpaceToCollaboration = (space: CollaborationSpaceResponse): CollaborationDto => {
    const customerName = String(space.customerName || '').trim();
    const proName = String(space.proName || '').trim();
    const title = String(space.title || '').trim();

    const counterpartName = proName || customerName || 'Collaboration';
    const displayTitle = title || `Mission avec ${counterpartName}`;

    const avatarSeed = encodeURIComponent(counterpartName || space.id);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;

    return {
      id: space.id,
      nom: counterpartName,
      role: 'Collaboration',
      photo: avatar,
      backendStatus: space.status,
      statut: mapBackendStatusToUiStatut(space.status),
      clientPhoto: avatar,
      client: customerName || counterpartName,
      titre: displayTitle,
      montant: 0,
      progression: space.status === 'COMPLETED' ? 100 : space.status === 'ACTIVE' ? 60 : 0,
      prochaineLivraison: space.status === 'COMPLETED' ? 'Livrée' : 'À planifier',
      clientImage: avatar,
    };
  };

  const spaces = await collaborationApi.listMySpaces();

  return {
    success: true,
    data: (spaces || []).map(mapSpaceToCollaboration),
    message: 'Collaborations chargées depuis le backend',
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
