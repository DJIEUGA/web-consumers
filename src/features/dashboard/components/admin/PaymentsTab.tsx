import React from "react";
import { FiDollarSign, FiTrendingUp, FiCalendar } from "react-icons/fi";

/**
 * Admin Payments Management Tab
 * Monitor platform payment transactions and revenue
 */
const PaymentsTab: React.FC = () => {
  // TODO: Replace with useAdminPaymentsQuery() hook
  const payments = [
    {
      id: 1,
      projectTitle: "Développement site e-commerce",
      client: "Jean Dupont",
      pro: "Marie Martin",
      amount: 5000,
      commission: 500,
      status: "COMPLETED",
      date: "2026-03-01",
    },
    {
      id: 2,
      projectTitle: "Design application mobile",
      client: "Sophie Laurent",
      pro: "Thomas Petit",
      amount: 3500,
      commission: 350,
      status: "PENDING",
      date: "2026-03-02",
    },
  ];

  const totalRevenue = payments.reduce((sum, p) => sum + p.commission, 0);

  return (
    <div className="admin-payments">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Gestion des paiements
      </h2>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <FiDollarSign className="text-green-600" size={24} />
            <span className="text-sm font-medium text-slate-500">
              Commissions totales
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {totalRevenue.toLocaleString()} €
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <FiTrendingUp className="text-blue-600" size={24} />
            <span className="text-sm font-medium text-slate-500">
              Transactions ce mois
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {payments.length}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <FiCalendar className="text-indigo-600" size={24} />
            <span className="text-sm font-medium text-slate-500">
              Paiements en attente
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {payments.filter((p) => p.status === "PENDING").length}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left p-4 font-semibold text-slate-900">
                Projet
              </th>
              <th className="text-left p-4 font-semibold text-slate-900">
                Client
              </th>
              <th className="text-left p-4 font-semibold text-slate-900">
                Professionnel
              </th>
              <th className="text-left p-4 font-semibold text-slate-900">
                Montant
              </th>
              <th className="text-left p-4 font-semibold text-slate-900">
                Commission
              </th>
              <th className="text-left p-4 font-semibold text-slate-900">
                Statut
              </th>
              <th className="text-left p-4 font-semibold text-slate-900">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr
                key={payment.id}
                className={index !== payments.length - 1 ? "border-b border-zinc-100" : ""}
              >
                <td className="p-4">
                  <div className="font-medium text-slate-900">
                    {payment.projectTitle}
                  </div>
                </td>
                <td className="p-4 text-slate-500">{payment.client}</td>
                <td className="p-4 text-slate-500">{payment.pro}</td>
                <td className="p-4 font-semibold text-slate-900">
                  {payment.amount.toLocaleString()} €
                </td>
                <td className="p-4 font-semibold text-green-600">
                  {payment.commission.toLocaleString()} €
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="p-4 text-slate-500 text-sm">{payment.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsTab;
