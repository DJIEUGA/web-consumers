/**
 * Admin API Service
 * Thin wrappers around axiosInstance for every admin endpoint.
 * Each function returns the unwrapped ApiResponse<T> (the interceptor strips
 * the outer AxiosResponse shell, so callers receive the JSON body directly).
 */

import axiosInstance from "@/api/axios";
import {
  ADMIN_ENDPOINTS,
  type ApiResponse,
  type AdminUserResponse,
  type ModeratorResponse,
  type CollaborationSpaceResponse,
  type DisputeResponse,
  type ProProfileKycResponse,
  type AdminUsersFilter,
  type AdminProjectsFilter,
  type AdminDisputesFilter,
  type ModeratorCreateRequest,
  type ModeratorUpdateRequest,
  type UpdateUserRoleRequest,
  type UpdateUserVerificationRequest,
  type UpdateProjectStatusRequest,
  type DisputeResolutionRequest,
  type KycStatus,
  type DisputeStatus,
} from "@/api/adminEndpoints";

/* ─── Moderators ────────────────────────────────────────────────────────────── */

const getModerators = (): Promise<ApiResponse<ModeratorResponse[]>> =>
  axiosInstance.get(ADMIN_ENDPOINTS.MODERATORS);

const createModerator = (
  body: ModeratorCreateRequest
): Promise<ApiResponse<ModeratorResponse>> =>
  axiosInstance.post(ADMIN_ENDPOINTS.MODERATORS, body);

const updateModerator = (
  id: string,
  body: ModeratorUpdateRequest
): Promise<ApiResponse<ModeratorResponse>> =>
  axiosInstance.put(ADMIN_ENDPOINTS.MODERATOR(id), body);

const deleteModerator = (id: string): Promise<ApiResponse<void>> =>
  axiosInstance.delete(ADMIN_ENDPOINTS.MODERATOR(id));

/* ─── Users ─────────────────────────────────────────────────────────────────── */

const getUsers = (
  filters?: AdminUsersFilter
): Promise<ApiResponse<AdminUserResponse[]>> =>
  axiosInstance.get(ADMIN_ENDPOINTS.USERS, { params: filters });

const getUserById = (
  userId: string
): Promise<ApiResponse<AdminUserResponse>> =>
  axiosInstance.get(ADMIN_ENDPOINTS.USER(userId));

const updateUserRole = (
  userId: string,
  body: UpdateUserRoleRequest
): Promise<ApiResponse<AdminUserResponse>> =>
  axiosInstance.patch(ADMIN_ENDPOINTS.UPDATE_USER_ROLE(userId), body);

const updateUserVerification = (
  userId: string,
  body: UpdateUserVerificationRequest
): Promise<ApiResponse<AdminUserResponse>> =>
  axiosInstance.patch(ADMIN_ENDPOINTS.UPDATE_USER_VERIFICATION(userId), body);

/* ─── KYC Profiles ──────────────────────────────────────────────────────────── */

const getKycProfiles = (): Promise<ApiResponse<ProProfileKycResponse[]>> =>
  axiosInstance.get(ADMIN_ENDPOINTS.KYC_PROFILES);

const getKycProfileById = (
  userId: string
): Promise<ApiResponse<ProProfileKycResponse>> =>
  axiosInstance.get(ADMIN_ENDPOINTS.KYC_PROFILE(userId));

/**
 * Downloads the KYC document binary.
 * Returns a Blob directly — the response interceptor unwraps response.data,
 * which for responseType:'blob' is the Blob itself.
 * See integration guide §2: "Handle non-standard endpoints separately".
 */
const getKycDocument = (userId: string): Promise<Blob> =>
  axiosInstance.get(ADMIN_ENDPOINTS.KYC_DOCUMENT(userId), {
    responseType: "blob",
  });

/**
 * Returns a plain string (not an ApiResponse envelope).
 * See integration guide §2: "Handle non-standard endpoints separately".
 */
const updateKycStatus = (
  userId: string,
  status: KycStatus,
  comment?: string
): Promise<string> =>
  axiosInstance.patch(ADMIN_ENDPOINTS.UPDATE_KYC_STATUS(userId), null, {
    params: { status, ...(comment ? { comment } : {}) },
  });

/* ─── Projects ──────────────────────────────────────────────────────────────── */

const getProjects = (
  filters?: AdminProjectsFilter
): Promise<ApiResponse<CollaborationSpaceResponse[]>> =>
  axiosInstance.get(ADMIN_ENDPOINTS.PROJECTS, { params: filters });

const updateProjectStatus = (
  projectId: string,
  body: UpdateProjectStatusRequest
): Promise<ApiResponse<CollaborationSpaceResponse>> =>
  axiosInstance.patch(ADMIN_ENDPOINTS.UPDATE_PROJECT_STATUS(projectId), body);

const deleteProject = (projectId: string): Promise<ApiResponse<void>> =>
  axiosInstance.delete(ADMIN_ENDPOINTS.PROJECT(projectId));

/* ─── Disputes ──────────────────────────────────────────────────────────────── */

const getDisputes = (
  filters?: AdminDisputesFilter
): Promise<ApiResponse<DisputeResponse[]>> =>
  axiosInstance.get(ADMIN_ENDPOINTS.DISPUTES, { params: filters });

const getDisputeById = (
  disputeId: string
): Promise<ApiResponse<DisputeResponse>> =>
  axiosInstance.get(ADMIN_ENDPOINTS.DISPUTE(disputeId));

const updateDisputeStatus = (
  disputeId: string,
  status: DisputeStatus
): Promise<ApiResponse<DisputeResponse>> =>
  axiosInstance.patch(ADMIN_ENDPOINTS.UPDATE_DISPUTE_STATUS(disputeId), null, {
    params: { status },
  });

const resolveDispute = (
  disputeId: string,
  body: DisputeResolutionRequest
): Promise<ApiResponse<DisputeResponse>> =>
  axiosInstance.post(ADMIN_ENDPOINTS.RESOLVE_DISPUTE(disputeId), body);

const closeDispute = (
  disputeId: string
): Promise<ApiResponse<DisputeResponse>> =>
  axiosInstance.post(ADMIN_ENDPOINTS.CLOSE_DISPUTE(disputeId));

const deleteDispute = (disputeId: string): Promise<ApiResponse<void>> =>
  axiosInstance.delete(ADMIN_ENDPOINTS.DISPUTE(disputeId));

/* ─── Exported object ───────────────────────────────────────────────────────── */

export const adminApi = {
  // Moderators
  getModerators,
  createModerator,
  updateModerator,
  deleteModerator,

  // Users
  getUsers,
  getUserById,
  updateUserRole,
  updateUserVerification,

  // KYC
  getKycProfiles,
  getKycProfileById,
  getKycDocument,
  updateKycStatus,

  // Projects
  getProjects,
  updateProjectStatus,
  deleteProject,

  // Disputes
  getDisputes,
  getDisputeById,
  updateDisputeStatus,
  resolveDispute,
  closeDispute,
  deleteDispute,
};
