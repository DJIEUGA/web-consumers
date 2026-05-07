/**
 * Admin API — Types and Endpoint Paths
 * Source of truth for all /api/v1/admin/** contracts.
 * Types match the backend DTOs exactly; no client-side transformation.
 */

import type { ApiResponse } from "@/types/api";

// Re-export the shared envelope so callers only import from this module
export type { ApiResponse };

/* ─── Enums ────────────────────────────────────────────────────────────────── */

export type UserRole =
  | "ROLE_CUSTOMER"
  | "ROLE_PRO"
  | "ROLE_ENTERPRISE"
  | "ROLE_ADMIN"
  | "ROLE_MODERATOR";

export type AdminProjectStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

export type DisputeStatus =
  | "OPEN"
  | "IN_INVESTIGATION"
  | "RESOLVED"
  | "CLOSED";

export type KycStatus =
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"
  | "NOT_SUBMITTED";

/* ─── Response DTOs ─────────────────────────────────────────────────────────── */

export type AdminUserResponse = {
  userId: string;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  role: UserRole;
  verified: boolean;
  createdAt: string;
  permissions: string[];
};

export type ModeratorResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  active: boolean;
};

/** Nested participant summary on CollaborationSpaceResponse */
export type ParticipantSummary = {
  userId: string;
  fullName: string;
};

export type CollaborationSpaceResponse = {
  id: string;
  customerDetails: ParticipantSummary;
  proDetails: ParticipantSummary;
  title: string;
  brief: string;
  status: AdminProjectStatus;
  createdAt: string;
  updatedAt: string;
};

export type DisputeResponse = {
  id: string;
  collaborationSpaceId: string;
  initiatorId: string;
  initiatorName: string;
  respondentId: string;
  respondentName: string;
  reason: string;
  status: DisputeStatus;
  arbitrationDecision: string | null;
  refundAmount: number | null;
  paymentAmount: number | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

/** KYC profile as returned by /api/v1/admin/profiles/kyc-profiles */
export type ProProfileKycResponse = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  kycStatus: KycStatus;
  documentType?: string;
  submittedAt?: string;
  comment?: string;
};

/* ─── Request DTOs ──────────────────────────────────────────────────────────── */

export type ModeratorCreateRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type ModeratorUpdateRequest = {
  firstName: string;
  lastName: string;
  email: string;
  active?: boolean;
};

export type UpdateUserRoleRequest = {
  role: UserRole;
};

export type UpdateUserVerificationRequest = {
  verified: boolean;
};

export type UpdateProjectStatusRequest = {
  status: AdminProjectStatus;
};

export type DisputeResolutionRequest = {
  arbitrationDecision: string;
  refundAmount?: number;
  paymentAmount?: number;
};

/* ─── Query filter shapes ───────────────────────────────────────────────────── */

export type AdminUsersFilter = {
  role?: UserRole;
  verified?: boolean;
  search?: string;
};

export type AdminProjectsFilter = {
  status?: AdminProjectStatus;
  search?: string;
};

export type AdminDisputesFilter = {
  status?: DisputeStatus;
  search?: string;
};

/* ─── Endpoint paths ────────────────────────────────────────────────────────── */

export const ADMIN_ENDPOINTS = {
  // Moderators
  MODERATORS: "/admin/auth/moderators",
  MODERATOR: (id: string) => `/admin/auth/moderators/${id}`,

  // Users
  USERS: "/admin/users",
  USER: (userId: string) => `/admin/users/${userId}`,
  UPDATE_USER_ROLE: (userId: string) => `/admin/users/${userId}/role`,
  UPDATE_USER_VERIFICATION: (userId: string) =>
    `/admin/users/${userId}/verification`,

  // KYC profiles
  KYC_PROFILES: "/admin/profiles/kyc-profiles",
  KYC_PROFILE: (userId: string) =>
    `/admin/profiles/kyc-profiles/${userId}`,
  KYC_DOCUMENT: (userId: string) =>
    `/admin/profiles/kyc-profiles/${userId}/document`,
  UPDATE_KYC_STATUS: (userId: string) =>
    `/admin/profiles/${userId}/kyc`,

  // Projects
  PROJECTS: "/admin/projects",
  PROJECT: (projectId: string) => `/admin/projects/${projectId}`,
  UPDATE_PROJECT_STATUS: (projectId: string) =>
    `/admin/projects/${projectId}/status`,

  // Disputes
  DISPUTES: "/admin/disputes",
  DISPUTE: (disputeId: string) => `/admin/disputes/${disputeId}`,
  UPDATE_DISPUTE_STATUS: (disputeId: string) =>
    `/admin/disputes/${disputeId}/status`,
  RESOLVE_DISPUTE: (disputeId: string) =>
    `/admin/disputes/${disputeId}/resolve`,
  CLOSE_DISPUTE: (disputeId: string) =>
    `/admin/disputes/${disputeId}/close`,
} as const;
