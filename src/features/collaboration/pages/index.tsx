import React, { useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  FiX,
  FiMenu,
  FiCheck,
  FiClock,
  FiDollarSign,
  FiMessageCircle,
  FiCheckCircle,
  FiAlertCircle,
  FiStar,
  FiUpload,
  FiEdit3,
  FiTarget,
  FiArrowLeft,
  FiPlay,
  FiRefreshCw,
  FiShield,
  FiMapPin,
  FiBriefcase,
} from "react-icons/fi";
import Logo from "@/components/shared/Logo";
import { useAuthStore } from "@/stores/auth.store";
import {
  type CollaborationSpaceResponse,
} from "@/features/collaboration/services/collaborationApi";
import {
  useCollaborationActions,
  useMySpaces,
  useSubmitReview,
} from "@/features/collaboration/hooks/useCollaboration";
import { ErrorState } from "@/components/ui/ErrorState";
import { useCollaborationWorkspaceState } from "@/features/collaboration/hooks/useCollaborationWorkspaceState";
import { useCollaborationStageViewModel } from "@/features/collaboration/hooks/useCollaborationStageViewModel";
import { useCollaborationWorkspaceSync } from "@/features/collaboration/hooks/useCollaborationWorkspaceSync";
import { useCollaborationProfiles } from "@/features/collaboration/hooks/useCollaborationProfiles";
import {
  LIVRABLES_SUGGESTIONS,
  PROCESS_STEPS,
  STEP_TO_STAGE,
  canActorPerformAction,
} from "@/features/collaboration/constants/workflow";
import {
  buildRoomId,
  clampStep,
  createUiMessage,
  getProfilePayload,
  isMessageBlockedByStatus,
  isUuidLike,
  parseRoomPair,
} from "@/features/collaboration/utils/workflow";
import { useMyProfile } from "@/features/profile/hooks/useProfileActions";
import type {
  CollaborationActor,
  CollaborationAction,
  CollaborationDecisionState,
  CollaborationEventType,
  CollaborationLifecycleEvent,
  UiMessage,
} from "@/features/collaboration/types/workflow";
import {
  StepContact,
  StepDecision,
  StepBrief,
  StepClosure,
  StepContract,
  StepDelivery,
  StepExecution,
  StepMatch,
  StepPayment,
  StepRelease,
} from "@/features/collaboration/components/CollaborationStages";
import { toast } from "sonner";
import "../styles/collaboration/style.css";

export const CollaborationSpace = () => {
  const navigate = useNavigate();
  const { freelanceId, spaceId } = useParams();
  const [searchParams] = useSearchParams();
  const authUser = useAuthStore((state) => state.user);
  const authRole = useAuthStore((state) => state.role);
  const myProfileQuery = useMyProfile();
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myProfilePayload = useMemo(
    () => getProfilePayload(myProfileQuery.data),
    [myProfileQuery.data],
  );

  const currentUserProfile = useMemo(() => {
    const profile =
      myProfilePayload?.profile && typeof myProfilePayload.profile === "object"
        ? (myProfilePayload.profile as Record<string, unknown>)
        : (myProfilePayload as Record<string, unknown>);

    return profile && Object.keys(profile).length > 0 ? profile : null;
  }, [myProfilePayload]);

  const currentUserFromProfile = useMemo(() => {
    if (!currentUserProfile) return null;
    const nestedUser =
      currentUserProfile.user && typeof currentUserProfile.user === "object"
        ? (currentUserProfile.user as Record<string, unknown>)
        : null;

    return {
      ...nestedUser,
      ...currentUserProfile,
    } as Record<string, unknown>;
  }, [currentUserProfile]);

  const roleValue = String(
    currentUserFromProfile?.role ||
      currentUserFromProfile?.userRole ||
      myProfilePayload?.role ||
      myProfilePayload?.userRole ||
      authRole ||
      authUser?.role ||
      "",
  ).toUpperCase();
  const actor: CollaborationActor =
    roleValue === "ROLE_CUSTOMER" || roleValue === "ROLE_ENTERPRISE"
    ? "customer"
    : roleValue === "ROLE_PRO"
      ? "pro"
      : "other";
  const isCustomer = actor === "customer";
  const isPro = actor === "pro";

  const {
    sendMessage: sendMessageMutation,
    acceptRequest,
    rejectRequest,
    submitBrief: submitBriefMutation,
    signContract: signContractMutation,
    confirmPayment: confirmPaymentMutation,
    submitDeliverable: submitDeliverableMutation,
    releasePayment: releasePaymentMutation,
    closeSpace: closeSpaceMutation,
  } = useCollaborationActions();

  const mySpacesQuery = useMySpaces();
  const currentUserId = String(
    currentUserFromProfile?.userId ||
      currentUserFromProfile?.id ||
      authUser?.id ||
      "",
  ).trim();
  const incomingId = String(spaceId || freelanceId || "").trim();
  const [backendSpace, setBackendSpace] = useState<CollaborationSpaceResponse | null>(null);

  const collaborationRoomId = (() => {
    if (!incomingId) return "room:anonymous";
    if (incomingId.startsWith("room:")) return incomingId;
    if (isUuidLike(incomingId)) return incomingId;

    if (roleValue === "ROLE_CUSTOMER" && currentUserId) {
      return buildRoomId(currentUserId, incomingId);
    }

    if (roleValue === "ROLE_PRO" && currentUserId) {
      return buildRoomId(incomingId, currentUserId);
    }

    return incomingId;
  })();

  const resolvedSpaceId = useMemo(() => {
    if (backendSpace?.id) return backendSpace.id;
    const spaces = mySpacesQuery.data || [];
    if (incomingId && isUuidLike(incomingId)) {
      const exactSpace = spaces.find((space) => space.id === incomingId);
      if (exactSpace?.id) return exactSpace.id;
    }
    const pair = parseRoomPair(collaborationRoomId);
    if (pair) {
      const matchedByPair = spaces.find(
        (space) =>
          space.customerId === pair.customerId && space.proId === pair.proId,
      );
      if (matchedByPair?.id) return matchedByPair.id;
    }
    return "";
  }, [backendSpace?.id, collaborationRoomId, incomingId, mySpacesQuery.data]);

  const {
    freelance,
    porteur,
    isFreelanceIdentityLoading,
    isOwnerIdentityLoading,
    sidebarIdentityLoading,
    sidebarProfile,
    profileError,
    sidebarError,
    sidebarErrorMessage,
  } = useCollaborationProfiles({
    isPro,
    isCustomer,
    currentUserId,
    incomingId,
    resolvedSpaceId,
    isSpaceLoading: mySpacesQuery.isLoading || (!!incomingId && isUuidLike(incomingId) && !backendSpace),
    backendSpace,
    authUser,
    currentUserProfile,
  });

  // États de la collaboration
  const [currentStep, setCurrentStep] = useState(0); 
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [decisionState, setDecisionState] = useState<CollaborationDecisionState>("pending");
  const [lifecycleEvents, setLifecycleEvents] = useState<CollaborationLifecycleEvent[]>([]);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);
  const [hasExistingReview, setHasExistingReview] = useState(false);

  // États des données
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const currentStage = STEP_TO_STAGE[currentStep] ?? "CONTACT";

  const appendLifecycleEvent = (
    type: CollaborationEventType,
    payload?: Record<string, unknown>,
  ) => {
    const eventStage = STEP_TO_STAGE[currentStep] ?? "CONTACT";
    const event: CollaborationLifecycleEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      actor,
      stage: eventStage,
      roomId: collaborationRoomId,
      createdAt: new Date().toISOString(),
      payload,
    };
    setLifecycleEvents((prev) => [...prev, event]);
  };

  const transitionToStep = (
    nextStep: number,
    eventType: CollaborationEventType,
    payload?: Record<string, unknown>,
  ) => {
    const clamped = clampStep(nextStep);
    setCurrentStep(clamped);
    appendLifecycleEvent(eventType, {
      ...(payload || {}),
      fromStep: currentStep,
      toStep: clamped,
      fromStage: currentStage,
      toStage: STEP_TO_STAGE[clamped],
    });
  };

  const queueStepTransition = (step: number, reason: string, delayMs?: number) => {
    if (typeof delayMs === "number" && delayMs > 0) {
      setTimeout(() => {
        transitionToStep(step, "STEP_CHANGED", { reason });
      }, delayMs);
      return;
    }
    transitionToStep(step, "STEP_CHANGED", { reason });
  };

  const mapBackendMessageToUi = useCallback(
    (msg: {
      id: string;
      senderId: string;
      content: string;
      sentAt?: string;
      createdAt?: string;
    }): UiMessage => {
      const selfSender: UiMessage["sender"] = isCustomer ? "porteur" : "freelance";
      const otherSender: UiMessage["sender"] = selfSender === "porteur" ? "freelance" : "porteur";
      return createUiMessage({
        id: String(msg.id),
        sender: msg.senderId === currentUserId ? selfSender : otherSender,
        text: msg.content,
        dateInput: msg.sentAt || msg.createdAt,
      });
    },
    [currentUserId, isCustomer],
  );

  const {
    brief,
    setBrief,
    briefProgress,
    etapes,
    setEtapes,
    contratAccepte,
    setContratAccepte,
    paiementDepose,
    modePaiement,
    setModePaiement,
    avis,
    setAvis,
    toggleLivrable,
    accepterContrat,
    deposerPaiement,
    livrerEtape,
    validerEtape,
    demanderModification,
    initEtapesFromBrief,
  } = useCollaborationWorkspaceState({
    onAdvanceStep: queueStepTransition,
  });

  const { spaceMessagesQuery } = useCollaborationWorkspaceSync({
    incomingId,
    collaborationRoomId,
    resolvedSpaceId,
    currentUserId,
    navigate,
    mySpacesData: mySpacesQuery.data,
    mySpacesIsError: mySpacesQuery.isError,
    backendSpace,
    setBackendSpace,
    messages,
    setMessages,
    currentStep,
    setCurrentStep,
    decisionState,
    setDecisionState,
    lifecycleEvents,
    setLifecycleEvents,
    stepQueryParam: searchParams.get("step"),
    mapBackendMessageToUi,
    messagesEndRef,
  });

  const sendBackendMessage = async (content: string, optimisticId: string) => {
    const sId = backendSpace?.id || resolvedSpaceId;
    if (!sId) return false;
    try {
      const sentEnvelope = await sendMessageMutation.mutateAsync({
        spaceId: sId,
        params: { content },
      });
      const sent = sentEnvelope.data;
      const sentUi = mapBackendMessageToUi(sent);
      setMessages((prev: UiMessage[]) => {
        const withoutOptimistic = prev.filter((msg) => msg.id !== optimisticId);
        if (withoutOptimistic.some((msg) => msg.id === sentUi.id)) return withoutOptimistic;
        return [...withoutOptimistic, sentUi];
      });
      return true;
    } catch (error: any) {
      setMessages((prev: UiMessage[]) =>
        prev.map((msg) =>
          msg.id === optimisticId ? { ...msg, deliveryStatus: "failed" } : msg,
        ),
      );
      toast.error(error?.message || "Échec d'envoi");
      return false;
    }
  };

  const sendMessage = async () => {
    const content = newMessage.trim();
    if (!content) return;
    const sId = backendSpace?.id || resolvedSpaceId;
    if (sId) {
      const selfSender: UiMessage["sender"] = isCustomer ? "porteur" : "freelance";
      const optimisticId = `optimistic:${Date.now()}`;
      setMessages((prev: UiMessage[]) => [...prev, { ...createUiMessage({ id: optimisticId, sender: selfSender, text: content }), deliveryStatus: "sending" }]);
      setNewMessage("");
      await sendBackendMessage(content, optimisticId);
    } else {
      const selfSender: UiMessage["sender"] = isCustomer ? "porteur" : "freelance";
      setMessages((prev) => [...prev, createUiMessage({ id: String(Date.now()), sender: selfSender, text: content })]);
      setNewMessage("");
    }
  };

  const handleAcceptRequest = async () => {
    const sId = backendSpace?.id || resolvedSpaceId;
    if (sId) {
      try {
        await acceptRequest.mutateAsync(sId);
      } catch (err: any) { toast.error(err?.message); }
    } else {
      setDecisionState("accepted");
      setShowMatchAnimation(true);
      queueStepTransition(2, "Match confirmed", 3000);
    }
  };

  const handleDeclineRequest = async () => {
    const sId = backendSpace?.id || resolvedSpaceId;
    if (sId) {
      try {
        await rejectRequest.mutateAsync(sId);
      } catch (err: any) { toast.error(err?.message); }
    } else {
      setDecisionState("declined");
    }
  };

  const handleValidateBrief = async () => {
    const sId = backendSpace?.id || resolvedSpaceId;
    if (sId) {
      try {
        await submitBriefMutation.mutateAsync({
          id: sId,
          payload: { objective: brief.objectif, deliverables: brief.livrables, deadline: brief.delai, budget: brief.budget },
        });
      } catch (err: any) { toast.error(err?.message); }
    } else {
      initEtapesFromBrief(brief.livrables, brief.budget);
      transitionToStep(4, "STEP_CHANGED", { reason: "Brief validated" });
    }
  };

  const handleSignContract = async () => {
    const sId = backendSpace?.id || resolvedSpaceId;
    if (sId) {
      try { await signContractMutation.mutateAsync(sId); } catch (err: any) { toast.error(err?.message); }
    } else {
      accepterContrat(isPro ? "freelance" : "porteur");
    }
  };

  const handleConfirmPayment = async () => {
    const sId = backendSpace?.id || resolvedSpaceId;
    if (sId) {
      try { await confirmPaymentMutation.mutateAsync(sId); } catch (err: any) { toast.error(err?.message); }
    } else {
      deposerPaiement();
    }
  };

  const handleSubmitDeliverable = async () => {
    const sId = backendSpace?.id || resolvedSpaceId;
    if (sId) {
      try {
        await submitDeliverableMutation.mutateAsync({
          id: sId,
          params: {},
        });
      } catch (err: any) { toast.error(err?.message); }
    } else {
      livrerEtape(1);
    }
  };

  const { mutateAsync: submitReviewMutation, isPending: submitReviewPending } = useSubmitReview();

  const handleFinalSubmitReview = async () => {
    if (!resolvedSpaceId || !freelance.id) return;
    try {
      await submitReviewMutation({
        targetProId: String(freelance.id),
        payload: { rating: avis.note, comment: avis.commentaire },
      });
      setReviewSubmitSuccess(true);
    } catch (err) {}
  };

  const stageViewModel = useCollaborationStageViewModel({
    messages,
    porteur,
    freelance,
    newMessage,
    setNewMessage,
    handleKeyPress: (e) => e.key === "Enter" && sendMessage(),
    sendMessage,
    onRetryMessage: async (id) => { await sendBackendMessage(messages.find(m => m.id === id)?.text || "", id); },
    isMessagingLocked: isMessageBlockedByStatus(backendSpace?.status || "PENDING"),
    messagingStatusNotice: "Messagerie verrouillée",
    messagesEndRef,
    isRecording,
    setIsRecording,
    canPropose: currentStep === 0 && isCustomer,
    proposerCollaboration: async () => transitionToStep(1, "COLLABORATION_PROPOSED"),
    isPro,
    requestContextMessage: "Demande de collaboration",
    actor,
    decisionState,
    accepterCollaboration: handleAcceptRequest,
    demanderPlusInfos: () => setDecisionState("more_info"),
    refuserCollaboration: handleDeclineRequest,
    transitionToStep,
    isOwnerIdentityLoading,
    isFreelanceIdentityLoading,
    canOpenBrief: currentStep === 2 && isCustomer,
    brief,
    setBrief,
    briefProgress,
    livrablesSuggestions: LIVRABLES_SUGGESTIONS,
    isCustomer,
    validerBrief: handleValidateBrief,
    confirmerReceptionBrief: () => transitionToStep(4, "STEP_CHANGED"),
    toggleLivrable,
    contratAccepte,
    setContratAccepte,
    accepterContrat: async (p) => accepterContrat(p),
    modePaiement,
    setModePaiement,
    etapes,
    paiementDepose,
    deposerPaiement: handleConfirmPayment,
    getStatutBadge: (s) => <span>{s}</span>,
    livrerEtape,
    validerEtape,
    demanderModification,
    setEtapes,
    soumettrelivrable: handleSubmitDeliverable,
    libererPaiement: async () => {
      const sId = backendSpace?.id || resolvedSpaceId;
      if (sId) await releasePaymentMutation.mutateAsync(sId);
      else transitionToStep(9, "STEP_CHANGED");
    },
    cloturerEspace: async () => {
      const sId = backendSpace?.id || resolvedSpaceId;
      if (sId) await closeSpaceMutation.mutateAsync(sId);
      navigate("/dashboard");
    },
    isCheckingExistingReview: false,
    hasExistingReview,
    avis,
    setAvis: (val) => {
      if (typeof val === 'function') setAvis(prev => ({ ...val(prev), recommande: prev.recommande }));
      else setAvis({ ...val, recommande: null });
    },
    renderStars: (n) => <span>{n}⭐</span>,
    onBackMarketplace: () => navigate("/marketplace"),
    submitReview: handleFinalSubmitReview,
    submitReviewPending,
    reviewSubmitSuccess,
  });

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorState
          icon={<FiAlertCircle size={48} />}
          title="Collaboration introuvable"
          description={sidebarErrorMessage || "Erreur de chargement"}
          action={{ label: "Retour", onClick: () => navigate("/dashboard") }}
        />
      </div>
    );
  }

  return (
    <div className="collab-container">
      <header className="collab-header">
        <div className="header-left">
          <button onClick={() => navigate(-1)} className="back-button"><FiArrowLeft /></button>
          <div className="header-info">
            <h1 className="header-title">Collaboration avec {isCustomer ? freelance.nom : porteur.nom}</h1>
            <div className="header-status">
              <span className={`status-dot step-${currentStep}`}></span>
              <span className="status-text">{PROCESS_STEPS[currentStep].label}</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="icon-button mobile-only" onClick={() => setMenuOpen(!menuOpen)}><FiMenu /></button>
          <div className="desktop-actions"><button className="help-button"><FiShield /> Aide</button></div>
        </div>
      </header>

      <main className="collab-main">
        <aside className={`collab-sidebar ${menuOpen ? "open" : ""}`}>
          <div className="sidebar-section profile-card-mini">
            {sidebarIdentityLoading ? <div>Chargement...</div> : sidebarError ? <div>{sidebarErrorMessage}</div> : (
              <>
                <div className="profile-header-mini">
                  <img src={sidebarProfile.photo} alt={sidebarProfile.nom} className="avatar-md" />
                  <div className="profile-meta-mini">
                    <h3>{sidebarProfile.nom}</h3>
                    <p>{sidebarProfile.poste}</p>
                    {sidebarProfile.verified && <span className="verified-badge"><FiCheckCircle /> Vérifié</span>}
                  </div>
                </div>
                <div className="profile-stats-mini">
                  <div className="stat-item"><FiStar className="stat-icon star" /><span>{sidebarProfile.note} ({sidebarProfile.avis})</span></div>
                  <div className="stat-item"><FiMapPin className="stat-icon" /><span>{sidebarProfile.location}</span></div>
                </div>
              </>
            )}
          </div>
          <div className="sidebar-section workflow-progress">
            <h4>Progression</h4>
            <div className="steps-vertical">
              {PROCESS_STEPS.map((step, idx) => (
                <div key={idx} className={`step-item ${idx <= currentStep ? "active" : ""} ${idx === currentStep ? "current" : ""}`}>
                  <div className="step-number">{idx < currentStep ? <FiCheck /> : idx + 1}</div>
                  <div className="step-label">{step.label}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="collab-workspace">
          <div className="workspace-content">
            {currentStep === 0 && <StepContact {...stageViewModel.contact} />}
            {currentStep === 1 && <StepDecision {...stageViewModel.decision} />}
            {currentStep === 2 && <StepMatch {...stageViewModel.match} />}
            {currentStep === 3 && <StepBrief {...stageViewModel.briefStep} />}
            {currentStep === 4 && <StepContract {...stageViewModel.contract} />}
            {currentStep === 5 && <StepPayment {...stageViewModel.payment} />}
            {currentStep === 6 && <StepExecution {...stageViewModel.execution} />}
            {currentStep === 7 && <StepDelivery {...stageViewModel.delivery} />}
            {currentStep === 8 && <StepRelease {...stageViewModel.release} />}
            {currentStep === 9 && <StepClosure {...stageViewModel.closure} />}
          </div>
        </section>

        <aside className="collab-messages">
          <div className="messages-header"><h3>Messagerie</h3></div>
          <div className="messages-list">
            {messages.length === 0 ? <div className="empty-messages"><FiMessageCircle /><p>Aucun message</p></div> : 
              messages.map((msg) => (
                <div key={msg.id} className={`message-bubble ${msg.sender === (isCustomer ? "porteur" : "freelance") ? "own" : ""}`}>
                  <div className="message-content"><p>{msg.text}</p><span className="message-time">{msg.time}</span></div>
                </div>
              ))
            }
            <div ref={messagesEndRef} />
          </div>
          <div className="message-input-area">
            <input type="text" placeholder="Message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()} />
            <button className="send-button" onClick={sendMessage}>Envoyer</button>
          </div>
        </aside>
      </main>
      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)}></div>}
    </div>
  );
};

export default CollaborationSpace;
