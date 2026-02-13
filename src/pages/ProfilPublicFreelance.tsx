import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiMenu, FiX, FiUser, FiMapPin, FiDollarSign, FiStar,
  FiMessageCircle, FiBriefcase, FiCheckCircle, FiCalendar,
  FiClock, FiEye, FiHeart, FiShare2, FiAward, FiTrendingUp,
  FiLink, FiImage, FiMoreVertical, FiShield, FiChevronsRight,
  FiCamera, FiEdit3
} from 'react-icons/fi';
import { FaHandshake, FaFacebookF, FaTwitter, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';
import logo from '../assets/logo.png';
import './ProfilPublicFreelance.css';

function ProfilPublicFreelance() {
  const navigate = useNavigate();
  const { freelanceId } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('apropos');
  const [selectedRealisationIndex, setSelectedRealisationIndex] = useState(null);
  const [isNavSticky, setIsNavSticky] = useState(false);

  
  // Données du freelance
  const freelance = {
    id: 1,
    nom: 'Koné',
    prenom: 'Aminata',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aminata',
    couverture: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=400&fit=crop',
    specialite: 'Développeuse Full Stack',
    secteur: 'Informatique',
    ville: 'Abidjan',
    pays: 'Côte d\'Ivoire',
    tarifHoraire: 15000,
    disponible: true,
    note: 4.8,
    nbAvis: 47,
    verified: true,
    anciennete: '2 ans',
    projetsRealises: 89,
    collaborationsEnCours: 3,
    vuesProfile: 1247,
    favoris: 156,
    tags: ['React', 'Node.js', 'MongoDB', 'UI/UX', 'API REST', 'TypeScript'],
    apropos: {
      description: "Développeuse Full Stack passionnée avec 2 ans d'expérience dans la création d'applications web modernes et performantes. Je transforme vos idées en solutions digitales innovantes.",
      approche: "Mon approche se base sur l'écoute active, la communication transparente et un suivi régulier. Je privilégie la qualité du code et l'expérience utilisateur dans tous mes projets.",
      typesProjetAcceptes: "Sites web, applications web, APIs REST, intégrations tierces, refonte UI/UX, maintenance et optimisation."
    }
  };

  // Services
  const services = [
    {
      id: 1,
      titre: 'Création site web vitrine',
      description: 'Site web responsive avec design moderne, optimisé SEO et adapté à tous les écrans',
      prix: 250000,
      typePrix: 'fixe',
      delai: '2 semaines',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600'
    },
    {
      id: 2,
      titre: 'Application web sur mesure',
      description: 'Développement complet frontend + backend avec base de données et panel admin',
      prix: 500000,
      typePrix: 'fixe',
      delai: '1 mois',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600'
    },
    {
      id: 3,
      titre: 'API REST & Intégrations',
      description: 'Création d\'APIs sécurisées et intégration avec des services tiers',
      prix: null,
      typePrix: 'devis',
      delai: 'Variable',
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600'
    }
  ];

  // Réalisations
  const realisations = [
    {
      id: 1,
      type: 'image',
      titre: 'Site e-commerce Afro Style',
      description: 'Plateforme complète avec paiement mobile money et gestion de stock',
      medias: [
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
        'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800'
      ],
      likes: 234,
      vues: 1420,
      date: '2024-01-15',
      technologies: ['React', 'Node.js', 'Stripe']
    },
    {
      id: 2,
      type: 'link',
      titre: 'Application de gestion scolaire',
      description: 'Dashboard admin + app mobile parents/élèves',
      url: 'https://demo.schoolapp.ci',
      likes: 156,
      vues: 890,
      date: '2024-01-10',
      technologies: ['Vue.js', 'Laravel', 'MySQL']
    },
    {
      id: 3,
      type: 'image',
      titre: 'Refonte UI/UX Bank App',
      description: 'Modernisation interface banque mobile avec design system',
      medias: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800'
      ],
      likes: 189,
      vues: 1102,
      date: '2024-01-05',
      technologies: ['Figma', 'React Native']
    },
    {
      id: 4,
      type: 'image',
      titre: 'Plateforme de réservation',
      description: 'Site de réservation en ligne pour restaurants et hôtels',
      medias: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
      ],
      likes: 145,
      vues: 756,
      date: '2023-12-20',
      technologies: ['Next.js', 'PostgreSQL']
    }
  ];

  // Collaborations
  const collaborations = [
    {
      id: 1,
      titre: 'Site web corporate',
      client: 'Entreprise Tech CI',
      statut: 'termine',
      date: '2024-01-18',
      note: 5,
      miniature: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400'
    },
    {
      id: 2,
      titre: 'App mobile fitness',
      client: 'StartupSport',
      statut: 'en_cours',
      progression: 65,
      miniature: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400'
    },
    {
      id: 3,
      titre: 'Dashboard analytics',
      client: 'DataCorp',
      statut: 'termine',
      date: '2024-01-10',
      note: 5,
      miniature: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400'
    },
    {
      id: 4,
      titre: 'Site e-learning',
      client: 'EduTech Africa',
      statut: 'termine',
      date: '2023-12-15',
      note: 4,
      miniature: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400'
    }
  ];

  // Avis
  const avis = [
    {
      id: 1,
      client: 'Marc Dubois',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marc',
      note: 5,
      commentaire: "Excellente collaboration ! Aminata est très professionnelle et à l'écoute. Le site web livré dépasse nos attentes. Je recommande vivement.",
      projet: 'Site web corporate',
      date: '2024-01-18'
    },
    {
      id: 2,
      client: 'Sophie Martin',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
      note: 5,
      commentaire: "Travail de qualité, respect des délais et communication fluide. L'application développée fonctionne parfaitement. Merci !",
      projet: 'App mobile fitness',
      date: '2024-01-15'
    },
    {
      id: 3,
      client: 'Jean Kouassi',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jean',
      note: 5,
      commentaire: "Très satisfait du dashboard développé. Interface intuitive et code propre. Une vraie pro !",
      projet: 'Dashboard analytics',
      date: '2024-01-10'
    },
    {
      id: 4,
      client: 'Aïcha Traoré',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aicha',
      note: 4,
      commentaire: "Bonne prestation dans l'ensemble. Quelques ajustements ont été nécessaires mais le résultat final est satisfaisant.",
      projet: 'Site e-learning',
      date: '2023-12-15'
    }
  ];

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

  return (
    <div className="profil-public-page">
      {/* HEADER FIXE */}
      <header className="profil-public-header">
        <div className="profil-public-header-content">
          <div className="profil-public-logo" onClick={() => navigate('/')}>
            <img src={logo} alt="Jobty" />
          </div>

          <div className="profil-public-header-actions">
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
              <img src={logo} alt="Jobty" />
              <button onClick={closeMenu}><FiX /></button>
            </div>
            <nav className="profil-public-sidebar-nav">
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
                    <FiMapPin /> {freelance.ville}, {freelance.pays}
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
                  {freelance.tags.slice(0, 4).map((tag, index) => (
                    <span key={index} className="profil-tag">{tag}</span>
                  ))}
                  {freelance.tags.length > 4 && (
                    <span className="profil-tag-more">+{freelance.tags.length - 4}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="profil-actions-section">
                <button className="profil-btn-primary" onClick={handleCollabClick}>
                  <FaHandshake /> Collaborer
                </button>
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
                <div className="profil-apropos-item">
                  <h3>Approche de travail</h3>
                  <p>{freelance.apropos.approche}</p>
                </div>
                <div className="profil-apropos-item">
                  <h3>Types de projets acceptés</h3>
                  <p>{freelance.apropos.typesProjetAcceptes}</p>
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
                {services.map(service => (
                  <div key={service.id} className="profil-service-card">
                    <div className="profil-service-image" style={{ backgroundImage: `url(${service.image})` }}></div>
                    <div className="profil-service-content">
                      <h3>{service.titre}</h3>
                      <p>{service.description}</p>
                      <div className="profil-service-meta">
                        <div className="profil-service-prix">
                          {service.typePrix === 'fixe' ? (
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
                          <span>{service.delai}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                {realisations.map(realisation => (
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
                ))}
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
                {collaborations.map(collab => (
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
                ))}
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
                {avis.map(avisItem => (
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
                ))}
              </div>
            </section>

          </div>
        </div>

        {/* CTA FOOTER */}
        <section className="profil-cta">
          <h2>Prêt à démarrer votre projet ?</h2>
          <p>Contactez {freelance.prenom} pour discuter de vos besoins et obtenir un devis personnalisé</p>
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
            <img src={logo} alt="Jobty" className="profil-public-footer-logo" />
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