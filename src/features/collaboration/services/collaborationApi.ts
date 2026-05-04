import axiosInstance from "@/api/axios";
import { COLLABORATION_ENDPOINTS } from "@/api/collaborationEndpoints";
import type { ApiResponse as ApiEnvelope } from "@/types/api";

export type CollaborationStatus =
  | "PENDING"
  | "REQUEST_INFO"
  | "ACCEPTED"
  | "MATCH_CONFIRMED"
  | "BRIEF"
  | "CONTRACT"
  | "PAYMENT"
  | "REJECTED"
  | "ACTIVE"
  | "DELIVERABLE"
  | "PAYMENT_RELEASED"
  | "CLOSED"
  | "COMPLETED"
  | "CANCELLED";

export type LifecycleTimelineItem = {
  index: number;
  key: string;
  label: string;
  state: string;
};

export type UiHints = {
  messageEnabled?: boolean;
  reviewAllowed?: boolean;
  canCustomerSubmitBrief?: boolean;
  canProDecide?: boolean;
  nextRecommendedAction?: string;
};

export type ProfileDetailsDTO = {
  userId?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  fullName?: string;
  email?: string;
  role?: string;
  verified?: boolean;
  country?: string;
  city?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  bio?: string;
  hourlyRate?: number;
  specialization?: string;
  experienceYears?: number;
  sector?: string;
  skills?: string[];
  reputationScore?: number;
  reviewCount?: number;
  averageRating?: number;
  isPremium?: boolean;
  walletBalance?: number;
  kycStatus?: string;
  isAvailable?: boolean;
  coverImageUrl?: string;
};

export type CollaborationDetailResponse = {
  id?: string;
  customerId?: string;
  proId?: string;
  customerName?: string;
  proName?: string;
  customerDetails?: ProfileDetailsDTO;
  proDetails?: ProfileDetailsDTO;
  viewerRole?: string;
  title?: string;
  brief?: string | null;
  status?: CollaborationStatus;
  phase?: string;
  lifecycleStep?: string;
  lifecycleStepLabel?: string;
  lifecycleTimeline?: LifecycleTimelineItem[];
  allowedActions?: string[];
  alreadyReviewed?: boolean;
  uiHints?: UiHints;
};

export type PreCollaborationDetailResponse = {
  id?: string;
  customerId?: string;
  proId?: string;
  viewerRole?: string;
  title?: string;
  brief?: string | null;
  status?: "PENDING" | "REQUEST_INFO" | "ACCEPTED" | "REJECTED";
  createdAt?: string;
  updatedAt?: string;
  allowedActions?: string[];
  nextRecommendedAction?: string;
  uiHints?: UiHints;
};

export type CollaborationDetailEnvelope = {
  collaborationDetail?: CollaborationDetailResponse | null;
  preCollaborationDetail?: PreCollaborationDetailResponse | null;
};

export type CollaborationSpaceResponse = {
  id: string;
  customerId: string;
  proId: string;
  customerName?: string;
  proName?: string;
  title: string;
  brief: string | null;
  status: CollaborationStatus;
  viewerRole?: string;
  phase?: string;
  lifecycleStep?: string;
  lifecycleStepLabel?: string;
  lifecycleTimeline?: LifecycleTimelineItem[];
  allowedActions?: string[];
  alreadyReviewed?: boolean;
  uiHints?: UiHints;
  customerDetails?: ProfileDetailsDTO;
  proDetails?: ProfileDetailsDTO;
  createdAt?: string;
  updatedAt?: string;
};

type CollaborationSpaceDetailData = {
  collaborationDetail: CollaborationSpaceResponse;
  preCollaborationDetail: unknown;
};

export type MessageDTO = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  sentAt: string;
};

export type CreateCollaborationRequest = {
  proId: string;
  title?: string;
  brief?: string;
};

export type OpenCollaborationRequest = {
  proId: string;
  title?: string;
};

export type GenericActionPayload = Record<string, unknown>;

export type ReviewRequest = {
  rating: number;
  comment?: string;
  projectId?: string;
};

export type PublicReviewItem = {
  userFrom?: string;
  userAvatar?: string;
  projectId?: string;
  projectName?: string;
  rating?: number;
  comment?: string;
  commentedAt?: string;
  author?: {
    id?: string;
    firstName?: string;
    lastName?: string;
  };
  reviewerId?: string;
  userId?: string;
};

export type ProPublicProfileDetails = Record<string, unknown> & {
  reviews?: PublicReviewItem[];
};

export type CustomerProfileDetails = Record<string, unknown>;

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
      COLLABORATION_ENDPOINTS.MY_SPACES,
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
    payload: CreateCollaborationRequest,
  ): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.CREATE_SPACE,
      payload,
    );
    return unwrapEnvelope<CollaborationSpaceResponse>(response);
  },

  async openSpace(
    payload: OpenCollaborationRequest,
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
    const response = await axiosInstance.get<MaybeEnvelope<MessageDTO[]>>(
      COLLABORATION_ENDPOINTS.MESSAGES(encodeURIComponent(spaceId)),
    );
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
