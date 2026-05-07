import React from "react";
import { FiDollarSign, FiEye, FiDownload, FiAlertCircle, FiAlertTriangle } from "react-icons/fi";
import { usePayments, useTransactions } from "../../hooks/useDashboardData";

const PaymentsTab: React.FC = () => {
  const { data: paiements = [] } = usePayments();
  const { data: transactions = [] } = useTransactions();

  const getStatutBadge = (statut: string) => {
    const map: Record<string, { label: string; color: string }> = {
      valide: { label: "Validé", color: "#4CAF50" },
      en_cours: { label: "En cours", color: "#3DC7C9" },
      echec: { label: "Échoué", color: "#F44336" },
      rembourse: { label: "Remboursé", color: "#FF9800" },
    };
    const s = map[statut] || { label: statut, color: "#9E9E9E" };
    return (
      <span className="admin-badge" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="admin-payments-section">
      <div className="admin-section-header">
        <div>
          <h2>Gestion des paiements</h2>
          <p className="admin-section-subtitle">Dashboard financier</p>
        </div>
        <button className="dash-btn-primary">
          <FiDownload /> Exporter rapport
        </button>
      </div>

      {/* Finance metrics */}
      <div className="admin-finance-metrics">
        <div className="admin-metric-card primary">
          <h3>Volume total</h3>
          <p className="admin-metric-value">12,450,000 F</p>
          <span className="admin-metric-trend">+23% vs mois dernier</span>
        </div>
        <div className="admin-metric-card secondary">
          <h3>Commissions</h3>
          <p className="admin-metric-value">1,245,000 F</p>
          <span className="admin-metric-info">10% du volume</span>
        </div>
        <div className="admin-metric-card accent">
          <h3>En séquestre</h3>
          <p className="admin-metric-value">2,340,000 F</p>
          <span className="admin-metric-info">18 projets actifs</span>
        </div>
        <div className="admin-metric-card">
          <h3>Versé aux pros</h3>
          <p className="admin-metric-value">8,865,000 F</p>
          <span className="admin-metric-info">Ce mois</span>
        </div>
      </div>

      {/* Alerts */}
      <div className="admin-payment-alerts">
        <div className="admin-alert admin-alert-danger">
          <FiAlertCircle />
          <span>3 paiements échoués (dernières 24h)</span>
          <button className="admin-btn-link">Voir détails</button>
        </div>
        <div className="admin-alert admin-alert-warning">
          <FiAlertTriangle />
          <span>5 remboursements en attente d'approbation</span>
          <button className="admin-btn-link">Traiter</button>
        </div>
      </div>

      {/* Transactions table */}
      <div className="admin-transactions">
        <h3>Transactions récentes</h3>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>De → Vers</th>
                <th>Montant</th>
                <th>Type</th>
                <th>Méthode</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((trans) => (
                <tr key={trans.id}>
                  <td><strong>{trans.id}</strong></td>
                  <td>{trans.date}</td>
                  <td>{trans.de} → {trans.vers}</td>
                  <td className="admin-text-primary">
                    <strong>{trans.montant?.toLocaleString()} F</strong>
                  </td>
                  <td>{trans.type}</td>
                  <td>{trans.methode}</td>
                  <td>{getStatutBadge(trans.statut)}</td>
                  <td>
                    <button className="admin-action-btn"><FiEye /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsTab;
