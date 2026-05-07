import React from "react";
import {
  FiUsers,
  FiBriefcase,
  FiDollarSign,
  FiBarChart2,
  FiDownload,
  FiMail,
  FiFileText,
} from "react-icons/fi";
import { FaChartLine } from "react-icons/fa";
import { useAnalytics } from "../../hooks/useDashboardData";

const AnalyticsTab: React.FC = () => {
  const { data: analyticsDataFromHook } = useAnalytics();

  // Fallback mock data while backend endpoint is pending
  const analytics = {
    users: { total: 12340, nouveaux: 2340, actifs: 8920, professionals: 4120, clients: 8220, retention30j: 68, activation: 82 },
    projets: { crees: 890, completes: 234, enCours: 178, annules: 56, tauxSucces: 68, budgetMoyen: 345000, tempsMatching: 2.3 },
    finances: { volumeTotal: 12450000, commissions: 1245000, croissance: 23, ltv: 487000, cac: 12500 },
    categories: [
      { label: "Développement web", pct: 32 },
      { label: "Design graphique", pct: 24 },
      { label: "Marketing digital", pct: 18 },
      { label: "Rédaction", pct: 12 },
    ],
    ...(analyticsDataFromHook ?? {}),
  };

  return (
    <div className="admin-analytics-section">
      <div className="admin-section-header">
        <div>
          <h2>Analytics & Rapports</h2>
          <p className="admin-section-subtitle">Période : Dernier mois</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select className="admin-filter-select">
            <option>Dernier mois</option>
            <option>3 derniers mois</option>
            <option>6 derniers mois</option>
            <option>Cette année</option>
          </select>
          <button className="dash-btn-primary">
            <FiDownload /> Exporter rapport
          </button>
        </div>
      </div>

      <div className="admin-analytics-grid">
        {/* Users */}
        <div className="admin-analytics-card">
          <h3><FiUsers /> Utilisateurs</h3>
          <div className="admin-analytics-content">
            <div className="admin-analytics-stat">
              <span>Total</span>
              <strong>{analytics.users.total.toLocaleString()}</strong>
              <small className="success">+23% vs mois précédent</small>
            </div>
            <div className="admin-analytics-stat">
              <span>Nouveaux</span>
              <strong>{analytics.users.nouveaux.toLocaleString()}</strong>
            </div>
            <div className="admin-analytics-stat">
              <span>Actifs</span>
              <strong>{analytics.users.actifs.toLocaleString()}</strong>
              <small>72% du total</small>
            </div>
            <div className="admin-analytics-divider" />
            <div className="admin-analytics-stat">
              <span>Professionnels</span>
              <strong>{analytics.users.professionals.toLocaleString()}</strong>
            </div>
            <div className="admin-analytics-stat">
              <span>Clients</span>
              <strong>{analytics.users.clients.toLocaleString()}</strong>
            </div>
            <div className="admin-analytics-divider" />
            <div className="admin-analytics-stat">
              <span>Rétention (30j)</span>
              <strong>{analytics.users.retention30j}%</strong>
            </div>
            <div className="admin-analytics-stat">
              <span>Taux d'activation</span>
              <strong>{analytics.users.activation}%</strong>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="admin-analytics-card">
          <h3><FiBriefcase /> Projets</h3>
          <div className="admin-analytics-content">
            <div className="admin-analytics-stat">
              <span>Créés</span>
              <strong>{analytics.projets.crees}</strong>
              <small className="success">+45%</small>
            </div>
            <div className="admin-analytics-stat">
              <span>Complétés</span>
              <strong>{analytics.projets.completes}</strong>
              <small>Taux de succès : {analytics.projets.tauxSucces}%</small>
            </div>
            <div className="admin-analytics-stat">
              <span>En cours</span>
              <strong>{analytics.projets.enCours}</strong>
            </div>
            <div className="admin-analytics-stat">
              <span>Annulés</span>
              <strong>{analytics.projets.annules}</strong>
              <small>6.3% — Acceptable</small>
            </div>
            <div className="admin-analytics-divider" />
            <div className="admin-analytics-stat">
              <span>Budget moyen</span>
              <strong>{analytics.projets.budgetMoyen.toLocaleString()} F</strong>
            </div>
            <div className="admin-analytics-stat">
              <span>Temps de matching</span>
              <strong>{analytics.projets.tempsMatching} jours</strong>
            </div>
          </div>
        </div>

        {/* Finances */}
        <div className="admin-analytics-card">
          <h3><FiDollarSign /> Finances</h3>
          <div className="admin-analytics-content">
            <div className="admin-analytics-stat">
              <span>Volume total</span>
              <strong>{(analytics.finances.volumeTotal / 1000000).toFixed(1)}M F</strong>
            </div>
            <div className="admin-analytics-stat">
              <span>Revenus (commissions)</span>
              <strong>{(analytics.finances.commissions / 1000000).toFixed(1)}M F</strong>
            </div>
            <div className="admin-analytics-stat">
              <span>Croissance MoM</span>
              <strong className="success">+{analytics.finances.croissance}%</strong>
            </div>
            <div className="admin-analytics-divider" />
            <div className="admin-analytics-stat">
              <span>LTV</span>
              <strong>{analytics.finances.ltv.toLocaleString()} F</strong>
            </div>
            <div className="admin-analytics-stat">
              <span>CAC</span>
              <strong>{analytics.finances.cac.toLocaleString()} F</strong>
            </div>
            <div className="admin-analytics-stat">
              <span>Ratio LTV/CAC</span>
              <strong className="success">39x</strong>
              <small>Excellent</small>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="admin-charts-grid">
        <div className="admin-chart-card">
          <h3>Évolution des inscriptions</h3>
          <div className="admin-chart-placeholder">
            <FaChartLine />
            <p>Graphique linéaire sur 12 mois</p>
          </div>
        </div>
        <div className="admin-chart-card">
          <h3>Catégories populaires</h3>
          <div className="admin-categories-list">
            {analytics.categories.map((cat) => (
              <div key={cat.label} className="admin-category-item">
                <span>{cat.label}</span>
                <div className="admin-category-bar">
                  <div className="admin-category-fill" style={{ width: `${cat.pct}%` }} />
                </div>
                <strong>{cat.pct}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-export-actions">
        <button className="dash-btn-secondary"><FiFileText /> Générer rapport PDF</button>
        <button className="dash-btn-secondary"><FiDownload /> Exporter CSV</button>
        <button className="dash-btn-secondary"><FiMail /> Programmer envoi</button>
      </div>
    </div>
  );
};

export default AnalyticsTab;
