import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  FiSearch, FiChevronDown, FiMapPin, FiStar, FiCheckCircle,
  FiMenu, FiX, FiUser, FiFilter, FiChevronLeft, FiChevronRight, FiAlertCircle
} from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import Logo from '@/components/shared/Logo';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { useAuthStore } from '../../../../stores/auth.store';
import { resolveAvatarUrl } from '@/utils/avatar';
import { usePublicProfileSearch } from '../../hooks/usePublicProfileSearch';
import type { PublicSearchProfileItem } from '../../types/search';
import { resolveCurrentLocation } from '../../utils/location';
import { resolveSmartSearchInput } from '../../utils/searchRequestBuilder';
import professionSectorMap from '../../data/profession-sector-map.json';
import countryTownMap from '../../data/country-town-map.json';
import '../../styles/search/style.css';

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 12;

interface SectorMapEntry {
  sector: string;
  keywords: string[];
}

interface CountryTownEntry {
  country: string;
  towns: string[];
}

const normalizeText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const sortByLabel = (values: string[]): string[] =>
  [...values].sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));

const readNumberParam = (value: string | null, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const readBooleanParam = (value: string | null): boolean => value === 'true';

const readOptionalNumberParam = (value: string | null): number | undefined => {
  if (!value || !value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildFiltersFromParams = (params: URLSearchParams) => {
  const minExperienceYears = readNumberParam(params.get('minExperienceYears'), 0);
  const maxExperienceYears = readNumberParam(params.get('maxExperienceYears'), 0);
  const minYearsOfOperation = readNumberParam(params.get('minYearsOfOperation'), 0);
  const maxYearsOfOperation = readNumberParam(params.get('maxYearsOfOperation'), 0);

  return {
    search: params.get('q') || '',
    secteur: params.get('sector') || '',
    pays: params.get('country') || '',
    ville: params.get('city') || '',
    type: params.get('type') || '',
    minExperienceYears,
    maxExperienceYears: maxExperienceYears > 0 ? maxExperienceYears : minExperienceYears,
    minYearsOfOperation,
    maxYearsOfOperation: maxYearsOfOperation > 0 ? maxYearsOfOperation : minYearsOfOperation,
    minRating: readNumberParam(params.get('minRating'), 0),
    verifiedOnly: readBooleanParam(params.get('verifiedOnly')),
    premiumOnly: readBooleanParam(params.get('premiumOnly')),
    minProjects: readNumberParam(params.get('minProjects'), 0),
    maxHourlyRate: readNumberParam(params.get('maxHourlyRate'), 0),
    lat: readOptionalNumberParam(params.get('lat')),
    lng: readOptionalNumberParam(params.get('lng')),
    radiusKm: readOptionalNumberParam(params.get('radiusKm')),
    page: readNumberParam(params.get('page'), DEFAULT_PAGE),
    size: readNumberParam(params.get('size'), DEFAULT_SIZE),
  };
};

const buildQueryParams = (filters: {
  search: string;
  secteur: string;
  pays: string;
  ville: string;
  type: string;
  minExperienceYears: number;
  maxExperienceYears: number;
  minYearsOfOperation: number;
  maxYearsOfOperation: number;
  minRating: number;
  verifiedOnly: boolean;
  premiumOnly: boolean;
  minProjects: number;
  maxHourlyRate: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  page: number;
  size: number;
}) => {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set('q', filters.search.trim());
  if (filters.secteur.trim()) params.set('sector', filters.secteur.trim());
  if (filters.pays.trim()) params.set('country', filters.pays.trim());
  if (filters.ville.trim()) params.set('city', filters.ville.trim());
  if (filters.type.trim()) params.set('type', filters.type.trim());
  if (filters.minExperienceYears > 0) params.set('minExperienceYears', String(filters.minExperienceYears));
  if (filters.maxExperienceYears > 0) params.set('maxExperienceYears', String(filters.maxExperienceYears));
  if (filters.minYearsOfOperation > 0) params.set('minYearsOfOperation', String(filters.minYearsOfOperation));
  if (filters.maxYearsOfOperation > 0) params.set('maxYearsOfOperation', String(filters.maxYearsOfOperation));
  if (filters.minRating > 0) params.set('minRating', String(filters.minRating));
  if (filters.verifiedOnly) params.set('verifiedOnly', 'true');
  if (filters.premiumOnly) params.set('premiumOnly', 'true');
  if (filters.minProjects > 0) params.set('minProjects', String(filters.minProjects));
  if (filters.maxHourlyRate > 0) params.set('maxHourlyRate', String(filters.maxHourlyRate));
  if (typeof filters.lat === 'number') params.set('lat', String(filters.lat));
  if (typeof filters.lng === 'number') params.set('lng', String(filters.lng));
  if (typeof filters.radiusKm === 'number' && filters.radiusKm > 0) {
    params.set('radiusKm', String(filters.radiusKm));
  }
  params.set('page', String(filters.page));
  params.set('size', String(filters.size));
  return params;
};

const normalizeResult = (item: PublicSearchProfileItem) => {
  const normalizedType = String(item.type || '').toUpperCase();
  const isEnterprise = normalizedType === 'ENTERPRISE';
  const verified = item.isVerified ?? item.verified ?? false;
  const premium = item.isPremium ?? item.premium ?? false;

  const displayName =
    isEnterprise
      ? item.companyName || [item.firstName, item.lastName].filter(Boolean).join(' ').trim() || 'Entreprise'
      : [item.firstName, item.lastName].filter(Boolean).join(' ').trim() || item.companyName || 'Freelance';

  const type = isEnterprise ? 'entreprise' : 'freelance';
  const specialization = isEnterprise ? item.sector || 'Entreprise' : item.specialization || item.sector || 'Professionnel';
  const tags = [item.sector, item.specialization].filter(Boolean) as string[];

  return {
    id: item.userId,
    type,
    nom: displayName,
    specialite: specialization,
    ville: item.city || '',
    pays: item.country || '',
    photo: item.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.userId}`,
    tags,
    hourlyRate: item.hourlyRate,
    experienceYears: item.experienceYears,
    yearsOfOperation: item.yearsOfOperation,
    premium,
    projetsCollaboration: item.reviewCount || 0,
    note: item.averageRating || 0,
    verified,
  };
};

const normalizeDraftComparable = (filters: ReturnType<typeof buildFiltersFromParams>) => ({
  search: filters.search.trim(),
  secteur: filters.secteur.trim(),
  pays: filters.pays.trim(),
  ville: filters.ville.trim(),
  minExperienceYears: filters.minExperienceYears,
  maxExperienceYears: filters.maxExperienceYears,
  minYearsOfOperation: filters.minYearsOfOperation,
  maxYearsOfOperation: filters.maxYearsOfOperation,
  minRating: filters.minRating,
  verifiedOnly: filters.verifiedOnly,
  premiumOnly: filters.premiumOnly,
  minProjects: filters.minProjects,
  maxHourlyRate: filters.maxHourlyRate,
  lat: filters.lat,
  lng: filters.lng,
  radiusKm: filters.radiusKm,
});

function SearchResults() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authUser = useAuthStore((state) => state.user);
  const getDashboardRoute = useAuthStore((state) => state.getDashboardRoute);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [proximityEnabled, setProximityEnabled] = useState(
    () => Boolean(searchParams.get('lat') && searchParams.get('lng')),
  );
  const [geolocationLoading, setGeolocationLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(
    () =>
      Boolean(
        searchParams.get('minRating') ||
          searchParams.get('verifiedOnly') ||
          searchParams.get('premiumOnly') ||
          searchParams.get('minExperienceYears') ||
          searchParams.get('maxExperienceYears') ||
          searchParams.get('minYearsOfOperation') ||
          searchParams.get('maxYearsOfOperation') ||
          searchParams.get('minProjects') ||
          searchParams.get('maxHourlyRate') ||
          searchParams.get('lat') ||
          searchParams.get('lng') ||
          searchParams.get('radiusKm'),
      ),
  );
  const [locationResolved, setLocationResolved] = useState(
    () => Boolean(searchParams.get('country')?.trim() && searchParams.get('city')?.trim()),
  );
  const authShortcutLabel = isAuthenticated ? 'Dashboard' : 'Connexion';
  const authShortcutRoute = isAuthenticated ? getDashboardRoute() : '/connexion';
  const authAvatarUrl = resolveAvatarUrl(authUser);

  const goToAuthShortcut = () => {
    navigate(authShortcutRoute, {
      state: !isAuthenticated ? { from: '/search' } : undefined,
    });
  };

  const activeFilters = useMemo(() => buildFiltersFromParams(searchParams), [searchParams]);
  const [formFilters, setFormFilters] = useState(activeFilters);

  useEffect(() => {
    setFormFilters(activeFilters);
  }, [activeFilters]);

  useEffect(() => {
    setProximityEnabled(typeof formFilters.lat === 'number' && typeof formFilters.lng === 'number');
  }, [formFilters.lat, formFilters.lng]);

  const hasDraftChanges = useMemo(() => {
    return (
      JSON.stringify(normalizeDraftComparable(formFilters)) !==
      JSON.stringify(normalizeDraftComparable(activeFilters))
    );
  }, [formFilters, activeFilters]);

  const advancedCriteriaLabel = useMemo(() => {
    if (activeFilters.type === 'freelance') {
      return 'Freelances: specialisation, proximite, fourchette de tarif, annees d\'experience.';
    }
    if (activeFilters.type === 'entreprise') {
      return 'Entreprises: specialisation, proximite, fourchette de tarif, annees d\'exercice.';
    }
    return 'Tous: criteres freelances et entreprises (experience + exercice) selon le type.';
  }, [activeFilters.type]);

  const activeFilterChips = useMemo(
    () => [
      activeFilters.search ? { key: 'search' as const, label: `Recherche: ${activeFilters.search}` } : null,
      activeFilters.secteur ? { key: 'secteur' as const, label: `Secteur: ${activeFilters.secteur}` } : null,
      activeFilters.pays ? { key: 'pays' as const, label: `Pays: ${activeFilters.pays}` } : null,
      activeFilters.ville ? { key: 'ville' as const, label: `Ville: ${activeFilters.ville}` } : null,
      activeFilters.type
        ? {
            key: 'type' as const,
            label: `Type: ${activeFilters.type === 'freelance' ? 'Freelances' : 'Entreprises'}`,
          }
        : null,
      activeFilters.minRating > 0
        ? { key: 'minRating' as const, label: `Note min: ${activeFilters.minRating}` }
        : null,
      activeFilters.verifiedOnly ? { key: 'verifiedOnly' as const, label: 'Verifies uniquement' } : null,
      activeFilters.premiumOnly ? { key: 'premiumOnly' as const, label: 'Premium uniquement' } : null,
      activeFilters.minProjects > 0
        ? { key: 'minProjects' as const, label: `Projets min: ${activeFilters.minProjects}` }
        : null,
      activeFilters.maxHourlyRate > 0
        ? { key: 'maxHourlyRate' as const, label: `Tarif: ${activeFilters.maxHourlyRate}` }
        : null,
      typeof activeFilters.lat === 'number' && typeof activeFilters.lng === 'number'
        ? {
            key: 'lat' as const,
            label: `Proximite: ${activeFilters.radiusKm || 20} km`,
          }
        : null,
      (activeFilters.type === '' || activeFilters.type === 'freelance') &&
      (activeFilters.maxExperienceYears || activeFilters.minExperienceYears) > 0
        ? {
            key: 'maxExperienceYears' as const,
            label: `Experience: ${activeFilters.maxExperienceYears || activeFilters.minExperienceYears} ans`,
          }
        : null,
      (activeFilters.type === '' || activeFilters.type === 'entreprise') &&
      (activeFilters.maxYearsOfOperation || activeFilters.minYearsOfOperation) > 0
        ? {
            key: 'maxYearsOfOperation' as const,
            label: `Exercice: ${activeFilters.maxYearsOfOperation || activeFilters.minYearsOfOperation} ans`,
          }
        : null,
    ].filter(Boolean) as Array<{
      key:
        | 'search'
        | 'secteur'
        | 'pays'
        | 'ville'
        | 'type'
        | 'minRating'
        | 'verifiedOnly'
        | 'premiumOnly'
        | 'minProjects'
        | 'maxHourlyRate'
        | 'lat'
        | 'maxExperienceYears'
        | 'maxYearsOfOperation';
      label: string;
    }>,
    [activeFilters],
  );

  useEffect(() => {
    const hasLocationInParams = Boolean(activeFilters.pays.trim() || activeFilters.ville.trim());
    if (hasLocationInParams) return;

    let cancelled = false;

    const initLocation = async () => {
      const location = await resolveCurrentLocation(authUser || undefined);
      if (cancelled) return;

      if (location) {
        const params = buildQueryParams({
          search: activeFilters.search,
          secteur: activeFilters.secteur,
          pays: location.country,
          // Never auto-fill city; keep city user-driven only.
          ville: '',
          type: activeFilters.type,
          minExperienceYears: activeFilters.minExperienceYears,
          maxExperienceYears: activeFilters.maxExperienceYears,
          minYearsOfOperation: activeFilters.minYearsOfOperation,
          maxYearsOfOperation: activeFilters.maxYearsOfOperation,
          minRating: activeFilters.minRating,
          verifiedOnly: activeFilters.verifiedOnly,
          premiumOnly: activeFilters.premiumOnly,
          minProjects: activeFilters.minProjects,
          maxHourlyRate: activeFilters.maxHourlyRate,
          lat: activeFilters.lat,
          lng: activeFilters.lng,
          radiusKm: activeFilters.radiusKm,
          page: DEFAULT_PAGE,
          size: activeFilters.size,
        });
        setSearchParams(params, { replace: true });
      }

      setLocationResolved(true);
    };

    initLocation();

    return () => {
      cancelled = true;
    };
  }, [
    activeFilters.pays,
    activeFilters.ville,
    activeFilters.search,
    activeFilters.secteur,
    activeFilters.type,
    activeFilters.minExperienceYears,
    activeFilters.maxExperienceYears,
    activeFilters.minYearsOfOperation,
    activeFilters.maxYearsOfOperation,
    activeFilters.minRating,
    activeFilters.verifiedOnly,
    activeFilters.premiumOnly,
    activeFilters.minProjects,
    activeFilters.maxHourlyRate,
    activeFilters.lat,
    activeFilters.lng,
    activeFilters.radiusKm,
    activeFilters.size,
    authUser,
    setSearchParams,
  ]);

  const requestPayload = useMemo(() => {
    const { query, resolvedCity, resolvedSector } = resolveSmartSearchInput({
      search: activeFilters.search,
      city: activeFilters.ville,
      sector: activeFilters.secteur,
    });

    return {
      query: query || undefined,
      sector: resolvedSector || undefined,
      country: activeFilters.pays.trim() || undefined,
      city: resolvedCity || undefined,
      minExperienceYears:
        (activeFilters.type === '' || activeFilters.type === 'freelance') &&
        activeFilters.maxExperienceYears > 0
          ? activeFilters.minExperienceYears > 0
            ? activeFilters.minExperienceYears
            : 0
          : undefined,
      maxExperienceYears:
        (activeFilters.type === '' || activeFilters.type === 'freelance') &&
        activeFilters.maxExperienceYears > 0
          ? activeFilters.maxExperienceYears
          : undefined,
      minYearsOfOperation:
        (activeFilters.type === '' || activeFilters.type === 'entreprise') &&
        activeFilters.maxYearsOfOperation > 0
          ? activeFilters.minYearsOfOperation > 0
            ? activeFilters.minYearsOfOperation
            : 0
          : undefined,
      maxYearsOfOperation:
        (activeFilters.type === '' || activeFilters.type === 'entreprise') &&
        activeFilters.maxYearsOfOperation > 0
          ? activeFilters.maxYearsOfOperation
          : undefined,
      minRating: activeFilters.minRating > 0 ? activeFilters.minRating : undefined,
      verifiedOnly: activeFilters.verifiedOnly || undefined,
      premiumOnly: activeFilters.premiumOnly || undefined,
      minProjects: activeFilters.minProjects > 0 ? activeFilters.minProjects : undefined,
      maxHourlyRate: activeFilters.maxHourlyRate > 0 ? activeFilters.maxHourlyRate : undefined,
      lat: activeFilters.lat,
      lng: activeFilters.lng,
      radiusKm: activeFilters.radiusKm,
      page: activeFilters.page,
      size: activeFilters.size,
    };
  }, [
    activeFilters.search,
    activeFilters.secteur,
    activeFilters.pays,
    activeFilters.ville,
    activeFilters.type,
    activeFilters.minExperienceYears,
    activeFilters.maxExperienceYears,
    activeFilters.minYearsOfOperation,
    activeFilters.maxYearsOfOperation,
    activeFilters.minRating,
    activeFilters.verifiedOnly,
    activeFilters.premiumOnly,
    activeFilters.minProjects,
    activeFilters.maxHourlyRate,
    activeFilters.lat,
    activeFilters.lng,
    activeFilters.radiusKm,
    activeFilters.page,
    activeFilters.size,
  ]);

  const shouldWaitForLocation = !locationResolved && !activeFilters.pays && !activeFilters.ville;

  const {
    data: searchResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = usePublicProfileSearch(requestPayload, {
    enabled: !shouldWaitForLocation,
  });

  const pros = useMemo(() => searchResponse?.data?.pros?.content ?? [], [searchResponse]);
  const enterprises = useMemo(
    () => searchResponse?.data?.enterprises?.content ?? [],
    [searchResponse],
  );

  const secteurs = useMemo(
    () => [
      'Tous les secteurs',
      ...sortByLabel((professionSectorMap as SectorMapEntry[]).map((entry) => entry.sector)),
    ],
    [],
  );

  const countryTownEntries = useMemo(
    () =>
      sortByLabel((countryTownMap as CountryTownEntry[]).map((entry) => entry.country)).map((country) => {
        const sourceEntry = (countryTownMap as CountryTownEntry[]).find((entry) => entry.country === country);
        return {
          country,
          towns: sortByLabel(sourceEntry?.towns ?? []),
        };
      }),
    [],
  );

  const pays = useMemo(
    () => ['Tous les pays', ...countryTownEntries.map((entry) => entry.country)],
    [countryTownEntries],
  );

  const townsForSelectedCountry = useMemo(() => {
    const selected = formFilters.pays.trim();
    if (!selected) return [];

    const selectedNormalized = normalizeText(selected);
    const match = countryTownEntries.find(
      (entry) => normalizeText(entry.country) === selectedNormalized,
    );

    return match?.towns ?? [];
  }, [formFilters.pays, countryTownEntries]);

  const normalizedPros = useMemo(() => pros.map(normalizeResult), [pros]);
  const normalizedEnterprises = useMemo(() => enterprises.map(normalizeResult), [enterprises]);

  const filteredResults = useMemo(() => {
    const byType =
      activeFilters.type === 'freelance'
        ? normalizedPros
        : activeFilters.type === 'entreprise'
          ? normalizedEnterprises
          : [...normalizedPros, ...normalizedEnterprises];

    return byType.filter((item) => {
      if (activeFilters.minRating > 0 && item.note < activeFilters.minRating) return false;
      if (activeFilters.verifiedOnly && !item.verified) return false;
      if (activeFilters.premiumOnly && !item.premium) return false;
      if (activeFilters.minProjects > 0 && item.projetsCollaboration < activeFilters.minProjects) return false;

      if (activeFilters.maxHourlyRate > 0) {
        const rate = typeof item.hourlyRate === 'number' ? item.hourlyRate : null;
        if (rate !== null && rate > activeFilters.maxHourlyRate) return false;
      }

      return true;
    });
  }, [
    activeFilters.type,
    activeFilters.minRating,
    activeFilters.verifiedOnly,
    activeFilters.premiumOnly,
    activeFilters.minProjects,
    activeFilters.maxHourlyRate,
    normalizedPros,
    normalizedEnterprises,
  ]);

  const prosPageMeta = searchResponse?.data?.pros?.page;
  const enterprisesPageMeta = searchResponse?.data?.enterprises?.page;

  const totalResults =
    activeFilters.type === 'freelance'
      ? (prosPageMeta?.totalElements ?? 0)
      : activeFilters.type === 'entreprise'
        ? (enterprisesPageMeta?.totalElements ?? 0)
        : (prosPageMeta?.totalElements ?? 0) + (enterprisesPageMeta?.totalElements ?? 0);

  const totalPages =
    activeFilters.type === 'freelance'
      ? (prosPageMeta?.totalPages ?? 0)
      : activeFilters.type === 'entreprise'
        ? (enterprisesPageMeta?.totalPages ?? 0)
        : Math.max(prosPageMeta?.totalPages ?? 0, enterprisesPageMeta?.totalPages ?? 0);

  const currentPage = activeFilters.page;

  const handleProximityToggle = (enabled: boolean) => {
    setProximityEnabled(enabled);

    if (!enabled) {
      setFormFilters((prev) => ({
        ...prev,
        lat: undefined,
        lng: undefined,
        radiusKm: undefined,
      }));
      return;
    }

    if (!navigator.geolocation) {
      toast.error('Geolocalisation indisponible');
      setProximityEnabled(false);
      return;
    }

    setGeolocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setGeolocationLoading(false);
        setFormFilters((prev) => ({
          ...prev,
          lat: Math.round(coords.latitude * 100000) / 100000,
          lng: Math.round(coords.longitude * 100000) / 100000,
          radiusKm: prev.radiusKm && prev.radiusKm > 0 ? prev.radiusKm : 20,
        }));
      },
      (error) => {
        setGeolocationLoading(false);
        setProximityEnabled(false);
        const message =
          error.code === error.PERMISSION_DENIED
            ? 'Permission refusee pour la localisation.'
            : 'Impossible de recuperer votre position.';
        toast.error(message);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const search = formFilters.search.trim();
    const secteur = formFilters.secteur;
    const selectedPays = formFilters.pays.trim();
    const selectedVille = formFilters.ville.trim();

    const matchedCountry = countryTownEntries.find(
      (entry) => normalizeText(entry.country) === normalizeText(selectedPays),
    );

    const resolvedPays = matchedCountry?.country || selectedPays;
    const resolvedVille = (() => {
      if (!selectedVille) return '';
      if (!matchedCountry) return selectedVille;

      const matchedTown = matchedCountry.towns.find(
        (town) => normalizeText(town) === normalizeText(selectedVille),
      );

      return matchedTown || selectedVille;
    })();

    const params = buildQueryParams({
      search,
      secteur,
      pays: resolvedPays,
      ville: resolvedVille,
      type: activeFilters.type,
      minExperienceYears:
        (activeFilters.type === '' || activeFilters.type === 'freelance') && formFilters.maxExperienceYears > 0
          ? 0
          : 0,
      maxExperienceYears:
        activeFilters.type === '' || activeFilters.type === 'freelance'
          ? formFilters.maxExperienceYears
          : 0,
      minYearsOfOperation:
        (activeFilters.type === '' || activeFilters.type === 'entreprise') && formFilters.maxYearsOfOperation > 0
          ? 0
          : 0,
      maxYearsOfOperation:
        activeFilters.type === '' || activeFilters.type === 'entreprise'
          ? formFilters.maxYearsOfOperation
          : 0,
      minRating: formFilters.minRating,
      verifiedOnly: formFilters.verifiedOnly,
      premiumOnly: formFilters.premiumOnly,
      minProjects: formFilters.minProjects,
      maxHourlyRate: formFilters.maxHourlyRate,
      lat: formFilters.lat,
      lng: formFilters.lng,
      radiusKm: formFilters.radiusKm,
      page: DEFAULT_PAGE,
      size: activeFilters.size,
    });

    setSearchParams(params);
  };

  const clearAppliedFilter = (
    key:
      | 'search'
      | 'secteur'
      | 'pays'
      | 'ville'
      | 'type'
      | 'minRating'
      | 'verifiedOnly'
      | 'premiumOnly'
      | 'minProjects'
      | 'maxHourlyRate'
        | 'lat'
      | 'maxExperienceYears'
      | 'maxYearsOfOperation',
  ) => {
    if (key === 'maxExperienceYears') {
      const nextFilters = {
        ...activeFilters,
        minExperienceYears: 0,
        maxExperienceYears: 0,
        page: DEFAULT_PAGE,
      };
      setFormFilters(nextFilters);
      setSearchParams(buildQueryParams(nextFilters), { replace: true });
      return;
    }

    if (key === 'maxYearsOfOperation') {
      const nextFilters = {
        ...activeFilters,
        minYearsOfOperation: 0,
        maxYearsOfOperation: 0,
        page: DEFAULT_PAGE,
      };
      setFormFilters(nextFilters);
      setSearchParams(buildQueryParams(nextFilters), { replace: true });
      return;
    }

    if (key === 'lat') {
      const nextFilters = {
        ...activeFilters,
        lat: undefined,
        lng: undefined,
        radiusKm: undefined,
        page: DEFAULT_PAGE,
      };
      setProximityEnabled(false);
      setFormFilters(nextFilters);
      setSearchParams(buildQueryParams(nextFilters), { replace: true });
      return;
    }

    const nextFilters = {
      ...activeFilters,
      [key]:
        key === 'minRating' || key === 'minProjects' || key === 'maxHourlyRate'
          ? 0
          : key === 'verifiedOnly' || key === 'premiumOnly'
            ? false
            : '',
      page: DEFAULT_PAGE,
    };

    setFormFilters(nextFilters);
    setSearchParams(buildQueryParams(nextFilters), { replace: true });
  };

  const clearAllAppliedFilters = () => {
    const nextFilters = {
      ...activeFilters,
      search: '',
      secteur: '',
      pays: '',
      ville: '',
      type: '',
      minExperienceYears: 0,
      maxExperienceYears: 0,
      minYearsOfOperation: 0,
      maxYearsOfOperation: 0,
      minRating: 0,
      verifiedOnly: false,
      premiumOnly: false,
      minProjects: 0,
      maxHourlyRate: 0,
      lat: undefined,
      lng: undefined,
      radiusKm: undefined,
      page: DEFAULT_PAGE,
      size: DEFAULT_SIZE,
    };

    setProximityEnabled(false);
    setFormFilters(nextFilters);
    setSearchParams(buildQueryParams(nextFilters), { replace: true });
  };

  const handleQuickTypeChange = (type: string) => {
    const scopedYears =
      type === 'freelance'
        ? {
            minExperienceYears: activeFilters.minExperienceYears,
            maxExperienceYears: activeFilters.maxExperienceYears,
            minYearsOfOperation: 0,
            maxYearsOfOperation: 0,
          }
        : type === 'entreprise'
          ? {
              minExperienceYears: 0,
              maxExperienceYears: 0,
              minYearsOfOperation: activeFilters.minYearsOfOperation,
              maxYearsOfOperation: activeFilters.maxYearsOfOperation,
            }
          : {
              minExperienceYears: activeFilters.minExperienceYears,
              maxExperienceYears: activeFilters.maxExperienceYears,
              minYearsOfOperation: activeFilters.minYearsOfOperation,
              maxYearsOfOperation: activeFilters.maxYearsOfOperation,
            };

    const params = buildQueryParams({
      search: activeFilters.search,
      secteur: activeFilters.secteur,
      pays: activeFilters.pays,
      ville: activeFilters.ville,
      type,
      minExperienceYears: scopedYears.minExperienceYears,
      maxExperienceYears: scopedYears.maxExperienceYears,
      minYearsOfOperation: scopedYears.minYearsOfOperation,
      maxYearsOfOperation: scopedYears.maxYearsOfOperation,
      minRating: activeFilters.minRating,
      verifiedOnly: activeFilters.verifiedOnly,
      premiumOnly: activeFilters.premiumOnly,
      minProjects: activeFilters.minProjects,
      maxHourlyRate: activeFilters.maxHourlyRate,
      lat: activeFilters.lat,
      lng: activeFilters.lng,
      radiusKm: activeFilters.radiusKm,
      page: DEFAULT_PAGE,
      size: activeFilters.size,
    });
    setSearchParams(params);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 0 || nextPage >= totalPages) return;

    const params = buildQueryParams({
      search: activeFilters.search,
      secteur: activeFilters.secteur,
      pays: activeFilters.pays,
      ville: activeFilters.ville,
      type: activeFilters.type,
      minExperienceYears: activeFilters.minExperienceYears,
      maxExperienceYears: activeFilters.maxExperienceYears,
      minYearsOfOperation: activeFilters.minYearsOfOperation,
      maxYearsOfOperation: activeFilters.maxYearsOfOperation,
      minRating: activeFilters.minRating,
      verifiedOnly: activeFilters.verifiedOnly,
      premiumOnly: activeFilters.premiumOnly,
      minProjects: activeFilters.minProjects,
      maxHourlyRate: activeFilters.maxHourlyRate,
      lat: activeFilters.lat,
      lng: activeFilters.lng,
      radiusKm: activeFilters.radiusKm,
      page: nextPage,
      size: activeFilters.size,
    });
    setSearchParams(params);
  };

  const renderStars = (note) => {
    const stars = [];
    const safeNote = Number.isFinite(note) ? Math.max(0, Math.min(5, note)) : 0;
    const fullStars = Math.floor(safeNote);

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <FiStar 
            key={i} 
            style={{ fill: '#FFD700', color: '#FFD700', fontSize: '16px' }}
          />
        );
      } else {
        stars.push(
          <FiStar 
            key={i} 
            style={{ fill: 'none', color: '#E0E0E0', fontSize: '16px' }}
          />
        );
      }
    }
    return stars;
  };

  const pageButtons = useMemo(() => {
    if (totalPages <= 1) return [];

    const maxButtons = 5;
    const start = Math.max(0, currentPage - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages - 1, start + maxButtons - 1);
    const adjustedStart = Math.max(0, end - maxButtons + 1);

    const pages: number[] = [];
    for (let i = adjustedStart; i <= end; i += 1) {
      pages.push(i);
    }
    return pages;
  }, [totalPages, currentPage]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const SkeletonListItem = () => (
    <div className="search-result-item search-skeleton-card">
      <div className="search-card-badge search-skeleton search-skeleton-badge" />
      <div className="search-item-main-row">
        <div className="search-card-photo search-skeleton" />
        <div className="search-card-info">
          <div className="search-skeleton search-skeleton-line search-skeleton-name" />
          <div className="search-skeleton search-skeleton-line search-skeleton-sub" />
          <div className="search-skeleton search-skeleton-line search-skeleton-location" />
        </div>
        <div className="search-card-stats">
          <div className="search-skeleton search-skeleton-stat" />
          <div className="search-skeleton search-skeleton-stat" />
        </div>
        <div className="search-skeleton search-skeleton-btn" />
      </div>
      <div className="search-item-tags-row">
        <div className="search-skeleton search-skeleton-tag" />
        <div className="search-skeleton search-skeleton-tag" />
        <div className="search-skeleton search-skeleton-tag" />
      </div>
    </div>
  );

  const SkeletonGridCard = () => (
    <div className="search-result-card search-skeleton-card">
      <div className="search-card-header">
        <div className="search-card-photo search-skeleton" />
        <div className="search-card-info">
          <div className="search-skeleton search-skeleton-line search-skeleton-name" />
          <div className="search-skeleton search-skeleton-line search-skeleton-sub" />
          <div className="search-skeleton search-skeleton-line search-skeleton-location" />
        </div>
      </div>
      <div className="search-card-tags">
        <div className="search-skeleton search-skeleton-tag" />
        <div className="search-skeleton search-skeleton-tag" />
      </div>
      <div className="search-card-stats">
        <div className="search-skeleton search-skeleton-stat" />
        <div className="search-skeleton search-skeleton-stat" />
      </div>
      <div className="search-skeleton search-skeleton-btn search-skeleton-btn-mobile" />
    </div>
  );

  // Composant pour une carte (mobile)
  const ResultCard = ({ result }) => (
    <div className="search-result-card">
      <div className="search-card-badge">
        {result.type === 'freelance' ? 'Freelance' : 'Entreprise'}
      </div>

      <div className="search-card-header">
        <div className="search-card-photo">
          <img src={result.photo} alt={result.nom} />
        </div>
        <div className="search-card-info">
          <h3 className="search-card-name">
            {result.nom}
            {result.verified && (
              <FiCheckCircle className="search-verified-icon" />
            )}
          </h3>
          <p className="search-card-specialite">
            {result.specialite || result.secteur}
          </p>
          <div className="search-card-location">
            <FiMapPin />
            <span>{result.ville}, {result.pays}</span>
          </div>
        </div>
      </div>

      <div className="search-card-tags">
        {result.tags.map((tag, index) => (
          <span key={index} className="search-tag">{tag}</span>
        ))}
      </div>

      <div className="search-card-stats">
        <div className="search-card-projects">
          <span className="search-projects-number">{result.projetsCollaboration}</span>
          <span className="search-projects-label">projets de<br/>collaboration</span>
        </div>
        <div className="search-card-rating">
          <div className="search-stars">
            {renderStars(result.note)}
          </div>
          <span className="search-rating-number">{result.note}</span>
          <span className="search-rating-label">étoiles<br/>collectées</span>
        </div>
      </div>

      <button 
        className="search-card-btn"
        onClick={() => navigate(`/profiles/${result.id}`)}
      >
        Visiter profil
      </button>
    </div>
  );

 // Composant pour un élément de liste (desktop)
const ResultListItem = ({ result }) => (
  <div className="search-result-item">
    {/* Badge */}
    <div className="search-card-badge">
      {result.type === 'freelance' ? 'Freelance' : 'Entreprise'}
    </div>

    {/* Ligne principale : Photo + Infos + Stats + Bouton */}
    <div className="search-item-main-row">
      <div className="search-card-photo">
        <img src={result.photo} alt={result.nom} />
      </div>

      <div className="search-card-info">
        <h3 className="search-card-name">
          {result.nom}
          {result.verified && (
            <FiCheckCircle className="search-verified-icon" />
          )}
        </h3>
        <p className="search-card-specialite">
          {result.specialite || result.secteur}
        </p>
        <div className="search-card-location">
          <FiMapPin />
          <span>{result.ville}, {result.pays}</span>
        </div>
      </div>

      <div className="search-card-stats">
        <div className="search-card-projects">
          <span className="search-projects-number">{result.projetsCollaboration}</span>
          <span className="search-projects-label">projets de<br/>collaboration</span>
        </div>
        <div className="search-card-rating">
          <div className="search-stars">
            {renderStars(result.note)}
          </div>
          <span className="search-rating-number">{result.note}</span>
          <span className="search-rating-label">étoiles<br/>collectées</span>
        </div>
      </div>

      <button 
        className="search-card-btn"
        onClick={() => navigate(`/profiles/${result.id}`)}
      >
        Visiter profil
      </button>
    </div>

    {/* Tags EN DESSOUS - sur une nouvelle ligne */}
    <div className="search-item-tags-row">
      {result.tags.map((tag, index) => (
        <span key={index} className="search-tag">{tag}</span>
      ))}
    </div>
  </div>
);

  return (
    <div className="search-page">
      {/* HEADER */}
      <header className="search-header">
        <div className="search-header-content">
          <div className="search-logo" onClick={() => navigate('/')}>
            <Logo alt="Jobty" style={{width: '140px'}} />
          </div>

          <nav className="search-nav desktop-only">
            <a href="/decouverte" onClick={(e) => { e.preventDefault(); navigate('/decouverte'); }}>Découverte</a>
            <a href="/marketplace" onClick={(e) => { e.preventDefault(); navigate('/marketplace'); }}>Marketplace</a>
            <a href="/portfolio" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); }}>Portfolio</a>
            <a href="/localisation" onClick={(e) => { e.preventDefault(); navigate('/localisation'); }}>Localisation</a>
            <a href="/job-alerte" onClick={(e) => { e.preventDefault(); navigate('/job-alerte'); }}>Job alerte</a>
            <a href="/job-experience" onClick={(e) => { e.preventDefault(); navigate('/job-experience'); }}>Job expérience</a>
          </nav>

          <div className="search-header-actions">
            <div className="search-profile-icon" onClick={goToAuthShortcut}>
              {isAuthenticated ? (
                <img
                  src={authAvatarUrl}
                  alt="Profil"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <FiUser />
              )}
            </div>
            <button className="search-burger-btn" onClick={toggleMenu}>
              <FiMenu />
            </button>
          </div>
        </div>
      </header>

      {/* SIDEBAR MOBILE */}
      <div className={`search-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="search-sidebar-header">
          <Logo alt="Jobty" className="search-sidebar-logo" />
          <button className="search-close-btn" onClick={closeMenu}>
            <FiX />
          </button>
        </div>
        <nav className="search-sidebar-nav">
          <a href="/decouverte" onClick={(e) => { e.preventDefault(); navigate('/decouverte'); closeMenu(); }}>Découverte</a>
          <a href="/marketplace" onClick={(e) => { e.preventDefault(); navigate('/marketplace'); closeMenu(); }}>Marketplace</a>
          <a href="/portfolio" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); closeMenu(); }}>Portfolio</a>
          <a href="/localisation" onClick={(e) => { e.preventDefault(); navigate('/localisation'); closeMenu(); }}>Localisation</a>
          <a href="/job-alerte" onClick={(e) => { e.preventDefault(); navigate('/job-alerte'); closeMenu(); }}>Job alerte</a>
          <a href="/job-experience" onClick={(e) => { e.preventDefault(); navigate('/job-experience'); closeMenu(); }}>Job expérience</a>
          <button className="search-connexion-btn" onClick={() => { goToAuthShortcut(); closeMenu(); }}>{authShortcutLabel}</button>
        </nav>
      </div>

      {menuOpen && <div className="search-overlay" onClick={closeMenu}></div>}

      {/* MAIN CONTENT */}
      <main className="search-main">
        {/* BARRE DE RECHERCHE ET FILTRES */}
        <section className="search-filters-section">
          <form className="search-filters-bar" onSubmit={handleSearch}>
            <div className="search-filter-item search-input">
              <FiSearch className="search-icon" />
              <input
                type="text"
                name="search"
                placeholder="Recherche"
                value={formFilters.search}
                onChange={(e) => setFormFilters((prev) => ({ ...prev, search: e.target.value }))}
              />
            </div>

            <div className="search-filter-item">
              <select
                name="secteur"
                value={formFilters.secteur}
                onChange={(e) => setFormFilters((prev) => ({ ...prev, secteur: e.target.value }))}
              >
                {secteurs.map((secteur, index) => (
                  <option key={index} value={index === 0 ? '' : secteur}>{secteur}</option>
                ))}
              </select>
              <FiChevronDown className="search-select-arrow" />
            </div>

            <div className="search-filter-item">
              <select
                name="pays"
                value={formFilters.pays}
                onChange={(e) => setFormFilters((prev) => ({ ...prev, pays: e.target.value }))}
              >
                {pays.map((p, index) => (
                  <option key={index} value={index === 0 ? '' : p}>{p}</option>
                ))}
              </select>
              <FiChevronDown className="search-select-arrow" />
            </div>

            <div className="search-filter-item">
              <input
                type="text"
                name="ville"
                list="search-town-suggestions"
                placeholder={formFilters.pays ? 'Ville (choisir ou saisir)' : 'Ville'}
                value={formFilters.ville}
                onChange={(e) => setFormFilters((prev) => ({ ...prev, ville: e.target.value }))}
              />
              <datalist id="search-town-suggestions">
                {townsForSelectedCountry.map((town) => (
                  <option key={town} value={town} />
                ))}
              </datalist>
            </div>

            <button type="submit" className="search-filter-btn">
              <FiFilter /> Filtrer
            </button>

            <button
              type="button"
              className={`search-filter-btn search-filter-btn-secondary ${showAdvancedFilters ? 'active' : ''}`}
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
            >
              Critères avancés
            </button>
          </form>

          {showAdvancedFilters && (
            <div className="search-advanced-filters">
              <p className="search-advanced-note">{advancedCriteriaLabel}</p>
              <div className="search-advanced-layout">
                <div className="search-advanced-left">
                  <div className={`search-filter-item search-proximity-card ${proximityEnabled ? 'active' : ''}`}>
                    <div className="search-proximity-card-header">
                      <FiMapPin className="search-proximity-icon" />
                      <label className="search-proximity-label" htmlFor="search-proximity-checkbox">
                        <span>Proximite</span>
                      </label>
                      <label className="search-proximity-checkline" htmlFor="search-proximity-checkbox">
                        <input
                          id="search-proximity-checkbox"
                          type="checkbox"
                          className="search-proximity-checkbox"
                          checked={proximityEnabled}
                          onChange={(e) => handleProximityToggle(e.target.checked)}
                          disabled={geolocationLoading}
                        />
                        <span>Activer</span>
                      </label>
                    </div>

                    {proximityEnabled && typeof formFilters.lat === 'number' && typeof formFilters.lng === 'number' ? (
                      <>
                        <div className="search-proximity-status active">Localisation detectee</div>
                        <div className="search-proximity-coords">
                          Lat: {formFilters.lat.toFixed(5)} | Lng: {formFilters.lng.toFixed(5)}
                        </div>
                      </>
                    ) : (
                      <div className={`search-proximity-status ${geolocationLoading ? 'loading' : ''}`}>
                        {geolocationLoading ? 'Detection en cours...' : 'Utiliser ma position actuelle'}
                      </div>
                    )}

                    {proximityEnabled && (
                      <div className="search-filter-item">
                        <label htmlFor="radiusKm">Rayon (km)</label>
                        <input
                          id="radiusKm"
                          type="number"
                          name="radiusKm"
                          min={1}
                          value={formFilters.radiusKm || ''}
                          onChange={(e) =>
                            setFormFilters((prev) => ({
                              ...prev,
                              radiusKm: Number(e.target.value) || 20,
                            }))
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="search-advanced-right">
                  <div className="search-filter-item">
                    <label htmlFor="minRating">Note: {formFilters.minRating} ★</label>
                    <input
                      id="minRating"
                      type="range"
                      name="minRating"
                      min={0}
                      max={5}
                      step={0.5}
                      value={formFilters.minRating}
                      onChange={(e) =>
                        setFormFilters((prev) => ({ ...prev, minRating: Number(e.target.value) }))
                      }
                    />
                    <div className="search-slider-label">0 ★ — 5 ★</div>
                  </div>

                  <div className="search-filter-item">
                    <label htmlFor="minProjects">Projets minimum: {formFilters.minProjects}</label>
                    <input
                      id="minProjects"
                      type="range"
                      name="minProjects"
                      min={0}
                      max={100}
                      step={5}
                      value={formFilters.minProjects}
                      onChange={(e) =>
                        setFormFilters((prev) => ({ ...prev, minProjects: Number(e.target.value) }))
                      }
                    />
                    <div className="search-slider-label">0 — 100</div>
                  </div>

                  <div className="search-filter-item">
                    <label htmlFor="maxHourlyRate">Tarif horaire max (FCFA)</label>
                    <input
                      id="maxHourlyRate"
                      type="number"
                      name="maxHourlyRate"
                      min={0}
                      max={500000}
                      placeholder="0"
                      value={formFilters.maxHourlyRate || ''}
                      onChange={(e) =>
                        setFormFilters((prev) => ({ ...prev, maxHourlyRate: Number(e.target.value) || 0 }))
                      }
                    />
                  </div>

                  {(activeFilters.type === '' || activeFilters.type === 'freelance') && (
                    <div className="search-filter-item">
                      <label htmlFor="maxExperienceYears">Experience: {formFilters.maxExperienceYears || formFilters.minExperienceYears} ans</label>
                      <input
                        id="maxExperienceYears"
                        type="range"
                        name="maxExperienceYears"
                        min={0}
                        max={50}
                        step={1}
                        value={formFilters.maxExperienceYears || formFilters.minExperienceYears}
                        onChange={(e) =>
                          setFormFilters((prev) => ({
                            ...prev,
                            minExperienceYears: 0,
                            maxExperienceYears: Number(e.target.value),
                          }))
                        }
                      />
                      <div className="search-slider-label">0 — 50 ans</div>
                    </div>
                  )}

                  {(activeFilters.type === '' || activeFilters.type === 'entreprise') && (
                    <div className="search-filter-item">
                      <label htmlFor="maxYearsOfOperation">Exercice: {formFilters.maxYearsOfOperation || formFilters.minYearsOfOperation} ans</label>
                      <input
                        id="maxYearsOfOperation"
                        type="range"
                        name="maxYearsOfOperation"
                        min={0}
                        max={50}
                        step={1}
                        value={formFilters.maxYearsOfOperation || formFilters.minYearsOfOperation}
                        onChange={(e) =>
                          setFormFilters((prev) => ({
                            ...prev,
                            minYearsOfOperation: 0,
                            maxYearsOfOperation: Number(e.target.value),
                          }))
                        }
                      />
                      <div className="search-slider-label">0 — 50 ans</div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {activeFilterChips.length > 0 && (
            <div className="search-filter-chips">
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className="search-chip"
                  onClick={() => clearAppliedFilter(chip.key)}
                >
                  {chip.label} <span>x</span>
                </button>
              ))}

              <button type="button" className="search-chip-clear" onClick={clearAllAppliedFilters}>
                Tout effacer
              </button>
            </div>
          )}

          {/* Filtres rapides */}
          <div className="search-quick-filters">
            <button 
              type="button"
              className={`search-quick-filter ${activeFilters.type === '' ? 'active' : ''}`}
              onClick={() => handleQuickTypeChange('')}
            >
              Tous
            </button>
            <button 
              type="button"
              className={`search-quick-filter ${activeFilters.type === 'freelance' ? 'active' : ''}`}
              onClick={() => handleQuickTypeChange('freelance')}
            >
              Pros
            </button>
            <button 
              type="button"
              className={`search-quick-filter ${activeFilters.type === 'entreprise' ? 'active' : ''}`}
              onClick={() => handleQuickTypeChange('entreprise')}
            >
              Entreprises
            </button>
          </div>
        </section>

        {/* RÉSULTATS */}
        <section className="search-results-section">
          <h2 className="search-results-title">
            {totalResults} résultat{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
          </h2>

          {(isLoading || (isFetching && !searchResponse) || shouldWaitForLocation) && (
            <div className="search-state-wrapper">
              <p>Chargement des résultats...</p>
              <div className="search-results-list">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonListItem key={`desktop-skeleton-${index}`} />
                ))}
              </div>
              <div className="search-results-grid">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonGridCard key={`mobile-skeleton-${index}`} />
                ))}
              </div>
            </div>
          )}

          {isError && (
            <div className="search-state-wrapper">
              <ErrorState
                icon={<FiAlertCircle size={36} />}
                title="Impossible de charger les résultats"
                description="Une erreur est survenue pendant la recherche. Veuillez réessayer."
                action={{
                  label: 'Réessayer',
                  onClick: () => refetch(),
                }}
              />
            </div>
          )}

          {!isError && !isLoading && !isFetching && filteredResults.length === 0 && (
            <div className="search-state-wrapper">
              <EmptyState
                icon={<FiSearch size={36} />}
                title="Aucun résultat"
                description="Aucun profil ne correspond à vos filtres. Essayez d'élargir votre recherche."
              />
            </div>
          )}

          {!isError && !isLoading && !isFetching && filteredResults.length > 0 && (
            <>
              {/* Version DESKTOP (liste) */}
              <div className="search-results-list">
                {filteredResults.map((result) => (
                  <ResultListItem key={result.id} result={result} />
                ))}
              </div>

              {/* Version MOBILE (cartes) */}
              <div className="search-results-grid">
                {filteredResults.map((result) => (
                  <ResultCard key={result.id} result={result} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="search-pagination">
                  <button
                    type="button"
                    className="search-pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 0}
                  >
                    <FiChevronLeft />
                  </button>

                  {pageButtons.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={`search-pagination-btn ${page === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page + 1}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="search-pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="search-footer">
        <div className="search-footer-content">
          <div className="search-footer-column">
            <h4>Navigation</h4>
            <ul>
              <li><a href="/decouverte" onClick={(e) => { e.preventDefault(); navigate('/decouverte'); }}>Découverte</a></li>
              <li><a href="/marketplace" onClick={(e) => { e.preventDefault(); navigate('/marketplace'); }}>Marketplace</a></li>
              <li><a href="/portfolio" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); }}>Portfolio</a></li>
              <li><a href="/localisation" onClick={(e) => { e.preventDefault(); navigate('/localisation'); }}>Localisation</a></li>
              <li><a href="/job-alerte" onClick={(e) => { e.preventDefault(); navigate('/job-alerte'); }}>Job alerte</a></li>
            </ul>
          </div>
          <div className="search-footer-column">
            <h4>À propos</h4>
            <ul>
              <li><a href="/comment-ca-marche" onClick={(e) => { e.preventDefault(); navigate('/comment-ca-marche'); }}>Comment ça marche</a></li>
              <li><a href="/devenir-jobeur" onClick={(e) => { e.preventDefault(); navigate('/devenir-jobeur'); }}>Devenir Jobeur</a></li>
              <li><a href="/nous-joindre" onClick={(e) => { e.preventDefault(); navigate('/nous-joindre'); }}>Nous Joindre</a></li>
            </ul>
          </div>
          <div className="search-footer-column">
            <h4>Légal</h4>
            <ul>
              <li><a href="/blog" onClick={(e) => { e.preventDefault(); navigate('/blog'); }}>Blog</a></li>
              <li><a href="/conditions" onClick={(e) => { e.preventDefault(); navigate('/conditions'); }}>Conditions</a></li>
              <li><a href="/confidentialite" onClick={(e) => { e.preventDefault(); navigate('/confidentialite'); }}>Confidentialité</a></li>
            </ul>
          </div>
        </div>
        <div className="search-footer-divider"></div>
        <div className="search-footer-bottom">
          <div className="search-footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
          </div>
          <p>copyright jobty | 2025 |</p>
        </div>
      </footer>
    </div>
  );
}

export default SearchResults;
