import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  FiMenu, FiX, FiUser, FiMapPin, FiDollarSign, FiStar,
  FiMessageCircle, FiBriefcase, FiCheckCircle, FiCalendar,
  FiClock, FiEye, FiHeart, FiShare2, FiAward, FiTrendingUp,
  FiLink, FiImage, FiMoreVertical, FiShield, FiChevronsRight, FiChevronLeft,
  FiCamera, FiEdit3
} from 'react-icons/fi';
import { FaHandshake, FaFacebookF, FaTwitter, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';
import Logo from '@/components/shared/Logo';
import {
  usePublicProfileById,
  usePublicProfiles,
} from '../../marketplace/hooks/usePublicProfiles';
import { useAuthStore } from '../../../stores/auth.store';
import './ProfilPublicFreelance.css';

const getProfilePayload = (profile: unknown): Record<string, any> => {
  if (!profile) return {};
  const dataLevel = (profile as any)?.data ?? profile;
  return ((dataLevel as any)?.data ?? dataLevel) as Record<string, any>;
};

const toStringValue = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);

const toNumberValue = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBooleanValue = (value: unknown, fallback = false): boolean => {
  if (value === null || value === undefined) return fallback;
  return Boolean(value);
};

const parseLocation = (locationValue: unknown): { ville: string; pays: string } => {
  const location = toStringValue(locationValue).trim();
  if (!location || location.toLowerCase() === 'location not specified') {
    return { ville: '', pays: '' };
  }

  const [ville = '', ...rest] = location.split(',').map((item) => item.trim());
  return {
    ville,
    pays: rest.join(', '),
  };
};

const normalizeActionButtonType = (value: unknown): 'CONTACT' | 'COLLABORATE' => {
  if (value === 0 || value === '0') return 'CONTACT';
  if (value === 1 || value === '1') return 'COLLABORATE';

  const normalized = toStringValue(value).trim().toUpperCase();
  if (normalized === 'CONTACT') return 'CONTACT';
  if (normalized === 'COLLABORATE') return 'COLLABORATE';

  return 'CONTACT';
};

function ProfilPublicFreelance() {
  const navigate = useNavigate();
  const { identifier, freelanceId, id } = useParams();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const getDashboardRoute = useAuthStore((state) => state.getDashboardRoute);

  const authShortcutLabel = isAuthenticated ? 'Dashboard' : 'Connexion';
  const authShortcutRoute = isAuthenticated ? getDashboardRoute() : '/connexion';

  const handleAuthShortcutClick = () => {
    navigate(authShortcutRoute, {
      state: !isAuthenticated ? { from: location.pathname } : undefined,
    });
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/marketplace');
  };

  const rawIdentifier = identifier || freelanceId || id || '';
  const normalizedIdentifier = decodeURIComponent(rawIdentifier).trim().toLowerCase();
  const routeState = (location.state || {}) as { userId?: string; username?: string | null };
  const isLikelyUserId = /^[0-9a-fA-F-]{16,}$/.test(rawIdentifier);
  const shouldResolveByUsername =
    Boolean(rawIdentifier) && !isLikelyUserId && !routeState.userId;

  const {
    data: publicProfilesList,
    isLoading: isProfilesLoading,
    isFetching: isProfilesFetching,
  } = usePublicProfiles({
    search: !isLikelyUserId && rawIdentifier ? rawIdentifier : undefined,
    enabled: shouldResolveByUsername,
    size: 100,
  });

  const matchedProfile = useMemo(() => {
    if (!shouldResolveByUsername) return null;

    const profiles = Array.isArray(publicProfilesList?.data)
      ? publicProfilesList?.data
      : publicProfilesList?.data?.content || [];

    const matched = profiles.find((profile: any) => {
      const username = toStringValue(profile?.username).trim().toLowerCase();
      return username === normalizedIdentifier;
    });

    return matched || null;
  }, [shouldResolveByUsername, publicProfilesList, normalizedIdentifier]);

  const resolvedUserId = useMemo(() => {
    if (routeState.userId) return routeState.userId;
    if (!rawIdentifier) return '';
    if (isLikelyUserId) return rawIdentifier;

    return toStringValue(matchedProfile?.userId);
  }, [routeState.userId, rawIdentifier, isLikelyUserId, matchedProfile]);

  const {
    data: profileByIdData,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    isError: isProfileError,
  } = usePublicProfileById(resolvedUserId);

  const liveProfilePayload = useMemo(
    () => getProfilePayload(profileByIdData),
    [profileByIdData],
  );

  const hasRenderableProfile = Boolean(
    toStringValue(liveProfilePayload.userId) ||
      toStringValue(liveProfilePayload.id) ||
      toStringValue(liveProfilePayload.firstName) ||
      toStringValue(liveProfilePayload.lastName),
  );

  const isResolvingUsername =
    shouldResolveByUsername && (isProfilesLoading || isProfilesFetching);
  const isLoadingProfileDetails =
    Boolean(resolvedUserId) && (isProfileLoading || isProfileFetching);
  const isPageLoading = isResolvingUsername || isLoadingProfileDetails;

  const isUsernameNotFound =
    shouldResolveByUsername &&
    !isResolvingUsername &&
    !matchedProfile;

  const isProfileNotFound =
    Boolean(resolvedUserId) &&
    !isLoadingProfileDetails &&
    (isProfileError || !hasRenderableProfile);

  const shouldShowNotFound = !rawIdentifier || isUsernameNotFound || isProfileNotFound;

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('apropos');
  const [selectedRealisationIndex, setSelectedRealisationIndex] = useState(null);
  const [isNavSticky, setIsNavSticky] = useState(false);

  
  const actionButtonType = normalizeActionButtonType(
    liveProfilePayload.actionButtonType,
  );
  const isAvailable =
    liveProfilePayload.isAvailable ?? liveProfilePayload.available;
  const stats = (liveProfilePayload.stats || {}) as Record<string, unknown>;
  const locationParts = parseLocation(
    liveProfilePayload.location ||
      `${toStringValue(liveProfilePayload.city)}, ${toStringValue(liveProfilePayload.country)}`,
  );

  const freelance = {
    id:
      toStringValue(liveProfilePayload.userId) ||
      toStringValue(liveProfilePayload.id) ||
      '',
    nom: toStringValue(liveProfilePayload.lastName),
    prenom: toStringValue(liveProfilePayload.firstName),
    photo:
      toStringValue(liveProfilePayload.avatarUrl) ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        toStringValue(liveProfilePayload.firstName) && toStringValue(liveProfilePayload.lastName)
          ? `${toStringValue(liveProfilePayload.firstName)}-${toStringValue(liveProfilePayload.lastName)}`
          : 'jobty-user',
      )}`,
    couverture:
      toStringValue(liveProfilePayload.coverImageUrl),
    specialite:
      toStringValue(liveProfilePayload.specialty) || 'Freelance',
    secteur: toStringValue(liveProfilePayload.sector),
    ville: locationParts.ville || toStringValue(liveProfilePayload.city),
    pays: locationParts.pays || toStringValue(liveProfilePayload.country),
    tarifHoraire: toNumberValue(liveProfilePayload.hourlyRate, 0),
    disponible: toBooleanValue(isAvailable, false),
    note: toNumberValue(stats.averageRating ?? liveProfilePayload.averageRating, 0),
    nbAvis: Array.isArray(liveProfilePayload.reviews)
      ? liveProfilePayload.reviews.length
      : toNumberValue(liveProfilePayload.reviewCount, 0),
    verified: toBooleanValue(liveProfilePayload.verified, false),
    anciennete: toStringValue(stats.durationOnPlatform) || 'N/A',
    projetsRealises: toNumberValue(stats.completedProjects, 0),
    collaborationsEnCours: toNumberValue(stats.ongoingProjects, 0),
    vuesProfile: toNumberValue(stats.visitCount, 0),
    favoris: toNumberValue(stats.favoriteCount, 0),
    tags:
      Array.isArray(liveProfilePayload.skills) && liveProfilePayload.skills.length > 0
        ? liveProfilePayload.skills
        : [],
    apropos: {
      description:
        toStringValue(liveProfilePayload.presentation) ||
        'Présentation non renseignée.',
      approche:
        toStringValue(liveProfilePayload.workStyle) ||
        'Approche non renseignée.',
      typesProjetAcceptes:
        toStringValue(liveProfilePayload.projectTypes) ||
        'Types de projets non renseignés.',
    },
    actionButtonType,
  };

  const displayLocation =
    [freelance.ville, freelance.pays].filter(Boolean).join(', ') ||
    'Localisation non renseignée';

  const services =
    Array.isArray(liveProfilePayload.services) &&
    liveProfilePayload.services.length > 0
      ? liveProfilePayload.services.map((service: any, index: number) => ({
          id: service.id || index + 1,
          titre: toStringValue(service.title || service.name || 'Service'),
          description: toStringValue(service.description || ''),
          prix:
            service.price !== null && service.price !== undefined
              ? toNumberValue(service.price)
              : null,
          typePrix:
            service.price !== null && service.price !== undefined
              ? 'fixe'
              : 'devis',
          delai: toStringValue(service.duration || service.delay || 'Variable'),
          image:
            toStringValue(service.imageUrl || service.image) ||
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600',
        }))
      : [];

  const realisations =
    Array.isArray(liveProfilePayload.portfolio) &&
    liveProfilePayload.portfolio.length > 0
      ? liveProfilePayload.portfolio.map((item: any, index: number) => ({
          id: item.id || index + 1,
          type: item.url ? 'link' : 'image',
          titre: toStringValue(item.title || item.name || 'Réalisation'),
          description: toStringValue(item.description || ''),
          medias: Array.isArray(item.media)
            ? item.media
            : [
                toStringValue(item.imageUrl || item.image) ||
                  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
              ],
          url: toStringValue(item.url),
          likes: toNumberValue(item.likes),
          vues: toNumberValue(item.views),
          date: toStringValue(item.date || new Date().toISOString()),
          technologies: Array.isArray(item.technologies)
            ? item.technologies
            : freelance.tags.slice(0, 3),
        }))
      : [];

  const collaborations =
    Array.isArray(liveProfilePayload.collaborations) &&
    liveProfilePayload.collaborations.length > 0
      ? liveProfilePayload.collaborations.map((collab: any, index: number) => ({
          id: collab.id || index + 1,
          titre: toStringValue(collab.title || collab.name || 'Collaboration'),
          client: toStringValue(collab.clientName || collab.client || 'Client'),
          statut:
            toStringValue(collab.status || collab.statut || 'en_cours') ===
            'termine'
              ? 'termine'
              : 'en_cours',
          date: toStringValue(collab.date || new Date().toISOString()),
          note: toNumberValue(collab.rating, 0),
          progression: toNumberValue(collab.progression, 0),
          miniature:
            toStringValue(collab.imageUrl || collab.image) ||
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        }))
      : [];

  const avis =
    Array.isArray(liveProfilePayload.reviews) && liveProfilePayload.reviews.length > 0
      ? liveProfilePayload.reviews.map((review: any, index: number) => ({
          id: review.id || index + 1,
          client: toStringValue(review.clientName || review.author || 'Client'),
          photo:
            toStringValue(review.clientAvatar || review.avatarUrl) ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=review-${index}`,
          note: toNumberValue(review.rating, 0),
          commentaire: toStringValue(review.comment || review.description || ''),
          projet: toStringValue(review.projectTitle || review.project || 'Projet'),
          date: toStringValue(review.date || new Date().toISOString()),
        }))
      : [];

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const renderStars = (note) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar 
          key={i} 
          style={{ 
            fill: i <= Math.floor(note) ? '#FFD700' : 'none',
            color: i <= Math.floor(note) ? '#FFD700' : '#ddd',
            fontSize: '14px'
          }}
        />
      );
    }
    return stars;
  };

  const handleContactClick = () => {
    navigate(`/collaboration/${freelance.id}`);
  };

  const handleCollabClick = () => {
    navigate(`/collaboration/${freelance.id}`);
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Navigation items
  const navItems = [
    { id: 'apropos', label: 'À propos', icon: <FiUser /> },
    { id: 'services', label: 'Services', icon: <FiBriefcase /> },
    { id: 'realisations', label: 'Réalisations', icon: <FiImage /> },
    { id: 'collaborations', label: 'Collaborations', icon: <FaHandshake /> },
    { id: 'avis', label: 'Avis', icon: <FiStar /> }
  ];

  if (isPageLoading) {
    return (
      <div className="profil-public-page">
        <header className="profil-public-header">
          <div className="profil-public-header-content">
            <div className="profil-public-logo" onClick={() => navigate('/')}>
              <Logo alt="Jobty" />
            </div>
            <div className="profil-public-header-actions">
              <button className="profil-public-back-btn" onClick={handleBack}>
                <FiChevronLeft /> Retour
              </button>
              <button className="profil-public-auth-btn" onClick={handleAuthShortcutClick}>
                <FiChevronsRight /> {authShortcutLabel}
              </button>
            </div>
          </div>
        </header>

        <main className="profil-public-main profil-public-loading-main">
          <div className="profil-loading-card">
            <div className="profil-loading-line profil-loading-line-lg" />
            <div className="profil-loading-line" />
            <div className="profil-loading-line" />
            <div className="profil-loading-grid">
              <div className="profil-loading-box" />
              <div className="profil-loading-box" />
              <div className="profil-loading-box" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (shouldShowNotFound) {
    return (
      <div className="profil-public-page">
        <header className="profil-public-header">
          <div className="profil-public-header-content">
            <div className="profil-public-logo" onClick={() => navigate('/')}>
              <Logo alt="Jobty" />
            </div>
            <div className="profil-public-header-actions">
              <button className="profil-public-back-btn" onClick={handleBack}>
                <FiChevronLeft /> Retour
              </button>
              <button className="profil-public-auth-btn" onClick={handleAuthShortcutClick}>
                <FiChevronsRight /> {authShortcutLabel}
              </button>
            </div>
          </div>
        </header>

        <main className="profil-public-main profil-public-empty-main">
          <div className="profil-empty-card">
            <FiUser className="profil-empty-icon" />
            <h1>Profil introuvable</h1>
            <p>
              Le profil demandé n&apos;existe pas ou n&apos;est plus accessible.
            </p>
            <div className="profil-empty-actions">
              <button className="profil-btn-secondary" onClick={() => navigate('/marketplace')}>
                Retour au marketplace
              </button>
              <button className="profil-btn-primary" onClick={() => navigate('/')}>
                Aller à l&apos;accueil
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="profil-public-page">
      {/* HEADER FIXE */}
      <header className="profil-public-header">
        <div className="profil-public-header-content">
          <div className="profil-public-logo" onClick={() => navigate('/')}>
            <Logo alt="Jobty" />
          </div>

          <div className="profil-public-header-actions">
            <button className="profil-public-back-btn" onClick={handleBack}>
              <FiChevronLeft /> Retour
            </button>
            <button className="profil-public-auth-btn" onClick={handleAuthShortcutClick}>
              <FiChevronsRight /> {authShortcutLabel}
            </button>
            <button className="profil-public-burger-btn" onClick={toggleMenu}>
              <FiMenu />
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile */}
      {menuOpen && (
        <>
          <div className="profil-public-overlay" onClick={closeMenu}></div>
          <div className="profil-public-sidebar">
            <div className="profil-public-sidebar-header">
              <Logo alt="Jobty" />
              <button onClick={closeMenu}><FiX /></button>
            </div>
            <nav className="profil-public-sidebar-nav">
              <button onClick={() => { handleAuthShortcutClick(); closeMenu(); }}>
                <FiChevronsRight /> {authShortcutLabel}
              </button>
              {navItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => { scrollToSection(item.id); closeMenu(); }}
                  className={activeSection === item.id ? 'active' : ''}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* MAIN CONTENT */}
      <main className="profil-public-main">
        
        {/* ==================== SECTION HERO FACEBOOK STYLE ==================== */}
        <section className="profil-cover-section">
          {/* Photo de couverture */}
          <div className="profil-cover-wrapper">
            <div 
              className="profil-cover-image"
              style={{ backgroundImage: `url(${freelance.couverture})` }}
            >
              <div className="profil-cover-overlay"></div>
            </div>
          </div>

          {/* Conteneur principal profil */}
          <div className="profil-hero-container">
            {/* Photo de profil */}
            <div className="profil-avatar-section">
              <div className="profil-avatar-wrapper">
                <img 
                  src={freelance.photo} 
                  alt={`${freelance.prenom} ${freelance.nom}`}
                  className="profil-avatar-img"
                />
                {freelance.verified && (
                  <span className="profil-verified-badge">
                    <FiCheckCircle />
                  </span>
                )}
                
              </div>
            </div>

            {/* Infos du profil */}
            <div className="profil-info-section">
              <div className="profil-info-main">
                <div className="profil-name-row">
                  <h1 className="profil-name">{freelance.prenom} {freelance.nom}</h1>
                  <span className="profil-badge-freelance">
                    <FiBriefcase /> Freelance
                  </span>
                </div>
                <p className="profil-specialite">{freelance.specialite}</p>
                
                <div className="profil-meta-row">
                  <span className="profil-location">
                    <FiMapPin /> {displayLocation}
                  </span>
                  <span className="profil-divider">•</span>
                  <div className="profil-rating-inline">
                    <FiStar style={{ fill: '#FFD700', color: '#FFD700' }} />
                    <span>{freelance.note}</span>
                    <span className="profil-avis-count">({freelance.nbAvis} avis)</span>
                  </div>
                  <span className="profil-divider">•</span>
                  <span className={`profil-dispo-inline ${freelance.disponible ? 'disponible' : 'occupe'}`}>
                    <span className="profil-dispo-dot"></span>
                    {freelance.disponible ? 'Disponible' : 'Occupé'}
                  </span>
                </div>

                {/* Tags de compétences */}
                <div className="profil-tags-row">
                  {freelance.tags.length > 0 ? (
                    <>
                      {freelance.tags.slice(0, 4).map((tag, index) => (
                        <span key={index} className="profil-tag">{tag}</span>
                      ))}
                      {freelance.tags.length > 4 && (
                        <span className="profil-tag-more">+{freelance.tags.length - 4}</span>
                      )}
                    </>
                  ) : (
                    <span className="profil-tag-more">Aucune compétence renseignée</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="profil-actions-section">
                {freelance.actionButtonType === 'CONTACT' ? (
                  <button className="profil-btn-primary" onClick={handleContactClick}>
                    <FiMessageCircle /> Contacter
                  </button>
                ) : (
                  <button className="profil-btn-primary" onClick={handleCollabClick}>
                    <FaHandshake /> Collaborer
                  </button>
                )}
                <button className="profil-btn-secondary" onClick={handleContactClick}>
                  <FiMessageCircle /> Message
                </button>
                <button className="profil-btn-icon">
                  <FiMoreVertical />
                </button>
              </div>
            </div>
          </div>

          {/* MENU DE NAVIGATION DU PROFIL */}
          {/* Retirez la condition isNavSticky */}
<div className="profil-navigation">
  <div className="profil-navigation-inner">
    <nav className="profil-nav-tabs">
      {navItems.map(item => (
        <button
          key={item.id}
          className={`profil-nav-tab ${activeSection === item.id ? 'active' : ''}`}
          onClick={() => scrollToSection(item.id)}
        >
         
          <span className="profil-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  </div>
</div>
        </section>

        {/* ==================== CONTENU DU PROFIL ==================== */}
        <div className="profil-content-wrapper">
          
          {/* SIDEBAR GAUCHE - Stats */}
          <aside className="profil-sidebar">
            <div className="profil-sidebar-card">
              <h3 className="profil-sidebar-title">Statistiques</h3>
              <div className="profil-stats-list">
                <div className="profil-stat-item">
                  <FiCheckCircle className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-value">{freelance.projetsRealises}</span>
                    <span className="stat-label">Projets réalisés</span>
                  </div>
                </div>
                <div className="profil-stat-item">
                  <FiBriefcase className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-value">{freelance.collaborationsEnCours}</span>
                    <span className="stat-label">En cours</span>
                  </div>
                </div>
                <div className="profil-stat-item">
                  <FiCalendar className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-value">{freelance.anciennete}</span>
                    <span className="stat-label">Sur Jobty</span>
                  </div>
                </div>
                <div className="profil-stat-item">
                  <FiEye className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-value">{freelance.vuesProfile.toLocaleString()}</span>
                    <span className="stat-label">Vues du profil</span>
                  </div>
                </div>
                <div className="profil-stat-item">
                  <FiHeart className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-value">{freelance.favoris}</span>
                    <span className="stat-label">Favoris</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Badge de fiabilité */}
            {freelance.verified && (
              <div className="profil-sidebar-card profil-trust-card">
                <div className="trust-header">
                  <FiShield className="trust-icon" />
                  <span>Profil vérifié</span>
                </div>
                <p>Ce freelance a été vérifié et a reçu d'excellentes évaluations.</p>
              </div>
            )}

            {/* Tarif */}
            <div className="profil-sidebar-card profil-tarif-card">
              <h3 className="profil-sidebar-title">Tarif</h3>
              <div className="tarif-display">
                <FiDollarSign />
                <span className="tarif-value">{freelance.tarifHoraire.toLocaleString()}</span>
                <span className="tarif-unit">FCFA/h</span>
              </div>
            </div>
          </aside>

          {/* CONTENU PRINCIPAL */}
          <div className="profil-main-content">
            
            {/* A. À PROPOS */}
            <section id="apropos" className="profil-section profil-card">
              <h2 className="profil-section-title">
                <FiUser /> À propos
              </h2>
              <div className="profil-apropos-content">
                <div className="profil-apropos-item">
                  <h3>Présentation</h3>
                  <p>{freelance.apropos.description}</p>
                </div>
              </div>
            </section>

            {/* B. SERVICES */}
            <section id="services" className="profil-section profil-card">
              <div className="profil-section-header">
                <h2 className="profil-section-title">
                  <FiBriefcase /> Services proposés
                </h2>
                <span className="profil-badge-count">{services.length} services</span>
              </div>

              <div className="profil-services-grid">
                {services.length === 0 ? (
                  <p>Aucun service disponible pour le moment.</p>
                ) : (
                  services.map(service => (
                    <div key={service.id} className="profil-service-card">
                      <div className="profil-service-image" style={{ backgroundImage: `url(${service.image})` }}></div>
                      <div className="profil-service-content">
                        <h3>{service.titre}</h3>
                        <p>{service.description}</p>
                        <div className="profil-service-meta">
                          <div className="profil-service-prix">
                            {service.typePrix === 'fixe' && service.prix !== null ? (
                              <>
                                <FiDollarSign />
                                <span>{service.prix.toLocaleString()} FCFA</span>
                              </>
                            ) : (
                              <>
                                <FiDollarSign />
                                <span>Sur devis</span>
                              </>
                            )}
                          </div>
                          <div className="profil-service-delai">
                            <FiClock />
                            <span className='mr-4'>{service.delai} jour(s)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* C. RÉALISATIONS */}
            <section id="realisations" className="profil-section profil-card">
              <div className="profil-section-header">
                <h2 className="profil-section-title">
                  <FiImage /> Réalisations
                </h2>
                <span className="profil-badge-count">{realisations.length} projets</span>
              </div>

              <div className="profil-realisations-grid">
                {realisations.length === 0 ? (
                  <p>Aucune réalisation publiée pour le moment.</p>
                ) : (
                  realisations.map(realisation => (
                    <div key={realisation.id} className="profil-realisation-card">
                      {realisation.type === 'image' ? (
                        <div
                          className="profil-realisation-media"
                          style={{ backgroundImage: `url(${realisation.medias[0]})` }}
                          onClick={() => setSelectedRealisationIndex(realisation.id)}
                        >
                        {realisation.medias.length > 1 && (
                          <span className="profil-realisation-count">
                            <FiImage /> +{realisation.medias.length - 1}
                          </span>
                        )}
                        </div>
                      ) : (
                        <a
                          href={realisation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="profil-realisation-link"
                        >
                          <FiLink />
                          <span>Voir le projet</span>
                        </a>
                      )}

                      <div className="profil-realisation-content">
                        <h3>{realisation.titre}</h3>
                        <p>{realisation.description}</p>
                        <div className="profil-realisation-technologies">
                          {realisation.technologies.map((tech, index) => (
                            <span key={index} className="profil-tech-tag">{tech}</span>
                          ))}
                        </div>
                        <div className="profil-realisation-footer">
                          <div className="profil-realisation-stats">
                            <span><FiHeart /> {realisation.likes}</span>
                            <span><FiEye /> {realisation.vues}</span>
                          </div>
                          <span className="profil-realisation-date">
                            {new Date(realisation.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* D. COLLABORATIONS */}
            <section id="collaborations" className="profil-section profil-card">
              <div className="profil-section-header">
                <h2 className="profil-section-title">
                  <FaHandshake /> Collaborations
                </h2>
                <span className="profil-badge-count">{collaborations.length} projets</span>
              </div>

              <div className="profil-collaborations-grid">
                {collaborations.length === 0 ? (
                  <p>Aucune collaboration publique pour le moment.</p>
                ) : (
                  collaborations.map(collab => (
                    <div key={collab.id} className="profil-collaboration-card">
                    <div 
                      className="profil-collaboration-miniature"
                      style={{ backgroundImage: `url(${collab.miniature})` }}
                    >
                      <span className={`profil-collab-statut ${collab.statut}`}>
                        {collab.statut === 'termine' ? (
                          <><FiCheckCircle /> Terminé</>
                        ) : (
                          <><FiClock /> En cours</>
                        )}
                      </span>
                    </div>
                    <div className="profil-collaboration-info">
                      <h4>{collab.titre}</h4>
                      <p>{collab.client}</p>
                      {collab.statut === 'en_cours' && (
                        <div className="profil-collab-progress">
                          <div className="profil-progress-bar">
                            <div 
                              className="profil-progress-fill"
                              style={{ width: `${collab.progression}%` }}
                            ></div>
                          </div>
                          <span>{collab.progression}%</span>
                        </div>
                      )}
                      {collab.statut === 'termine' && collab.note && (
                        <div className="profil-collab-note">
                          {renderStars(collab.note)}
                        </div>
                      )}
                    </div>
                  </div>
                  ))
                )}
              </div>
            </section>

            {/* E. AVIS & ÉVALUATIONS */}
            <section id="avis" className="profil-section profil-card">
              <div className="profil-section-header">
                <h2 className="profil-section-title">
                  <FiStar /> Avis & Évaluations
                </h2>
                <div className="profil-avis-resume">
                  <span className="profil-avis-note">{freelance.note}</span>
                  <div>
                    {renderStars(freelance.note)}
                    <span className="profil-avis-total">{freelance.nbAvis} avis</span>
                  </div>
                </div>
              </div>

              <div className="profil-avis-grid">
                {avis.length === 0 ? (
                  <p>Aucun avis pour le moment.</p>
                ) : (
                  avis.map(avisItem => (
                    <div key={avisItem.id} className="profil-avis-card">
                    <div className="profil-avis-header">
                      <img src={avisItem.photo} alt={avisItem.client} />
                      <div className="profil-avis-client-info">
                        <h4>{avisItem.client}</h4>
                        <div className="profil-avis-stars">
                          {renderStars(avisItem.note)}
                        </div>
                      </div>
                      <span className="profil-avis-date">
                        {new Date(avisItem.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="profil-avis-commentaire">{avisItem.commentaire}</p>
                    <div className="profil-avis-projet">
                      <FiBriefcase />
                      <span>{avisItem.projet}</span>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </section>

          </div>
        </div>

        {/* CTA FOOTER */}
        <section className="profil-cta">
          <h2>Prêt à démarrer votre projet ?</h2>
          <p>Contactez <b>{freelance.prenom}</b> pour discuter de vos besoins et obtenir un devis personnalisé</p>
          <div className="profil-cta-actions">
            <button className="profil-btn-secondary" onClick={handleContactClick}>
              <FiMessageCircle /> Envoyer un message
            </button>
            <button className="profil-btn-primary" onClick={handleCollabClick}>
              <FaHandshake /> Démarrer une collaboration
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="profil-public-footer">
        <div className="profil-public-footer-content">
          <div className="profil-public-footer-left">
            <Logo alt="Jobty" className="profil-public-footer-logo" />
            <p>La plateforme qui connecte talents et opportunités en Afrique</p>
          </div>
          <div className="profil-public-footer-links">
            <a href="/marketplace">Marketplace</a>
            <a href="/nous-joindre">Contact</a>
            <a href="/conditions">CGU</a>
          </div>
          <div className="profil-public-footer-social">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaLinkedinIn /></a>
            <a href="#"><FaWhatsapp /></a>
          </div>
        </div>
        <div className="profil-public-footer-bottom">
          <p>© 2024 Jobty - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}

export default ProfilPublicFreelance;
