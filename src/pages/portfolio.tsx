import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiMenu,
  FiX,
  FiUser,
  FiExternalLink,
  FiHeart,
  FiEye
} from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { COLORS } from '../styles/colors';
import logo from '../assets/logo.png';
import './portfolio.css';

function Portfolio() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('tous');

  // Filtres par secteur
  const filtres = [
    { id: 'tous', nom: 'Tous' },
    { id: 'design', nom: 'Design & Création' },
    { id: 'informatique', nom: 'Informatique & Tech' },
    { id: 'batiment', nom: 'Bâtiment & Travaux' },
    { id: 'artisanat', nom: 'Artisanat' },
    { id: 'marketing', nom: 'Marketing' },
    { id: 'evenementiel', nom: 'Événementiel' }
  ];

  // Données des portfolios (à remplacer par données Supabase)
  const portfolios = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      titre: 'Identité visuelle restaurant',
      professionnel: 'Amara Design Studio',
      secteur: 'Design & Création',
      categorie: 'design',
      likes: 124,
      vues: 890
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      titre: 'Application mobile e-commerce',
      professionnel: 'TechLab Abidjan',
      secteur: 'Informatique & Tech',
      categorie: 'informatique',
      likes: 89,
      vues: 654
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
      titre: 'Villa moderne Cocody',
      professionnel: 'Archi+ Côte d\'Ivoire',
      secteur: 'Bâtiment & Travaux',
      categorie: 'batiment',
      likes: 256,
      vues: 1420
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      titre: 'Collection bijoux traditionnels',
      professionnel: 'Fatou Créations',
      secteur: 'Artisanat',
      categorie: 'artisanat',
      likes: 312,
      vues: 2100
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800',
      titre: 'Campagne digitale MTN',
      professionnel: 'Digital Wave Agency',
      secteur: 'Marketing',
      categorie: 'marketing',
      likes: 178,
      vues: 1230
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800',
      titre: 'Mariage VIP Grand-Bassam',
      professionnel: 'Events Plus CI',
      secteur: 'Événementiel',
      categorie: 'evenementiel',
      likes: 445,
      vues: 3200
    },
    {
      id: 7,
      image: 'https://images.unsplash.com/photo-1561070791-36c11767b26a?w=800',
      titre: 'Branding startup fintech',
      professionnel: 'Kofi Graphics',
      secteur: 'Design & Création',
      categorie: 'design',
      likes: 98,
      vues: 720
    },
    {
      id: 8,
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      titre: 'Plateforme gestion RH',
      professionnel: 'DevMasters',
      secteur: 'Informatique & Tech',
      categorie: 'informatique',
      likes: 156,
      vues: 980
    },
    {
      id: 9,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      titre: 'Rénovation appartement',
      professionnel: 'BatiPro Services',
      secteur: 'Bâtiment & Travaux',
      categorie: 'batiment',
      likes: 201,
      vues: 1560
    },
    {
      id: 10,
      image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800',
      titre: 'Robes sur mesure',
      professionnel: 'Aisha Couture',
      secteur: 'Artisanat',
      categorie: 'artisanat',
      likes: 387,
      vues: 2800
    },
    {
      id: 11,
      image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800',
      titre: 'Lancement produit cosmétique',
      professionnel: 'Brand Boost Africa',
      secteur: 'Marketing',
      categorie: 'marketing',
      likes: 134,
      vues: 890
    },
    {
      id: 12,
      image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      titre: 'Séminaire entreprise 500 personnes',
      professionnel: 'Mega Events',
      secteur: 'Événementiel',
      categorie: 'evenementiel',
      likes: 267,
      vues: 1890
    }
  ];

  // Filtrer les portfolios
  const portfoliosFiltres = selectedFilter === 'tous' 
    ? portfolios 
    : portfolios.filter(p => p.categorie === selectedFilter);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handlePortfolioClick = (portfolioId) => {
    navigate(`/portfolio/${portfolioId}`);
  };

  return (
    <div className="portfolio-container">
      {/* Header / Navigation */}
      <header className="navbar-portfolio">
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
              className="nav-item active"
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
              onClick={() => navigate('/connexion')}
            >
              <FiUser />
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
          <a 
            href="/decouverte" 
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
            className="active"
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
            onClick={() => { navigate('/connexion'); closeMenu(); }}
          >
            Connexion
          </button>
        </nav>
      </div>

      {/* Overlay */}
      {menuOpen && <div className="sidebar-overlay" onClick={closeMenu}></div>}

      {/* Contenu principal */}
      <main className="main-portfolio">
        {/* Titre de la page */}
        <div className="portfolio-header">
          <h1 className="portfolio-title">
            <span style={{ color: COLORS.secondary }}>Découvrez le</span>{' '}
            <span style={{ color: COLORS.primary }}>savoir-faire</span>{' '}
            <span style={{ color: COLORS.secondary }}>de nos talents</span>
          </h1>
          <p className="portfolio-subtitle">
            Explorez les réalisations de nos professionnels et trouvez l'inspiration pour vos projets
          </p>
        </div>

        {/* Filtres */}
        <div className="portfolio-filters">
          {filtres.map((filtre) => (
            <button
              key={filtre.id}
              className={`filter-btn ${selectedFilter === filtre.id ? 'active' : ''}`}
              onClick={() => setSelectedFilter(filtre.id)}
            >
              {filtre.nom}
            </button>
          ))}
        </div>

        {/* Grille Pinterest/Masonry */}
        <div className="portfolio-masonry">
          {portfoliosFiltres.map((portfolio, index) => (
            <div
              key={portfolio.id}
              className={`portfolio-card portfolio-card-${(index % 3) + 1}`}
              onClick={() => handlePortfolioClick(portfolio.id)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handlePortfolioClick(portfolio.id);
              }}
            >
              <div className="portfolio-image-wrapper">
                <img 
                  src={portfolio.image} 
                  alt={portfolio.titre}
                  className="portfolio-image"
                  loading="lazy"
                />
                <div className="portfolio-overlay">
                  <button className="overlay-btn">
                    <FiExternalLink />
                    Voir le projet
                  </button>
                </div>
              </div>
              
              <div className="portfolio-info">
                <h3 className="portfolio-projet-titre">{portfolio.titre}</h3>
                <div className="portfolio-professionnel">
                  <div className="professionnel-avatar">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${portfolio.professionnel}`}
                      alt={portfolio.professionnel}
                    />
                  </div>
                  <div className="professionnel-details">
                    <span className="professionnel-nom">{portfolio.professionnel}</span>
                    <span className="professionnel-secteur">{portfolio.secteur}</span>
                  </div>
                </div>
                <div className="portfolio-stats">
                  <span className="stat">
                    <FiHeart /> {portfolio.likes}
                  </span>
                  <span className="stat">
                    <FiEye /> {portfolio.vues}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="portfolio-cta">
          <p className="cta-text">Vous êtes un professionnel ? Montrez votre travail !</p>
          <button 
            className="cta-button"
            style={{ backgroundColor: COLORS.primary }}
            onClick={() => navigate('/connexion')}
          >
            Ajouter mon portfolio
          </button>
        </div>
      </main>

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

export default Portfolio;