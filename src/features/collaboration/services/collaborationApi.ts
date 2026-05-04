import axiosInstance from "@/api/axios";
import { COLLABORATION_ENDPOINTS } from "@/api/collaborationEndpoints";
import type { ApiResponse as ApiEnvelope } from "@/types/api";
import type {
  CollaborationDetailEnvelope,
  CollaborationSpaceResponse,
  CustomerProfileDetails,
  CreateSpaceParams,
  GenericActionPayload,
  LifecycleActionParams,
  LifecycleTimelineItem,
  MessageDTO,
  OpenSpaceParams,
  PreCollaborationDetailResponse,
  ProPublicProfileDetails,
  PublicReviewItem,
  ReviewRequest,
  SendMessageParams,
  SubmitDeliverableParams,
  UiHints,
  CollaborationStatus,
} from "../types";

export type {
  CollaborationDetailEnvelope,
  CollaborationSpaceResponse,
  CustomerProfileDetails,
  CreateSpaceParams,
  GenericActionPayload,
  LifecycleActionParams,
  LifecycleTimelineItem,
  MessageDTO,
  OpenSpaceParams,
  PreCollaborationDetailResponse,
  ProPublicProfileDetails,
  PublicReviewItem,
  ReviewRequest,
  SendMessageParams,
  SubmitDeliverableParams,
  UiHints,
  CollaborationStatus,
} from "../types";

type MaybeEnvelope<T> = ApiEnvelope<T> | T;

const extractPayload = <T>(response: unknown): MaybeEnvelope<T> => {
  if (!response || typeof response !== "object") {
    return response as MaybeEnvelope<T>;
  }

  // Already an API envelope-like payload returned by interceptors.
  if ("success" in (response as Record<string, unknown>)) {
    return response as MaybeEnvelope<T>;
  }

  // AxiosResponse shape: use its data payload.
  if ("data" in (response as Record<string, unknown>)) {
    return (response as { data: MaybeEnvelope<T> }).data;
  }

  return response as MaybeEnvelope<T>;
};

export const unwrapEnvelope = <T>(response: unknown): T => {
  const payload = extractPayload<T>(response);
  const envelope = payload as ApiEnvelope<T>;
  if (
    envelope &&
    typeof envelope === "object" &&
    typeof envelope.success === "boolean" &&
    "data" in envelope
  ) {
    return envelope.data;
  }
  return payload as T;
};

export const collaborationApi = {
  async listMySpaces(): Promise<CollaborationSpaceResponse[]> {
    const response = await axiosInstance.get<MaybeEnvelope<CollaborationSpaceResponse[]>>(
      `${COLLABORATION_ENDPOINTS.MY_SPACES}?_t=${Date.now()}`,
    );
    return unwrapEnvelope<CollaborationSpaceResponse[]>(response) || [];
  },

  async getSpaceDetail(spaceId: string): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.get<MaybeEnvelope<CollaborationDetailEnvelope>>(
      COLLABORATION_ENDPOINTS.SPACE_DETAIL(encodeURIComponent(spaceId)),
    );
    const detailData = unwrapEnvelope<CollaborationDetailEnvelope>(response);
    const detail = detailData?.collaborationDetail ?? detailData?.preCollaborationDetail;
    const customerDetails = detailData?.collaborationDetail?.customerDetails;
    const proDetails = detailData?.collaborationDetail?.proDetails;

    const customerId = String(
      detail && "customerId" in detail && detail.customerId
        ? detail.customerId
        : customerDetails?.userId ?? "",
    ).trim();
    const proId = String(
      detail && "proId" in detail && detail.proId
        ? detail.proId
        : proDetails?.userId ?? "",
    ).trim();

    const cd = detailData?.collaborationDetail;

    return {
      id: String(detail?.id ?? spaceId),
      customerId,
      proId,
      customerName: cd?.customerName,
      proName: cd?.proName,
      title: String(detail?.title ?? ""),
      brief: detail?.brief ?? null,
      status: (detail?.status ?? "PENDING") as CollaborationStatus,
      viewerRole: detail?.viewerRole,
      phase: cd?.phase,
      lifecycleStep: cd?.lifecycleStep,
      lifecycleStepLabel: cd?.lifecycleStepLabel,
      lifecycleTimeline: cd?.lifecycleTimeline,
      allowedActions: detail?.allowedActions,
      alreadyReviewed: cd?.alreadyReviewed,
      uiHints: detail?.uiHints,
      customerDetails: cd?.customerDetails,
      proDetails: cd?.proDetails,
      createdAt: detail && "createdAt" in detail ? detail.createdAt : undefined,
      updatedAt: detail && "updatedAt" in detail ? detail.updatedAt : undefined,
    };
  },

  async createSpace(
    payload: CreateSpaceParams,
  ): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.CREATE_SPACE,
      payload,
    );
    return unwrapEnvelope<CollaborationSpaceResponse>(response);
  },

  async openSpace(
    payload: OpenSpaceParams,
  ): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.OPEN_SPACE,
      payload,
    );
    return unwrapEnvelope<CollaborationSpaceResponse>(response);
  },

  async acceptSpace(spaceId: string): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.ACCEPT(encodeURIComponent(spaceId)),
      {},
    );
    return unwrapEnvelope<CollaborationSpaceResponse>(response);
  },

  async rejectSpace(spaceId: string): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.REJECT(encodeURIComponent(spaceId)),
      {},
    );
    return unwrapEnvelope<CollaborationSpaceResponse>(response);
  },

  async decideSpace(
    spaceId: string,
    payload?: GenericActionPayload,
  ): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.DECISION(encodeURIComponent(spaceId)),
      payload || {},
    );
    return unwrapEnvelope<CollaborationSpaceResponse>(response);
  },

  async submitBrief(
    spaceId: string,
    payload?: GenericActionPayload,
  ): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.SUBMIT_BRIEF(encodeURIComponent(spaceId)),
      payload || {},
    );
    return unwrapEnvelope<CollaborationSpaceResponse>(response);
  },

  async signContract(spaceId: string): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.SIGN_CONTRACT(encodeURIComponent(spaceId)),
      {},
    );
    return unwrapEnvelope<CollaborationSpaceResponse>(response);
  },

  async confirmPayment(spaceId: string): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.CONFIRM_PAYMENT(encodeURIComponent(spaceId)),
      {},
    );
    return unwrapEnvelope<CollaborationSpaceResponse>(response);
  },

  async startCollaboration(spaceId: string): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.START_COLLABORATION(encodeURIComponent(spaceId)),
      {},
    );
    return unwrapEnvelope<CollaborationSpaceResponse>(response);
  },

  async submitDeliverable(
    spaceId: string,
    payload?: GenericActionPayload,
  ): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.SUBMIT_DELIVERABLE(encodeURIComponent(spaceId)),
      payload || {},
    );
    return unwrapEnvelope<CollaborationSpaceResponse>(response);
  },

  async releasePayment(spaceId: string): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.RELEASE_PAYMENT(encodeURIComponent(spaceId)),
      {},
    );
    return unwrapEnvelope<CollaborationSpaceResponse>(response);
  },

  async closeSpace(spaceId: string): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.CLOSE(encodeURIComponent(spaceId)),
      {},
    );
    return unwrapEnvelope<CollaborationSpaceResponse>(response);
  },

  async applyLifecycleAction(
    spaceId: string,
    payload: GenericActionPayload,
  ): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.LIFECYCLE_ACTION(encodeURIComponent(spaceId)),
      payload,
    );
    return unwrapEnvelope<CollaborationSpaceResponse>(response);
  },

  async listMessages(spaceId: string): Promise<MessageDTO[]> {
    const encodedId = encodeURIComponent(spaceId);
    // Add cache busting for polling
    const url = `${COLLABORATION_ENDPOINTS.MESSAGES(encodedId)}${COLLABORATION_ENDPOINTS.MESSAGES(encodedId).includes('?') ? '&' : '?'}_t=${Date.now()}`;
    const response = await axiosInstance.get<MaybeEnvelope<MessageDTO[]>>(url);
    return unwrapEnvelope<MessageDTO[]>(response) || [];
  },

  async sendMessage(spaceId: string, content: string): Promise<MessageDTO> {
    const response = await axiosInstance.post<MaybeEnvelope<MessageDTO>>(
      COLLABORATION_ENDPOINTS.SEND_MESSAGE(encodeURIComponent(spaceId)),
      { content },
    );
    return unwrapEnvelope<MessageDTO>(response);
  },

  async submitReview(
    targetProId: string,
    payload: ReviewRequest,
  ): Promise<void> {
    const response = await axiosInstance.post<MaybeEnvelope<void>>(
      `/profiles/${encodeURIComponent(targetProId)}/reviews`,
      payload,
    );

    unwrapEnvelope<void>(response);
  },

  async getProPublicProfileDetails(proId: string): Promise<ProPublicProfileDetails> {
    const response = await axiosInstance.get<MaybeEnvelope<ProPublicProfileDetails>>(
      `/public/profiles/${encodeURIComponent(proId)}/details`,
    );
    return unwrapEnvelope<ProPublicProfileDetails>(response) || {};
  },

  async getPublicProfileReviews(targetProId: string): Promise<PublicReviewItem[]> {
    const details = await collaborationApi.getProPublicProfileDetails(targetProId);
    return Array.isArray(details?.reviews) ? details.reviews : [];
  },

  async getProProfileDetails(
    proProfileId: string,
  ): Promise<Record<string, unknown>> {
    const encodedId = encodeURIComponent(proProfileId);
    const response = await axiosInstance.get<MaybeEnvelope<Record<string, unknown>>>(
      `/public/profiles/${encodedId}/details`,
    );
    return unwrapEnvelope<Record<string, unknown>>(response) || {};
  },

  async getCustomerProfileDetails(
    customerProfileId: string,
  ): Promise<CustomerProfileDetails> {
    const encodedId = encodeURIComponent(customerProfileId);
    const response = await axiosInstance.get<MaybeEnvelope<CustomerProfileDetails>>(
      `/customer/profiles/${encodedId}/details`,
    );
    return unwrapEnvelope<CustomerProfileDetails>(response) || {};
  },
};

export default collaborationApi;
