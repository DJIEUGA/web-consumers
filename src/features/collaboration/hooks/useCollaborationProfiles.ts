import { useMemo } from "react";
import {
  type CollaborationCardSummary,
  type CollaborationSpaceResponse,
} from "@/features/collaboration/services/collaborationApi";
import {
  useSpaceDetail,
  useProProfileDetails,
  useCustomerProfileDetails,
} from "./useCollaboration";

type AuthUserLike = {
  firstName?: string;
  lastName?: string;
  avatar?: string;
};

type PersonSummary = {
  photo: string;
  id: string | number;
  nom: string;
  avatarUrl?: string;
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
  avatarUrl: string;
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
  collaborationRoomId?: string;
  resolvedSpaceId: string;
  isSpaceResolving?: boolean;
  backendSpace?: CollaborationSpaceResponse | null;
  authUser?: AuthUserLike | null;
  currentUserProfile?: Record<string, unknown> | null;
};

// ── Helpers ──────────────────────────────────────────────────────

const str = (value: unknown): string =>
  value === null || value === undefined ? "" : String(value).trim();

const num = (value: unknown, fallback = 0): number => {
  if (value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** Return the first non-empty string among the candidates. */
const pick = (...values: unknown[]): string => {
  for (const v of values) {
    const s = str(v);
    if (s) return s;
  }
  return "";
};

const buildAvatarFallback = (name: string, seed?: string): string => {
  const label = str(name) || "Jobty";
  const safeSeed = encodeURIComponent(str(seed) || label);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=EEF2FF&color=3730A3&bold=true&size=256&rounded=true&seed=${safeSeed}`;
};

const resolveAvatar = (profile: Record<string, any>): string => {
  const avatarUrl = pickString(
    profile?.avatarUrl,
    profile?.avatar,
    profile?.photo,
    profile?.profilePicture,
    profile?.profileImage,
    profile?.imageUrl,
    profile?.logoUrl,
    profile?.companyLogo,
    profile?.logo,
    profile?.user?.avatarUrl,
    profile?.user?.avatar,
    profile?.profile?.avatarUrl,
    profile?.profile?.avatar,
    profile?.company?.logoUrl,
    profile?.company?.avatarUrl,
  );
  return avatarUrl;
};

const resolveLocationLabel = (profile: Record<string, any>): string => {
  const locationRaw = profile.location;
  const addressRaw = profile.address;
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

  if (addressRaw && typeof addressRaw === "object") {
    const asAddress = addressRaw as Record<string, unknown>;
    const composed = [
      toStringValue(asAddress.city ?? asAddress.ville),
      toStringValue(asAddress.country ?? asAddress.pays),
    ]
      .filter(Boolean)
      .join(", ");
    if (composed) return composed;
  }

  return pickString(
    locationRaw,
    addressRaw,
    [toStringValue(profile.city ?? profile.ville), toStringValue(profile.country ?? profile.pays)]
      .filter(Boolean)
      .join(", "),
  );
};

const toSkillsList = (skills: unknown): string[] => {
  if (!Array.isArray(skills)) return [];
  return skills
    .map((s) => (typeof s === "string" ? s.trim() : typeof s === "object" && s ? str((s as any).name || (s as any).label) : ""))
    .filter(Boolean);
};

/**
 * Merge a Record<string, unknown> from the public profile endpoint
 * into a partial ProfileDetailsDTO so we can reuse the same helper functions.
 */
const recordToProfileDTO = (
  record: Record<string, unknown> | undefined | null,
): ProfileDetailsDTO | undefined => {
  if (!record || typeof record !== "object") return undefined;
  return {
    userId: str(record.userId ?? record.id),
    firstName: str(record.firstName || record.prenom),
    lastName: str(record.lastName || record.nom),
    displayName: str(record.displayName),
    fullName: str(record.fullName),
    email: str(record.email),
    role: str(record.role),
    verified: Boolean(record.verified),
    country: str(record.country || record.pays || record.nation || (record.location as any)?.country),
    city: str(record.city || record.ville || record.town || (record.location as any)?.city),
    phoneNumber: str(record.phoneNumber || record.phone || record.tel),
    avatarUrl: str(record.avatarUrl || record.logoUrl || record.avatar || record.photo || record.profilePictureUrl || record.avatar_url || record.profilePicture || record.picture),
    bio: str(record.bio || record.description || record.summary),
    hourlyRate: record.hourlyRate != null ? Number(record.hourlyRate) : undefined,
    specialization: str(record.specialization || record.specialite || record.headline),
    experienceYears: record.experienceYears != null ? Number(record.experienceYears) : undefined,
    sector: str(record.sector || record.secteur || record.industry),
    companyName: str(record.companyName || record.nomEntreprise || record.entreprise || record.company),
    skills: Array.isArray(record.skills) ? record.skills as string[] : undefined,
    reputationScore: record.reputationScore != null ? Number(record.reputationScore) : undefined,
    reviewCount: record.reviewCount != null ? Number(record.reviewCount) : undefined,
    averageRating: record.averageRating != null ? Number(record.averageRating) : undefined,
    isPremium: Boolean(record.isPremium),
    isAvailable: Boolean(record.isAvailable),
    coverImageUrl: str(record.coverImageUrl),
  };
};

// ── Hook ────────────────────────────────────────────────────────

export const useCollaborationProfiles = ({
  isPro,
  isCustomer,
  collaborationRoomId,
  resolvedSpaceId,
  isSpaceResolving,
  backendSpace,
  authUser,
  currentUserProfile,
}: UseCollaborationProfilesParams) => {
  // Fetch space detail (shares react-query cache with useCollaborationWorkspaceSync)
  const spaceQuery = useSpaceDetail(resolvedSpaceId || undefined);

  const space = spaceQuery.data ?? backendSpace ?? null;
  const isSpaceLoading = Boolean(resolvedSpaceId) && !space && spaceQuery.isPending;
  const roomPair = parseRoomPair(String(collaborationRoomId || ""));
  

  // Merge DTOs from both detail endpoint AND list endpoint (backendSpace)
  // The detail endpoint may return preCollaborationDetail without profiles,
  // while the list endpoint may carry them.
  const spaceProDTO: ProfileDetailsDTO | undefined =
    space?.proDetails ?? 
    backendSpace?.proDetails ?? 
    (space as any)?.professional ?? 
    (space as any)?.freelance ?? 
    undefined;
  const spaceCustomerDTO: ProfileDetailsDTO | undefined =
    space?.customerDetails ?? 
    backendSpace?.customerDetails ?? 
    (space as any)?.client ?? 
    (space as any)?.customer ?? 
    (space as any)?.owner ??
    undefined;

  // Also merge name fields from all available sources
  const effectiveCustomerName = pick(
    space?.customerName,
    backendSpace?.customerName,
    (space as any)?.clientName,
    (space as any)?.client?.name,
    (space as any)?.client?.fullName,
    (space as any)?.customer?.name,
    (space as any)?.customer?.fullName,
  );
  const effectiveProName = pick(
    space?.proName,
    backendSpace?.proName,
    (space as any)?.freelanceName,
    (space as any)?.professional?.name,
    (space as any)?.professional?.fullName,
    (space as any)?.freelance?.name,
    (space as any)?.freelance?.fullName,
  );

  const proId = pick(
    space?.proId,
    backendSpace?.proId,
    spaceProDTO?.userId,
    roomPair?.proId,
    (space as any)?.professional?.id,
    (space as any)?.professional?.userId,
    (space as any)?.freelance?.id,
  );
  const customerId = pick(
    space?.customerId,
    backendSpace?.customerId,
    spaceCustomerDTO?.userId,
    roomPair?.customerId,
    (space as any)?.client?.id,
    (space as any)?.client?.userId,
    (space as any)?.customer?.id,
    (space as any)?.owner?.id,
  );

  // ── Fallback: fetch profile details separately when space detail doesn't include them ──
  // Always trigger the API call when we have an ID but are missing a real photo or location.
  const needsProFallback = Boolean(proId) && (!spaceProDTO?.avatarUrl || !spaceProDTO?.city);
  const needsCustomerFallback = Boolean(customerId) && (!spaceCustomerDTO?.avatarUrl || !spaceCustomerDTO?.city);

  // Pro profile: public endpoint, works for listed pros
  const proProfileQuery = useProProfileDetails(proId || undefined, needsProFallback);

  // Customer profile: uses the same /public/profiles/{id}/details endpoint.
  const customerProfileQuery = useCustomerProfileDetails(customerId || undefined, needsCustomerFallback);

  const isFreelanceQueryLoading = Boolean(proId) && needsProFallback && proProfileQuery.isPending;
  const isCustomerQueryLoading = Boolean(customerId) && needsCustomerFallback && customerProfileQuery.isPending;

  const isIdentityResolutionPending =
    isSpaceLoading ||
    Boolean(isSpaceResolving) ||
    isFreelanceQueryLoading ||
    isCustomerQueryLoading ||
    (!space && !resolvedSpaceId && Boolean(roomPair));

  // DEBUG: trace data sources for profile mapping
  if ((space || backendSpace) && (typeof window !== "undefined")) {
    console.debug("[CollabProfiles] data sources →", {
      spaceId: space?.id,
      proId,
      customerId,
      // Detail endpoint data
      "detail.customerName": spaceQuery.data?.customerName,
      "detail.proName": spaceQuery.data?.proName,
      "detail.hasCustomerDetails": !!spaceQuery.data?.customerDetails,
      "detail.hasProDetails": !!spaceQuery.data?.proDetails,
      // List endpoint data (backendSpace)
      "list.customerName": backendSpace?.customerName,
      "list.proName": backendSpace?.proName,
      "list.hasCustomerDetails": !!backendSpace?.customerDetails,
      "list.hasProDetails": !!backendSpace?.proDetails,
      // Merged effective values
      effectiveCustomerName,
      effectiveProName,
      hasSpaceProDTO: !!spaceProDTO,
      hasSpaceCustomerDTO: !!spaceCustomerDTO,
    });
  }



  // Merge: prefer space-level DTO, fall back to separately-fetched profile
  const proDTO: ProfileDetailsDTO | undefined = useMemo(() => {
    // Current user context (highest priority if I am the pro)
    if (isPro && (currentUserProfile || authUser)) {
      return recordToProfileDTO({ ...authUser, ...currentUserProfile });
    }

    const base = spaceProDTO || {};
    const publicData = proProfileQuery.data ? recordToProfileDTO(proProfileQuery.data as Record<string, unknown>) : {};
    
    // Merge: Space > Public > Minimal from Name
    const merged = {
      ...(effectiveProName ? { displayName: effectiveProName } : {}),
      ...publicData,
      ...base
    };

    if (Object.keys(merged).length === 0) return undefined;
    return merged as ProfileDetailsDTO;
  }, [spaceProDTO, proProfileQuery.data, effectiveProName, proId, isPro, currentUserProfile, authUser]);

  const customerDTO: ProfileDetailsDTO | undefined = useMemo(() => {
    // Current user context (highest priority if I am the customer)
    if (isCustomer && (currentUserProfile || authUser)) {
      return recordToProfileDTO({ ...authUser, ...currentUserProfile });
    }

    const base = spaceCustomerDTO || {};
    const publicData = customerProfileQuery.data ? recordToProfileDTO(customerProfileQuery.data as Record<string, unknown>) : {};

    // Merge: Space > Public > Minimal from Name
    const merged = {
      ...(effectiveCustomerName ? { displayName: effectiveCustomerName } : {}),
      ...publicData,
      ...base
    };

    if (Object.keys(merged).length === 0) return undefined;
    return merged as ProfileDetailsDTO;
  }, [spaceCustomerDTO, customerProfileQuery.data, effectiveCustomerName, customerId, isCustomer, currentUserProfile, authUser]);

  const isFreelanceIdentityLoading = Boolean(proId) && !proDTO && (needsProFallback ? proProfileQuery.isPending : false);
  const isOwnerIdentityLoading = Boolean(customerId) && !customerDTO && (needsCustomerFallback
    ? customerProfileQuery.isPending
    : false);

  // ── Freelance (professional) ──────────────────────────────────

  const freelance = useMemo<PersonSummary>(() => {
    const p = (publicProProfile || {}) as Record<string, any>;
    const pd = (space?.proDetails || {}) as Record<string, any>;
    const proFullName = [pd.firstName ?? p.firstName, pd.lastName ?? p.lastName].filter(Boolean).join(" ").trim();
    const displayName = pickString(
      space?.proName,
      proFullName,
      pd.displayName ?? p.displayName,
      pd.fullName ?? p.fullName,
      pd.name ?? p.name,
      pd.email ?? p.email,
      pd.userId ?? p.userId,
      "Professionnel Jobty",
    );

    const rating = toNumberValue(p.averageRating ?? p.stats?.averageRating ?? p.rating, 0);
    const reviewCount = toNumberValue(
      p.reviewCount ?? p.stats?.reviewCount ??
      (Array.isArray(p.reviews) ? p.reviews.length : 0),
      0,
    );

    const completedProjects = toNumberValue(
      p.completedProjects ?? p.stats?.completedProjects ?? 0,
      0,
    );
    const collaborationsEnCours = toNumberValue(
      p.stats?.ongoingProjects ?? p.ongoingProjects ?? p.collaborationsEnCours ?? 0,
      0,
    );

    const hourlyRate = Number(p.hourlyRate ?? p.tarifHoraire ?? NaN);

    const headline = pickString(p.specialization, p.sector, p.bio);
    const specialty = pickString(p.specialization, p.sector);
    const locationStr = formatLocation(p);
    const isVerified = Boolean(p.verified ?? p.isVerified ?? false);

    const skillArrays = normalizeSkillsList(
      p.skills,
      p.competences,
      p.expertises,
      p.technologies,
      p.stack,
      p.tags,
      p.topSkills,
    );

    const skillsFromServices = normalizeSkillsList(p.services).slice(0, 4);

    const normalizedSkills = Array.from(
      new Set([...skillArrays, ...skillsFromServices, specialty].filter(Boolean)),
    ).slice(0, 5);

    const responseRateRaw = p.stats?.responseRate ?? p.responseRate ?? p.stats?.responseRatePercent;
    const responseRate =
      typeof responseRateRaw === "number"
        ? responseRateRaw > 1
          ? `${Math.round(responseRateRaw)}%`
          : `${Math.round(responseRateRaw * 100)}%`
        : "N/A";

    return {
      id: proId,
      nom: displayName,
      poste: headline || "Profil non renseigné",
      photo: pickString(pd.avatarUrl, resolveAvatar(p)) || buildAvatarFallback(displayName, proProfileLookupId || space?.proId),
      location: locationStr || "Localisation non renseignée",
      note: Number.isFinite(rating) ? rating : 0,
      avis: Number.isFinite(reviewCount) ? reviewCount : 0,
      projetsRealises: Number.isFinite(completedProjects) ? completedProjects : 0,
      tauxReponse: responseRate,
      delaiReponse: String(p.stats?.avgResponseTime ?? "< 2h").trim(),
      competences: normalizedSkills.length > 0 ? normalizedSkills : [],
      verified: isVerified,
      specialite: specialty,
      tarifHoraire: d?.hourlyRate != null && Number.isFinite(d.hourlyRate) ? d.hourlyRate : null,
      note: num(d?.averageRating),
      avis: num(d?.reviewCount),
      projetsRealises: 0,
      tauxReponse: "N/A",
      delaiReponse: "< 2h",
      competences: skills.length > 0 ? skills.slice(0, 5) : [],
      verified: Boolean(d?.verified),
      anciennete: "N/A",
      collaborationsEnCours: 0,
    };
  }, [space, proId, proDTO, effectiveProName]);

  // ── Porteur de projet (customer) ──────────────────────────────

  const porteur = useMemo<PersonSummary>(() => {
    const o = (resolvedOwnerProfile || {}) as Record<string, any>;
    const cd = (space?.customerDetails || {}) as Record<string, any>;
    const custFullName = [cd.firstName ?? o.firstName, cd.lastName ?? o.lastName].filter(Boolean).join(" ").trim();
    const displayName = pickString(
      space?.customerName,
      custFullName,
      cd.displayName ?? o.displayName,
      cd.fullName ?? o.fullName,
      cd.name ?? o.name,
      cd.email ?? o.email,
      cd.userId ?? o.userId,
      "Client Jobty",
    );
    const companyName = pickString(cd.bio ?? o.bio, cd.specialization ?? o.specialization, cd.sector ?? o.sector);

    return {
      id: customerId || "owner",
      nom: displayName,
      photo: pickString(cd.avatarUrl, resolveAvatar(o)) || buildAvatarFallback(displayName, ownerProfileLookupId || space?.customerId),
      entreprise: pickString(companyName, "Client Jobty"),
    };
  }, [space, customerId, customerDTO, effectiveCustomerName]);

  // ── Loading / Error states ────────────────────────────────────

  const sidebarIdentityLoading =
    (isPro ? isOwnerIdentityLoading : isFreelanceIdentityLoading) || isSpaceLoading;

  const cannotIdentifyPro =
    isCustomer && !proId && !proDTO && !isIdentityResolutionPending && !proProfileQuery.isPending;
  const cannotIdentifyCustomer =
    isPro && !customerId && !customerDTO && !isIdentityResolutionPending && !customerProfileQuery.isPending;

  const sidebarError = isCustomer ? cannotIdentifyPro : cannotIdentifyCustomer;

  const sidebarErrorMessage = useMemo(() => {
    if (isCustomer && cannotIdentifyPro)
      return "Impossible d'identifier le professionnel associé.";
    if (isPro && cannotIdentifyCustomer)
      return "Impossible d'identifier le porteur de projet associé.";
    return "";
  }, [isCustomer, isPro, cannotIdentifyPro, cannotIdentifyCustomer]);

  const profileError = false;

  // ── Sidebar profile (the "other person" card) ─────────────────

  const sidebarProfile = useMemo<SidebarProfile>(() => {
    if (isPro) {
      // Pro sees the customer in the sidebar
      return {
        nom: porteur.nom,
        photo: porteur.avatarUrl,
        poste: pickString(o.specialization, o.sector, porteur.entreprise, "Client Jobty"),
        location: ownerLocation || "Localisation non renseignée",
        specialite: pickString(o.specialization, o.specialty, o.specialite, o.sector, o.secteur),
        tarifHoraire: null,
        note: num(customerDTO?.averageRating),
        avis: num(customerDTO?.reviewCount),
        projetsRealises: 0,
        collaborationsEnCours: 0,
        competences: toSkillsList(customerDTO?.skills).slice(0, 4),
        verified: Boolean(customerDTO?.verified),
      };
    }

    // Customer sees the freelance in the sidebar
    return {
      nom: freelance.nom,
      photo: freelance.avatarUrl,
      poste: String(freelance.poste || "Profil non renseigné"),
      location: String(freelance.location || "Localisation non renseignée"),
      specialite: String(freelance.specialite || ""),
      tarifHoraire: freelance.tarifHoraire ?? null,
      note: Number(freelance.note || 0),
      avis: Number(freelance.avis || 0),
      projetsRealises: Number(freelance.projetsRealises || 0),
      collaborationsEnCours: Number(freelance.collaborationsEnCours || 0),
      competences: Array.isArray(freelance.competences) ? freelance.competences : [],
      verified: Boolean(freelance.verified),
    };
  }, [freelance, isPro, porteur, customerDTO]);

  return {
    ownerProfileLookupId: customerId,
    freelance,
    porteur,
    isFreelanceIdentityLoading,
    isOwnerIdentityLoading,
    sidebarIdentityLoading,
    sidebarProfile,
    profileError,
    sidebarError,
    sidebarErrorMessage,
  };
};
