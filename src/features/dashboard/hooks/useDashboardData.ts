/**
 * Dashboard Data Hooks
 * TanStack Query hooks for dashboard metrics, transactions, projects
 * 
 * @pattern Follow useDashboardProfile pattern (useQuery + normalization)
 * @status Returns mock data until backend implements endpoints
 */

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../stores/auth.store';
import * as dashboardService from '../services/dashboard.service';
import type {
  StatsTodayDto,
  StatsMonthDto,
  StatsOverviewDto,
  DashboardAlertDto,
  TransactionDto,
  ProjectDto,
  DashboardUserDto,
  KycQueueItemDto,
  DisputeDto,
  PaymentDto,
  ServiceDto,
  PostDto,
  CollaborationDto,
  AdCampaignDto,
  AnalyticsDataDto,
} from '../../../api/dashboardEndpoints';

/* ========================================
 * QUERY KEYS
 * Centralized keys for cache invalidation
 * ======================================== */

export const DASHBOARD_QUERY_KEYS = {
  statsToday: ['dashboard', 'stats', 'today'] as const,
  statsMonth: ['dashboard', 'stats', 'month'] as const,
  statsOverview: ['dashboard', 'stats', 'overview'] as const,
  alerts: ['dashboard', 'alerts'] as const,
  transactions: ['dashboard', 'transactions'] as const,
  projects: ['dashboard', 'projects'] as const,
  users: ['dashboard', 'users'] as const,
  kycQueue: ['dashboard', 'kyc', 'queue'] as const,
  disputes: ['dashboard', 'disputes'] as const,
  payments: ['dashboard', 'payments'] as const,
  services: ['dashboard', 'services'] as const,
  posts: ['dashboard', 'posts'] as const,
  collaborations: ['dashboard', 'collaborations'] as const,
  adCampaigns: ['dashboard', 'ads'] as const,
  analytics: ['dashboard', 'analytics'] as const,
};

/* ========================================
 * STATISTICS HOOKS
 * ======================================== */

/**
 * Fetch today's real-time stats (Admin/Moderator)
 */
export function useStatsToday() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.statsToday,
    queryFn: async () => {
      const response = await dashboardService.fetchStatsToday();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch stats today');
      }
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes (real-time data)
  });
}

/**
 * Fetch monthly stats overview (Admin/Moderator)
 */
export function useStatsMonth() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.statsMonth,
    queryFn: async () => {
      const response = await dashboardService.fetchStatsMonth();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch monthly stats');
      }
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Fetch user stats overview (Pro/Enterprise)
 */
export function useStatsOverview() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.statsOverview,
    queryFn: async () => {
      const response = await dashboardService.fetchStatsOverview();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch stats overview');
      }
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/* ========================================
 * ALERTS HOOK
 * ======================================== */

/**
 * Fetch dashboard alerts (All roles)
 */
export function useAlerts() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.alerts,
    queryFn: async () => {
      const response = await dashboardService.fetchAlerts();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch alerts');
      }
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/* ========================================
 * TRANSACTIONS HOOK
 * ======================================== */

/**
 * Fetch recent transactions (All roles)
 */
export function useTransactions() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.transactions,
    queryFn: async () => {
      const response = await dashboardService.fetchTransactions();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch transactions');
      }
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/* ========================================
 * PROJECTS HOOK
 * ======================================== */

/**
 * Fetch recent projects (All roles)
 */
export function useProjects() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.projects,
    queryFn: async () => {
      const response = await dashboardService.fetchProjects();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch projects');
      }
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/* ========================================
 * USERS HOOK (Admin/Moderator)
 * ======================================== */

/**
 * Fetch user list (Admin/Moderator only)
 */
export function useUsers() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.users,
    queryFn: async () => {
      const response = await dashboardService.fetchUsers();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch users');
      }
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/* ========================================
 * KYC QUEUE HOOK (Admin/Moderator)
 * ======================================== */

/**
 * Fetch KYC verification queue (Admin/Moderator only)
 */
export function useKycQueue() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.kycQueue,
    queryFn: async () => {
      const response = await dashboardService.fetchKycQueue();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch KYC queue');
      }
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes (active queue)
  });
}

/* ========================================
 * DISPUTES HOOK (Admin/Moderator)
 * ======================================== */

/**
 * Fetch disputes (Admin/Moderator only)
 */
export function useDisputes() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.disputes,
    queryFn: async () => {
      const response = await dashboardService.fetchDisputes();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch disputes');
      }
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/* ========================================
 * PAYMENTS HOOK (Admin/Moderator)
 * ======================================== */

/**
 * Fetch payments (Admin/Moderator only)
 */
export function usePayments() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.payments,
    queryFn: async () => {
      const response = await dashboardService.fetchPayments();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch payments');
      }
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/* ========================================
 * SERVICES HOOK (Pro/Enterprise)
 * ======================================== */

/**
 * Fetch user services (Pro/Enterprise)
 */
export function useServices() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.services,
    queryFn: async () => {
      const response = await dashboardService.fetchServices();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch services');
      }
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/* ========================================
 * POSTS HOOK (Pro/Enterprise)
 * ======================================== */

/**
 * Fetch user posts (Pro/Enterprise)
 */
export function usePosts() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.posts,
    queryFn: async () => {
      const response = await dashboardService.fetchPosts();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch posts');
      }
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/* ========================================
 * COLLABORATIONS HOOK (Pro/Enterprise)
 * ======================================== */

/**
 * Fetch collaborations (Pro/Enterprise)
 */
export function useCollaborations() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.collaborations,
    queryFn: async () => {
      const response = await dashboardService.fetchCollaborations();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch collaborations');
      }
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/* ========================================
 * AD CAMPAIGNS HOOK (Pro/Enterprise)
 * ======================================== */

/**
 * Fetch ad campaigns (Pro/Enterprise)
 */
export function useAdCampaigns() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.adCampaigns,
    queryFn: async () => {
      const response = await dashboardService.fetchAdCampaigns();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch ad campaigns');
      }
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/* ========================================
 * ANALYTICS HOOK (All Roles)
 * ======================================== */

/**
 * Fetch analytics chart data (All roles)
 */
export function useAnalytics() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.analytics,
    queryFn: async () => {
      const response = await dashboardService.fetchAnalytics();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch analytics');
      }
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
