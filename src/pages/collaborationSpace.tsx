import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiX, FiMenu, FiUser, FiSend, FiCheck, FiClock, FiDollarSign,
  FiFile, FiPaperclip, FiMessageCircle, FiCheckCircle, FiAlertCircle,
  FiStar, FiLock, FiUnlock, FiDownload, FiUpload, FiEdit3,
  FiCalendar, FiTarget, FiList, FiArrowRight, FiArrowLeft,
  FiMic, FiSmile, FiAtSign, FiImage, FiPlay, FiPause,
  FiThumbsUp, FiThumbsDown, FiRefreshCw, FiShield, FiAward,
  FiZap, FiHeart, FiMessageSquare, FiChevronDown, FiChevronUp,
  FiMapPin, FiBriefcase, FiPhone, FiMail, FiExternalLink
} from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaHandshake, FaRocket } from 'react-icons/fa';
import { COLORS } from '../styles/colors';
import logo from '../assets/logo.png';
import './collaborationSpace.css';

function CollaborationSpace() {
  const navigate = useNavigate();
  const { freelanceId } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);
  
  // États de la collaboration
  const [currentStep, setCurrentStep] = useState(0); // 0 à 9
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  
  // États des données
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'freelance',
      text: 'Bonjour ! Merci de m\'avoir contacté. Je suis disponible pour discuter de votre projet. Pouvez-vous m\'en dire plus sur vos besoins ?',
      time: '10:30',
      date: 'Aujourd\'hui'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  // Brief du projet
  const [brief, setBrief] = useState({
    objectif: '',
    livrables: [],
    delai: '',
    budget: '',
    fichiers: [],
    commentairePro: ''
  });
  const [briefProgress, setBriefProgress] = useState(0);
  
  // Livrables prédéfinis
  const livrablesSuggestions = [
    'Maquette graphique',
    'Code source',
    'Documentation',
    'Formation/Tutoriel',
    'Fichiers sources (PSD, AI...)',
    'Révisions incluses',
    'Support post-livraison'
  ];
  
  // Étapes du projet
  const [etapes, setEtapes] = useState([
    { id: 1, titre: 'Maquette initiale', statut: 'en_cours', montant: 50000, progression: 65 },
    { id: 2, titre: 'Développement', statut: 'a_venir', montant: 100000, progression: 0 },
    { id: 3, titre: 'Tests & Livraison', statut: 'a_venir', montant: 50000, progression: 0 }
  ]);
  
  // Contrat
  const [contratAccepte, setContratAccepte] = useState({
    porteur: false,
    freelance: false
  });
  
  // Paiement
  const [paiementDepose, setPaiementDepose] = useState(false);
  const [modePaiement, setModePaiement] = useState('etapes'); // 'total' ou 'etapes'
  
  // Avis
  const [avis, setAvis] = useState({
    note: 0,
    commentaire: '',
    recommande: null
  });

  // Données du freelance
  const freelance = {
    id: 1,
    nom: 'Aminata Koné',
    poste: 'Développeuse Full Stack',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aminata',
    ville: 'Abidjan',
    pays: 'Côte d\'Ivoire',
    note: 4.8,
    avis: 47,
    projetsRealises: 89,
    tauxReponse: '98%',
    delaiReponse: '< 2h',
    competences: ['React', 'Node.js', 'MongoDB', 'UI/UX'],
    verified: true
  };

  // Données du porteur de projet
  const porteur = {
    nom: 'Marc Dubois',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marc',
    entreprise: 'StartupTech CI'
  };

  // Scroll automatique des messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Calcul progression brief
  useEffect(() => {
    let progress = 0;
    if (brief.objectif) progress += 25;
    if (brief.livrables.length > 0) progress += 25;
    if (brief.delai) progress += 25;
    if (brief.budget) progress += 25;
    setBriefProgress(progress);
  }, [brief]);

  // Fonctions utilitaires
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        sender: 'porteur',
        text: newMessage,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        date: 'Aujourd\'hui'
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
      
      // Simulation réponse du freelance
      setTimeout(() => {
        const reponse = {
          id: messages.length + 2,
          sender: 'freelance',
          text: 'Merci pour ces informations ! Je serais ravi de collaborer avec vous sur ce projet. 🚀',
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          date: 'Aujourd\'hui'
        };
        setMessages(prev => [...prev, reponse]);
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const accepterCollaboration = () => {
    setShowMatchAnimation(true);
    setTimeout(() => {
      setShowMatchAnimation(false);
      setCurrentStep(2);
    }, 3000);
  };

  const toggleLivrable = (livrable) => {
    if (brief.livrables.includes(livrable)) {
      setBrief({ ...brief, livrables: brief.livrables.filter(l => l !== livrable) });
    } else {
      setBrief({ ...brief, livrables: [...brief.livrables, livrable] });
    }
  };

  const validerBrief = () => {
    if (briefProgress === 100) {
      setCurrentStep(4);
    }
  };

  const accepterContrat = (partie) => {
    setContratAccepte({ ...contratAccepte, [partie]: true });
    if (partie === 'porteur' && contratAccepte.freelance) {
      setTimeout(() => setCurrentStep(5), 1000);
    }
  };

  const deposerPaiement = () => {
    setPaiementDepose(true);
    setTimeout(() => setCurrentStep(6), 2000);
  };

  const livrerEtape = (etapeId) => {
    setEtapes(etapes.map(e => 
      e.id === etapeId ? { ...e, statut: 'livree' } : e
    ));
  };

  const validerEtape = (etapeId) => {
    setEtapes(etapes.map(e => 
      e.id === etapeId ? { ...e, statut: 'validee' } : e
    ));
    
    // Vérifier si toutes les étapes sont validées
    const toutesValidees = etapes.every(e => e.id === etapeId || e.statut === 'validee');
    if (toutesValidees) {
      setTimeout(() => setCurrentStep(9), 1500);
    }
  };

  const demanderModification = (etapeId) => {
    setEtapes(etapes.map(e => 
      e.id === etapeId ? { ...e, statut: 'modification' } : e
    ));
  };

  const renderStars = (note, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar 
          key={i}
          className={`collab-star ${i <= note ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={() => interactive && setAvis({ ...avis, note: i })}
          style={{ 
            fill: i <= note ? '#FFD700' : 'none',
            color: i <= note ? '#FFD700' : '#ddd',
            cursor: interactive ? 'pointer' : 'default'
          }}
        />
      );
    }
    return stars;
  };

  const getStatutBadge = (statut) => {
    const statuts = {
      'a_venir': { label: 'À venir', color: '#6c757d', icon: FiClock },
      'en_cours': { label: 'En cours', color: '#fd7e14', icon: FiPlay },
      'livree': { label: 'Livrée', color: '#17a2b8', icon: FiUpload },
      'validee': { label: 'Validée', color: '#28a745', icon: FiCheckCircle },
      'modification': { label: 'Modification', color: '#dc3545', icon: FiRefreshCw }
    };
    const s = statuts[statut];
    const Icon = s.icon;
    return (
      <span className="collab-statut-badge" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
        <Icon /> {s.label}
      </span>
    );
  };

  // Étapes du processus
  const processSteps = [
    { num: 0, label: 'Prise de contact', icon: FiMessageCircle },
    { num: 1, label: 'Décision', icon: FiCheck },
    { num: 2, label: 'Match confirmé', icon: FaHandshake },
    { num: 3, label: 'Brief', icon: FiEdit3 },
    { num: 4, label: 'Contrat', icon: FiFile },
    { num: 5, label: 'Paiement', icon: FiLock },
    { num: 6, label: 'Collaboration', icon: FiTarget },
    { num: 7, label: 'Livraison', icon: FiUpload },
    { num: 8, label: 'Paiement libéré', icon: FiUnlock },
    { num: 9, label: 'Clôture', icon: FiAward }
  ];

  return (
    <div className="collab-page">
      {/* Animation Match */}
      {showMatchAnimation && (
        <div className="collab-match-overlay">
          <div className="collab-match-animation">
            <div className="collab-match-photos">
              <img src={porteur.photo} alt={porteur.nom} className="collab-match-photo" />
              <div className="collab-match-heart">
                <FaHandshake />
              </div>
              <img src={freelance.photo} alt={freelance.nom} className="collab-match-photo" />
            </div>
            <h2 className="collab-match-title">Match validé ! 🎉</h2>
            <p className="collab-match-subtitle">Votre espace de travail est prêt</p>
            <div className="collab-match-confetti"></div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="collab-header">
        <div className="collab-header-content">
          <div className="collab-logo" onClick={() => navigate('/')}>
            <img src={logo} alt="Jobty" />
          </div>

          <div className="collab-header-center">
            <span className="collab-header-title">
              <FaHandshake /> Espace Collaboration
            </span>
          </div>

          <div className="collab-header-actions">
            <button className="collab-back-btn" onClick={() => navigate(-1)}>
              <FiArrowLeft /> Retour
            </button>
            <button className="collab-burger-btn" onClick={toggleMenu}>
              <FiMenu />
            </button>
          </div>
        </div>
      </header>

      {/* Barre de progression */}
      <div className="collab-progress-bar">
        <div className="collab-progress-track">
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.num}
                className={`collab-progress-step ${currentStep >= step.num ? 'active' : ''} ${currentStep === step.num ? 'current' : ''}`}
              >
                <div className="collab-progress-icon">
                  <Icon />
                </div>
                <span className="collab-progress-label">{step.label}</span>
                {index < processSteps.length - 1 && (
                  <div className={`collab-progress-line ${currentStep > step.num ? 'filled' : ''}`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <main className="collab-main">
        <div className="collab-container">
          
          {/* Sidebar - Infos Freelance */}
          <aside className="collab-sidebar-info">
            <div className="collab-freelance-card">
              <div className="collab-freelance-header">
                <div className="collab-freelance-photo-wrapper">
                  <img src={freelance.photo} alt={freelance.nom} className="collab-freelance-photo" />
                  {freelance.verified && (
                    <span className="collab-verified-badge"><FiCheckCircle /></span>
                  )}
                </div>
                <div className="collab-freelance-info">
                  <h3>{freelance.nom}</h3>
                  <p>{freelance.poste}</p>
                  <div className="collab-freelance-location">
                    <FiMapPin /> {freelance.ville}, {freelance.pays}
                  </div>
                </div>
              </div>

              <div className="collab-freelance-stats">
                <div className="collab-stat-item">
                  <div className="collab-stat-value">
                    {renderStars(Math.floor(freelance.note))}
                    <span>{freelance.note}</span>
                  </div>
                  <div className="collab-stat-label">{freelance.avis} avis</div>
                </div>
                <div className="collab-stat-item">
                  <div className="collab-stat-value">{freelance.projetsRealises}</div>
                  <div className="collab-stat-label">Projets</div>
                </div>
                <div className="collab-stat-item">
                  <div className="collab-stat-value">{freelance.tauxReponse}</div>
                  <div className="collab-stat-label">Réponse</div>
                </div>
              </div>

              <div className="collab-freelance-competences">
                {freelance.competences.map((comp, index) => (
                  <span key={index} className="collab-comp-tag">{comp}</span>
                ))}
              </div>

              <div className="collab-security-badge">
                <FiShield /> Collaboration sécurisée par Jobty
              </div>
            </div>

            {/* Résumé du projet (affiché après le brief) */}
            {currentStep >= 3 && brief.objectif && (
              <div className="collab-project-summary">
                <h4><FiTarget /> Résumé du projet</h4>
                <div className="collab-summary-item">
                  <span className="collab-summary-label">Objectif</span>
                  <p>{brief.objectif}</p>
                </div>
                {brief.budget && (
                  <div className="collab-summary-item">
                    <span className="collab-summary-label">Budget</span>
                    <p className="collab-budget-display">{parseInt(brief.budget).toLocaleString()} FCFA</p>
                  </div>
                )}
                {brief.delai && (
                  <div className="collab-summary-item">
                    <span className="collab-summary-label">Délai</span>
                    <p>{brief.delai}</p>
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* Zone principale */}
          <div className="collab-workspace">
            
            {/* ÉTAPE 0 : Prise de contact */}
            {currentStep === 0 && (
              <div className="collab-step-content">
                <div className="collab-step-header">
                  <div className="collab-step-icon" style={{ backgroundColor: '#667eea20' }}>
                    <FiMessageCircle style={{ color: '#667eea' }} />
                  </div>
                  <div>
                    <h2>Prise de contact</h2>
                    <p>Présentez-vous et clarifiez vos besoins. Aucun engagement à cette étape.</p>
                  </div>
                </div>

                <div className="collab-alert-info">
                  <FiAlertCircle />
                  <span>Messagerie limitée - Pas de paiement, pas d'échange de coordonnées personnelles</span>
                </div>

                {/* Zone de chat */}
                <div className="collab-chat-container">
                  <div className="collab-messages">
                    {messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`collab-message ${msg.sender === 'porteur' ? 'sent' : 'received'}`}
                      >
                        <img 
                          src={msg.sender === 'porteur' ? porteur.photo : freelance.photo} 
                          alt="" 
                          className="collab-message-avatar"
                        />
                        <div className="collab-message-content">
                          <div className="collab-message-bubble">
                            {msg.text}
                          </div>
                          <span className="collab-message-time">{msg.time}</span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="collab-chat-input">
                    <button className="collab-input-btn">
                      <FiPaperclip />
                    </button>
                    <button className="collab-input-btn">
                      <FiImage />
                    </button>
                    <textarea
                      placeholder="Écrivez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      rows={1}
                    />
                    <button className="collab-input-btn">
                      <FiSmile />
                    </button>
                    <button 
                      className={`collab-input-btn mic ${isRecording ? 'recording' : ''}`}
                      onClick={() => setIsRecording(!isRecording)}
                    >
                      <FiMic />
                    </button>
                    <button className="collab-send-btn" onClick={sendMessage}>
                      <FiSend />
                    </button>
                  </div>
                </div>

                <div className="collab-step-actions">
                  <button 
                    className="collab-btn-primary"
                    onClick={() => setCurrentStep(1)}
                  >
                    <FaRocket /> Proposer une collaboration
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 1 : Décision du professionnel */}
            {currentStep === 1 && (
              <div className="collab-step-content">
                <div className="collab-step-header">
                  <div className="collab-step-icon" style={{ backgroundColor: '#fd7e1420' }}>
                    <FiCheck style={{ color: '#fd7e14' }} />
                  </div>
                  <div>
                    <h2>En attente de réponse</h2>
                    <p>Le professionnel examine votre demande de collaboration</p>
                  </div>
                </div>

                <div className="collab-waiting-card">
                  <div className="collab-waiting-animation">
                    <div className="collab-pulse-ring"></div>
                    <img src={freelance.photo} alt={freelance.nom} className="collab-waiting-photo" />
                  </div>
                  <h3>{freelance.nom}</h3>
                  <p>Délai de réponse habituel : {freelance.delaiReponse}</p>
                  
                  <div className="collab-waiting-options">
                    <div className="collab-option-card accept">
                      <FiCheckCircle />
                      <span>Accepter</span>
                    </div>
                    <div className="collab-option-card info">
                      <FiMessageCircle />
                      <span>Plus d'infos</span>
                    </div>
                    <div className="collab-option-card decline">
                      <FiX />
                      <span>Refuser</span>
                    </div>
                  </div>
                </div>

                {/* Simulation pour la démo */}
                <div className="collab-demo-actions">
                  <p className="collab-demo-note">🎮 Demo : Simuler la réponse du freelance</p>
                  <button 
                    className="collab-btn-success"
                    onClick={accepterCollaboration}
                  >
                    <FiCheck /> Le freelance accepte
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 : Match confirmé */}
            {currentStep === 2 && (
              <div className="collab-step-content">
                <div className="collab-step-header success">
                  <div className="collab-step-icon" style={{ backgroundColor: '#28a74520' }}>
                    <FaHandshake style={{ color: '#28a745' }} />
                  </div>
                  <div>
                    <h2>On bosse ensemble ! 🎉</h2>
                    <p>Votre espace projet privé a été créé</p>
                  </div>
                </div>

                <div className="collab-match-success-card">
                  <div className="collab-match-users">
                    <div className="collab-match-user">
                      <img src={porteur.photo} alt={porteur.nom} />
                      <span>{porteur.nom}</span>
                      <span className="collab-role">Porteur de projet</span>
                    </div>
                    <div className="collab-match-connector">
                      <FaHandshake />
                    </div>
                    <div className="collab-match-user">
                      <img src={freelance.photo} alt={freelance.nom} />
                      <span>{freelance.nom}</span>
                      <span className="collab-role">Professionnel</span>
                    </div>
                  </div>

                  <div className="collab-features-list">
                    <div className="collab-feature-item">
                      <FiCheckCircle className="collab-feature-check" />
                      <span>Espace privé sécurisé</span>
                    </div>
                    <div className="collab-feature-item">
                      <FiCheckCircle className="collab-feature-check" />
                      <span>Historique horodaté (preuves légales)</span>
                    </div>
                    <div className="collab-feature-item">
                      <FiCheckCircle className="collab-feature-check" />
                      <span>Paiement sécurisé</span>
                    </div>
                    <div className="collab-feature-item">
                      <FiCheckCircle className="collab-feature-check" />
                      <span>Support Jobty 24/7</span>
                    </div>
                  </div>
                </div>

                <div className="collab-step-actions">
                  <button 
                    className="collab-btn-primary"
                    onClick={() => setCurrentStep(3)}
                  >
                    <FiEdit3 /> Rédiger le brief du projet
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 : Brief express */}
            {currentStep === 3 && (
              <div className="collab-step-content">
                <div className="collab-step-header">
                  <div className="collab-step-icon" style={{ backgroundColor: '#667eea20' }}>
                    <FiEdit3 style={{ color: '#667eea' }} />
                  </div>
                  <div>
                    <h2>Brief express</h2>
                    <p>Décrivez votre projet de manière simple et claire</p>
                  </div>
                </div>

                {/* Barre de progression du brief */}
                <div className="collab-brief-progress">
                  <div className="collab-brief-progress-bar">
                    <div 
                      className="collab-brief-progress-fill"
                      style={{ width: `${briefProgress}%` }}
                    ></div>
                  </div>
                  <span className={`collab-brief-progress-text ${briefProgress === 100 ? 'complete' : ''}`}>
                    {briefProgress === 100 ? '✅ Brief complété !' : `Brief complété à ${briefProgress}%`}
                  </span>
                </div>

                <div className="collab-brief-form">
                  {/* Objectif */}
                  <div className="collab-form-group">
                    <label>
                      <FiTarget /> Objectif du projet *
                    </label>
                    <textarea
                      placeholder="Décrivez ce que vous souhaitez réaliser..."
                      value={brief.objectif}
                      onChange={(e) => setBrief({ ...brief, objectif: e.target.value })}
                      rows={3}
                    />
                  </div>

                  {/* Livrables */}
                  <div className="collab-form-group">
                    <label>
                      <FiList /> Livrables attendus *
                    </label>
                    <div className="collab-livrables-grid">
                      {livrablesSuggestions.map((livrable, index) => (
                        <div 
                          key={index}
                          className={`collab-livrable-item ${brief.livrables.includes(livrable) ? 'selected' : ''}`}
                          onClick={() => toggleLivrable(livrable)}
                        >
                          <FiCheckCircle />
                          <span>{livrable}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Délai */}
                  <div className="collab-form-group">
                    <label>
                      <FiCalendar /> Délai souhaité *
                    </label>
                    <select
                      value={brief.delai}
                      onChange={(e) => setBrief({ ...brief, delai: e.target.value })}
                    >
                      <option value="">Sélectionnez un délai</option>
                      <option value="Moins d'1 semaine">Moins d'1 semaine</option>
                      <option value="1-2 semaines">1-2 semaines</option>
                      <option value="2-4 semaines">2-4 semaines</option>
                      <option value="1-2 mois">1-2 mois</option>
                      <option value="Plus de 2 mois">Plus de 2 mois</option>
                    </select>
                  </div>

                  {/* Budget */}
                  <div className="collab-form-group">
                    <label>
                      <FiDollarSign /> Budget validé *
                    </label>
                    <div className="collab-budget-input">
                      <input
                        type="number"
                        placeholder="Ex: 200000"
                        value={brief.budget}
                        onChange={(e) => setBrief({ ...brief, budget: e.target.value })}
                      />
                      <span className="collab-currency">FCFA</span>
                    </div>
                  </div>

                  {/* Fichiers */}
                  <div className="collab-form-group">
                    <label>
                      <FiPaperclip /> Fichiers utiles (optionnel)
                    </label>
                    <div className="collab-upload-zone">
                      <FiUpload />
                      <span>Glissez vos fichiers ici ou cliquez pour uploader</span>
                      <small>PDF, Images, Documents (max 10MB)</small>
                    </div>
                  </div>
                </div>

                {/* Zone commentaire du pro */}
                <div className="collab-pro-comment">
                  <div className="collab-pro-comment-header">
                    <img src={freelance.photo} alt={freelance.nom} />
                    <span>Commentaire de {freelance.nom.split(' ')[0]}</span>
                  </div>
                  <div className="collab-pro-comment-content">
                    <p>Le brief me semble clair ! Je suis prêt à démarrer dès validation. 👍</p>
                  </div>
                </div>

                <div className="collab-step-actions">
                  <button 
                    className="collab-btn-secondary"
                    onClick={() => setCurrentStep(2)}
                  >
                    <FiArrowLeft /> Retour
                  </button>
                  <button 
                    className={`collab-btn-primary ${briefProgress < 100 ? 'disabled' : ''}`}
                    onClick={validerBrief}
                    disabled={briefProgress < 100}
                  >
                    <FiCheck /> Valider le brief
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 4 : Contrat intelligent */}
            {currentStep === 4 && (
              <div className="collab-step-content">
                <div className="collab-step-header">
                  <div className="collab-step-icon" style={{ backgroundColor: '#17a2b820' }}>
                    <FiFile style={{ color: '#17a2b8' }} />
                  </div>
                  <div>
                    <h2>Contrat digital simplifié</h2>
                    <p>Validez les termes de votre collaboration en 1 clic</p>
                  </div>
                </div>

                <div className="collab-contrat-card">
                  <div className="collab-contrat-header">
                    <img src={logo} alt="Jobty" className="collab-contrat-logo" />
                    <div>
                      <h3>Contrat de prestation Jobty</h3>
                      <span>Généré automatiquement le {new Date().toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <div className="collab-contrat-body">
                    <div className="collab-contrat-parties">
                      <div className="collab-contrat-partie">
                        <h4>Porteur de projet</h4>
                        <p>{porteur.nom}</p>
                        <span>{porteur.entreprise}</span>
                      </div>
                      <div className="collab-contrat-vs">×</div>
                      <div className="collab-contrat-partie">
                        <h4>Prestataire</h4>
                        <p>{freelance.nom}</p>
                        <span>{freelance.poste}</span>
                      </div>
                    </div>

                    <div className="collab-contrat-section">
                      <h4><FiTarget /> Objet du contrat</h4>
                      <p>{brief.objectif || 'Développement d\'une application web responsive'}</p>
                    </div>

                    <div className="collab-contrat-section">
                      <h4><FiList /> Livrables</h4>
                      <ul>
                        {brief.livrables.length > 0 ? (
                          brief.livrables.map((l, i) => <li key={i}>{l}</li>)
                        ) : (
                          <>
                            <li>Maquette graphique</li>
                            <li>Code source</li>
                            <li>Documentation</li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="collab-contrat-row">
                      <div className="collab-contrat-section half">
                        <h4><FiCalendar /> Délai</h4>
                        <p>{brief.delai || '2-4 semaines'}</p>
                      </div>
                      <div className="collab-contrat-section half">
                        <h4><FiDollarSign /> Montant total</h4>
                        <p className="collab-contrat-amount">
                          {brief.budget ? parseInt(brief.budget).toLocaleString() : '200 000'} FCFA
                        </p>
                      </div>
                    </div>

                    <div className="collab-contrat-section">
                      <h4><FiShield /> Conditions Jobty</h4>
                      <ul className="collab-conditions">
                        <li>Paiement sécurisé via séquestre Jobty</li>
                        <li>Libération des fonds après validation</li>
                        <li>Médiation Jobty en cas de litige</li>
                        <li>Historique complet conservé 2 ans</li>
                      </ul>
                    </div>
                  </div>

                  <div className="collab-contrat-signatures">
                    <div className={`collab-signature ${contratAccepte.porteur ? 'signed' : ''}`}>
                      <img src={porteur.photo} alt={porteur.nom} />
                      <span>{porteur.nom}</span>
                      {contratAccepte.porteur ? (
                        <div className="collab-signature-done">
                          <FiCheckCircle /> Signé
                        </div>
                      ) : (
                        <button 
                          className="collab-sign-btn"
                          onClick={() => accepterContrat('porteur')}
                        >
                          J'accepte
                        </button>
                      )}
                    </div>
                    
                    <div className={`collab-signature ${contratAccepte.freelance ? 'signed' : ''}`}>
                      <img src={freelance.photo} alt={freelance.nom} />
                      <span>{freelance.nom}</span>
                      {contratAccepte.freelance ? (
                        <div className="collab-signature-done">
                          <FiCheckCircle /> Signé
                        </div>
                      ) : (
                        <button 
                          className="collab-sign-btn"
                          onClick={() => accepterContrat('freelance')}
                        >
                          J'accepte
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Simulation pour la démo */}
                {!contratAccepte.freelance && (
                  <div className="collab-demo-actions">
                    <p className="collab-demo-note">🎮 Demo : Simuler la signature du freelance</p>
                    <button 
                      className="collab-btn-outline"
                      onClick={() => setContratAccepte({ ...contratAccepte, freelance: true })}
                    >
                      <FiCheck /> Le freelance signe
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 5 : Paiement sécurisé */}
            {currentStep === 5 && (
              <div className="collab-step-content">
                <div className="collab-step-header">
                  <div className="collab-step-icon" style={{ backgroundColor: '#28a74520' }}>
                    <FiLock style={{ color: '#28a745' }} />
                  </div>
                  <div>
                    <h2>Paiement sécurisé</h2>
                    <p>Déposez le paiement - Il restera bloqué jusqu'à validation des livrables</p>
                  </div>
                </div>

                <div className="collab-paiement-card">
                  <div className="collab-paiement-mode">
                    <label className="collab-radio-card">
                      <input 
                        type="radio" 
                        name="mode" 
                        value="etapes"
                        checked={modePaiement === 'etapes'}
                        onChange={() => setModePaiement('etapes')}
                      />
                      <div className="collab-radio-content">
                        <div className="collab-radio-icon recommended">
                          <FiList />
                          <span className="collab-badge-recommended">Recommandé</span>
                        </div>
                        <h4>Paiement par étapes</h4>
                        <p>Déblocage progressif selon les livrables validés</p>
                      </div>
                    </label>
                    <label className="collab-radio-card">
                      <input 
                        type="radio" 
                        name="mode" 
                        value="total"
                        checked={modePaiement === 'total'}
                        onChange={() => setModePaiement('total')}
                      />
                      <div className="collab-radio-content">
                        <div className="collab-radio-icon">
                          <FiDollarSign />
                        </div>
                        <h4>Paiement total</h4>
                        <p>Déblocage unique à la fin du projet</p>
                      </div>
                    </label>
                  </div>

                  {modePaiement === 'etapes' && (
                    <div className="collab-etapes-paiement">
                      <h4>Répartition par étapes</h4>
                      {etapes.map((etape, index) => (
                        <div key={etape.id} className="collab-etape-paiement-item">
                          <span className="collab-etape-num">Étape {index + 1}</span>
                          <span className="collab-etape-titre">{etape.titre}</span>
                          <span className="collab-etape-montant">{etape.montant.toLocaleString()} FCFA</span>
                        </div>
                      ))}
                      <div className="collab-paiement-total">
                        <span>Total</span>
                        <span>{etapes.reduce((sum, e) => sum + e.montant, 0).toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  )}

                  {modePaiement === 'total' && (
                    <div className="collab-total-paiement">
                      <div className="collab-paiement-total">
                        <span>Montant total</span>
                        <span>{(brief.budget ? parseInt(brief.budget) : 200000).toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  )}

                  <div className="collab-paiement-secure-info">
                    <FiShield />
                    <div>
                      <h5>Votre argent est sécurisé</h5>
                      <p>Les fonds sont conservés par Jobty et libérés uniquement après votre validation des livrables.</p>
                    </div>
                  </div>

                  <button 
                    className={`collab-btn-primary collab-btn-large ${paiementDepose ? 'success' : ''}`}
                    onClick={deposerPaiement}
                    disabled={paiementDepose}
                  >
                    {paiementDepose ? (
                      <>
                        <FiCheckCircle /> Paiement déposé avec succès !
                      </>
                    ) : (
                      <>
                        <FiLock /> Déposer le paiement
                      </>
                    )}
                  </button>
                </div>

                {paiementDepose && (
                  <div className="collab-success-message">
                    <FiCheckCircle />
                    <div>
                      <h4>Parfait ! Le pro peut commencer.</h4>
                      <p>Votre argent est sécurisé. Redirection vers l'espace de travail...</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 6 : Tableau de collaboration */}
            {currentStep === 6 && (
              <div className="collab-step-content collab-workspace-view">
                <div className="collab-step-header">
                  <div className="collab-step-icon" style={{ backgroundColor: '#667eea20' }}>
                    <FiTarget style={{ color: '#667eea' }} />
                  </div>
                  <div>
                    <h2>Tableau de collaboration</h2>
                    <p>Suivez l'avancement de votre projet en temps réel</p>
                  </div>
                </div>

                {/* Timeline du projet */}
                <div className="collab-timeline">
                  <h3><FiList /> Timeline du projet</h3>
                  <div className="collab-timeline-items">
                    {etapes.map((etape, index) => (
                      <div key={etape.id} className={`collab-timeline-item ${etape.statut}`}>
                        <div className="collab-timeline-marker">
                          {etape.statut === 'validee' ? <FiCheckCircle /> : 
                           etape.statut === 'en_cours' ? <FiPlay /> :
                           etape.statut === 'livree' ? <FiUpload /> :
                           <FiClock />}
                        </div>
                        <div className="collab-timeline-content">
                          <div className="collab-timeline-header">
                            <h4>Étape {index + 1}: {etape.titre}</h4>
                            {getStatutBadge(etape.statut)}
                          </div>
                          {etape.statut === 'en_cours' && (
                            <div className="collab-progress-mini">
                              <div className="collab-progress-bar-mini">
                                <div 
                                  className="collab-progress-fill-mini"
                                  style={{ width: `${etape.progression}%` }}
                                ></div>
                              </div>
                              <span>{etape.progression}%</span>
                            </div>
                          )}
                          <div className="collab-timeline-amount">
                            <FiDollarSign /> {etape.montant.toLocaleString()} FCFA
                            {etape.statut === 'validee' && (
                              <span className="collab-released">💰 Libéré</span>
                            )}
                          </div>
                          
                          {/* Actions selon statut */}
                          {etape.statut === 'en_cours' && (
                            <div className="collab-timeline-actions">
                              <button 
                                className="collab-btn-sm collab-btn-outline"
                                onClick={() => livrerEtape(etape.id)}
                              >
                                <FiUpload /> Marquer comme livrée (démo)
                              </button>
                            </div>
                          )}
                          {etape.statut === 'livree' && (
                            <div className="collab-timeline-actions">
                              <button 
                                className="collab-btn-sm collab-btn-success"
                                onClick={() => validerEtape(etape.id)}
                              >
                                <FiCheck /> Valider
                              </button>
                              <button 
                                className="collab-btn-sm collab-btn-warning"
                                onClick={() => demanderModification(etape.id)}
                              >
                                <FiRefreshCw /> Demander modification
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Messagerie projet */}
                <div className="collab-project-chat">
                  <h3><FiMessageSquare /> Messagerie projet</h3>
                  <div className="collab-chat-container small">
                    <div className="collab-messages">
                      {messages.slice(-3).map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`collab-message ${msg.sender === 'porteur' ? 'sent' : 'received'}`}
                        >
                          <img 
                            src={msg.sender === 'porteur' ? porteur.photo : freelance.photo} 
                            alt="" 
                            className="collab-message-avatar"
                          />
                          <div className="collab-message-content">
                            <div className="collab-message-bubble">
                              {msg.text}
                            </div>
                            <span className="collab-message-time">{msg.time}</span>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="collab-chat-input compact">
                      <input
                        type="text"
                        placeholder="Votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                      <button className="collab-send-btn" onClick={sendMessage}>
                        <FiSend />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="collab-demo-actions">
                  <p className="collab-demo-note">🎮 Demo : Simuler la validation de toutes les étapes</p>
                  <button 
                    className="collab-btn-outline"
                    onClick={() => {
                      setEtapes(etapes.map(e => ({ ...e, statut: 'validee' })));
                      setTimeout(() => setCurrentStep(9), 1500);
                    }}
                  >
                    <FiCheck /> Tout valider et clôturer
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 9 : Clôture & Avis */}
            {currentStep === 9 && (
              <div className="collab-step-content">
                <div className="collab-step-header success">
                  <div className="collab-step-icon" style={{ backgroundColor: '#28a74520' }}>
                    <FiAward style={{ color: '#28a745' }} />
                  </div>
                  <div>
                    <h2>Projet terminé ! 🎉</h2>
                    <p>Félicitations pour cette belle collaboration</p>
                  </div>
                </div>

                <div className="collab-cloture-card">
                  <div className="collab-cloture-header">
                    <div className="collab-cloture-badge">
                      <FiCheckCircle />
                      <span>Collaboration réussie</span>
                    </div>
                  </div>

                  <div className="collab-cloture-summary">
                    <div className="collab-cloture-item">
                      <FiDollarSign />
                      <div>
                        <span className="collab-cloture-label">Montant total</span>
                        <span className="collab-cloture-value">{etapes.reduce((sum, e) => sum + e.montant, 0).toLocaleString()} FCFA</span>
                      </div>
                    </div>
                    <div className="collab-cloture-item">
                      <FiCalendar />
                      <div>
                        <span className="collab-cloture-label">Durée du projet</span>
                        <span className="collab-cloture-value">14 jours</span>
                      </div>
                    </div>
                    <div className="collab-cloture-item">
                      <FiList />
                      <div>
                        <span className="collab-cloture-label">Étapes validées</span>
                        <span className="collab-cloture-value">{etapes.length}/{etapes.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notation */}
                  <div className="collab-rating-section">
                    <h3>Notez votre collaboration avec {freelance.nom.split(' ')[0]}</h3>
                    <div className="collab-rating-stars">
                      {renderStars(avis.note, true)}
                    </div>
                    <textarea
                      placeholder="Partagez votre expérience (optionnel)"
                      value={avis.commentaire}
                      onChange={(e) => setAvis({ ...avis, commentaire: e.target.value })}
                      rows={3}
                    />
                    <div className="collab-recommande">
                      <span>Recommanderiez-vous ce professionnel ?</span>
                      <div className="collab-recommande-btns">
                        <button 
                          className={`collab-recommande-btn ${avis.recommande === true ? 'active yes' : ''}`}
                          onClick={() => setAvis({ ...avis, recommande: true })}
                        >
                          <FiThumbsUp /> Oui
                        </button>
                        <button 
                          className={`collab-recommande-btn ${avis.recommande === false ? 'active no' : ''}`}
                          onClick={() => setAvis({ ...avis, recommande: false })}
                        >
                          <FiThumbsDown /> Non
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Badges gagnés */}
                  <div className="collab-badges-section">
                    <h4><FiAward /> Badges obtenus</h4>
                    <div className="collab-badges-grid">
                      <div className="collab-badge-item">
                        <div className="collab-badge-icon gold">
                          <FaHandshake />
                        </div>
                        <span>Collaboration réussie</span>
                      </div>
                      <div className="collab-badge-item">
                        <div className="collab-badge-icon blue">
                          <FiZap />
                        </div>
                        <span>Livraison rapide</span>
                      </div>
                      <div className="collab-badge-item">
                        <div className="collab-badge-icon green">
                          <FiShield />
                        </div>
                        <span>Paiement sécurisé</span>
                      </div>
                    </div>
                  </div>

                  <div className="collab-step-actions">
                    <button 
                      className="collab-btn-secondary"
                      onClick={() => navigate('/marketplace')}
                    >
                      <FiArrowLeft /> Retour au marketplace
                    </button>
                    <button 
                      className="collab-btn-primary"
                      onClick={() => {
                        // Soumettre l'avis
                        alert('Merci pour votre avis ! 🙏');
                        navigate('/');
                      }}
                    >
                      <FiSend /> Publier mon avis
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="collab-footer">
        <div className="collab-footer-content">
          <div className="collab-footer-security">
            <FiShield />
            <span>Espace sécurisé par Jobty - Toutes les interactions sont archivées et horodatées</span>
          </div>
          <div className="collab-footer-links">
            <a href="/aide">Aide</a>
            <a href="/conditions">CGU</a>
            <a href="/contact">Contact support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CollaborationSpace;