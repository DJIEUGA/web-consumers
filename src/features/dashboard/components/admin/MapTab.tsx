import React from "react";
import { FiMap } from "react-icons/fi";
import { FaMapMarkedAlt } from "react-icons/fa";

const MapTab: React.FC = () => {
  const geo = [
    { pays: "Nigeria", users: 3240, pct: 26, flag: "🇳🇬" },
    { pays: "Sénégal", users: 2890, pct: 23, flag: "🇸🇳" },
    { pays: "Côte d'Ivoire", users: 2120, pct: 17, flag: "🇨🇮" },
    { pays: "Ghana", users: 1890, pct: 15, flag: "🇬🇭" },
    { pays: "Kenya", users: 1340, pct: 11, flag: "🇰🇪" },
  ];

  return (
    <div className="admin-map-section">
      <div className="admin-section-header">
        <div>
          <h2>Carte des localisations</h2>
          <p className="admin-section-subtitle">Répartition géographique des utilisateurs et projets</p>
        </div>
      </div>

      {/* Map filters */}
      <div className="admin-map-filters">
        <label className="admin-checkbox">
          <input type="checkbox" defaultChecked />
          <span>Professionnels disponibles</span>
        </label>
        <label className="admin-checkbox">
          <input type="checkbox" defaultChecked />
          <span>Projets ouverts</span>
        </label>
        <label className="admin-checkbox">
          <input type="checkbox" />
          <span>Pros certifiés</span>
        </label>
        <label className="admin-checkbox">
          <input type="checkbox" />
          <span>Nouveaux inscrits (7j)</span>
        </label>
      </div>

      {/* Map placeholder */}
      <div className="admin-map-container">
        <div className="admin-map-placeholder">
          <FaMapMarkedAlt />
          <h3>Carte interactive</h3>
          <p>Intégration Google Maps / Mapbox</p>
          <div className="admin-map-legend">
            <span>🟢 Professionnel disponible</span>
            <span>🔵 Projet ouvert</span>
            <span>🟡 Zone d'activité élevée</span>
            <span>🔴 Problème détecté</span>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="admin-heatmap">
        <h3>Répartition par région</h3>
        {geo.map((pays) => (
          <div key={pays.pays} className="admin-heatmap-row">
            <span className="admin-heatmap-country">{pays.flag} {pays.pays}</span>
            <div className="admin-heatmap-bar">
              <div className="admin-heatmap-fill" style={{ width: `${pays.pct}%` }} />
            </div>
            <span className="admin-heatmap-value">{pays.users.toLocaleString()} ({pays.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapTab;
