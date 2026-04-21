import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../../../../features/auth/hooks/useAuthMutations";
import {
  FiMenu,
  FiX,
  FiUser,
  FiBell,
  FiSettings,
  FiLogOut,
  FiDollarSign,
  FiBriefcase,
  FiCheckCircle,
  FiStar,
  FiEdit3,
  FiPlus,
  FiMapPin,
  FiClock,
  FiMessageCircle,
  FiHeart,
  FiShare2,
  FiTrash2,
  FiImage,
  FiLink,
  FiPlay,
  FiAward,
  FiTrendingUp,
  FiCalendar,
  FiTarget,
  FiZap,
  FiShield,
  FiGrid,
  FiList,
  FiFilter,
  FiSearch,
  FiMoreVertical,
  FiCamera,
  FiSave,
  FiLock,
  FiGlobe,
  FiDownload,
  FiUpload,
  FiCreditCard,
  FiFileText,
  FiAlertCircle,
  FiActivity,
  FiBarChart2,
  FiPieChart,
  FiMap,
  FiUsers,
  FiAlertTriangle,
  FiUserCheck,
  FiUserX,
  FiRefreshCw,
  FiChevronDown,
  FiChevronRight,
  FiCheck,
  FiArrowRight,
  FiXCircle,
  FiPauseCircle,
  FiHome,
  FiDatabase,
  FiPercent,
  FiMail,
  FiPhone,
} from "react-icons/fi";
import {
  FaHandshake,
  FaRocket,
  FaBalanceScale,
  FaUserShield,
  FaChartLine,
  FaMapMarkedAlt,
} from "react-icons/fa";
import ProfileDrawer from '../../../../components/shared/ProfileDrawer';
import NotificationsDrawer from '../../../../components/shared/NotificationsDrawer';
import RoleSidebar from '../../../../components/shared/RoleSidebar';
import { useDashboardProfile } from '../../hooks/useDashboardProfile';
import { useCollaborations, useStatsOverview } from '../../hooks/useDashboardData';
import {
  getCollaborationStatusMeta,
  isCollaborationActive,
  isCollaborationCompleted,
  isCollaborationPending,
} from '../../utils/collaborationStatus';
import "./css/style.css";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("apercu");
  const { profile: dashboardProfile } = useDashboardProfile();
  const {
    data: collaborations = [],
    isLoading: isCollaborationsLoading,
    isError: isCollaborationsError,
    refetch: refetchCollaborations,
  } = useCollaborations();
  const { data: statsData } = useStatsOverview();

  const overviewStats = {
    gainsTotal: 0,
    projetsEnCours: 0,
    projetsRealises: 0,
    vuesProfile: 0,
    messagesRecus: 0,
    favoritesCount: 0,
    ...statsData,
  };

  const collaborationSummary = useMemo(() => {
    const total = collaborations.length;
    const active = collaborations.filter((collab) =>
      isCollaborationActive({
        backendStatus: collab.backendStatus,
        statut: collab.statut,
      }),
    ).length;
    const pending = collaborations.filter((collab) =>
      isCollaborationPending({
        backendStatus: collab.backendStatus,
        statut: collab.statut,
      }),
    ).length;
    const completed = collaborations.filter((collab) =>
      isCollaborationCompleted({
        backendStatus: collab.backendStatus,
        statut: collab.statut,
      }),
    ).length;

    return {
      total,
      active,
      pending,
      completed,
    };
  }, [collaborations]);

  const ongoingCollaborations = useMemo(
    () =>
      collaborations.filter((collab) =>
        isCollaborationActive({
          backendStatus: collab.backendStatus,
          statut: collab.statut,
        }),
      ),
    [collaborations],
  );

  const adminUser = {
    nom: dashboardProfile.lastName,
    prenom: dashboardProfile.firstName,
    role: dashboardProfile.subtitle,
    photo: dashboardProfile.avatarUrl,
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);
  const openProfile = () => setProfileOpen(true);
  const closeProfile = () => setProfileOpen(false);
  const handleLeaveReview = (collaborationId: string) => {
    navigate(`/collaboration/${encodeURIComponent(collaborationId)}?step=9`);
  };
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    if (tab === "profil") {
      openProfile();
    }

    if (tab === "trouver-pro") {
      navigate("/marketplace");
    }
  };
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/");
      },
      onError: () => {
        navigate("/");
      },
    });
  };
  return (
    <div className="admin-page">
      <RoleSidebar
        role="ROLE_CUSTOMER"
        variant="admin"
        open={menuOpen}
        activeTab={activeTab}
        onClose={closeMenu}
        onTabChange={handleTabChange}
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
            {activeTab === "apercu" && "Tableau de bord Client"}
            {activeTab === "profil" && "Mon profil"}
            {activeTab === "collaborations" && "Mes collaborations"}
            {activeTab === "trouver-pro" && "Trouver un professionnel"}
            {activeTab === "avis" && "Mes avis"}
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
          {activeTab === "apercu" && (
            <div style={{ display: "grid", gap: "20px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "16px",
                }}
              >
                <div className="admin-stat-card">
                  <div className="admin-stat-icon primary">
                    <FiCreditCard />
                  </div>
                  <div className="admin-stat-content">
                    <span className="admin-stat-label">Dépenses</span>
                    <span className="admin-stat-value">{overviewStats.gainsTotal} FCFA</span>
                    <span className="admin-stat-trend success">+12% ce mois</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon secondary">
                    <FiBriefcase />
                  </div>
                  <div className="admin-stat-content">
                    <span className="admin-stat-label">Projets en cours</span>
                    <span className="admin-stat-value">{collaborationSummary.active}</span>
                    <span className="admin-stat-info">collaborations actives</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon accent">
                    <FaHandshake />
                  </div>
                  <div className="admin-stat-content">
                    <span className="admin-stat-label">Collaborations réalisées</span>
                    <span className="admin-stat-value">{collaborationSummary.completed}</span>
                    <span className="admin-stat-info">missions complétées</span>
                  </div>
                </div>
              </div>

              <div className="admin-chart-card">
                <h3>Activité récente</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      border: "1px solid var(--gray-200)",
                      borderRadius: "var(--radius-sm)",
                      padding: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div className="admin-stat-icon primary" style={{ width: "40px", height: "40px", minWidth: "40px" }}>
                      <FiHeart />
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", color: "var(--gray-600)" }}>Favoris</div>
                      <div style={{ fontSize: "30px", fontWeight: 700, color: "var(--gray-900)" }}>{overviewStats.favoritesCount}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-chart-card">
                <div className="admin-section-header" style={{ marginBottom: "14px" }}>
                  <h2>Projets en cours</h2>
                  <button className="admin-public-btn" onClick={() => setActiveTab("collaborations")}>
                    Voir tout
                  </button>
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                  {ongoingCollaborations.slice(0, 2).map((collab) => (
                    <div
                      key={`overview-${collab.id}`}
                      style={{
                        border: "1px solid var(--gray-200)",
                        borderRadius: "var(--radius-sm)",
                        padding: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontWeight: 600 }}>
                          {collab.titre || `Collaboration ${collab.id}`}
                        </p>
                        <p style={{ margin: "4px 0 0 0", color: "var(--gray-600)", fontSize: "13px" }}>
                          {collab.nom || "Professionnel"} • Statut: {getCollaborationStatusMeta({
                            backendStatus: collab.backendStatus,
                            statut: collab.statut,
                          }).label}
                        </p>
                      </div>
                      <button
                        className="admin-public-btn"
                        onClick={() => navigate(`/collaboration/${encodeURIComponent(String(collab.id))}`)}
                      >
                        <FiArrowRight /> Ouvrir
                      </button>
                    </div>
                  ))}

                  {ongoingCollaborations.length === 0 && (
                    <p style={{ margin: 0, color: "var(--gray-600)" }}>
                      Aucun projet actif pour le moment.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "profil" && (
            <div className="admin-stat-card" style={{ maxWidth: "760px", display: "block" }}>
              <h3>Mon profil</h3>
              <p>Consultez et mettez à jour vos informations personnelles, puis téléversez votre avatar.</p>
              <button className="admin-public-btn" onClick={openProfile}>
                <FiEdit3 /> Ouvrir mon profil
              </button>
            </div>
          )}

          {activeTab === "collaborations" && (
            <div className="admin-chart-card" style={{ maxWidth: "920px" }}>
              <h3>Mes collaborations</h3>
              <p>Accédez à vos espaces d'échange avec les professionnels et suivez l'avancement de chaque mission.</p>

              {isCollaborationsLoading && (
                <p style={{ marginTop: "12px", color: "var(--gray-600)" }}>
                  Chargement des collaborations...
                </p>
              )}

              {isCollaborationsError && (
                <div style={{ marginTop: "12px", display: "grid", gap: "10px" }}>
                  <p style={{ color: "var(--danger)", margin: 0 }}>
                    Impossible de charger vos collaborations.
                  </p>
                  <button className="admin-public-btn" onClick={() => refetchCollaborations()}>
                    <FiRefreshCw /> Réessayer
                  </button>
                </div>
              )}

              {!isCollaborationsLoading && !isCollaborationsError && collaborations.length === 0 && (
                <div style={{ marginTop: "12px", display: "grid", gap: "10px" }}>
                  <p style={{ margin: 0, color: "var(--gray-600)" }}>
                    Vous n'avez pas encore de collaboration active. Trouvez un professionnel pour démarrer.
                  </p>
                  <button className="admin-public-btn" onClick={() => navigate('/marketplace')}>
                    <FiSearch /> Trouver un pro
                  </button>
                </div>
              )}

              {!isCollaborationsLoading && !isCollaborationsError && collaborations.length > 0 && (
                <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
                  {collaborations.map((collab) => (
                    <div
                      key={collab.id}
                      style={{
                        border: "1px solid var(--gray-200)",
                        borderRadius: "var(--radius-sm)",
                        padding: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontWeight: 600 }}>
                          {collab.nom || "Professionnel"}
                        </p>
                        <p style={{ margin: "4px 0 0 0", color: "var(--gray-600)", fontSize: "13px" }}>
                          {collab.role || "Collaboration"} • Statut: {getCollaborationStatusMeta({
                            backendStatus: collab.backendStatus,
                            statut: collab.statut,
                          }).label}
                        </p>
                      </div>
                      <button
                        className="admin-public-btn"
                        onClick={() =>
                          navigate(`/collaboration/${encodeURIComponent(String(collab.id))}`)
                        }
                      >
                        <FiArrowRight /> Ouvrir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "avis" && (
            <div className="admin-chart-card" style={{ maxWidth: "920px" }}>
              <h3>Mes avis</h3>
              <p>Laissez un avis après vos collaborations terminées pour aider la communauté Jobty.</p>

              {!isCollaborationsLoading && !isCollaborationsError && collaborations.length === 0 && (
                <div style={{ marginTop: "12px", display: "grid", gap: "10px" }}>
                  <p style={{ margin: 0, color: "var(--gray-600)" }}>
                    Aucune collaboration terminée disponible pour laisser un avis.
                  </p>
                </div>
              )}

              {!isCollaborationsLoading && !isCollaborationsError && collaborations.length > 0 && (
                <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
                  {collaborations.map((collab) => (
                    <div
                      key={`${collab.id}-review`}
                      style={{
                        border: "1px solid var(--gray-200)",
                        borderRadius: "var(--radius-sm)",
                        padding: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontWeight: 600 }}>
                          {collab.nom || "Professionnel"}
                        </p>
                        <p style={{ margin: "4px 0 0 0", color: "var(--gray-600)", fontSize: "13px" }}>
                          Collaboration: {collab.id}
                        </p>
                      </div>
                      <button
                        className="admin-public-btn"
                        onClick={() => handleLeaveReview(String(collab.id))}
                      >
                        <FiStar /> Laisser un avis
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
};

export default CustomerDashboard;
