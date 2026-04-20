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
};

export const useCollaborationProfiles = ({
  isPro,
  isCustomer,
  currentUserId,
  incomingId,
  backendSpace,
  authUser,
}: UseCollaborationProfilesParams) => {
  const proProfileLookupId = useMemo(() => {
    if (isPro && currentUserId && isUuidLike(currentUserId)) {
      return currentUserId;
    }

    const backendProId = String(backendSpace?.proId || "").trim();
    if (backendProId && isUuidLike(backendProId)) {
      return backendProId;
    }

    if (
      isCustomer &&
      incomingId &&
      isUuidLike(incomingId) &&
      incomingId !== currentUserId
    ) {
      return incomingId;
    }

    const matchedPair = incomingId.match(/^room:(.+)::(.+)$/);
    const pairProId = String(matchedPair?.[2] || "").trim();
    if (pairProId && isUuidLike(pairProId)) {
      return pairProId;
    }

    return "";
  }, [backendSpace?.proId, currentUserId, incomingId, isCustomer, isPro]);

  const publicProProfileQuery = usePublicProfile(
    proProfileLookupId || undefined,
  );
  const publicProProfile = useMemo(
    () => getProfilePayload(publicProProfileQuery.data?.data),
    [publicProProfileQuery.data?.data],
  );

  const ownerProfileLookupId = useMemo(() => {
    const backendCustomerId = String(backendSpace?.customerId || "").trim();
    if (backendCustomerId && isUuidLike(backendCustomerId)) {
      return backendCustomerId;
    }

    if (
      isPro &&
      incomingId &&
      isUuidLike(incomingId) &&
      incomingId !== currentUserId
    ) {
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
    queryFn: () =>
      collaborationApi.getCustomerProfileDetails(ownerProfileLookupId),
    enabled: isPro && Boolean(ownerProfileLookupId),
    staleTime: 5 * 60 * 1000,
  });

  const customer = useMemo(
    () => getProfilePayload(customerOwnerProfileQuery.data),
    [customerOwnerProfileQuery.data],
  );

  const resolvedOwnerProfile = isPro
    ? customer
    : publicOwnerProfile;

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
        : (publicProProfile?.reviewCount ?? 0),
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
      liveProPayload?.liveProPayload?.competences,
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
      new Set(
        [
          ...skillsFromPayload,
          ...skillsFromAltArrays,
          ...skillsFromDelimitedFields,
          ...skillsFromServices,
          specialtySkill,
          sectorSkill,
        ].filter(Boolean),
      ),
    ).slice(0, 4);

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
      (liveProPayload as any)?.isVerified ??
      (liveProPayload as any)?.verified ??
      false,
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
      note: Number.isFinite(rating) ? rating : 0,
      avis: Number.isFinite(reviewCount) ? reviewCount : 0,
      projetsRealises: Number.isFinite(completedProjects)
        ? completedProjects
        : 0,
      tauxReponse: responseRate,
      delaiReponse: responseDelay || "pas definir",
      competences:
        normalizedSkills.length > 0 ? normalizedSkills : ["Profil en cours"],
      verified: isVerified,
      specialite: specialty,
      tarifHoraire: Number.isFinite(hourlyRate) ? hourlyRate : null,
      anciennete: anciennete || "N/A",
      collaborationsEnCours: Number.isFinite(collaborationsEnCours)
        ? collaborationsEnCours
        : 0,
    };
  }, [backendSpace?.proName, proProfileLookupId, publicProProfile]);

  const porteur = useMemo<PersonSummary>(() => {
    const fullName = [
      resolvedOwnerProfile?.firstName,
      resolvedOwnerProfile?.lastName,
    ]
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
      [authUser?.firstName, authUser?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
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

  const sidebarIdentityLoading = isPro
    ? isOwnerIdentityLoading
    : isFreelanceIdentityLoading;

  const sidebarProfile = useMemo<SidebarProfile>(() => {
    if (!isPro) {
      const ownerStats = (resolvedOwnerProfile?.stats || {}) as Record<
        string,
        any
      >;
      const ownerLocation =
        (typeof resolvedOwnerProfile?.location === "object" &&
        resolvedOwnerProfile?.location
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
        poste: String(
          resolvedOwnerProfile?.headline ||
            porteur.entreprise ||
            "Client Jobty",
        ),
        location: ownerLocation,
        specialite: String(
          resolvedOwnerProfile?.sector || resolvedOwnerProfile?.specialty || "",
        ),
        tarifHoraire: null,
        note: Number(
          ownerStats?.averageRating ?? resolvedOwnerProfile?.averageRating ?? 0,
        ),
        avis: Number(resolvedOwnerProfile?.reviewCount ?? 0),
        projetsRealises: Number(ownerStats?.completedProjects ?? 0),
        collaborationsEnCours: Number(ownerStats?.ongoingProjects ?? 0),
        competences: ownerSkills.length > 0 ? ownerSkills : ["Profil client"],
        verified: Boolean(
          resolvedOwnerProfile?.isVerified ??
          resolvedOwnerProfile?.verified ??
          false,
        ),
      };
    }

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
  };
};
