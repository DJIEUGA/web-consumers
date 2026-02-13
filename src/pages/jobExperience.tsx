import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiMapPin, 
  FiDollarSign, 
  FiX,
  FiMenu,
  FiStar,
  FiBriefcase,
  FiCalendar,
  FiUser,
  FiUsers,
  FiChevronDown,
  FiFilter,
  FiSend,
  FiHeart,
  FiEye,
  FiTrendingUp
} from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaGraduationCap } from 'react-icons/fa';
import { COLORS } from '../styles/colors';
import logo from '../assets/logo.png';
import './jobExperience.css';

function JobExperience() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profils');
  const [favorites, setFavorites] = useState([]);
  
  const [filters, setFilters] = useState({
    search: '',
    secteur: '',
    pays: '',
    ville: '',
    type: ''
  });

  // Données mockées - Profils de jeunes diplômés
  const profils = [
    {
      id: 1,
      nom: 'Jean-Pierre Kamga',
      poste: 'Administrateur Réseau',
      formation: 'BTS Réseaux Informatiques',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JeanPierre',
      ville: 'Douala',
      pays: 'Cameroun',
      secteur: 'Informatique',
      experience: 'Stage chez CNPS - 3 mois',
      competences: ['Cisco', 'Windows Server', 'Linux'],
      disponible: true,
      note: 4,
      vues: 124
    },
    {
      id: 2,
      nom: 'Mariama Diop',
      poste: 'Assistante RH',
      formation: 'Licence Gestion des RH',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mariama',
      ville: 'Dakar',
      pays: 'Sénégal',
      secteur: 'Ressources Humaines',
      experience: 'Stage chez Orange Sénégal - 6 mois',
      competences: ['Recrutement', 'Paie', 'Excel'],
      disponible: true,
      note: 5,
      vues: 256
    },
    {
      id: 3,
      nom: 'Kwame Asante',
      poste: 'Développeur Junior',
      formation: 'Licence Informatique',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kwame',
      ville: 'Accra',
      pays: 'Ghana',
      secteur: 'Informatique',
      experience: 'Stage chez MTN Ghana - 12 mois',
      competences: ['React', 'Node.js', 'Python'],
      disponible: false,
      note: 4,
      vues: 189
    },
    {
      id: 4,
      nom: 'Aminata Koné',
      poste: 'Chargée de Communication',
      formation: 'Master Communication',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aminata',
      ville: 'Abidjan',
      pays: 'Côte d\'Ivoire',
      secteur: 'Marketing',
      experience: 'Stage chez Publicis - 4 mois',
      competences: ['Réseaux sociaux', 'Rédaction', 'Photoshop'],
      disponible: true,
      note: 5,
      vues: 312
    },
    {
      id: 5,
      nom: 'Oumar Sy',
      poste: 'Comptable Junior',
      formation: 'BTS Comptabilité',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oumar',
      ville: 'Bamako',
      pays: 'Mali',
      secteur: 'Finance',
      experience: 'Stage chez BDM-SA - 6 mois',
      competences: ['Sage', 'Excel', 'Fiscalité'],
      disponible: true,
      note: 4,
      vues: 98
    },
    {
      id: 6,
      nom: 'Fatoumata Bah',
      poste: 'Infirmière',
      formation: 'Diplôme d\'État Infirmier',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatoumata',
      ville: 'Conakry',
      pays: 'Guinée',
      secteur: 'Santé',
      experience: 'Stage CHU Donka - 12 mois',
      competences: ['Soins', 'Urgences', 'Pédiatrie'],
      disponible: true,
      note: 5,
      vues: 145
    },
    {
      id: 7,
      nom: 'Kofi Mensah',
      poste: 'Technicien Électricien',
      formation: 'CAP Électricité',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kofi2',
      ville: 'Lomé',
      pays: 'Togo',
      secteur: 'BTP',
      experience: 'Apprentissage chez Électro-Plus - 2 ans',
      competences: ['Installation', 'Dépannage', 'Maintenance'],
      disponible: true,
      note: 4,
      vues: 87
    },
    {
      id: 8,
      nom: 'Aïssatou Diallo',
      poste: 'Graphiste',
      formation: 'Licence Design Graphique',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aissatou',
      ville: 'Dakar',
      pays: 'Sénégal',
      secteur: 'Design',
      experience: 'Freelance - 8 mois',
      competences: ['Illustrator', 'Photoshop', 'InDesign'],
      disponible: true,
      note: 5,
      vues: 234
    }
  ];

  // Données mockées - Offres d'emploi/stage
  const offres = [
    {
      id: 1,
      titre: 'Stagiaire Développeur Web',
      entreprise: 'Tech Solutions Africa',
      logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=TechSol',
      ville: 'Abidjan',
      pays: 'Côte d\'Ivoire',
      secteur: 'Informatique',
      type: 'Stage',
      duree: '6 mois',
      salaireMin: 150000,
      salaireMax: 250000,
      devise: 'FCFA',
      description: 'Nous recherchons un stagiaire passionné par le développement web pour rejoindre notre équipe dynamique.',
      competences: ['HTML/CSS', 'JavaScript', 'React'],
      datePublication: '2024-01-15',
      candidatures: 23,
      urgent: false
    },
    {
      id: 2,
      titre: 'Assistant(e) Marketing Digital',
      entreprise: 'Digital Wave Agency',
      logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Digital',
      ville: 'Dakar',
      pays: 'Sénégal',
      secteur: 'Marketing',
      type: 'CDI',
      duree: 'Indéterminée',
      salaireMin: 300000,
      salaireMax: 450000,
      devise: 'FCFA',
      description: 'Rejoignez notre équipe marketing pour gérer les campagnes digitales de nos clients.',
      competences: ['Social Media', 'Google Ads', 'Analytics'],
      datePublication: '2024-01-18',
      candidatures: 45,
      urgent: true
    },
    {
      id: 3,
      titre: 'Comptable Junior',
      entreprise: 'Cabinet Expertise Plus',
      logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Expertise',
      ville: 'Douala',
      pays: 'Cameroun',
      secteur: 'Finance',
      type: 'CDD',
      duree: '12 mois',
      salaireMin: 250000,
      salaireMax: 350000,
      devise: 'FCFA',
      description: 'Cabinet d\'expertise comptable recherche un comptable junior pour renforcer son équipe.',
      competences: ['Sage', 'Excel', 'Fiscalité'],
      datePublication: '2024-01-20',
      candidatures: 18,
      urgent: false
    },
    {
      id: 4,
      titre: 'Stagiaire Ressources Humaines',
      entreprise: 'Orange Côte d\'Ivoire',
      logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Orange',
      ville: 'Abidjan',
      pays: 'Côte d\'Ivoire',
      secteur: 'Ressources Humaines',
      type: 'Stage',
      duree: '4 mois',
      salaireMin: 100000,
      salaireMax: 150000,
      devise: 'FCFA',
      description: 'Stage au sein de la direction des ressources humaines pour participer aux processus de recrutement.',
      competences: ['Recrutement', 'Administration', 'Excel'],
      datePublication: '2024-01-22',
      candidatures: 67,
      urgent: false
    },
    {
      id: 5,
      titre: 'Technicien Maintenance Industrielle',
      entreprise: 'Industrie Plus SA',
      logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Industrie',
      ville: 'Accra',
      pays: 'Ghana',
      secteur: 'Industrie',
      type: 'CDI',
      duree: 'Indéterminée',
      salaireMin: 400000,
      salaireMax: 600000,
      devise: 'FCFA',
      description: 'Nous recherchons un technicien pour assurer la maintenance de nos équipements industriels.',
      competences: ['Mécanique', 'Électricité', 'Automatisme'],
      datePublication: '2024-01-10',
      candidatures: 12,
      urgent: true
    },
    {
      id: 6,
      titre: 'Infirmier(ère) - Service Urgences',
      entreprise: 'Clinique Sainte Marie',
      logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Clinique',
      ville: 'Abidjan',
      pays: 'Côte d\'Ivoire',
      secteur: 'Santé',
      type: 'CDI',
      duree: 'Indéterminée',
      salaireMin: 350000,
      salaireMax: 500000,
      devise: 'FCFA',
      description: 'Clinique privée recherche infirmier(ère) diplômé(e) pour le service des urgences.',
      competences: ['Soins d\'urgence', 'Réanimation', 'Travail en équipe'],
      datePublication: '2024-01-25',
      candidatures: 34,
      urgent: false
    }
  ];

  // Listes pour les filtres
  const secteurs = [
    'Tous les secteurs',
    'Informatique',
    'Marketing',
    'Finance',
    'Ressources Humaines',
    'Santé',
    'BTP',
    'Design',
    'Industrie',
    'Commerce'
  ];

  const paysListe = [
    'Tous les pays',
    'Côte d\'Ivoire',
    'Sénégal',
    'Cameroun',
    'Ghana',
    'Mali',
    'Guinée',
    'Togo',
    'Burkina Faso'
  ];

  const typesContrat = [
    'Tous les types',
    'Stage',
    'CDD',
    'CDI',
    'Alternance',
    'Freelance'
  ];

  // Fonctions utilitaires
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(fav => fav !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine(s)`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
  };

  const renderStars = (note) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar 
          key={i} 
          style={{ 
            fill: i <= note ? '#FFD700' : 'none',
            color: i <= note ? '#FFD700' : '#ddd'
          }}
        />
      );
    }
    return stars;
  };

  // Filtrer les données
  const filteredProfils = profils.filter(profil => {
    const matchSearch = profil.nom.toLowerCase().includes(filters.search.toLowerCase()) ||
                       profil.poste.toLowerCase().includes(filters.search.toLowerCase());
    const matchSecteur = !filters.secteur || filters.secteur === '' || profil.secteur === filters.secteur;
    const matchPays = !filters.pays || filters.pays === '' || profil.pays === filters.pays;
    const matchVille = !filters.ville || profil.ville.toLowerCase().includes(filters.ville.toLowerCase());
    return matchSearch && matchSecteur && matchPays && matchVille;
  });

  const filteredOffres = offres.filter(offre => {
    const matchSearch = offre.titre.toLowerCase().includes(filters.search.toLowerCase()) ||
                       offre.entreprise.toLowerCase().includes(filters.search.toLowerCase());
    const matchSecteur = !filters.secteur || filters.secteur === '' || offre.secteur === filters.secteur;
    const matchPays = !filters.pays || filters.pays === '' || offre.pays === filters.pays;
    const matchVille = !filters.ville || offre.ville.toLowerCase().includes(filters.ville.toLowerCase());
    const matchType = !filters.type || filters.type === '' || offre.type === filters.type;
    return matchSearch && matchSecteur && matchPays && matchVille && matchType;
  });

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="jobexp-page">
      {/* HEADER */}
      <header className="jobexp-header">
        <div className="jobexp-header-content">
          <div className="jobexp-logo" onClick={() => navigate('/')}>
            <img src={logo} alt="Jobty" />
          </div>

          <nav className="jobexp-nav desktop-only">
            <a href="/decouverte" className="jobexp-nav-item" onClick={(e) => { e.preventDefault(); navigate('/decouverte'); }}>Découverte</a>
            <a href="/marketplace" className="jobexp-nav-item" onClick={(e) => { e.preventDefault(); navigate('/marketplace'); }}>Marketplace</a>
            <a href="/portfolio" className="jobexp-nav-item" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); }}>Portfolio</a>
            <a href="/localisation" className="jobexp-nav-item" onClick={(e) => { e.preventDefault(); navigate('/localisation'); }}>Localisation</a>
            <a href="/job-alerte" className="jobexp-nav-item" onClick={(e) => { e.preventDefault(); navigate('/job-alerte'); }}>Job alerte</a>
            <a href="/job-experience" className="jobexp-nav-item active" onClick={(e) => { e.preventDefault(); navigate('/job-experience'); }}>Job expérience</a>
          </nav>

          <div className="jobexp-header-actions">
            <div className="jobexp-profile-icon" onClick={() => navigate('/connexion')}>
              <FiUser />
              <span className="jobexp-notif-badge">0</span>
            </div>
            <button className="jobexp-burger-btn" onClick={toggleMenu} aria-label="Menu">
              <FiMenu />
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile */}
      <div className={`jobexp-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="jobexp-sidebar-header">
          <img src={logo} alt="Jobty" className="jobexp-sidebar-logo" />
          <button className="jobexp-close-btn" onClick={closeMenu} aria-label="Fermer">
            <FiX />
          </button>
        </div>
        <nav className="jobexp-sidebar-nav">
          <a href="/decouverte" onClick={(e) => { e.preventDefault(); navigate('/decouverte'); closeMenu(); }}>Découverte</a>
          <a href="/marketplace" onClick={(e) => { e.preventDefault(); navigate('/marketplace'); closeMenu(); }}>Marketplace</a>
          <a href="/portfolio" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); closeMenu(); }}>Portfolio</a>
          <a href="/localisation" onClick={(e) => { e.preventDefault(); navigate('/localisation'); closeMenu(); }}>Localisation</a>
          <a href="/job-alerte" onClick={(e) => { e.preventDefault(); navigate('/job-alerte'); closeMenu(); }}>Job alerte</a>
          <a href="/job-experience" className="active" onClick={(e) => { e.preventDefault(); navigate('/job-experience'); closeMenu(); }}>Job expérience</a>
          <button className="jobexp-connexion-btn" onClick={() => { navigate('/connexion'); closeMenu(); }}>Connexion</button>
        </nav>
      </div>

      {menuOpen && <div className="jobexp-overlay" onClick={closeMenu}></div>}

      {/* HERO SECTION */}
      <section className="jobexp-hero">
        <div className="jobexp-hero-icon">
          <FaGraduationCap />
        </div>
        <h1 className="jobexp-hero-title">
          Lancez votre <span className="jobexp-highlight">carrière</span><br />
          Trouvez votre première opportunité
        </h1>
        <p className="jobexp-hero-subtitle">
          Découvrez des profils de jeunes talents ou trouvez le stage et l'emploi qui correspond à vos ambitions
        </p>
        <div className="jobexp-hero-stats">
          <div className="jobexp-stat">
            <span className="jobexp-stat-number">{profils.length * 127}</span>
            <span className="jobexp-stat-label">Profils actifs</span>
          </div>
          <div className="jobexp-stat-divider"></div>
          <div className="jobexp-stat">
            <span className="jobexp-stat-number">{offres.length * 89}</span>
            <span className="jobexp-stat-label">Offres disponibles</span>
          </div>
          <div className="jobexp-stat-divider"></div>
          <div className="jobexp-stat">
            <span className="jobexp-stat-number">2.5k+</span>
            <span className="jobexp-stat-label">Recrutements</span>
          </div>
        </div>
      </section>

      {/* FILTRES */}
      <section className="jobexp-filters">
        <div className="jobexp-filters-bar">
          <div className="jobexp-filter-item jobexp-search">
            <FiSearch className="jobexp-filter-icon" />
            <input
              type="text"
              name="search"
              placeholder="Rechercher un profil, un poste..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div className="jobexp-filter-item">
            <select name="secteur" value={filters.secteur} onChange={handleFilterChange}>
              {secteurs.map((secteur, index) => (
                <option key={index} value={index === 0 ? '' : secteur}>{secteur}</option>
              ))}
            </select>
            <FiChevronDown className="jobexp-select-arrow" />
          </div>

          <div className="jobexp-filter-item">
            <select name="pays" value={filters.pays} onChange={handleFilterChange}>
              {paysListe.map((pays, index) => (
                <option key={index} value={index === 0 ? '' : pays}>{pays}</option>
              ))}
            </select>
            <FiChevronDown className="jobexp-select-arrow" />
          </div>

          <div className="jobexp-filter-item">
            <input
              type="text"
              name="ville"
              placeholder="Ville"
              value={filters.ville}
              onChange={handleFilterChange}
            />
          </div>

          {activeTab === 'offres' && (
            <div className="jobexp-filter-item">
              <select name="type" value={filters.type} onChange={handleFilterChange}>
                {typesContrat.map((type, index) => (
                  <option key={index} value={index === 0 ? '' : type}>{type}</option>
                ))}
              </select>
              <FiChevronDown className="jobexp-select-arrow" />
            </div>
          )}

          <button className="jobexp-filter-btn" style={{ backgroundColor: COLORS.primary }}>
            <FiFilter /> Filtrer
          </button>
        </div>
      </section>

      {/* ONGLETS */}
      <section className="jobexp-tabs">
        <div className="jobexp-tabs-container">
          <button
            className={`jobexp-tab ${activeTab === 'profils' ? 'active' : ''}`}
            onClick={() => setActiveTab('profils')}
          >
            <FiUsers />
            <span>Profils Candidats</span>
            <span className="jobexp-tab-count">{filteredProfils.length}</span>
          </button>
          <button
            className={`jobexp-tab ${activeTab === 'offres' ? 'active' : ''}`}
            onClick={() => setActiveTab('offres')}
          >
            <FiBriefcase />
            <span>Offres d'emploi</span>
            <span className="jobexp-tab-count">{filteredOffres.length}</span>
          </button>
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}
      <main className="jobexp-main">
        
{/* ONGLET PROFILS */}
{activeTab === 'profils' && (
  <div className="jobexp-profils-section">
    <div className="jobexp-section-header">
      <h2>
        <FaGraduationCap style={{ color: COLORS.primary }} />
        Jeunes talents à la recherche d'opportunités
      </h2>
      <span className="jobexp-results-count">{filteredProfils.length} profils trouvés</span>
    </div>

    <div className="jobexp-profils-grid-marketplace">
      {filteredProfils.map((profil) => (
        <div key={profil.id} className="jobexp-marketplace-card">
          {/* Partie gauche (photo et info de base) */}
          <div className="jobexp-marketplace-left" style={{ backgroundColor: '#444' }}>
            <div className="jobexp-marketplace-photo-wrapper">
              <img src={profil.photo} alt={profil.nom} className="jobexp-marketplace-photo" />
            </div>
            <h3 className="jobexp-marketplace-name">{profil.nom}</h3>
            <p className="jobexp-marketplace-poste" style={{ color: COLORS.primary }}>{profil.poste}</p>
            <div className="jobexp-marketplace-stars">
              {renderStars(profil.note)}
            </div>
          </div>

          {/* Partie droite (détails) */}
          <div className="jobexp-marketplace-right">
            {/* Badge de statut */}
            <span 
              className="jobexp-marketplace-badge" 
              style={{ backgroundColor: profil.disponible ? '#28a745' : '#dc3545' }}
            >
              {profil.disponible ? 'Disponible' : 'Indisponible'}
            </span>

            {/* Détails */}
            <div className="jobexp-marketplace-details">
              <div className="jobexp-marketplace-detail-item">
                <FaGraduationCap style={{ color: COLORS.secondary }} />
                <span>{profil.formation}</span>
              </div>
              <div className="jobexp-marketplace-detail-item">
                <FiMapPin style={{ color: COLORS.secondary }} />
                <span>{profil.ville}, {profil.pays}</span>
              </div>
              <div className="jobexp-marketplace-detail-item">
                <FiBriefcase style={{ color: COLORS.secondary }} />
                <span>{profil.secteur}</span>
              </div>
              <div className="jobexp-marketplace-detail-item">
                <FiCalendar style={{ color: COLORS.secondary }} />
                <span>{profil.experience}</span>
              </div>
              <div className="jobexp-marketplace-detail-item">
                <FiEye style={{ color: COLORS.secondary }} />
                <span>{profil.vues} vues de profil</span>
              </div>
            </div>

            {/* Compétences */}
            <div className="jobexp-marketplace-competences">
              {profil.competences.map((comp, index) => (
                <span key={index} className="jobexp-marketplace-comp-tag">{comp}</span>
              ))}
            </div>

            {/* Bouton */}
            <button 
              className="jobexp-marketplace-voir-btn"
              onClick={() => navigate(`/profil/experience/${profil.id}`)}
              style={{ borderColor: COLORS.primary, color: COLORS.primary }}
            >
              Voir le profil complet
            </button>
          </div>
        </div>
      ))}
    </div>

      {filteredProfils.length === 0 && (
              <div className="jobexp-no-results">
                <FiUsers className="jobexp-no-results-icon" />
                <h3>Aucun profil trouvé</h3>
                <p>Essayez de modifier vos critères de recherche</p>
              </div>
            )}

            <button className="jobexp-voir-plus-btn" style={{ borderColor: COLORS.primary, color: COLORS.primary }}>
              Voir plus de profils
            </button>
          </div>
        )}
        
        {/* ONGLET OFFRES */}
        {activeTab === 'offres' && (
          <div className="jobexp-offres-section">
            <div className="jobexp-section-header">
              <h2>
                <FiBriefcase style={{ color: COLORS.secondary }} />
                Offres de stage et d'emploi
              </h2>
              <span className="jobexp-results-count">{filteredOffres.length} offres disponibles</span>
            </div>

            <div className="jobexp-offres-grid">
              {filteredOffres.map((offre) => (
                <div key={offre.id} className="jobexp-offre-card">
                  {offre.urgent && (
                    <div className="jobexp-urgent-badge">
                      <FiTrendingUp /> Urgent
                    </div>
                  )}
                  
                  <div className="jobexp-offre-header">
                    <img src={offre.logo} alt={offre.entreprise} className="jobexp-offre-logo" />
                    <div className="jobexp-offre-header-info">
                      <span className="jobexp-offre-type" style={{ backgroundColor: offre.type === 'Stage' ? '#28a745' : offre.type === 'CDI' ? COLORS.primary : '#fd7e14' }}>
                        {offre.type}
                      </span>
                      <span className="jobexp-offre-date">{getTimeAgo(offre.datePublication)}</span>
                    </div>
                    <button 
                      className={`jobexp-favorite-btn ${favorites.includes(`offre-${offre.id}`) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(`offre-${offre.id}`)}
                    >
                      <FiHeart />
                    </button>
                  </div>

                  <div className="jobexp-offre-body">
                    <h3 className="jobexp-offre-titre">{offre.titre}</h3>
                    <p className="jobexp-offre-entreprise">{offre.entreprise}</p>

                    <div className="jobexp-offre-details">
                      <div className="jobexp-detail-item">
                        <FiMapPin style={{ color: COLORS.secondary }} />
                        <span>{offre.ville}, {offre.pays}</span>
                      </div>
                      <div className="jobexp-detail-item">
                        <FiDollarSign style={{ color: COLORS.secondary }} />
                        <span>{offre.salaireMin.toLocaleString()} - {offre.salaireMax.toLocaleString()} {offre.devise}/mois</span>
                      </div>
                      <div className="jobexp-detail-item">
                        <FiCalendar style={{ color: COLORS.secondary }} />
                        <span>{offre.duree}</span>
                      </div>
                    </div>

                    <p className="jobexp-offre-description">{offre.description}</p>

                    <div className="jobexp-offre-competences">
                      {offre.competences.map((comp, index) => (
                        <span key={index} className="jobexp-competence-tag">{comp}</span>
                      ))}
                    </div>
                  </div>

                  <div className="jobexp-offre-footer">
                    <span className="jobexp-candidatures-count">
                      <FiUsers /> {offre.candidatures} candidatures
                    </span>
                    <button 
                      className="jobexp-postuler-btn"
                      onClick={() => navigate(`/offre/${offre.id}`)}
                      style={{ backgroundColor: COLORS.secondary }}
                    >
                      <FiSend /> Postuler
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredOffres.length === 0 && (
              <div className="jobexp-no-results">
                <FiBriefcase className="jobexp-no-results-icon" />
                <h3>Aucune offre trouvée</h3>
                <p>Essayez de modifier vos critères de recherche</p>
              </div>
            )}

            <button className="jobexp-voir-plus-btn" style={{ borderColor: COLORS.secondary, color: COLORS.secondary }}>
              Voir plus d'offres
            </button>
          </div>
        )}

        {/* SECTION CTA */}
        <section className="jobexp-cta-section">
          <div className="jobexp-cta-card">
            <div className="jobexp-cta-icon" style={{ backgroundColor: `${COLORS.primary}15` }}>
              <FiUser style={{ color: COLORS.primary }} />
            </div>
            <h3>Vous êtes un jeune talent ?</h3>
            <p>Créez votre profil et montrez vos compétences aux entreprises qui recrutent</p>
            <button 
              className="jobexp-cta-btn"
              onClick={() => navigate('/connexion')}
              style={{ backgroundColor: COLORS.primary }}
            >
              Créer mon profil
            </button>
          </div>

          <div className="jobexp-cta-card">
            <div className="jobexp-cta-icon" style={{ backgroundColor: `${COLORS.secondary}15` }}>
              <FiBriefcase style={{ color: COLORS.secondary }} />
            </div>
            <h3>Vous êtes une entreprise ?</h3>
            <p>Publiez vos offres de stage ou d'emploi et trouvez les meilleurs talents</p>
            <button 
              className="jobexp-cta-btn"
              onClick={() => navigate('/connexion')}
              style={{ backgroundColor: COLORS.secondary }}
            >
              Publier une offre
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="jobexp-footer">
        <div className="jobexp-footer-content">
          <div className="jobexp-footer-column">
            <h4>Navigation</h4>
            <ul>
              <li><a href="/decouverte" onClick={(e) => { e.preventDefault(); navigate('/decouverte'); }}>Découvrir</a></li>
              <li><a href="/marketplace" onClick={(e) => { e.preventDefault(); navigate('/marketplace'); }}>Marketplace</a></li>
              <li><a href="/portfolio" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); }}>Portfolio</a></li>
              <li><a href="/localisation" onClick={(e) => { e.preventDefault(); navigate('/localisation'); }}>Localisation</a></li>
              <li><a href="/job-alerte" onClick={(e) => { e.preventDefault(); navigate('/job-alerte'); }}>Job alerte</a></li>
              <li><a href="/job-experience" onClick={(e) => { e.preventDefault(); navigate('/job-experience'); }}>Job expérience</a></li>
            </ul>
          </div>
          <div className="jobexp-footer-column">
            <h4>À propos</h4>
            <ul>
              <li><a href="/comment-ca-marche" onClick={(e) => { e.preventDefault(); navigate('/comment-ca-marche'); }}>Comment ça marche</a></li>
              <li><a href="/devenir-jobeur" onClick={(e) => { e.preventDefault(); navigate('/devenir-jobeur'); }}>Devenir Jobeur</a></li>
              <li><a href="/nous-joindre" onClick={(e) => { e.preventDefault(); navigate('/nous-joindre'); }}>Nous Joindre</a></li>
            </ul>
          </div>
          <div className="jobexp-footer-column">
            <h4>Légal</h4>
            <ul>
              <li><a href="/blog" onClick={(e) => { e.preventDefault(); navigate('/blog'); }}>Blog</a></li>
              <li><a href="/conditions" onClick={(e) => { e.preventDefault(); navigate('/conditions'); }}>Conditions</a></li>
              <li><a href="/parametres" onClick={(e) => { e.preventDefault(); navigate('/parametres'); }}>Paramètres</a></li>
            </ul>
          </div>
        </div>
        <div className="jobexp-footer-divider"></div>
        <div className="jobexp-footer-bottom">
          <div className="jobexp-footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
          </div>
          <p>© 2024 Jobty - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}

export default JobExperience;