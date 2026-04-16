import React from "react";
import { FiGrid } from "react-icons/fi";

const AdsTab: React.FC = () => {
  return (
    <div className="dash-publicite-section">
      <div className="dash-section">
        <div className="dash-section-header">
          <h2>Publicité</h2>
        </div>
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          <FiGrid size={48} style={{ marginBottom: "20px", opacity: 0.3 }} />
          <h3>Module de publicité</h3>
          <p>Cette fonctionnalité sera bientôt disponible.</p>
        </div>
      </div>
    </div>
  );
};

export default AdsTab;
