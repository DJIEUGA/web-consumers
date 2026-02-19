import React, { useState } from "react";
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
  FiEye,
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
import RoleSidebar from '../../../../components/shared/RoleSidebar';
import { useDashboardProfile } from '../../hooks/useDashboardProfile';
import "./css/style.css";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("apercu");
  const { profile: dashboardProfile } = useDashboardProfile();

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
            {activeTab === "apercu" && "Tableau de bord Client"}
            {activeTab === "projets" && "Gestion des projets"}
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

        <div className="admin-content"></div>
      </main>
      <ProfileDrawer open={profileOpen} onClose={closeProfile} />
    </div>
  );
};

export default CustomerDashboard;
