
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  FiSearch, 
  FiMapPin, 
  FiDollarSign, 
  FiCheck,
  FiChevronDown,
  FiMenu,
  FiX,
  FiStar,
  FiClock,
  FiBriefcase,
  FiCalendar,
  FiGrid,
  FiUser,
  FiUsers,
  FiAward,
  FiAlertCircle
} from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { COLORS } from '../../../styles/colors';
import Logo from '@/components/shared/Logo';
import type { ProEnterpriseCard } from '../api/marketplaceTypes';
import { useMarketplaceSearch } from '../hooks/useMarketplaceSearch';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import ResultsTabs from '../components/ResultsTabs';
import SearchInsights from '../components/SearchInsights';
import { useDebouncedValue } from '../utils/debounce';
import {
  buildFiltersFromParams,
  buildQueryParams,
  toSearchRequest,
  validateMarketplaceFilters,
} from '../utils/params';
import { EmptyState, ErrorState } from '@/components/ui';
import { parseApiError, getErrorDescription } from '@/utils/errorHandler';
import { resolveAvatarUrl } from '@/utils/avatar';
import { useAuthStore } from '@/stores/auth.store';
import { resolveCurrentLocation } from '@/features/discovery/utils/location';
import { resolveSmartSearchInput } from '@/features/discovery/utils/searchRequestBuilder';
import professionSectorMap from '@/features/discovery/data/profession-sector-map.json';
import './Marketplace.css';

// Utility function for draft comparison
const normalizeDraftComparable = (filters: any) => ({
  search: filters.search.trim(),
  secteur: filters.secteur.trim(),
  pays: filters.pays.trim(),
  ville: filters.ville.trim(),
  specialization: filters.specialization.trim(),
  type: filters.type.trim(),
  minRating: filters.minRating,
  maxRate: filters.maxRate,
  maxExperienceYears: filters.maxExperienceYears,
  maxYearsOfOperation: filters.maxYearsOfOperation,
  lat: filters.lat,
  lng: filters.lng,
  radiusKm: filters.radiusKm,
});

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 12;
const NUMBER_FILTER_KEYS = new Set([
  'minRating',
  'maxRate',
  'maxExperienceYears',
  'maxYearsOfOperation',
  'lat',
  'lng',
  'radiusKm',
]);

type MarketplaceCard = {
  id: string;
  username: string;
  nom: string;
  profession: string;
  photo: string;
  ville: string;
  pays: string;
  tarifMin: number;
  devise: string;
  verifie: boolean;
  note: number;
  projectsCompletes: number;
  actionLabel: string;
  relevanceScore?: number;
  secteur?: string;
  isPremium: boolean;
  availabilityLabel: string;
  availabilityClassName: 'disponible' | 'indisponible';
};

const resolveAvailability = (
  profile: ProEnterpriseCard,
): Pick<MarketplaceCard, 'availabilityLabel' | 'availabilityClassName'> => {
  const statusText =
    typeof profile.availabilityStatus === 'string'
      ? profile.availabilityStatus.trim().toUpperCase()
      : '';

  const booleanAvailability =
    profile.isAvailable ?? profile.available ?? profile.disponible;

  if (statusText.includes('AVAILABLE') || statusText.includes('DISPONIBLE') || booleanAvailability === true) {
    return {
      availabilityLabel: 'Disponible',
      availabilityClassName: 'disponible',
    };
  }

  if (
    statusText.includes('BUSY') ||
    statusText.includes('OCCUP') ||
    statusText.includes('UNAVAILABLE') ||
    statusText.includes('INDISPONIBLE') ||
    booleanAvailability === false
  ) {
    return {
      availabilityLabel: 'Indisponible',
      availabilityClassName: 'indisponible',
    };
  }

  return {
    availabilityLabel: 'Disponibilite non renseignee',
    availabilityClassName: 'indisponible',
  };
};

const mapSearchCard = (profile: ProEnterpriseCard): MarketplaceCard => {
  const legacyVerified = (profile as ProEnterpriseCard & { verified?: boolean }).verified;
  const legacyPremium = (profile as ProEnterpriseCard & { premium?: boolean }).premium;
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
  const name = profile.companyName || fullName || 'Profil';
  const normalizedType = String(profile.type || '').toUpperCase();
  const availability = resolveAvailability(profile);

  return {
    id: profile.userId,
    username: profile.userId,
    nom: name,
    profession: profile.specialization || profile.sector || 'Professionnel',
    photo: profile.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.userId}`,
    ville: profile.city || '',
    pays: profile.country || '',
    tarifMin: Math.ceil(profile.hourlyRate || 0),
    devise: 'FCFA/H',
    verifie: profile.isVerified ?? Boolean(legacyVerified),
    note: profile.averageRating || 0,
    projectsCompletes: profile.reviewCount || 0,
    actionLabel: normalizedType === 'ENTERPRISE' ? 'Visiter' : 'Contacter',
    relevanceScore: profile.relevanceScore,
    secteur: profile.sector || undefined,
    isPremium: profile.isPremium ?? Boolean(legacyPremium),
    availabilityLabel: availability.availabilityLabel,
    availabilityClassName: availability.availabilityClassName,
  };
};

export const Marketplace = () =>{
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authUser = useAuthStore((state) => state.user);
  const getDashboardRoute = useAuthStore((state) => state.getDashboardRoute);
  const [searchParams, setSearchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const authShortcutLabel = isAuthenticated ? 'Dashboard' : 'Connexion';
  const authShortcutRoute = isAuthenticated ? getDashboardRoute() : '/connexion';
  const authAvatarUrl = resolveAvatarUrl(authUser);

  const goToAuthShortcut = () => {
    navigate(authShortcutRoute, {
      state: !isAuthenticated ? { from: '/marketplace' } : undefined,
    });
  };
  
  const filters = useMemo(
    () => buildFiltersFromParams(searchParams, { page: DEFAULT_PAGE, size: DEFAULT_SIZE }),
    [searchParams],
  );
  const [locationResolved, setLocationResolved] = useState(
    () => Boolean(searchParams.get('country')?.trim() && searchParams.get('city')?.trim()),
  );
  const [formFilters, setFormFilters] = useState(filters);

  useEffect(() => {
    setFormFilters(filters);
  }, [filters]);

  const hasDraftChanges = useMemo(() => {
    const normalizedForm = normalizeDraftComparable(formFilters);
    const normalizedActive = normalizeDraftComparable(filters);
    return JSON.stringify(normalizedForm) !== JSON.stringify(normalizedActive);
  }, [formFilters, filters]);

  useEffect(() => {
    const hasLocationInParams = Boolean(filters.pays.trim() || filters.ville.trim());
    if (hasLocationInParams) {
      setLocationResolved(true);
      return;
    }

    let cancelled = false;

    const initLocation = async () => {
      const location = await resolveCurrentLocation(authUser || undefined);
      if (cancelled) return;

      if (location) {
        const params = buildQueryParams({
          ...filters,
          pays: location.country,
          ville: '',
          page: DEFAULT_PAGE,
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
    authUser,
    filters,
    setSearchParams,
  ]);

  const [activeTab, setActiveTab] = useState<'pros' | 'enterprises'>('pros');
  const isFreelanceOnly = filters.type === 'freelance';
  const isEnterpriseOnly = filters.type === 'entreprise';

  // Update activeTab based on type filter
  useEffect(() => {
    if (isFreelanceOnly) {
      setActiveTab('pros');
    } else if (isEnterpriseOnly) {
      setActiveTab('enterprises');
    }
  }, [isFreelanceOnly, isEnterpriseOnly]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [proximityEnabled, setProximityEnabled] = useState(
    () => Boolean(searchParams.get('lat') && searchParams.get('lng')),
  );
  const [geolocationLoading, setGeolocationLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(
    () =>
      Boolean(
        searchParams.get('specialization') ||
          searchParams.get('minRating') ||
          searchParams.get('maxRate') ||
          searchParams.get('maxExperienceYears') ||
          searchParams.get('maxYearsOfOperation') ||
          searchParams.get('lat') ||
          searchParams.get('lng') ||
          searchParams.get('radiusKm'),
      ),
  );
  const debouncedSuggestionQuery = useDebouncedValue(formFilters.search, 300);
  const validationError = useMemo(() => validateMarketplaceFilters(filters), [filters]);
  const searchRequest = useMemo(() => {
    const { query, resolvedCity, resolvedSector } = resolveSmartSearchInput({
      search: filters.search,
      city: filters.ville,
      sector: filters.secteur,
    });

    return toSearchRequest({
      ...filters,
      search: query || filters.search,
      ville: resolvedCity,
      secteur: resolvedSector,
    });
  }, [filters]);

  const shouldWaitForLocation = !locationResolved && !filters.pays && !filters.ville;

  const {
    data: marketplaceData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useMarketplaceSearch(searchRequest, !shouldWaitForLocation);

  const { data: suggestionsData } = useSearchSuggestions(debouncedSuggestionQuery);

  const updateFilters = useCallback(
    (
      partialFilters: Partial<typeof filters>,
      options: { resetPage?: boolean; replace?: boolean } = {},
    ) => {
      const { resetPage = true, replace = true } = options;
      const nextFilters = {
        ...filters,
        ...partialFilters,
        page: resetPage ? DEFAULT_PAGE : filters.page,
      };

      setSearchParams(buildQueryParams(nextFilters), { replace });
    },
    [filters, setSearchParams],
  );

  // Parse error information
  const parsedError = useMemo(() => {
    if (!error) return null;
    return parseApiError(error);
  }, [error]);

  useEffect(() => {
    if (validationError) {
      toast.error('Filtres invalides', {
        description: validationError,
        duration: 3500,
      });
    }
  }, [validationError]);

  // Handle errors with toast notifications
  useEffect(() => {
    if (error && parsedError) {
      toast.error(parsedError.title, {
        description: parsedError.message + (parsedError.status ? ` (Code: ${parsedError.status})` : ''),
        duration: 5000,
        action: {
          label: 'Réessayer',
          onClick: () => {
            refetch();
          },
        },
      });
      
      console.error('[MARKETPLACE] Error fetching profiles:', {
        parsed: parsedError,
        original: error,
      });
    }
  }, [error, parsedError, refetch]);

  const pros = useMemo(
    () => {
      const rawPros = (marketplaceData?.pros?.content || []).map(mapSearchCard);
      return filters.type === 'entreprise' ? [] : rawPros;
    },
    [marketplaceData, filters.type],
  );
  const enterprises = useMemo(
    () => {
      const rawEnterprises = (marketplaceData?.enterprises?.content || []).map(mapSearchCard);
      return filters.type === 'freelance' ? [] : rawEnterprises;
    },
    [marketplaceData, filters.type],
  );

  const activeCards = activeTab === 'pros' ? pros : enterprises;
  const isProsTab = activeTab === 'pros';
  const advancedCriteriaLabel = (isFreelanceOnly || (!isEnterpriseOnly && isProsTab))
    ? 'Freelances: specialisation, proximite, fourchette de tarif, annees d\'experience.'
    : 'Entreprises: specialisation, proximite, fourchette de tarif, annees d\'exercice.';
  const totalResults = isFreelanceOnly
    ? (marketplaceData?.pros?.page?.totalElements || 0)
    : isEnterpriseOnly
    ? (marketplaceData?.enterprises?.page?.totalElements || 0)
    : (marketplaceData?.pros?.page?.totalElements || 0) + (marketplaceData?.enterprises?.page?.totalElements || 0);
  const activePageResult = activeTab === 'pros' ? marketplaceData?.pros : marketplaceData?.enterprises;
  const hasMoreActiveResults = (activePageResult?.page?.totalElements || 0) > activeCards.length;

  const activeFilterChips = useMemo(
    () => [
      filters.secteur ? { key: 'secteur' as const, label: `Secteur: ${filters.secteur}` } : null,
      filters.specialization
        ? { key: 'specialization' as const, label: `Specialisation: ${filters.specialization}` }
        : null,
      filters.type ? { key: 'type' as const, label: `Type: ${filters.type === 'freelance' ? 'Freelances' : 'Entreprises'}` } : null,
      filters.minRating !== undefined
        ? { key: 'minRating' as const, label: `Note: ${filters.minRating}` }
        : null,
      (filters.maxRate) !== undefined
        ? { key: 'maxRate' as const, label: `Tarif: ${filters.maxRate}` }
        : null,
      isProsTab && (filters.maxExperienceYears) !== undefined
        ? {
            key: 'maxExperienceYears' as const,
            label: `Experience: ${filters.maxExperienceYears} ans`,
          }
        : null,
      !isProsTab && (filters.maxYearsOfOperation) !== undefined
        ? {
            key: 'maxYearsOfOperation' as const,
            label: `Exercice: ${filters.maxYearsOfOperation} ans`,
          }
        : null,
      filters.lat !== undefined ? { key: 'lat' as const, label: `Lat: ${filters.lat}` } : null,
      filters.lng !== undefined ? { key: 'lng' as const, label: `Lng: ${filters.lng}` } : null,
      filters.radiusKm !== undefined
        ? { key: 'radiusKm' as const, label: `Rayon: ${filters.radiusKm} km` }
        : null,
      filters.pays ? { key: 'pays' as const, label: `Pays: ${filters.pays}` } : null,
      filters.ville ? { key: 'ville' as const, label: `Ville: ${filters.ville}` } : null,
      filters.search ? { key: 'search' as const, label: `Recherche: ${filters.search}` } : null,
    ].filter(Boolean) as Array<{
      key:
        | 'secteur'
        | 'specialization'
        | 'minRating'
        | 'maxRate'
        | 'maxExperienceYears'
        | 'maxYearsOfOperation'
        | 'lat'
        | 'lng'
        | 'radiusKm'
        | 'pays'
        | 'ville'
        | 'search';
      label: string;
    }>,
    [filters, isProsTab],
  );

  const suggestions = useMemo(
    () => ({
      sectors: suggestionsData?.sectors || [],
      specializations: suggestionsData?.specializations || [],
      keywordAliases: suggestionsData?.keywordAliases || [],
    }),
    [suggestionsData],
  );

  // Données mockées - Job Experience
  const jobExperiences = [
    {
      id: 1,
      nom: 'Jean-Pierre Kamga',
      poste: 'Administrateur Réseau',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JeanPierre',
      entreprise: 'CNPS',
      ville: 'Douala',
      pays: 'Cameroun',
      salaire: 800,
      devise: '$/mois',
      duree: '3 mois',
      note: 4
    },
    {
      id: 2,
      nom: 'Mariama Diop',
      poste: 'Assistante RH',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mariama',
      entreprise: 'Orange Sénégal',
      ville: 'Dakar',
      pays: 'Sénégal',
      salaire: 600,
      devise: '$/mois',
      duree: '6 mois',
      note: 5
    },
    {
      id: 3,
      nom: 'Kwame Asante',
      poste: 'Développeur Junior',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kwame',
      entreprise: 'MTN Ghana',
      ville: 'Accra',
      pays: 'Ghana',
      salaire: 950,
      devise: '$/mois',
      duree: '12 mois',
      note: 4
    }
  ];

  // Listes pour les filtres
  const secteurs = useMemo(
    () => [
      'Tous les secteurs',
      ...professionSectorMap
        .map((entry) => entry.sector)
        .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }))
    ],
    [],
  );

  const paysListe = [
    'Tous les pays',
    'Sénégal',
    'Côte d\'Ivoire',
    'Mali',
    'Cameroun',
    'Ghana',
    'Guinée',
    'Burkina Faso',
    'Nigeria'
  ];

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const normalizedValue = (() => {
      if (NUMBER_FILTER_KEYS.has(name)) {
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        const asNumber = Number(trimmed);
        return Number.isFinite(asNumber) ? asNumber : undefined;
      }
      return value;
    })();

    setFormFilters((prev) => ({
      ...prev,
      [name]: normalizedValue,
    }));

    if (name === 'search') {
      setShowSuggestions(String(normalizedValue || '').trim().length >= 2);
    }
  };

  const applySuggestion = (value: string, type: 'sector' | 'specialization' | 'alias') => {
    const nextFilters: Partial<typeof formFilters> = {
      search: value,
    };

    if (type === 'sector') {
      nextFilters.secteur = value;
    }

    if (type === 'specialization') {
      nextFilters.specialization = value;
    }

    setFormFilters((prev) => ({ ...prev, ...nextFilters }));
    setShowSuggestions(false);
  };

  const clearFilter = (key: keyof typeof filters) => {
    if (key === 'maxRate') {
      updateFilters({ minRate: undefined, maxRate: undefined }, { resetPage: true, replace: true });
      return;
    }

    if (key === 'maxExperienceYears') {
      updateFilters(
        { maxExperienceYears: undefined },
        { resetPage: true, replace: true },
      );
      return;
    }

    if (key === 'maxYearsOfOperation') {
      updateFilters(
        { minYearsOfOperation: undefined, maxYearsOfOperation: undefined },
        { resetPage: true, replace: true },
      );
      return;
    }

    const resetValue = key === 'size' ? DEFAULT_SIZE : NUMBER_FILTER_KEYS.has(String(key)) ? undefined : '';

    updateFilters({ [key]: resetValue } as Partial<typeof filters>, {
      resetPage: true,
      replace: true,
    });
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      ...filters,
      search: '',
      secteur: '',
      pays: '',
      ville: '',
      specialization: '',
      type: '',
      minRating: undefined,
      minRate: undefined,
      maxRate: undefined,
      maxExperienceYears: undefined,
      minYearsOfOperation: undefined,
      maxYearsOfOperation: undefined,
      lat: undefined,
      lng: undefined,
      radiusKm: undefined,
      page: DEFAULT_PAGE,
      size: DEFAULT_SIZE,
    };

    setFormFilters(clearedFilters);
    setSearchParams(
      buildQueryParams(clearedFilters),
      { replace: true },
    );
    setShowSuggestions(false);
    setProximityEnabled(false);
  };

  const handleProximityToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setProximityEnabled(isChecked);

    if (!isChecked) {
      // Clear location when unchecked
      setFormFilters((prev) => ({
        ...prev,
        lat: undefined,
        lng: undefined,
        radiusKm: undefined,
      }));
      return;
    }

    // Request user's geolocation
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non disponible', {
        description: 'Votre navigateur ne supporte pas la géolocalisation.',
        duration: 3500,
      });
      setProximityEnabled(false);
      return;
    }

    setGeolocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormFilters((prev) => ({
          ...prev,
          lat: Math.round(latitude * 100000) / 100000, // Round to 5 decimal places
          lng: Math.round(longitude * 100000) / 100000,
          radiusKm: prev.radiusKm && prev.radiusKm > 0 ? prev.radiusKm : 20,
        }));
        setGeolocationLoading(false);
        toast.success('Localisation détectée', {
          description: `Latitude: ${latitude.toFixed(2)}, Longitude: ${longitude.toFixed(2)}`,
          duration: 3000,
        });
      },
      (error) => {
        setGeolocationLoading(false);
        setProximityEnabled(false);
        let errorMessage = 'Impossible de détecter votre localisation.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Permission de géolocalisation refusée.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Position indisponible.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Délai d\'attente dépassé.';
        }
        toast.error('Erreur de géolocalisation', {
          description: errorMessage,
          duration: 3500,
        });
      },
    );
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedMaxRate = formFilters.maxRate;

    const scopedYears = isProsTab
      ? {
          minExperienceYears: formFilters.maxExperienceYears,
          maxExperienceYears: formFilters.maxExperienceYears,
          minYearsOfOperation: undefined,
          maxYearsOfOperation: undefined,
        }
      : {
          minExperienceYears: undefined,
          maxExperienceYears: undefined,
          minYearsOfOperation: formFilters.maxYearsOfOperation,
          maxYearsOfOperation: formFilters.maxYearsOfOperation,
        };

    updateFilters(
      {
        ...formFilters,
        search: formFilters.search.trim(),
        minRate: normalizedMaxRate,
        maxRate: normalizedMaxRate,
        ...scopedYears,
      },
      { resetPage: true, replace: false },
    );
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Rendu des étoiles
  const renderStars = (note, filled = true) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar 
          key={i} 
          className={`star ${i <= note ? 'filled' : ''}`}
          style={{ 
            fill: i <= note ? (filled ? '#FFD700' : COLORS.primary) : 'none',
            color: i <= note ? (filled ? '#FFD700' : COLORS.primary) : '#ddd'
          }}
        />
      );
    }
    return stars;
  };

  return (
    <div className="marketplace-container">
      
      {/* HEADER / NAVIGATION */}
      <header className="marketplace-header">
        <div className="header-content">
          <div 
            className="header-logo"
            onClick={() => navigate('/')}
          >
            <Logo alt="Jobty" />
          </div>

          {/* Navigation Desktop */}
          <nav className="header-nav desktop-nav">
            <a 
              href="/decouverte" 
              className="nav-item"
              onClick={(e) => { e.preventDefault(); navigate('/decouverte'); }}
            >
              Découverte
            </a>
            <a 
              href="/marketplace" 
              className="nav-item active"
              onClick={(e) => { e.preventDefault(); navigate('/marketplace'); }}
            >
              Marketplace
            </a>
            <a 
              href="/portfolio" 
              className="nav-item"
              onClick={(e) => { e.preventDefault(); navigate('/portfolio'); }}
            >
              Portfolio
            </a>
            <a 
              href="/localisation" 
              className="nav-item"
              onClick={(e) => { e.preventDefault(); navigate('/localisation'); }}
            >
              Localisation
            </a>
            <a 
              href="/job-alerte" 
              className="nav-item"
              onClick={(e) => { e.preventDefault(); navigate('/job-alerte'); }}
            >
              Job alerte
            </a>

           <a 
              href="/job-experience" 
              className="nav-item"
              onClick={(e) => { e.preventDefault(); navigate('/job-experience'); }}
            >
              Job expérience
            </a>
          
          </nav>

          <div className="header-actions">
            <div 
              className="profile-icon"
              onClick={goToAuthShortcut}
            >
              {isAuthenticated ? (
                <img
                  src={authAvatarUrl}
                  alt="Profil"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <FiUser />
              )}
              <span className="notification-badge">0</span>
            </div>

            {/* Bouton burger mobile */}
            <button 
              className="burger-btn"
              onClick={toggleMenu}
              aria-label="Menu"
            >
              <FiMenu />
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile */}
      <div className={`sidebar-menu ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Logo alt="Jobty" className="sidebar-logo" />
          <button 
            className="close-btn"
            onClick={closeMenu}
            aria-label="Fermer"
          >
            <FiX />
          </button>
        </div>
        <nav className="sidebar-nav">
          <a href="/decouverte" onClick={(e) => { e.preventDefault(); navigate('/decouverte'); closeMenu(); }}>
            Découverte
          </a>
          <a href="/marketplace" className="active" onClick={(e) => { e.preventDefault(); navigate('/marketplace'); closeMenu(); }}>
            Marketplace
          </a>
          <a href="/portfolio" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); closeMenu(); }}>
            Portfolio
          </a>
          <a href="/localisation" onClick={(e) => { e.preventDefault(); navigate('/localisation'); closeMenu(); }}>
            Localisation
          </a>
          <a href="/job-alerte" onClick={(e) => { e.preventDefault(); navigate('/job-alerte'); closeMenu(); }}>
            Job alerte
          </a>

          <a href="/job-experience" onClick={(e) => { e.preventDefault(); navigate('/job-experience'); closeMenu(); }}>
            Job experience
          </a>
          <button 
            className="sidebar-connexion-btn"
            onClick={() => { goToAuthShortcut(); closeMenu(); }}
          >
            {authShortcutLabel}
          </button>
        </nav>
      </div>

      {/* Overlay */}
      {menuOpen && <div className="sidebar-overlay" onClick={closeMenu}></div>}

      {/* SECTION HERO */}
      <section className="hero-section">
        <h1 className="hero-title">
          Trouvez des professionnels<br />
          <span className="highlight">qualifiés</span> adaptés à votre projet
        </h1>
        <p className="hero-subtitle">
          Découvrez et contactez les meilleurs freelances et entreprises de services
        </p>
      </section>

      {/* BARRE DE FILTRES */}
      <section className="filters-section">
        <form className="filters-bar" onSubmit={handleSearch}>
          <div className="filter-item search-input marketplace-search-wrapper">
            <FiSearch className="filter-icon" />
            <input
              type="text"
              name="search"
              placeholder="Recherchez par mot clé..."
              value={formFilters.search}
              onChange={handleFilterChange}
              onFocus={() => setShowSuggestions(formFilters.search.trim().length >= 2)}
              onBlur={() => {
                window.setTimeout(() => setShowSuggestions(false), 160);
              }}
            />

            {showSuggestions && (suggestions.sectors.length > 0 || suggestions.specializations.length > 0 || suggestions.keywordAliases.length > 0) && (
              <div className="marketplace-suggestions" role="listbox" aria-label="Suggestions de recherche">
                {suggestions.sectors.slice(0, 4).map((sector) => (
                  <button
                    key={`sector-${sector}`}
                    type="button"
                    className="marketplace-suggestion-item"
                    onMouseDown={() => applySuggestion(sector, 'sector')}
                  >
                    Secteur: {sector}
                  </button>
                ))}

                {suggestions.specializations.slice(0, 4).map((specialization) => (
                  <button
                    key={`specialization-${specialization}`}
                    type="button"
                    className="marketplace-suggestion-item"
                    onMouseDown={() => applySuggestion(specialization, 'specialization')}
                  >
                    Specialisation: {specialization}
                  </button>
                ))}

                {suggestions.keywordAliases.slice(0, 3).map((alias) => (
                  <button
                    key={`alias-${alias}`}
                    type="button"
                    className="marketplace-suggestion-item"
                    onMouseDown={() => applySuggestion(alias, 'alias')}
                  >
                    Suggestion: {alias}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="filter-item">
            <select
              name="secteur"
              value={formFilters.secteur}
              onChange={handleFilterChange}
            >
              {secteurs.map((secteur, index) => (
                <option key={index} value={index === 0 ? '' : secteur}>
                  {secteur}
                </option>
              ))}
            </select>
            <FiChevronDown className="select-arrow" />
          </div>

          <div className="filter-item">
            <select
              name="pays"
              value={formFilters.pays}
              onChange={handleFilterChange}
            >
              {paysListe.map((pays, index) => (
                <option key={index} value={index === 0 ? '' : pays}>
                  {pays}
                </option>
              ))}
            </select>
            <FiChevronDown className="select-arrow" />
          </div>

          <div className="filter-item">
            <input
              type="text"
              name="ville"
              placeholder="Toutes les villes"
              value={formFilters.ville}
              onChange={handleFilterChange}
            />
          </div>

          <button 
            type="submit" 
            className="filter-btn"
            style={{ backgroundColor: COLORS.primary }}
          >
            Filtrer
          </button>

          <button
            type="button"
            className={`filter-btn filter-btn-secondary ${showAdvancedFilters ? 'active' : ''}`}
            onClick={() => setShowAdvancedFilters((prev) => !prev)}
          >
            Criteres avances
          </button>
        </form>

        {showAdvancedFilters && (
          <div className="marketplace-advanced-filters">
            <p className="marketplace-advanced-note">{advancedCriteriaLabel}</p>
            <div className="marketplace-advanced-layout">
              <div className="marketplace-advanced-left">
                <div className={`marketplace-advanced-group marketplace-proximity-card ${proximityEnabled ? 'active' : ''}`}>
                  <div className="marketplace-proximity-card-header">
                    <FiMapPin className="marketplace-proximity-icon" />
                    <label className="marketplace-proximity-label" htmlFor="marketplace-proximity-checkbox">
                      <span>Proximite</span>
                    </label>
                    <label className="marketplace-proximity-checkline" htmlFor="marketplace-proximity-checkbox">
                      <input
                        id="marketplace-proximity-checkbox"
                        type="checkbox"
                        className="marketplace-proximity-checkbox"
                        checked={proximityEnabled}
                        onChange={handleProximityToggle}
                        disabled={geolocationLoading}
                      />
                      <span>Activer</span>
                    </label>
                  </div>

                  {proximityEnabled && (formFilters.lat !== undefined && formFilters.lng !== undefined) ? (
                    <>
                      <div className="marketplace-proximity-status active">Localisation detectee</div>
                      <div className="marketplace-proximity-coords">
                        Lat: {formFilters.lat.toFixed(5)} | Lng: {formFilters.lng.toFixed(5)}
                      </div>
                    </>
                  ) : (
                    <div className={`marketplace-proximity-status ${geolocationLoading ? 'loading' : ''}`}>
                      {geolocationLoading ? 'Detection en cours...' : 'Utiliser ma position actuelle'}
                    </div>
                  )}

                  {proximityEnabled && (
                    <div className="marketplace-advanced-group marketplace-proximity-radius">
                      <label htmlFor="radiusKm">Rayon (km)</label>
                      <input
                        id="radiusKm"
                        type="number"
                        name="radiusKm"
                        min={1}
                        value={formFilters.radiusKm ?? ''}
                        onChange={handleFilterChange}
                        placeholder="Ex: 20"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="marketplace-advanced-right">
                <div className="marketplace-advanced-group">
                  <label htmlFor="specialization">Specialisation</label>
                  <input
                    id="specialization"
                    type="text"
                    name="specialization"
                    value={formFilters.specialization}
                    onChange={handleFilterChange}
                    placeholder="Ex: React, plomberie..."
                  />
                </div>

                <div className="marketplace-advanced-group">
                  <label htmlFor="type">Type de profil</label>
                  <select
                    id="type"
                    name="type"
                    value={formFilters.type}
                    onChange={handleFilterChange}
                  >
                    <option value="">Tous les types</option>
                    <option value="freelance">Freelances uniquement</option>
                    <option value="entreprise">Entreprises uniquement</option>
                  </select>
                </div>

                <div className="marketplace-advanced-group" style={{ display: 'none' }}>
                  <label htmlFor="minRating">Note: {formFilters.minRating ?? 0}</label>
                  <input
                    id="minRating"
                    type="range"
                    name="minRating"
                    min={0}
                    max={5}
                    step={0.5}
                    value={formFilters.minRating ?? 0}
                    onChange={(e) =>
                      setFormFilters((prev) => ({
                        ...prev,
                        minRating: Number(e.target.value),
                      }))
                    }
                  />
                  <div className="marketplace-slider-label">0 — 5 </div>
                </div>

                <div className="marketplace-advanced-group">
                  <label htmlFor="maxRate">Tarif max (FCFA)</label>
                  <input
                    id="maxRate"
                    type="number"
                    name="maxRate"
                    min={0}
                    max={500000}
                    placeholder="0"
                    value={formFilters.maxRate ?? formFilters.minRate ?? ''}
                    onChange={(e) => {
                      const rawValue = e.target.value.trim();
                      const parsedValue = rawValue === '' ? undefined : Number(rawValue);
                      const safeValue =
                        parsedValue !== undefined && Number.isFinite(parsedValue) && parsedValue > 0
                          ? parsedValue
                          : undefined;

                      setFormFilters((prev) => ({
                        ...prev,
                        maxRate: safeValue,
                      }));
                    }}
                  />
                </div>

                {isProsTab ? (
                  <div className="marketplace-advanced-group">
                    <label htmlFor="maxExperienceYears">Experience: {formFilters.maxExperienceYears ?? formFilters.maxExperienceYears ?? 0} ans</label>
                    <input
                      id="maxExperienceYears"
                      type="range"
                      name="maxExperienceYears"
                      min={0}
                      max={50}
                      step={1}
                      value={formFilters.maxExperienceYears ?? formFilters.maxExperienceYears ?? 0}
                      onChange={(e) =>
                        setFormFilters((prev) => ({
                          ...prev,
                          maxExperienceYears: Number(e.target.value),
                        }))
                      }
                    />
                    <div className="marketplace-slider-label">0 — 50 ans</div>
                  </div>
                ) : (
                  <div className="marketplace-advanced-group">
                    <label htmlFor="maxYearsOfOperation">Exercice: {formFilters.maxYearsOfOperation ?? formFilters.maxYearsOfOperation ?? 0} ans</label>
                    <input
                      id="maxYearsOfOperation"
                      type="range"
                      name="maxYearsOfOperation"
                      min={0}
                      max={50}
                      step={1}
                      value={formFilters.maxYearsOfOperation ?? formFilters.maxYearsOfOperation ?? 0}
                      onChange={(e) =>
                        setFormFilters((prev) => ({
                          ...prev,
                          maxYearsOfOperation: Number(e.target.value),
                        }))
                      }
                    />
                    <div className="marketplace-slider-label">0 — 50 ans</div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {activeFilterChips.length > 0 && (
          <div className="marketplace-filter-chips">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className="marketplace-chip"
                onClick={() => clearFilter(chip.key)}
              >
                {chip.label} <span>×</span>
              </button>
            ))}

            <button type="button" className="marketplace-chip-clear" onClick={clearAllFilters}>
              Tout effacer
            </button>
          </div>
        )}

        {!isFreelanceOnly && !isEnterpriseOnly && (
          <ResultsTabs
            activeTab={activeTab}
            prosCount={marketplaceData?.pros?.page?.totalElements || 0}
            enterprisesCount={marketplaceData?.enterprises?.page?.totalElements || 0}
            onTabChange={setActiveTab}
          />
        )}

        <p className="results-count">
          <strong>{isLoading ? 'Chargement...' : totalResults}</strong> resultats trouves
          {isFetching && !isLoading ? ' (mise a jour...)' : ''}
        </p>

        {validationError && (
          <p className="marketplace-validation-error">{validationError}</p>
        )}
      </section>

      {/* SECTION RESULTATS */}
      <section className={activeTab === 'pros' ? 'freelance-section' : 'entreprise-section'}>
        <div className="section-header">
          <h2 className="section-title">
            {activeTab === 'pros' ? <FiUser className="section-icon" /> : <FiBriefcase className="section-icon" />}
            {activeTab === 'pros' ? 'Freelance' : 'Entreprise'}
          </h2>
          <span className="section-count">
            {isLoading ? 'Chargement...' : `${activePageResult?.page?.totalElements || 0} Profils`}
          </span>
        </div>

        {isLoading ? (
          <div className="freelance-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="freelance-card skeleton">
                <div className="card-header" style={{ backgroundColor: COLORS.secondary }}>
                  <div className="skeleton-avatar" />
                </div>
                <div className="card-body">
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                  <div className="skeleton-line" />
                </div>
              </div>
            ))}
          </div>
        ) : activeCards.length === 0 && !error && !validationError ? (
          <EmptyState
            icon={<FiUsers size={48} />}
            title="Aucun resultat trouve"
            description="Essayez de modifier vos critères de recherche ou explorez d'autres catégories."
            action={{
              label: 'Réinitialiser les filtres',
              onClick: clearAllFilters,
            }}
          />
        ) : error || validationError ? (
          <ErrorState
            icon={<FiAlertCircle size={48} />}
            title={validationError ? 'Filtres invalides' : parsedError?.title || 'Impossible de charger les profils'}
            description={
              validationError ||
              parsedError?.message ||
              getErrorDescription(parsedError?.status) ||
              'Une erreur est survenue. Veuillez réessayer.'
            }
            status={parsedError?.status}
            technicalDetails={
              parsedError?.details?.length
                ? parsedError.details.join('\n')
                : validationError || JSON.stringify(error, null, 2)
            }
            action={{
              label: 'Réessayer',
              onClick: () => {
                refetch();
              },
            }}
          />
        ) : activeTab === 'pros' ? (
          <div className="freelance-grid">
            {pros.map((freelance) => {
              return (
              <div key={freelance.id} className="freelance-card">
                <div className="card-header" style={{ backgroundColor: COLORS.secondary }}>
                  <span className="badge freelance-badge">Freelance</span>
                  {freelance.isPremium && <span className="badge pro-badge">PREMIUM</span>}
                  <div className="profile-photo-wrapper">
                    <img 
                      src={freelance.photo} 
                      alt={freelance.nom}
                      className="profile-photo"
                    />
                    {freelance.verifie && (
                      <span className="verified-badge">
                        <FiCheck />
                      </span>
                    )}
                  </div>
                </div>

                <div className="card-body">
                  <h3 className="card-name">{freelance.nom}</h3>
                  <p className="card-profession" style={{ color: COLORS.primary }}>
                    {freelance.profession}
                  </p>

                  <div className="card-info">
                    <div className="info-item">
                      <FiMapPin style={{ color: COLORS.secondary }} />
                      <span>{[freelance.ville, freelance.pays].filter(Boolean).join(', ') || 'Non renseigne'}</span>
                    </div>
                    <div className="info-item">
                      <FiDollarSign style={{ color: COLORS.secondary }} />
                      <span>À partir de : {Math.ceil(freelance.tarifMin).toLocaleString()} {freelance.devise}</span>
                    </div>
                    {/* <div className="info-item">
                      <FiStar style={{ color: '#FFB800' }} />
                      <span>{freelance.note?.toFixed(1) || '0'}</span>
                    </div> */}
                    <div className="info-item">
                      <FiClock style={{ color: COLORS.primary }} />
                      <span className={freelance.availabilityClassName}>{freelance.availabilityLabel}</span>
                    </div>
                  </div>

                  <button 
                    className="contact-btn"
                    onClick={() => {
                      const identifier =
                        freelance.username && String(freelance.username).trim()
                          ? String(freelance.username).trim()
                          : String(freelance.id);

                      navigate(`/profiles/${encodeURIComponent(identifier)}`, {
                        state: {
                          userId: String(freelance.id),
                          username: freelance.username || null,
                        },
                      });
                    }}
                  >
                    {freelance.actionLabel || 'Contacter'}
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="entreprise-grid">
            {enterprises.map((entreprise) => {
              return (
              <div key={entreprise.id} className="entreprise-card">
                <div className="entreprise-image">
                  <img src={entreprise.photo} alt={entreprise.nom} />
                  <span className="badge entreprise-badge" style={{ backgroundColor: COLORS.primary }}>
                    Entreprise
                  </span>
                  {entreprise.isPremium && (
                    <span className="badge pro-badge" style={{ backgroundColor: COLORS.secondary }}>
                      PREMIUM
                    </span>
                  )}
                </div>

                <div className="entreprise-body">
                  <div className="entreprise-photo-wrapper">
                    <img 
                      src={entreprise.photo} 
                      alt={entreprise.nom}
                      className="entreprise-photo"
                    />
                  </div>

                  <h3 className="entreprise-name">{entreprise.nom}</h3>
                  <p className="entreprise-type">{entreprise.profession}</p>

                  <div className="entreprise-secteurs">
                    <FiGrid style={{ color: COLORS.secondary }} />
                    <span>{entreprise.secteur || 'Secteur non renseigne'}</span>
                  </div>

                  <div className="entreprise-secteurs">
                    <FiMapPin style={{ color: COLORS.secondary }} />
                    <span>{[entreprise.ville, entreprise.pays].filter(Boolean).join(', ') || 'Localisation non renseignee'}</span>
                  </div>

                  <div className="entreprise-rating">
                    {renderStars(Math.floor(entreprise.note), false)}
                  </div>

                  <div className="entreprise-secteurs">
                    <FiClock style={{ color: COLORS.primary }} />
                    <span className={entreprise.availabilityClassName}>{entreprise.availabilityLabel}</span>
                  </div>

                  <button 
                    className="visiter-btn"
                    onClick={() => navigate(`/profiles/${encodeURIComponent(entreprise.id)}`)}
                    style={{ borderColor: COLORS.secondary, color: COLORS.secondary }}
                  >
                    VISITER
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {!isLoading && hasMoreActiveResults && (
          <button 
            className="voir-plus-btn" 
            style={{
              borderColor: activeTab === 'pros' ? COLORS.primary : COLORS.secondary,
              color: activeTab === 'pros' ? COLORS.primary : COLORS.secondary,
            }}
            onClick={() =>
              updateFilters(
                { size: (filters.size || DEFAULT_SIZE) + 8 },
                { resetPage: false, replace: false },
              )
            }
          >
            Voir plus de resultats
          </button>
        )}
      </section>

      {/* SECTION JOB EXPERIENCE */}

      <section className="job-experience-section">
        <div className="section-header light">
          <h2 className="section-title">
            <FiAward className="section-icon" />
            Job expérience
          </h2>
          <span className="section-count">{jobExperiences.length * 17} Profils</span>
        </div>

        <div className="job-experience-grid">
          {jobExperiences.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-card-left">
                <img 
                  src={job.photo} 
                  alt={job.nom}
                  className="job-photo"
                />
                <h3 className="job-name">{job.nom}</h3>
                <p className="job-poste" style={{ color: COLORS.primary }}>{job.poste}</p>
                <div className="job-stars">
                  {renderStars(job.note, true)}
                </div>
              </div>

              <div className="job-card-right">
                <span className="badge experience-badge" style={{ backgroundColor: COLORS.secondary }}>
                  Expérience pro
                </span>

                <div className="job-details">
                  <div className="job-detail-item">
                    <FiBriefcase style={{ color: COLORS.secondary }} />
                    <span>{job.poste}</span>
                  </div>
                  <div className="job-detail-item">
                    <FiMapPin style={{ color: COLORS.secondary }} />
                    <span>{job.ville}, {job.pays} / {job.entreprise}</span>
                  </div>
                  <div className="job-detail-item">
                    <FiDollarSign style={{ color: COLORS.secondary }} />
                    <span>Salaire : {job.salaire}{job.devise}</span>
                  </div>
                  <div className="job-detail-item">
                    <FiCalendar style={{ color: COLORS.secondary }} />
                    <span>{job.duree}</span>
                  </div>
                </div>

                <button 
                  className="voir-plus-job-btn"
                  onClick={() => navigate(`/profil/experience/${job.id}`)}
                >
                  VOIR LE +
                </button>
              </div>
            </div>
          ))}
        </div>

        <button 
  className="voir-plus-btn light" 
  style={{ borderColor: 'white', color: 'white' }}
  onClick={() => navigate('/job-experience')}
>
  Voir plus de profils
</button>
      </section>

      {/* FOOTER */}
<footer className="marketplace-footer">
  
  <div className="footer-content">
    
    {/* Colonne 1 - Navigation */}
    <div className="footer-column">
      <h4 className="footer-column-title">Navigation</h4>
      <ul className="footer-links">
        <li>
          <a href="/decouverte" onClick={(e) => { e.preventDefault(); navigate('/decouverte'); }}>
            Découvrir
          </a>
        </li>
        <li>
          <a href="/marketplace" onClick={(e) => { e.preventDefault(); navigate('/marketplace'); }}>
            Marketplace
          </a>
        </li>
        <li>
          <a href="/portfolio" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); }}>
            Portfolio
          </a>
        </li>
        <li>
          <a href="/localisation" onClick={(e) => { e.preventDefault(); navigate('/localisation'); }}>
            Localisation
          </a>
        </li>
        <li>
          <a href="/job-alerte" onClick={(e) => { e.preventDefault(); navigate('/job-alerte'); }}>
            Job alerte
          </a>
        </li>
        <li>
                <a href="/job-experience" onClick={(e) => { e.preventDefault(); navigate('/job-experience'); }}>
                  Job expérience
                </a>
              </li>
      </ul>
    </div>

    {/* Colonne 2 - À propos */}
    <div className="footer-column">
      <h4 className="footer-column-title">À propos</h4>
      <ul className="footer-links">
        <li>
          <a href="/comment-ca-marche" onClick={(e) => { e.preventDefault(); navigate('/comment-ca-marche'); }}>
            Comment ça marche
          </a>
        </li>
        <li>
          <a href="/devenir-jobeur" onClick={(e) => { e.preventDefault(); navigate('/devenir-jobeur'); }}>
            Devenir Jobeur
          </a>
        </li>
        <li>
          <a href="/nous-joindre" onClick={(e) => { e.preventDefault(); navigate('/nous-joindre'); }}>
            Nous Joindre
          </a>
        </li>
      </ul>
    </div>

    {/* Colonne 3 - Légal */}
    <div className="footer-column">
      <h4 className="footer-column-title">Légal</h4>
      <ul className="footer-links">
        <li>
          <a href="/blog" onClick={(e) => { e.preventDefault(); navigate('/blog'); }}>
            Blog
          </a>
        </li>
        <li>
          <a href="/conditions" onClick={(e) => { e.preventDefault(); navigate('/conditions'); }}>
            Conditions d'utilisation
          </a>
        </li>
        <li>
          <a href="/parametres" onClick={(e) => { e.preventDefault(); navigate('/parametres'); }}>
            Paramètres
          </a>
        </li>
      </ul>
    </div>
  </div>

  {/* Ligne de séparation */}
  <div className="footer-divider"></div>

  {/* Bas du footer */}
  <div className="footer-bottom">
    {/* Réseaux sociaux */}
    <div className="footer-social">
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
        <FaFacebookF />
      </a>
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
        <FaInstagram />
      </a>
      <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="social-icon">
        <FaWhatsapp />
      </a>
    </div>

    {/* Copyright */}
    <p className="footer-copyright">© 2024 Jobty - Tous droits réservés</p>
  </div>
</footer>
    </div>
  );
}

