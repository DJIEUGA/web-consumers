import type React from "react";
import type {
  CollaborationCardSummary,
} from "@/features/collaboration/types";
import type {
  AvisState,
  BriefState,
  CollaborationActor,
  CollaborationDecisionState,
  ContratAccepteState,
  ProjectEtape,
  UiMessage,
} from "@/features/collaboration/types/workflow";

type UseCollaborationStageViewModelParams = {
  messages: UiMessage[];
  porteur: CollaborationCardSummary;
  freelance: CollaborationCardSummary;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  sendMessage: () => Promise<void>;
  onRetryMessage: (messageId: string) => Promise<void>;
  isMessagingLocked: boolean;
  messagingStatusNotice: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  canPropose: boolean;
  proposerCollaboration: () => Promise<void>;
  isPro: boolean;
  requestContextMessage: string;
  actor: CollaborationActor;
  decisionState: CollaborationDecisionState;
  accepterCollaboration: () => Promise<void>;
  demanderPlusInfos: () => void;
  refuserCollaboration: () => Promise<void>;
  transitionToStep: (
    nextStep: number,
    eventType: "STEP_CHANGED" | "BRIEF_OPENED",
    payload?: Record<string, unknown>,
  ) => void;
  isOwnerIdentityLoading: boolean;
  isFreelanceIdentityLoading: boolean;
  canOpenBrief: boolean;
  brief: BriefState;
  setBrief: React.Dispatch<React.SetStateAction<BriefState>>;
  briefProgress: number;
  livrablesSuggestions: string[];
  isCustomer: boolean;
  saveBrief: () => Promise<void>;
  submitBrief: () => Promise<void>;
  acknowledgeBrief: () => Promise<void>;
  onUploadFiles: (files: File[]) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  toggleLivrable: (livrable: string) => void;
  contratAccepte: ContratAccepteState;
  setContratAccepte: React.Dispatch<React.SetStateAction<ContratAccepteState>>;
  accepterContrat: (partie: keyof ContratAccepteState) => Promise<void>;
  modePaiement: string;
  setModePaiement: React.Dispatch<React.SetStateAction<string>>;
  etapes: ProjectEtape[];
  paiementDepose: boolean;
  deposerPaiement: () => Promise<void>;
  getStatutBadge: (statut: string) => React.ReactNode;
  livrerEtape: (etapeId: string) => void;
  validerEtape: (etapeId: string) => void;
  demanderModification: (etapeId: string) => void;
  setEtapes: React.Dispatch<React.SetStateAction<ProjectEtape[]>>;
  soumettrelivrable: () => Promise<void>;
  libererPaiement: () => Promise<void>;
  cloturerEspace: () => Promise<void>;
  isCheckingExistingReview: boolean;
  hasExistingReview: boolean;
  avis: AvisState;
  setAvis: React.Dispatch<React.SetStateAction<AvisState>>;
  renderStars: (note: number, interactive?: boolean) => React.ReactNode;
  onBackMarketplace: () => void;
  submitReview: () => Promise<void>;
  submitReviewPending: boolean;
  reviewSubmitSuccess: boolean;
};

export const useCollaborationStageViewModel = ({
  messages,
  porteur,
  freelance,
  newMessage,
  setNewMessage,
  handleKeyPress,
  sendMessage,
  onRetryMessage,
  isMessagingLocked,
  messagingStatusNotice,
  messagesEndRef,
  isRecording,
  setIsRecording,
  canPropose,
  proposerCollaboration,
  isPro,
  requestContextMessage,
  actor,
  decisionState,
  accepterCollaboration,
  demanderPlusInfos,
  refuserCollaboration,
  transitionToStep,
  isOwnerIdentityLoading,
  isFreelanceIdentityLoading,
  canOpenBrief,
  brief,
  setBrief,
  briefProgress,
  livrablesSuggestions,
  isCustomer,
  saveBrief,
  submitBrief,
  acknowledgeBrief,
  onUploadFiles,
  onDeleteFile,
  toggleLivrable,
  contratAccepte,
  setContratAccepte,
  accepterContrat,
  modePaiement,
  setModePaiement,
  etapes,
  paiementDepose,
  deposerPaiement,
  getStatutBadge,
  livrerEtape,
  validerEtape,
  demanderModification,
  setEtapes,
  soumettrelivrable,
  libererPaiement,
  cloturerEspace,
  isCheckingExistingReview,
  hasExistingReview,
  avis,
  setAvis,
  renderStars,
  onBackMarketplace,
  submitReview,
  submitReviewPending,
  reviewSubmitSuccess,
}: UseCollaborationStageViewModelParams) => {
  const contact = {
    isCustomer,
    messages,
    porteurPhoto: porteur.avatarUrl,
    freelancePhoto: freelance.avatarUrl,
    newMessage,
    onMessageChange: setNewMessage,
    handleKeyPress,
    onSendMessage: sendMessage,
    onRetryMessage,
    isMessagingLocked,
    messagingStatusNotice,
    messagesEndRef,
    isRecording,
    onToggleRecording: () => setIsRecording(!isRecording as any),
    canPropose,
    onProposeCollaboration: proposerCollaboration,
  };

  const decision = {
    isPro,
    porteur,
    freelance,
    requestContextMessage,
    actor,
    decisionState,
    onAcceptCollaboration: accepterCollaboration,
    onRequestMoreInfo: demanderPlusInfos,
    onDeclineCollaboration: refuserCollaboration,
    onBackToContact: () =>
      transitionToStep(0, "STEP_CHANGED", {
        reason: "customer_reworks_request",
      }),
  };

  const match = {
    isOwnerIdentityLoading,
    isFreelanceIdentityLoading,
    porteur,
    freelance,
    canOpenBrief,
    onOpenBrief: () =>
      transitionToStep(3, "BRIEF_OPENED", {
        initiatedBy: actor,
      }),
  };

  const briefStep = {
    brief,
    setBrief,
    briefProgress,
    livrablesSuggestions,
    isCustomer,
    onBackToMatch: () => transitionToStep(2, "STEP_CHANGED", { reason: "back_to_match" }),
    saveBrief,
    submitBrief,
    acknowledgeBrief,
    onUploadFiles,
    onDeleteFile,
    toggleLivrable,
    freelance,
  };

  const contract = {
    brief,
    porteur,
    freelance,
    contratAccepte,
    setContratAccepte,
    isCustomer,
    isPro,
    isOwnerIdentityLoading,
    isFreelanceIdentityLoading,
    accepterContrat,
  };

  const payment = {
    isCustomer,
    modePaiement,
    setModePaiement,
    etapes,
    briefBudget: brief.budget,
    paiementDepose,
    deposerPaiement,
  };

  const execution = {
    etapes,
    getStatutBadge,
    isPro,
    isCustomer,
    livrerEtape,
    validerEtape,
    demanderModification,
    messages,
    newMessage,
    setNewMessage,
    handleKeyPress,
    sendMessage,
    onRetryMessage,
    isMessagingLocked,
    messagingStatusNotice,
    porteurPhoto: porteur.avatarUrl,
    freelancePhoto: freelance.avatarUrl,
    messagesEndRef,
    setEtapes,
    transitionToStep,
    onSubmitDeliverable: soumettrelivrable,
  };

  const delivery = {
    isPro,
    isCustomer,
    freelance,
    onSubmitDeliverable: soumettrelivrable,
    onLibererPaiement: libererPaiement,
  };

  const release = {
    isCustomer,
    freelance,
    onLibererPaiement: libererPaiement,
  };

  const closure = {
    etapes,
    isCustomer,
    freelance,
    isCheckingExistingReview,
    hasExistingReview,
    avis,
    setAvis,
    renderStars,
    onBackMarketplace,
    submitReview,
    submitReviewPending,
    reviewSubmitSuccess,
    onCloturerEspace: cloturerEspace,
  };

  return {
    contact,
    decision,
    match,
    briefStep,
    contract,
    payment,
    execution,
    delivery,
    release,
    closure,
  };
};