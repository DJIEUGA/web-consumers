import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiX,
  FiLogOut,
  FiGrid,
  FiUsers,
  FiBriefcase,
  FiCreditCard,
  FiMap,
  FiBarChart2,
  FiShield,
  FiSettings,
  FiUser,
  FiImage,
  FiFileText,
  FiCompass,
  FiGlobe,
  FiStar,
} from "react-icons/fi";
import { FaBalanceScale, FaUserShield, FaHandshake, FaBullhorn } from "react-icons/fa";
import type { UserRole } from "@/stores/auth.store";
import { useAuthStore } from "@/stores/auth.store";
import Logo from "@/components/shared/Logo";

type SidebarVariant = "admin" | "dash";

type NavItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

type SidebarUser = {
  firstName: string;
  lastName: string;
  subtitle: string;
  photo: string;
};

interface RoleSidebarProps {
  role: UserRole;
  variant: SidebarVariant;
  open: boolean;
  activeTab: string;
  onClose: () => void;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  isLoggingOut?: boolean;
  user: SidebarUser;
  userExtra?: React.ReactNode;
}

const adminItems: NavItem[] = [
  { key: "apercu", label: "Vue d'ensemble", icon: <FiGrid /> },
  { key: "users", label: "Utilisateurs", icon: <FiUsers /> },
  { key: "projets", label: "Projets", icon: <FiBriefcase /> },
  { key: "paiements", label: "Paiements", icon: <FiCreditCard /> },
  { key: "litiges", label: "Litiges", icon: <FaBalanceScale /> },
  { key: "carte", label: "Carte", icon: <FiMap /> },
  { key: "stats", label: "Analytics", icon: <FiBarChart2 /> },
  { key: "kyc", label: "Vérification KYC", icon: <FiShield /> },
  { key: "moderateurs", label: "Modérateurs", icon: <FaUserShield /> },
  { key: "config", label: "Configuration", icon: <FiSettings /> },
];

const moderatorItems: NavItem[] = [
  { key: "apercu", label: "Vue d'ensemble", icon: <FiGrid /> },
  { key: "users", label: "Utilisateurs", icon: <FiUsers /> },
  { key: "projets", label: "Projets", icon: <FiBriefcase /> },
  { key: "litiges", label: "Litiges", icon: <FaBalanceScale /> },
  { key: "kyc", label: "Vérification KYC", icon: <FiShield /> },
  { key: "stats", label: "Analytics", icon: <FiBarChart2 /> },
];

const proItems: NavItem[] = [
  { key: "apercu", label: "Aperçu", icon: <FiGrid /> },
  { key: "carte", label: "Ma carte pro", icon: <FiUser /> },
  { key: "services", label: "Services", icon: <FiBriefcase /> },
  { key: "posts", label: "Réalisations", icon: <FiImage /> },
  { key: "collaborations", label: "Collaborations", icon: <FaHandshake /> },
  { key: "paiement", label: "Paiement", icon: <FiCreditCard /> },
  { key: "facturation", label: "Facturation", icon: <FiFileText /> },
  { key: "parametres", label: "Paramètres", icon: <FiSettings /> },
  { key: "publicite", label: "Publicité", icon: <FaBullhorn /> },
  { key: "analytics", label: "Analytics", icon: <FiBarChart2 /> },
];

const customerItems: NavItem[] = [
  { key: "apercu", label: "Vue d'ensemble", icon: <FiGrid /> },
  { key: "profil", label: "Mon profil", icon: <FiUser /> },
  { key: "collaborations", label: "Collaborations", icon: <FaHandshake /> },
  { key: "trouver-pro", label: "Trouver un pro", icon: <FiCompass /> },
  { key: "avis", label: "Avis", icon: <FiStar /> },
];

const roleItems: Record<UserRole, NavItem[]> = {
  ROLE_ADMIN: adminItems,
  ROLE_MODERATOR: moderatorItems,
  ROLE_PRO: proItems,
  ROLE_ENTERPRISE: proItems,
  ROLE_CUSTOMER: customerItems,
};

const RoleSidebar: React.FC<RoleSidebarProps> = ({
  role,
  variant,
  open,
  activeTab,
  onClose,
  onTabChange,
  onLogout,
  isLoggingOut = false,
  user,
  userExtra,
}) => {
  const navigate = useNavigate();
  const authUserId = useAuthStore((state) => state.user?.id);
  const items = roleItems[role] ?? customerItems;
  const canOpenPublicProfile =
    (role === "ROLE_PRO" || role === "ROLE_ENTERPRISE") && Boolean(authUserId);

  const prefix = variant === "dash" ? "dash" : "admin";
  const sidebarClass = `${prefix}-sidebar`;
  const headerClass = `${prefix}-sidebar-header`;
  const logoClass = `${prefix}-sidebar-logo`;
  const closeClass = `${prefix}-close-btn`;
  const userCardClass = `${prefix}-user-card`;
  const navClass = `${prefix}-nav`;
  const navItemClass = `${prefix}-nav-item`;
  const logoutClass = `${prefix}-logout-btn`;
  const overlayClass = `${prefix}-overlay`;

  return (
    <>
      <aside className={`${sidebarClass} ${open ? "open" : ""}`}>
        <div className={headerClass}>
          <Logo
            alt="Jobty"
            className={logoClass}
            onClick={() => navigate("/")}
            style={{ width:'120px', height: 'auto',cursor: "pointer" }}
          />
          <button className={closeClass} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={userCardClass}>
          <img
            src={user.photo}
            alt={`${user.firstName} ${user.lastName}`}
            className={variant === "dash" ? "dash-user-photo" : undefined}
            style={{ display: "block", margin: "0 auto 10px" }}
          />
          <h3>
            {user.firstName} {user.lastName}
          </h3>
          <p>{user.subtitle}</p>
          {userExtra}
        </div>

        <nav className={navClass}>
          {items.map((item) => (
            <button
              key={item.key}
              className={`${navItemClass} ${activeTab === item.key ? "active" : ""}`}
              onClick={() => onTabChange(item.key)}
            >
              {item.icon} {item.label}
            </button>
          ))}

          {canOpenPublicProfile && (
            <button
              className={navItemClass}
              onClick={() => navigate(`/profiles/${encodeURIComponent(String(authUserId))}`)}
            >
              <FiUser /> Mon profil public
            </button>
          )}
        </nav>

        <button className={logoutClass} onClick={onLogout} disabled={isLoggingOut}>
          <FiLogOut /> {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
        </button>
      </aside>

      {open && <div className={overlayClass} onClick={onClose}></div>}
    </>
  );
};

export default RoleSidebar;
