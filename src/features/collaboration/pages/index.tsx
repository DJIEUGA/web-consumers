import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  FiX,
  FiMenu,
  FiUser,
  FiSend,
  FiCheck,
  FiClock,
  FiDollarSign,
  FiFile,
  FiPaperclip,
  FiMessageCircle,
  FiCheckCircle,
  FiAlertCircle,
  FiStar,
  FiLock,
  FiUnlock,
  FiDownload,
  FiUpload,
  FiEdit3,
  FiCalendar,
  FiTarget,
  FiList,
  FiArrowRight,
  FiArrowLeft,
  FiMic,
  FiSmile,
  FiAtSign,
  FiImage,
  FiPlay,
  FiPause,
  FiThumbsUp,
  FiThumbsDown,
  FiRefreshCw,
  FiShield,
  FiAward,
  FiZap,
  FiHeart,
  FiMessageSquare,
  FiChevronDown,
  FiChevronUp,
  FiMapPin,
  FiBriefcase,
  FiPhone,
  FiMail,
  FiExternalLink,
} from "react-icons/fi";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaHandshake,
  FaRocket,
} from "react-icons/fa";
import { COLORS } from "../../../styles/colors";
import Logo from "@/components/shared/Logo";
import { useAuthStore } from "@/stores/auth.store";
import {
  collaborationApi,
  type CollaborationSpaceResponse,
  type CollaborationStatus,
  type PublicReviewItem,
} from "@/features/collaboration/services/collaborationApi";
import {
  useCollaborationActions,
  useMySpaces,
  usePublicProfileReviews,
  useSpaceMessages,
  useSubmitReview,
} from "@/features/collaboration/hooks/useCollaboration";
import { usePublicProfile } from "@/features/profile/hooks/useProfileActions";
import { toast } from "sonner";
import "../styles/collaboration/style.css";

const COLLAB_STORAGE_PREFIX = "jobty:collaboration:room:";

type CollaborationActor = "customer" | "pro" | "other";
type CollaborationStage =
  | "CONTACT"
  | "DECISION"
  | "MATCH"
  | "BRIEF"
  | "CONTRACT"
  | "PAYMENT"
  | "EXECUTION"
  | "DELIVERY"
  | "RELEASE"
  | "CLOSURE";
type CollaborationAction =
  | "propose"
  | "accept"
  | "request_info"
  | "decline"
  | "open_brief";

type CollaborationDecisionState =
  | "pending"
  | "accepted"
  | "more_info"
  | "declined";

type CollaborationEventType =
  | "CONTACT_MESSAGE_SENT"
  | "COLLABORATION_PROPOSED"
  | "PRO_ACCEPTED_COLLABORATION"
  | "PRO_REQUESTED_MORE_INFO"
  | "PRO_DECLINED_COLLABORATION"
  | "STEP_CHANGED"
  | "BRIEF_OPENED";

type CollaborationLifecycleEvent = {
  id: string;
  type: CollaborationEventType;
  actor: CollaborationActor;
  stage: CollaborationStage;
  roomId: string;
  createdAt: string;
  payload?: Record<string, unknown>;
};

const STEP_TO_STAGE: Record<number, CollaborationStage> = {
  0: "CONTACT",
  1: "DECISION",
  2: "MATCH",
  3: "BRIEF",
  4: "CONTRACT",
  5: "PAYMENT",
  6: "EXECUTION",
  7: "DELIVERY",
  8: "RELEASE",
  9: "CLOSURE",
};

const STAGE_ACTION_RULES: Partial<
  Record<CollaborationStage, Partial<Record<CollaborationAction, CollaborationActor[]>>>
> = {
  CONTACT: {
    propose: ["customer"],
  },
  DECISION: {
    accept: ["pro"],
    request_info: ["pro"],
    decline: ["pro"],
  },
  MATCH: {
    open_brief: ["customer"],
  },
};

const buildRoomId = (customerId, proId) =>
  `room:${String(customerId || "").trim()}::${String(proId || "").trim()}`;

const getStorageKey = (roomId) => `${COLLAB_STORAGE_PREFIX}${roomId}`;

const BACKEND_STATUS_TO_STEP: Record<CollaborationStatus, number> = {
  PENDING: 1,
  ACCEPTED: 2,
  REJECTED: 1,
  ACTIVE: 2,
  COMPLETED: 9,
  CANCELLED: 1,
};

const MESSAGE_BLOCKED_STATUSES: CollaborationStatus[] = [
  "PENDING",
  "REJECTED",
  "CANCELLED",
];

const isUuidLike = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

const getProfilePayload = (
  profile: unknown,
): Record<string, any> => {
  if (!profile || typeof profile !== "object") return {};

  const firstLevel = (profile as Record<string, any>).data;
  if (firstLevel && typeof firstLevel === "object") {
    const secondLevel = (firstLevel as Record<string, any>).data;
    if (secondLevel && typeof secondLevel === "object") {
      return secondLevel as Record<string, any>;
    }
    return firstLevel as Record<string, any>;
  }

  return profile as Record<string, any>;
};

type UiMessage = {
  id: string;
  sender: "porteur" | "freelance";
  text: string;
  time: string;
  date: string;
};

export const CollaborationSpace = () => {
  const navigate = useNavigate();
  const { freelanceId } = useParams();
  const [searchParams] = useSearchParams();
  const authUser = useAuthStore((state) => state.user);
  const authRole = useAuthStore((state) => state.role);
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);

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

  const proProfileLookupId = useMemo(() => {
    if (isPro && currentUserId && isUuidLike(currentUserId)) {
      return currentUserId;
    }

    const backendProId = String(backendSpace?.proId || "").trim();
    if (backendProId && isUuidLike(backendProId)) {
      return backendProId;
    }

    if (isCustomer && incomingId && isUuidLike(incomingId) && incomingId !== currentUserId) {
      return incomingId;
    }

    const matchedPair = incomingId.match(/^room:(.+)::(.+)$/);
    const pairProId = String(matchedPair?.[2] || "").trim();
    if (pairProId && isUuidLike(pairProId)) {
      return pairProId;
    }

    return "";
  }, [backendSpace?.proId, currentUserId, incomingId, isCustomer, isPro]);

  const publicProProfileQuery = usePublicProfile(proProfileLookupId || undefined);
  const publicProProfile = useMemo(
    () => getProfilePayload(publicProProfileQuery.data?.data),
    [publicProProfileQuery.data?.data],
  );

  const ownerProfileLookupId = useMemo(() => {
    const backendCustomerId = String(backendSpace?.customerId || "").trim();
    if (backendCustomerId && isUuidLike(backendCustomerId)) {
      return backendCustomerId;
    }

    if (isPro && incomingId && isUuidLike(incomingId) && incomingId !== currentUserId) {
      return incomingId;
    }

    const matchedPair = incomingId.match(/^room:(.+)::(.+)$/);
    const pairCustomerId = String(matchedPair?.[1] || "").trim();
    if (pairCustomerId && isUuidLike(pairCustomerId)) {
      return pairCustomerId;
    }

    return "";
  }, [backendSpace?.customerId, currentUserId, incomingId, isPro]);

  const publicOwnerProfileQuery = usePublicProfile(
    !isPro ? ownerProfileLookupId || undefined : undefined,
  );
  const publicOwnerProfile = useMemo(
    () => getProfilePayload(publicOwnerProfileQuery.data?.data),
    [publicOwnerProfileQuery.data?.data],
  );
  const customerOwnerProfileQuery = useQuery({
    queryKey: ["collaboration", "customer-profile", ownerProfileLookupId],
    queryFn: () => collaborationApi.getCustomerProfileDetails(ownerProfileLookupId),
    enabled: isPro && Boolean(ownerProfileLookupId),
    staleTime: 5 * 60 * 1000,
  });
  const customerOwnerProfile = useMemo(
    () => getProfilePayload(customerOwnerProfileQuery.data),
    [customerOwnerProfileQuery.data],
  );
  const resolvedOwnerProfile = isPro ? customerOwnerProfile : publicOwnerProfile;
  const isFreelanceIdentityLoading =
    Boolean(proProfileLookupId) &&
    publicProProfileQuery.isPending &&
    Object.keys(publicProProfile).length === 0;
  const isOwnerIdentityLoading =
    Boolean(ownerProfileLookupId) &&
    (isPro ? customerOwnerProfileQuery.isPending : publicOwnerProfileQuery.isPending) &&
    Object.keys(resolvedOwnerProfile).length === 0;

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

  const defaultMessages = React.useMemo(
    (): UiMessage[] => [
      {
        id: "1",
        sender: "freelance",
        text: "Bonjour ! Merci de m'avoir contacté. Je suis disponible pour discuter de votre projet. Pouvez-vous m'en dire plus sur vos besoins ?",
        time: "10:30",
        date: "Aujourd'hui",
      },
    ],
    [],
  );

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
  const [messages, setMessages] = useState(defaultMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const currentStage = STEP_TO_STAGE[currentStep] ?? "CONTACT";

  const canPerformAction = (action: CollaborationAction) => {
    const allowedActors = STAGE_ACTION_RULES[currentStage]?.[action];
    if (!allowedActors || allowedActors.length === 0) return true;
    return allowedActors.includes(actor);
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
    const clamped = Math.min(9, Math.max(0, Math.floor(nextStep)));
    setCurrentStep(clamped);
    appendLifecycleEvent(eventType, {
      ...(payload || {}),
      fromStep: currentStep,
      toStep: clamped,
      fromStage: currentStage,
      toStage: STEP_TO_STAGE[clamped],
    });
  };

  const isMessageBlockedByStatus = (status?: CollaborationStatus) =>
    Boolean(status && MESSAGE_BLOCKED_STATUSES.includes(status));

  const spaceMessagesQuery = useSpaceMessages(
    backendSpace?.id && !isMessageBlockedByStatus(backendSpace.status)
      ? backendSpace.id
      : undefined,
  );

  const mapBackendMessageToUi = useCallback(
    (msg: {
      id: string;
      senderId: string;
      content: string;
      sentAt?: string;
      createdAt?: string;
    }): UiMessage => ({
      id: String(msg.id),
      sender: msg.senderId === currentUserId ? "porteur" : "freelance",
      text: msg.content,
      time: new Date(msg.sentAt || msg.createdAt || Date.now()).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: "Aujourd'hui",
    }),
    [currentUserId],
  );

  const parseRoomPair = (roomId: string) => {
    const matched = roomId.match(/^room:(.+)::(.+)$/);
    if (!matched) return null;
    return {
      customerId: String(matched[1] || "").trim(),
      proId: String(matched[2] || "").trim(),
    };
  };

  // Brief du projet
  const [brief, setBrief] = useState({
    objectif: "",
    livrables: [],
    delai: "",
    budget: "",
    fichiers: [],
    commentairePro: "",
  });
  const [briefProgress, setBriefProgress] = useState(0);

  // Livrables prédéfinis
  const livrablesSuggestions = [
    "Maquette graphique",
    "Code source",
    "Documentation",
    "Formation/Tutoriel",
    "Fichiers sources (PSD, AI...)",
    "Révisions incluses",
    "Support post-livraison",
  ];

  // Étapes du projet
  const [etapes, setEtapes] = useState([
    {
      id: 1,
      titre: "Maquette initiale",
      statut: "en_cours",
      montant: 50000,
      progression: 65,
    },
    {
      id: 2,
      titre: "Développement",
      statut: "a_venir",
      montant: 100000,
      progression: 0,
    },
    {
      id: 3,
      titre: "Tests & Livraison",
      statut: "a_venir",
      montant: 50000,
      progression: 0,
    },
  ]);

  // Contrat
  const [contratAccepte, setContratAccepte] = useState({
    porteur: false,
    freelance: false,
  });

  // Paiement
  const [paiementDepose, setPaiementDepose] = useState(false);
  const [modePaiement, setModePaiement] = useState("etapes"); // 'total' ou 'etapes'

  // Avis
  const [avis, setAvis] = useState({
    note: 0,
    commentaire: "",
    recommande: null,
  });

  // Données du professionnel (profil public réel + fallback)
  const freelance = useMemo(() => {
    const liveProPayload = (publicProProfile || {}) as Record<string, any>;
    const fullName = [publicProProfile?.firstName, publicProProfile?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    const displayName =
      fullName ||
      publicProProfile?.displayName ||
      backendSpace?.proName ||
      "Professionnel Jobty";

    const rating = Number(
      liveProPayload?.stats?.averageRating ??
        publicProProfile?.averageRating ??
        0,
    );
    const reviewCount = Number(
      Array.isArray(liveProPayload?.reviews)
        ? liveProPayload.reviews.length
        : publicProProfile?.reviewCount ?? 0,
    );
    const completedProjects = Number(
      liveProPayload?.stats?.completedProjects ??
        publicProProfile?.completedProjects ??
        0,
    );

    const responseRateRaw =
      liveProPayload?.stats?.responseRate ??
      liveProPayload?.responseRate ??
      liveProPayload?.stats?.responseRatePercent;
    const responseRate =
      typeof responseRateRaw === "number"
        ? responseRateRaw > 1
          ? `${Math.round(responseRateRaw)}%`
          : `${Math.round(responseRateRaw * 100)}%`
        : "N/A";

    const normalizeSkillValue = (skill: unknown): string => {
      if (typeof skill === "string") return skill.trim();
      if (skill && typeof skill === "object") {
        const candidate =
          (skill as { name?: string }).name ||
          (skill as { title?: string }).title ||
          (skill as { label?: string }).label ||
          (skill as { value?: string }).value;
        return String(candidate || "").trim();
      }
      return "";
    };

    const skillsFromPayload = Array.isArray(liveProPayload?.skills)
      ? liveProPayload.skills.map(normalizeSkillValue).filter(Boolean)
      : [];

    const skillsFromAltArrays = [
      liveProPayload?.competences,
      liveProPayload?.expertises,
      liveProPayload?.technologies,
      liveProPayload?.stack,
      liveProPayload?.tags,
    ]
      .filter(Array.isArray)
      .flatMap((list) => (list as unknown[]).map(normalizeSkillValue))
      .filter(Boolean);

    const skillsFromDelimitedFields = [
      liveProPayload?.
      liveProPayload?.competences,
      liveProPayload?.expertises,
      liveProPayload?.technologies,
      liveProPayload?.stack,
      liveProPayload?.tags,
    ]
      .filter((value) => typeof value === "string")
      .flatMap((value) =>
        String(value)
          .split(/[,;|]/)
          .map((item) => item.trim())
          .filter(Boolean),
      );

    const skillsFromServices = (publicProProfile?.services || [])
      .map((service) => String(service?.title || "").trim())
      .filter(Boolean)
      .slice(0, 4);

    const specialtySkill = String(
      liveProPayload?.specialty || liveProPayload?.specialite || "",
    ).trim();
    const sectorSkill = String(liveProPayload?.sector || "").trim();

    const normalizedSkills = Array.from(
      new Set([
        ...skillsFromPayload,
        ...skillsFromAltArrays,
        ...skillsFromDelimitedFields,
        ...skillsFromServices,
        specialtySkill,
        sectorSkill,
      ].filter(Boolean)),
    ).slice(0, 4);

    const city = String(
      publicProProfile?.location?.city || liveProPayload?.city || "",
    ).trim();
    const country = String(
      publicProProfile?.location?.country || liveProPayload?.country || "",
    ).trim();

    const headline = String(
      publicProProfile?.headline ||
        liveProPayload?.specialty ||
        liveProPayload?.specialite ||
        liveProPayload?.bio ||
        "",
    ).trim();

    const specialty = String(
      liveProPayload?.specialty ||
        liveProPayload?.specialite ||
        liveProPayload?.sector ||
        "",
    ).trim();

    const hourlyRate = Number(
      liveProPayload?.hourlyRate ??
        liveProPayload?.tarifHoraire ??
        publicProProfile?.hourlyRate ??
        NaN,
    );

    const isVerified = Boolean(
      (liveProPayload as any)?.isVerified ?? (liveProPayload as any)?.verified ?? false,
    );

    const responseDelay = String(
      liveProPayload?.stats?.avgResponseTime ||
        liveProPayload?.stats?.durationOnPlatform ||
        "< 2h",
    ).trim();

    const anciennete = String(
      liveProPayload?.stats?.durationOnPlatform ||
        liveProPayload?.anciennete ||
        "N/A",
    ).trim();

    const collaborationsEnCours = Number(
      liveProPayload?.stats?.ongoingProjects ??
        liveProPayload?.collaborationsEnCours ??
        0,
    );

    return {
      id: proProfileLookupId || 1,
      nom: displayName,
      poste: headline || "Profil non renseigné",
      photo:
        publicProProfile?.avatarUrl ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`,
      location: liveProPayload?.location || "localisation non renseignée",
      note: Number.isFinite(rating) ? rating : 0.0,
      avis: Number.isFinite(reviewCount) ? reviewCount : 0,
      projetsRealises: Number.isFinite(completedProjects) ? completedProjects : 0,
      tauxReponse: responseRate,
      delaiReponse: responseDelay || "pas definir",
      competences: normalizedSkills.length > 0 ? normalizedSkills : ["Profil en cours"],
      verified: isVerified,
      specialite: specialty,
      tarifHoraire: Number.isFinite(hourlyRate) ? hourlyRate : null,
      anciennete: anciennete || "N/A",
      collaborationsEnCours: Number.isFinite(collaborationsEnCours)
        ? collaborationsEnCours
        : 0,
    };
  }, [backendSpace?.proName, proProfileLookupId, publicProProfile]);

  // Données du porteur de projet (profil public réel + fallback)
  const porteur = useMemo(() => {
    const fullName = [resolvedOwnerProfile?.firstName, resolvedOwnerProfile?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    const companyName = String(
      resolvedOwnerProfile?.companyName ||
        resolvedOwnerProfile?.businessName ||
        resolvedOwnerProfile?.entreprise ||
        "",
    ).trim();
    const displayName =
      fullName ||
      resolvedOwnerProfile?.displayName ||
      companyName ||
      backendSpace?.customerName ||
      [authUser?.firstName, authUser?.lastName].filter(Boolean).join(" ").trim() ||
      "Marc Dubois";

    const companyOrLabel =
      resolvedOwnerProfile?.headline ||
      companyName ||
      resolvedOwnerProfile?.displayName ||
      "Client Jobty";

    return {
      id: ownerProfileLookupId || "owner",
      nom: displayName,
      photo:
        resolvedOwnerProfile?.avatarUrl ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`,
      entreprise: companyOrLabel,
    };
  }, [
    authUser?.firstName,
    authUser?.lastName,
    backendSpace?.customerName,
    ownerProfileLookupId,
    resolvedOwnerProfile,
  ]);

  const sidebarIdentityLoading = isPro ? isOwnerIdentityLoading : isFreelanceIdentityLoading;
  const sidebarProfile = useMemo(() => {
    if (isPro) {
      const ownerStats = (resolvedOwnerProfile?.stats || {}) as Record<string, any>;
      const ownerLocation =
        (typeof resolvedOwnerProfile?.location === "object" && resolvedOwnerProfile?.location
          ? `${String(resolvedOwnerProfile.location.city || "").trim()} ${String(resolvedOwnerProfile.location.country || "").trim()}`.trim()
          : String(resolvedOwnerProfile?.location || "").trim()) ||
        "Localisation non renseignée";

      const ownerSkills = Array.isArray(resolvedOwnerProfile?.skills)
        ? resolvedOwnerProfile.skills
            .map((skill: unknown) => String(skill || "").trim())
            .filter(Boolean)
            .slice(0, 4)
        : [];

      return {
        nom: porteur.nom,
        photo: porteur.photo,
        poste: String(resolvedOwnerProfile?.headline || porteur.entreprise || "Client Jobty"),
        location: ownerLocation,
        specialite: String(resolvedOwnerProfile?.sector || resolvedOwnerProfile?.specialty || ""),
        tarifHoraire: null as number | null,
        note: Number(ownerStats?.averageRating ?? resolvedOwnerProfile?.averageRating ?? 0),
        avis: Number(resolvedOwnerProfile?.reviewCount ?? 0),
        projetsRealises: Number(ownerStats?.completedProjects ?? 0),
        collaborationsEnCours: Number(ownerStats?.ongoingProjects ?? 0),
        competences: ownerSkills.length > 0 ? ownerSkills : ["Profil client"],
        verified: Boolean(resolvedOwnerProfile?.isVerified ?? resolvedOwnerProfile?.verified ?? false),
      };
    }

    return {
      nom: freelance.nom,
      photo: freelance.photo,
      poste: freelance.poste,
      location: freelance.location,
      specialite: freelance.specialite,
      tarifHoraire: freelance.tarifHoraire,
      note: Number(freelance.note || 0),
      avis: Number(freelance.avis || 0),
      projetsRealises: Number(freelance.projetsRealises || 0),
      collaborationsEnCours: Number(freelance.collaborationsEnCours || 0),
      competences: Array.isArray(freelance.competences) ? freelance.competences : ["Profil en cours"],
      verified: Boolean(freelance.verified),
    };
  }, [freelance, isPro, porteur, resolvedOwnerProfile]);

  // Scroll automatique des messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!incomingId) return;

    const expectedPath = `/collaboration/${encodeURIComponent(collaborationRoomId)}`;
    const currentPath = `/collaboration/${encodeURIComponent(incomingId)}`;
    if (collaborationRoomId !== incomingId && currentPath !== expectedPath) {
      navigate(expectedPath, { replace: true });
    }
  }, [collaborationRoomId, incomingId, navigate]);

  useEffect(() => {
    if (!currentUserId || !incomingId) return;
    if (mySpacesQuery.isError) {
      setBackendSpace(null);
      return;
    }

    const spaces = mySpacesQuery.data || [];

    let matchedSpace: CollaborationSpaceResponse | undefined;

    if (isUuidLike(incomingId)) {
      matchedSpace = spaces.find((space) => space.id === incomingId);
    }

    if (!matchedSpace) {
      const pair = parseRoomPair(collaborationRoomId);
      if (pair) {
        matchedSpace = spaces.find(
          (space) =>
            space.customerId === pair.customerId && space.proId === pair.proId,
        );
      }
    }

    if (!matchedSpace && isUuidLike(incomingId)) {
      matchedSpace = spaces.find(
        (space) => space.proId === incomingId || space.customerId === incomingId,
      );
    }

    if (matchedSpace) {
      setBackendSpace(matchedSpace);
      setCurrentStep(BACKEND_STATUS_TO_STEP[matchedSpace.status] ?? 1);
      if (matchedSpace.status === "REJECTED") {
        setDecisionState("declined");
      }
    } else {
      setBackendSpace(null);
    }
  }, [
    collaborationRoomId,
    currentUserId,
    incomingId,
    mySpacesQuery.data,
    mySpacesQuery.isError,
  ]);

  useEffect(() => {
    if (!backendSpace?.id) return;
    if (spaceMessagesQuery.isError) return;
    if (Array.isArray(spaceMessagesQuery.data)) {
      setMessages(spaceMessagesQuery.data.map(mapBackendMessageToUi));
    }
  }, [backendSpace?.id, mapBackendMessageToUi, spaceMessagesQuery.data, spaceMessagesQuery.isError]);

  useEffect(() => {
    if (backendSpace) return;

    const storageKey = getStorageKey(collaborationRoomId);

    try {
      const storedRaw = localStorage.getItem(storageKey);
      if (!storedRaw) {
        setMessages(defaultMessages);
        setCurrentStep(0);
        return;
      }

      const stored = JSON.parse(storedRaw);
      if (Array.isArray(stored.messages)) {
        setMessages(stored.messages);
      } else {
        setMessages(defaultMessages);
      }

      if (Number.isFinite(stored.currentStep)) {
        setCurrentStep(Math.min(9, Math.max(0, Math.floor(Number(stored.currentStep)))));
      } else {
        setCurrentStep(0);
      }

      const storedDecision = stored.decisionState;
      if (
        storedDecision === "pending" ||
        storedDecision === "accepted" ||
        storedDecision === "more_info" ||
        storedDecision === "declined"
      ) {
        setDecisionState(storedDecision);
      } else {
        setDecisionState("pending");
      }

      if (Array.isArray(stored.lifecycleEvents)) {
        setLifecycleEvents(stored.lifecycleEvents);
      } else {
        setLifecycleEvents([]);
      }
    } catch {
      setMessages(defaultMessages);
      setCurrentStep(0);
      setDecisionState("pending");
      setLifecycleEvents([]);
    }
  }, [backendSpace, collaborationRoomId, defaultMessages]);

  useEffect(() => {
    const storageKey = getStorageKey(collaborationRoomId);
    const payload = {
      messages,
      currentStep,
      decisionState,
      lifecycleEvents,
      updatedAt: Date.now(),
      roomId: collaborationRoomId,
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // Ignore storage quota/availability issues silently.
    }
  }, [collaborationRoomId, messages, currentStep, decisionState, lifecycleEvents]);

  useEffect(() => {
    const stepParam = searchParams.get("step");
    if (!stepParam) return;

    const parsed = Number(stepParam);
    if (!Number.isFinite(parsed)) return;

    const clampedStep = Math.min(9, Math.max(0, Math.floor(parsed)));
    setCurrentStep(clampedStep);
  }, [searchParams]);

  // Calcul progression brief
  useEffect(() => {
    let progress = 0;
    if (brief.objectif) progress += 25;
    if (brief.livrables.length > 0) progress += 25;
    if (brief.delai) progress += 25;
    if (brief.budget) progress += 25;
    setBriefProgress(progress);
  }, [brief]);

  // Fonctions utilitaires
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const sendMessage = async () => {
    const content = newMessage.trim();
    if (!content) return;

    if (backendSpace?.id) {
      if (isMessageBlockedByStatus(backendSpace.status)) {
        toast.error("La messagerie est indisponible pour ce statut de collaboration.");
        return;
      }

      try {
        const sentEnvelope = await sendMessageMutation.mutateAsync({
          spaceId: backendSpace.id,
          params: { content },
        });
        const sent = sentEnvelope.data;
        setMessages((prev) => [...prev, mapBackendMessageToUi(sent)]);
        appendLifecycleEvent("CONTACT_MESSAGE_SENT", {
          sender: actor,
          mode: "backend",
        });
        setNewMessage("");
        return;
      } catch (error: any) {
        toast.error(String(error?.message || "Échec d'envoi du message. Réessayez."));
        return;
      }
    }

    const newMsg: UiMessage = {
      id: String(messages.length + 1),
      sender: isCustomer ? "porteur" : "freelance",
      text: content,
      time: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: "Aujourd'hui",
    };
    setMessages([...messages, newMsg]);
    appendLifecycleEvent("CONTACT_MESSAGE_SENT", {
      sender: actor,
      mode: "local",
    });
    setNewMessage("");

    // Simulation réponse du freelance (fallback local)
    setTimeout(() => {
      const reponse: UiMessage = {
        id: String(messages.length + 2),
        sender: "freelance",
        text: "Merci pour ces informations ! Je serais ravi de collaborer avec vous sur ce projet. 🚀",
        time: new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: "Aujourd'hui",
      };
      setMessages((prev) => [...prev, reponse]);
      appendLifecycleEvent("CONTACT_MESSAGE_SENT", {
        sender: "pro",
        mode: "local",
      });
    }, 2000);
  };

  const handleKeyPress = (e) => {
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

  const toggleLivrable = (livrable) => {
    if (brief.livrables.includes(livrable)) {
      setBrief({
        ...brief,
        livrables: brief.livrables.filter((l) => l !== livrable),
      });
    } else {
      setBrief({ ...brief, livrables: [...brief.livrables, livrable] });
    }
  };

  const validerBrief = () => {
    if (!isCustomer) return;
    if (briefProgress === 100) {
      setCurrentStep(4);
    }
  };

  const confirmerReceptionBrief = () => {
    if (!isPro) return;
    setCurrentStep(4);
  };

  const accepterContrat = (partie) => {
    setContratAccepte((prev) => {
      const next = { ...prev, [partie]: true };
      if (next.porteur && next.freelance) {
        setTimeout(() => setCurrentStep(5), 1000);
      }
      return next;
    });
  };

  const deposerPaiement = () => {
    setPaiementDepose(true);
    setTimeout(() => setCurrentStep(6), 2000);
  };

  const livrerEtape = (etapeId) => {
    setEtapes(
      etapes.map((e) => (e.id === etapeId ? { ...e, statut: "livree" } : e)),
    );
  };

  const validerEtape = (etapeId) => {
    setEtapes(
      etapes.map((e) => (e.id === etapeId ? { ...e, statut: "validee" } : e)),
    );

    // Vérifier si toutes les étapes sont validées
    const toutesValidees = etapes.every(
      (e) => e.id === etapeId || e.statut === "validee",
    );
    if (toutesValidees) {
      setTimeout(() => setCurrentStep(9), 1500);
    }
  };

  const demanderModification = (etapeId) => {
    setEtapes(
      etapes.map((e) =>
        e.id === etapeId ? { ...e, statut: "modification" } : e,
      ),
    );
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
    const s = statuts[statut];
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

  // Étapes du processus
  const processSteps = [
    { num: 0, label: "Prise de contact", icon: FiMessageCircle },
    { num: 1, label: "Décision", icon: FiCheck },
    { num: 2, label: "Match confirmé", icon: FaHandshake },
    { num: 3, label: "Brief", icon: FiEdit3 },
    { num: 4, label: "Contrat", icon: FiFile },
    { num: 5, label: "Paiement", icon: FiLock },
    { num: 6, label: "Collaboration", icon: FiTarget },
    { num: 7, label: "Livraison", icon: FiUpload },
    { num: 8, label: "Paiement libéré", icon: FiUnlock },
    { num: 9, label: "Clôture", icon: FiAward },
  ];

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
            <button className="collab-burger-btn" onClick={toggleMenu}>
              <FiMenu />
            </button>
          </div>
        </div>
      </header>

      {/* Barre de progression */}
      <div className="collab-progress-bar">
        <div className="collab-progress-track">
          {processSteps.map((step, index) => {
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
                {index < processSteps.length - 1 && (
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
          {/* Sidebar - Infos Freelance */}
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
              <div className="collab-step-content">
                <div className="collab-step-header">
                  <div
                    className="collab-step-icon"
                    style={{ backgroundColor: "#667eea20" }}
                  >
                    <FiMessageCircle style={{ color: "#667eea" }} />
                  </div>
                  <div>
                    <h2>Prise de contact</h2>
                    <p>
                      Présentez-vous et clarifiez vos besoins. Aucun engagement
                      à cette étape.
                    </p>
                  </div>
                </div>

                <div className="collab-alert-info">
                  <FiAlertCircle />
                  <span>
                    Messagerie limitée - Pas de paiement, pas d'échange de
                    coordonnées personnelles
                  </span>
                </div>

                {/* Zone de chat */}
                <div className="collab-chat-container">
                  <div className="collab-messages">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`collab-message ${msg.sender === "porteur" ? "sent" : "received"}`}
                      >
                        <img
                          src={
                            msg.sender === "porteur"
                              ? porteur.photo
                              : freelance.photo
                          }
                          alt=""
                          className="collab-message-avatar"
                        />
                        <div className="collab-message-content">
                          <div className="collab-message-bubble">
                            {msg.text}
                          </div>
                          <span className="collab-message-time">
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="collab-chat-input">
                    <button className="collab-input-btn">
                      <FiPaperclip />
                    </button>
                    <button className="collab-input-btn">
                      <FiImage />
                    </button>
                    <textarea
                      placeholder="Écrivez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isMessagingLocked}
                      rows={1}
                    />
                    <button className="collab-input-btn">
                      <FiSmile />
                    </button>
                    <button
                      className={`collab-input-btn mic ${isRecording ? "recording" : ""}`}
                      onClick={() => setIsRecording(!isRecording)}
                    >
                      <FiMic />
                    </button>
                    <button
                      className="collab-send-btn"
                      onClick={() => void sendMessage()}
                      disabled={isMessagingLocked}
                    >
                      <FiSend />
                    </button>
                  </div>
                  {messagingStatusNotice && (
                    <div className="collab-alert-info" style={{ marginTop: 12 }}>
                      <FiAlertCircle />
                      <span>{messagingStatusNotice}</span>
                    </div>
                  )}
                </div>

                <div className="collab-step-actions">
                  {canPerformAction("propose") ? (
                    <button
                      className="collab-btn-primary"
                      onClick={() => void proposerCollaboration()}
                    >
                      <FaRocket /> Proposer une collaboration
                    </button>
                  ) : (
                    <div className="collab-alert-info" style={{ marginBottom: 0 }}>
                      <FiAlertCircle />
                      <span>
                        Seul le client peut initier une demande de collaboration
                        dans cette étape.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ÉTAPE 1 : Décision du professionnel */}
            {currentStep === 1 && (
              <div className="collab-step-content">
                <div className="collab-step-header">
                  <div
                    className="collab-step-icon"
                    style={{ backgroundColor: "#fd7e1420" }}
                  >
                    <FiCheck style={{ color: "#fd7e14" }} />
                  </div>
                  <div>
                    <h2>En attente de réponse</h2>
                    <p>
                      {isPro
                        ? "Un porteur de projet vous a envoye une demande de collaboration."
                        : "Le professionnel examine votre demande de collaboration"}
                    </p>
                  </div>
                </div>

                <div className="collab-waiting-card">
                  <div className="collab-waiting-animation">
                    <div className="collab-pulse-ring"></div>
                    <img
                      src={freelance.photo}
                      alt={freelance.nom}
                      className="collab-waiting-photo"
                    />
                  </div>
                  <h3>{freelance.nom}</h3>
                  {/* <p>Délai de réponse habituel : {freelance.delaiReponse}</p> */}

                  {isPro && requestContextMessage && (
                    <div className="collab-alert-info" style={{ marginTop: 12 }}>
                      <FiMessageCircle />
                      <span>{requestContextMessage}</span>
                    </div>
                  )}

                  {isPro && (
                    <div className="collab-waiting-options">
                      <div className="collab-option-card accept">
                        <FiCheckCircle />
                        <span>Accepter</span>
                      </div>
                      <div className="collab-option-card info">
                        <FiMessageCircle />
                        <span>Plus d'infos</span>
                      </div>
                      <div className="collab-option-card decline">
                        <FiX />
                        <span>Refuser</span>
                      </div>
                    </div>
                  )}
                </div>

                {actor === "pro" && decisionState === "pending" && (
                  <div className="collab-demo-actions">
                    <p className="collab-demo-note">
                      Action professionnelle : choisissez une décision
                    </p>
                    <div className="collab-step-actions" style={{ marginTop: 0 }}>
                      <button
                        className="collab-btn-success"
                        onClick={accepterCollaboration}
                      >
                        <FiCheck /> Accepter la collaboration
                      </button>
                      <button
                        className="collab-btn-secondary"
                        onClick={demanderPlusInfos}
                      >
                        <FiMessageCircle /> Demander plus d'infos
                      </button>
                      <button
                        className="collab-btn-outline"
                        onClick={refuserCollaboration}
                      >
                        <FiX /> Refuser la demande
                      </button>
                    </div>
                  </div>
                )}

                {actor !== "pro" && (
                  <div className="collab-demo-actions">
                    <p className="collab-demo-note">
                      {decisionState === "pending" &&
                        "Le professionnel n'a pas encore répondu. Vous serez notifié dès qu'il prend une décision."}
                      {decisionState === "more_info" &&
                        "Le professionnel demande des précisions. Revenez en prise de contact pour compléter votre besoin."}
                      {decisionState === "declined" &&
                        "Demande refusée. Vous pouvez reformuler puis envoyer une nouvelle proposition."}
                    </p>
                    {(decisionState === "more_info" || decisionState === "declined") && (
                      <button
                        className="collab-btn-secondary"
                        onClick={() =>
                          transitionToStep(0, "STEP_CHANGED", {
                            reason: "customer_reworks_request",
                          })
                        }
                      >
                        <FiArrowLeft /> Retour à la prise de contact
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 2 : Match confirmé */}
            {currentStep === 2 && (
              <div className="collab-step-content">
                <div className="collab-step-header success">
                  <div
                    className="collab-step-icon"
                    style={{ backgroundColor: "#28a74520" }}
                  >
                    <FaHandshake style={{ color: "#28a745" }} />
                  </div>
                  <div>
                    <h2>On bosse ensemble ! 🎉</h2>
                    <p>Votre espace projet privé a été créé</p>
                  </div>
                </div>

                <div className="collab-match-success-card">
                  <div className="collab-match-users">
                    <div className="collab-match-user">
                      {isOwnerIdentityLoading ? (
                        <div className="collab-skeleton collab-avatar-skeleton collab-avatar-skeleton-sm" />
                      ) : (
                        <img src={porteur.photo} alt={porteur.nom} />
                      )}
                      {isOwnerIdentityLoading ? (
                        <span className="collab-skeleton collab-text-skeleton collab-text-skeleton-name-sm" />
                      ) : (
                        <span>{porteur.nom}</span>
                      )}
                      <span className="collab-role">Porteur de projet</span>
                    </div>
                    <div className="collab-match-connector">
                      <FaHandshake />
                    </div>
                    <div className="collab-match-user">
                      {isFreelanceIdentityLoading ? (
                        <div className="collab-skeleton collab-avatar-skeleton collab-avatar-skeleton-sm" />
                      ) : (
                        <img src={freelance.photo} alt={freelance.nom} />
                      )}
                      {isFreelanceIdentityLoading ? (
                        <span className="collab-skeleton collab-text-skeleton collab-text-skeleton-name-sm" />
                      ) : (
                        <span>{freelance.nom}</span>
                      )}
                      <span className="collab-role">Professionnel</span>
                    </div>
                  </div>

                  <div className="collab-features-list">
                    <div className="collab-feature-item">
                      <FiCheckCircle className="collab-feature-check" />
                      <span>Espace privé sécurisé</span>
                    </div>
                    <div className="collab-feature-item">
                      <FiCheckCircle className="collab-feature-check" />
                      <span>Historique horodaté (preuves légales)</span>
                    </div>
                    <div className="collab-feature-item">
                      <FiCheckCircle className="collab-feature-check" />
                      <span>Paiement sécurisé</span>
                    </div>
                    <div className="collab-feature-item">
                      <FiCheckCircle className="collab-feature-check" />
                      <span>Support Jobty 24/7</span>
                    </div>
                  </div>
                </div>

                <div className="collab-step-actions">
                  {canPerformAction("open_brief") ? (
                    <button
                      className="collab-btn-primary"
                      onClick={() =>
                        transitionToStep(3, "BRIEF_OPENED", {
                          initiatedBy: actor,
                        })
                      }
                    >
                      <FiEdit3 /> Rédiger le brief du projet
                    </button>
                  ) : (
                    <div className="collab-alert-info" style={{ marginBottom: 0 }}>
                      <FiAlertCircle />
                      <span>
                        Le client prépare le brief. Vous serez invité à le valider
                        dès qu'il est prêt.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ÉTAPE 3 : Brief express */}
            {currentStep === 3 && (
              <div className="collab-step-content">
                <div className="collab-step-header">
                  <div
                    className="collab-step-icon"
                    style={{ backgroundColor: "#667eea20" }}
                  >
                    <FiEdit3 style={{ color: "#667eea" }} />
                  </div>
                  <div>
                    <h2>Brief express</h2>
                    <p>Décrivez votre projet de manière simple et claire</p>
                  </div>
                </div>

                {/* Barre de progression du brief */}
                <div className="collab-brief-progress">
                  <div className="collab-brief-progress-bar">
                    <div
                      className="collab-brief-progress-fill"
                      style={{ width: `${briefProgress}%` }}
                    ></div>
                  </div>
                  <span
                    className={`collab-brief-progress-text ${briefProgress === 100 ? "complete" : ""}`}
                  >
                    {briefProgress === 100
                      ? "✅ Brief complété !"
                      : `Brief complété à ${briefProgress}%`}
                  </span>
                </div>

                <div className="collab-brief-form">
                  {/* Objectif */}
                  <div className="collab-form-group">
                    <label>
                      <FiTarget /> Objectif du projet *
                    </label>
                    <textarea
                      placeholder="Décrivez ce que vous souhaitez réaliser..."
                      value={brief.objectif}
                      onChange={(e) =>
                        setBrief({ ...brief, objectif: e.target.value })
                      }
                      disabled={!isCustomer}
                      rows={3}
                    />
                  </div>

                  {/* Livrables */}
                  <div className="collab-form-group">
                    <label>
                      <FiList /> Livrables attendus *
                    </label>
                    <div className="collab-livrables-grid">
                      {livrablesSuggestions.map((livrable, index) => (
                        <div
                          key={index}
                          className={`collab-livrable-item ${brief.livrables.includes(livrable) ? "selected" : ""}`}
                          onClick={() => isCustomer && toggleLivrable(livrable)}
                        >
                          <FiCheckCircle />
                          <span>{livrable}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Délai */}
                  <div className="collab-form-group">
                    <label>
                      <FiCalendar /> Délai souhaité *
                    </label>
                    <select
                      value={brief.delai}
                      onChange={(e) =>
                        setBrief({ ...brief, delai: e.target.value })
                      }
                      disabled={!isCustomer}
                    >
                      <option value="">Sélectionnez un délai</option>
                      <option value="Moins d'1 semaine">
                        Moins d'1 semaine
                      </option>
                      <option value="1-2 semaines">1-2 semaines</option>
                      <option value="2-4 semaines">2-4 semaines</option>
                      <option value="1-2 mois">1-2 mois</option>
                      <option value="Plus de 2 mois">Plus de 2 mois</option>
                    </select>
                  </div>

                  {/* Budget */}
                  <div className="collab-form-group">
                    <label>
                      <FiDollarSign /> Budget validé *
                    </label>
                    <div className="collab-budget-input">
                      <input
                        type="number"
                        placeholder="Ex: 200000"
                        value={brief.budget}
                        onChange={(e) =>
                          setBrief({ ...brief, budget: e.target.value })
                        }
                        disabled={!isCustomer}
                      />
                      <span className="collab-currency">FCFA</span>
                    </div>
                  </div>

                  {/* Fichiers */}
                  <div className="collab-form-group">
                    <label>
                      <FiPaperclip /> Fichiers utiles (optionnel)
                    </label>
                    <div className="collab-upload-zone">
                      <FiUpload />
                      <span>
                        Glissez vos fichiers ici ou cliquez pour uploader
                      </span>
                      <small>PDF, Images, Documents (max 10MB)</small>
                    </div>
                  </div>

                  {!isCustomer && (
                    <div className="collab-alert-info">
                      <FiAlertCircle />
                      <span>
                        Le brief est saisi par le client. Vous pouvez l'examiner et confirmer
                        sa reception.
                      </span>
                    </div>
                  )}
                </div>

                {/* Zone commentaire du pro */}
                <div className="collab-pro-comment">
                  <div className="collab-pro-comment-header">
                    <img src={freelance.photo} alt={freelance.nom} />
                    <span>Commentaire de {freelance.nom.split(" ")[0]}</span>
                  </div>
                  <div className="collab-pro-comment-content">
                    <p>
                      Le brief me semble clair ! Je suis prêt à démarrer dès
                      validation. 👍
                    </p>
                  </div>
                </div>

                <div className="collab-step-actions">
                  {isCustomer ? (
                    <>
                      <button
                        className="collab-btn-secondary"
                        onClick={() => setCurrentStep(2)}
                      >
                        <FiArrowLeft /> Retour
                      </button>
                      <button
                        className={`collab-btn-primary ${briefProgress < 100 ? "disabled" : ""}`}
                        onClick={validerBrief}
                        disabled={briefProgress < 100}
                      >
                        <FiCheck /> Valider le brief
                      </button>
                    </>
                  ) : (
                    <button className="collab-btn-primary" onClick={confirmerReceptionBrief}>
                      <FiCheck /> Confirmer la reception du brief
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ÉTAPE 4 : Contrat intelligent */}
            {currentStep === 4 && (
              <div className="collab-step-content">
                <div className="collab-step-header">
                  <div
                    className="collab-step-icon"
                    style={{ backgroundColor: "#17a2b820" }}
                  >
                    <FiFile style={{ color: "#17a2b8" }} />
                  </div>
                  <div>
                    <h2>Contrat digital simplifié</h2>
                    <p>Validez les termes de votre collaboration en 1 clic</p>
                  </div>
                </div>

                <div className="collab-contrat-card">
                  <div className="collab-contrat-header">
                    <Logo alt="Jobty" className="collab-contrat-logo" />
                    <div>
                      <h3>Contrat de prestation Jobty</h3>
                      <span>
                        Généré automatiquement le{" "}
                        {new Date().toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>

                  <div className="collab-contrat-body">
                    <div className="collab-contrat-parties">
                      <div className="collab-contrat-partie">
                        <h4>Porteur de projet</h4>
                        <p>{porteur.nom}</p>
                        <span>{porteur.entreprise}</span>
                      </div>
                      <div className="collab-contrat-vs">×</div>
                      <div className="collab-contrat-partie">
                        <h4>Prestataire</h4>
                        <p>{freelance.nom}</p>
                        <span>{freelance.poste}</span>
                      </div>
                    </div>

                    <div className="collab-contrat-section">
                      <h4>
                        <FiTarget /> Objet du contrat
                      </h4>
                      <p>
                        {brief.objectif ||
                          "Développement d'une application web responsive"}
                      </p>
                    </div>

                    <div className="collab-contrat-section">
                      <h4>
                        <FiList /> Livrables
                      </h4>
                      <ul>
                        {brief.livrables.length > 0 ? (
                          brief.livrables.map((l, i) => <li key={i}>{l}</li>)
                        ) : (
                          <>
                            <li>Maquette graphique</li>
                            <li>Code source</li>
                            <li>Documentation</li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="collab-contrat-row">
                      <div className="collab-contrat-section half">
                        <h4>
                          <FiCalendar /> Délai
                        </h4>
                        <p>{brief.delai || "2-4 semaines"}</p>
                      </div>
                      <div className="collab-contrat-section half">
                        <h4>
                          <FiDollarSign /> Montant total
                        </h4>
                        <p className="collab-contrat-amount">
                          {brief.budget
                            ? parseInt(brief.budget).toLocaleString()
                            : "200 000"}{" "}
                          FCFA
                        </p>
                      </div>
                    </div>

                    <div className="collab-contrat-section">
                      <h4>
                        <FiShield /> Conditions Jobty
                      </h4>
                      <ul className="collab-conditions">
                        <li>Paiement sécurisé via séquestre Jobty</li>
                        <li>Libération des fonds après validation</li>
                        <li>Médiation Jobty en cas de litige</li>
                        <li>Historique complet conservé 2 ans</li>
                      </ul>
                    </div>
                  </div>

                  <div className="collab-contrat-signatures">
                    <div
                      className={`collab-signature ${contratAccepte.porteur ? "signed" : ""}`}
                    >
                      {isOwnerIdentityLoading ? (
                        <div className="collab-skeleton collab-avatar-skeleton collab-avatar-skeleton-xs" />
                      ) : (
                        <img src={porteur.photo} alt={porteur.nom} />
                      )}
                      {isOwnerIdentityLoading ? (
                        <span className="collab-skeleton collab-text-skeleton collab-text-skeleton-name-sm" />
                      ) : (
                        <span>{porteur.nom}</span>
                      )}
                      {contratAccepte.porteur ? (
                        <div className="collab-signature-done">
                          <FiCheckCircle /> Signé
                        </div>
                      ) : !isCustomer ? (
                        <div className="collab-demo-note">En attente de signature client</div>
                      ) : (
                        <button
                          className="collab-sign-btn"
                          onClick={() => accepterContrat("porteur")}
                        >
                          J'accepte
                        </button>
                      )}
                    </div>

                    <div
                      className={`collab-signature ${contratAccepte.freelance ? "signed" : ""}`}
                    >
                      {isFreelanceIdentityLoading ? (
                        <div className="collab-skeleton collab-avatar-skeleton collab-avatar-skeleton-xs" />
                      ) : (
                        <img src={freelance.photo} alt={freelance.nom} />
                      )}
                      {isFreelanceIdentityLoading ? (
                        <span className="collab-skeleton collab-text-skeleton collab-text-skeleton-name-sm" />
                      ) : (
                        <span>{freelance.nom}</span>
                      )}
                      {contratAccepte.freelance ? (
                        <div className="collab-signature-done">
                          <FiCheckCircle /> Signé
                        </div>
                      ) : !isPro ? (
                        <div className="collab-demo-note">En attente de signature pro</div>
                      ) : (
                        <button
                          className="collab-sign-btn"
                          onClick={() => accepterContrat("freelance")}
                        >
                          J'accepte
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Simulation pour la démo */}
                {isCustomer && !contratAccepte.freelance && (
                  <div className="collab-demo-actions">
                    <p className="collab-demo-note">
                      🎮 Demo : Simuler la signature du freelance
                    </p>
                    <button
                      className="collab-btn-outline"
                      onClick={() =>
                        setContratAccepte({
                          ...contratAccepte,
                          freelance: true,
                        })
                      }
                    >
                      <FiCheck /> Le freelance signe
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 5 : Paiement sécurisé */}
            {currentStep === 5 && (
              <div className="collab-step-content">
                <div className="collab-step-header">
                  <div
                    className="collab-step-icon"
                    style={{ backgroundColor: "#28a74520" }}
                  >
                    <FiLock style={{ color: "#28a745" }} />
                  </div>
                  <div>
                    <h2>Paiement sécurisé</h2>
                    <p>
                      Déposez le paiement - Il restera bloqué jusqu'à validation
                      des livrables
                    </p>
                  </div>
                </div>

                <div className="collab-paiement-card">
                  {!isCustomer && (
                    <div className="collab-alert-info" style={{ marginBottom: 16 }}>
                      <FiClock />
                      <span>
                        Seul le client depose le paiement. Vous serez notifie une fois les
                        fonds securises.
                      </span>
                    </div>
                  )}
                  <div className="collab-paiement-mode">
                    <label className="collab-radio-card">
                      <input
                        type="radio"
                        name="mode"
                        value="etapes"
                        checked={modePaiement === "etapes"}
                        onChange={() => setModePaiement("etapes")}
                        disabled={!isCustomer}
                      />
                      <div className="collab-radio-content">
                        <div className="collab-radio-icon recommended">
                          <FiList />
                          <span className="collab-badge-recommended">
                            Recommandé
                          </span>
                        </div>
                        <h4>Paiement par étapes</h4>
                        <p>Déblocage progressif selon les livrables validés</p>
                      </div>
                    </label>
                    <label className="collab-radio-card">
                      <input
                        type="radio"
                        name="mode"
                        value="total"
                        checked={modePaiement === "total"}
                        onChange={() => setModePaiement("total")}
                        disabled={!isCustomer}
                      />
                      <div className="collab-radio-content">
                        <div className="collab-radio-icon">
                          <FiDollarSign />
                        </div>
                        <h4>Paiement total</h4>
                        <p>Déblocage unique à la fin du projet</p>
                      </div>
                    </label>
                  </div>

                  {modePaiement === "etapes" && (
                    <div className="collab-etapes-paiement">
                      <h4>Répartition par étapes</h4>
                      {etapes.map((etape, index) => (
                        <div
                          key={etape.id}
                          className="collab-etape-paiement-item"
                        >
                          <span className="collab-etape-num">
                            Étape {index + 1}
                          </span>
                          <span className="collab-etape-titre">
                            {etape.titre}
                          </span>
                          <span className="collab-etape-montant">
                            {etape.montant.toLocaleString()} FCFA
                          </span>
                        </div>
                      ))}
                      <div className="collab-paiement-total">
                        <span>Total</span>
                        <span>
                          {etapes
                            .reduce((sum, e) => sum + e.montant, 0)
                            .toLocaleString()}{" "}
                          FCFA
                        </span>
                      </div>
                    </div>
                  )}

                  {modePaiement === "total" && (
                    <div className="collab-total-paiement">
                      <div className="collab-paiement-total">
                        <span>Montant total</span>
                        <span>
                          {(brief.budget
                            ? parseInt(brief.budget)
                            : 200000
                          ).toLocaleString()}{" "}
                          FCFA
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="collab-paiement-secure-info">
                    <FiShield />
                    <div>
                      <h5>Votre argent est sécurisé</h5>
                      <p>
                        Les fonds sont conservés par Jobty et libérés uniquement
                        après votre validation des livrables.
                      </p>
                    </div>
                  </div>

                  <button
                    className={`collab-btn-primary collab-btn-large ${paiementDepose ? "success" : ""}`}
                    onClick={deposerPaiement}
                    disabled={paiementDepose || !isCustomer}
                  >
                    {paiementDepose ? (
                      <>
                        <FiCheckCircle /> Paiement déposé avec succès !
                      </>
                    ) : (
                      <>
                        <FiLock /> Déposer le paiement
                      </>
                    )}
                  </button>
                </div>

                {paiementDepose && (
                  <div className="collab-success-message">
                    <FiCheckCircle />
                    <div>
                      <h4>Parfait ! Le pro peut commencer.</h4>
                      <p>
                        Votre argent est sécurisé. Redirection vers l'espace de
                        travail...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 6 : Tableau de collaboration */}
            {currentStep === 6 && (
              <div className="collab-step-content collab-workspace-view">
                <div className="collab-step-header">
                  <div
                    className="collab-step-icon"
                    style={{ backgroundColor: "#667eea20" }}
                  >
                    <FiTarget style={{ color: "#667eea" }} />
                  </div>
                  <div>
                    <h2>Tableau de collaboration</h2>
                    <p>Suivez l'avancement de votre projet en temps réel</p>
                  </div>
                </div>

                {/* Timeline du projet */}
                <div className="collab-timeline">
                  <h3>
                    <FiList /> Timeline du projet
                  </h3>
                  <div className="collab-timeline-items">
                    {etapes.map((etape, index) => (
                      <div
                        key={etape.id}
                        className={`collab-timeline-item ${etape.statut}`}
                      >
                        <div className="collab-timeline-marker">
                          {etape.statut === "validee" ? (
                            <FiCheckCircle />
                          ) : etape.statut === "en_cours" ? (
                            <FiPlay />
                          ) : etape.statut === "livree" ? (
                            <FiUpload />
                          ) : (
                            <FiClock />
                          )}
                        </div>
                        <div className="collab-timeline-content">
                          <div className="collab-timeline-header">
                            <h4>
                              Étape {index + 1}: {etape.titre}
                            </h4>
                            {getStatutBadge(etape.statut)}
                          </div>
                          {etape.statut === "en_cours" && (
                            <div className="collab-progress-mini">
                              <div className="collab-progress-bar-mini">
                                <div
                                  className="collab-progress-fill-mini"
                                  style={{ width: `${etape.progression}%` }}
                                ></div>
                              </div>
                              <span>{etape.progression}%</span>
                            </div>
                          )}
                          <div className="collab-timeline-amount">
                            <FiDollarSign /> {etape.montant.toLocaleString()}{" "}
                            FCFA
                            {etape.statut === "validee" && (
                              <span className="collab-released">💰 Libéré</span>
                            )}
                          </div>

                          {/* Actions selon statut */}
                          {isPro && etape.statut === "en_cours" && (
                            <div className="collab-timeline-actions">
                              <button
                                className="collab-btn-sm collab-btn-outline"
                                onClick={() => livrerEtape(etape.id)}
                              >
                                <FiUpload /> Marquer comme livrée (démo)
                              </button>
                            </div>
                          )}
                          {isCustomer && etape.statut === "livree" && (
                            <div className="collab-timeline-actions">
                              <button
                                className="collab-btn-sm collab-btn-success"
                                onClick={() => validerEtape(etape.id)}
                              >
                                <FiCheck /> Valider
                              </button>
                              <button
                                className="collab-btn-sm collab-btn-warning"
                                onClick={() => demanderModification(etape.id)}
                              >
                                <FiRefreshCw /> Demander modification
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Messagerie projet */}
                <div className="collab-project-chat">
                  <h3>
                    <FiMessageSquare /> Messagerie projet
                  </h3>
                  <div className="collab-chat-container small">
                    <div className="collab-messages">
                      {messages.slice(-3).map((msg) => (
                        <div
                          key={msg.id}
                          className={`collab-message ${msg.sender === "porteur" ? "sent" : "received"}`}
                        >
                          <img
                            src={
                              msg.sender === "porteur"
                                ? porteur.photo
                                : freelance.photo
                            }
                            alt=""
                            className="collab-message-avatar"
                          />
                          <div className="collab-message-content">
                            <div className="collab-message-bubble">
                              {msg.text}
                            </div>
                            <span className="collab-message-time">
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="collab-chat-input compact">
                      <input
                        type="text"
                        placeholder="Votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isMessagingLocked}
                      />
                      <button
                        className="collab-send-btn"
                        onClick={sendMessage}
                        disabled={isMessagingLocked}
                      >
                        <FiSend />
                      </button>
                    </div>
                    {messagingStatusNotice && (
                      <div className="collab-alert-info" style={{ marginTop: 12 }}>
                        <FiAlertCircle />
                        <span>{messagingStatusNotice}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isCustomer && (
                  <div className="collab-demo-actions">
                    <p className="collab-demo-note">
                      🎮 Demo : Simuler la validation de toutes les étapes
                    </p>
                    <button
                      className="collab-btn-outline"
                      onClick={() => {
                        setEtapes(
                          etapes.map((e) => ({ ...e, statut: "validee" })),
                        );
                        setTimeout(() => setCurrentStep(9), 1500);
                      }}
                    >
                      <FiCheck /> Tout valider et clôturer
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 9 : Clôture & Avis */}
            {currentStep === 9 && (
              <div className="collab-step-content">
                <div className="collab-step-header success">
                  <div
                    className="collab-step-icon"
                    style={{ backgroundColor: "#28a74520" }}
                  >
                    <FiAward style={{ color: "#28a745" }} />
                  </div>
                  <div>
                    <h2>Projet terminé ! 🎉</h2>
                    <p>Félicitations pour cette belle collaboration</p>
                  </div>
                </div>

                <div className="collab-cloture-card">
                  <div className="collab-cloture-header">
                    <div className="collab-cloture-badge">
                      <FiCheckCircle />
                      <span>Collaboration réussie</span>
                    </div>
                  </div>

                  <div className="collab-cloture-summary">
                    <div className="collab-cloture-item">
                      <FiDollarSign />
                      <div>
                        <span className="collab-cloture-label">
                          Montant total
                        </span>
                        <span className="collab-cloture-value">
                          {etapes
                            .reduce((sum, e) => sum + e.montant, 0)
                            .toLocaleString()}{" "}
                          FCFA
                        </span>
                      </div>
                    </div>
                    <div className="collab-cloture-item">
                      <FiCalendar />
                      <div>
                        <span className="collab-cloture-label">
                          Durée du projet
                        </span>
                        <span className="collab-cloture-value">14 jours</span>
                      </div>
                    </div>
                    <div className="collab-cloture-item">
                      <FiList />
                      <div>
                        <span className="collab-cloture-label">
                          Étapes validées
                        </span>
                        <span className="collab-cloture-value">
                          {etapes.length}/{etapes.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isCustomer ? (
                    <div className="collab-rating-section">
                      <h3>
                        Notez votre collaboration avec{" "}
                        {freelance.nom.split(" ")[0]}
                      </h3>
                      {isCheckingExistingReview && (
                        <p className="collab-demo-note">
                          Verification d'un avis existant en cours...
                        </p>
                      )}
                      {hasExistingReview && (
                        <div className="collab-alert-info" style={{ marginBottom: 12 }}>
                          <FiCheckCircle />
                          <span>
                            Vous avez deja depose un avis pour ce projet. Merci !
                          </span>
                        </div>
                      )}
                      <div className="collab-rating-stars">
                        {renderStars(avis.note, true)}
                      </div>
                      <textarea
                        placeholder="Partagez votre expérience (optionnel)"
                        value={avis.commentaire}
                        onChange={(e) =>
                          setAvis({ ...avis, commentaire: e.target.value })
                        }
                        rows={3}
                      />
                      <div className="collab-recommande">
                        <span>Recommanderiez-vous ce professionnel ?</span>
                        <div className="collab-recommande-btns">
                          <button
                            className={`collab-recommande-btn ${avis.recommande === true ? "active yes" : ""}`}
                            onClick={() => setAvis({ ...avis, recommande: true })}
                          >
                            <FiThumbsUp /> Oui
                          </button>
                          <button
                            className={`collab-recommande-btn ${avis.recommande === false ? "active no" : ""}`}
                            onClick={() =>
                              setAvis({ ...avis, recommande: false })
                            }
                          >
                            <FiThumbsDown /> Non
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="collab-alert-info" style={{ marginBottom: 12 }}>
                      <FiCheckCircle />
                      <span>
                        Le client peut laisser un avis final. Merci pour votre collaboration.
                      </span>
                    </div>
                  )}

                  {/* Badges gagnés */}
                  <div className="collab-badges-section">
                    <h4>
                      <FiAward /> Badges obtenus
                    </h4>
                    <div className="collab-badges-grid">
                      <div className="collab-badge-item">
                        <div className="collab-badge-icon gold">
                          <FaHandshake />
                        </div>
                        <span>Collaboration réussie</span>
                      </div>
                      <div className="collab-badge-item">
                        <div className="collab-badge-icon blue">
                          <FiZap />
                        </div>
                        <span>Livraison rapide</span>
                      </div>
                      <div className="collab-badge-item">
                        <div className="collab-badge-icon green">
                          <FiShield />
                        </div>
                        <span>Paiement sécurisé</span>
                      </div>
                    </div>
                  </div>

                  <div className="collab-step-actions">
                    <button
                      className="collab-btn-secondary"
                      onClick={() => navigate("/marketplace")}
                    >
                      <FiArrowLeft /> Retour au marketplace
                    </button>
                    {isCustomer && (
                      <button
                        className="collab-btn-primary"
                        onClick={() => void submitReview()}
                        disabled={
                          submitReviewMutation.isPending ||
                          reviewSubmitSuccess ||
                          hasExistingReview ||
                          isCheckingExistingReview
                        }
                      >
                        {reviewSubmitSuccess ? (
                          <>
                            <FiCheckCircle /> Avis publié
                          </>
                        ) : submitReviewMutation.isPending ? (
                          <>
                            <FiClock /> Publication...
                          </>
                        ) : (
                          <>
                            <FiSend /> Publier mon avis
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  {reviewSubmitSuccess && (
                    <div className="collab-success-message" style={{ marginTop: 16 }}>
                      <FiCheckCircle />
                      <div>
                        <h4>Merci, votre avis a été enregistré.</h4>
                        <p>Votre retour aide la communauté Jobty.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
