import React from "react";
import { FiAlertCircle, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";

/**
 * Admin Disputes Management Tab
 * Handle and resolve user disputes
 */
const DisputesTab: React.FC = () => {
  // TODO: Replace with useAdminDisputesQuery() hook
  const disputes = [
    {
      id: 1,
      projectTitle: "Développement site web",
      clientName: "Jean Dupont",
      proName: "Marie Martin",
      status: "PENDING",
      createdAt: "2026-03-01",
      priority: "high",
      reason: "Retard de livraison",
    },
    {
      id: 2,
      projectTitle: "Design logo",
      clientName: "Sophie Laurent",
      proName: "Thomas Petit",
      status: "RESOLVED",
      createdAt: "2026-02-28",
      priority: "medium",
      reason: "Qualité du travail",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <FiClock className="text-orange-500" size={24} />;
      case "RESOLVED":
        return <FiCheckCircle className="text-green-500" size={24} />;
      case "REJECTED":
        return <FiXCircle className="text-red-500" size={24} />;
      default:
        return <FiAlertCircle className="text-red-500" size={24} />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-orange-100 text-orange-700";
      case "low":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-zinc-100 text-zinc-700";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-100 text-orange-700";
      case "RESOLVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-zinc-100 text-zinc-700";
    }
  };

  return (
    <div className="admin-disputes">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-1">
          Gestion des litiges
        </h2>
        <p className="text-sm text-slate-500">{disputes.length} litige(s) actif(s)</p>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {disputes.map((dispute) => (
          <div
            key={dispute.id}
            className="bg-white rounded-xl border border-zinc-200 p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                {getStatusIcon(dispute.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {dispute.projectTitle}
                    </h3>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getPriorityBadge(
                        dispute.priority
                      )}`}
                    >
                      {dispute.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-500 mb-3">
                    <p>
                      <span className="font-medium">Client:</span>{" "}
                      {dispute.clientName} •{" "}
                      <span className="font-medium">Pro:</span> {dispute.proName}
                    </p>
                    <p>
                      <span className="font-medium">Motif:</span> {dispute.reason}
                    </p>
                    <p className="text-xs text-slate-400">
                      Créé le {dispute.createdAt}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${getStatusBadge(
                      dispute.status
                    )}`}
                  >
                    {dispute.status}
                  </span>
                </div>
              </div>
              {dispute.status === "PENDING" && (
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-xs">
                  Traiter
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {disputes.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-12 text-center">
          <FiAlertCircle className="mx-auto text-zinc-300 mb-4" size={48} />
          <p className="text-slate-500">Aucun litige à traiter</p>
        </div>
      )}
    </div>
  );
};

export default DisputesTab;
