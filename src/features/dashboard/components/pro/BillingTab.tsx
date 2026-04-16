import React from "react";
import { FiCheckCircle } from "react-icons/fi";
import { FaRocket } from "react-icons/fa";
import { useDashboardProfile } from "../../hooks/useDashboardProfile";

const BillingTab: React.FC = () => {
  const { profile } = useDashboardProfile();
  const freelancePlan = profile.premium ? "premium" : "gratuit";

  return (
    <div className="dash-facturation-section">
      <div className="dash-section-header">
        <h2>Facturation et abonnement</h2>
      </div>

      <div className="dash-plan-card">
        <div className="dash-plan-current">
          <h3>
            Plan actuel :{" "}
            <span className="dash-plan-name">
              {freelancePlan === "gratuit" ? "Gratuit" : "Premium"}
            </span>
          </h3>
          <p>Mode de facturation : Commission de 10% sur chaque projet</p>
        </div>
        <button className="dash-btn-primary">
          <FaRocket /> Passer au plan Premium
        </button>
      </div>

      <div className="dash-plan-comparison">
        <div className="dash-plan-col">
          <h4>Plan Gratuit</h4>
          <ul>
            <li>
              <FiCheckCircle /> Commission de 10%
            </li>
            <li>
              <FiCheckCircle /> 2 services maximum
            </li>
            <li>
              <FiCheckCircle /> Support standard
            </li>
          </ul>
        </div>
        <div className="dash-plan-col premium">
          <h4>Plan Premium</h4>
          <p className="dash-plan-price">15 000 FCFA/mois</p>
          <ul>
            <li>
              <FiCheckCircle /> Aucune commission
            </li>
            <li>
              <FiCheckCircle /> Services illimités
            </li>
            <li>
              <FiCheckCircle /> Badge vérifié
            </li>
            <li>
              <FiCheckCircle /> Support prioritaire
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BillingTab;
