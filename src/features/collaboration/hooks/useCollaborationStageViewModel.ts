import type React from "react";
import type {
  AvisState,
  BriefState,
  CollaborationActor,
  CollaborationDecisionState,
  ContratAccepteState,
  ProjectEtape,
  UiMessage,
} from "@/features/collaboration/types/workflow";

type PersonSummary = {
  nom: string;
  photo: string;
  poste?: string;
  entreprise?: string;
};

type UseCollaborationStageViewModelParams = {
  messages: UiMessage[];
  porteur: PersonSummary;
  freelance: PersonSummary;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  sendMessage: () => Promise<void>;
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
  validerBrief: () => void;
  confirmerReceptionBrief: () => void;
  toggleLivrable: (livrable: string) => void;
  contratAccepte: ContratAccepteState;
  setContratAccepte: React.Dispatch<React.SetStateAction<ContratAccepteState>>;
  accepterContrat: (partie: keyof ContratAccepteState) => void;
  modePaiement: string;
  setModePaiement: React.Dispatch<React.SetStateAction<string>>;
  etapes: ProjectEtape[];
  paiementDepose: boolean;
  deposerPaiement: () => void;
  getStatutBadge: (statut: string) => React.ReactNode;
  livrerEtape: (etapeId: number) => void;
  validerEtape: (etapeId: number) => void;
  demanderModification: (etapeId: number) => void;
  setEtapes: React.Dispatch<React.SetStateAction<ProjectEtape[]>>;
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
  validerBrief,
  confirmerReceptionBrief,
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
    messages,
    porteurPhoto: porteur.photo,
    freelancePhoto: freelance.photo,
    newMessage,
    onMessageChange: setNewMessage,
    handleKeyPress,
    onSendMessage: sendMessage,
    isMessagingLocked,
    messagingStatusNotice,
    messagesEndRef,
    isRecording,
    onToggleRecording: () => setIsRecording((prev) => !prev),
    canPropose,
    onProposeCollaboration: proposerCollaboration,
  };

  const decision = {
    isPro,
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
    validerBrief,
    confirmerReceptionBrief,
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
    isMessagingLocked,
    messagingStatusNotice,
    porteurPhoto: porteur.photo,
    freelancePhoto: freelance.photo,
    messagesEndRef,
    setEtapes,
    transitionToStep,
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
  };

  return {
    contact,
    decision,
    match,
    briefStep,
    contract,
    payment,
    execution,
    closure,
  };
};