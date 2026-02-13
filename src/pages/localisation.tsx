import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiMapPin, 
  FiPhone,
  FiClock,
  FiX,
  FiMenu,
  FiStar,
  FiNavigation,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiHeart,
  FiShare2
} from 'react-icons/fi';
import { 
  FaHospital, 
  FaUtensils, 
  FaCar, 
  FaGasPump,
  FaHotel,
  FaShoppingCart,
  FaUniversity,
  FaPills,
  FaFacebookF, 
  FaInstagram, 
  FaWhatsapp 
} from 'react-icons/fa';
import { COLORS } from '../styles/colors';
import logo from '../assets/logo.png';
import './localisation.css';

function Localisation() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const suggestionsRef = useRef(null);

  // Catégories de lieux
  const categories = [
    { id: 'tous', nom: 'Tous', icon: FiMapPin, color: COLORS.primary },
    { id: 'pharmacie', nom: 'Pharmacies', icon: FaPills, color: '#28a745' },
    { id: 'sante', nom: 'Centres de santé', icon: FaHospital, color: '#dc3545' },
    { id: 'restaurant', nom: 'Restaurants', icon: FaUtensils, color: '#fd7e14' },
    { id: 'garage', nom: 'Garages', icon: FaCar, color: '#6c757d' },
    { id: 'station', nom: 'Stations-service', icon: FaGasPump, color: '#17a2b8' },
    { id: 'hotel', nom: 'Hôtels', icon: FaHotel, color: '#6852A3' },
    { id: 'supermarche', nom: 'Supermarchés', icon: FaShoppingCart, color: '#ffc107' },
    { id: 'banque', nom: 'Banques', icon: FaUniversity, color: '#343a40' }
  ];

  // Données mockées des lieux (gardé identique)
  const lieux = [
    {
      id: 1,
      nom: 'Pharmacie du Plateau',
      categorie: 'pharmacie',
      adresse: 'Avenue Franchet d\'Esperey, Plateau',
      ville: 'Abidjan',
      pays: 'Côte d\'Ivoire',
      telephone: '+225 27 20 21 34 56',
      horaires: '7h00 - 22h00',
      ouvert24h: false,
      note: 4.5,
      avis: 128,
      image: 'https://images.unsplash.com/photo-1586015555751-63c29b4f4c0b?w=400',
      services: ['Médicaments', 'Parapharmacie', 'Conseil santé', 'Livraison'],
      lat: 5.3197,
      lng: -4.0219,
      distance: 0.5
    },
    {
      id: 2,
      nom: 'Clinique Sainte Marie',
      categorie: 'sante',
      adresse: 'Boulevard de Marseille, Marcory',
      ville: 'Abidjan',
      pays: 'Côte d\'Ivoire',
      telephone: '+225 27 21 25 67 89',
      horaires: '24h/24',
      ouvert24h: true,
      note: 4.8,
      avis: 256,
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400',
      services: ['Urgences', 'Consultations', 'Radiologie', 'Laboratoire', 'Maternité'],
      lat: 5.3089,
      lng: -3.9836,
      distance: 1.2
    },
    // ... (gardez tous les autres lieux)
  ];

  // Suggestions de lieux populaires
  const suggestionsPopulaires = lieux
    .sort((a, b) => b.note - a.note)
    .slice(0, 6);

  // Filtrer les lieux
  const lieuxFiltres = lieux.filter(lieu => {
    const matchCategory = selectedCategory === 'tous' || lieu.categorie === selectedCategory;
    const matchSearch = lieu.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       lieu.adresse.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       lieu.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // Géolocalisation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Géolocalisation non disponible:', error);
        }
      );
    }
  }, []);

  // Scroll horizontal pour suggestions
  const scrollSuggestions = (direction) => {
    if (suggestionsRef.current) {
      const scrollAmount = 300;
      suggestionsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Obtenir l'icône de la catégorie
  const getCategoryIcon = (categorieId) => {
    const cat = categories.find(c => c.id === categorieId);
    return cat ? cat.icon : FiMapPin;
  };

  const getCategoryColor = (categorieId) => {
    const cat = categories.find(c => c.id === categorieId);
    return cat ? cat.color : COLORS.primary;
  };

  // Gestion des favoris
  const toggleFavorite = (lieuId) => {
    if (favorites.includes(lieuId)) {
      setFavorites(favorites.filter(id => id !== lieuId));
    } else {
      setFavorites([...favorites, lieuId]);
    }
  };

  // Ouvrir le popup de détails
  const openPlaceDetails = (lieu) => {
    setSelectedPlace(lieu);
    setShowPopup(true);
  };

  // Fermer le popup
  const closePopup = () => {
    setShowPopup(false);
    setSelectedPlace(null);
  };

  // Rendu des étoiles
  const renderStars = (note) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar 
          key={i} 
          className={`star ${i <= note ? 'filled' : ''}`}
          style={{ 
            fill: i <= note ? '#FFD700' : 'none',
            color: i <= note ? '#FFD700' : '#ddd'
          }}
        />
      );
    }
    return stars;
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="localisation-container">
      {/* HEADER / NAVIGATION */}
      <header className="marketplace-header">
        <div className="header-content">
          <div 
            className="header-logo"
            onClick={() => navigate('/')}
          >
            <img src={logo} alt="Jobty" />
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
              className="nav-item active"
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
              onClick={() => navigate('/connexion')}
            >
              <FiUser />
              <span className="notification-badge">0</span>
            </div>

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
          <img src={logo} alt="Jobty" className="sidebar-logo" />
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
          <a href="/marketplace" onClick={(e) => { e.preventDefault(); navigate('/marketplace'); closeMenu(); }}>
            Marketplace
          </a>
          <a href="/portfolio" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); closeMenu(); }}>
            Portfolio
          </a>
          <a href="/localisation" className="active" onClick={(e) => { e.preventDefault(); navigate('/localisation'); closeMenu(); }}>
            Localisation
          </a>
          <a href="/job-alerte" onClick={(e) => { e.preventDefault(); navigate('/job-alerte'); closeMenu(); }}>
            Job alerte
          </a>
          <a href="/job-experience" onClick={(e) => { e.preventDefault(); navigate('/job-experience'); closeMenu(); }}>
            Job expérience
          </a>
          <button 
            className="sidebar-connexion-btn"
            onClick={() => { navigate('/connexion'); closeMenu(); }}
          >
            Connexion
          </button>
        </nav>
      </div>

      {/* Overlay */}
      {menuOpen && <div className="sidebar-overlay" onClick={closeMenu}></div>}

      {/* SECTION HERO */}
      <section className="localisation-hero">
        <h1 className="hero-title">
          Trouvez les lieux utiles
        </h1>
        <p className="hero-subtitle">
          Pharmacies, hôpitaux, restaurants, garages et plus encore à portée de main
        </p>

        {/* Barre de recherche principale */}
        <div className="localisation-search-bar-container">
          <div className="localisation-search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher un lieu, un service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="localisation-clear-search" onClick={() => setSearchQuery('')}>
                <FiX />
              </button>
            )}
          </div>
          <button className="localisation-locate-me-btn" style={{ backgroundColor: COLORS.primary }}>
            <FiNavigation />
            <span>Me localiser</span>
          </button>
        </div>
      </section>

      {/* FILTRES PAR CATÉGORIE */}
      <section className="localisation-categories-section">
        <div className="localisation-categories-scroll">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.id}
                className={`localisation-category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  '--category-color': cat.color,
                  borderColor: selectedCategory === cat.id ? cat.color : 'transparent',
                  backgroundColor: selectedCategory === cat.id ? `${cat.color}15` : 'white'
                }}
              >
                <IconComponent className="localisation-category-icon" style={{ color: cat.color }} />
                <span>{cat.nom}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* CARTE INTERACTIVE */}
      <section className="localisation-map-section">
        <div className="localisation-map-container">
          {/* Simulation de carte */}
          <div className="localisation-map-placeholder">
            <div className="localisation-map-background">
              {/* Points sur la carte */}
              {lieuxFiltres.map((lieu) => {
                const IconComponent = getCategoryIcon(lieu.categorie);
                return (
                  <button
                    key={lieu.id}
                    className={`localisation-map-marker ${selectedPlace?.id === lieu.id ? 'active' : ''}`}
                    style={{
                      left: `${(lieu.lng + 4.1) * 500}%`,
                      top: `${(5.4 - lieu.lat) * 500}%`,
                      '--marker-color': getCategoryColor(lieu.categorie)
                    }}
                    onClick={() => openPlaceDetails(lieu)}
                  >
                    <IconComponent />
                  </button>
                );
              })}
              
              {/* Position utilisateur */}
              {userLocation && (
                <div className="localisation-user-marker">
                  <div className="localisation-user-marker-pulse"></div>
                  <div className="localisation-user-marker-dot"></div>
                </div>
              )}
            </div>

            {/* Overlay d'information */}
            <div className="localisation-map-info-overlay">
              <FiMapPin />
              <span>Carte interactive - {lieuxFiltres.length} lieux trouvés</span>
            </div>

            {/* Contrôles de la carte */}
            <div className="localisation-map-controls">
              <button className="localisation-map-control-btn">+</button>
              <button className="localisation-map-control-btn">−</button>
            </div>
          </div>

          {/* Liste des lieux (sidebar) */}
          <div className="localisation-places-sidebar">
            <div className="localisation-sidebar-title">
              <h3>Lieux à proximité</h3>
              <span className="localisation-places-count">{lieuxFiltres.length} résultats</span>
            </div>

            <div className="localisation-places-list">
              {lieuxFiltres.map((lieu) => {
                const IconComponent = getCategoryIcon(lieu.categorie);
                return (
                  <div
                    key={lieu.id}
                    className={`localisation-place-card ${selectedPlace?.id === lieu.id ? 'active' : ''}`}
                    onClick={() => openPlaceDetails(lieu)}
                  >
                    <div className="localisation-place-image">
                      <img src={lieu.image} alt={lieu.nom} />
                      <span 
                        className="localisation-place-category-badge"
                        style={{ backgroundColor: getCategoryColor(lieu.categorie) }}
                      >
                        <IconComponent />
                      </span>
                      {lieu.ouvert24h && (
                        <span className="localisation-badge-24h">24h/24</span>
                      )}
                    </div>
                    <div className="localisation-place-info">
                      <h4 className="localisation-place-name">{lieu.nom}</h4>
                      <p className="localisation-place-address">
                        <FiMapPin /> {lieu.adresse}
                      </p>
                      <div className="localisation-place-meta">
                        <div className="localisation-place-rating">
                          <FiStar style={{ fill: '#FFD700', color: '#FFD700' }} />
                          <span>{lieu.note}</span>
                          <span className="localisation-avis-count">({lieu.avis} avis)</span>
                        </div>
                        <span className="localisation-place-distance">{lieu.distance} km</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SUGGESTIONS POPULAIRES */}
      <section className="localisation-suggestions-section">
        <div className="localisation-section-header">
          <h2 className="localisation-section-title">
            <FiStar className="localisation-section-icon" style={{ color: COLORS.primary }} />
            Lieux populaires à visiter
          </h2>
          <div className="localisation-scroll-controls">
            <button 
              className="localisation-scroll-btn"
              onClick={() => scrollSuggestions('left')}
            >
              <FiChevronLeft />
            </button>
            <button 
              className="localisation-scroll-btn"
              onClick={() => scrollSuggestions('right')}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>

        <div className="localisation-suggestions-scroll" ref={suggestionsRef}>
          {suggestionsPopulaires.map((lieu) => {
            const IconComponent = getCategoryIcon(lieu.categorie);
            return (
              <div 
                key={lieu.id}
                className="localisation-suggestion-card"
                onClick={() => openPlaceDetails(lieu)}
              >
                <div className="localisation-suggestion-image">
                  <img src={lieu.image} alt={lieu.nom} />
                  <button 
                    className={`localisation-favorite-btn ${favorites.includes(lieu.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(lieu.id);
                    }}
                  >
                    <FiHeart />
                  </button>
                  <span 
                    className="localisation-suggestion-category"
                    style={{ backgroundColor: getCategoryColor(lieu.categorie) }}
                  >
                    <IconComponent /> {categories.find(c => c.id === lieu.categorie)?.nom}
                  </span>
                </div>
                <div className="localisation-suggestion-content">
                  <h4>{lieu.nom}</h4>
                  <p className="localisation-suggestion-address">
                    <FiMapPin /> {lieu.ville}
                  </p>
                  <div className="localisation-suggestion-footer">
                    <div className="localisation-suggestion-rating">
                      {renderStars(Math.floor(lieu.note))}
                      <span>({lieu.avis})</span>
                    </div>
                    <span className="localisation-suggestion-distance">{lieu.distance} km</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* POPUP DE DÉTAILS */}
      {showPopup && selectedPlace && (
        <>
          <div className="localisation-popup-overlay" onClick={closePopup}></div>
          <div className="localisation-place-popup">
            <button className="localisation-popup-close" onClick={closePopup}>
              <FiX />
            </button>

            <div className="localisation-popup-image">
              <img src={selectedPlace.image} alt={selectedPlace.nom} />
              <div className="localisation-popup-actions">
                <button 
                  className={`localisation-action-btn ${favorites.includes(selectedPlace.id) ? 'active' : ''}`}
                  onClick={() => toggleFavorite(selectedPlace.id)}
                >
                  <FiHeart />
                </button>
                <button className="localisation-action-btn">
                  <FiShare2 />
                </button>
              </div>
              {selectedPlace.ouvert24h && (
                <span className="localisation-popup-badge-24h">Ouvert 24h/24</span>
              )}
            </div>

            <div className="localisation-popup-content">
              <div className="localisation-popup-header">
                <span 
                  className="localisation-popup-category-tag"
                  style={{ backgroundColor: getCategoryColor(selectedPlace.categorie) }}
                >
                  {categories.find(c => c.id === selectedPlace.categorie)?.nom}
                </span>
                <div className="localisation-popup-rating">
                  {renderStars(Math.floor(selectedPlace.note))}
                  <span>{selectedPlace.note} ({selectedPlace.avis} avis)</span>
                </div>
              </div>

              <h2 className="localisation-popup-title">{selectedPlace.nom}</h2>

              <div className="localisation-popup-info-list">
                <div className="localisation-popup-info-item">
                  <FiMapPin className="localisation-info-icon" style={{ color: COLORS.secondary }} />
                  <div>
                    <span className="localisation-info-label">Adresse</span>
                    <span className="localisation-info-value">{selectedPlace.adresse}, {selectedPlace.ville}</span>
                  </div>
                </div>

                <div className="localisation-popup-info-item">
                  <FiPhone className="localisation-info-icon" style={{ color: COLORS.primary }} />
                  <div>
                    <span className="localisation-info-label">Téléphone</span>
                    <a href={`tel:${selectedPlace.telephone}`} className="localisation-info-value localisation-phone-link">
                      {selectedPlace.telephone}
                    </a>
                  </div>
                </div>

                <div className="localisation-popup-info-item">
                  <FiClock className="localisation-info-icon" style={{ color: '#28a745' }} />
                  <div>
                    <span className="localisation-info-label">Horaires</span>
                    <span className="localisation-info-value">{selectedPlace.horaires}</span>
                  </div>
                </div>

                <div className="localisation-popup-info-item">
                  <FiNavigation className="localisation-info-icon" style={{ color: '#fd7e14' }} />
                  <div>
                    <span className="localisation-info-label">Distance</span>
                    <span className="localisation-info-value">{selectedPlace.distance} km de vous</span>
                  </div>
                </div>
              </div>

              <div className="localisation-popup-services">
                <h4>Services proposés</h4>
                <div className="localisation-services-tags">
                  {selectedPlace.services.map((service, index) => (
                    <span key={index} className="localisation-service-tag">{service}</span>
                  ))}
                </div>
              </div>

              <div className="localisation-popup-buttons">
                <a 
                  href={`tel:${selectedPlace.telephone}`}
                  className="localisation-popup-btn primary"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  <FiPhone /> Appeler
                </a>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.lat},${selectedPlace.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="localisation-popup-btn secondary"
                  style={{ borderColor: COLORS.secondary, color: COLORS.secondary }}
                >
                  <FiExternalLink /> Itinéraire
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {/* FOOTER */}
      <footer className="marketplace-footer">
        <div className="footer-content">
          <div className="footer-column">
            <h4 className="footer-column-title">Navigation</h4>
            <ul className="footer-links">
              <li><a href="/decouverte" onClick={(e) => { e.preventDefault(); navigate('/decouverte'); }}>Découvrir</a></li>
              <li><a href="/marketplace" onClick={(e) => { e.preventDefault(); navigate('/marketplace'); }}>Marketplace</a></li>
              <li><a href="/portfolio" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); }}>Portfolio</a></li>
              <li><a href="/localisation" onClick={(e) => { e.preventDefault(); navigate('/localisation'); }}>Localisation</a></li>
              <li><a href="/job-alerte" onClick={(e) => { e.preventDefault(); navigate('/job-alerte'); }}>Job alerte</a></li>
              <li><a href="/job-experience" onClick={(e) => { e.preventDefault(); navigate('/job-experience'); }}>Job expérience</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title">À propos</h4>
            <ul className="footer-links">
              <li><a href="/comment-ca-marche" onClick={(e) => { e.preventDefault(); navigate('/comment-ca-marche'); }}>Comment ça marche</a></li>
              <li><a href="/devenir-jobeur" onClick={(e) => { e.preventDefault(); navigate('/devenir-jobeur'); }}>Devenir Jobeur</a></li>
              <li><a href="/nous-joindre" onClick={(e) => { e.preventDefault(); navigate('/nous-joindre'); }}>Nous Joindre</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-column-title">Légal</h4>
            <ul className="footer-links">
              <li><a href="/blog" onClick={(e) => { e.preventDefault(); navigate('/blog'); }}>Blog</a></li>
              <li><a href="/conditions" onClick={(e) => { e.preventDefault(); navigate('/conditions'); }}>Conditions d'utilisation</a></li>
              <li><a href="/parametres" onClick={(e) => { e.preventDefault(); navigate('/parametres'); }}>Paramètres</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
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
          <p className="footer-copyright">© 2024 Jobty - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}

export default Localisation;