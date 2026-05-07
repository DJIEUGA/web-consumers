import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiBell, FiGlobe, FiMessageSquare } from "react-icons/fi";
import RoleSidebar from "@/components/shared/RoleSidebar";
import ProfileDrawer from "@/components/shared/ProfileDrawer";
import NotificationsDrawer from "@/components/shared/NotificationsDrawer";
import MessagingDrawer from "@/features/collaboration/components/MessagingDrawer";
import { useAuthStore, type UserRole } from "@/stores/auth.store";
import { useUIStore } from "@/stores/ui.store";
import { useMessagePolling } from "@/features/collaboration/hooks/useMessagePolling";
import { useLogoutMutation } from "@/features/auth/hooks/useAuthMutations";
import { useDashboardProfile } from "../hooks/useDashboardProfile";
import "../pages/pro/css/style.css";

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagingOpen, setMessagingOpen] = useState(false);
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);

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
  const notifications = useUIStore((state) => state.notifications);

  // Use message polling to simulate real-time notifications (check every 10 seconds)
  useMessagePolling(10000);

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
        onMessagesOpen={() => setMessagingOpen(true)}
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
            <button className="dash-notif-btn" onClick={() => setNotificationsOpen(true)}>
              <FiBell />
              {notifications.length > 0 && (
                <span className="dash-notif-badge">
                  {notifications.length}
                </span>
              )}
            </button>
            <button className="dash-profile-btn" onClick={openProfile}>
              <img src={profile.avatarUrl} alt="" />
            </button>
          </div>
        </header>

        <div className="dash-content">{children}</div>
      </main>

      <ProfileDrawer open={profileOpen} onClose={closeProfile} />
      <NotificationsDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNotificationClick={(notif) => {
          if (notif.metadata?.spaceId) {
            setActiveSpaceId(notif.metadata.spaceId);
            setNotificationsOpen(false);
            setMessagingOpen(true);
          }
        }}
      />
      <MessagingDrawer
        isOpen={messagingOpen}
        onClose={() => {
          setMessagingOpen(false);
          setActiveSpaceId(null);
        }}
        initialSpaceId={activeSpaceId}
      />
    </div>
  );
};

export default DashboardLayout;
