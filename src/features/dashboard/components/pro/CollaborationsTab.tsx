import React from "react";
import { useNavigate } from "react-router-dom";
import { FiDollarSign, FiTarget } from "react-icons/fi";
import { useCollaborations } from "../../hooks/useDashboardData";
import { getCollaborationStatusMeta, isCollaborationPending } from "../../utils/collaborationStatus";

const CollaborationsTab: React.FC = () => {
  const navigate = useNavigate();
  const { data: collaborations = [] } = useCollaborations();

  const getStatutBadge = (collab: { backendStatus?: string; statut?: string }) => {
    const s = getCollaborationStatusMeta({
      backendStatus: collab.backendStatus,
      statut: collab.statut,
    });

    return (
      <span
        className="dash-statut-badge"
        style={{ backgroundColor: `${s.color}20`, color: s.color }}
      >
        {s.label}
      </span>
    );
  };

  return (
    <div className="dash-collab-section">
      <div className="dash-section-header">
        <div>
          <h2>Mes collaborations</h2>
          <p className="dash-section-subtitle">
            {collaborations.length} projets au total
          </p>
        </div>
      </div>

      <div className="dash-collab-grid">
        {collaborations.map((collab) => (
          <div key={collab.id} className="dash-collab-card">
            <div className="dash-collab-header">
              <img src={collab.clientPhoto} alt={collab.client} />
              <div className="dash-collab-info">
                <h3>{collab.titre}</h3>
                <p>{collab.client}</p>
              </div>
              {getStatutBadge(collab)}
            </div>

            {isCollaborationPending({
              backendStatus: collab.backendStatus,
              statut: collab.statut,
            }) && (
              <>
                <div className="dash-collab-progress">
                  <div className="dash-progress-bar">
                    <div
                      className="dash-progress-fill"
                      style={{ width: `${collab.progression}%` }}
                    ></div>
                  </div>
                  <span>{collab.progression}%</span>
                </div>
                <p className="dash-collab-next">
                  <FiTarget /> {collab.prochaineLivraison}
                </p>
              </>
            )}

            <div className="dash-collab-footer">
              <span className="dash-collab-amount">
                <FiDollarSign /> {collab.montant} FCFA
              </span>
            </div>

            <button
              className="dash-btn-outline dash-btn-sm"
              onClick={() => navigate(`/collaboration/${collab.id}`)}
            >
              Ouvrir l'espace projet
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollaborationsTab;
