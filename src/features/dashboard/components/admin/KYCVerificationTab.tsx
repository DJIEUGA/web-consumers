import React from "react";
import { FiShield, FiCheck, FiX, FiClock } from "react-icons/fi";

/**
 * Admin KYC Verification Tab
 * Review and approve user KYC documents
 */
const KYCVerificationTab: React.FC = () => {
  // TODO: Replace with useAdminKYCQueueQuery() hook
  const kycRequests = [
    {
      id: 1,
      userName: "Jean Dupont",
      userEmail: "jean@example.com",
      documentType: "Carte d'identité",
      submittedAt: "2026-03-01",
      status: "PENDING",
    },
    {
      id: 2,
      userName: "Marie Martin",
      userEmail: "marie@example.com",
      documentType: "Passeport",
      submittedAt: "2026-03-02",
      status: "PENDING",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <FiClock className="text-orange-500" size={20} />;
      case "VERIFIED":
        return <FiCheck className="text-green-500" size={20} />;
      case "REJECTED":
        return <FiX className="text-red-500" size={20} />;
      default:
        return <FiShield className="text-zinc-400" size={20} />;
    }
  };

  return (
    <div className="admin-kyc">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-1">
          Vérification KYC
        </h2>
        <p className="text-sm text-slate-500">{kycRequests.filter(r => r.status === 'PENDING').length} demande(s) en attente</p>
      </div>

      {/* KYC Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <FiClock className="text-orange-600" size={24} />
            <span className="text-sm font-medium text-slate-500">
              En attente
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {kycRequests.filter((r) => r.status === "PENDING").length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <FiCheck className="text-green-600" size={20} />
            <span className="text-sm font-medium text-slate-500">
              Vérifiés aujourd'hui
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">0</div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <FiX className="text-red-600" size={20} />
            <span className="text-sm font-medium text-slate-500">
              Rejetés aujourd'hui
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">0</div>
        </div>
      </div>

      {/* KYC Requests List */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Statut
              </th>
              <th className="text-left p-4 font-semibold text-slate-900">
                Utilisateur
              </th>
              <th className="text-left p-4 font-semibold text-slate-900">
                Email
              </th>
              <th className="text-left p-4 font-semibold text-slate-900">
                Document
              </th>
              <th className="text-left p-4 font-semibold text-slate-900">
                Date de soumission
              </th>
              <th className="text-left p-4 font-semibold text-slate-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {kycRequests.map((request, index) => (
              <tr
                key={request.id}
                className={
                  index !== kycRequests.length - 1 ? "border-b border-zinc-100" : ""
                }
              >
                <td className="p-4">{getStatusIcon(request.status)}</td>
                <td className="p-4">
                  <div className="font-medium text-slate-900">
                    {request.userName}
                  </div>
                </td>
                <td className="p-4 text-slate-500">{request.userEmail}</td>
                <td className="p-4 text-slate-500">{request.documentType}</td>
                <td className="p-4 text-slate-500 text-sm">
                  {request.submittedAt}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                      Approuver
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                      Rejeter
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {kycRequests.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-12 text-center">
          <FiShield className="mx-auto text-zinc-300 mb-4" size={48} />
          <p className="text-slate-500">Aucune demande KYC en attente</p>
        </div>
      )}
    </div>
  );
};

export default KYCVerificationTab;
