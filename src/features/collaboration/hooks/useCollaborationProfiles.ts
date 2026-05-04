import { useMemo } from "react";
import {
  type CollaborationCardSummary,
  type CollaborationSpaceResponse,
} from "@/features/collaboration/types";
import {
  getProfilePayload,
  parseRoomPair,
} from "@/features/collaboration/utils/workflow";
import { useSpaceDetail } from "./useCollaboration";

type AuthUserLike = {
  firstName?: string;
  lastName?: string;
  avatar?: string;
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

const hasMeaningfulValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const mergeProfileParts = (...parts: Record<string, unknown>[]): Record<string, unknown> => {
  const merged: Record<string, unknown> = {};

  for (const part of parts) {
    for (const [key, value] of Object.entries(part || {})) {
      if (!hasMeaningfulValue(value)) continue;
      if (!hasMeaningfulValue(merged[key])) {
        merged[key] = value;
      }
    }
  }

  return merged;
};

const buildAvatarFallback = (name: string, seed?: string): string => {
  const label = toStringValue(name) || "Jobty";
  const normalizedSeed = encodeURIComponent(toStringValue(seed) || label);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=EEF2FF&color=3730A3&bold=true&size=256&rounded=true&seed=${normalizedSeed}`;
};

const resolveAvatar = (profile: Record<string, any>): string => {
  const avatarUrl = pickString(
    profile?.avatarUrl,
    profile?.avatar,
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

const formatLocation = (profile: Record<string, any>): string =>
  pickString(
    [toStringValue(profile.city), toStringValue(profile.country)].filter(Boolean).join(", "),
    profile.city,
    profile.country,
  );

export const useCollaborationProfiles = ({
  isPro,
  isCustomer,
  collaborationRoomId,
  resolvedSpaceId,
  isSpaceResolving,
  backendSpace,
  authUser,
}: UseCollaborationProfilesParams) => {
  const normalizeProfile = (value: unknown): Record<string, any> => {
    const payload = getProfilePayload(value);
    const readObject = (candidate: unknown): Record<string, unknown> =>
      candidate && typeof candidate === "object"
        ? (candidate as Record<string, unknown>)
        : {};

    const nestedUser = readObject(payload?.user);
    const nestedProfile = readObject(payload?.profile);
    const nestedCustomerProfile = readObject(payload?.customerProfile);
    const nestedCustomer = readObject(payload?.customer);
    const nestedCustomerUser = readObject(nestedCustomer?.user);
    const nestedCustomerInfo = readObject(nestedCustomer?.profile);
    const nestedEnterpriseProfile = readObject(payload?.enterpriseProfile);
    const nestedCompany = readObject(payload?.company);

    return mergeProfileParts(
      nestedUser,
      nestedProfile,
      nestedCustomerProfile,
      nestedCustomer,
      nestedCustomerUser,
      nestedCustomerInfo,
      nestedEnterpriseProfile,
      nestedCompany,
      payload || {},
    ) as Record<string, any>;
  };

  // Step 1 — fetch the space. Shares the cache with useCollaborationWorkspaceSync
  // via useSpaceDetail so no duplicate network request is made.
  const spaceQuery = useSpaceDetail(resolvedSpaceId || undefined);

  const space = spaceQuery.data ?? backendSpace ?? null;
  const isSpaceLoading = Boolean(resolvedSpaceId) && !space && spaceQuery.isPending;
  const roomPair = parseRoomPair(String(collaborationRoomId || ""));
  const isIdentityResolutionPending =
    isSpaceLoading ||
    Boolean(isSpaceResolving) ||
    (!space && !resolvedSpaceId && Boolean(roomPair));

  const detailProProfile = useMemo(() => normalizeProfile(space?.proDetails), [space?.proDetails]);
  const detailCustomerProfile = useMemo(
    () => normalizeProfile(space?.customerDetails),
    [space?.customerDetails],
  );

  // IDs come from the resolved space first (including nested participant objects),
  // then room-pair fallback when available.
  const proId = String(
    pickString(
      space?.proId,
      (space as any)?.pro?.id,
      (space as any)?.professional?.id,
      roomPair?.proId,
    ),
  ).trim();
  const customerId = String(
    pickString(
      space?.customerId,
      (space as any)?.customer?.id,
      (space as any)?.client?.id,
      (space as any)?.enterprise?.id,
      roomPair?.customerId,
    ),
  ).trim();

  const proProfileLookupId = proId;
  const ownerProfileLookupId = customerId;
  const publicProProfile = useMemo(() => detailProProfile, [detailProProfile]);
  const customer = useMemo(() => detailCustomerProfile, [detailCustomerProfile]);
  const resolvedOwnerProfile = customer;

  const isFreelanceIdentityLoading = Boolean(proProfileLookupId) && Object.keys(publicProProfile).length === 0;

  const isOwnerIdentityLoading = Boolean(ownerProfileLookupId) && Object.keys(resolvedOwnerProfile).length === 0;

  const freelance = useMemo<CollaborationCardSummary>(() => {
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
      id: proProfileLookupId,
      nom: displayName,
      poste: headline || "Profil non renseigné",
      avatarUrl: pickString(pd.avatarUrl, resolveAvatar(p)) || buildAvatarFallback(displayName, proProfileLookupId || space?.proId),
      location: locationStr || "Localisation non renseignée",
      note: Number.isFinite(rating) ? rating : 0,
      avis: Number.isFinite(reviewCount) ? reviewCount : 0,
      projetsRealises: Number.isFinite(completedProjects) ? completedProjects : 0,
      tauxReponse: responseRate,
      delaiReponse: String(p.stats?.avgResponseTime ?? "< 2h").trim(),
      competences: normalizedSkills.length > 0 ? normalizedSkills : [],
      verified: isVerified,
      specialization: specialty,
      specialite: specialty,
      tarifHoraire: Number.isFinite(hourlyRate) ? hourlyRate : null,
      anciennete: String(p.stats?.durationOnPlatform ?? p.anciennete ?? "N/A").trim(),
      collaborationsEnCours: Number.isFinite(collaborationsEnCours) ? collaborationsEnCours : 0,
    };
  }, [space, proProfileLookupId, publicProProfile]);

  const porteur = useMemo<CollaborationCardSummary>(() => {
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
      id: ownerProfileLookupId || "owner",
      nom: displayName,
      avatarUrl: pickString(cd.avatarUrl, resolveAvatar(o)) || buildAvatarFallback(displayName, ownerProfileLookupId || space?.customerId),
      entreprise: pickString(companyName, "Client Jobty"),
    };
  }, [space, ownerProfileLookupId, resolvedOwnerProfile]);

  const sidebarIdentityLoading = (isPro ? isOwnerIdentityLoading : isFreelanceIdentityLoading) || isSpaceLoading;

  // Error states for Customer view (looking at a Professional)
  const proProfileLoadError = false;
  const hasProFallbackIdentity = Boolean(space?.proId || detailProProfile);
  const cannotIdentifyPro =
    isCustomer &&
    !proProfileLookupId &&
    !proId &&
    !hasProFallbackIdentity &&
    !isIdentityResolutionPending;

  // Error states for Pro view (looking at a Customer)
  const ownerProfileLoadError = false;
  const hasCustomerFallbackIdentity = Boolean(space?.customerId || detailCustomerProfile);
  const hasRenderableCustomerIdentity = Boolean(
    ownerProfileLookupId ||
    customerId ||
    space?.customerId ||
    pickString(
      resolvedOwnerProfile?.firstName,
      resolvedOwnerProfile?.lastName,
      resolvedOwnerProfile?.displayName,
      resolvedOwnerProfile?.companyName,
      resolvedOwnerProfile?.businessName,
      resolvedOwnerProfile?.nomEntreprise,
    ),
  );
  const cannotIdentifyCustomer =
    isPro &&
    !ownerProfileLookupId &&
    !customerId &&
    !hasCustomerFallbackIdentity &&
    !hasRenderableCustomerIdentity &&
    !isIdentityResolutionPending;

  const sidebarError = isCustomer
    ? (proProfileLoadError && !hasProFallbackIdentity) || cannotIdentifyPro
    : (ownerProfileLoadError && !hasCustomerFallbackIdentity && !hasRenderableCustomerIdentity) || cannotIdentifyCustomer;

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
  * profileError is kept false because the embedded detail payload is authoritative.
   */
  const profileError = false;

  const sidebarProfile = useMemo<SidebarProfile>(() => {
    if (isPro) {
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
        avatarUrl: porteur.avatarUrl,
        poste: pickString(o.specialization, o.sector, porteur.entreprise, "Client Jobty"),
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

    return {
      nom: freelance.nom,
      avatarUrl: freelance.avatarUrl,
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
    cannotIdentifyPro,
    sidebarError,
    sidebarErrorMessage,
    spaceQuery,
  };
};
