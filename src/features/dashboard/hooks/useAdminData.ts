/**
 * Admin Data Hooks
 * TanStack Query hooks for admin dashboard API endpoints.
 * Query hooks fetch data; mutation hooks write data and invalidate the cache.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { adminApi } from "../services/adminApi";
import type {
  AdminUsersFilter,
  AdminProjectsFilter,
  AdminDisputesFilter,
  ModeratorCreateRequest,
  ModeratorUpdateRequest,
  UpdateUserRoleRequest,
  UpdateUserVerificationRequest,
  UpdateProjectStatusRequest,
  DisputeResolutionRequest,
  KycStatus,
  DisputeStatus,
} from "@/api/adminEndpoints";

/* ─── Query Keys ────────────────────────────────────────────────────────────── */

export const ADMIN_QUERY_KEYS = {
  moderators: () => ["admin", "moderators"] as const,
  moderator: (id: string) => ["admin", "moderators", id] as const,

  users: (filters?: AdminUsersFilter) =>
    ["admin", "users", filters ?? {}] as const,
  user: (userId: string) => ["admin", "users", userId] as const,

  kycProfiles: () => ["admin", "kyc"] as const,
  kycProfile: (userId: string) => ["admin", "kyc", userId] as const,

  projects: (filters?: AdminProjectsFilter) =>
    ["admin", "projects", filters ?? {}] as const,

  disputes: (filters?: AdminDisputesFilter) =>
    ["admin", "disputes", filters ?? {}] as const,
  dispute: (disputeId: string) => ["admin", "disputes", disputeId] as const,
};

/* ─── Moderator Hooks ───────────────────────────────────────────────────────── */

export function useAdminModerators() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.moderators(),
    queryFn: async () => {
      const res = await adminApi.getModerators();
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

export function useCreateModerator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ModeratorCreateRequest) =>
      adminApi.createModerator(body).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.moderators() });
    },
  });
}

export function useUpdateModerator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ModeratorUpdateRequest }) =>
      adminApi.updateModerator(id, body).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.moderators() });
    },
  });
}

export function useDeleteModerator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteModerator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.moderators() });
    },
  });
}

/* ─── User Hooks ────────────────────────────────────────────────────────────── */

export function useAdminUsers(filters?: AdminUsersFilter) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.users(filters),
    queryFn: async () => {
      const res = await adminApi.getUsers(filters);
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminUser(userId: string) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.user(userId),
    queryFn: async () => {
      const res = await adminApi.getUserById(userId);
      return res.data;
    },
    enabled: isAuthenticated && !!userId,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, ...body }: { userId: string } & UpdateUserRoleRequest) =>
      adminApi.updateUserRole(userId, body).then((r) => r.data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.user(userId) });
    },
  });
}

export function useUpdateUserVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, ...body }: { userId: string } & UpdateUserVerificationRequest) =>
      adminApi.updateUserVerification(userId, body).then((r) => r.data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.user(userId) });
    },
  });
}

/* ─── KYC Hooks ─────────────────────────────────────────────────────────────── */

export function useAdminKycProfiles() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.kycProfiles(),
    queryFn: async () => {
      const res = await adminApi.getKycProfiles();
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateKycStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      status,
      comment,
    }: {
      userId: string;
      status: KycStatus;
      comment?: string;
    }) => adminApi.updateKycStatus(userId, status, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.kycProfiles() });
    },
  });
}

/* ─── Project Hooks ─────────────────────────────────────────────────────────── */

export function useAdminProjects(filters?: AdminProjectsFilter) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.projects(filters),
    queryFn: async () => {
      const res = await adminApi.getProjects(filters);
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, ...body }: { projectId: string } & UpdateProjectStatusRequest) =>
      adminApi.updateProjectStatus(projectId, body).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => adminApi.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    },
  });
}

/* ─── Dispute Hooks ─────────────────────────────────────────────────────────── */

export function useAdminDisputes(filters?: AdminDisputesFilter) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.disputes(filters),
    queryFn: async () => {
      const res = await adminApi.getDisputes(filters);
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminDispute(disputeId: string) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.dispute(disputeId),
    queryFn: async () => {
      const res = await adminApi.getDisputeById(disputeId);
      return res.data;
    },
    enabled: isAuthenticated && !!disputeId,
  });
}

export function useUpdateDisputeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      disputeId,
      status,
    }: {
      disputeId: string;
      status: DisputeStatus;
    }) => adminApi.updateDisputeStatus(disputeId, status).then((r) => r.data),
    onSuccess: (_, { disputeId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.dispute(disputeId),
      });
    },
  });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      disputeId,
      ...body
    }: { disputeId: string } & DisputeResolutionRequest) =>
      adminApi.resolveDispute(disputeId, body).then((r) => r.data),
    onSuccess: (_, { disputeId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.dispute(disputeId),
      });
    },
  });
}

export function useCloseDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (disputeId: string) =>
      adminApi.closeDispute(disputeId).then((r) => r.data),
    onSuccess: (_, disputeId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.dispute(disputeId),
      });
    },
  });
}

export function useDeleteDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (disputeId: string) => adminApi.deleteDispute(disputeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
    },
  });
}
