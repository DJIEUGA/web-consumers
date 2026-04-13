import axiosInstance from "@/api/axios";
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

type MaybeEnvelope<T> = ApiEnvelope<T> | T;

const unwrapEnvelope = <T>(response: MaybeEnvelope<T>): T => {
  const envelope = response as ApiEnvelope<T>;
  if (
    envelope &&
    typeof envelope === "object" &&
    typeof envelope.success === "boolean" &&
    "data" in envelope
  ) {
    return envelope.data;
  }
  return response as T;
};

export const collaborationApi = {
  async listMySpaces(): Promise<CollaborationSpaceResponse[]> {
    const response = await axiosInstance.get<MaybeEnvelope<CollaborationSpaceResponse[]>>(
      "/collaborations/spaces/me",
    );
    return unwrapEnvelope<CollaborationSpaceResponse[]>(response) || [];
  },

  async createSpace(
    payload: CreateCollaborationRequest,
  ): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationSpaceResponse>>(
      "/collaborations/spaces",
      payload,
    );
    return unwrapEnvelope<CollaborationSpaceResponse>(response);
  },

  async acceptSpace(spaceId: string): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationSpaceResponse>>(
      `/collaborations/spaces/${encodeURIComponent(spaceId)}/accept`,
      {},
    );
    return unwrapEnvelope<CollaborationSpaceResponse>(response);
  },

  async rejectSpace(spaceId: string): Promise<CollaborationSpaceResponse> {
    const response = await axiosInstance.post<MaybeEnvelope<CollaborationSpaceResponse>>(
      `/collaborations/spaces/${encodeURIComponent(spaceId)}/reject`,
      {},
    );
    return unwrapEnvelope<CollaborationSpaceResponse>(response);
  },

  async listMessages(spaceId: string): Promise<MessageDTO[]> {
    const response = await axiosInstance.get<MaybeEnvelope<MessageDTO[]>>(
      `/collaborations/spaces/${encodeURIComponent(spaceId)}/messages`,
    );
    return unwrapEnvelope<MessageDTO[]>(response) || [];
  },

  async sendMessage(spaceId: string, content: string): Promise<MessageDTO> {
    const response = await axiosInstance.post<MaybeEnvelope<MessageDTO>>(
      `/collaborations/spaces/${encodeURIComponent(spaceId)}/messages`,
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
};

export default collaborationApi;
