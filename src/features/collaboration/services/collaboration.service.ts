import axiosInstance from '@/api/axios';
import { COLLABORATION_ENDPOINTS } from '@/api/collaborationEndpoints';
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
import type {
  BriefFileResponse,
  CollaborationBriefAcknowledgeResponse,
  CollaborationBriefPatchRequest,
  CollaborationBriefRequest,
  CollaborationBriefResponse,
  CollaborationBriefSubmitResponse,
} from './collaborationApi';

// The axios response interceptor already strips the AxiosResponse wrapper and returns
// response.data, which is the raw API envelope: { success, status, message, data, ... }.
// Every method here returns that envelope directly — no further unwrapping needed.

const asEnvelope = <T>(response: unknown): ApiResponse<T> =>
  response as ApiResponse<T>;

export const collaborationService = {
  async getMySpaces(): Promise<ApiResponse<CollaborationSpaceResponse[]>> {
    const response = await axiosInstance.get(COLLABORATION_ENDPOINTS.MY_SPACES);
    return asEnvelope<CollaborationSpaceResponse[]>(response);
  },

  async getSpaceDetail(id: string): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.get(COLLABORATION_ENDPOINTS.SPACE_DETAIL(id));
    return asEnvelope<CollaborationSpaceResponse>(response);
  },

  async getMessages(spaceId: string): Promise<ApiResponse<MessageDTO[]>> {
    const response = await axiosInstance.get(COLLABORATION_ENDPOINTS.MESSAGES(spaceId));
    return asEnvelope<MessageDTO[]>(response);
  },

  async createSpace(params: CreateSpaceParams): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.CREATE_SPACE, params);
    return asEnvelope<CollaborationSpaceResponse>(response);
  },

  async openSpace(params: OpenSpaceParams): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.OPEN_SPACE, params);
    return asEnvelope<CollaborationSpaceResponse>(response);
  },

  async sendMessage(spaceId: string, params: SendMessageParams): Promise<ApiResponse<MessageDTO>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.SEND_MESSAGE(spaceId), params);
    return asEnvelope<MessageDTO>(response);
  },

  async acceptRequest(id: string): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.ACCEPT(id));
    return asEnvelope<CollaborationSpaceResponse>(response);
  },

  async rejectRequest(id: string): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.REJECT(id));
    return asEnvelope<CollaborationSpaceResponse>(response);
  },

  async decide(id: string, payload?: unknown): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.DECISION(id), payload);
    return asEnvelope<CollaborationSpaceResponse>(response);
  },

  async submitBrief(id: string, payload?: unknown): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.SUBMIT_BRIEF(id), payload);
    return asEnvelope<CollaborationSpaceResponse>(response);
  },

  async getBrief(id: string): Promise<ApiResponse<CollaborationBriefResponse>> {
    const response = await axiosInstance.get(COLLABORATION_ENDPOINTS.BRIEF(id));
    return asEnvelope<CollaborationBriefResponse>(response);
  },

  async saveBrief(
    id: string,
    payload: CollaborationBriefRequest | CollaborationBriefPatchRequest,
  ): Promise<ApiResponse<CollaborationBriefResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.BRIEF(id), payload);
    return asEnvelope<CollaborationBriefResponse>(response);
  },

  async patchBrief(
    id: string,
    payload: CollaborationBriefPatchRequest,
  ): Promise<ApiResponse<CollaborationBriefResponse>> {
    const response = await axiosInstance.patch(COLLABORATION_ENDPOINTS.BRIEF(id), payload);
    return asEnvelope<CollaborationBriefResponse>(response);
  },

  async submitBriefPhase(id: string): Promise<ApiResponse<CollaborationBriefSubmitResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.BRIEF_SUBMIT(id));
    return asEnvelope<CollaborationBriefSubmitResponse>(response);
  },

  async acknowledgeBrief(id: string): Promise<ApiResponse<CollaborationBriefAcknowledgeResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.BRIEF_ACKNOWLEDGE(id));
    return asEnvelope<CollaborationBriefAcknowledgeResponse>(response);
  },

  async uploadBriefFiles(id: string, files: File[]): Promise<ApiResponse<BriefFileResponse[]>> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.BRIEF_FILES(id), formData);
    return asEnvelope<BriefFileResponse[]>(response);
  },

  async deleteBriefFile(id: string, fileId: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.delete(COLLABORATION_ENDPOINTS.BRIEF_FILE(id, fileId));
    return asEnvelope<void>(response);
  },

  async signContract(id: string): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.SIGN_CONTRACT(id));
    return asEnvelope<CollaborationSpaceResponse>(response);
  },

  async confirmPayment(id: string): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.CONFIRM_PAYMENT(id));
    return asEnvelope<CollaborationSpaceResponse>(response);
  },

  async startCollaboration(id: string): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.START_COLLABORATION(id));
    return asEnvelope<CollaborationSpaceResponse>(response);
  },

  async submitDeliverable(
    id: string,
    params: SubmitDeliverableParams,
  ): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.SUBMIT_DELIVERABLE(id), params);
    return asEnvelope<CollaborationSpaceResponse>(response);
  },

  async releasePayment(id: string): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.RELEASE_PAYMENT(id));
    return asEnvelope<CollaborationSpaceResponse>(response);
  },

  async closeSpace(id: string): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.CLOSE(id));
    return asEnvelope<CollaborationSpaceResponse>(response);
  },

  async applyLifecycleAction(
    id: string,
    params: LifecycleActionParams,
  ): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.LIFECYCLE_ACTION(id), params);
    return asEnvelope<CollaborationSpaceResponse>(response);
  },
};
