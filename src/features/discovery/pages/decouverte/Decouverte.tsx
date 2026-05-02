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
  FiMessageSquare,
  FiShield,
  FiCheckCircle,
  FiArrowRight,
} from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';

import { COLORS } from '../../../../styles/colors';
import Logo from '@/components/shared/Logo';
import { useAuthStore } from '../../../../stores/auth.store';
import { resolveAvatarUrl } from '@/utils/avatar';
import { useMarketplaceSearch } from '@/features/marketplace/hooks/useMarketplaceSearch';
import '../../styles/decouverte/style.css';

export const Decouverte = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authUser = useAuthStore((state) => state.user);
  const getDashboardRoute = useAuthStore((state) => state.getDashboardRoute);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const authShortcutLabel = isAuthenticated ? 'Dashboard' : 'Connexion';
  const authShortcutRoute = isAuthenticated ? getDashboardRoute() : '/connexion';
  const authAvatarUrl = resolveAvatarUrl(authUser);

  const { data: marketplaceData } = useMarketplaceSearch({ page: 0, size: 10 });
  const realProfiles = marketplaceData?.pros?.content || [];

  const goToAuthShortcut = () => {
    navigate(authShortcutRoute, {
      state: !isAuthenticated ? { from: '/decouverte' } : undefined,
    });
  };

  const formatTitleCaseName = (name: string) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const displayProfiles = realProfiles.map(p => ({
    id: p.userId,
    name: formatTitleCaseName(`${p.firstName || ''} ${p.lastName || ''}`.trim() || p.companyName || 'Freelance'),
    role: p.specialization || p.sector || 'Expert',
    country: p.country || 'Non spécifié',
    available: p.isAvailable ?? p.available ?? p.disponible ?? true,
    image: p.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userId}`
  }));

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



  const handleSecteurClick = (secteurName) => {
    navigate(`/marketplace?sector=${encodeURIComponent(secteurName)}`);
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };


  // Animation au scroll (Reveal effect)
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const handleReveal = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // On peut arrêter d'observer une fois l'animation jouée
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleReveal, observerOptions);
    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="decouverte-container">
      {/* Header / Navigation */}
      <header className="navbar-decouverte">
        <div className="header-content">
          <div
            onClick={() => navigate('/')}
          >
            <Logo alt="Jobty" style={{ width: '140px' }} />
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
        {/* SECTION HERO */}
        <section className="hero-landing">
          <div className="hero-content">
            <h1 className="hero-title">
              Trouvez les <span className="highlight">meilleurs talents</span> d'Afrique pour donner vie à vos projets
            </h1>
            <p className="hero-subtitle">
              Freelances, et entreprises qualifiés à portée de clic.
            </p>
            <div className="hero-actions">
              <button
                className="btn-primary"
                onClick={() => navigate('/marketplace')}
              >
                Rechercher un professionnel
              </button>
              <button
                className="btn-secondary"
                onClick={goToAuthShortcut}
              >
                Devenir Jobeur
              </button>
            </div>
            <div className="hero-trust-badges">
              <div className="trust-badge"><FiCheckCircle /> Profils vérifiés</div>
              <div className="trust-badge"><FiShield /> Paiement sécurisé</div>
              <div className="trust-badge"><FiStar /> Support 24/7</div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-wrapper">
              <img src="/illustration.png" alt="Trouver des professionnels" className="hero-img-main" />
              <div className="floating-bubble bubble-1"><img src="/images/avatars/avatar1.jpg" alt="" /></div>
              <div className="floating-bubble bubble-2"><img src="/images/avatars/avatar2.jpg" alt="" /></div>
            </div>
          </div>
        </section>



        {/* SECTION COMMENT CA MARCHE */}
        <section className="how-it-works reveal">
          <div className="section-header">
            <h2>Comment ça marche ?</h2>
            <p>Un processus simple et sécurisé pour réaliser vos projets</p>
          </div>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-icon"><FiSearch /></div>
              <h3>1. Recherchez</h3>
              <p>Trouvez le profil idéal parmi des milliers d'experts vérifiés.</p>
            </div>
            <div className="step-connector"><FiArrowRight /></div>
            <div className="step-card">
              <div className="step-icon"><FiMessageSquare /></div>
              <h3>2. Collaborez</h3>
              <p>Discutez, validez un devis et suivez l'avancée du travail.</p>
            </div>
            <div className="step-connector"><FiArrowRight /></div>
            <div className="step-card">
              <div className="step-icon"><FiShield /></div>
              <h3>3. Payez en sécurité</h3>
              <p>Votre argent est sécurisé jusqu'à la livraison complète.</p>
            </div>
          </div>
        </section>

        {/* SECTION SECTEURS */}
        <section className="secteurs-section reveal">
          <div className="section-header">
            <h2>Secteurs les plus populaires</h2>
            <p>Explorez nos domaines d'expertise</p>
          </div>

          <div className="secteurs-grid">
            {secteurs.slice(0, 10).map((secteur) => {
              const IconComponent = secteur.icon;
              return (
                <div
                  key={secteur.id}
                  className="secteur-card"
                  onClick={() => handleSecteurClick(secteur.nom)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSecteurClick(secteur.nom);
                  }}
                >
                  <div className="secteur-icon-wrapper">
                    <div className="icon-composite">
                      <IconComponent className="secteur-icon" />
                      <div className="icon-accent-line"></div>
                    </div>
                  </div>
                  <h3 className="secteur-nom">{secteur.nom}</h3>
                  <p className="secteur-description">{secteur.description}</p>
                </div>
              );
            })}
          </div>

          {/* Call to action secteurs */}
          <div className="decouverte-cta">
            <p className="cta-text">Vous ne trouvez pas votre secteur ?</p>
            <button
              className="cta-button cta-outline"
              onClick={() => navigate('/marketplace')}
            >
              Voir tous les secteurs
            </button>
          </div>
        </section>

        {/* SECTION VIVIER DE PROFILS */}
        <section className="vivier-section reveal">
          <div className="section-header">
            <h2>Quelques profils de notre catalogue</h2>
            <p>Découvrez notre sélection de talents d'exception, prêts à faire décoller vos projets</p>
          </div>

          <div className="vivier-carousel-wrapper">
            <div className="vivier-track">
              {realProfiles.length > 0 ? (
                /* Affichage des profils réels */
                [...displayProfiles, ...displayProfiles].map((profile, index) => (
                  <div key={`${profile.id}-${index}`} className="vivier-card">
                    <img src={profile.image} alt={profile.name} className="vivier-avatar" />
                    <h3 className="vivier-name">{profile.name}</h3>
                    <p className="vivier-role">{profile.role}</p>
                    <p className="vivier-country">{profile.country}</p>
                    <button
                      className="vivier-action-btn"
                      onClick={() => navigate(`/profil-freelance/${profile.id}`)}
                    >
                      Voir le profil
                    </button>
                  </div>
                ))
              ) : (
                /* Affichage des wireframes (skeletons) */
                [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={`skeleton-${i}`} className="vivier-card skeleton">
                    <div className="vivier-avatar skeleton">
                       <FiUser />
                    </div>
                    <div className="vivier-name skeleton skeleton-box"></div>
                    <div className="vivier-role skeleton skeleton-box"></div>
                    <div className="vivier-country skeleton skeleton-box"></div>
                    <div className="vivier-action-btn skeleton"></div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="decouverte-cta" style={{ paddingTop: '50px', paddingBottom: '20px' }}>
            <button
              className="cta-button cta-outline"
              onClick={() => navigate('/marketplace')}
            >
              Voir tous les profils
            </button>
          </div>
        </section>

        {/* SECTION POURQUOI NOUS CHOISIR */}
        <section className="why-choose-us reveal">
          <div className="section-header">
            <h2>Pourquoi choisir Jobty ?</h2>
            <p>La plateforme de confiance pour tous vos besoins professionnels</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon"><FiUsers /></div>
              <h3>Expertise Garantie</h3>
              <p>Accédez à des professionnels qui comprennent vos besoins et les spécificités de votre projet.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><FiShield /></div>
              <h3>Sécurité Garantie</h3>
              <p>Tous les profils sont vérifiés et vos paiements sont sécurisés jusqu'à la fin de la mission.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><FiZap /></div>
              <h3>Rapidité & Efficacité</h3>
              <p>Recevez des propositions en quelques minutes et gagnez du temps sur vos projets.</p>
            </div>
          </div>
        </section>
      </main>

      {/* SECTION CHIFFRES CLÉS ET TÉMOIGNAGES */}
      <section className="stats-temoignages-section reveal">
        <div className="stats-container">
          <div className="stat-item">
            <h3 className="stat-number">10K+</h3>
            <p className="stat-label">Professionnels vérifiés</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">5K+</h3>
            <p className="stat-label">Projets réalisés</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">15+</h3>
            <p className="stat-label">Pays couverts</p>
          </div>
        </div>

        <div className="temoignages-container">
          <div className="section-header">
            <h2>Ils nous font confiance</h2>
            <p>Découvrez les retours de nos utilisateurs</p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars-rating">
                <FiStar className="star filled" /><FiStar className="star filled" /><FiStar className="star filled" /><FiStar className="star filled" /><FiStar className="star filled" />
              </div>
              <p className="testimonial-quote">"Grâce à Jobty, j'ai trouvé un développeur freelance exceptionnel pour mon application mobile en moins de 48h."</p>
              <div className="testimonial-author">
                <img src="/images/avatars/avatar1.jpg" alt="Client" className="author-img" />
                <div className="author-info">
                  <h4>Mariam Traoré</h4>
                  <span>Fondatrice, TechAfrica</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars-rating">
                <FiStar className="star filled" /><FiStar className="star filled" /><FiStar className="star filled" /><FiStar className="star filled" /><FiStar className="star filled" />
              </div>
              <p className="testimonial-quote">"Une plateforme sécurisée et facile à utiliser. Le plombier que j'ai engagé était très professionnel et ponctuel."</p>
              <div className="testimonial-author">
                <img src="/images/avatars/avatar2.jpg" alt="Client" className="author-img" />
                <div className="author-info">
                  <h4>Jean-Paul Koffi</h4>
                  <span>Particulier</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars-rating">
                <FiStar className="star filled" /><FiStar className="star filled" /><FiStar className="star filled" /><FiStar className="star filled" /><FiStar className="star half-filled" />
              </div>
              <p className="testimonial-quote">"Depuis que je suis devenu Jobeur, mon chiffre d'affaires a doublé. La mise en relation est fluide et de qualité."</p>
              <div className="testimonial-author">
                <img src="/images/avatars/avatar3.jpg" alt="Client" className="author-img" />
                <div className="author-info">
                  <h4>Ahmed Diop</h4>
                  <span>Menuisier Indépendant</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton CTA */}
          <div className="temoignages-cta">
            <button
              className="jobeur-button cta-outline"
              onClick={goToAuthShortcut}
            >
              Rejoindre la communauté
            </button>
          </div>
        </div>
      </section>

      {/* SECTION FAQ */}
      <section className="faq-section reveal">
        <div className="faq-container">
          <div className="section-header">
            <h2>Foire aux questions</h2>
            <p>Tout ce que vous devez savoir sur Jobty</p>
          </div>

          <div className="faq-list">
            {[
              {
                q: "Comment puis-je trouver un professionnel ?",
                a: "C'est simple ! Utilisez la barre de recherche en haut de la page en saisissant le métier ou le lieu. Vous pouvez aussi explorer par secteur d'activité."
              },
              {
                q: "Est-ce que l'inscription est gratuite ?",
                a: "Oui, l'inscription est totalement gratuite pour les clients comme pour les professionnels. Des frais de service minimes s'appliquent lors des transactions sécurisées."
              },
              {
                q: "Comment devenir un 'Jobeur' sur la plateforme ?",
                a: "Cliquez sur le bouton 'Devenir Jobeur' en haut de la page, créez votre profil, téléchargez vos références et commencez à recevoir des missions."
              },
              {
                q: "Mes paiements sont-ils en sécurité ?",
                a: "Absolument. Jobty utilise un système de paiement sécurisé qui ne libère les fonds au professionnel qu'une fois que vous avez validé la prestation."
              }
            ].map((item, index) => (
              <div key={index} className={`faq-item ${activeFaq === index ? 'active' : ''}`}>
                <div className="faq-question" onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
                  <h3>{item.q}</h3>
                  <div className="faq-toggle">{activeFaq === index ? <FiX /> : <FiArrowRight />}</div>
                </div>
                <div className="faq-answer">
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
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

