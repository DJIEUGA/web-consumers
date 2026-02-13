import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiAlertCircle,
  FiMapPin, 
  FiPhone,
  FiClock,
  FiX,
  FiMenu,
  FiUser,
  FiCheck,
  FiDollarSign,
  FiBell,
  FiCheckCircle,
  FiEdit3,
  FiCamera,
  FiChevronRight,
  FiStar,
  FiShield
} from 'react-icons/fi';
import { 
  FaWrench,
  FaBolt,
  FaHome,
  FaCar,
  FaTools,
  FaLaptop,
  FaHospital,
  FaTruck,
  FaTshirt,
  FaBaby,
  FaDog,
  FaUtensils,
  FaFacebookF, 
  FaInstagram, 
  FaWhatsapp 
} from 'react-icons/fa';
import { COLORS } from '../styles/colors';
import logo from '../assets/logo.png';
import './jobAlerte.css';

function JobAlerte() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showTicketPopup, setShowTicketPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [alerteEnvoyee, setAlerteEnvoyee] = useState(false);
  const [professionnelTrouve, setProfessionnelTrouve] = useState(false);
  const [searchingPro, setSearchingPro] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [alerteForm, setAlerteForm] = useState({
    categorie: '',
    description: '',
    urgence: 'normale',
    adresse: '',
    ville: '',
    telephone: ''
  });

  const categories = [
    { id: 'plomberie', nom: 'Plomberie', icon: FaWrench, color: '#3498db', description: 'Fuite d\'eau, canalisation...' },
    { id: 'electricite', nom: 'Électricité', icon: FaBolt, color: '#f39c12', description: 'Panne électrique...' },
    { id: 'serrurerie', nom: 'Serrurerie', icon: FaHome, color: '#9b59b6', description: 'Porte bloquée...' },
    { id: 'mecanique', nom: 'Mécanique Auto', icon: FaCar, color: '#e74c3c', description: 'Panne de voiture...' },
    { id: 'electromenager', nom: 'Électroménager', icon: FaTools, color: '#1abc9c', description: 'Appareil en panne...' },
    { id: 'informatique', nom: 'Informatique', icon: FaLaptop, color: '#34495e', description: 'Ordinateur en panne...' },
    { id: 'sante', nom: 'Santé', icon: FaHospital, color: '#e91e63', description: 'Assistance médicale...' },
    { id: 'transport', nom: 'Transport', icon: FaTruck, color: '#795548', description: 'Déménagement urgent...' },
    { id: 'menage', nom: 'Ménage', icon: FaTshirt, color: '#00bcd4', description: 'Nettoyage urgent...' },
    { id: 'garde', nom: 'Garde d\'enfants', icon: FaBaby, color: '#ff9800', description: 'Baby-sitting...' },
    { id: 'animaux', nom: 'Animaux', icon: FaDog, color: '#4caf50', description: 'Vétérinaire...' },
    { id: 'restauration', nom: 'Restauration', icon: FaUtensils, color: '#ff5722', description: 'Traiteur...' }
  ];

  const niveauxUrgence = [
    { id: 'normale', label: 'Normale', description: 'Dans les 24h', color: '#28a745' },
    { id: 'urgente', label: 'Urgente', description: 'Dans les 2h', color: '#fd7e14' },
    { id: 'critique', label: 'Critique', description: 'Immédiate', color: '#dc3545' }
  ];

  const professionnelsDisponibles = [
    {
      id: 1,
      nom: 'Mamadou Diallo',
      profession: 'Plombier certifié',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mamadou',
      note: 4.8,
      avis: 156,
      distance: 1.2,
      tempsArrivee: '15-20 min',
      verifie: true,
      montant: 15000,
      devise: 'FCFA'
    },
    {
      id: 2,
      nom: 'Ibrahim Koné',
      profession: 'Plombier professionnel',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ibrahim',
      note: 4.5,
      avis: 89,
      distance: 2.5,
      tempsArrivee: '25-30 min',
      verifie: true,
      montant: 12000,
      devise: 'FCFA'
    },
    {
      id: 3,
      nom: 'Sekou Traoré',
      profession: 'Expert plomberie',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sekou',
      note: 4.9,
      avis: 234,
      distance: 0.8,
      tempsArrivee: '10-15 min',
      verifie: true,
      montant: 18000,
      devise: 'FCFA'
    }
  ];

  const alertesRecentes = [
    {
      id: 1,
      categorie: 'plomberie',
      description: 'Fuite d\'eau importante dans la cuisine',
      statut: 'terminee',
      date: '15 Jan 2024',
      professionnel: 'Mamadou Diallo',
      montant: 15000
    },
    {
      id: 2,
      categorie: 'electricite',
      description: 'Panne électrique générale',
      statut: 'en_cours',
      date: '18 Jan 2024',
      professionnel: 'Kouadio Yao',
      montant: 20000
    }
  ];

  const handleFormChange = (field, value) => {
    setAlerteForm(prev => ({ ...prev, [field]: value }));
  };

  const selectCategorie = (categorieId) => {
    handleFormChange('categorie', categorieId);
    setCurrentStep(2);
  };

  const envoyerAlerte = (e) => {
    e.preventDefault();
    setAlerteEnvoyee(true);
    setSearchingPro(true);
    setTimeout(() => {
      setSearchingPro(false);
      setProfessionnelTrouve(true);
    }, 3000);
  };

  const accepterTicket = (professionnel) => {
    setSelectedTicket(professionnel);
    setShowTicketPopup(true);
  };

  const procederPaiement = () => {
    setShowTicketPopup(false);
    setShowPaymentPopup(true);
  };

  const confirmerPaiement = () => {
    setShowPaymentPopup(false);
    setShowSuccessPopup(true);
  };

  const nouvelleAlerte = () => {
    setCurrentStep(1);
    setAlerteEnvoyee(false);
    setProfessionnelTrouve(false);
    setShowSuccessPopup(false);
    setSelectedTicket(null);
    setAlerteForm({
      categorie: '',
      description: '',
      urgence: 'normale',
      adresse: '',
      ville: '',
      telephone: ''
    });
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

  const getCategoryIcon = (categorieId) => {
    const cat = categories.find(c => c.id === categorieId);
    return cat ? cat.icon : FiAlertCircle;
  };

  const getCategoryColor = (categorieId) => {
    const cat = categories.find(c => c.id === categorieId);
    return cat ? cat.color : COLORS.primary;
  };

  const getCategoryName = (categorieId) => {
    const cat = categories.find(c => c.id === categorieId);
    return cat ? cat.nom : 'Inconnu';
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="jobalerte-container">
      {/* HEADER */}
      <header className="marketplace-header">
        <div className="header-content">
          <div className="header-logo" onClick={() => navigate('/')}>
            <img src={logo} alt="Jobty" />
          </div>

          <nav className="header-nav desktop-nav">
            <a href="/decouverte" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/decouverte'); }}>Découverte</a>
            <a href="/marketplace" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/marketplace'); }}>Marketplace</a>
            <a href="/portfolio" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); }}>Portfolio</a>
            <a href="/localisation" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/localisation'); }}>Localisation</a>
            <a href="/job-alerte" className="nav-item active" onClick={(e) => { e.preventDefault(); navigate('/job-alerte'); }}>Job alerte</a>
            <a href="/job-experience" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/job-experience'); }}>Job expérience</a>
          </nav>

          <div className="header-actions">
            <div className="profile-icon" onClick={() => navigate('/connexion')}>
              <FiUser />
              <span className="notification-badge">0</span>
            </div>
            <button className="burger-btn" onClick={toggleMenu} aria-label="Menu">
              <FiMenu />
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile */}
      <div className={`sidebar-menu ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src={logo} alt="Jobty" className="sidebar-logo" />
          <button className="close-btn" onClick={closeMenu} aria-label="Fermer">
            <FiX />
          </button>
        </div>
        <nav className="sidebar-nav">
          <a href="/decouverte" onClick={(e) => { e.preventDefault(); navigate('/decouverte'); closeMenu(); }}>Découverte</a>
          <a href="/marketplace" onClick={(e) => { e.preventDefault(); navigate('/marketplace'); closeMenu(); }}>Marketplace</a>
          <a href="/portfolio" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); closeMenu(); }}>Portfolio</a>
          <a href="/localisation" onClick={(e) => { e.preventDefault(); navigate('/localisation'); closeMenu(); }}>Localisation</a>
          <a href="/job-alerte" className="active" onClick={(e) => { e.preventDefault(); navigate('/job-alerte'); closeMenu(); }}>Job alerte</a>
          <a href="/job-experience" onClick={(e) => { e.preventDefault(); navigate('/job-experience'); closeMenu(); }}>Job expérience</a>
          <button className="sidebar-connexion-btn" onClick={() => { navigate('/connexion'); closeMenu(); }}>Connexion</button>
        </nav>
      </div>

      {menuOpen && <div className="sidebar-overlay" onClick={closeMenu}></div>}

      {/* HERO */}
      <section className="hero-section jobalerte-hero">
        <div className="hero-icon">
          <FiBell />
        </div>
        <h1 className="hero-title">
          Besoin d'une assistance <span className="highlight">urgente</span> ?
        </h1>
        <p className="hero-subtitle">
          Publiez votre alerte et recevez l'aide d'un professionnel qualifié près de chez vous
        </p>
      </section>

      {/* MAIN */}
      <main className="jobalerte-main">
        {!alerteEnvoyee ? (
          <div className="alerte-form-container">
            {/* Steps indicator */}
            <div className="steps-indicator">
              <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-label">Catégorie</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-label">Détails</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                <span className="step-number">3</span>
                <span className="step-label">Confirmation</span>
              </div>
            </div>

            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="step-content">
                <h2 className="step-title">Quel type d'assistance recherchez-vous ?</h2>
                <p className="step-description">Sélectionnez la catégorie qui correspond à votre besoin</p>
                <div className="categories-grid">
                  {categories.map((cat) => {
                    const IconComponent = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        className={`category-card ${alerteForm.categorie === cat.id ? 'selected' : ''}`}
                        onClick={() => selectCategorie(cat.id)}
                        style={{ '--cat-color': cat.color }}
                      >
                        <div className="category-icon-wrapper" style={{ backgroundColor: `${cat.color}15` }}>
                          <IconComponent style={{ color: cat.color }} />
                        </div>
                        <h3>{cat.nom}</h3>
                        <p>{cat.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="step-content">
                <button className="back-btn" onClick={() => setCurrentStep(1)}>← Retour</button>
                <h2 className="step-title">Décrivez votre problème</h2>
                <p className="step-description">Plus vous êtes précis, plus vite un professionnel pourra vous aider</p>

                <form className="alerte-form" onSubmit={(e) => { e.preventDefault(); setCurrentStep(3); }}>
                  <div className="selected-category">
                    {(() => {
                      const cat = categories.find(c => c.id === alerteForm.categorie);
                      const IconComponent = cat?.icon || FiAlertCircle;
                      return (
                        <>
                          <IconComponent style={{ color: cat?.color }} />
                          <span>{cat?.nom}</span>
                        </>
                      );
                    })()}
                  </div>

                  <div className="form-group">
                    <label>Niveau d'urgence</label>
                    <div className="urgence-options">
                      {niveauxUrgence.map((niveau) => (
                        <button
                          key={niveau.id}
                          type="button"
                          className={`urgence-btn ${alerteForm.urgence === niveau.id ? 'selected' : ''}`}
                          onClick={() => handleFormChange('urgence', niveau.id)}
                          style={{ '--urgence-color': niveau.color }}
                        >
                          <span className="urgence-label">{niveau.label}</span>
                          <span className="urgence-desc">{niveau.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label><FiEdit3 /> Description du problème *</label>
                    <textarea
                      placeholder="Décrivez votre problème en détail..."
                      value={alerteForm.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><FiMapPin /> Adresse d'intervention *</label>
                    <input
                      type="text"
                      placeholder="Ex: Rue des Jardins, Cocody"
                      value={alerteForm.adresse}
                      onChange={(e) => handleFormChange('adresse', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Ville *</label>
                    <select value={alerteForm.ville} onChange={(e) => handleFormChange('ville', e.target.value)} required>
                      <option value="">Sélectionnez une ville</option>
                      <option value="Abidjan">Abidjan</option>
                      <option value="Bouaké">Bouaké</option>
                      <option value="Yamoussoukro">Yamoussoukro</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label><FiPhone /> Numéro de téléphone *</label>
                    <input
                      type="tel"
                      placeholder="+225 07 00 00 00 00"
                      value={alerteForm.telephone}
                      onChange={(e) => handleFormChange('telephone', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><FiCamera /> Photos (optionnel)</label>
                    <div className="photo-upload">
                      <button type="button" className="upload-btn">
                        <FiCamera />
                        <span>Ajouter des photos</span>
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="submit-btn" style={{ backgroundColor: COLORS.primary }}>
                    Continuer <FiChevronRight />
                  </button>
                </form>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="step-content">
                <button className="back-btn" onClick={() => setCurrentStep(2)}>← Retour</button>
                <h2 className="step-title">Confirmez votre alerte</h2>
                <p className="step-description">Vérifiez les informations avant d'envoyer</p>

                <div className="confirmation-card">
                  <div className="confirmation-header">
                    {(() => {
                      const cat = categories.find(c => c.id === alerteForm.categorie);
                      const IconComponent = cat?.icon || FiAlertCircle;
                      return (
                        <div className="confirmation-category" style={{ backgroundColor: `${cat?.color}15` }}>
                          <IconComponent style={{ color: cat?.color }} />
                          <span>{cat?.nom}</span>
                        </div>
                      );
                    })()}
                    <span className="urgence-tag" style={{ backgroundColor: niveauxUrgence.find(n => n.id === alerteForm.urgence)?.color }}>
                      {niveauxUrgence.find(n => n.id === alerteForm.urgence)?.label}
                    </span>
                  </div>

                  <div className="confirmation-body">
                    <div className="confirmation-item">
                      <FiEdit3 />
                      <div>
                        <span className="label">Description</span>
                        <p>{alerteForm.description || 'Non renseigné'}</p>
                      </div>
                    </div>
                    <div className="confirmation-item">
                      <FiMapPin />
                      <div>
                        <span className="label">Adresse</span>
                        <p>{alerteForm.adresse}, {alerteForm.ville}</p>
                      </div>
                    </div>
                    <div className="confirmation-item">
                      <FiPhone />
                      <div>
                        <span className="label">Téléphone</span>
                        <p>{alerteForm.telephone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="confirmation-footer">
                    <p className="info-text">
                      <FiShield /> Les professionnels à proximité recevront votre alerte
                    </p>
                  </div>
                </div>

                <button className="submit-btn alerte-btn" onClick={envoyerAlerte} style={{ backgroundColor: '#dc3545' }}>
                  <FiBell /> Envoyer l'alerte
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="alerte-status-container">
            {searchingPro && (
              <div className="searching-section">
                <div className="searching-animation">
                  <div className="pulse-ring"></div>
                  <div className="pulse-ring delay-1"></div>
                  <div className="pulse-ring delay-2"></div>
                  <FiBell className="searching-icon" />
                </div>
                <h2>Recherche de professionnels...</h2>
                <p>Nous recherchons les professionnels disponibles près de chez vous</p>
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            {professionnelTrouve && !showSuccessPopup && (
              <div className="professionals-found">
                <div className="found-header">
                  <FiCheckCircle className="success-icon" />
                  <h2>{professionnelsDisponibles.length} professionnels disponibles</h2>
                  <p>Choisissez le professionnel qui vous convient</p>
                </div>

                <div className="professionals-list">
                  {professionnelsDisponibles.map((pro) => (
                    <div key={pro.id} className="professional-card">
                      <div className="pro-header">
                        <div className="pro-photo">
                          <img src={pro.photo} alt={pro.nom} />
                          {pro.verifie && (
                            <span className="verified-badge"><FiCheck /></span>
                          )}
                        </div>
                        <div className="pro-info">
                          <h3>{pro.nom}</h3>
                          <p className="pro-profession">{pro.profession}</p>
                          <div className="pro-rating">
                            {renderStars(Math.floor(pro.note))}
                            <span>{pro.note} ({pro.avis} avis)</span>
                          </div>
                        </div>
                      </div>

                      <div className="pro-details">
                        <div className="detail-item">
                          <FiMapPin />
                          <span>{pro.distance} km</span>
                        </div>
                        <div className="detail-item">
                          <FiClock />
                          <span>{pro.tempsArrivee}</span>
                        </div>
                      </div>

                      <div className="pro-ticket">
                        <div className="ticket-price">
                          <span className="price-label">Montant proposé</span>
                          <span className="price-value">{pro.montant.toLocaleString()} {pro.devise}</span>
                        </div>
                        <button className="accept-btn" onClick={() => accepterTicket(pro)} style={{ backgroundColor: COLORS.primary }}>
                          Accepter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="cancel-alerte-btn" onClick={nouvelleAlerte}>
                  Annuler l'alerte
                </button>
              </div>
            )}
          </div>
        )}

        {/* Historique */}
        {!alerteEnvoyee && (
          <section className="historique-section">
            <h2 className="section-title"><FiClock /> Mes alertes récentes</h2>
            <div className="historique-list">
              {alertesRecentes.map((alerte) => {
                const IconComponent = getCategoryIcon(alerte.categorie);
                return (
                  <div key={alerte.id} className="historique-card">
                    <div className="historique-icon" style={{ backgroundColor: `${getCategoryColor(alerte.categorie)}15` }}>
                      <IconComponent style={{ color: getCategoryColor(alerte.categorie) }} />
                    </div>
                    <div className="historique-info">
                      <h4>{getCategoryName(alerte.categorie)}</h4>
                      <p>{alerte.description}</p>
                      <div className="historique-meta">
                        <span className="date">{alerte.date}</span>
                        <span className="pro">• {alerte.professionnel}</span>
                      </div>
                    </div>
                    <div className="historique-status">
                      <span className={`status-badge ${alerte.statut}`}>
                        {alerte.statut === 'terminee' ? 'Terminée' : 'En cours'}
                      </span>
                      <span className="montant">{alerte.montant.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Comment ça marche */}
        <section className="how-it-works-section">
          <h2 className="section-title">Comment ça marche ?</h2>
          <div className="steps-grid">
            <div className="how-step">
              <div className="step-icon" style={{ backgroundColor: `${COLORS.primary}15` }}>
                <FiEdit3 style={{ color: COLORS.primary }} />
              </div>
              <h3>1. Décrivez votre besoin</h3>
              <p>Sélectionnez la catégorie et décrivez votre problème</p>
            </div>
            <div className="how-step">
              <div className="step-icon" style={{ backgroundColor: `${COLORS.secondary}15` }}>
                <FiBell style={{ color: COLORS.secondary }} />
              </div>
              <h3>2. Envoyez l'alerte</h3>
              <p>Les professionnels à proximité reçoivent votre demande</p>
            </div>
            <div className="how-step">
              <div className="step-icon" style={{ backgroundColor: '#fd7e1415' }}>
                <FiDollarSign style={{ color: '#fd7e14' }} />
              </div>
              <h3>3. Recevez les offres</h3>
              <p>Comparez les propositions et choisissez</p>
            </div>
            <div className="how-step">
              <div className="step-icon" style={{ backgroundColor: '#28a74515' }}>
                <FiCheckCircle style={{ color: '#28a745' }} />
              </div>
              <h3>4. Payez et c'est réglé</h3>
              <p>Le professionnel intervient rapidement</p>
            </div>
          </div>
        </section>
      </main>

      {/* POPUP TICKET */}
      {showTicketPopup && selectedTicket && (
        <>
          <div className="popup-overlay" onClick={() => setShowTicketPopup(false)}></div>
          <div className="ticket-popup">
            <button className="popup-close" onClick={() => setShowTicketPopup(false)}><FiX /></button>
            <div className="ticket-header">
              <h2>Ticket de paiement</h2>
              <p>Vérifiez les détails avant de payer</p>
            </div>
            <div className="ticket-content">
              <div className="ticket-pro">
                <img src={selectedTicket.photo} alt={selectedTicket.nom} />
                <div>
                  <h3>{selectedTicket.nom}</h3>
                  <p>{selectedTicket.profession}</p>
                </div>
              </div>
              <div className="ticket-details">
                <div className="ticket-row">
                  <span>Service</span>
                  <span>{getCategoryName(alerteForm.categorie)}</span>
                </div>
                <div className="ticket-row">
                  <span>Temps d'arrivée</span>
                  <span>{selectedTicket.tempsArrivee}</span>
                </div>
              </div>
              <div className="ticket-total">
                <span>Montant à payer</span>
                <span className="total-amount">{selectedTicket.montant.toLocaleString()} {selectedTicket.devise}</span>
              </div>
            </div>
            <div className="ticket-actions">
              <button className="cancel-btn" onClick={() => setShowTicketPopup(false)}>Annuler</button>
              <button className="pay-btn" onClick={procederPaiement} style={{ backgroundColor: COLORS.primary }}>
                <FiDollarSign /> Payer maintenant
              </button>
            </div>
          </div>
        </>
      )}

      {/* POPUP PAIEMENT */}
      {showPaymentPopup && selectedTicket && (
        <>
          <div className="popup-overlay" onClick={() => setShowPaymentPopup(false)}></div>
          <div className="payment-popup">
            <button className="popup-close" onClick={() => setShowPaymentPopup(false)}><FiX /></button>
            <div className="payment-header">
              <h2>Mode de paiement</h2>
              <p className="payment-amount">{selectedTicket.montant.toLocaleString()} {selectedTicket.devise}</p>
            </div>
            <div className="payment-methods">
              <button className="payment-method">
                <span>🟠</span>
                <span>Orange Money</span>
              </button>
              <button className="payment-method">
                <span>🟡</span>
                <span>MTN MoMo</span>
              </button>
              <button className="payment-method">
                <span>🔵</span>
                <span>Wave</span>
              </button>
              <button className="payment-method">
                <span>💳</span>
                <span>Carte bancaire</span>
              </button>
            </div>
            <div className="payment-phone">
              <label>Numéro de téléphone</label>
              <input type="tel" placeholder="+225 07 00 00 00 00" defaultValue={alerteForm.telephone} />
            </div>
            <button className="confirm-payment-btn" onClick={confirmerPaiement} style={{ backgroundColor: COLORS.primary }}>
              Confirmer le paiement
            </button>
          </div>
        </>
      )}

      {/* POPUP SUCCÈS */}
      {showSuccessPopup && selectedTicket && (
        <>
          <div className="popup-overlay"></div>
          <div className="success-popup">
            <div className="success-icon-wrapper">
              <FiCheckCircle />
            </div>
            <h2>Paiement réussi !</h2>
            <p>Le professionnel a été notifié et arrive bientôt</p>
            <div className="success-details">
              <div className="success-pro">
                <img src={selectedTicket.photo} alt={selectedTicket.nom} />
                <div>
                  <h3>{selectedTicket.nom}</h3>
                  <p>Arrive dans {selectedTicket.tempsArrivee}</p>
                </div>
              </div>
            </div>
            <div className="success-actions">
              <button className="contact-pro-btn" style={{ backgroundColor: COLORS.primary }}>
                <FiPhone /> Appeler le professionnel
              </button>
              <button className="new-alerte-btn" onClick={nouvelleAlerte}>
                Nouvelle alerte
              </button>
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
              <li><a href="/conditions" onClick={(e) => { e.preventDefault(); navigate('/conditions'); }}>Conditions</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-divider"></div>
        <div className="footer-bottom">
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon"><FaInstagram /></a>
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="social-icon"><FaWhatsapp /></a>
          </div>
          <p className="footer-copyright">© 2024 Jobty - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}

export default JobAlerte;