import React from "react";
import { FiBarChart2 } from "react-icons/fi";

const AnalyticsTab: React.FC = () => {
  return (
    <div className="dash-analytics-section">
      <div className="dash-analytics-header">
        <h2>Analytics</h2>
      </div>
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        <FiBarChart2 size={48} style={{ marginBottom: "20px", opacity: 0.3 }} />
        <h3>Module d'analytics</h3>
        <p>Cette fonctionnalité sera bientôt disponible.</p>
      </div>
    </div>
  );
};

export default AnalyticsTab;
