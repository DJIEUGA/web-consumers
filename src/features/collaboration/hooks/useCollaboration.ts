import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collaborationService } from '../services/collaboration.service';
import collaborationApi, { type PublicReviewItem, type ReviewRequest } from '../services/collaborationApi';
import type { 
  CreateSpaceParams, 
  SendMessageParams, 
  SubmitDeliverableParams
} from '../types';
import { toast } from 'sonner';

export const COLLABORATION_KEYS = {
  all: ['collaborations'] as const,
  mySpaces: () => [...COLLABORATION_KEYS.all, 'me'] as const,
  detail: (id: string) => [...COLLABORATION_KEYS.all, 'detail', id] as const,
  messages: (spaceId: string) => [...COLLABORATION_KEYS.all, 'messages', spaceId] as const,
  reviews: (proId: string) => [...COLLABORATION_KEYS.all, 'reviews', proId] as const,
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
 * Fetch details of a single workspace by ID
 */
export function useSpaceDetail(id: string | undefined) {
  return useQuery({
    queryKey: COLLABORATION_KEYS.detail(id!),
    queryFn: async () => {
      const response = await collaborationService.getSpaceDetail(id!);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Fetch messages inside a workspace
 */
export function useSpaceMessages(spaceId: string | undefined) {
  return useQuery({
    queryKey: COLLABORATION_KEYS.messages(spaceId!),
    queryFn: async () => {
      const response = await collaborationService.getMessages(spaceId!);
      return response.data;
    },
    enabled: !!spaceId,
    // Realtime behavior placeholder:
    // refetchInterval: 5000, 
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
      handleSuccess('Message sent');
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

  const signContract = useMutation({
    mutationFn: (id: string) => collaborationService.signContract(id),
    onSuccess: (_, id) => handleSuccess('Contract signed successfully', id),
    onError: handleError,
  });

  const submitDeliverable = useMutation({
    mutationFn: ({ id, params }: { id: string; params: SubmitDeliverableParams }) =>
      collaborationService.submitDeliverable(id, params),
    onSuccess: (_, variables) => handleSuccess('Deliverable submitted successfully', variables.id),
    onError: handleError,
  });

  const releasePayment = useMutation({
    mutationFn: (id: string) => collaborationService.releasePayment(id),
    onSuccess: (_, id) => handleSuccess('Payment released successfully', id),
    onError: handleError,
  });

  const closeSpace = useMutation({
    mutationFn: (id: string) => collaborationService.closeSpace(id),
    onSuccess: (_, id) => handleSuccess('Collaboration space closed', id),
    onError: handleError,
  });

  return {
    createSpace,
    sendMessage,
    acceptRequest,
    rejectRequest,
    signContract,
    submitDeliverable,
    releasePayment,
    closeSpace,
  };
}
