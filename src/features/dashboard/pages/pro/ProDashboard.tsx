import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiStar } from "react-icons/fi";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useDashboardProfile } from "../../hooks/useDashboardProfile";
import {
  TAB_TITLES,
  TAB_TO_ROUTE_SEGMENT,
  resolveActiveTabFromPath,
} from "../../utils/tabHelpers";
import {
  OverviewTab,
  ProCardTab,
  ServicesTab,
  RealisationsTab,
  CollaborationsTab,
  PaymentsTab,
  BillingTab,
  SettingsTab,
  AdsTab,
  AnalyticsTab,
} from "../../components/pro";
import "./css/style.css";

const ProDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useDashboardProfile();

  const activeTab = useMemo(
    () => resolveActiveTabFromPath(location.pathname),
    [location.pathname]
  );

  const goToTab = (tab: string) => {
    const segment = TAB_TO_ROUTE_SEGMENT[tab] || TAB_TO_ROUTE_SEGMENT.apercu;
    navigate(`/dashboard/my/${segment}`);
  };

  // Route guard: redirect to overview if path is invalid
  useEffect(() => {
    const pathname = location.pathname;
    const isDashboardRoot =
      pathname === "/dashboard" || pathname === "/dashboard/";
    const isDashboardMyRoot =
      pathname === "/dashboard/my" || pathname === "/dashboard/my/";

    if (isDashboardRoot || isDashboardMyRoot) {
      navigate("/dashboard/my/overview", { replace: true });
      return;
    }

    if (pathname.startsWith("/dashboard/my/")) {
      const segment = pathname.split("/").filter(Boolean)[2];
      const isKnownSegment = Object.values(TAB_TO_ROUTE_SEGMENT).includes(
        segment
      );
      if (!isKnownSegment) {
        navigate("/dashboard/my/overview", { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  const renderStars = (note: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          style={{
            fill: i <= Math.floor(note) ? "#FFD700" : "none",
            color: i <= Math.floor(note) ? "#FFD700" : "#ddd",
          }}
        />
      );
    }
    return stars;
  };

  const userExtra = (
    <div className="dash-user-rating">
      {renderStars(profile.averageRating || 0)}
      <span>{(profile.averageRating || 0).toFixed(1)}</span>
    </div>
  );

  const title = TAB_TITLES[activeTab] || "Tableau de bord";

  const renderTabContent = () => {
    switch (activeTab) {
      case "apercu":
        return <OverviewTab />;
      case "carte":
        return <ProCardTab />;
      case "services":
        return <ServicesTab />;
      case "posts":
        return <RealisationsTab />;
      case "collaborations":
        return <CollaborationsTab />;
      case "paiement":
        return <PaymentsTab />;
      case "facturation":
        return <BillingTab />;
      case "parametres":
        return <SettingsTab />;
      case "publicite":
        return <AdsTab />;
      case "analytics":
        return <AnalyticsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <DashboardLayout
      title={title}
      role="ROLE_PRO"
      activeTab={activeTab}
      onTabChange={goToTab}
      userExtra={userExtra}
    >
      {renderTabContent()}
    </DashboardLayout>
  );
};

export default ProDashboard;
