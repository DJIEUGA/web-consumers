import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiDollarSign,
  FiBriefcase,
  FiCheckCircle,
  FiTrendingUp,
  FiEye,
  FiMessageCircle,
  FiHeart,
} from "react-icons/fi";
import { useStatsOverview, useCollaborations } from "../../hooks/useDashboardData";

const OverviewTab: React.FC = () => {
  const navigate = useNavigate();
  const { data: statsData } = useStatsOverview();
  const { data: collaborations = [] } = useCollaborations();

  const stats = {
    messagesNonLus: 0,
    messagesRecus: 0,
    favoritesCount: 0,
    gainsTotal: 0,
    projetsEnCours: 0,
    projetsRealises: 0,
    vuesProfile: 0,
    ongoingProjects: [],
    ...statsData,
  };

  const ongoingProjects =
    Array.isArray(stats.ongoingProjects) && stats.ongoingProjects.length > 0
      ? stats.ongoingProjects.map((project, index) => ({
          id: `${project.title}-${index}`,
          titre: project.title,
          client: project.clientName,
          montant: project.amount,
          progression: project.progressPercentage,
          prochaineLivraison: project.deadlineDescription,
          clientPhoto:
            "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
            encodeURIComponent(project.clientName || `client-${index}`),
        }))
      : collaborations.filter((c) => c.statut === "en_attente");

  return (
    <div className="dash-apercu">
      <div className="dash-stats-grid">
        <div className="dash-stat-card primary">
          <div className="dash-stat-icon">
            <FiDollarSign />
          </div>
          <div className="dash-stat-content">
            <span className="dash-stat-label">Gains récoltés</span>
            <span className="dash-stat-value">{stats.gainsTotal} FCFA</span>
            <span className="dash-stat-trend">
              <FiTrendingUp /> +12% ce mois
            </span>
          </div>
        </div>

        <div className="dash-stat-card secondary">
          <div className="dash-stat-icon">
            <FiBriefcase />
          </div>
          <div className="dash-stat-content">
            <span className="dash-stat-label">Projets en cours</span>
            <span className="dash-stat-value">{stats.projetsEnCours}</span>
            <span className="dash-stat-info">collaborations actives</span>
          </div>
        </div>

        <div className="dash-stat-card accent">
          <div className="dash-stat-icon">
            <FiCheckCircle />
          </div>
          <div className="dash-stat-content">
            <span className="dash-stat-label">Projets réalisés</span>
            <span className="dash-stat-value">{stats.projetsRealises}</span>
            <span className="dash-stat-info">missions complétées</span>
          </div>
        </div>
      </div>

      <div className="dash-activity-section">
        <h2>Activité récente</h2>
        <div className="dash-activity-grid">
          <div className="dash-activity-card">
            <FiEye className="dash-activity-icon" />
            <div>
              <span className="dash-activity-label">Vues de profil</span>
              <span className="dash-activity-value">{stats.vuesProfile}</span>
            </div>
          </div>
          <div className="dash-activity-card">
            <FiMessageCircle className="dash-activity-icon" />
            <div>
              <span className="dash-activity-label">Messages reçus</span>
              <span className="dash-activity-value">{stats.messagesRecus}</span>
            </div>
          </div>
          <div className="dash-activity-card">
            <FiHeart className="dash-activity-icon" />
            <div>
              <span className="dash-activity-label">Favoris</span>
              <span className="dash-activity-value">{stats.favoritesCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-header">
          <h2>Projets en cours</h2>
          <button
            className="dash-btn-outline"
            onClick={() => navigate("/dashboard/my/collaborations")}
          >
            Voir tout
          </button>
        </div>
        <div className="dash-projects-quick">
          {ongoingProjects.map((collab) => (
            <div key={collab.id} className="dash-project-quick-card">
              <div className="dash-project-quick-header">
                <img src={collab.clientPhoto} alt={collab.client} />
                <div>
                  <h4>{collab.titre}</h4>
                  <p>{collab.client}</p>
                </div>
                <span className="dash-project-amount">{collab.montant} F</span>
              </div>
              <div className="dash-project-progress">
                <div className="dash-progress-bar">
                  <div
                    className="dash-progress-fill"
                    style={{ width: `${collab.progression}%` }}
                  ></div>
                </div>
                <span>{collab.progression}%</span>
              </div>
              <p className="dash-project-next">{collab.prochaineLivraison}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
