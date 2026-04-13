import React from "react";
import { FiBell, FiCheckCircle, FiInfo, FiAlertCircle, FiX, FiTrash2 } from "react-icons/fi";
import { useUIStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import "./NotificationsDrawer.css";

type NotificationsDrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
};

const iconByType: Record<string, React.ReactNode> = {
  success: <FiCheckCircle className="notif-type success" />,
  info: <FiInfo className="notif-type info" />,
  warning: <FiAlertCircle className="notif-type warning" />,
  error: <FiAlertCircle className="notif-type error" />,
};

const roleTitleMap: Record<string, string> = {
  ROLE_CUSTOMER: "Notifications Client",
  ROLE_PRO: "Notifications Pro",
  ROLE_ENTERPRISE: "Notifications Entreprise",
  ROLE_ADMIN: "Notifications Admin",
  ROLE_MODERATOR: "Notifications Modérateur",
};

const roleEmptyStateMap: Record<string, string> = {
  ROLE_CUSTOMER: "Aucune notification client pour le moment.",
  ROLE_PRO: "Aucune notification pro pour le moment.",
  ROLE_ENTERPRISE: "Aucune notification entreprise pour le moment.",
  ROLE_ADMIN: "Aucune alerte admin pour le moment.",
  ROLE_MODERATOR: "Aucune alerte modérateur pour le moment.",
};

const roleTypeLabelMap: Record<string, Record<string, string>> = {
  ROLE_CUSTOMER: {
    success: "Collaboration",
    info: "Plateforme",
    warning: "Action requise",
    error: "Incident",
  },
  ROLE_PRO: {
    success: "Mission",
    info: "Plateforme",
    warning: "Action requise",
    error: "Paiement",
  },
  ROLE_ENTERPRISE: {
    success: "Projet",
    info: "Plateforme",
    warning: "Action requise",
    error: "Paiement",
  },
  ROLE_ADMIN: {
    success: "Système",
    info: "Monitoring",
    warning: "Risque",
    error: "Critique",
  },
  ROLE_MODERATOR: {
    success: "Modération",
    info: "Revue",
    warning: "Signalement",
    error: "Urgent",
  },
};

const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  open,
  onClose,
  title = "Notifications",
}) => {
  const notifications = useUIStore((state) => state.notifications);
  const removeNotification = useUIStore((state) => state.removeNotification);
  const role = useAuthStore((state) => state.role || state.user?.role || "");

  const resolvedTitle = roleTitleMap[String(role)] || title;
  const emptyMessage =
    roleEmptyStateMap[String(role)] || "Aucune notification pour le moment.";
  const typeLabels =
    roleTypeLabelMap[String(role)] || roleTypeLabelMap.ROLE_CUSTOMER;

  const handleClearAll = () => {
    notifications.forEach((item) => removeNotification(item.id));
  };

  return (
    <div className={`notifications-drawer-root ${open ? "open" : ""}`}>
      <div className="notifications-drawer-overlay" onClick={onClose} />
      <aside className="notifications-drawer" aria-label="Notifications panel">
        <header className="notifications-drawer-header">
          <div className="notifications-header-title">
            <FiBell />
            <h3>{resolvedTitle}</h3>
          </div>
          <div className="notifications-header-actions">
            {notifications.length > 0 && (
              <button
                type="button"
                className="notifications-clear-btn"
                onClick={handleClearAll}
              >
                <FiTrash2 /> Tout effacer
              </button>
            )}
            <button type="button" className="notifications-close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>
        </header>

        <div className="notifications-drawer-body">
          {notifications.length === 0 ? (
            <div className="notifications-empty-state">
              <FiBell />
              <p>{emptyMessage}</p>
            </div>
          ) : (
            <ul className="notifications-list">
              {notifications
                .slice()
                .reverse()
                .map((item) => (
                  <li key={item.id} className="notifications-item">
                    <div className="notifications-item-icon">
                      {iconByType[item.type || "info"] || <FiInfo className="notif-type info" />}
                    </div>
                    <div className="notifications-item-content">
                      <span className={`notifications-item-badge ${item.type || "info"}`}>
                        {typeLabels[item.type || "info"] || "Notification"}
                      </span>
                      {item.title && <h4>{item.title}</h4>}
                      <p>{item.message}</p>
                    </div>
                    <button
                      type="button"
                      className="notifications-item-remove"
                      onClick={() => removeNotification(item.id)}
                      aria-label="Supprimer notification"
                    >
                      <FiX />
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
};

export default NotificationsDrawer;
