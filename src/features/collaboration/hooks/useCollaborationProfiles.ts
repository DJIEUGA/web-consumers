import { useMemo } from "react";
import {
  type CollaborationSpaceResponse,
  type ProfileDetailsDTO,
} from "@/features/collaboration/services/collaborationApi";
import { parseRoomPair } from "@/features/collaboration/utils/workflow";
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

export type PersonSummary = {
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


/**
 * Build a "{city}, {country}" string from a ProfileDetailsDTO.
 * The API returns flat `city` and `country` fields.
 */
const formatLocation = (dto: ProfileDetailsDTO | undefined | null): string => {
  if (!dto) return "";
  return [str(dto.city), str(dto.country)].filter(Boolean).join(", ");
};

/**
 * Build a full display name from a ProfileDetailsDTO.
 * Priority: firstName+lastName > displayName > fullName > email > userId
 */
const formatDisplayName = (
  dto: ProfileDetailsDTO | undefined | null,
  spaceLevelName: string | undefined,
  fallback: string,
): string => {
  const d = dto || ({} as ProfileDetailsDTO);
  const fullName = [str(d.firstName), str(d.lastName)].filter(Boolean).join(" ");

<<<<<<< HEAD
  // Priority: 
  // 1. Real names from DTO (firstName + lastName)
  // 2. Specific display name from DTO
  // 3. Name found at the Space level (space.customerName / space.proName)
  // 4. Email or UserID as last resort
  // 5. Hardcoded Fallback ("Client Jobty")
  
  const resolved = pick(fullName, d.displayName, d.fullName, spaceLevelName, d.email, d.userId);
  
  // If the resolved name is generic or empty, try to at least use the spaceLevelName
  if (!resolved || resolved.toLowerCase().includes("jobty")) {
     return str(spaceLevelName) || resolved || fallback;
  }

  return resolved || fallback;
=======
  return pick(fullName, d.displayName, d.fullName) || fallback;
>>>>>>> 2fe80029ff5510c45291a81aa2feafd1153b0a01
};

/**
 * Resolve the avatar URL from the DTO.
 * The API schema field is `avatarUrl`.
 */
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
    displayName: str(record.displayName || record.name),
    fullName: str(record.fullName || record.name),
    email: str(record.email),
    role: str(record.role),
    verified: Boolean(record.verified),
    country: str(record.country || record.pays || record.nation || (record.location as any)?.country),
    city: str(record.city || record.ville || record.town || (record.location as any)?.city),
    phoneNumber: str(record.phoneNumber || record.phone || record.tel),
    avatarUrl: str(record.avatarUrl || record.logoUrl || record.avatar || record.photo || record.profilePictureUrl || record.avatar_url || record.profilePicture || record.picture || record.image),
    bio: str(record.bio || record.description || record.summary || record.about),
    hourlyRate: record.hourlyRate != null ? Number(record.hourlyRate) : undefined,
    specialization: str(record.specialization || record.specialite || record.headline || record.title || record.poste),
    experienceYears: record.experienceYears != null ? Number(record.experienceYears) : undefined,
    sector: str(record.sector || record.secteur || record.industry),
    companyName: str(record.companyName || record.nomEntreprise || record.entreprise || record.company || record.organization),
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
   // re-render on route param change (e.g. spaceId) to trigger refetches in child hooks
  // Fetch space detail (shares react-query cache with useCollaborationWorkspaceSync)
  const spaceQuery = useSpaceDetail(resolvedSpaceId || undefined);

  const space = spaceQuery.data ?? backendSpace ?? null;
  const isSpaceLoading = Boolean(resolvedSpaceId) && !space && spaceQuery.isPending;
  const roomPair = parseRoomPair(String(collaborationRoomId || ""));
  

  // Merge DTOs from both detail endpoint AND list endpoint (backendSpace)
  // The detail endpoint may return preCollaborationDetail without profiles,
  // while the list endpoint may carry them.
  const spaceProDTO: ProfileDetailsDTO | undefined =
    (space as any)?.proDetails ?? 
    backendSpace?.proDetails ?? 
    (space as any)?.professional ?? 
    (space as any)?.freelance ?? 
    undefined;
  const spaceCustomerDTO: ProfileDetailsDTO | undefined =
    (space as any)?.customerDetails ?? 
    backendSpace?.customerDetails ?? 
    (space as any)?.client ?? 
    (space as any)?.customer ?? 
    (space as any)?.owner ??
    undefined;

  // Also merge name fields from all available sources
  const effectiveCustomerName = pick(
    backendSpace?.customerName,
    (space as any)?.clientName,
    (space as any)?.ownerName,
    (space as any)?.client?.name,
<<<<<<< HEAD
    (space as any)?.client?.fullName,
    (space as any)?.client?.displayName,
=======
    (space as any)?.customerDetails?.fullName,
>>>>>>> 2fe80029ff5510c45291a81aa2feafd1153b0a01
    (space as any)?.customer?.name,
    (space as any)?.customer?.fullName,
    (space as any)?.customer?.displayName,
    (space as any)?.owner?.name,
    (space as any)?.owner?.fullName,
    (space as any)?.owner?.displayName,
  );
  const effectiveProName = pick(
    backendSpace?.proName,
    (space as any)?.freelanceName,
    (space as any)?.professional?.name,
    (space as any)?.professional?.fullName,
    (space as any)?.freelance?.name,
    (space as any)?.freelance?.fullName,
  );

  const proId = pick(
    backendSpace?.proId,
    spaceProDTO?.userId,
    roomPair?.proId,
    (space as any)?.professional?.id,
    (space as any)?.professional?.userId,
    (space as any)?.freelance?.id,
  );
  const customerId = pick(
    backendSpace?.customerId,
    spaceCustomerDTO?.userId,
  );

  // ── Fallback: fetch profile details separately when space detail doesn't include them ──
  // Always trigger the API call when we have an ID but are missing a real photo or location.
  const needsProFallback = Boolean(proId) && (!spaceProDTO?.avatarUrl || !spaceProDTO?.city);
  const needsCustomerFallback = Boolean(customerId) && (!spaceCustomerDTO?.avatarUrl || !spaceCustomerDTO?.city);

  // Pro profile: public endpoint, works for listed pros
  const proProfileQuery = useProProfileDetails(proId || undefined, needsProFallback);

  // Customer profile: uses the same /customer/profiles/{id}/details endpoint.
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
      spaceId: resolvedSpaceId,
      proId,
      customerId,
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
  }, [spaceProDTO, proProfileQuery.data, effectiveProName, isPro, currentUserProfile, authUser]);

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
  }, [spaceCustomerDTO, customerProfileQuery.data, effectiveCustomerName, isCustomer, currentUserProfile, authUser]);

  const isFreelanceIdentityLoading = Boolean(proId) && !proDTO && (needsProFallback ? proProfileQuery.isPending : false);
  const isOwnerIdentityLoading = Boolean(customerId) && !customerDTO && (needsCustomerFallback
    ? customerProfileQuery.isPending
    : false);

  // ── Freelance (professional) ──────────────────────────────────

  const freelance = useMemo<PersonSummary>(() => {
    const d = proDTO;
    const displayName = formatDisplayName(d, effectiveProName, "Professionnel Jobty");
    const location = formatLocation(d);
    const photo = (space as any)?.proDetails?.avatarUrl;
    const skills = toSkillsList(d?.skills);
    const specialty = pick(d?.specialization, d?.sector);

    return {
      id: proId,
      nom: displayName,
      photo,
      poste: pick(d?.specialization, d?.sector, d?.bio) || "Profil non renseigné",
      location: location || "",
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
    const d = customerDTO;
    const displayName = formatDisplayName(d, effectiveCustomerName, "Client Jobty");
    const location = formatLocation(d);
    const photo = (space as any)?.customerDetails?.avatarUrl;

    return {
      id: customerId || "owner",
      nom: displayName,
      photo,
      location: location || "",
      entreprise: pick(d?.companyName, d?.bio, d?.specialization, d?.sector) || "Client Jobty",
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
        photo: porteur.photo,
        poste: pick(customerDTO?.specialization, customerDTO?.sector, customerDTO?.companyName, porteur.entreprise, "Client Jobty"),
        location: porteur.location || "Localisation non renseignée",
        specialite: pick(customerDTO?.specialization, customerDTO?.sector),
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
      photo: freelance.photo,
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
