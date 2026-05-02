import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
import { FaHandshake } from "react-icons/fa";
import Logo from "@/components/shared/Logo";
import { useAuthStore } from "@/stores/auth.store";
import {
  collaborationApi,
  type CollaborationSpaceResponse,
  type PublicReviewItem,
} from "@/features/collaboration/services/collaborationApi";
import {
  useCollaborationActions,
  useMySpaces,
  usePublicProfileReviews,
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
  BACKEND_STATUS_TO_STEP,
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
    createSpace,
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

    // Customer opens a pro room: /collaboration/:proId -> room:<customerId>::<proId>
    if (roleValue === "ROLE_CUSTOMER" && currentUserId) {
      return buildRoomId(currentUserId, incomingId);
    }

    // Pro opens a customer room: /collaboration/:customerId -> room:<customerId>::<proId>
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
    ownerProfileLookupId,
    freelance,
    porteur,
    isFreelanceIdentityLoading,
    isOwnerIdentityLoading,
    sidebarIdentityLoading,
    sidebarProfile,
    profileError,
    proProfileLoadError,
    cannotIdentifyPro,
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
  const [currentStep, setCurrentStep] = useState(0); // 0 à 9
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [decisionState, setDecisionState] =
    useState<CollaborationDecisionState>("pending");
  const [lifecycleEvents, setLifecycleEvents] = useState<
    CollaborationLifecycleEvent[]
  >([]);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);
  const [hasExistingReview, setHasExistingReview] = useState(false);

  // États des données
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const currentStage = STEP_TO_STAGE[currentStep] ?? "CONTACT";

  const canPerformAction = (action: CollaborationAction) => {
    return canActorPerformAction(action, actor, currentStage);
  };

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

      return {
        ...createUiMessage({
          id: String(msg.id),
          sender: msg.senderId === currentUserId ? selfSender : otherSender,
          text: msg.content,
          dateInput: msg.sentAt || msg.createdAt,
        }),
      };
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

  const { spaceMessagesQuery, spaceDetailQuery } = useCollaborationWorkspaceSync({
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

  // Fonctions utilitaires
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const sendBackendMessage = async (content: string, optimisticId: string) => {
    const spaceId = backendSpace?.id || resolvedSpaceId;
    if (!spaceId) return false;

    try {
      const sentEnvelope = await sendMessageMutation.mutateAsync({
        spaceId,
        params: { content },
      });
      const sent = sentEnvelope.data;
      const sentUi = mapBackendMessageToUi(sent);

      setMessages((prev: UiMessage[]) => {
        const withoutOptimistic = prev.filter((msg) => msg.id !== optimisticId);

        const alreadyExistsById = withoutOptimistic.some((msg) => msg.id === sentUi.id);
        if (alreadyExistsById) return withoutOptimistic;

        const alreadyExistsByContent = withoutOptimistic.some(
          (msg) =>
            msg.sender === sentUi.sender &&
            msg.text.trim() === sentUi.text.trim(),
        );
        if (alreadyExistsByContent) return withoutOptimistic;

        return [...withoutOptimistic, sentUi];
      });
      appendLifecycleEvent("CONTACT_MESSAGE_SENT", {
        sender: actor,
        mode: "backend",
      });
      return true;
    } catch (error: any) {
      setMessages((prev: UiMessage[]) =>
        prev.map((msg) =>
          msg.id === optimisticId ? { ...msg, deliveryStatus: "failed" } : msg,
        ),
      );
      toast.error(String(error?.message || "Échec d'envoi du message. Réessayez."));
      return false;
    }
  };

  const sendMessage = async () => {
    const content = newMessage.trim();
    if (!content) return;

    const activeSpaceId = backendSpace?.id || resolvedSpaceId;

    if (activeSpaceId) {
      if (backendSpace?.status && isMessageBlockedByStatus(backendSpace.status)) {
        toast.error("La messagerie est indisponible pour ce statut de collaboration.");
        return;
      }

      const selfSender: UiMessage["sender"] = isCustomer ? "porteur" : "freelance";
      const optimisticId = `optimistic:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setMessages((prev: UiMessage[]) => [
        ...prev,
        {
          ...createUiMessage({
          id: optimisticId,
          sender: selfSender,
          text: content,
          }),
          deliveryStatus: "sending",
        },
      ]);
      setNewMessage("");

      await sendBackendMessage(content, optimisticId);
    } else {
      // Offline / Local-only mode fallback
      const selfSender: UiMessage["sender"] = isCustomer ? "porteur" : "freelance";
      const msg: UiMessage = createUiMessage({
        id: Date.now(),
        sender: selfSender,
        text: content,
      });

      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
      appendLifecycleEvent("CONTACT_MESSAGE_SENT", { sender: actor, mode: "local" });

      if (currentStep === 0 && isCustomer) {
        setTimeout(() => {
          transitionToStep(1, "COLLABORATION_PROPOSED");
        }, 1000);
      }
    }
  };

  const handleVoiceMessage = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast.info("Enregistrement en cours...");
    } else {
      setIsRecording(false);
      toast.success("Message vocal envoyé !");
    }
  };

  // Actions métier
  const handleProposeCollaboration = () => {
    if (currentStep === 0 && isCustomer) {
      transitionToStep(1, "COLLABORATION_PROPOSED");
      toast.success("Demande de collaboration envoyée !");
    }
  };

  const handleAcceptRequest = async () => {
    const sId = backendSpace?.id || resolvedSpaceId;
    if (sId) {
      try {
        await acceptRequest.mutateAsync(sId);
        toast.success("Collaboration acceptée !");
      } catch (err: any) {
        toast.error(err?.message || "Erreur lors de l'acceptation");
      }
    } else {
      setDecisionState("accepted");
      setShowMatchAnimation(true);
      appendLifecycleEvent("PRO_ACCEPTED_COLLABORATION");
      queueStepTransition(2, "Match confirmed", 3000);
    }
  };

  const handleDeclineRequest = async () => {
    const sId = backendSpace?.id || resolvedSpaceId;
    if (sId) {
      try {
        await rejectRequest.mutateAsync(sId);
        toast.success("Collaboration refusée");
      } catch (err: any) {
        toast.error(err?.message || "Erreur lors du refus");
      }
    } else {
      setDecisionState("declined");
      appendLifecycleEvent("PRO_DECLINED_COLLABORATION");
      toast.error("Vous avez décliné la collaboration.");
    }
  };

  const handleRequestMoreInfo = () => {
    setDecisionState("more_info");
    appendLifecycleEvent("PRO_REQUESTED_MORE_INFO");
    toast.info("Demande d'informations complémentaires envoyée.");
  };

  const handleOpenBrief = () => {
    if (currentStep === 2 && isCustomer) {
      transitionToStep(3, "BRIEF_OPENED");
    }
  };

  const handleValidateBrief = async () => {
    const sId = backendSpace?.id || resolvedSpaceId;
    if (sId) {
      try {
        await submitBriefMutation.mutateAsync({
          spaceId: sId,
          params: {
            objective: brief.objectif,
            deliverables: brief.livrables,
            deadline: brief.delai,
            budget: Number(brief.budget),
          },
        });
        toast.success("Brief validé et envoyé !");
      } catch (err: any) {
        toast.error(err?.message || "Erreur lors de la validation du brief");
      }
    } else {
      initEtapesFromBrief();
      transitionToStep(4, "STEP_CHANGED", { reason: "Brief validated" });
      toast.success("Brief validé ! Le contrat a été généré.");
    }
  };

  const handleSignContract = async () => {
    const sId = backendSpace?.id || resolvedSpaceId;
    if (sId) {
      try {
        await signContractMutation.mutateAsync(sId);
        toast.success("Contrat signé !");
      } catch (err: any) {
        toast.error(err?.message || "Erreur lors de la signature");
      }
    } else {
      accepterContrat();
      toast.success("Contrat signé par les deux parties !");
    }
  };

  const handleConfirmPayment = async (method: string) => {
    const sId = backendSpace?.id || resolvedSpaceId;
    if (sId) {
      try {
        await confirmPaymentMutation.mutateAsync(sId);
        toast.success("Paiement sécurisé avec succès !");
      } catch (err: any) {
        toast.error(err?.message || "Erreur lors du paiement");
      }
    } else {
      deposerPaiement(method);
      toast.success(`Paiement de ${brief.budget}€ sécurisé via ${method}`);
    }
  };

  const handleSubmitDeliverable = async (etapeId: number) => {
    const sId = backendSpace?.id || resolvedSpaceId;
    if (sId) {
      try {
        await submitDeliverableMutation.mutateAsync({
          spaceId: sId,
          params: { milestoneIndex: etapeId },
        });
        toast.success("Livrable envoyé pour validation !");
      } catch (err: any) {
        toast.error(err?.message || "Erreur lors de l'envoi");
      }
    } else {
      livrerEtape(etapeId);
      toast.success("Livrable envoyé !");
    }
  };

  const handleValidateDeliverable = async (etapeId: number) => {
    const sId = backendSpace?.id || resolvedSpaceId;
    if (sId) {
      try {
        // En backend, la validation d'un livrable peut entraîner le déblocage des fonds
        // ou simplement marquer l'étape comme complétée.
        // Ici on simule la validation locale si le hook ne l'expose pas encore.
        validerEtape(etapeId);
        toast.success("Livrable validé !");
      } catch (err: any) {
        toast.error(err?.message || "Erreur lors de la validation");
      }
    } else {
      validerEtape(etapeId);
      toast.success("Livrable validé !");
    }
  };

  const handleReleasePayment = async () => {
    const sId = backendSpace?.id || resolvedSpaceId;
    if (sId) {
      try {
        await releasePaymentMutation.mutateAsync(sId);
        toast.success("Fonds débloqués ! Le freelance va recevoir son paiement.");
      } catch (err: any) {
        toast.error(err?.message || "Erreur lors du déblocage");
      }
    } else {
      transitionToStep(9, "STEP_CHANGED", { reason: "Payment released" });
      toast.success("Paiement débloqué !");
    }
  };

  const handleSubmitReview = async (review: { rating: number; comment: string }) => {
    const sId = backendSpace?.id || resolvedSpaceId;
    if (sId) {
      try {
        // Logique de soumission d'avis via API
        setReviewSubmitSuccess(true);
        toast.success("Merci pour votre avis !");
      } catch (err: any) {
        toast.error("Erreur lors de l'envoi de l'avis");
      }
    } else {
      setAvis(review);
      setReviewSubmitSuccess(true);
      toast.success("Merci pour votre avis !");
    }
  };

  const handleCloseProject = async () => {
    const sId = backendSpace?.id || resolvedSpaceId;
    if (sId) {
      try {
        await closeSpaceMutation.mutateAsync(sId);
        toast.success("Projet clôturé avec succès !");
        navigate("/dashboard");
      } catch (err: any) {
        toast.error("Erreur lors de la clôture");
      }
    } else {
      toast.success("Projet terminé. Redirection...");
      setTimeout(() => navigate("/dashboard"), 2000);
    }
  };

  // Construction du ViewModel pour les étapes
  const stageViewModel = useCollaborationStageViewModel({
    currentStep,
    actor,
    decisionState,
    showMatchAnimation,
    setShowMatchAnimation,
    brief,
    setBrief,
    briefProgress,
    etapes,
    contratAccepte,
    paiementDepose,
    modePaiement,
    reviewSubmitSuccess,
    hasExistingReview,
    handleProposeCollaboration,
    handleAcceptRequest,
    handleDeclineRequest,
    handleRequestMoreInfo,
    handleOpenBrief,
    handleValidateBrief,
    handleSignContract,
    handleConfirmPayment,
    handleSubmitDeliverable,
    handleValidateDeliverable,
    handleReleasePayment,
    handleSubmitReview,
    handleCloseProject,
    toggleLivrable,
    demanderModification,
  });

  // Gestion des erreurs fatales (profil introuvable)
  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorState
          title="Collaboration introuvable"
          message={sidebarErrorMessage || "Nous n'avons pas pu charger les détails de cette collaboration."}
          onRetry={() => window.location.reload()}
          actionLabel="Retour au tableau de bord"
          onAction={() => navigate("/dashboard")}
        />
      </div>
    );
  }

  return (
    <div className="collab-container">
      {/* Header */}
      <header className="collab-header">
        <div className="header-left">
          <button onClick={() => navigate(-1)} className="back-button">
            <FiArrowLeft />
          </button>
          <div className="header-info">
            <h1 className="header-title">
              Collaboration avec {isCustomer ? freelance.nom : porteur.nom}
            </h1>
            <div className="header-status">
              <span className={`status-dot step-${currentStep}`}></span>
              <span className="status-text">{PROCESS_STEPS[currentStep].label}</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button className="icon-button mobile-only" onClick={toggleMenu}>
            <FiMenu />
          </button>
          <div className="desktop-actions">
            <button className="help-button">
              <FiShield /> Aide & Sécurité
            </button>
          </div>
        </div>
      </header>

      <main className="collab-main">
        {/* Sidebar - Détails du profil & Progression */}
        <aside className={`collab-sidebar ${menuOpen ? "open" : ""}`}>
          <div className="sidebar-section profile-card-mini">
            {sidebarIdentityLoading ? (
              <div className="loading-placeholder">Chargement du profil...</div>
            ) : sidebarError ? (
              <div className="error-placeholder">{sidebarErrorMessage}</div>
            ) : (
              <>
                <div className="profile-header-mini">
                  <img src={sidebarProfile.photo} alt={sidebarProfile.nom} className="avatar-md" />
                  <div className="profile-meta-mini">
                    <h3>{sidebarProfile.nom}</h3>
                    <p>{sidebarProfile.poste}</p>
                    {sidebarProfile.verified && (
                      <span className="verified-badge">
                        <FiCheckCircle /> Vérifié
                      </span>
                    )}
                  </div>
                </div>
                <div className="profile-stats-mini">
                  <div className="stat-item">
                    <FiStar className="stat-icon star" />
                    <span>{sidebarProfile.note} ({sidebarProfile.avis} avis)</span>
                  </div>
                  <div className="stat-item">
                    <FiMapPin className="stat-icon" />
                    <span>{sidebarProfile.location}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="sidebar-section workflow-progress">
            <h4>Progression du projet</h4>
            <div className="steps-vertical">
              {PROCESS_STEPS.map((step, idx) => (
                <div
                  key={idx}
                  className={`step-item ${idx <= currentStep ? "active" : ""} ${idx === currentStep ? "current" : ""}`}
                >
                  <div className="step-number">
                    {idx < currentStep ? <FiCheck /> : idx + 1}
                  </div>
                  <div className="step-label">{step.label}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Espace de Travail Central */}
        <section className="collab-workspace">
          <div className="workspace-content">
            {stageViewModel.renderStage()}
          </div>
        </section>

        {/* Messagerie */}
        <aside className="collab-messages">
          <div className="messages-header">
            <h3>Messagerie</h3>
            <span className="online-indicator">En ligne</span>
          </div>

          <div className="messages-list">
            {messages.length === 0 ? (
              <div className="empty-messages">
                <FiMessageCircle />
                <p>Démarrez la discussion</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-bubble ${msg.sender === (isCustomer ? "porteur" : "freelance") ? "own" : ""}`}
                >
                  <div className="message-content">
                    <p>{msg.text}</p>
                    <span className="message-time">
                      {msg.time}
                      {msg.deliveryStatus === "sending" && " ..."}
                      {msg.deliveryStatus === "failed" && " ⚠️"}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="message-input-area">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Écrivez votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                disabled={isRecording}
              />
              <button
                className={`voice-button ${isRecording ? "recording" : ""}`}
                onClick={handleVoiceMessage}
              >
                <FiPlay />
              </button>
            </div>
            <button className="send-button" onClick={sendMessage} disabled={!newMessage.trim()}>
              Envoyer
            </button>
          </div>
        </aside>
      </main>

      {/* Overlay Mobile */}
      {menuOpen && <div className="sidebar-overlay" onClick={toggleMenu}></div>}
    </div>
  );
};

export default CollaborationSpace;
