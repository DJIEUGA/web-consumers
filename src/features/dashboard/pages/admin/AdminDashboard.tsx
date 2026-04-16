import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useDashboardProfile } from "../../hooks/useDashboardProfile";
import {
  ADMIN_TAB_TITLES,
  ADMIN_TAB_TO_ROUTE,
  resolveAdminTabFromPath,
} from "../../utils/adminTabHelpers";
import {
  OverviewTab,
  UsersTab,
  ProjectsTab,
  PaymentsTab,
  DisputesTab,
  MapTab,
  AnalyticsTab,
  KYCVerificationTab,
  ModeratorsTab,
  ConfigurationTab,
} from "../../components/admin";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useDashboardProfile();

  // Derive active tab from URL
  const activeTab = useMemo(
    () => resolveAdminTabFromPath(location.pathname),
    [location.pathname]
  );

  // Navigate to specific tab
  const goToTab = (tab: string) => {
    const segment = ADMIN_TAB_TO_ROUTE[tab] || ADMIN_TAB_TO_ROUTE.apercu;
    navigate(`/dashboard/admin/${segment}`);
  };

  // Route guards: redirect invalid paths to overview
  useEffect(() => {
    const pathname = location.pathname;
    const isDashboardRoot =
      pathname === "/dashboard" || pathname === "/dashboard/";
    const isAdminRoot =
      pathname === "/dashboard/admin" || pathname === "/dashboard/admin/";

    if (isDashboardRoot || isAdminRoot) {
      navigate("/dashboard/admin/overview", { replace: true });
      return;
    }

    if (pathname.startsWith("/dashboard/admin/")) {
      const segment = pathname.split("/").filter(Boolean)[2];
      const isKnownSegment = Object.values(ADMIN_TAB_TO_ROUTE).includes(segment);
      if (!isKnownSegment) {
        navigate("/dashboard/admin/overview", { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  const title = ADMIN_TAB_TITLES[activeTab] || "Administration";

  // Admin-specific user extra (admin badge)
  const userExtra = (
    <div className="flex items-center gap-2">
      <span className="inline-flex px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-semibold">
        ADMIN
      </span>
    </div>
  );

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "apercu":
        return <OverviewTab />;
      case "users":
        return <UsersTab />;
      case "projets":
        return <ProjectsTab />;
      case "paiements":
        return <PaymentsTab />;
      case "litiges":
        return <DisputesTab />;
      case "carte":
        return <MapTab />;
      case "stats":
        return <AnalyticsTab />;
      case "kyc":
        return <KYCVerificationTab />;
      case "moderateurs":
        return <ModeratorsTab />;
      case "config":
        return <ConfigurationTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <DashboardLayout
      title={title}
      role="ROLE_ADMIN"
      activeTab={activeTab}
      onTabChange={goToTab}
      userExtra={userExtra}
    >
      <div className="admin-dashboard-content">
        {renderTabContent()}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
