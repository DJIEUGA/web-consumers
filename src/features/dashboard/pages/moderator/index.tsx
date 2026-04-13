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
import ProfileDrawer from '../../../../components/shared/ProfileDrawer';
import NotificationsDrawer from '../../../../components/shared/NotificationsDrawer';
import RoleSidebar from '../../../../components/shared/RoleSidebar';
import { useDashboardProfile } from '../../hooks/useDashboardProfile';
import {
  useStatsToday,
  useStatsMonth,
  useAlerts,
  useUsers,
  useProjects,
  useKycQueue,
  useDisputes,
  useAnalytics,
  useTransactions,
} from '../../hooks/useDashboardData';
import './css/style.css';

function ModeratorDashboard() {
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('apercu');
  const [, setKycDetail] = useState(null);
  const [, setLitigeDetail] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Fetch dashboard data from hooks
  const { profile: dashboardProfile } = useDashboardProfile();
  const { data: statsToday } = useStatsToday();
  const { data: statsMonth } = useStatsMonth();
  const { data: alertes } = useAlerts();
  const { data: users } = useUsers();
  const { data: projets } = useProjects();
  const { data: kycDemandes } = useKycQueue();
  const { data: litiges } = useDisputes();
  const { data: analyticsData } = useAnalytics();
  const { data: transactions } = useTransactions();
  
  const adminUser = {
    nom: dashboardProfile.lastName,
    prenom: dashboardProfile.firstName,
    role: dashboardProfile.subtitle,
    photo: dashboardProfile.avatarUrl,
  };

  // Mock analytics (TODO: backend to implement detailed analytics endpoint)
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

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);
  const openProfile = () => setProfileOpen(true);
  const closeProfile = () => setProfileOpen(false);
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/');
      },
      onError: () => {
        navigate('/');
      },
    });
  };

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
      <RoleSidebar
        role="ROLE_MODERATOR"
        variant="admin"
        open={menuOpen}
        activeTab={activeTab}
        onClose={closeMenu}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        isLoggingOut={logoutMutation.isPending}
        user={{
          firstName: adminUser.prenom,
          lastName: adminUser.nom,
          subtitle: adminUser.role,
          photo: adminUser.photo,
        }}
      />

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <header className="admin-header">
          <button className="admin-burger-btn" onClick={toggleMenu}>
            <FiMenu />
          </button>
          <h1 className="admin-page-title">
            {activeTab === 'apercu' && 'Tableau de bord Modérateur'}
            {activeTab === 'users' && 'Gestion des utilisateurs'}
            {activeTab === 'projets' && 'Gestion des projets'}
            {activeTab === 'litiges' && 'Gestion des litiges'}
            {activeTab === 'stats' && 'Analytics & Rapports'}
            {activeTab === 'kyc' && 'Vérification KYC'}
          </h1>
          <div className="admin-header-actions">
            <button className="admin-public-btn" onClick={() => navigate('/decouverte')}>
              <FiGlobe /> Site public
            </button>
            <button className="admin-notif-btn" onClick={() => setNotificationsOpen(true)}>
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
          {activeTab === 'apercu' && alertes && (
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
          {activeTab === 'apercu' && statsToday && statsMonth && (
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
                    {transactions && transactions.slice(0, 3).map(trans => (
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
                    {kycDemandes && kycDemandes.map(kyc => (
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
                    {litiges && litiges.map(litige => (
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
          {activeTab === 'users' && users && (
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
                          {user.kyc === 'non_verifie' && <span className="admin-kyc-badge rejected"><FiXCircle /> Non vérifié</span>}
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
          {activeTab === 'kyc' && kycDemandes && (
            <div className="admin-kyc-section">
              <div className="admin-section-header">
                <div>
                  <h2>File d'attente KYC</h2>
                  <p className="admin-section-subtitle">{kycDemandes.length} vérifications en attente</p>
                </div>
              </div>

              {/* Liste KYC */}
              <div className="admin-kyc-queue">
                {kycDemandes.map(kyc => (
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
          {activeTab === 'projets' && projets && (
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

          {/* ONGLET LITIGES */}
          {activeTab === 'litiges' && litiges && (
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

        </div>
      </main>
      <ProfileDrawer open={profileOpen} onClose={closeProfile} />
      <NotificationsDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
}

export default ModeratorDashboard;