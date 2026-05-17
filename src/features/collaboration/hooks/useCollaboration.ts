import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collaborationService } from '../services/collaboration.service';
import collaborationApi, { ReviewRequest, PublicReviewItem, ProPublicProfileDetails, CustomerProfileDetails} from '../services/collaborationApi';
import type {
  CollaborationSpaceResponse,
} from '../types';
import type {
  CreateSpaceParams,
  SendMessageParams,
  SubmitDeliverableParams,
} from '../types';
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
  MilestoneDeliverable,
  PaymentSummaryResponse,
  ReorderEtapesRequest,
  TriggerDisputeRequest,
  UpdateEtapeRequest,
  UpdateEtapeStatusRequest,
} from '../services/collaborationApi';
import { toast } from 'sonner';


export const COLLABORATION_KEYS = {
  all: ['collaborations'] as const,
  mySpaces: () => [...COLLABORATION_KEYS.all, 'me'] as const,
  detail: (id: string) => [...COLLABORATION_KEYS.all, 'detail', id] as const,
  brief: (id: string) => [...COLLABORATION_KEYS.all, 'brief', id] as const,
  contract: (id: string) => [...COLLABORATION_KEYS.all, 'contract', id] as const,
  etapes: (id: string) => [...COLLABORATION_KEYS.all, 'etapes', id] as const,
  etapeDeliverables: (id: string, etapeId: string) => [...COLLABORATION_KEYS.all, 'deliverables', id, etapeId] as const,
  paymentSummary: (id: string) => [...COLLABORATION_KEYS.all, 'paymentSummary', id] as const,
  dispute: (id: string) => [...COLLABORATION_KEYS.all, 'dispute', id] as const,
  messages: (spaceId: string) => [...COLLABORATION_KEYS.all, 'messages', spaceId] as const,
  reviews: (proId: string) => [...COLLABORATION_KEYS.all, 'reviews', proId] as const,
  proProfile: (proId: string) => [...COLLABORATION_KEYS.all, 'proProfile', proId] as const,
  customerProfile: (customerId: string) => [...COLLABORATION_KEYS.all, 'customerProfile', customerId] as const,
};

const getErrorMessage = (error: any, fallback: string) => {
  if (typeof error?.message === 'string' && error.message.trim()) return error.message;
  if (typeof error?.error === 'string' && error.error.trim()) return error.error;
  if (typeof error?.errors === 'string' && error.errors.trim()) return error.errors;
  return fallback;
};

/**
 * Fetch all collaboration spaces belonging to the signed-in user
 */
export function useMySpaces() {
  return useQuery({
    queryKey: COLLABORATION_KEYS.mySpaces(),
    queryFn: async () => {
      const response = await collaborationService.getMySpaces();
      return response.data;
    },
  });
}

/**
 * Fetch details of a single workspace by ID.
 * The detail endpoint returns { collaborationDetail: {...}, preCollaborationDetail: null }
 * inside the envelope — unwrap it so callers always get a flat CollaborationSpaceResponse.
 */
export function useSpaceDetail(id: string | undefined) {
  return useQuery<CollaborationSpaceResponse>({
    queryKey: COLLABORATION_KEYS.detail(id!),
    queryFn: async () => {
      return collaborationApi.getSpaceDetail(id!) as unknown as CollaborationSpaceResponse;
    },
    enabled: !!id,
  });
}

export function useCollaborationBrief(spaceId: string | undefined, enabled = true) {
  return useQuery<CollaborationBriefResponse | null>({
    queryKey: COLLABORATION_KEYS.brief(spaceId || 'unknown'),
    queryFn: async () => {
      try {
        const response = await collaborationService.getBrief(spaceId!);
        return response.data;
      } catch (error: any) {
        if (error?.status === 404 || error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: enabled && !!spaceId,
    retry: false,
  });
}

/**
 * Fetch messages inside a workspace
 */
export function useSpaceMessages(
  spaceId: string | undefined,
  options?: {
    refetchInterval?: number;
    refetchOnWindowFocus?: boolean;
  },
) {
  return useQuery({
    queryKey: COLLABORATION_KEYS.messages(spaceId!),
    queryFn: async () => {
      const response = await collaborationService.getMessages(spaceId!);
      return response.data;
    },
    enabled: !!spaceId,
    refetchInterval: options?.refetchInterval,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
  });
}

export function usePublicProfileReviews(
  targetProId: string | undefined,
  enabled = true,
) {
  return useQuery<PublicReviewItem[]>({
    queryKey: COLLABORATION_KEYS.reviews(targetProId || 'unknown'),
    queryFn: async () => collaborationApi.getPublicProfileReviews(targetProId!),
    enabled: enabled && !!targetProId,
  });
}

export function useProProfileDetails(
  proId: string | undefined,
  enabled = true,
) {
  return useQuery<ProPublicProfileDetails>({
    queryKey: COLLABORATION_KEYS.proProfile(proId || 'unknown'),
    queryFn: async () => collaborationApi.getProPublicProfileDetails(proId!),
    enabled: enabled && !!proId,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 min — avoid re-fetching constantly
  });
}

export function useCustomerProfileDetails(
  customerProfileId: string | undefined,
  enabled = true,
) {
  return useQuery<CustomerProfileDetails>({
    queryKey: COLLABORATION_KEYS.customerProfile(customerProfileId || 'unknown'),
    queryFn: async () => collaborationApi.getCustomerProfileDetails(customerProfileId!),
    enabled: enabled && !!customerProfileId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCollaborationContract(spaceId: string | undefined) {
  return useQuery<CollaborationContract | null>({
    queryKey: COLLABORATION_KEYS.contract(spaceId || 'unknown'),
    queryFn: async () => {
      try {
        const response = await collaborationService.getContract(spaceId!);
        return response.data;
      } catch (error: any) {
        if (error?.status === 404 || error?.response?.status === 404) return null;
        throw error;
      }
    },
    enabled: !!spaceId,
    retry: false,
  });
}

export function useCollaborationEtapes(spaceId: string | undefined) {
  return useQuery<CollaborationEtape[]>({
    queryKey: COLLABORATION_KEYS.etapes(spaceId || 'unknown'),
    queryFn: async () => {
      const response = await collaborationService.getEtapes(spaceId!);
      return response.data ?? [];
    },
    enabled: !!spaceId,
  });
}

export function useEtapeDeliverables(
  spaceId: string | undefined,
  etapeId: string | undefined,
) {
  return useQuery<MilestoneDeliverable[]>({
    queryKey: COLLABORATION_KEYS.etapeDeliverables(spaceId || 'unknown', etapeId || 'unknown'),
    queryFn: async () => {
      const response = await collaborationService.listEtapeDeliverables(spaceId!, etapeId!);
      return response.data ?? [];
    },
    enabled: !!spaceId && !!etapeId,
  });
}

export function usePaymentSummary(spaceId: string | undefined) {
  return useQuery<PaymentSummaryResponse | null>({
    queryKey: COLLABORATION_KEYS.paymentSummary(spaceId || 'unknown'),
    queryFn: async () => {
      try {
        const response = await collaborationService.getPaymentSummary(spaceId!);
        return response.data;
      } catch (error: any) {
        if (error?.status === 404 || error?.response?.status === 404) return null;
        throw error;
      }
    },
    enabled: !!spaceId,
    retry: false,
  });
}

export function useCollaborationDispute(spaceId: string | undefined) {
  return useQuery<CollaborationDisputeResponse | null>({
    queryKey: COLLABORATION_KEYS.dispute(spaceId || 'unknown'),
    queryFn: async () => {
      try {
        const response = await collaborationService.getDispute(spaceId!);
        return response.data ?? null;
      } catch (error: any) {
        if (error?.status === 404 || error?.response?.status === 404) return null;
        throw error;
      }
    },
    enabled: !!spaceId,
    retry: false,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targetProId,
      payload,
    }: {
      targetProId: string;
      payload: ReviewRequest;
    }) => {
      await collaborationApi.submitReview(targetProId, payload);
      return { targetProId };
    },
    onSuccess: ({ targetProId }) => {
      toast.success('Avis publie avec succes');
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.reviews(targetProId) });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Impossible de publier votre avis.'));
    },
  });
}

/**
 * Hook combining multiple space mutations. 
 */
export function useCollaborationActions() {
  const queryClient = useQueryClient();

  const handleSuccess = (message: string, spaceId?: string) => {
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.mySpaces() });
    if (spaceId) {
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.detail(spaceId) });
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.brief(spaceId) });
    }
  };

  const handleError = (error: any) => {
    toast.error(getErrorMessage(error, 'An error occurred with this operation'));
  };

  const createSpace = useMutation({
    mutationFn: (params: CreateSpaceParams) => collaborationService.createSpace(params),
    onSuccess: () => handleSuccess('Collaboration space initialized'),
    onError: handleError,
  });

  const sendMessage = useMutation({
    mutationFn: ({ spaceId, params }: { spaceId: string; params: SendMessageParams }) =>
      collaborationService.sendMessage(spaceId, params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.messages(variables.spaceId) });
    },
    onError: handleError,
  });

  const acceptRequest = useMutation({
    mutationFn: (id: string) => collaborationService.acceptRequest(id),
    onSuccess: (_, id) => handleSuccess('Collaboration request accepted', id),
    onError: handleError,
  });

  const rejectRequest = useMutation({
    mutationFn: (id: string) => collaborationService.rejectRequest(id),
    onSuccess: (_, id) => handleSuccess('Collaboration request rejected', id),
    onError: handleError,
  });

  const saveBrief = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CollaborationBriefRequest | CollaborationBriefPatchRequest }) =>
      collaborationService.saveBrief(id, payload),
    onSuccess: (_, { id }) => handleSuccess('Brief enregistré avec succès', id),
    onError: handleError,
  });

  const patchBrief = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CollaborationBriefPatchRequest }) =>
      collaborationService.patchBrief(id, payload),
    onSuccess: (_, { id }) => handleSuccess('Brief mis à jour avec succès', id),
    onError: handleError,
  });

  const submitBriefPhase = useMutation({
    mutationFn: (id: string) => collaborationService.submitBriefPhase(id),
    onSuccess: (_, id) => handleSuccess('Brief soumis avec succès', id),
    onError: handleError,
  });

  const acknowledgeBrief = useMutation({
    mutationFn: (id: string) => collaborationService.acknowledgeBrief(id),
    onSuccess: (_, id) => handleSuccess('Brief confirmé avec succès', id),
    onError: handleError,
  });

  const uploadBriefFiles = useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) =>
      collaborationService.uploadBriefFiles(id, files),
    onSuccess: (_, { id }) => handleSuccess('Fichiers du brief ajoutés avec succès', id),
    onError: handleError,
  });

  const deleteBriefFile = useMutation({
    mutationFn: ({ id, fileId }: { id: string; fileId: string }) =>
      collaborationService.deleteBriefFile(id, fileId),
    onSuccess: (_, { id }) => handleSuccess('Fichier du brief supprimé avec succès', id),
    onError: handleError,
  });

  const signContract = useMutation({
    mutationFn: (id: string) => collaborationService.signContract(id),
    onSuccess: (_, id) => handleSuccess('Contrat signé avec succès', id),
    onError: handleError,
  });

  const confirmPayment = useMutation({
    mutationFn: ({ id, payload = {} }: { id: string; payload?: ConfirmPaymentRequest }) =>
      collaborationService.confirmPayment(id, payload),
    onSuccess: (_, { id }) => handleSuccess('Paiement confirmé', id),
    onError: handleError,
  });

  const startCollaboration = useMutation({
    mutationFn: (id: string) => collaborationService.startCollaboration(id),
    onSuccess: (_, id) => handleSuccess('Collaboration démarrée', id),
    onError: handleError,
  });

  const submitDeliverable = useMutation({
    mutationFn: ({ id, params }: { id: string; params: SubmitDeliverableParams }) =>
      collaborationService.submitDeliverable(id, params),
    onSuccess: (_, { id }) => handleSuccess('Livrable soumis avec succès', id),
    onError: handleError,
  });

  const releasePayment = useMutation({
    mutationFn: (id: string) => collaborationService.releasePayment(id),
    onSuccess: (_, id) => handleSuccess('Paiement libéré avec succès', id),
    onError: handleError,
  });

  const closeSpace = useMutation({
    mutationFn: ({ id, payload = {} }: { id: string; payload?: CloseSpaceRequest }) =>
      collaborationService.closeSpace(id, payload),
    onSuccess: (_, { id }) => handleSuccess('Collaboration clôturée', id),
    onError: handleError,
  });

  // ─── Contract ──────────────────────────────────────────────────────────────

  const downloadContractPdf = useMutation({
    mutationFn: async (id: string) => {
      const blob = await collaborationService.downloadContractPdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrat-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: handleError,
  });

  // ─── Etapes / Milestones ───────────────────────────────────────────────────

  const createEtape = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateEtapeRequest }) =>
      collaborationService.createEtape(id, payload),
    onSuccess: (_, { id }) => {
      toast.success('Jalon créé avec succès');
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.etapes(id) });
    },
    onError: handleError,
  });

  const updateEtape = useMutation({
    mutationFn: ({ id, etapeId, payload }: { id: string; etapeId: string; payload: UpdateEtapeRequest }) =>
      collaborationService.updateEtape(id, etapeId, payload),
    onSuccess: (_, { id }) => {
      toast.success('Jalon mis à jour');
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.etapes(id) });
    },
    onError: handleError,
  });

  const deleteEtape = useMutation({
    mutationFn: ({ id, etapeId }: { id: string; etapeId: string }) =>
      collaborationService.deleteEtape(id, etapeId),
    onSuccess: (_, { id }) => {
      toast.success('Jalon supprimé');
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.etapes(id) });
    },
    onError: handleError,
  });

  const confirmMilestonePlan = useMutation({
    mutationFn: (id: string) => collaborationService.confirmMilestonePlan(id),
    onSuccess: (data, id) => {
      const msg = data.data?.planLocked
        ? 'Plan verrouillé — les deux parties ont confirmé'
        : 'Confirmation enregistrée — en attente de l\'autre partie';
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.etapes(id) });
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.detail(id) });
    },
    onError: handleError,
  });

  const updateEtapeStatus = useMutation({
    mutationFn: ({ id, etapeId, payload }: { id: string; etapeId: string; payload: UpdateEtapeStatusRequest }) =>
      collaborationService.updateEtapeStatus(id, etapeId, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.etapes(id) });
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.paymentSummary(id) });
    },
    onError: handleError,
  });

  const reorderEtapes = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReorderEtapesRequest }) =>
      collaborationService.reorderEtapes(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.etapes(id) });
    },
    onError: handleError,
  });

  // ─── Deliverables ──────────────────────────────────────────────────────────

  const submitEtapeDeliverable = useMutation({
    mutationFn: ({ id, etapeId, formData }: { id: string; etapeId: string; formData: FormData }) =>
      collaborationService.submitEtapeDeliverable(id, etapeId, formData),
    onSuccess: (_, { id, etapeId }) => {
      toast.success('Livrable soumis avec succès');
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.etapeDeliverables(id, etapeId) });
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.etapes(id) });
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.detail(id) });
    },
    onError: handleError,
  });

  // ─── Dispute ───────────────────────────────────────────────────────────────

  const triggerDispute = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TriggerDisputeRequest }) =>
      collaborationService.triggerDispute(id, payload),
    onSuccess: (_, { id }) => {
      toast.success('Litige ouvert — un administrateur va examiner votre demande');
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.dispute(id) });
      queryClient.invalidateQueries({ queryKey: COLLABORATION_KEYS.detail(id) });
    },
    onError: handleError,
  });

  return {
    createSpace,
    sendMessage,
    acceptRequest,
    rejectRequest,
    saveBrief,
    patchBrief,
    submitBriefPhase,
    acknowledgeBrief,
    uploadBriefFiles,
    deleteBriefFile,
    signContract,
    downloadContractPdf,
    confirmPayment,
    startCollaboration,
    createEtape,
    updateEtape,
    deleteEtape,
    confirmMilestonePlan,
    updateEtapeStatus,
    reorderEtapes,
    submitEtapeDeliverable,
    submitDeliverable,
    releasePayment,
    triggerDispute,
    closeSpace,
  };
}
