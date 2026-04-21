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
  isMessageBlockedByStatus,
  isUuidLike,
  parseRoomPair,
} from "@/features/collaboration/utils/workflow";
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
  StepExecution,
  StepMatch,
  StepPayment,
} from "@/features/collaboration/components/CollaborationStages";
import { toast } from "sonner";
import "../styles/collaboration/style.css";

export const CollaborationSpace = () => {
  const navigate = useNavigate();
  const { freelanceId } = useParams();
  const [searchParams] = useSearchParams();
  const authUser = useAuthStore((state) => state.user);
  const authRole = useAuthStore((state) => state.role);
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roleValue = String(authRole || authUser?.role || "").toUpperCase();
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
  } = useCollaborationActions();
  const mySpacesQuery = useMySpaces();
  const currentUserId = String(authUser?.id || "").trim();
  const incomingId = String(freelanceId || "").trim();
  const [backendSpace, setBackendSpace] = useState<CollaborationSpaceResponse | null>(null);

  const {
    ownerProfileLookupId,
    freelance,
    porteur,
    isFreelanceIdentityLoading,
    isOwnerIdentityLoading,
    sidebarIdentityLoading,
    sidebarProfile,
  } = useCollaborationProfiles({
    isPro,
    isCustomer,
    currentUserId,
    incomingId,
    backendSpace,
    authUser,
  });

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

      const sent = await sendBackendMessage(content, optimisticId);
      if (!sent) {
        setNewMessage(content);
      }
      return;
    }

    setMessages((prev: UiMessage[]) => [
      ...prev,
      createUiMessage({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sender: isCustomer ? "porteur" : "freelance",
        text: content,
      }),
    ]);
    appendLifecycleEvent("CONTACT_MESSAGE_SENT", {
      sender: actor,
      mode: "local",
    });
    setNewMessage("");

    // Simulation réponse du freelance (fallback local)
    // setTimeout(() => {
    //   setMessages((prev: UiMessage[]) => [
    //     ...prev,
    //     mapBackendMessageToUi({
    //       id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    //       senderId: "pro",
    //       content: "Merci pour ces informations ! Je serais ravi de collaborer avec vous sur ce projet. 🚀",
    //       sentAt: new Date().toISOString(),
    //     }),
    //   ]);
    //   appendLifecycleEvent("CONTACT_MESSAGE_SENT", {
    //     sender: "pro",
    //     mode: "local",
    //   });
    // }, 2000);
  };

  const retryMessage = async (messageId: string) => {
    const activeSpaceId = backendSpace?.id || resolvedSpaceId;
    if (!activeSpaceId) return;

    const failedMessage = messages.find((msg) => msg.id === messageId);
    if (!failedMessage || failedMessage.deliveryStatus !== "failed") return;

    if (backendSpace?.status && isMessageBlockedByStatus(backendSpace.status)) {
      toast.error("La messagerie est indisponible pour ce statut de collaboration.");
      return;
    }

    setMessages((prev: UiMessage[]) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, deliveryStatus: "sending" } : msg,
      ),
    );

    await sendBackendMessage(failedMessage.text, messageId);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const resolveProIdForRequest = useCallback(() => {
    if (backendSpace?.proId) return backendSpace.proId;

    if (isUuidLike(incomingId) && incomingId !== currentUserId) {
      return incomingId;
    }

    const pair = parseRoomPair(collaborationRoomId);
    if (pair?.proId) return pair.proId;

    return "";
  }, [backendSpace?.proId, collaborationRoomId, currentUserId, incomingId]);

  const resolvedReviewProId = resolveProIdForRequest();
  const reviewsQuery = usePublicProfileReviews(
    resolvedReviewProId,
    currentStep === 9 && Boolean(resolvedReviewProId && isUuidLike(resolvedReviewProId)),
  );
  const submitReviewMutation = useSubmitReview();
  const isSyncing = mySpacesQuery.isFetching || spaceMessagesQuery.isFetching;
  const isCheckingExistingReview = reviewsQuery.isFetching;
  const isMessagingLocked = isMessageBlockedByStatus(backendSpace?.status);
  const requestContextMessage = useMemo(() => {
    const backendMessage = String(
      backendSpace?.brief || backendSpace?.title || "",
    ).trim();
    if (backendMessage) return backendMessage;

    const latestCustomerMessage = [...messages]
      .reverse()
      .find((msg) => msg.sender === "porteur" && String(msg.text || "").trim());

    return String(latestCustomerMessage?.text || "").trim();
  }, [backendSpace?.brief, backendSpace?.title, messages]);
  const messagingStatusNotice = isMessagingLocked
    ? "Messagerie indisponible pour le statut actuel de collaboration."
    : "";
  const syncErrorMessage =
    (mySpacesQuery.isError
      ? "Impossible de synchroniser les collaborations pour le moment."
      : "") ||
    (spaceMessagesQuery.isError
      ? "Impossible de synchroniser les messages pour le moment."
      : "");

  const isReviewOwnedByCurrentUser = useCallback(
    (review: PublicReviewItem) => {
      const authorId = String(review?.author?.id || "").trim();
      const reviewerId = String(review?.reviewerId || review?.userId || "").trim();
      if (authorId && currentUserId) {
        return authorId === currentUserId;
      }
      if (reviewerId && currentUserId) {
        return reviewerId === currentUserId;
      }

      const reviewerDisplay = String(review?.userFrom || "")
        .trim()
        .toLowerCase();
      const possibleNames = [
        String(authUser?.email || "").trim().toLowerCase(),
        `${String(authUser?.firstName || "").trim()} ${String(authUser?.lastName || "").trim()}`
          .trim()
          .toLowerCase(),
      ].filter(Boolean);

      return Boolean(
        reviewerDisplay && possibleNames.some((candidate) => candidate === reviewerDisplay),
      );
    },
    [authUser?.email, authUser?.firstName, authUser?.lastName, currentUserId],
  );

  const isReviewForCurrentProject = useCallback(
    (review: PublicReviewItem) => {
      const currentProjectId = String(backendSpace?.id || "").trim();
      if (!currentProjectId) return false;

      const reviewProjectId = String(
        review?.projectId ||
          (review as any)?.project?.id ||
          (review as any)?.project?.projectId ||
          "",
      ).trim();

      return Boolean(reviewProjectId && reviewProjectId === currentProjectId);
    },
    [backendSpace?.id],
  );

  const proposerCollaboration = async () => {
    if (!canPerformAction("propose")) return;

    setDecisionState("pending");
    transitionToStep(1, "COLLABORATION_PROPOSED");

    if (actor !== "customer") return;

    const proId = resolveProIdForRequest();
    if (!proId) {
      toast.error("Impossible d'identifier le professionnel à contacter.");
      return;
    }

    try {
      const createdEnvelope = await createSpace.mutateAsync({
        proId,
        title: brief.objectif || "Demande de collaboration",
        brief:
          brief.objectif ||
          "Nouvelle demande de collaboration initiée depuis l'espace contact.",
      });
      const created = createdEnvelope.data;

      setBackendSpace(created);
      setCurrentStep(BACKEND_STATUS_TO_STEP[created.status] ?? 1);
    } catch (error: any) {
      const status = Number(error?.status || 0);

      if (status === 409) {
        try {
          const refreshed = await mySpacesQuery.refetch();
          const spaces = refreshed.data || [];
          const existing = spaces.find((space) => space.proId === proId);
          if (existing) {
            setBackendSpace(existing);
            setCurrentStep(BACKEND_STATUS_TO_STEP[existing.status] ?? 1);
            navigate(`/collaboration/${encodeURIComponent(existing.id)}`, {
              replace: true,
            });
            return;
          }
        } catch {
          // Keep below generic error.
        }
      }

      toast.error(
        String(
          error?.message ||
            "Impossible de créer la collaboration pour le moment.",
        ),
      );
    }
  };

  useEffect(() => {
    if (currentStep !== 9) return;

    const proId = resolveProIdForRequest();
    if (!proId || !isUuidLike(proId)) {
      setHasExistingReview(false);
      return;
    }

    if (reviewsQuery.isError) {
      setHasExistingReview(false);
      return;
    }

    const reviews = reviewsQuery.data || [];
    const alreadyReviewed = reviews.some(
      (review) =>
        isReviewOwnedByCurrentUser(review) &&
        isReviewForCurrentProject(review),
    );
    setHasExistingReview(alreadyReviewed);

    if (alreadyReviewed) {
      setReviewSubmitSuccess(true);
    }
  }, [
    backendSpace?.id,
    currentStep,
    isReviewForCurrentProject,
    isReviewOwnedByCurrentUser,
    reviewsQuery.data,
    reviewsQuery.isError,
    resolveProIdForRequest,
  ]);

  const submitReview = async () => {
    const isAllowedReviewer =
      roleValue === "ROLE_CUSTOMER" || roleValue === "ROLE_ENTERPRISE";

    if (!isAllowedReviewer) {
      toast.error("Seuls les comptes client/entreprise peuvent publier un avis.");
      return;
    }

    if (reviewSubmitSuccess) {
      return;
    }

    if (hasExistingReview) {
      toast.error("Vous avez deja publie un avis pour ce projet.");
      return;
    }

    const rating = Number(avis.note);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      toast.error("Veuillez attribuer une note entre 1 et 5 étoiles.");
      return;
    }

    const targetProId = backendSpace?.proId || resolveProIdForRequest();
    if (!targetProId || !isUuidLike(targetProId)) {
      toast.error("Impossible d'identifier le professionnel à noter.");
      return;
    }

    try {
      await submitReviewMutation.mutateAsync({
        targetProId,
        payload: {
          rating,
          comment: avis.commentaire?.trim() || undefined,
          projectId: backendSpace?.id,
        },
      });

      setReviewSubmitSuccess(true);
      appendLifecycleEvent("STEP_CHANGED", {
        reason: "review_submitted",
        rating,
      });
    } catch (error: any) {
      toast.error(String(error?.message || "Impossible de publier votre avis."));
    }
  };

    const confirmerReceptionBrief = () => {
    if (!isPro) return;
    transitionToStep(4, "STEP_CHANGED", { reason: "brief_received" });
  };

   const accepterCollaboration = async () => {
    if (!canPerformAction("accept")) return;

    if (!backendSpace?.id) {
      toast.error("Aucun projet backend trouvé. Demandez au client de créer la collaboration.");
      return;
    }

    try {
      const updatedEnvelope = await acceptRequest.mutateAsync(backendSpace.id);
      const updated = updatedEnvelope.data;
      setBackendSpace(updated);
      setDecisionState("accepted");
      appendLifecycleEvent("PRO_ACCEPTED_COLLABORATION");
      setShowMatchAnimation(true);
      setTimeout(() => {
        setShowMatchAnimation(false);
        transitionToStep(2, "STEP_CHANGED", {
          reason: "decision_accepted",
          status: updated.status,
        });
      }, 3000);
    } catch (error: any) {
      toast.error(String(error?.message || "Impossible d'accepter la collaboration."));
    }
  };

   const renderStars = (note, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`collab-star ${i <= note ? "filled" : ""} ${interactive ? "interactive" : ""}`}
          onClick={() => interactive && setAvis({ ...avis, note: i })}
          style={{
            fill: i <= note ? "#FFD700" : "none",
            color: i <= note ? "#FFD700" : "#ddd",
            cursor: interactive ? "pointer" : "default",
          }}
        />,
      );
    }
    return stars;
  };

  const demanderPlusInfos = () => {
    if (!canPerformAction("request_info")) return;

    setDecisionState("more_info");
    appendLifecycleEvent("PRO_REQUESTED_MORE_INFO");
    const now = new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        sender: "freelance",
        text: "Merci pour votre demande. J'ai besoin de précisions supplémentaires avant d'accepter : objectif détaillé, livrables prioritaires et contraintes techniques.",
        time: now,
        date: "Aujourd'hui",
      },
    ]);
  };

  const refuserCollaboration = async () => {
    if (!canPerformAction("decline")) return;

    if (!backendSpace?.id) {
      toast.error("Aucun projet backend trouvé. Demandez au client de créer la collaboration.");
      return;
    }

    try {
      const updatedEnvelope = await rejectRequest.mutateAsync(backendSpace.id);
      const updated = updatedEnvelope.data;
      setBackendSpace(updated);
    } catch (error: any) {
      toast.error(String(error?.message || "Impossible de refuser la collaboration."));
      return;
    }

    setDecisionState("declined");
    appendLifecycleEvent("PRO_DECLINED_COLLABORATION");
    const now = new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        sender: "freelance",
        text: "Je ne peux pas accepter cette collaboration pour le moment. Vous pouvez ajuster votre besoin et relancer une nouvelle demande.",
        time: now,
        date: "Aujourd'hui",
      },
    ]);
  };

  const validerBrief = () => {
    if (!isCustomer) return;
    if (briefProgress === 100) {
      transitionToStep(4, "STEP_CHANGED", { reason: "brief_validated" });
    }
  };

  const getStatutBadge = (statut) => {
    const statuts = {
      a_venir: { label: "À venir", color: "#6c757d", icon: FiClock },
      en_cours: { label: "En cours", color: "#fd7e14", icon: FiPlay },
      livree: { label: "Livrée", color: "#17a2b8", icon: FiUpload },
      validee: { label: "Validée", color: "#28a745", icon: FiCheckCircle },
      modification: {
        label: "Modification",
        color: "#dc3545",
        icon: FiRefreshCw,
      },
    };
    const s = statuts[statut] || statuts.a_venir;
    const Icon = s.icon;
    return (
      <span
        className="collab-statut-badge"
        style={{ backgroundColor: `${s.color}20`, color: s.color }}
      >
        <Icon /> {s.label}
      </span>
    );
  };

    const stageViewModel = useCollaborationStageViewModel({
    messages,
    porteur,
    freelance,
    newMessage,
    setNewMessage,
    handleKeyPress,
    sendMessage,
    onRetryMessage: retryMessage,
    isMessagingLocked,
    messagingStatusNotice,
    messagesEndRef,
    isRecording,
    setIsRecording,
    canPropose: canPerformAction("propose"),
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
    canOpenBrief: canPerformAction("open_brief"),
    brief,
    setBrief,
    briefProgress,
    livrablesSuggestions: LIVRABLES_SUGGESTIONS,
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
    onBackMarketplace: () => navigate("/marketplace"),
    submitReview,
    submitReviewPending: submitReviewMutation.isPending,
    reviewSubmitSuccess,
  });

  return (
    <div className="collab-page">
      {/* Animation Match */}
      {showMatchAnimation && (
        <div className="collab-match-overlay">
          <div className="collab-match-animation">
            <div className="collab-match-photos">
              <img
                src={porteur.photo}
                alt={porteur.nom}
                className="collab-match-photo"
              />
              <div className="collab-match-heart">
                <FaHandshake />
              </div>
              <img
                src={freelance.photo}
                alt={freelance.nom}
                className="collab-match-photo"
              />
            </div>
            <h2 className="collab-match-title">Match validé ! 🎉</h2>
            <p className="collab-match-subtitle">
              Votre espace de travail est prêt
            </p>
            <div className="collab-match-confetti"></div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="collab-header">
        <div className="collab-header-content">
          <div className="collab-logo" onClick={() => navigate("/")}>
            <Logo alt="Jobty" />
          </div>

          <div className="collab-header-center">
            <span className="collab-header-title">
              <FaHandshake /> Espace Collaboration
            </span>
          </div>

          <div className="collab-header-actions">
            <button className="collab-back-btn" onClick={() => navigate(-1)}>
              <FiArrowLeft /> Retour
            </button>
            <button
              className="collab-burger-btn"
              onClick={toggleMenu}
              aria-expanded={menuOpen}
              aria-label="Ouvrir le menu"
            >
              <FiMenu />
            </button>
          </div>
        </div>
      </header>

      {/* Barre de progression */}
      <div className="collab-progress-bar">
        <div className="collab-progress-track">
          {PROCESS_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className={`collab-progress-step ${currentStep >= step.num ? "active" : ""} ${currentStep === step.num ? "current" : ""}`}
              >
                <div className="collab-progress-icon">
                  <Icon />
                </div>
                <span className="collab-progress-label">{step.label}</span>
                {index < PROCESS_STEPS.length - 1 && (
                  <div
                    className={`collab-progress-line ${currentStep > step.num ? "filled" : ""}`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <main className="collab-main">
        <div className="collab-container">
          {/* Sidebar - Infos acteur */}
          <aside className="collab-sidebar-info">
            <div className="collab-freelance-card">
              <div className="collab-freelance-header">
                <div className="collab-freelance-photo-wrapper">
                  {sidebarIdentityLoading ? (
                    <div className="collab-skeleton collab-avatar-skeleton" />
                  ) : (
                    <img
                      src={sidebarProfile.photo}
                      alt={sidebarProfile.nom}
                      className="collab-freelance-photo"
                    />
                  )}
                  {sidebarProfile.verified && (
                    <span className="collab-verified-badge">
                      <FiCheckCircle />
                    </span>
                  )}
                </div>
                <div className="collab-freelance-info">
                  {sidebarIdentityLoading ? (
                    <>
                      <span className="collab-skeleton collab-text-skeleton collab-text-skeleton-name" />
                      <span className="collab-skeleton collab-text-skeleton collab-text-skeleton-subtitle" />
                      <span className="collab-skeleton collab-text-skeleton collab-text-skeleton-location" />
                    </>
                  ) : (
                    <>
                      <h3>{sidebarProfile.nom}</h3>
                      <p>{sidebarProfile.poste}</p>
                      <div className="collab-freelance-location">
                        <FiMapPin /> {sidebarProfile.location}
                      </div>
                      {sidebarProfile.specialite && (
                        <div className="collab-freelance-location">
                          <FiBriefcase /> {sidebarProfile.specialite}
                        </div>
                      )}
                      {sidebarProfile.tarifHoraire !== null && (
                        <div className="collab-freelance-location">
                          <FiDollarSign /> {Math.round(sidebarProfile.tarifHoraire).toLocaleString("fr-FR")} FCFA / h
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="collab-freelance-stats">
                <div className="collab-stat-item">
                  <div className="collab-stat-value">
                    {renderStars(Math.floor(sidebarProfile.note))}
                  </div>
                  <div className="collab-stat-label">{sidebarProfile.avis} avis</div>
                </div>
                <div className="collab-stat-item">
                  <div className="collab-stat-value">
                    {sidebarProfile.projetsRealises}
                  </div>
                  <div className="collab-stat-label">Projets</div>
                </div>
                
                <div className="collab-stat-item">
                  <div className="collab-stat-value">
                    {sidebarProfile.collaborationsEnCours}
                  </div>
                  <div className="collab-stat-label">Projets en cours</div>
                </div>
              </div>

              <div className="collab-freelance-competences">
                {sidebarProfile.competences.map((comp, index) => (
                  <span key={index} className="collab-comp-tag">
                    {comp}
                  </span>
                ))}
              </div>

              <div className="collab-security-badge">
                <FiShield /> Collaboration sécurisée par Jobty
              </div>
            </div>

            {/* Résumé du projet (affiché après le brief) */}
            {currentStep >= 3 && brief.objectif && (
              <div className="collab-project-summary">
                <h4>
                  <FiTarget /> Résumé du projet
                </h4>
                <div className="collab-summary-item">
                  <span className="collab-summary-label">Objectif</span>
                  <p>{brief.objectif}</p>
                </div>
                {brief.budget && (
                  <div className="collab-summary-item">
                    <span className="collab-summary-label">Budget</span>
                    <p className="collab-budget-display">
                      {parseInt(brief.budget).toLocaleString()} FCFA
                    </p>
                  </div>
                )}
                {brief.delai && (
                  <div className="collab-summary-item">
                    <span className="collab-summary-label">Délai</span>
                    <p>{brief.delai}</p>
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* Zone principale */}
          <div className="collab-workspace">
            {backendSpace?.id && (
              <div className="collab-alert-info" style={{ marginBottom: 16 }}>
                <FiCheckCircle />
                <span>
                  Projet synchronisé: {backendSpace.id} - statut {backendSpace.status}
                </span>
              </div>
            )}

            {isSyncing && (
              <div className="collab-alert-info" style={{ marginBottom: 16 }}>
                <FiClock />
                <span>Synchronisation de la collaboration en cours...</span>
              </div>
            )}

            {syncErrorMessage && (
              <div className="collab-alert-info" style={{ marginBottom: 16 }}>
                <FiAlertCircle />
                <span>{syncErrorMessage}</span>
              </div>
            )}

            {/* ÉTAPE 0 : Prise de contact */}
            {currentStep === 0 && (
              <StepContact {...stageViewModel.contact} />
            )}

            {/* ÉTAPE 1 : Décision du professionnel */}
            {currentStep === 1 && (
              <StepDecision {...stageViewModel.decision} />
            )}

            {/* ÉTAPE 2 : Match confirmé */}
            {currentStep === 2 && (
              <StepMatch {...stageViewModel.match} />
            )}

            {/* ÉTAPE 3 : Brief express */}
            {currentStep === 3 && (
              <StepBrief {...stageViewModel.briefStep} />
            )}

            {/* ÉTAPE 4 : Contrat intelligent */}
            {currentStep === 4 && (
              <StepContract {...stageViewModel.contract} />
            )}

            {/* ÉTAPE 5 : Paiement sécurisé */}
            {currentStep === 5 && (
              <StepPayment {...stageViewModel.payment} />
            )}

            {/* ÉTAPE 6 : Tableau de collaboration */}
            {currentStep === 6 && (
              <StepExecution {...stageViewModel.execution} />
            )}

            {/* ÉTAPE 9 : Clôture & Avis */}
            {currentStep === 9 && (
              <StepClosure {...stageViewModel.closure} />
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="collab-footer">
        <div className="collab-footer-content">
          <div className="collab-footer-security">
            <FiShield />
            <span>
              Espace sécurisé par Jobty - Toutes les interactions sont archivées
              et horodatées
            </span>
          </div>
          <div className="collab-footer-links">
            <a href="/aide">Aide</a>
            <a href="/conditions">CGU</a>
            <a href="/contact">Contact support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
