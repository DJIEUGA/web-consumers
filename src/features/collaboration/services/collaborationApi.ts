import axiosInstance from "@/api/axios";
import { COLLABORATION_ENDPOINTS } from "@/api/collaborationEndpoints";
import type { ApiResponse as ApiEnvelope } from "@/types/api";

export type CollaborationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export type CollaborationSpaceResponse = {
  id: string;
  customerId: string;
  proId: string;
  title: string;
  brief: string;
  status: CollaborationStatus;
  customerName: string;
  proName: string;
  createdAt: string;
  updatedAt: string;
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

type PublicProfileDetails = {
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

const unwrapEnvelope = <T>(response: unknown): T => {
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
    const response = await axiosInstance.get<MaybeEnvelope<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.SPACE_DETAIL(encodeURIComponent(spaceId)),
    );
    return unwrapEnvelope<CollaborationSpaceResponse>(response);
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

  async getPublicProfileReviews(targetProId: string): Promise<PublicReviewItem[]> {
    const response = await axiosInstance.get<MaybeEnvelope<PublicProfileDetails>>(
      `/public/profiles/${encodeURIComponent(targetProId)}/details`,
    );

    const details = unwrapEnvelope<PublicProfileDetails>(response);
    return Array.isArray(details?.reviews) ? details.reviews : [];
  },

  async getCustomerProfileDetails(
    customerProfileId: string,
  ): Promise<CustomerProfileDetails> {
    const encodedId = encodeURIComponent(customerProfileId);
    const candidateEndpoints = [
      `/api/v1/api/v1/customer/profiles/${encodedId}/details`,
      `/api/v1/customer/profiles/${encodedId}/details`,
      `/customer/profiles/${encodedId}/details`,
    ];

    let lastError: unknown;

    for (const endpoint of candidateEndpoints) {
      try {
        const response = await axiosInstance.get<MaybeEnvelope<CustomerProfileDetails>>(endpoint);
        return unwrapEnvelope<CustomerProfileDetails>(response) || {};
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  },
};

export default collaborationApi;
