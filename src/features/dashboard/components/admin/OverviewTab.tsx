import React from "react";
import {
  FiUsers,
  FiBriefcase,
  FiDollarSign,
  FiStar,
  FiTrendingUp,
  FiActivity,
  FiAlertTriangle,
  FiClock,
  FiArrowRight,
  FiTarget,
  FiBarChart2,
  FiGlobe,
} from "react-icons/fi";
import {
  useStatsToday,
  useStatsMonth,
  useAlerts,
  useKycQueue,
  useDisputes,
  useTransactions,
} from "../../hooks/useDashboardData";

const OverviewTab: React.FC = () => {
  const { data: statsToday } = useStatsToday();
  const { data: statsMonth } = useStatsMonth();
  const { data: alerts = [] } = useAlerts();
  const { data: kycDemandes = [] } = useKycQueue();
  const { data: litiges = [] } = useDisputes();
  const { data: transactions = [] } = useTransactions();

  const platformHealth = [
    { label: "Taux de conversion", value: 68 },
    { label: "Taux de matching", value: 82 },
    { label: "Taux de succès", value: 75 },
  ];

  return (
    <div className="dash-apercu">

      {/* Alert banners */}
      {alerts.length > 0 && (
        <div className="admin-alerts">
          {alerts.map((alerte, index) => (
            <div key={index} className={`admin-alert admin-alert-${alerte.type}`}>
              <FiAlertTriangle />
              <span>{alerte.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats — Aujourd'hui */}
      {statsToday && (
        <div className="admin-stats-section">
          <h2>Aujourd'hui</h2>
          <div className="dash-stats-grid">
            <div className="dash-stat-card primary">
              <div className="dash-stat-icon"><FiUsers /></div>
              <div className="dash-stat-content">
                <span className="dash-stat-label">Nouveaux utilisateurs</span>
                <span className="dash-stat-value">+{statsToday.nouveauxUsers}</span>
                <span className="dash-stat-trend">
                  <FiTrendingUp /> +{statsToday.trendUsers}% vs hier
                </span>
              </div>
            </div>

            <div className="dash-stat-card secondary">
              <div className="dash-stat-icon"><FiBriefcase /></div>
              <div className="dash-stat-content">
                <span className="dash-stat-label">Nouveaux projets</span>
                <span className="dash-stat-value">+{statsToday.nouveauxProjets}</span>
                <span className="dash-stat-trend">
                  <FiTrendingUp /> +{statsToday.trendProjets}% vs hier
                </span>
              </div>
            </div>

            <div className="dash-stat-card accent">
              <div className="dash-stat-icon"><FiDollarSign /></div>
              <div className="dash-stat-content">
                <span className="dash-stat-label">Commissions</span>
                <span className="dash-stat-value">{statsToday.commissions?.toLocaleString()} F</span>
                <span className="dash-stat-trend">
                  <FiTrendingUp /> +{statsToday.trendCommissions}% vs hier
                </span>
              </div>
            </div>

            <div className="dash-stat-card warning">
              <div className="dash-stat-icon"><FiStar /></div>
              <div className="dash-stat-content">
                <span className="dash-stat-label">Satisfaction</span>
                <span className="dash-stat-value">{statsToday.satisfaction}/5</span>
                <span className="dash-stat-info"><FiActivity /> Stable</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats — Ce mois */}
      {statsMonth && (
        <div className="admin-stats-section">
          <h2>Ce mois</h2>
          <div className="dash-stats-grid">
            <div className="dash-stat-card">
              <div className="dash-stat-icon"><FiUsers /></div>
              <div className="dash-stat-content">
                <span className="dash-stat-label">Utilisateurs actifs</span>
                <span className="dash-stat-value">{statsMonth.usersActifs?.toLocaleString()}</span>
                <span className="dash-stat-info">
                  <FiTarget /> {statsMonth.quotaUsers}% du quota
                </span>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="dash-stat-icon"><FiBriefcase /></div>
              <div className="dash-stat-content">
                <span className="dash-stat-label">Projets créés</span>
                <span className="dash-stat-value">{statsMonth.projets}</span>
                <span className="dash-stat-trend">
                  <FiTrendingUp /> +{statsMonth.trendProjets}% vs mois dernier
                </span>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="dash-stat-icon"><FiDollarSign /></div>
              <div className="dash-stat-content">
                <span className="dash-stat-label">Volume total</span>
                <span className="dash-stat-value">{(statsMonth.volume / 1000000).toFixed(1)}M F</span>
                <span className="dash-stat-info">Record historique</span>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="dash-stat-icon"><FiActivity /></div>
              <div className="dash-stat-content">
                <span className="dash-stat-label">Contrats signés</span>
                <span className="dash-stat-value">{statsMonth.contrats}</span>
                <span className="dash-stat-trend">
                  <FiTrendingUp /> +{statsMonth.trendContrats}% vs mois dernier
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts + Platform health */}
      <div className="admin-charts-grid">
        <div className="admin-chart-card">
          <h3>Activité des 7 derniers jours</h3>
          <div className="admin-chart-placeholder">
            <FiBarChart2 />
            <p>Graphique des inscriptions quotidiennes</p>
          </div>
        </div>

        <div className="admin-chart-card">
          <h3>Répartition par pays</h3>
          <div className="admin-chart-placeholder">
            <FiGlobe />
            <p>Distribution géographique des utilisateurs</p>
          </div>
        </div>

        <div className="admin-chart-card">
          <h3>Santé de la plateforme</h3>
          <div className="admin-health-metrics">
            {platformHealth.map((metric) => (
              <div key={metric.label} className="admin-metric-row">
                <span>{metric.label}</span>
                <div className="admin-progress-bar">
                  <div className="admin-progress-fill" style={{ width: `${metric.value}%` }} />
                </div>
                <span>{metric.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="admin-recent-grid">
        <div className="admin-recent-card">
          <h3>Transactions récentes</h3>
          <div className="admin-recent-list">
            {transactions.slice(0, 3).map((trans) => (
              <div key={trans.id} className="admin-recent-item">
                <div className="admin-recent-info">
                  <span className="admin-recent-id">{trans.id}</span>
                  <span className="admin-recent-meta">{trans.montant?.toLocaleString()} F</span>
                </div>
                <span
                  className="dash-statut-badge"
                  style={{
                    backgroundColor: trans.statut === "valide" ? "#4CAF5020" : "#3DC7C920",
                    color: trans.statut === "valide" ? "#4CAF50" : "#3DC7C9",
                  }}
                >
                  {trans.statut}
                </span>
              </div>
            ))}
          </div>
          <button className="admin-btn-link">
            Voir tout <FiArrowRight size={12} />
          </button>
        </div>

        <div className="admin-recent-card">
          <h3>KYC en attente</h3>
          <div className="admin-recent-list">
            {kycDemandes.map((kyc) => (
              <div key={kyc.id} className="admin-recent-item">
                <div className="admin-recent-info">
                  <span className="admin-recent-name">{kyc.prenom} {kyc.nom}</span>
                  <span className="admin-recent-meta">
                    <FiClock size={11} /> {kyc.delai}
                  </span>
                </div>
                <span className="admin-priority-badge">{kyc.priorite}</span>
              </div>
            ))}
          </div>
          <button className="admin-btn-link">
            Traiter <FiArrowRight size={12} />
          </button>
        </div>

        <div className="admin-recent-card">
          <h3>Litiges actifs</h3>
          <div className="admin-recent-list">
            {litiges.map((litige) => (
              <div key={litige.id} className="admin-recent-item">
                <div className="admin-recent-info">
                  <span className="admin-recent-name">{litige.titre}</span>
                  <span className="admin-recent-meta">
                    <FiClock size={11} /> {litige.ouvertDepuis}
                  </span>
                </div>
                <span className="admin-priority-badge">{litige.priorite}</span>
              </div>
            ))}
          </div>
          <button className="admin-btn-link">
            Résoudre <FiArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
