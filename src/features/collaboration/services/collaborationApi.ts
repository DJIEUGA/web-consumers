import axiosInstance from "@/api/axios";
import { COLLABORATION_ENDPOINTS } from "@/api/collaborationEndpoints";
import type { ApiResponse as ApiEnvelope } from "@/types/api";
import type {
  CreateSpaceParams,
  OpenSpaceParams,
  LifecycleActionParams,
  SendMessageParams,
  SubmitDeliverableParams,
} from "../types";

export type CollaborationBriefStatus = "DRAFT" | "SUBMITTED" | "ACKNOWLEDGED";

export type CollaborationBriefDeliverable =
  | "MAQUETTE_GRAPHIQUE"
  | "CODE_SOURCE"
  | "DOCUMENTATION"
  | "FORMATION_TUTORIEL"
  | "FICHIERS_SOURCES"
  | "REVISIONS_INCLUSES"
  | "SUPPORT_POST_LIVRAISON";

export type CollaborationBriefTimeline =
  | "MOINS_1_SEMAINE"
  | "_1_2_SEMAINES"
  | "_2_4_SEMAINES"
  | "_1_2_MOIS"
  | "PLUS_2_MOIS";

export type BriefFileResponse = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
};

export type CollaborationBriefRequest = {
  objectif: string;
  livrables: CollaborationBriefDeliverable[];
  delai: CollaborationBriefTimeline;
  budget: number;
};

export type CollaborationBriefPatchRequest = Partial<CollaborationBriefRequest>;

export type CollaborationBriefResponse = {
  id: string;
  collaborationId: string;
  objectif: string;
  livrables: CollaborationBriefDeliverable[];
  delai: CollaborationBriefTimeline;
  budget: number;
  status: CollaborationBriefStatus;
  progress: number;
  submittedAt: string | null;
  acknowledgedAt: string | null;
  files: BriefFileResponse[];
};

export type CollaborationBriefSubmitResponse = {
  status: "SUBMITTED";
  submittedAt: string;
};

export type CollaborationBriefAcknowledgeResponse = {
  status: "ACKNOWLEDGED";
  acknowledgedAt: string;
};

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
  companyName?: string;
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
      `${COLLABORATION_ENDPOINTS.MY_SPACES}?_t=${Date.now()}`,
    );
    const spaces = unwrapEnvelope<CollaborationSpaceResponse[]>(response) || [];

    // DEBUG: log what the list endpoint returns for each space
    if (spaces.length > 0) {
      console.debug("[CollabAPI] listMySpaces →", spaces.map(s => ({
        id: s.id,
        customerName: s.customerName,
        proName: s.proName,
        customerId: s.customerId,
        proId: s.proId,
        hasCustomerDetails: !!s.customerDetails,
        hasProDetails: !!s.proDetails,
        status: s.status,
        // Log ALL keys to discover any extra fields the backend sends
        allKeys: Object.keys(s),
      })));
    }

    return spaces;
  },

  async getSpaceDetail(spaceId: string): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.get<MaybeEnvelope<CollaborationDetailEnvelope>>(
      COLLABORATION_ENDPOINTS.SPACE_DETAIL(encodeURIComponent(spaceId)),
    );
    const detailData = unwrapEnvelope<CollaborationDetailEnvelope>(response);

    // DEBUG: log the raw response to understand the API structure
    console.debug("[CollabAPI] getSpaceDetail raw →", JSON.stringify(detailData, null, 2)?.substring(0, 2000));

    const cd = detailData?.collaborationDetail;
    const pre = detailData?.preCollaborationDetail;
    const detail = cd ?? pre;

    // Also check at the raw response level for any extra fields
    const rawAny = detailData as Record<string, any> | undefined;

    const customerDetails = cd?.customerDetails
      ?? (rawAny?.customerDetails as ProfileDetailsDTO | undefined)
      ?? (rawAny?.client as ProfileDetailsDTO | undefined)
      ?? (rawAny?.customer as ProfileDetailsDTO | undefined)
      ?? (rawAny?.owner as ProfileDetailsDTO | undefined);
    const proDetails = cd?.proDetails
      ?? (rawAny?.proDetails as ProfileDetailsDTO | undefined)
      ?? (rawAny?.professional as ProfileDetailsDTO | undefined)
      ?? (rawAny?.freelance as ProfileDetailsDTO | undefined)
      ?? (rawAny?.provider as ProfileDetailsDTO | undefined);

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

    // Extract names from all possible sources (fix precedence with explicit grouping)
    const customerDetailsName = customerDetails?.firstName || customerDetails?.lastName
      ? [customerDetails?.firstName, customerDetails?.lastName].filter(Boolean).join(" ")
      : "";
    const proDetailsName = proDetails?.firstName || proDetails?.lastName
      ? [proDetails?.firstName, proDetails?.lastName].filter(Boolean).join(" ")
      : "";

    const customerName: string | undefined =
      cd?.customerName
      || (rawAny?.customerName as string | undefined)
      || (rawAny?.clientName as string | undefined)
      || (rawAny?.ownerName as string | undefined)
      || (rawAny?.client?.name as string | undefined)
      || (rawAny?.client?.fullName as string | undefined)
      || (rawAny?.customer?.name as string | undefined)
      || (rawAny?.customer?.fullName as string | undefined)
      || ((pre as Record<string, unknown> | undefined)?.customerName as string | undefined)
      || ((pre as Record<string, unknown> | undefined)?.clientName as string | undefined)
      || customerDetailsName
      || undefined;
    const proName: string | undefined =
      cd?.proName
      || (rawAny?.proName as string | undefined)
      || (rawAny?.freelanceName as string | undefined)
      || (rawAny?.providerName as string | undefined)
      || (rawAny?.professional?.name as string | undefined)
      || (rawAny?.professional?.fullName as string | undefined)
      || (rawAny?.freelance?.name as string | undefined)
      || (rawAny?.freelance?.fullName as string | undefined)
      || ((pre as Record<string, unknown> | undefined)?.proName as string | undefined)
      || ((pre as Record<string, unknown> | undefined)?.freelanceName as string | undefined)
      || proDetailsName
      || undefined;

    console.debug("[CollabAPI] resolved names →", { customerName, proName, customerId, proId });

    return {
      id: String(detail?.id ?? spaceId),
      customerId,
      proId,
      customerName: customerName || undefined,
      proName: proName || undefined,
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
      customerDetails,
      proDetails,
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
    payload?: CollaborationBriefRequest,
  ): Promise<CollaborationBriefResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.BRIEF(encodeURIComponent(spaceId)),
      payload || {},
    );
    return unwrapEnvelope<CollaborationBriefResponse>(response);
  },

  async patchBrief(
    spaceId: string,
    payload?: CollaborationBriefPatchRequest,
  ): Promise<CollaborationBriefResponse> {
    const response = await axiosInstance.patch<MaybeEnvelope<CollaborationBriefResponse>>(
      COLLABORATION_ENDPOINTS.BRIEF(encodeURIComponent(spaceId)),
      payload || {},
    );
    return unwrapEnvelope<CollaborationBriefResponse>(response);
  },

  async getBrief(spaceId: string): Promise<CollaborationBriefResponse> {
    const response = await axiosInstance.get<MaybeEnvelope<CollaborationBriefResponse>>(
      COLLABORATION_ENDPOINTS.BRIEF(encodeURIComponent(spaceId)),
    );
    return unwrapEnvelope<CollaborationBriefResponse>(response);
  },

  async submitBriefPhase(spaceId: string): Promise<CollaborationBriefSubmitResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationBriefSubmitResponse>>(
      COLLABORATION_ENDPOINTS.BRIEF_SUBMIT(encodeURIComponent(spaceId)),
      {},
    );
    return unwrapEnvelope<CollaborationBriefSubmitResponse>(response);
  },

  async acknowledgeBrief(spaceId: string): Promise<CollaborationBriefAcknowledgeResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationBriefAcknowledgeResponse>>(
      COLLABORATION_ENDPOINTS.BRIEF_ACKNOWLEDGE(encodeURIComponent(spaceId)),
      {},
    );
    return unwrapEnvelope<CollaborationBriefAcknowledgeResponse>(response);
  },

  async uploadBriefFiles(spaceId: string, files: File[]): Promise<BriefFileResponse[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const response = await axiosInstance.post<MaybeEnvelope<BriefFileResponse[]>>(
      COLLABORATION_ENDPOINTS.BRIEF_FILES(encodeURIComponent(spaceId)),
      formData,
    );
    return unwrapEnvelope<BriefFileResponse[]>(response) || [];
  },

  async deleteBriefFile(spaceId: string, fileId: string): Promise<void> {
    const response = await axiosInstance.delete<MaybeEnvelope<void>>(
      COLLABORATION_ENDPOINTS.BRIEF_FILE(encodeURIComponent(spaceId), encodeURIComponent(fileId)),
    );
    unwrapEnvelope<void>(response);
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
    try {
      const response = await axiosInstance.get<MaybeEnvelope<ProPublicProfileDetails>>(
        `/public/profiles/${encodeURIComponent(proId)}/details`,
      );
      return unwrapEnvelope<ProPublicProfileDetails>(response) || {};
    } catch (err: unknown) {
      // 404 = profile not publicly listed → silently degrade
      const status = (err as { status?: number })?.status
        ?? (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        console.debug(`[CollabAPI] public profile ${proId} not found (404) — skipping`);
        return {};
      }
      throw err;
    }
  },

  async getPublicProfileReviews(targetProId: string): Promise<PublicReviewItem[]> {
    const details = await collaborationApi.getProPublicProfileDetails(targetProId);
    return Array.isArray(details?.reviews) ? details.reviews : [];
  },

  async getProProfileDetails(
    proProfileId: string,
  ): Promise<Record<string, unknown>> {
    const encodedId = encodeURIComponent(proProfileId);
    try {
      const response = await axiosInstance.get<MaybeEnvelope<Record<string, unknown>>>(
        `/public/profiles/${encodedId}/details`,
      );
      return unwrapEnvelope<Record<string, unknown>>(response) || {};
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
        ?? (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        console.debug(`[CollabAPI] pro profile ${proProfileId} not found (404) — skipping`);
        return {};
      }
      throw err;
    }
  },

  async getCustomerProfileDetails(
    customerProfileId: string,
  ): Promise<CustomerProfileDetails> {
    // Use the same public endpoint — there is no dedicated /customer/profiles/ route.
    // Customers may not have a public profile, so 404 is expected and handled gracefully.
    const encodedId = encodeURIComponent(customerProfileId);
    try {
      const response = await axiosInstance.get<MaybeEnvelope<CustomerProfileDetails>>(
        `/customer/profiles/${encodedId}/details`,
      );
      return unwrapEnvelope<CustomerProfileDetails>(response) || {};
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
        ?? (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        console.debug(`[CollabAPI] customer profile ${customerProfileId} not found (404) — skipping`);
        return {};
      }
      throw err;
    }
  },
};

export default collaborationApi;
