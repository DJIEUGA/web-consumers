import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FiSearch, FiChevronDown, FiMapPin, FiStar, FiCheckCircle,
  FiMenu, FiX, FiUser, FiFilter, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import logo from '../assets/logo.png';
import './searchResults.css';

function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    secteur: '',
    pays: '',
    ville: '',
    type: '' // freelance ou entreprise
  });

  // Données de résultats mockées
  const results = [
    {
      id: 1,
      type: 'freelance',
      nom: 'Aïssatou Fatoumata',
      specialite: 'Développeur front-end',
      ville: 'Abidjan',
      pays: 'Côte d\'Ivoire',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aissatou',
      tags: ['UI/UX Design', 'Full Stack', 'Python'],
      projetsCollaboration: 85,
      note: 4.5,
      verified: true
    },
    {
      id: 2,
      type: 'entreprise',
      nom: 'CCA BANK',
      secteur: 'Finance',
      ville: 'Douala',
      pays: 'Cameroun',
      photo: 'https://api.dicebear.com/7.x/identicon/svg?seed=CCA',
      tags: ['Carte visa', 'Crédit conso', 'Financement'],
      projetsCollaboration: 15,
      note: 4.0,
      verified: false
    },
    {
      id: 3,
      type: 'entreprise',
      nom: 'UBA BANK',
      secteur: 'Finance',
      ville: 'Abuja',
      pays: 'Nigéria',
      photo: 'https://api.dicebear.com/7.x/identicon/svg?seed=UBA',
      tags: ['Prêt bancaire', 'Crédit card', 'Compte client'],
      projetsCollaboration: 5,
      note: 3.5,
      verified: false
    },
    {
      id: 4,
      type: 'freelance',
      nom: 'Kwame Mensah',
      specialite: 'Designer UI/UX',
      ville: 'Accra',
      pays: 'Ghana',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kwame',
      tags: ['Figma', 'Adobe XD', 'Prototyping'],
      projetsCollaboration: 42,
      note: 4.8,
      verified: true
    },
    {
      id: 5,
      type: 'freelance',
      nom: 'Mariama Diallo',
      specialite: 'Développeur Mobile',
      ville: 'Dakar',
      pays: 'Sénégal',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mariama',
      tags: ['React Native', 'Flutter', 'iOS'],
      projetsCollaboration: 67,
      note: 4.7,
      verified: true
    }
  ];

  const secteurs = [
    'Tous les secteurs',
    'Informatique',
    'Design',
    'Finance',
    'Marketing',
    'Santé',
    'Éducation'
  ];

  const pays = [
    'Tous les pays',
    'Côte d\'Ivoire',
    'Sénégal',
    'Cameroun',
    'Ghana',
    'Mali',
    'Burkina Faso',
    'Togo',
    'Bénin',
    'Nigéria'
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Logique de recherche
    console.log('Recherche avec filtres:', filters);
  };

  const renderStars = (note) => {
    const stars = [];
    const fullStars = Math.floor(note);
    const hasHalfStar = note % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <FiStar 
            key={i} 
            style={{ fill: '#FFD700', color: '#FFD700', fontSize: '16px' }}
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <FiStar 
            key={i} 
            style={{ fill: 'url(#half)', color: '#FFD700', fontSize: '16px' }}
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

  const filteredResults = results.filter(result => {
    const matchSearch = result.nom.toLowerCase().includes(filters.search.toLowerCase()) ||
                       (result.specialite && result.specialite.toLowerCase().includes(filters.search.toLowerCase()));
    const matchSecteur = !filters.secteur || filters.secteur === '' || result.secteur === filters.secteur;
    const matchPays = !filters.pays || filters.pays === '' || result.pays === filters.pays;
    const matchVille = !filters.ville || result.ville.toLowerCase().includes(filters.ville.toLowerCase());
    const matchType = !filters.type || filters.type === '' || result.type === filters.type;
    
    return matchSearch && matchSecteur && matchPays && matchVille && matchType;
  });

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

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
        onClick={() => navigate(`/profil-freelance/${result.id}`)}
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
        onClick={() => navigate(`/profil-freelance/${result.id}`)}
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
            <img src={logo} alt="Jobty" />
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
            <div className="search-profile-icon" onClick={() => navigate('/connexion')}>
              <FiUser />
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
          <img src={logo} alt="Jobty" className="search-sidebar-logo" />
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
          <button className="search-connexion-btn" onClick={() => { navigate('/connexion'); closeMenu(); }}>Connexion</button>
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
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>

            <div className="search-filter-item">
              <select name="secteur" value={filters.secteur} onChange={handleFilterChange}>
                {secteurs.map((secteur, index) => (
                  <option key={index} value={index === 0 ? '' : secteur}>{secteur}</option>
                ))}
              </select>
              <FiChevronDown className="search-select-arrow" />
            </div>

            <div className="search-filter-item">
              <select name="pays" value={filters.pays} onChange={handleFilterChange}>
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
                placeholder="ville"
                value={filters.ville}
                onChange={handleFilterChange}
              />
            </div>

            <button type="submit" className="search-filter-btn">
              <FiFilter /> Filtrer
            </button>
          </form>

          {/* Filtres rapides */}
          <div className="search-quick-filters">
            <button 
              className={`search-quick-filter ${filters.type === '' ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, type: '' })}
            >
              Tous
            </button>
            <button 
              className={`search-quick-filter ${filters.type === 'freelance' ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, type: 'freelance' })}
            >
              Freelances
            </button>
            <button 
              className={`search-quick-filter ${filters.type === 'entreprise' ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, type: 'entreprise' })}
            >
              Entreprises
            </button>
          </div>
        </section>

        {/* RÉSULTATS */}
        <section className="search-results-section">
          <h2 className="search-results-title">
            {filteredResults.length} résultat{filteredResults.length > 1 ? 's' : ''} trouvé{filteredResults.length > 1 ? 's' : ''}
          </h2>

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
          <div className="search-pagination">
            <button className="search-pagination-btn">
              <FiChevronLeft />
            </button>
            <button className="search-pagination-btn active">1</button>
            <button className="search-pagination-btn">2</button>
            <button className="search-pagination-btn">3</button>
            <button className="search-pagination-btn">
              <FiChevronRight />
            </button>
          </div>
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