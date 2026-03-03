import React from "react";
import {
  FiPlus,
  FiZap,
  FiEdit3,
  FiEye,
  FiTrash2,
  FiClock,
  FiBriefcase,
} from "react-icons/fi";
import { useServices } from "../../hooks/useDashboardData";
import { useDashboardProfile } from "../../hooks/useDashboardProfile";

const ServicesTab: React.FC = () => {
  const { data: services = [] } = useServices();
  const { profile } = useDashboardProfile();
  const freelancePlan = profile.premium ? "premium" : "gratuit";

  return (
    <div className="dash-services-section">
      <div className="dash-section-header">
        <div>
          <h2>Mes services</h2>
          <p className="dash-section-subtitle">
            {freelancePlan === "gratuit" &&
              `${services.length}/2 services créés (plan gratuit)`}
            {freelancePlan === "premium" && "Services illimités (plan premium)"}
          </p>
        </div>
        <button
          className="dash-btn-primary"
          disabled={freelancePlan === "gratuit" && services.length >= 2}
        >
          <FiPlus /> Créer un service
        </button>
      </div>

      {freelancePlan === "gratuit" && services.length >= 2 && (
        <div className="dash-alert-warning">
          <FiZap />
          <span>
            Limite atteinte ! Passez au plan premium pour créer plus de services.
          </span>
          <button className="dash-btn-upgrade">Passer Premium</button>
        </div>
      )}

      <div className="dash-services-grid">
        {services.map((service) => (
          <div key={service.id} className="dash-service-card">
            <div
              className="dash-service-image"
              style={{ backgroundImage: `url(${service.image})` }}
            >
              <span
                className={`dash-service-status ${service.actif ? "actif" : "inactif"}`}
              >
                {service.actif ? "Actif" : "Inactif"}
              </span>
            </div>
            <div className="dash-service-content">
              <h3>{service.titre}</h3>
              <p>{service.description}</p>
              <div className="dash-service-meta">
                <span className="dash-service-prix">{service.prix} FCFA</span>
                <span className="dash-service-delai">
                  <FiClock /> {service.delai}
                </span>
              </div>
              <div className="dash-service-stats">
                <span>
                  <FiEye /> {service.vues} vues
                </span>
                <span>
                  <FiBriefcase /> {service.commandes} commandes
                </span>
              </div>
            </div>
            <div className="dash-service-actions">
              <button className="dash-icon-btn">
                <FiEdit3 />
              </button>
              <button className="dash-icon-btn">
                <FiEye />
              </button>
              <button className="dash-icon-btn danger">
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesTab;
