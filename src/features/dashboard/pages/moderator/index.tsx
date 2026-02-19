import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../../../../features/auth/hooks/useAuthMutations';
import { 
  FiMenu, FiX, FiUser, FiBell, FiSettings, FiLogOut,
  FiDollarSign, FiBriefcase, FiCheckCircle, FiStar,
  FiEdit3, FiPlus, FiMapPin, FiClock, FiEye,
  FiMessageCircle, FiHeart, FiShare2, FiTrash2,
  FiImage, FiLink, FiPlay, FiAward, FiTrendingUp,
  FiCalendar, FiTarget, FiZap, FiShield, FiGrid,
  FiList, FiFilter, FiSearch, FiMoreVertical, FiCamera,
  FiSave, FiLock, FiGlobe, FiDownload, FiUpload, 
  FiCreditCard, FiFileText, FiAlertCircle, FiActivity,
  FiBarChart2, FiPieChart, FiMap, FiUsers, FiAlertTriangle,
  FiUserCheck, FiUserX, FiRefreshCw, FiChevronDown,
  FiChevronRight, FiCheck, FiXCircle, FiPauseCircle,
  FiHome, FiDatabase, FiPercent, FiMail, FiPhone, 
} from 'react-icons/fi';
import { 
  FaHandshake, FaRocket, FaBalanceScale, FaUserShield,
  FaChartLine, FaMapMarkedAlt 
} from 'react-icons/fa';
import logo from '../../../../assets/logo.png';
import ProfileDrawer from '../../../../components/shared/ProfileDrawer';
import './css/style.css';

function ModeratorDashboard() {
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('apercu');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [kycDetail, setKycDetail] = useState(null);
  const [litigeDetail, setLitigeDetail] = useState(null);
  
  // Données Admin
  const adminUser = {
    nom: 'Admin',
    prenom: 'Julie',
    role: 'Super Admin',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminJulie'
  };

  // Statistiques en temps réel
  const statsToday = {
    nouveauxUsers: 127,
    nouveauxProjets: 45,
    commissions: 124500,
    satisfaction: 4.8,
    trendUsers: 23,
    trendProjets: 18,
    trendCommissions: 12
  };

  const statsMonth = {
    usersActifs: 2340,
    projets: 890,
    volume: 3200000,
    contrats: 234,
    quotaUsers: 78,
    trendProjets: 45,
    trendContrats: 32
  };

  // Alertes importantes
  const alertes = [
    { type: 'warning', message: '12 litiges en attente de résolution' },
    { type: 'danger', message: '3 paiements bloqués depuis +48h' },
    { type: 'info', message: '8 vérifications KYC en attente' },
    { type: 'success', message: 'Pic d\'activité inhabituel détecté (Nigeria +340%)' }
  ];

  // Utilisateurs
  const users = [
    {
      id: 'USER-12345',
      nom: 'Diallo',
      prenom: 'Amadou',
      email: 'amadou.diallo@email.com',
      tel: '+221 77 123 45 67',
      type: 'Pro',
      specialite: 'Développeur',
      pays: 'Sénégal',
      ville: 'Dakar',
      statut: 'actif',
      certifie: true,
      kyc: 'verifie',
      note: 4.9,
      nbAvis: 18,
      inscrit: '12/01/2025',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amadou',
      stats: {
        projetsCompletes: 23,
        volumeTotal: 2300000,
        tauxSucces: 92,
        tauxReponse: 98,
        delaiMoyen: 2.3,
        messagesEnvoyes: 234,
        projetsEnCours: 3
      },
      finances: {
        revenusTotal: 2345000,
        enAttente: 125000,
        paye: 2220000,
        sequestreActif: 125000,
        dernierPaiement: '03/01/2025'
      }
    },
    {
      id: 'USER-67890',
      nom: 'Kouassi',
      prenom: 'Fatima',
      email: 'fatima.k@email.com',
      tel: '+225 07 12 34 56',
      type: 'Client',
      pays: 'Côte d\'Ivoire',
      ville: 'Abidjan',
      statut: 'suspendu',
      certifie: false,
      kyc: 'en_attente',
      note: 4.2,
      nbAvis: 5,
      inscrit: '08/01/2025',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima'
    }
  ];

  // File d'attente KYC
  const kycQueue = [
    {
      id: 'KYC-7821',
      userId: 'USER-98765',
      nom: 'Mohammed',
      prenom: 'Ibrahim',
      type: 'Pro',
      specialite: 'Développeur',
      pays: 'Nigeria',
      typeDoc: 'CNI + Selfie',
      soumis: '03/01/2025',
      delai: '48h',
      priorite: 'urgent',
      documents: {
        cniRecto: '/docs/cni_recto.jpg',
        cniVerso: '/docs/cni_verso.jpg',
        selfie: '/docs/selfie.jpg'
      },
      scoreIA: 87,
      authenticite: 92,
      correspondance: 89
    },
    {
      id: 'KYC-7822',
      userId: 'USER-11111',
      nom: 'Bah',
      prenom: 'Aïcha',
      type: 'Pro',
      specialite: 'Designer',
      pays: 'Sénégal',
      typeDoc: 'Passeport',
      soumis: '04/01/2025',
      delai: '12h',
      priorite: 'normal'
    },
    {
      id: 'KYC-7823',
      userId: 'USER-22222',
      nom: 'Asante',
      prenom: 'Kofi',
      type: 'Client',
      pays: 'Ghana',
      typeDoc: 'Permis',
      soumis: '04/01/2025',
      delai: '2h',
      priorite: 'faible'
    }
  ];

  // Projets
  const projets = [
    {
      id: 'P-123',
      titre: 'App mobile e-commerce',
      client: 'Kofi Asante',
      clientId: 'USER-456',
      pays: 'Ghana',
      budget: 2500000,
      statut: 'ouvert',
      candidatures: 3,
      dateCreation: '02/01/2025'
    },
    {
      id: 'P-122',
      titre: 'Site vitrine',
      client: 'Fatima Kouassi',
      clientId: 'USER-67890',
      pays: 'Côte d\'Ivoire',
      budget: 500000,
      statut: 'en_attente',
      candidatures: 0,
      dateCreation: '03/01/2025'
    },
    {
      id: 'P-121',
      titre: 'Logo entreprise',
      client: 'Amadou Diallo',
      clientId: 'USER-12345',
      pays: 'Sénégal',
      budget: 150000,
      statut: 'en_cours',
      candidatures: 1,
      dateCreation: '01/01/2025'
    }
  ];

  // Transactions
  const transactions = [
    {
      id: 'T-8821',
      date: '04/01/2025 15:23',
      de: 'Kofi A.',
      vers: 'Séquestre',
      montant: 250000,
      type: 'Dépôt',
      methode: 'Carte',
      statut: 'valide'
    },
    {
      id: 'T-8820',
      date: '04/01/2025 14:12',
      de: 'Séquestre',
      vers: 'Ibrahim M.',
      montant: 125000,
      type: 'Payout',
      methode: 'MTN Money',
      statut: 'en_cours'
    },
    {
      id: 'T-8819',
      date: '04/01/2025 12:45',
      de: 'Fatima K.',
      vers: 'Séquestre',
      montant: 450000,
      type: 'Dépôt',
      methode: 'Orange Money',
      statut: 'valide'
    }
  ];

  // Litiges
  const litiges = [
    {
      id: 'L-234',
      projetId: 'P-123',
      titre: 'Travail non conforme',
      montant: 2500000,
      plaignant: 'Kofi Asante',
      defendeur: 'Ibrahim Mohammed',
      ouvertDepuis: '7 jours',
      priorite: 'urgent',
      statut: 'escalade'
    },
    {
      id: 'L-233',
      projetId: 'P-122',
      titre: 'Problème de qualité',
      montant: 500000,
      plaignant: 'Fatima K.',
      defendeur: 'Aïcha B.',
      ouvertDepuis: '3 jours',
      priorite: 'moyen',
      statut: 'en_cours'
    },
    {
      id: 'L-232',
      projetId: 'P-121',
      titre: 'Retard de livraison',
      montant: 150000,
      plaignant: 'Amadou D.',
      defendeur: 'Client123',
      ouvertDepuis: '1 jour',
      priorite: 'faible',
      statut: 'nouveau'
    }
  ];

  // Analytics
  const analytics = {
    users: {
      total: 12340,
      nouveaux: 2340,
      actifs: 8920,
      professionals: 4120,
      clients: 8220,
      retention30j: 68,
      activation: 82
    },
    projets: {
      crees: 890,
      completes: 234,
      enCours: 178,
      annules: 56,
      tauxSucces: 68,
      budgetMoyen: 345000,
      tempsMatching: 2.3
    },
    finances: {
      volumeTotal: 12450000,
      commissions: 1245000,
      croissance: 23,
      ltv: 487000,
      cac: 12500
    },
    geo: [
      { pays: 'Nigeria', users: 3240, pct: 26, flag: '🇳🇬' },
      { pays: 'Sénégal', users: 2890, pct: 23, flag: '🇸🇳' },
      { pays: "Côte d'Ivoire", users: 2120, pct: 17, flag: '🇨🇮' },
      { pays: 'Ghana', users: 1890, pct: 15, flag: '🇬🇭' },
      { pays: 'Kenya', users: 1340, pct: 11, flag: '🇰🇪' }
    ]
  };

  // Modérateurs
  const moderateurs = [
    {
      id: 'MOD-001',
      nom: 'Konate',
      prenom: 'Sarah',
      role: 'Modérateur Senior',
      email: 'sarah.konate@jobty.com',
      depuis: '12/2023',
      permissions: ['KYC', 'Litiges', 'Support'],
      statut: 'en_ligne',
      stats: {
        kycVerifies: 23,
        litigesResolus: 8,
        usersModeres: 12,
        tempsReponse: 1.2
      }
    },
    {
      id: 'MOD-002',
      nom: 'Martin',
      prenom: 'Paul',
      role: 'Modérateur',
      email: 'paul.martin@jobty.com',
      depuis: '03/2024',
      permissions: ['KYC', 'Users'],
      statut: 'hors_ligne',
      derniereActivite: 'il y a 2h',
      stats: {
        kycVerifies: 15,
        litigesResolus: 3,
        usersModeres: 5,
        tempsReponse: 3.4
      }
    }
  ];

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);
  const openProfile = () => setProfileOpen(true);
  const closeProfile = () => setProfileOpen(false);

  const getStatutBadge = (statut) => {
    const statuts = {
      'actif': { label: 'Actif', color: '#4CAF50' },
      'suspendu': { label: 'Suspendu', color: '#FF9800' },
      'banni': { label: 'Banni', color: '#F44336' },
      'en_attente': { label: 'En attente', color: '#FFD700' },
      'ouvert': { label: 'Ouvert', color: '#4CAF50' },
      'en_cours': { label: 'En cours', color: '#3DC7C9' },
      'termine': { label: 'Terminé', color: '#28a745' },
      'annule': { label: 'Annulé', color: '#F44336' },
      'valide': { label: 'Validé', color: '#4CAF50' },
      'en_ligne': { label: 'En ligne', color: '#4CAF50' },
      'hors_ligne': { label: 'Hors ligne', color: '#9E9E9E' },
      'escalade': { label: 'Escaladé', color: '#F44336' },
      'nouveau': { label: 'Nouveau', color: '#3DC7C9' }
    };
    const s = statuts[statut] || { label: statut, color: '#9E9E9E' };
    return (
      <span className="admin-badge" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
        {s.label}
      </span>
    );
  };

  const getPrioriteBadge = (priorite) => {
  const priorites = {
    'urgent': { label: '🔴 Urgent', color: '#F44336' },
    'moyen': { label: '🟡 Moyen', color: '#FF9800' },
    'normal': { label: '🟡 Normal', color: '#FF9800' },
    'faible': { label: '🟢 Faible', color: '#4CAF50' }
  };
  
  // ✅ VÉRIFICATION IMPORTANTE - évite l'erreur
  if (!priorite || !priorites[priorite]) {
    return (
      <span className="admin-priority-badge">
        🔵 Non défini
      </span>
    );
  }
  
  const p = priorites[priorite];
  
  return (
    <span className="admin-priority-badge">
      {p.label}
    </span>
  );
};

  const renderStars = (note) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar 
          key={i} 
          style={{ 
            fill: i <= Math.floor(note) ? '#FFD700' : 'none',
            color: i <= Math.floor(note) ? '#FFD700' : '#ddd'
          }}
        />
      );
    }
    return stars;
  };

  return (
    <div className="admin-page">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <img 
            src={logo} 
            alt="Jobty" 
            className="admin-sidebar-logo" 
            onClick={() => navigate('/')} 
            style={{ cursor: 'pointer' }}
          />
          <button className="admin-close-btn" onClick={closeMenu}>
            <FiX />
          </button>
        </div>

        <div className="admin-user-card">
          <img src={adminUser.photo} alt={`${adminUser.prenom} ${adminUser.nom}`} />
          <h3>{adminUser.prenom} {adminUser.nom}</h3>
          <p>{adminUser.role}</p>
        </div>

        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'apercu' ? 'active' : ''}`}
            onClick={() => setActiveTab('apercu')}
          >
            <FiGrid /> Vue d'ensemble
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FiUsers /> Utilisateurs
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'projets' ? 'active' : ''}`}
            onClick={() => setActiveTab('projets')}
          >
            <FiBriefcase /> Projets
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'paiements' ? 'active' : ''}`}
            onClick={() => setActiveTab('paiements')}
          >
            <FiCreditCard /> Paiements
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'litiges' ? 'active' : ''}`}
            onClick={() => setActiveTab('litiges')}
          >
            <FaBalanceScale /> Litiges
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'carte' ? 'active' : ''}`}
            onClick={() => setActiveTab('carte')}
          >
            <FiMap /> Carte
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <FiBarChart2 /> Analytics
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'kyc' ? 'active' : ''}`}
            onClick={() => setActiveTab('kyc')}
          >
            <FiShield /> Vérification KYC
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'moderateurs' ? 'active' : ''}`}
            onClick={() => setActiveTab('moderateurs')}
          >
            <FaUserShield /> Modérateurs
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveTab('config')}
          >
            <FiSettings /> Configuration
          </button>
        </nav>

        <button 
          className="admin-logout-btn" 
          onClick={() => {
            logoutMutation.mutate(undefined, {
              onSuccess: () => {
                navigate('/');
              },
              onError: (err) => {
                console.error('Logout error:', err);
                // Still navigate even if logout fails
                navigate('/');
              },
            });
          }}
          disabled={logoutMutation.isPending}
        >
          <FiLogOut /> {logoutMutation.isPending ? 'Déconnexion...' : 'Déconnexion'}
        </button>
      </aside>

      {menuOpen && <div className="admin-overlay" onClick={closeMenu}></div>}

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <header className="admin-header">
          <button className="admin-burger-btn" onClick={toggleMenu}>
            <FiMenu />
          </button>
          <h1 className="admin-page-title">
            {activeTab === 'apercu' && 'Tableau de bord Admin'}
            {activeTab === 'users' && 'Gestion des utilisateurs'}
            {activeTab === 'projets' && 'Gestion des projets'}
            {activeTab === 'paiements' && 'Gestion des paiements'}
            {activeTab === 'litiges' && 'Gestion des litiges'}
            {activeTab === 'carte' && 'Vue carte interactive'}
            {activeTab === 'stats' && 'Analytics & Rapports'}
            {activeTab === 'kyc' && 'Vérification KYC'}
            {activeTab === 'moderateurs' && 'Gestion des modérateurs'}
            {activeTab === 'config' && 'Configuration plateforme'}
          </h1>
          <div className="admin-header-actions">
            <button className="admin-notif-btn">
              <FiBell />
              <span className="admin-notif-badge">15</span>
            </button>
            <button className="admin-profile-btn" onClick={openProfile}>
              <img src={adminUser.photo} alt="" />
            </button>
          </div>
        </header>

        <div className="admin-content">
          
          {/* ALERTES */}
          {activeTab === 'apercu' && (
            <div className="admin-alerts">
              {alertes.map((alerte, index) => (
                <div key={index} className={`admin-alert admin-alert-${alerte.type}`}>
                  <FiAlertTriangle />
                  <span>{alerte.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* ONGLET APERÇU */}
          {activeTab === 'apercu' && (
            <div className="admin-apercu">
              {/* Stats du jour */}
              <div className="admin-stats-section">
                <h2>Aujourd'hui</h2>
                <div className="admin-stats-grid">
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon primary">
                      <FiUsers />
                    </div>
                    <div className="admin-stat-content">
                      <span className="admin-stat-label">Nouveaux utilisateurs</span>
                      <span className="admin-stat-value">+{statsToday.nouveauxUsers}</span>
                      <span className="admin-stat-trend success">
                        <FiTrendingUp /> +{statsToday.trendUsers}% vs hier
                      </span>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="admin-stat-icon secondary">
                      <FiBriefcase />
                    </div>
                    <div className="admin-stat-content">
                      <span className="admin-stat-label">Nouveaux projets</span>
                      <span className="admin-stat-value">+{statsToday.nouveauxProjets}</span>
                      <span className="admin-stat-trend success">
                        <FiTrendingUp /> +{statsToday.trendProjets}% vs hier
                      </span>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="admin-stat-icon accent">
                      <FiDollarSign />
                    </div>
                    <div className="admin-stat-content">
                      <span className="admin-stat-label">Commissions</span>
                      <span className="admin-stat-value">{statsToday.commissions.toLocaleString()} F</span>
                      <span className="admin-stat-trend success">
                        <FiTrendingUp /> +{statsToday.trendCommissions}% vs hier
                      </span>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="admin-stat-icon warning">
                      <FiStar />
                    </div>
                    <div className="admin-stat-content">
                      <span className="admin-stat-label">Satisfaction</span>
                      <span className="admin-stat-value">{statsToday.satisfaction}/5</span>
                      <span className="admin-stat-trend neutral">
                        <FiActivity /> Stable
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats du mois */}
              <div className="admin-stats-section">
                <h2>Ce mois</h2>
                <div className="admin-stats-grid">
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon">
                      <FiUsers />
                    </div>
                    <div className="admin-stat-content">
                      <span className="admin-stat-label">Utilisateurs actifs</span>
                      <span className="admin-stat-value">{statsMonth.usersActifs.toLocaleString()}</span>
                      <span className="admin-stat-info">
                        <FiTarget /> {statsMonth.quotaUsers}% du quota
                      </span>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="admin-stat-icon">
                      <FiBriefcase />
                    </div>
                    <div className="admin-stat-content">
                      <span className="admin-stat-label">Projets créés</span>
                      <span className="admin-stat-value">{statsMonth.projets}</span>
                      <span className="admin-stat-trend success">
                        +{statsMonth.trendProjets}% vs mois dernier
                      </span>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="admin-stat-icon">
                      <FiDollarSign />
                    </div>
                    <div className="admin-stat-content">
                      <span className="admin-stat-label">Volume total</span>
                      <span className="admin-stat-value">{(statsMonth.volume/1000000).toFixed(1)}M F</span>
                      <span className="admin-stat-info">Record historique</span>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="admin-stat-icon">
                      <FaHandshake />
                    </div>
                    <div className="admin-stat-content">
                      <span className="admin-stat-label">Contrats signés</span>
                      <span className="admin-stat-value">{statsMonth.contrats}</span>
                      <span className="admin-stat-trend success">
                        +{statsMonth.trendContrats}% vs mois dernier
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphiques */}
              <div className="admin-charts-grid">
                <div className="admin-chart-card">
                  <h3>Activité des 7 derniers jours</h3>
                  <div className="admin-chart-placeholder">
                    <FiBarChart2 />
                    <p>Graphique des inscriptions quotidiennes</p>
                  </div>
                </div>

                <div className="admin-chart-card">
                  <h3>Répartition par pays</h3>
                  <div className="admin-chart-placeholder">
                    <FiPieChart />
                    <p>Distribution géographique des utilisateurs</p>
                  </div>
                </div>

                <div className="admin-chart-card">
                  <h3>Santé de la plateforme</h3>
                  <div className="admin-health-metrics">
                    <div className="admin-metric-row">
                      <span>Taux de conversion</span>
                      <div className="admin-progress-bar">
                        <div className="admin-progress-fill" style={{width: '68%'}}></div>
                      </div>
                      <span>68%</span>
                    </div>
                    <div className="admin-metric-row">
                      <span>Taux de matching</span>
                      <div className="admin-progress-bar">
                        <div className="admin-progress-fill" style={{width: '82%'}}></div>
                      </div>
                      <span>82%</span>
                    </div>
                    <div className="admin-metric-row">
                      <span>Taux de succès</span>
                      <div className="admin-progress-bar">
                        <div className="admin-progress-fill" style={{width: '75%'}}></div>
                      </div>
                      <span>75%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tables récentes */}
              <div className="admin-recent-grid">
                <div className="admin-recent-card">
                  <h3>Transactions récentes</h3>
                  <div className="admin-recent-list">
                    {transactions.slice(0, 3).map(trans => (
                      <div key={trans.id} className="admin-recent-item">
                        <div className="admin-recent-info">
                          <span className="admin-recent-id">{trans.id}</span>
                          <span className="admin-recent-meta">{trans.montant.toLocaleString()} F</span>
                        </div>
                        {getStatutBadge(trans.statut)}
                      </div>
                    ))}
                  </div>
                  <button className="admin-btn-link" onClick={() => setActiveTab('paiements')}>
                    Voir tout →
                  </button>
                </div>

                <div className="admin-recent-card">
                  <h3>KYC en attente</h3>
                  <div className="admin-recent-list">
                    {kycQueue.map(kyc => (
                      <div key={kyc.id} className="admin-recent-item">
                        <div className="admin-recent-info">
                          <span className="admin-recent-name">{kyc.prenom} {kyc.nom}</span>
                          <span className="admin-recent-meta">{kyc.delai}</span>
                        </div>
                        {getPrioriteBadge(kyc.priorite)}
                      </div>
                    ))}
                  </div>
                  <button className="admin-btn-link" onClick={() => setActiveTab('kyc')}>
                    Traiter →
                  </button>
                </div>

                <div className="admin-recent-card">
                  <h3>Litiges actifs</h3>
                  <div className="admin-recent-list">
                    {litiges.map(litige => (
                      <div key={litige.id} className="admin-recent-item">
                        <div className="admin-recent-info">
                          <span className="admin-recent-name">{litige.titre}</span>
                          <span className="admin-recent-meta">{litige.ouvertDepuis}</span>
                        </div>
                        {getPrioriteBadge(litige.priorite)}
                      </div>
                    ))}
                  </div>
                  <button className="admin-btn-link" onClick={() => setActiveTab('litiges')}>
                    Résoudre →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET UTILISATEURS */}
          {activeTab === 'users' && (
            <div className="admin-users-section">
              <div className="admin-section-header">
                <div>
                  <h2>Gestion des utilisateurs</h2>
                  <p className="admin-section-subtitle">{users.length} utilisateurs au total</p>
                </div>
                <button className="admin-btn-primary">
                  <FiPlus /> Inviter utilisateur
                </button>
              </div>

              {/* Filtres */}
              <div className="admin-filters">
                <select className="admin-filter-select">
                  <option>Type: Tous</option>
                  <option>Professionnels</option>
                  <option>Clients</option>
                </select>
                <select className="admin-filter-select">
                  <option>Statut: Tous</option>
                  <option>Actif</option>
                  <option>Suspendu</option>
                  <option>Banni</option>
                </select>
                <select className="admin-filter-select">
                  <option>Pays: Tous</option>
                  <option>Sénégal</option>
                  <option>Nigeria</option>
                  <option>Côte d'Ivoire</option>
                </select>
                <select className="admin-filter-select">
                  <option>KYC: Tous</option>
                  <option>Vérifié</option>
                  <option>En attente</option>
                  <option>Refusé</option>
                </select>
                <div className="admin-search-box">
                  <FiSearch />
                  <input type="text" placeholder="Rechercher..." />
                </div>
              </div>

              {/* Table des utilisateurs */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>
                        <input type="checkbox" />
                      </th>
                      <th>Utilisateur</th>
                      <th>Type</th>
                      <th>Localisation</th>
                      <th>Statut</th>
                      <th>KYC</th>
                      <th>Note</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>
                          <input type="checkbox" />
                        </td>
                        <td>
                          <div className="admin-user-cell">
                            <img src={user.photo} alt={user.prenom} />
                            <div>
                              <strong>{user.prenom} {user.nom}</strong>
                              <small>{user.email}</small>
                              <small className="admin-text-muted">Inscrit: {user.inscrit}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="admin-user-type">
                            {user.type}
                            {user.specialite && <small>{user.specialite}</small>}
                          </span>
                        </td>
                        <td>
                          <div className="admin-location">
                            <FiMapPin />
                            {user.ville}, {user.pays}
                          </div>
                        </td>
                        <td>{getStatutBadge(user.statut)}</td>
                        <td>
                          {user.kyc === 'verifie' && <span className="admin-kyc-badge verified"><FiCheckCircle /> Vérifié</span>}
                          {user.kyc === 'en_attente' && <span className="admin-kyc-badge pending"><FiClock /> En attente</span>}
                          {user.kyc === 'refuse' && <span className="admin-kyc-badge rejected"><FiXCircle /> Refusé</span>}
                        </td>
                        <td>
                          <div className="admin-rating">
                            {renderStars(user.note)}
                            <small>({user.nbAvis})</small>
                          </div>
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button className="admin-action-btn" title="Voir détails">
                              <FiEye />
                            </button>
                            <button className="admin-action-btn" title="Éditer">
                              <FiEdit3 />
                            </button>
                            <button className="admin-action-btn" title="Plus">
                              <FiMoreVertical />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actions groupées */}
              {selectedUsers.length > 0 && (
                <div className="admin-bulk-actions">
                  <span>{selectedUsers.length} utilisateur(s) sélectionné(s)</span>
                  <button className="admin-btn-secondary">Envoyer message</button>
                  <button className="admin-btn-secondary">Exporter CSV</button>
                  <button className="admin-btn-danger">Suspendre</button>
                </div>
              )}
            </div>
          )}

          {/* ONGLET KYC */}
          {activeTab === 'kyc' && (
            <div className="admin-kyc-section">
              <div className="admin-section-header">
                <div>
                  <h2>File d'attente KYC</h2>
                  <p className="admin-section-subtitle">{kycQueue.length} vérifications en attente</p>
                </div>
              </div>

              {/* Liste KYC */}
              <div className="admin-kyc-queue">
                {kycQueue.map(kyc => (
                  <div key={kyc.id} className="admin-kyc-card">
                    <div className="admin-kyc-priority">
                      {getPrioriteBadge(kyc.priorite)}
                    </div>
                    <div className="admin-kyc-info">
                      <h3>{kyc.prenom} {kyc.nom}</h3>
                      <p>{kyc.type} - {kyc.specialite}</p>
                      <small>{kyc.pays} • {kyc.typeDoc}</small>
                    </div>
                    <div className="admin-kyc-time">
                      <FiClock />
                      <span>Soumis le {kyc.soumis}</span>
                      <strong>({kyc.delai})</strong>
                    </div>
                    <button 
                      className="admin-btn-primary"
                      onClick={() => setKycDetail(kyc)}
                    >
                      Vérifier
                    </button>
                  </div>
                ))}
              </div>

              {/* Stats KYC */}
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <span className="admin-stat-label">Approuvées ce mois</span>
                    <span className="admin-stat-value">234</span>
                    <span className="admin-stat-info">78% du total</span>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <span className="admin-stat-label">Refusées</span>
                    <span className="admin-stat-value">45</span>
                    <span className="admin-stat-info">15% du total</span>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <span className="admin-stat-label">Temps moyen</span>
                    <span className="admin-stat-value">4.2h</span>
                    <span className="admin-stat-info">de traitement</span>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <span className="admin-stat-label">Fraudes détectées</span>
                    <span className="admin-stat-value">12</span>
                    <span className="admin-stat-info">ce mois</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET PROJETS */}
          {activeTab === 'projets' && (
            <div className="admin-projects-section">
              <div className="admin-section-header">
                <div>
                  <h2>Gestion des projets</h2>
                  <p className="admin-section-subtitle">{projets.length} projets actifs</p>
                </div>
              </div>

              {/* Table des projets */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Titre</th>
                      <th>Client</th>
                      <th>Budget</th>
                      <th>Statut</th>
                      <th>Candidatures</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projets.map(projet => (
                      <tr key={projet.id}>
                        <td><strong>{projet.id}</strong></td>
                        <td>
                          <div>
                            <strong>{projet.titre}</strong>
                            <small className="admin-text-muted">Créé le {projet.dateCreation}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            {projet.client}
                            <small className="admin-text-muted">{projet.pays}</small>
                          </div>
                        </td>
                        <td className="admin-text-primary">
                          <strong>{projet.budget.toLocaleString()} F</strong>
                        </td>
                        <td>{getStatutBadge(projet.statut)}</td>
                        <td>
                          <span className="admin-candidatures">
                            {projet.candidatures} candidat(s)
                          </span>
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button className="admin-action-btn"><FiEye /></button>
                            <button className="admin-action-btn"><FiEdit3 /></button>
                            <button className="admin-action-btn"><FiMoreVertical /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Légende statuts */}
              <div className="admin-legend">
                <span>Légende statuts:</span>
                <span className="admin-legend-item">🟢 Ouvert</span>
                <span className="admin-legend-item">🟡 En attente</span>
                <span className="admin-legend-item">🔵 En cours</span>
                <span className="admin-legend-item">✅ Terminé</span>
                <span className="admin-legend-item">❌ Annulé</span>
                <span className="admin-legend-item">⚠️ Litige</span>
              </div>
            </div>
          )}

          {/* ONGLET PAIEMENTS */}
          {activeTab === 'paiements' && (
            <div className="admin-payments-section">
              <div className="admin-section-header">
                <div>
                  <h2>Gestion des paiements</h2>
                  <p className="admin-section-subtitle">Dashboard financier</p>
                </div>
                <button className="admin-btn-primary">
                  <FiDownload /> Exporter rapport
                </button>
              </div>

              {/* Métriques financières */}
              <div className="admin-finance-metrics">
                <div className="admin-metric-card primary">
                  <h3>Volume total</h3>
                  <p className="admin-metric-value">12,450,000 F</p>
                  <span className="admin-metric-trend">+23% vs mois dernier</span>
                </div>
                <div className="admin-metric-card secondary">
                  <h3>Commissions</h3>
                  <p className="admin-metric-value">1,245,000 F</p>
                  <span className="admin-metric-info">10% du volume</span>
                </div>
                <div className="admin-metric-card accent">
                  <h3>En séquestre</h3>
                  <p className="admin-metric-value">2,340,000 F</p>
                  <span className="admin-metric-info">18 projets actifs</span>
                </div>
                <div className="admin-metric-card">
                  <h3>Versé aux pros</h3>
                  <p className="admin-metric-value">8,865,000 F</p>
                  <span className="admin-metric-info">Ce mois</span>
                </div>
              </div>

              {/* Alertes paiements */}
              <div className="admin-payment-alerts">
                <div className="admin-alert admin-alert-danger">
                  <FiAlertCircle />
                  <span>3 paiements échoués (dernières 24h)</span>
                  <button className="admin-btn-link">Voir détails</button>
                </div>
                <div className="admin-alert admin-alert-warning">
                  <FiAlertTriangle />
                  <span>5 remboursements en attente d'approbation</span>
                  <button className="admin-btn-link">Traiter</button>
                </div>
              </div>

              {/* Transactions récentes */}
              <div className="admin-transactions">
                <h3>Transactions récentes</h3>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>De → Vers</th>
                        <th>Montant</th>
                        <th>Type</th>
                        <th>Méthode</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(trans => (
                        <tr key={trans.id}>
                          <td><strong>{trans.id}</strong></td>
                          <td>{trans.date}</td>
                          <td>{trans.de} → {trans.vers}</td>
                          <td className="admin-text-primary">
                            <strong>{trans.montant.toLocaleString()} F</strong>
                          </td>
                          <td>{trans.type}</td>
                          <td>{trans.methode}</td>
                          <td>{getStatutBadge(trans.statut)}</td>
                          <td>
                            <button className="admin-action-btn">
                              <FiEye />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET LITIGES */}
          {activeTab === 'litiges' && (
            <div className="admin-disputes-section">
              <div className="admin-section-header">
                <div>
                  <h2>Gestion des litiges</h2>
                  <p className="admin-section-subtitle">{litiges.length} litiges actifs</p>
                </div>
              </div>

              {/* File d'attente des litiges */}
              <div className="admin-disputes-queue">
                {litiges.map(litige => (
                  <div key={litige.id} className="admin-dispute-card">
                    <div className="admin-dispute-header">
                      <div className="admin-dispute-info">
                        <h3>{litige.id} - {litige.titre}</h3>
                        <p>{litige.plaignant} vs {litige.defendeur}</p>
                      </div>
                      <div className="admin-dispute-meta">
                        {getPrioriteBadge(litige.priorite)}
                        {getStatutBadge(litige.statut)}
                      </div>
                    </div>
                    <div className="admin-dispute-details">
                      <div className="admin-dispute-stat">
                        <FiBriefcase />
                        <span>Projet {litige.projetId}</span>
                      </div>
                      <div className="admin-dispute-stat">
                        <FiDollarSign />
                        <span>{litige.montant.toLocaleString()} F en jeu</span>
                      </div>
                      <div className="admin-dispute-stat">
                        <FiClock />
                        <span>Ouvert depuis {litige.ouvertDepuis}</span>
                      </div>
                    </div>
                    <button 
                      className="admin-btn-primary"
                      onClick={() => setLitigeDetail(litige)}
                    >
                      Gérer le litige
                    </button>
                  </div>
                ))}
              </div>

              {/* Statistiques litiges */}
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <span className="admin-stat-label">Litiges résolus</span>
                    <span className="admin-stat-value">38</span>
                    <span className="admin-stat-info">84% de résolution</span>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <span className="admin-stat-label">Temps moyen</span>
                    <span className="admin-stat-value">4.8 jours</span>
                    <span className="admin-stat-info">de résolution</span>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <span className="admin-stat-label">En faveur client</span>
                    <span className="admin-stat-value">47%</span>
                    <span className="admin-stat-info">des cas</span>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-content">
                    <span className="admin-stat-label">En faveur pro</span>
                    <span className="admin-stat-value">32%</span>
                    <span className="admin-stat-info">des cas</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET CARTE */}
          {activeTab === 'carte' && (
            <div className="admin-map-section">
              <div className="admin-section-header">
                <div>
                  <h2>Vue carte interactive</h2>
                  <p className="admin-section-subtitle">Répartition géographique des utilisateurs et projets</p>
                </div>
              </div>

              {/* Filtres carte */}
              <div className="admin-map-filters">
                <label className="admin-checkbox">
                  <input type="checkbox" defaultChecked />
                  <span>Professionnels disponibles</span>
                </label>
                <label className="admin-checkbox">
                  <input type="checkbox" defaultChecked />
                  <span>Projets ouverts</span>
                </label>
                <label className="admin-checkbox">
                  <input type="checkbox" />
                  <span>Pros certifiés</span>
                </label>
                <label className="admin-checkbox">
                  <input type="checkbox" />
                  <span>Nouveaux inscrits (7j)</span>
                </label>
              </div>

              {/* Carte placeholder */}
              <div className="admin-map-container">
                <div className="admin-map-placeholder">
                  <FaMapMarkedAlt />
                  <h3>Carte interactive</h3>
                  <p>Intégration Google Maps / Mapbox</p>
                  <div className="admin-map-legend">
                    <span>🟢 Professionnel disponible</span>
                    <span>🔵 Projet ouvert</span>
                    <span>🟡 Zone d'activité élevée</span>
                    <span>🔴 Problème détecté</span>
                  </div>
                </div>
              </div>

              {/* Heatmap par région */}
              <div className="admin-heatmap">
                <h3>Répartition par région</h3>
                {analytics.geo.map(pays => (
                  <div key={pays.pays} className="admin-heatmap-row">
                    <span className="admin-heatmap-country">
                      {pays.flag} {pays.pays}
                    </span>
                    <div className="admin-heatmap-bar">
                      <div 
                        className="admin-heatmap-fill" 
                        style={{width: `${pays.pct}%`}}
                      ></div>
                    </div>
                    <span className="admin-heatmap-value">
                      {pays.users.toLocaleString()} ({pays.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ONGLET ANALYTICS */}
          {activeTab === 'stats' && (
            <div className="admin-analytics-section">
              <div className="admin-section-header">
                <div>
                  <h2>Analytics & Rapports</h2>
                  <p className="admin-section-subtitle">Période: Dernier mois</p>
                </div>
                <div className="admin-header-actions">
                  <select className="admin-filter-select">
                    <option>Dernier mois</option>
                    <option>3 derniers mois</option>
                    <option>6 derniers mois</option>
                    <option>Cette année</option>
                  </select>
                  <button className="admin-btn-primary">
                    <FiDownload /> Exporter rapport
                  </button>
                </div>
              </div>

              {/* Analytics cards */}
              <div className="admin-analytics-grid">
                {/* Utilisateurs */}
                <div className="admin-analytics-card">
                  <h3><FiUsers /> Utilisateurs</h3>
                  <div className="admin-analytics-content">
                    <div className="admin-analytics-stat">
                      <span>Total</span>
                      <strong>{analytics.users.total.toLocaleString()}</strong>
                      <small className="success">+23% vs mois précédent</small>
                    </div>
                    <div className="admin-analytics-stat">
                      <span>Nouveaux</span>
                      <strong>{analytics.users.nouveaux.toLocaleString()}</strong>
                    </div>
                    <div className="admin-analytics-stat">
                      <span>Actifs</span>
                      <strong>{analytics.users.actifs.toLocaleString()}</strong>
                      <small>72% du total</small>
                    </div>
                    <div className="admin-analytics-divider"></div>
                    <div className="admin-analytics-stat">
                      <span>Professionnels</span>
                      <strong>{analytics.users.professionals.toLocaleString()}</strong>
                    </div>
                    <div className="admin-analytics-stat">
                      <span>Clients</span>
                      <strong>{analytics.users.clients.toLocaleString()}</strong>
                    </div>
                    <div className="admin-analytics-divider"></div>
                    <div className="admin-analytics-stat">
                      <span>Taux de rétention (30j)</span>
                      <strong>{analytics.users.retention30j}%</strong>
                    </div>
                    <div className="admin-analytics-stat">
                      <span>Taux d'activation</span>
                      <strong>{analytics.users.activation}%</strong>
                    </div>
                  </div>
                </div>

                {/* Projets */}
                <div className="admin-analytics-card">
                  <h3><FiBriefcase /> Projets</h3>
                  <div className="admin-analytics-content">
                    <div className="admin-analytics-stat">
                      <span>Créés</span>
                      <strong>{analytics.projets.crees}</strong>
                      <small className="success">+45%</small>
                    </div>
                    <div className="admin-analytics-stat">
                      <span>Complétés</span>
                      <strong>{analytics.projets.completes}</strong>
                      <small>Taux de succès: {analytics.projets.tauxSucces}%</small>
                    </div>
                    <div className="admin-analytics-stat">
                      <span>En cours</span>
                      <strong>{analytics.projets.enCours}</strong>
                    </div>
                    <div className="admin-analytics-stat">
                      <span>Annulés</span>
                      <strong>{analytics.projets.annules}</strong>
                      <small>6.3% - Acceptable</small>
                    </div>
                    <div className="admin-analytics-divider"></div>
                    <div className="admin-analytics-stat">
                      <span>Budget moyen</span>
                      <strong>{analytics.projets.budgetMoyen.toLocaleString()} F</strong>
                    </div>
                    <div className="admin-analytics-stat">
                      <span>Temps de matching</span>
                      <strong>{analytics.projets.tempsMatching} jours</strong>
                    </div>
                  </div>
                </div>

                {/* Finances */}
                <div className="admin-analytics-card">
                  <h3><FiDollarSign /> Finances</h3>
                  <div className="admin-analytics-content">
                    <div className="admin-analytics-stat">
                      <span>Volume total</span>
                      <strong>{(analytics.finances.volumeTotal/1000000).toFixed(1)}M F</strong>
                    </div>
                    <div className="admin-analytics-stat">
                      <span>Revenus (commissions)</span>
                      <strong>{(analytics.finances.commissions/1000000).toFixed(1)}M F</strong>
                    </div>
                    <div className="admin-analytics-stat">
                      <span>Croissance MoM</span>
                      <strong className="success">+{analytics.finances.croissance}%</strong>
                    </div>
                    <div className="admin-analytics-divider"></div>
                    <div className="admin-analytics-stat">
                      <span>Valeur vie client (LTV)</span>
                      <strong>{analytics.finances.ltv.toLocaleString()} F</strong>
                    </div>
                    <div className="admin-analytics-stat">
                      <span>Coût d'acquisition (CAC)</span>
                      <strong>{analytics.finances.cac.toLocaleString()} F</strong>
                    </div>
                    <div className="admin-analytics-stat">
                      <span>Ratio LTV/CAC</span>
                      <strong className="success">39x</strong>
                      <small>Excellent</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphiques */}
              <div className="admin-charts-grid">
                <div className="admin-chart-card">
                  <h3>Évolution des inscriptions</h3>
                  <div className="admin-chart-placeholder">
                    <FaChartLine />
                    <p>Graphique linéaire sur 12 mois</p>
                  </div>
                </div>
                <div className="admin-chart-card">
                  <h3>Catégories populaires</h3>
                  <div className="admin-categories-list">
                    <div className="admin-category-item">
                      <span>Développement web</span>
                      <div className="admin-category-bar">
                        <div className="admin-category-fill" style={{width: '32%'}}></div>
                      </div>
                      <strong>32%</strong>
                    </div>
                    <div className="admin-category-item">
                      <span>Design graphique</span>
                      <div className="admin-category-bar">
                        <div className="admin-category-fill" style={{width: '24%'}}></div>
                      </div>
                      <strong>24%</strong>
                    </div>
                    <div className="admin-category-item">
                      <span>Marketing digital</span>
                      <div className="admin-category-bar">
                        <div className="admin-category-fill" style={{width: '18%'}}></div>
                      </div>
                      <strong>18%</strong>
                    </div>
                    <div className="admin-category-item">
                      <span>Rédaction</span>
                      <div className="admin-category-bar">
                        <div className="admin-category-fill" style={{width: '12%'}}></div>
                      </div>
                      <strong>12%</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions export */}
              <div className="admin-export-actions">
                <button className="admin-btn-secondary">
                  <FiFileText /> Générer rapport PDF
                </button>
                <button className="admin-btn-secondary">
                  <FiDownload /> Exporter CSV
                </button>
                <button className="admin-btn-secondary">
                  <FiMail /> Programmer envoi
                </button>
              </div>
            </div>
          )}

          {/* ONGLET MODÉRATEURS */}
          {activeTab === 'moderateurs' && (
            <div className="admin-moderators-section">
              <div className="admin-section-header">
                <div>
                  <h2>Équipe de modération</h2>
                  <p className="admin-section-subtitle">{moderateurs.length} modérateurs actifs</p>
                </div>
                <button className="admin-btn-primary">
                  <FiPlus /> Ajouter un modérateur
                </button>
              </div>

              {/* Liste des modérateurs */}
              <div className="admin-moderators-grid">
                {moderateurs.map(mod => (
                  <div key={mod.id} className="admin-moderator-card">
                    <div className="admin-mod-header">
                      <div className="admin-mod-info">
                        <h3>{mod.prenom} {mod.nom}</h3>
                        <p>{mod.role}</p>
                        <small>Admin depuis {mod.depuis}</small>
                      </div>
                      {getStatutBadge(mod.statut)}
                    </div>
                    
                    <div className="admin-mod-permissions">
                      <h4>Permissions</h4>
                      <div className="admin-mod-tags">
                        {mod.permissions.map(perm => (
                          <span key={perm} className="admin-tag">{perm}</span>
                        ))}
                      </div>
                    </div>

                    <div className="admin-mod-stats">
                      <div className="admin-mod-stat">
                        <span>{mod.stats.kycVerifies}</span>
                        <small>KYC vérifiées</small>
                      </div>
                      <div className="admin-mod-stat">
                        <span>{mod.stats.litigesResolus}</span>
                        <small>Litiges résolus</small>
                      </div>
                      <div className="admin-mod-stat">
                        <span>{mod.stats.tempsReponse}h</span>
                        <small>Temps réponse</small>
                      </div>
                    </div>

                    <div className="admin-mod-actions">
                      <button className="admin-btn-secondary">
                        <FiEdit3 /> Éditer
                      </button>
                      <button className="admin-btn-secondary">
                        <FiActivity /> Activité
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ONGLET CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="admin-config-section">
              <div className="admin-section-header">
                <h2>Configuration de la plateforme</h2>
              </div>

              {/* Paramètres finances */}
              <div className="admin-config-card">
                <h3><FiDollarSign /> Finances</h3>
                <div className="admin-config-grid">
                  <div className="admin-config-item">
                    <label>Commission plateforme (%)</label>
                    <input type="number" defaultValue="10" />
                  </div>
                  <div className="admin-config-item">
                    <label>Seuil minimum projet (FCFA)</label>
                    <input type="number" defaultValue="50000" />
                  </div>
                  <div className="admin-config-item">
                    <label>Frais de retrait (FCFA)</label>
                    <input type="number" defaultValue="500" />
                  </div>
                  <div className="admin-config-item">
                    <label>Délai de séquestre (jours)</label>
                    <input type="number" defaultValue="7" />
                  </div>
                </div>
              </div>

              {/* Paramètres sécurité */}
              <div className="admin-config-card">
                <h3><FiShield /> Sécurité</h3>
                <div className="admin-config-grid">
                  <div className="admin-config-item">
                    <label>KYC obligatoire pour</label>
                    <select>
                      <option>Projets &gt; 500k FCFA</option>
                      <option>Tous les projets</option>
                      <option>Désactivé</option>
                    </select>
                  </div>
                  <div className="admin-config-item">
                    <label>2FA obligatoire pour</label>
                    <select>
                      <option>Admins seulement</option>
                      <option>Tous les utilisateurs</option>
                      <option>Optionnel</option>
                    </select>
                  </div>
                  <div className="admin-config-item">
                    <label>Expiration sessions (jours)</label>
                    <input type="number" defaultValue="30" />
                  </div>
                  <div className="admin-config-item">
                    <label>Tentatives login max</label>
                    <input type="number" defaultValue="5" />
                  </div>
                </div>
              </div>

              {/* Paramètres notifications */}
              <div className="admin-config-card">
                <h3><FiBell /> Notifications</h3>
                <div className="admin-config-toggles">
                  <label className="admin-toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="admin-toggle-slider"></span>
                    <span>Emails transactionnels</span>
                  </label>
                  <label className="admin-toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="admin-toggle-slider"></span>
                    <span>SMS pour paiements</span>
                  </label>
                  <label className="admin-toggle">
                    <input type="checkbox" />
                    <span className="admin-toggle-slider"></span>
                    <span>Push notifications</span>
                  </label>
                  <label className="admin-toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="admin-toggle-slider"></span>
                    <span>Newsletter hebdomadaire</span>
                  </label>
                </div>
              </div>

              <div className="admin-config-actions">
                <button className="admin-btn-primary">
                  <FiSave /> Sauvegarder les modifications
                </button>
                <button className="admin-btn-secondary">
                  <FiRefreshCw /> Réinitialiser
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
      <ProfileDrawer open={profileOpen} onClose={closeProfile} />
    </div>
  );
}

export default ModeratorDashboard;