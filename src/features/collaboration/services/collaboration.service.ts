import axiosInstance from '@/api/axios';
import { COLLABORATION_ENDPOINTS } from '@/api/collaborationEndpoints';
import {unwrapEnvelope} from "./collaborationApi";
import type { ApiResponse } from '@/types/api';
import type {
  CreateSpaceParams,
  OpenSpaceParams,
  SendMessageParams,
  SubmitDeliverableParams,
  LifecycleActionParams,
} from '../types';
import type {
  CollaborationSpaceResponse,
  MessageDTO,
} from './collaborationApi';

/**
 * Collaboration Spaces Service
 * Provides access to the /collaborations/spaces endpoint group
 */
export const collaborationService = {
  /**
   * Retrieves all spaces currently belonging to the authenticated user.
   */
  async getMySpaces(): Promise<ApiResponse<CollaborationSpaceResponse[]>> {
    const response = await axiosInstance.get<ApiResponse<CollaborationSpaceResponse[]>>(
      COLLABORATION_ENDPOINTS.MY_SPACES
    );
    return unwrapEnvelope(response);
  },

  /**
   * Retrieves details of a single collaboration space
   */
  async getSpaceDetail(id: string): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.get<ApiResponse<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.SPACE_DETAIL(id)
    );
    return unwrapEnvelope(response);
  },

  /**
   * Fetches the list of messages in a given space
   */
  async getMessages(spaceId: string): Promise<ApiResponse<MessageDTO[]>> {
    const response = await axiosInstance.get<ApiResponse<MessageDTO[]>>(
      COLLABORATION_ENDPOINTS.MESSAGES(spaceId)
    );
    return unwrapEnvelope(response);
  },

  /**
   * Creates a brand new collaboration space (or request)
   */
  async createSpace(params: CreateSpaceParams): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post<ApiResponse<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.CREATE_SPACE,
      params
    );
    return unwrapEnvelope(response);
  },

  /**
   * Finds or creates a collaboration space context
   */
  async openSpace(params: OpenSpaceParams): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post<ApiResponse<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.OPEN_SPACE,
      params
    );
    return unwrapEnvelope(response);
  },

  /**
   * Sends a message within a specific space
   */
  async sendMessage(spaceId: string, params: SendMessageParams): Promise<ApiResponse<MessageDTO>> {
    const response = await axiosInstance.post<ApiResponse<MessageDTO>>(
      COLLABORATION_ENDPOINTS.SEND_MESSAGE(spaceId),
      params
    );
    return unwrapEnvelope(response);
  },

  // =====================
  // Lifecycle Actions
  // =====================

  async acceptRequest(id: string): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post<ApiResponse<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.ACCEPT(id)
    );
    return unwrapEnvelope(response);
  },

  async rejectRequest(id: string): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post<ApiResponse<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.REJECT(id)
    );
    return unwrapEnvelope(response);
  },

  async decide(id: string, payload?: any): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post<ApiResponse<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.DECISION(id),
      payload
    );
    return unwrapEnvelope(response);
  },

  async submitBrief(id: string, payload?: any): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post<ApiResponse<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.SUBMIT_BRIEF(id),
      payload
    );
    return unwrapEnvelope(response);
  },

  async signContract(id: string): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post<ApiResponse<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.SIGN_CONTRACT(id)
    );
    return unwrapEnvelope(response);
  },

  async confirmPayment(id: string): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post<ApiResponse<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.CONFIRM_PAYMENT(id)
    );
    return unwrapEnvelope(response);
  },

  async startCollaboration(id: string): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post<ApiResponse<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.START_COLLABORATION(id)
    );
    return unwrapEnvelope(response);
  },

  async submitDeliverable(
    id: string,
    params: SubmitDeliverableParams
  ): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post<ApiResponse<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.SUBMIT_DELIVERABLE(id),
      params
    );
    return unwrapEnvelope(response);
  },

  async releasePayment(id: string): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post<ApiResponse<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.RELEASE_PAYMENT(id)
    );
    return unwrapEnvelope(response);
  },

  async closeSpace(id: string): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post<ApiResponse<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.CLOSE(id)
    );
    return unwrapEnvelope(response);
  },

  async applyLifecycleAction(
    id: string,
    params: LifecycleActionParams
  ): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post<ApiResponse<CollaborationSpaceResponse>>(
      COLLABORATION_ENDPOINTS.LIFECYCLE_ACTION(id),
      params
    );
    return unwrapEnvelope(response);
  },
};
