import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../features/auth/hooks/useAuthMutations";
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
import logo from "../assets/logo.png";
import "./DashboardAdmin.css";

const DashboardCustomer = () => {
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("apercu");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [kycDetail, setKycDetail] = useState(null);
  const [litigeDetail, setLitigeDetail] = useState(null);

  // Données Admin
  const adminUser = {
    nom: "Client",
    prenom: "Julia",
    role: "Client(e)",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=AdminJulie",
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);
  return (
    <div className="admin-page">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <img
            src={logo}
            alt="Jobty"
            className="admin-sidebar-logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          />
          <button className="admin-close-btn" onClick={closeMenu}>
            <FiX />
          </button>
        </div>

        <div className="admin-user-card">
          <img
            src={adminUser.photo}
            alt={`${adminUser.prenom} ${adminUser.nom}`}
          />
          <h3>
            {adminUser.prenom} {adminUser.nom}
          </h3>
          <p>{adminUser.role}</p>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === "apercu" ? "active" : ""}`}
            onClick={() => setActiveTab("apercu")}
          >
            <FiGrid /> Vue d'ensemble
          </button>
          <button
            className={`admin-nav-item ${activeTab === "projets" ? "active" : ""}`}
            onClick={() => setActiveTab("projets")}
          >
            <FiBriefcase /> Projets
          </button>
        </nav>

        <button
          className="admin-logout-btn"
          onClick={() => {
            logoutMutation.mutate(undefined, {
              onSuccess: () => {
                navigate("/");
              },
              onError: (err) => {
                console.error("Logout error:", err);
                // Still navigate even if logout fails
                navigate("/");
              },
            });
          }}
          disabled={logoutMutation.isPending}
        >
          <FiLogOut />{" "}
          {logoutMutation.isPending ? "Déconnexion..." : "Déconnexion"}
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
            {activeTab === "apercu" && "Tableau de bord Client"}
            {activeTab === "projets" && "Gestion des projets"}
          </h1>
          <div className="admin-header-actions">
            <button className="admin-notif-btn">
              <FiBell />
              <span className="admin-notif-badge">15</span>
            </button>
            <button className="admin-profile-btn">
              <img src={adminUser.photo} alt="" />
            </button>
          </div>
        </header>

        <div className="admin-content"></div>
      </main>
    </div>
  );
};

export default DashboardCustomer;
