import React from "react";
import { FiBarChart2, FiTrendingUp, FiActivity } from "react-icons/fi";

/**
 * Admin Analytics Tab
 * Platform statistics, trends, and insights
 */
const AnalyticsTab: React.FC = () => {
  // TODO: Replace with useAdminAnalyticsQuery() hook
  // TODO: Integrate chart library (e.g., Recharts, Chart.js)

  const metrics = [
    {
      label: "Taux de conversion",
      value: "12.5%",
      trend: "+2.3%",
      positive: true,
    },
    {
      label: "Temps moyen par projet",
      value: "14 jours",
      trend: "-3 jours",
      positive: true,
    },
    {
      label: "Satisfaction client",
      value: "4.6/5",
      trend: "+0.2",
      positive: true,
    },
  ];

  return (
    <div className="admin-analytics">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Statistiques et Analytics
      </h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <FiActivity className="text-indigo-600" size={24} />
              <span
                className={`text-sm font-medium ${
                  metric.positive ? "text-green-600" : "text-red-600"
                }`}
              >
                {metric.trend}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {metric.value}
            </div>
            <div className="text-sm text-slate-500">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Évolution des inscriptions
          </h3>
          <div className="bg-zinc-100 rounded-xl flex items-center justify-center h-64">
            <div className="text-center">
              <FiBarChart2 className="mx-auto text-zinc-400 mb-3" size={48} />
              <p className="text-slate-500 text-sm">
                Graphique d'évolution à intégrer
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Revenus mensuels
          </h3>
          <div className="bg-zinc-100 rounded-xl flex items-center justify-center h-64">
            <div className="text-center">
              <FiTrendingUp className="mx-auto text-zinc-400 mb-3" size={48} />
              <p className="text-slate-500 text-sm">
                Graphique de revenus à intégrer
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
