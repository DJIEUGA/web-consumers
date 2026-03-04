
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  FiSearch, 
  FiMapPin, 
  FiDollarSign, 
  FiClock, 
  FiCheck,
  FiChevronDown,
  FiMenu,
  FiX,
  FiStar,
  FiBriefcase,
  FiCalendar,
  FiGrid,
  FiUser,
  FiUsers,
  FiAward,
  FiLoader,
  FiAlertCircle
} from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { COLORS } from '../../../styles/colors';
import Logo from '@/components/shared/Logo';
import { usePublicProfiles } from '../hooks/usePublicProfiles';
import { mapPublicProfileToFreelanceCard } from '../utils/profileMapper';
import type { PublicProfile } from '../types/publicProfile.d';
import { EmptyState, ErrorState } from '@/components/ui';
import { parseApiError, getErrorDescription } from '@/utils/errorHandler';
import { resolveAvatarUrl } from '@/utils/avatar';
import { useAuthStore } from '@/stores/auth.store';
import './Marketplace.css';

export const Marketplace = () =>{
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authUser = useAuthStore((state) => state.user);
  const getDashboardRoute = useAuthStore((state) => state.getDashboardRoute);
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const authShortcutLabel = isAuthenticated ? 'Dashboard' : 'Connexion';
  const authShortcutRoute = isAuthenticated ? getDashboardRoute() : '/connexion';
  const authAvatarUrl = resolveAvatarUrl(authUser);

  const goToAuthShortcut = () => {
    navigate(authShortcutRoute, {
      state: !isAuthenticated ? { from: '/marketplace' } : undefined,
    });
  };
  
  // États des filtres
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    secteur: '',
    pays: '',
    ville: '',
    categorie: ''
  });

  const [visibleCount, setVisibleCount] = useState(8);

  // Fetch public profiles from API
  const { data: profilesResponse, isLoading, error } = usePublicProfiles({
    search: filters.search || undefined,
    location: filters.pays || undefined,
    enabled: true,
  });

  // Parse error information
  const parsedError = useMemo(() => {
    if (!error) return null;
    return parseApiError(error);
  }, [error]);

  // Handle errors with toast notifications
  useEffect(() => {
    if (error && parsedError) {
      toast.error(parsedError.title, {
        description: parsedError.message + (parsedError.status ? ` (Code: ${parsedError.status})` : ''),
        duration: 5000,
        action: {
          label: 'Réessayer',
          onClick: () => window.location.reload(),
        },
      });
      
      console.error('[MARKETPLACE] Error fetching profiles:', {
        parsed: parsedError,
        original: error,
      });
    }
  }, [error, parsedError]);

  // Transform API profiles to freelance card format
  const apiProfiles = useMemo(() => {
    console.log('[MARKETPLACE] apiProfiles memo - profilesResponse:', profilesResponse);
    if (!profilesResponse) {
      console.log('[MARKETPLACE] profilesResponse is null/undefined');
      return [];
    }
    if (!profilesResponse?.data) {
      console.log('[MARKETPLACE] No data in profilesResponse');
      return [];
    }
    // Always expect paginated format with content array
    const profiles = Array.isArray(profilesResponse.data) 
      ? profilesResponse.data 
      : profilesResponse.data.content || [];
    
    console.log('[MARKETPLACE] Raw profiles from API:', profiles);
    const mapped = profiles.map(profile => 
      mapPublicProfileToFreelanceCard(profile)
    );
    console.log('[MARKETPLACE] Mapped freelance cards:', mapped);
    return mapped;
  }, [profilesResponse]);

  // Filter profiles client-side for sector and city
  const filteredProfiles = useMemo(() => {
    let filtered = apiProfiles;

    if (filters.secteur) {
      filtered = filtered.filter(p => 
        p.skills?.some(s => s.toLowerCase().includes(filters.secteur.toLowerCase()))
      );
    }

    if (filters.ville) {
      filtered = filtered.filter(p => 
        p.ville?.toLowerCase().includes(filters.ville.toLowerCase())
      );
    }

    return filtered;
  }, [apiProfiles, filters.secteur, filters.ville]);

  const visibleFreelances = filteredProfiles.slice(0, visibleCount);

  // Données mockées - Entreprises
  const entreprises = [
    {
      id: 1,
      nom: 'Tech Solutions Africa',
      type: 'Entreprise',
      secteurs: ['Informatique', 'Conseil', 'Formation'],
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechSol',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      note: 4.5,
      isPro: true
    },
    {
      id: 2,
      nom: 'BTP Construct',
      type: 'Entreprise',
      secteurs: ['Bâtiment', 'Travaux', 'Architecture'],
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BTP',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
      note: 4.0,
      isPro: true
    },
    {
      id: 3,
      nom: 'Santé Plus Clinic',
      type: 'Entreprise',
      secteurs: ['Santé', 'Bien-être', 'Pharma'],
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sante',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400',
      note: 4.8,
      isPro: true
    },
    {
      id: 4,
      nom: 'Creative Studio',
      type: 'Entreprise',
      secteurs: ['Design', 'Marketing', 'Communication'],
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Creative',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400',
      note: 3.5,
      isPro: false
    },
    {
      id: 5,
      nom: 'Transport Express',
      type: 'Entreprise',
      secteurs: ['Transport', 'Logistique'],
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Transport',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
      note: 4.2,
      isPro: true
    },
    {
      id: 6,
      nom: 'Agro Services',
      type: 'Entreprise',
      secteurs: ['Agriculture', 'Élevage'],
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Agro',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400',
      note: 4.0,
      isPro: false
    }
  ];

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
  const secteurs = [
    'Tous les secteurs',
    'Bâtiment & Travaux',
    'Électricité & Plomberie',
    'Informatique & Tech',
    'Design & Création',
    'Santé & Bien-être',
    'Éducation & Formation',
    'Commerce & Vente',
    'Transport & Logistique'
  ];

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Filtres appliqués:', filters);
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
          <div className="filter-item search-input">
            <FiSearch className="filter-icon" />
            <input
              type="text"
              name="search"
              placeholder="Recherchez par mot clé..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-item">
            <select
              name="secteur"
              value={filters.secteur}
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
              value={filters.pays}
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
              value={filters.ville}
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
        </form>

        <p className="results-count">
          <strong>{isLoading ? 'Chargement...' : filteredProfiles.length}</strong> résultats trouvés
        </p>
      </section>

      {/* SECTION FREELANCE */}
      <section className="freelance-section">
        <div className="section-header">
          <h2 className="section-title">
            <FiUser className="section-icon" />
            Freelance
          </h2>
          <span className="section-count">
            {isLoading ? 'Chargement...' : `${filteredProfiles.length} Profils`}
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
        ) : filteredProfiles.length === 0 && !error ? (
          <EmptyState
            icon={<FiUsers size={48} />}
            title="Aucun professionnel trouvé"
            description="Essayez de modifier vos critères de recherche ou explorez d'autres catégories."
            action={{
              label: 'Réinitialiser les filtres',
              onClick: () => {
                setFilters({
                  search: '',
                  secteur: '',
                  pays: '',
                  ville: '',
                  categorie: ''
                });
              }
            }}
          />
        ) : error ? (
          <ErrorState
            icon={<FiAlertCircle size={48} />}
            title={parsedError?.title || 'Impossible de charger les profils'}
            description={
              parsedError?.message || 
              getErrorDescription(parsedError?.status) || 
              'Une erreur est survenue. Veuillez réessayer.'
            }
            status={parsedError?.status}
            technicalDetails={
              parsedError?.details?.length 
                ? parsedError.details.join('\n')
                : JSON.stringify(error, null, 2)
            }
            action={{
              label: 'Réessayer',
              onClick: () => window.location.reload()
            }}
          />
        ) : (
          <div className="freelance-grid">
            {visibleFreelances.map((freelance) => (
              <div key={freelance.id} className="freelance-card">
                <div className="card-header" style={{ backgroundColor: COLORS.secondary }}>
                  <span className="badge freelance-badge">Freelance</span>
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
                      <span>{freelance.ville}, {freelance.pays}</span>
                    </div>
                    <div className="info-item">
                      <FiDollarSign style={{ color: COLORS.secondary }} />
                      <span>À partir de : {Math.ceil(freelance.tarifMin).toLocaleString()} {freelance.devise}</span>
                    </div>
                    <div className="info-item">
                      <FiStar style={{ color: '#FFB800' }} />
                      <span>{freelance.note?.toFixed(1) || '0'} ({freelance.projectsCompletes || 0} projets)</span>
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
            ))}
          </div>
        )}

        {!isLoading && filteredProfiles.length > visibleCount && (
          <button 
            className="voir-plus-btn" 
            style={{ borderColor: COLORS.primary, color: COLORS.primary }}
            onClick={() => setVisibleCount(prev => prev + 8)}
          >
            Voir plus de freelances
          </button>
        )}
      </section>

      {/* SECTION ENTREPRISE */}
      <section className="entreprise-section">
        <div className="section-header">
          <h2 className="section-title">
            <FiBriefcase className="section-icon" />
            Entreprise
          </h2>
          <span className="section-count">{entreprises.length * 708} Profils</span>
        </div>

        <div className="entreprise-grid">
          {entreprises.map((entreprise) => (
            <div key={entreprise.id} className="entreprise-card">
              <div className="entreprise-image">
                <img src={entreprise.image} alt={entreprise.nom} />
                <span className="badge entreprise-badge" style={{ backgroundColor: COLORS.primary }}>
                  Entreprise
                </span>
                {entreprise.isPro && (
                  <span className="badge pro-badge" style={{ backgroundColor: COLORS.secondary }}>
                    PRO
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
                <p className="entreprise-type">{entreprise.type}</p>

                <div className="entreprise-secteurs">
                  <FiGrid style={{ color: COLORS.secondary }} />
                  <span>
                    {entreprise.secteurs[0]} 
                    {entreprise.secteurs.length > 1 && ` +${entreprise.secteurs.length - 1} secteurs`}
                  </span>
                </div>

                <div className="entreprise-rating">
                  {renderStars(Math.floor(entreprise.note), false)}
                </div>

                <button 
                  className="visiter-btn"
                  onClick={() => navigate(`/profil/entreprise/${entreprise.id}`)}
                  style={{ borderColor: COLORS.secondary, color: COLORS.secondary }}
                >
                  VISITER
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="voir-plus-btn" style={{ borderColor: COLORS.secondary, color: COLORS.secondary }}>
          Voir plus d'entreprises
        </button>
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

