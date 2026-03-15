import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { inferSectorFromQuery } from '../../utils/professionHints';
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

const extractSmartQuery = (rawQuery: string) => {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return { query: '', inferredCity: '', inferredSector: '' };
  }

  const separators = [' à ', ' a '];
  for (const separator of separators) {
    const idx = trimmed.toLowerCase().lastIndexOf(separator);
    if (idx > 0) {
      const query = trimmed.slice(0, idx).trim();
      const inferredCity = trimmed.slice(idx + separator.length).trim();
      if (query && inferredCity) {
        return { query, inferredCity, inferredSector: inferSectorFromQuery(query) };
      }
    }
  }

  return { query: trimmed, inferredCity: '', inferredSector: inferSectorFromQuery(trimmed) };
};

const buildFiltersFromParams = (params: URLSearchParams) => ({
  search: params.get('q') || '',
  secteur: params.get('sector') || '',
  pays: params.get('country') || '',
  ville: params.get('city') || '',
  type: params.get('type') || '',
  page: readNumberParam(params.get('page'), DEFAULT_PAGE),
  size: readNumberParam(params.get('size'), DEFAULT_SIZE),
});

const buildQueryParams = (filters: {
  search: string;
  secteur: string;
  pays: string;
  ville: string;
  type: string;
  page: number;
  size: number;
}) => {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set('q', filters.search.trim());
  if (filters.secteur.trim()) params.set('sector', filters.secteur.trim());
  if (filters.pays.trim()) params.set('country', filters.pays.trim());
  if (filters.ville.trim()) params.set('city', filters.ville.trim());
  if (filters.type.trim()) params.set('type', filters.type.trim());
  params.set('page', String(filters.page));
  params.set('size', String(filters.size));
  return params;
};

const normalizeResult = (item: PublicSearchProfileItem) => {
  const displayName =
    item.type === 'ENTERPRISE'
      ? item.companyName || [item.firstName, item.lastName].filter(Boolean).join(' ').trim() || 'Entreprise'
      : [item.firstName, item.lastName].filter(Boolean).join(' ').trim() || item.companyName || 'Freelance';

  const type = item.type === 'ENTERPRISE' ? 'entreprise' : 'freelance';
  const specialization = item.type === 'ENTERPRISE' ? item.sector || 'Entreprise' : item.specialization || item.sector || 'Professionnel';
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
    projetsCollaboration: item.reviewCount || 0,
    note: item.averageRating || 0,
    verified: item.verified,
  };
};

function SearchResults() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authUser = useAuthStore((state) => state.user);
  const getDashboardRoute = useAuthStore((state) => state.getDashboardRoute);
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationResolved, setLocationResolved] = useState(false);
  const authShortcutLabel = isAuthenticated ? 'Dashboard' : 'Connexion';
  const authShortcutRoute = isAuthenticated ? getDashboardRoute() : '/connexion';
  const authAvatarUrl = resolveAvatarUrl(authUser);

  const goToAuthShortcut = () => {
    navigate(authShortcutRoute, {
      state: !isAuthenticated ? { from: '/search' } : undefined,
    });
  };

  const activeFilters = useMemo(() => buildFiltersFromParams(searchParams), [searchParams]);
  const [countryOverrideForTowns, setCountryOverrideForTowns] = useState<string | null>(null);
  const selectedCountryForTowns = countryOverrideForTowns ?? activeFilters.pays;

  const formResetKey = `${activeFilters.search}|${activeFilters.secteur}|${activeFilters.pays}|${activeFilters.ville}`;

  useEffect(() => {
    const hasLocationInParams = Boolean(activeFilters.pays.trim() && activeFilters.ville.trim());
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
          ville: location.city,
          type: activeFilters.type,
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
    activeFilters.size,
    authUser,
    setSearchParams,
  ]);

  const requestPayload = useMemo(() => {
    const smart = extractSmartQuery(activeFilters.search);
    const resolvedCity = activeFilters.ville.trim() || smart.inferredCity;
    const resolvedSector = activeFilters.secteur.trim() || smart.inferredSector;

    return {
      query: smart.query || undefined,
      sector: resolvedSector || undefined,
      country: activeFilters.pays.trim() || undefined,
      city: resolvedCity || undefined,
      page: activeFilters.page,
      size: activeFilters.size,
    };
  }, [
    activeFilters.search,
    activeFilters.secteur,
    activeFilters.pays,
    activeFilters.ville,
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
    const selected = selectedCountryForTowns.trim();
    if (!selected) return [];

    const selectedNormalized = normalizeText(selected);
    const match = countryTownEntries.find(
      (entry) => normalizeText(entry.country) === selectedNormalized,
    );

    return match?.towns ?? [];
  }, [selectedCountryForTowns, countryTownEntries]);

  const normalizedPros = useMemo(() => pros.map(normalizeResult), [pros]);
  const normalizedEnterprises = useMemo(() => enterprises.map(normalizeResult), [enterprises]);

  const filteredResults = useMemo(() => {
    if (activeFilters.type === 'freelance') return normalizedPros;
    if (activeFilters.type === 'entreprise') return normalizedEnterprises;
    return [...normalizedPros, ...normalizedEnterprises];
  }, [activeFilters.type, normalizedPros, normalizedEnterprises]);

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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const search = String(formData.get('search') || '');
    const secteur = String(formData.get('secteur') || '');
    const selectedPays = String(formData.get('pays') || '').trim();
    const selectedVille = String(formData.get('ville') || '').trim();

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
      page: DEFAULT_PAGE,
      size: activeFilters.size,
    });

    setSearchParams(params);
  };

  const handleQuickTypeChange = (type: string) => {
    const params = buildQueryParams({
      search: activeFilters.search,
      secteur: activeFilters.secteur,
      pays: activeFilters.pays,
      ville: activeFilters.ville,
      type,
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
          <form key={formResetKey} className="search-filters-bar" onSubmit={handleSearch}>
            <div className="search-filter-item search-input">
              <FiSearch className="search-icon" />
              <input
                type="text"
                name="search"
                placeholder="Recherche"
                defaultValue={activeFilters.search}
              />
            </div>

            <div className="search-filter-item">
              <select name="secteur" defaultValue={activeFilters.secteur}>
                {secteurs.map((secteur, index) => (
                  <option key={index} value={index === 0 ? '' : secteur}>{secteur}</option>
                ))}
              </select>
              <FiChevronDown className="search-select-arrow" />
            </div>

            <div className="search-filter-item">
              <select
                name="pays"
                defaultValue={activeFilters.pays}
                onChange={(e) => setCountryOverrideForTowns(e.target.value)}
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
                placeholder={selectedCountryForTowns ? 'Ville (choisir ou saisir)' : 'Ville'}
                defaultValue={activeFilters.ville}
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
          </form>

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
              Freelances
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
