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
  CloseSpaceRequest,
  CollaborationBriefAcknowledgeResponse,
  CollaborationBriefPatchRequest,
  CollaborationBriefRequest,
  CollaborationBriefResponse,
  CollaborationBriefSubmitResponse,
  CollaborationContract,
  CollaborationDisputeResponse,
  CollaborationEtape,
  ConfirmPaymentRequest,
  ConfirmPlanResponse,
  CreateEtapeRequest,
  FcmTokenRequest,
  MilestoneDeliverable,
  PaymentSummaryResponse,
  ReorderEtapesRequest,
  TriggerDisputeRequest,
  UpdateEtapeRequest,
  UpdateEtapeStatusRequest,
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

  async confirmPayment(
    id: string,
    payload: ConfirmPaymentRequest = {},
  ): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.CONFIRM_PAYMENT(id), payload);
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

  async closeSpace(
    id: string,
    payload: CloseSpaceRequest = {},
  ): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.CLOSE(id), payload);
    return asEnvelope<CollaborationSpaceResponse>(response);
  },

  // ─── Contract ──────────────────────────────────────────────────────────────

  async getContract(id: string): Promise<ApiResponse<CollaborationContract>> {
    const response = await axiosInstance.get(COLLABORATION_ENDPOINTS.CONTRACT(id));
    return asEnvelope<CollaborationContract>(response);
  },

  async downloadContractPdf(id: string): Promise<Blob> {
    const response = await axiosInstance.get(COLLABORATION_ENDPOINTS.CONTRACT_PDF(id), {
      responseType: 'blob',
    });
    return response as unknown as Blob;
  },

  // ─── Etapes / Milestones ───────────────────────────────────────────────────

  async getEtapes(id: string): Promise<ApiResponse<CollaborationEtape[]>> {
    const response = await axiosInstance.get(COLLABORATION_ENDPOINTS.ETAPES(id));
    return asEnvelope<CollaborationEtape[]>(response);
  },

  async createEtape(id: string, payload: CreateEtapeRequest): Promise<ApiResponse<CollaborationEtape>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.ETAPES(id), payload);
    return asEnvelope<CollaborationEtape>(response);
  },

  async updateEtape(
    id: string,
    etapeId: string,
    payload: UpdateEtapeRequest,
  ): Promise<ApiResponse<CollaborationEtape>> {
    const response = await axiosInstance.patch(COLLABORATION_ENDPOINTS.ETAPE(id, etapeId), payload);
    return asEnvelope<CollaborationEtape>(response);
  },

  async deleteEtape(id: string, etapeId: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.delete(COLLABORATION_ENDPOINTS.ETAPE(id, etapeId));
    return asEnvelope<void>(response);
  },

  async confirmMilestonePlan(id: string): Promise<ApiResponse<ConfirmPlanResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.ETAPES_CONFIRM_PLAN(id));
    return asEnvelope<ConfirmPlanResponse>(response);
  },

  async updateEtapeStatus(
    id: string,
    etapeId: string,
    payload: UpdateEtapeStatusRequest,
  ): Promise<ApiResponse<CollaborationEtape>> {
    const response = await axiosInstance.patch(COLLABORATION_ENDPOINTS.ETAPE_STATUS(id, etapeId), payload);
    return asEnvelope<CollaborationEtape>(response);
  },

  async reorderEtapes(id: string, payload: ReorderEtapesRequest): Promise<ApiResponse<CollaborationEtape[]>> {
    const response = await axiosInstance.patch(COLLABORATION_ENDPOINTS.ETAPES_REORDER(id), payload);
    return asEnvelope<CollaborationEtape[]>(response);
  },

  // ─── Deliverables ──────────────────────────────────────────────────────────

  async listEtapeDeliverables(
    id: string,
    etapeId: string,
  ): Promise<ApiResponse<MilestoneDeliverable[]>> {
    const response = await axiosInstance.get(COLLABORATION_ENDPOINTS.ETAPE_DELIVERABLES(id, etapeId));
    return asEnvelope<MilestoneDeliverable[]>(response);
  },

  async submitEtapeDeliverable(
    id: string,
    etapeId: string,
    formData: FormData,
  ): Promise<ApiResponse<MilestoneDeliverable>> {
    const response = await axiosInstance.post(
      COLLABORATION_ENDPOINTS.ETAPE_DELIVERABLES(id, etapeId),
      formData,
    );
    return asEnvelope<MilestoneDeliverable>(response);
  },

  // ─── Payment summary ───────────────────────────────────────────────────────

  async getPaymentSummary(id: string): Promise<ApiResponse<PaymentSummaryResponse>> {
    const response = await axiosInstance.get(COLLABORATION_ENDPOINTS.PAYMENT_SUMMARY(id));
    return asEnvelope<PaymentSummaryResponse>(response);
  },

  // ─── Dispute ───────────────────────────────────────────────────────────────

  async triggerDispute(
    id: string,
    payload: TriggerDisputeRequest,
  ): Promise<ApiResponse<CollaborationDisputeResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.TRIGGER_DISPUTE(id), payload);
    return asEnvelope<CollaborationDisputeResponse>(response);
  },

  async getDispute(id: string): Promise<ApiResponse<CollaborationDisputeResponse | null>> {
    const response = await axiosInstance.get(COLLABORATION_ENDPOINTS.DISPUTE_DETAIL(id));
    return asEnvelope<CollaborationDisputeResponse | null>(response);
  },

  // ─── FCM token ─────────────────────────────────────────────────────────────

  async registerFcmToken(payload: FcmTokenRequest): Promise<ApiResponse<void>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.FCM_REGISTER, payload);
    return asEnvelope<void>(response);
  },

  async deregisterFcmToken(token: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.delete(COLLABORATION_ENDPOINTS.FCM_DEREGISTER(token));
    return asEnvelope<void>(response);
  },

  async applyLifecycleAction(
    id: string,
    params: LifecycleActionParams,
  ): Promise<ApiResponse<CollaborationSpaceResponse>> {
    const response = await axiosInstance.post(COLLABORATION_ENDPOINTS.LIFECYCLE_ACTION(id), params);
    return asEnvelope<CollaborationSpaceResponse>(response);
  },
};
