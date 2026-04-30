import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  collaborationApi,
  type CollaborationSpaceResponse,
} from "@/features/collaboration/services/collaborationApi";
import { usePublicProfile } from "@/features/profile/hooks/useProfileActions";
import {
  getProfilePayload,
  isUuidLike,
} from "@/features/collaboration/utils/workflow";

type AuthUserLike = {
  firstName?: string;
  lastName?: string;
  avatar?: string;
};

type PersonSummary = {
  id: string | number;
  nom: string;
  photo: string;
  poste?: string;
  entreprise?: string;
  location?: string;
  specialite?: string;
  tarifHoraire?: number | null;
  note?: number;
  avis?: number;
  projetsRealises?: number;
  tauxReponse?: string;
  delaiReponse?: string;
  competences?: string[];
  verified?: boolean;
  anciennete?: string;
  collaborationsEnCours?: number;
};

type SidebarProfile = {
  nom: string;
  photo: string;
  poste: string;
  location: string;
  specialite: string;
  tarifHoraire: number | null;
  note: number;
  avis: number;
  projetsRealises: number;
  collaborationsEnCours: number;
  competences: string[];
  verified: boolean;
};

type UseCollaborationProfilesParams = {
  isPro: boolean;
  isCustomer: boolean;
  currentUserId: string;
  incomingId: string;
  backendSpace: CollaborationSpaceResponse | null;
  authUser?: AuthUserLike | null;
  currentUserProfile?: Record<string, unknown> | null;
  resolvedSpaceId?: string;
  isSpaceLoading?: boolean;
};

const toStringValue = (value: unknown): string =>
  value === null || value === undefined ? "" : String(value).trim();

const toNumberValue = (value: unknown, fallback = 0): number => {
  if (value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const pickString = (...values: unknown[]): string => {
  for (const value of values) {
    const normalized = toStringValue(value);
    if (normalized) return normalized;
  }
  return "";
};

const resolveLocationLabel = (profile: Record<string, any>): string => {
  const locationRaw = profile.location;
  if (locationRaw && typeof locationRaw === "object") {
    const asObj = locationRaw as Record<string, unknown>;
    const composed = [
      toStringValue(asObj.city ?? asObj.ville),
      toStringValue(asObj.country ?? asObj.pays),
    ]
      .filter(Boolean)
      .join(", ");
    if (composed) return composed;
  }

  return pickString(
    locationRaw,
    [toStringValue(profile.city ?? profile.ville), toStringValue(profile.country ?? profile.pays)]
      .filter(Boolean)
      .join(", "),
  );
};

const normalizeSkillsList = (...candidates: unknown[]): string[] => {
  const normalizeSkill = (skill: unknown): string => {
    if (typeof skill === "string") return skill.trim();
    if (skill && typeof skill === "object") {
      const s = skill as Record<string, unknown>;
      return pickString(s.name, s.title, s.label, s.value, s.skill);
    }
    return "";
  };

  const flattened = candidates
    .filter(Array.isArray)
    .flatMap((arr) => (arr as unknown[]).map(normalizeSkill))
    .filter(Boolean);

  return Array.from(new Set(flattened));
};

export const useCollaborationProfiles = ({
  isPro,
  isCustomer,
  currentUserId,
  incomingId,
  backendSpace,
  authUser,
  currentUserProfile,
  resolvedSpaceId,
  isSpaceLoading,
}: UseCollaborationProfilesParams) => {
  const hasCurrentUserProfile = Boolean(
    currentUserProfile && Object.keys(currentUserProfile).length > 0,
  );

  const normalizeProfile = (value: unknown): Record<string, any> => {
    const payload = getProfilePayload(value);
    const nestedUser =
      payload?.user && typeof payload.user === "object"
        ? (payload.user as Record<string, unknown>)
        : {};

    return {
      ...nestedUser,
      ...(payload || {}),
    } as Record<string, any>;
  };

  const proProfileLookupId = useMemo(() => {
    // If current user is a Pro, we don't need to look up our own public profile via public API here,
    // as we rely on currentUserProfile for self-details. This prevents false errors if the pro is not yet public.
    if (isPro) return "";

    const backendProId = String(backendSpace?.proId || "").trim();
    if (backendProId && isUuidLike(backendProId)) {
      return backendProId;
    }

    // Never speculate on incoming UUID while spaces are still loading.
    if (isSpaceLoading) return "";

    // Only treat incomingId as participant ID if it's not confirmed as a space ID.
    const isIncomingSpaceId = resolvedSpaceId === incomingId;

    if (
      isCustomer &&
      incomingId &&
      isUuidLike(incomingId) &&
      incomingId !== currentUserId &&
      !isIncomingSpaceId
    ) {
      return incomingId;
    }

    const matchedPair = incomingId.match(/^room:(.+)::(.+)$/);
    const pairProId = String(matchedPair?.[2] || "").trim();
    if (pairProId && isUuidLike(pairProId)) {
      return pairProId;
    }

    return "";
  }, [backendSpace?.proId, currentUserId, incomingId, isCustomer, isPro, isSpaceLoading, resolvedSpaceId]);

  const publicProProfileQuery = usePublicProfile(
    proProfileLookupId || undefined,
  );
  const publicProProfile = useMemo(
    () => normalizeProfile(publicProProfileQuery.data),
    [publicProProfileQuery.data],
  );

  const ownerProfileLookupId = useMemo(() => {
    const backendCustomerId = String(backendSpace?.customerId || "").trim();
    if (backendCustomerId && isUuidLike(backendCustomerId)) {
      return backendCustomerId;
    }

    if (isSpaceLoading) return "";

    const isIncomingSpaceId = resolvedSpaceId === incomingId;

    if (
      isPro &&
      incomingId &&
      isUuidLike(incomingId) &&
      incomingId !== currentUserId &&
      !isIncomingSpaceId
    ) {
      return incomingId;
    }

    const matchedPair = incomingId.match(/^room:(.+)::(.+)$/);
    const pairCustomerId = String(matchedPair?.[1] || "").trim();
    if (pairCustomerId && isUuidLike(pairCustomerId)) {
      return pairCustomerId;
    }

    return "";
  }, [backendSpace?.customerId, currentUserId, incomingId, isPro, isSpaceLoading, resolvedSpaceId]);

  const publicOwnerProfileQuery = usePublicProfile(
    !isPro ? ownerProfileLookupId || undefined : undefined,
  );
  const publicOwnerProfile = useMemo(
    () => normalizeProfile(publicOwnerProfileQuery.data),
    [publicOwnerProfileQuery.data],
  );

  const customerOwnerProfileQuery = useQuery({
    queryKey: ["collaboration", "customer-profile", ownerProfileLookupId],
    queryFn: () =>
      collaborationApi.getCustomerProfileDetails(ownerProfileLookupId),
    enabled: isPro && Boolean(ownerProfileLookupId),
    staleTime: 5 * 60 * 1000,
  });

  const customer = useMemo(
    () => normalizeProfile(customerOwnerProfileQuery.data),
    [customerOwnerProfileQuery.data],
  );

  const resolvedOwnerProfile = isPro
    ? customer
    : (hasCurrentUserProfile
      ? normalizeProfile(currentUserProfile)
      : publicOwnerProfile);

  const isFreelanceIdentityLoading =
    Boolean(proProfileLookupId) &&
    publicProProfileQuery.isPending &&
    Object.keys(publicProProfile).length === 0;

  const isOwnerIdentityLoading =
    Boolean(ownerProfileLookupId) &&
    (isPro
      ? customerOwnerProfileQuery.isPending
      : publicOwnerProfileQuery.isPending) &&
    Object.keys(resolvedOwnerProfile).length === 0;

  const freelance = useMemo<PersonSummary>(() => {
    const p = ((isPro
      ? { ...(publicProProfile || {}), ...(currentUserProfile || {}) }
      : publicProProfile) || {}) as Record<string, any>;

    // --- Name ---
    const fullName = [p.firstName, p.lastName].filter(Boolean).join(" ").trim();
    const displayName = pickString(
      backendSpace?.proName,
      fullName,
      p.displayName,
      p.username,
      p.companyName,
      "Professionnel Jobty",
    );

    // --- Rating & reviews ---
    const rating = toNumberValue(p.averageRating ?? p.stats?.averageRating ?? p.rating, 0);
    const reviewCount = toNumberValue(
      p.reviewCount ?? p.stats?.reviewCount ??
      (Array.isArray(p.reviews) ? p.reviews.length : 0),
      0,
    );

    // --- Projects ---
    const completedProjects = toNumberValue(
      p.completedProjects ?? p.stats?.completedProjects ?? 0,
      0,
    );
    const collaborationsEnCours = toNumberValue(
      p.stats?.ongoingProjects ?? p.ongoingProjects ?? p.collaborationsEnCours ?? 0,
      0,
    );

    // --- Hourly rate ---
    const hourlyRate = Number(p.hourlyRate ?? p.tarifHoraire ?? NaN);

    // --- Headline / position ---
    const headline = pickString(
      p.headline,
      p.poste,
      p.jobTitle,
      p.specialty,
      p.specialization,
      p.specialite,
      p.bio,
    );

    // --- Specialty ---
    const specialty = pickString(
      p.specialty,
      p.specialization,
      p.specialite,
      p.sector,
      p.secteur,
    );

    // --- Location: handle LocationDto object OR top-level city/country strings ---
    const locationStr = resolveLocationLabel(p);

    // --- Verified ---
    const isVerified = Boolean(p.isVerified ?? p.verified ?? false);

    // --- Skills aggregation ---
    const skillArrays = normalizeSkillsList(
      p.skills,
      p.competences,
      p.expertises,
      p.technologies,
      p.stack,
      p.tags,
      p.topSkills,
    );

    const skillsFromServices = (publicProProfile?.services ?? [])
      .map((s: any) => String(s?.title ?? "").trim())
      .filter(Boolean)
      .slice(0, 4);

    const normalizedSkills = Array.from(
      new Set([...skillArrays, ...skillsFromServices, specialty].filter(Boolean)),
    ).slice(0, 5);

    // --- Response rate ---
    const responseRateRaw = p.stats?.responseRate ?? p.responseRate ?? p.stats?.responseRatePercent;
    const responseRate =
      typeof responseRateRaw === "number"
        ? responseRateRaw > 1
          ? `${Math.round(responseRateRaw)}%`
          : `${Math.round(responseRateRaw * 100)}%`
        : "N/A";

    return {
      id: proProfileLookupId || 1,
      nom: displayName,
      poste: headline || "Profil non renseigné",
      photo:
        p.avatarUrl ||
        p.avatar ||
        "/images/avatars/avatar1.jpg",
      location: locationStr || "Localisation non renseignée",
      note: Number.isFinite(rating) ? rating : 0,
      avis: Number.isFinite(reviewCount) ? reviewCount : 0,
      projetsRealises: Number.isFinite(completedProjects) ? completedProjects : 0,
      tauxReponse: responseRate,
      delaiReponse: String(p.stats?.avgResponseTime ?? "< 2h").trim(),
      competences: normalizedSkills.length > 0 ? normalizedSkills : [],
      verified: isVerified,
      specialite: specialty,
      tarifHoraire: Number.isFinite(hourlyRate) ? hourlyRate : null,
      anciennete: String(p.stats?.durationOnPlatform ?? p.anciennete ?? "N/A").trim(),
      collaborationsEnCours: Number.isFinite(collaborationsEnCours) ? collaborationsEnCours : 0,
    };
  }, [backendSpace?.proName, currentUserProfile, isPro, proProfileLookupId, publicProProfile]);

  const porteur = useMemo<PersonSummary>(() => {
    const o = (resolvedOwnerProfile || {}) as Record<string, any>;
    const fullName = [o.firstName, o.lastName].filter(Boolean).join(" ").trim();
    const companyName = pickString(o.companyName, o.businessName, o.entreprise, o.nomEntreprise);
    const displayName = pickString(
      backendSpace?.customerName,
      fullName,
      o.displayName,
      o.username,
      companyName,
      [authUser?.firstName, authUser?.lastName].filter(Boolean).join(" ").trim(),
      "Client Jobty",
    );

    return {
      id: ownerProfileLookupId || "owner",
      nom: displayName,
      photo:
        o.avatarUrl ||
        o.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=F3F4F6&color=6B7280&bold=true`,
      entreprise: pickString(o.headline, o.poste, o.jobTitle, companyName, o.displayName, "Client Jobty"),
    };
  }, [
    authUser?.firstName,
    authUser?.lastName,
    backendSpace?.customerName,
    ownerProfileLookupId,
    resolvedOwnerProfile,
  ]);

  const sidebarIdentityLoading =
    (isPro ? isOwnerIdentityLoading : isFreelanceIdentityLoading) ||
    Boolean(isSpaceLoading);

  // Error states for Customer view (looking at a Professional)
  const proProfileLoadError = Boolean(isCustomer && proProfileLookupId && publicProProfileQuery.isError);
  const cannotIdentifyPro = isCustomer && !proProfileLookupId && !backendSpace?.proId && !isSpaceLoading;

  // Error states for Pro view (looking at a Customer)
  const ownerProfileLoadError = Boolean(isPro && ownerProfileLookupId && customerOwnerProfileQuery.isError);
  const cannotIdentifyCustomer = isPro && !ownerProfileLookupId && !backendSpace?.customerId && !isSpaceLoading;

  const sidebarError = isCustomer
    ? proProfileLoadError || cannotIdentifyPro
    : ownerProfileLoadError || cannotIdentifyCustomer;

  const sidebarErrorMessage = useMemo(() => {
    if (isCustomer) {
      if (proProfileLoadError) return "Le profil du professionnel n'a pas pu être chargé.";
      if (cannotIdentifyPro) return "Impossible d'identifier le professionnel associé.";
    } else if (isPro) {
      if (ownerProfileLoadError) return "Le profil du porteur de projet n'a pas pu être chargé.";
      if (cannotIdentifyCustomer) return "Impossible d'identifier le porteur de projet associé.";
    }
    return "";
  }, [
    isCustomer,
    isPro,
    proProfileLoadError,
    cannotIdentifyPro,
    ownerProfileLoadError,
    cannotIdentifyCustomer,
  ]);

  /**
   * profileError determines if we show the "Profil introuvable" full-page ErrorState.
   * We only block the page if the lookup for the OTHER participant fails.
   * We don't block if our own redundant public profile lookup fails.
   */
  const profileError = isCustomer
    ? proProfileLoadError
    : isPro
      ? customerOwnerProfileQuery.isError
      : false;

  const sidebarProfile = useMemo<SidebarProfile>(() => {
    if (isPro) {
      // Pro sees the customer/porteur profile in sidebar
      const o = (resolvedOwnerProfile || {}) as Record<string, any>;

      const ownerLocation = resolveLocationLabel(o);

      const ownerSkills = normalizeSkillsList(
        o.skills,
        o.competences,
        o.expertises,
        o.tags,
        o.topSkills,
      ).slice(0, 4);

      return {
        nom: porteur.nom,
        photo: porteur.photo,
        poste: pickString(o.headline, o.poste, o.jobTitle, porteur.entreprise, "Client Jobty"),
        location: ownerLocation || "Localisation non renseignée",
        specialite: pickString(o.specialization, o.specialty, o.specialite, o.sector, o.secteur),
        tarifHoraire: null,
        note: toNumberValue(o.averageRating ?? o.stats?.averageRating ?? o.rating, 0),
        avis: toNumberValue(o.reviewCount ?? o.stats?.reviewCount, 0),
        projetsRealises: toNumberValue(o.completedProjects ?? o.stats?.completedProjects, 0),
        collaborationsEnCours: toNumberValue(o.stats?.ongoingProjects ?? o.ongoingProjects, 0),
        competences: ownerSkills.length > 0 ? ownerSkills : [],
        verified: Boolean(o.isVerified ?? o.verified ?? false),
      };
    }

    // Customer sees the pro/freelance profile in sidebar
    return {
      nom: freelance.nom,
      photo: freelance.photo,
      poste: String(freelance.poste || "Profil non renseigné"),
      location: String(freelance.location || "Localisation non renseignée"),
      specialite: String(freelance.specialite || ""),
      tarifHoraire: freelance.tarifHoraire ?? null,
      note: Number(freelance.note || 0),
      avis: Number(freelance.avis || 0),
      projetsRealises: Number(freelance.projetsRealises || 0),
      collaborationsEnCours: Number(freelance.collaborationsEnCours || 0),
      competences: Array.isArray(freelance.competences)
        ? freelance.competences
        : ["Profil pro"],
      verified: Boolean(freelance.verified),
    };
  }, [freelance, isPro, porteur, resolvedOwnerProfile]);

  return {
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
    publicProProfileQuery,
  };
};
