import React, { useState } from "react";
import { FiDownload } from "react-icons/fi";
import { useTransactions } from "../../hooks/useDashboardData";

const PaymentsTab: React.FC = () => {
  const { data: transactions = [] } = useTransactions();
  const [paiementSubTab, setPaiementSubTab] = useState<"recus" | "retraits">("recus");

  const transactionsByType = {
    recues: transactions || [],
    retraits: [],
  };

  const getStatutBadge = (statut: string) => {
    const key = String(statut ?? "").toLowerCase();
    const statuts = {
      en_attente: { label: "En attente", color: "#ffc107" },
      complete: { label: "Complété", color: "#28a745" },
      recu: { label: "Reçu", color: "#28a745" },
      en_cours: { label: "En cours", color: "#3DC7C9" },
    };
    const s = statuts[key] ?? { label: "Inconnu", color: "#64748b" };
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
    <div className="dash-paiement-section">
      <div className="dash-section-header">
        <h2>Gestion des paiements</h2>
      </div>

      <div className="dash-subtabs">
        <button
          className={`dash-subtab ${paiementSubTab === "recus" ? "active" : ""}`}
          onClick={() => setPaiementSubTab("recus")}
        >
          Paiements reçus
        </button>
        <button
          className={`dash-subtab ${paiementSubTab === "retraits" ? "active" : ""}`}
          onClick={() => setPaiementSubTab("retraits")}
        >
          Retraits
        </button>
      </div>

      {paiementSubTab === "recus" && (
        <div className="dash-transactions-list">
          {transactionsByType.recues.map((trans) => (
            <div key={trans.id} className="dash-transaction-card">
              <div className="dash-transaction-info">
                <h4>{trans.projet}</h4>
                <p>Client : {trans.client}</p>
                <span className="dash-transaction-date">
                  {new Date(trans.date).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="dash-transaction-right">
                <span className="dash-transaction-amount">
                  +{trans.montant} FCFA
                </span>
                {getStatutBadge(trans.statut)}
              </div>
            </div>
          ))}
        </div>
      )}

      {paiementSubTab === "retraits" && (
        <div className="dash-transactions-list">
          <button className="dash-btn-primary dash-btn-full">
            <FiDownload /> Demander un retrait
          </button>
          {transactionsByType.retraits.map((retrait) => (
            <div key={retrait.id} className="dash-transaction-card">
              <div className="dash-transaction-info">
                <h4>{retrait.methode}</h4>
                <p>{retrait.numero}</p>
                <span className="dash-transaction-date">
                  {new Date(retrait.date).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="dash-transaction-right">
                <span className="dash-transaction-amount withdraw">
                  -{retrait.montant} FCFA
                </span>
                {getStatutBadge(retrait.statut)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentsTab;
