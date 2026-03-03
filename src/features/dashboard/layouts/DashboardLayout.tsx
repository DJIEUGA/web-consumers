import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiBell, FiGlobe } from "react-icons/fi";
import RoleSidebar from "@/components/shared/RoleSidebar";
import ProfileDrawer from "@/components/shared/ProfileDrawer";
import { useAuthStore, type UserRole } from "@/stores/auth.store";
import { useLogoutMutation } from "@/features/auth/hooks/useAuthMutations";
import { useDashboardProfile } from "../hooks/useDashboardProfile";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  role: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userExtra?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  role,
  activeTab,
  onTabChange,
  userExtra,
}) => {
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();
  const { profile } = useDashboardProfile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate("/"),
      onError: () => navigate("/"),
    });
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);
  const openProfile = () => setProfileOpen(true);
  const closeProfile = () => setProfileOpen(false);

  // Determine sidebar variant based on role
  const sidebarVariant = role === "ROLE_ADMIN" || role === "ROLE_MODERATOR" ? "admin" : "dash";

  return (
    <div className="dash-page">
      <RoleSidebar
        role={role}
        variant={sidebarVariant}
        open={menuOpen}
        activeTab={activeTab}
        onClose={closeMenu}
        onTabChange={onTabChange}
        onLogout={handleLogout}
        isLoggingOut={logoutMutation.isPending}
        user={{
          firstName: profile.firstName,
          lastName: profile.lastName,
          subtitle: profile.subtitle,
          photo: profile.avatarUrl,
        }}
        userExtra={userExtra}
      />

      <main className="dash-main">
        <header className="dash-header">
          <button className="dash-burger-btn" onClick={toggleMenu}>
            <FiMenu />
          </button>
          <h1 className="dash-page-title">{title}</h1>
          <div className="dash-header-actions">
            <button className="dash-public-btn" onClick={() => navigate("/decouverte")}>
              <FiGlobe /> Site public
            </button>
            <button className="dash-notif-btn">
              <FiBell />
              <span className="dash-notif-badge">
                {profile.unreadNotifications || 0}
              </span>
            </button>
            <button className="dash-profile-btn" onClick={openProfile}>
              <img src={profile.avatarUrl} alt="" />
            </button>
          </div>
        </header>

        <div className="dash-content">{children}</div>
      </main>

      <ProfileDrawer open={profileOpen} onClose={closeProfile} />
    </div>
  );
};

export default DashboardLayout;
