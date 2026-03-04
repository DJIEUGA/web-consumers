import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiZap, 
  FiMonitor, 
  FiPenTool, 
  FiHeart,
  FiBookOpen,
  FiShoppingCart,
  FiTruck,
  FiTrendingUp,
  FiScissors,
  FiFileText,
  FiTrendingUp as FiMarketing,
  FiDollarSign,
  FiCalendar,
  FiCoffee,
  FiTool,
  FiMenu,
  FiX,
  FiSearch,
  FiUsers,
  FiMapPin,
  FiBriefcase,
  FiBell,
  FiStar,
  FiUser,
  FiFacebook,
  FiInstagram,
  FiActivity,
  FiFeather,
  FiDroplet,
  FiCpu,
  FiMusic,
  FiVideo,
} from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import mapboxgl from 'mapbox-gl';
import { COLORS } from '../../../../styles/colors';
import Logo from '@/components/shared/Logo';
import { useAuthStore } from '../../../../stores/auth.store';
import { resolveAvatarUrl } from '@/utils/avatar';
import '../../styles/decouverte/style.css';

export const Decouverte = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authUser = useAuthStore((state) => state.user);
  const getDashboardRoute = useAuthStore((state) => state.getDashboardRoute);
  const [menuOpen, setMenuOpen] = useState(false);
  const authShortcutLabel = isAuthenticated ? 'Dashboard' : 'Connexion';
  const authShortcutRoute = isAuthenticated ? getDashboardRoute() : '/connexion';
  const authAvatarUrl = resolveAvatarUrl(authUser);

  const goToAuthShortcut = () => {
    navigate(authShortcutRoute, {
      state: !isAuthenticated ? { from: '/decouverte' } : undefined,
    });
  };
  const mapContainer = useRef(null);
  const map = useRef(null);

  // Liste des secteurs d'activité
  const secteurs = [
    {
      id: 'batiment',
      nom: 'Bâtiment & Travaux',
      icon: FiHome,
      description: 'Maçons, menuisiers, peintres...'
    },
    {
      id: 'electricite',
      nom: 'Électricité',
      icon: FiZap,
      description: 'Électriciens, domotique, réseaux électriques...'
    },
    {
      id: 'informatique',
      nom: 'Informatique & Tech',
      icon: FiMonitor,
      description: 'Développeurs, techniciens, réseaux...'
    },
    {
      id: 'design',
      nom: 'Design & Création',
      icon: FiPenTool,
      description: 'Graphistes, designers, illustrateurs...'
    },
    {
      id: 'sante',
      nom: 'Santé ',
      icon: FiHeart,
      description: 'Infirmiers, kinés, esthétique...'
    },
    {
      id: 'education',
      nom: 'Éducation & Formation',
      icon: FiBookOpen,
      description: 'Professeurs, formateurs, coachs...'
    },
    {
      id: 'commerce',
      nom: 'Commerce & Vente',
      icon: FiShoppingCart,
      description: 'Vendeurs, commerciaux, e-commerce...'
    },
    {
      id: 'transport',
      nom: 'Transport & Logistique',
      icon: FiTruck,
      description: 'Chauffeurs, livreurs, logisticiens...'
    },
    {
      id: 'agriculture',
      nom: 'Agriculture',
      icon: FiFeather,
      description: 'Agronomes, éleveurs, pêcheurs...'
    },
    {
      id: 'artisanat',
      nom: 'Artisanat',
      icon: FiScissors,
      description: 'Couturiers, bijoutiers, potiers...'
    },
    {
      id: 'juridique',
      nom: 'Juridique & Administratif',
      icon: FiFileText,
      description: 'Avocats, notaires, assistants...'
    },
    {
      id: 'marketing',
      nom: 'Marketing & Communication',
      icon: FiMarketing,
      description: 'Community managers, publicitaires...'
    },
    {
      id: 'finance',
      nom: 'Finance & Comptabilité',
      icon: FiDollarSign,
      description: 'Comptables, auditeurs, fiscalistes...'
    },
    {
      id: 'evenementiel',
      nom: 'Événementiel',
      icon: FiCalendar,
      description: 'Organisateurs, animateurs, DJ...'
    },
    {
      id: 'restauration',
      nom: 'Restauration',
      icon: FiCoffee,
      description: 'Cuisiniers, traiteurs, pâtissiers...'
    },
    {
      id: 'mecanique',
      nom: 'Mécanique & Automobile',
      icon: FiTool,
      description: 'Mécaniciens, garagistes, carrossiers...'
    },

    {
  id: 'beaute',
  nom: 'Beauté & Bien-être',
  icon: HiOutlineSparkles,
  description: 'Coiffeurs, esthéticiennes, masseurs...'
},

{
  id: 'sport',
  nom: 'Sport & Fitness',
  icon: FiActivity,
  description: 'Coachs sportifs, préparateurs physiques...'
},

{
  id: 'plomberie',
  nom: 'Plomberie & Chauffage',
  icon: FiDroplet,
  description: 'Plombiers, chauffagistes, climatisation...'
},

{
  id: 'intelligence-artificielle',
  nom: 'Intelligence Artificielle',
  icon: FiCpu,
  description: 'IA, Machine Learning, Data Science...'
},

{
  id: 'sons-musique',
  nom: 'Sons & Musique',
  icon: FiMusic,
  description: 'Musiciens, beatmakers, ingénieurs son...'
},

{
  id: 'video',
  nom: 'Vidéo & Audiovisuel',
  icon: FiVideo,
  description: 'Vidéastes, monteurs, réalisateurs...'
}
    
  ];

  // Liste des services
  const services = [
    {
      id: 'decouverte',
      nom: 'DÉCOUVERTE',
      icon: FiSearch,
      description: 'Explorez un catalogue riche et diversifié de professionnels issus de multiples secteurs d\'activité, en Afrique et au-delà.'
    },
    {
      id: 'marketplace',
      nom: 'MARKETPLACE',
      icon: FiUsers,
      description: 'Accédez à un vaste réseau de freelances et d\'entreprises spécialisées, prêts à mettre leur expertise au service de vos projets.'
    },
    {
      id: 'localisation',
      nom: 'LOCALISATION',
      icon: FiMapPin,
      description: 'Localisez en temps réel les institutions et lieux essentiels autour de vous : restaurants, pharmacies, hôpitaux, garages, agences, etc.'
    },
    {
      id: 'portfolio',
      nom: 'PORTFOLIO',
      icon: FiBriefcase,
      description: 'Découvrez le savoir-faire de nos professionnels à travers des projets concrets, et trouvez de vraies raisons de les choisir.'
    },
    {
      id: 'jobty-alerte',
      nom: 'JOBTY ALERTE',
      icon: FiBell,
      description: 'Recevez l\'assistance immédiat d\'un professionnel qualifié, à tout moment et où que vous soyez. 24h/24 et 7j/7'
    },
    {
      id: 'job-xperience',
      nom: 'JOB XPERIENCE',
      icon: FiBriefcase,
      description: 'Démarrez et construisez votre carrière professionnelle ici en trouvant le poste idéal auprès de nos professionnels'
    }
  ];

  const handleSecteurClick = (secteurId) => {
    navigate(`/marketplace?secteur=${secteurId}`);
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Initialize Mapbox map for discovery (uses placeholder token for demo)
  useEffect(() => {
    if (map.current) return;
    
    // For production, replace with your actual Mapbox token
    mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjazA0eWRpNjAwMDAwMnFwb2R1YWptdDAwIn0.demo';
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [-4.0, 5.3],
        zoom: 6,
        pitch: 0
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl());

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl());

      // Example markers for African locations (Abidjan area)
      const locations = [
        { name: 'Abidjan - Tech Hub', lng: -4.0219, lat: 5.3197 },
        { name: 'Marketplace Center', lng: -3.9836, lat: 5.3089 },
        { name: 'Innovation District', lng: -4.0155, lat: 5.3267 }
      ];

      locations.forEach((location) => {
        const marker = document.createElement('div');
        marker.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234f46e5' width='32' height='32'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'/%3E%3C/svg%3E")`;
        marker.style.backgroundSize = 'contain';
        marker.style.width = '32px';
        marker.style.height = '32px';
        marker.style.cursor = 'pointer';

        new mapboxgl.Marker(marker)
          .setLngLat([location.lng, location.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(location.name))
          .addTo(map.current);
      });
    } catch (error) {
      console.warn('Mapbox initialization failed (token may be placeholder):', error);
    }

    return () => {
      // Cleanup on unmount if needed
    };
  }, []);

  return (
    <div className="decouverte-container">
      {/* Header / Navigation */}
      <header className="navbar-decouverte">
        <div className="header-content">
          <div 
            onClick={() => navigate('/')}
          >
            <Logo alt="Jobty" style={{width: '140px'}} />
          </div>

          {/* Navigation Desktop */}
          <nav className="header-nav desktop-nav">
            <a 
              href="/decouverte" 
              className="nav-item active"
              onClick={(e) => { e.preventDefault(); navigate('/decouverte'); }}
            >
              Découverte
            </a>
            <a 
              href="/marketplace" 
              className="nav-item"
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
              Job Alert
            </a>
            <a 
              href="/job-experience" 
              className="nav-item"
              onClick={(e) => { e.preventDefault(); navigate('/job-experience'); }}
            >
              Job Expérience
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

      {/* Menu burger latéral pour mobile */}
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
          <a 
            href="/decouverte" 
            className="active" 
            onClick={(e) => { e.preventDefault(); navigate('/decouverte'); closeMenu(); }}
          >
            Découverte
          </a>
          <a 
            href="/marketplace" 
            onClick={(e) => { e.preventDefault(); navigate('/marketplace'); closeMenu(); }}
          >
            Marketplace
          </a>
          <a 
            href="/portfolio" 
            onClick={(e) => { e.preventDefault(); navigate('/portfolio'); closeMenu(); }}
          >
            Portfolio
          </a>
          <a 
            href="/localisation" 
            onClick={(e) => { e.preventDefault(); navigate('/localisation'); closeMenu(); }}
          >
            Localisation
          </a>
          <a 
            href="/job-alerte" 
            onClick={(e) => { e.preventDefault(); navigate('/job-alerte'); closeMenu(); }}
          >
            Job Alert
          </a>
          <a 
            href="/job-experience" 
            onClick={(e) => { e.preventDefault(); navigate('/job-experience'); closeMenu(); }}
          >
            Job Expérience
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

      {/* Contenu principal */}
      <main className="main-decouverte">
        {/* Titre de la page */}
        <div className="decouverte-header">
          <h1 className="decouverte-title">
            <span style={{ color: COLORS.secondary }}>Explorez nos</span>{' '}
            <span style={{ color: COLORS.primary }}>secteurs d'activité</span>
          </h1>
          <p className="decouverte-subtitle">
            Trouvez le professionnel qu'il vous faut parmi plus de 16 domaines de compétences
          </p>
        </div>

        {/* Grille des secteurs */}
        <div className="secteurs-grid">
          {secteurs.map((secteur) => {
            const IconComponent = secteur.icon;
            return (
              <div
                key={secteur.id}
                className="secteur-card"
                onClick={() => handleSecteurClick(secteur.id)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSecteurClick(secteur.id);
                }}
              >
                <div className="secteur-icon-wrapper">
                  <IconComponent 
                    className="secteur-icon" 
                    style={{ color: COLORS.primary }}
                  />
                </div>
                <h3 className="secteur-nom">{secteur.nom}</h3>
                <p className="secteur-description">{secteur.description}</p>
              </div>
            );
          })}
        </div>

        {/* Call to action */}
        <div className="decouverte-cta">
          <p className="cta-text">Vous ne trouvez pas votre secteur ?</p>
          <button 
            className="cta-button"
            style={{ backgroundColor: COLORS.primary }}
            onClick={() => navigate('/marketplace')}
          >
            Voir tous les professionnels
          </button>
        </div>

        {/* Mapbox Discovery Map */}
        <div className="decouverte-map-section">
          <div className="decouverte-map-header">
            <h2>Découvrez nos professionnels en Afrique</h2>
            <p>Localisez les meilleurs talents et services dans votre région</p>
          </div>
          <div className="decouverte-map-container" ref={mapContainer} style={{ height: '500px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
        </div>
      </main>

      {/* SECTION TÉMOIGNAGES */}
      <section className="temoignages-section">
        <div className="temoignages-container">
          {/* Ligne décorative turquoise */}
          <div className="decorative-line" style={{ backgroundColor: COLORS.primary }}></div>

          {/* Photos de profil chevauchées avec avatars locaux */}
          <div className="profiles-row">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num, index) => (
              <div 
                key={index} 
                className="profile-avatar"
                style={{ 
                  backgroundImage: `url('/images/avatars/avatar${num}.jpg')`,
                  zIndex: 10 - index
                }}
                title={`Avatar ${num}`}
              >
              </div>
            ))}
          </div>

          {/* Étoiles */}
          <div className="stars-rating">
            <FiStar className="star filled" />
            <FiStar className="star filled" />
            <FiStar className="star filled" />
            <FiStar className="star filled" />
            <FiStar className="star half-filled" />
          </div>

          {/* Texte témoignage */}
          <p className="temoignage-text">
            Noté par nos utilisateurs meilleure plateforme<br />
            de mise en relation professionnelle
          </p>

          {/* Bouton CTA */}
          <button 
            className="jobeur-button"
            style={{ backgroundColor: COLORS.primary }}
            onClick={goToAuthShortcut}
          >
            Devenir jobeur maintenant
          </button>
        </div>
      </section>

      {/* SECTION SERVICES */}
      <section className="services-section">
        <div className="services-container">
          <div className="services-grid">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <div key={service.id} className="service-card">
                  <div 
                    className="service-icon-circle"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    <IconComponent className="service-icon" />
                  </div>
                  <h3 className="service-title">{service.nom}</h3>
                  <p className="service-description">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NOUVEAU FOOTER */}
      <footer className="footer-decouverte">
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
              <FiFacebook />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FiInstagram />
            </a>
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaWhatsapp />
            </a>
          </div>

          {/* Copyright */}
          <p className="footer-copyright">© 2025 Jobty - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}

