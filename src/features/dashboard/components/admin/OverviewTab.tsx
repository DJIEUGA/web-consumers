import React from "react";
import {
  FiUsers,
  FiBriefcase,
  FiDollarSign,
  FiStar,
  FiTrendingUp,
  FiActivity,
  FiGlobe,
  FiAlertTriangle,
  FiAlertCircle,
  FiClock,
  FiArrowRight,
  FiShield,
} from "react-icons/fi";

/**
 * Admin Overview Tab
 * Displays platform-wide statistics and recent activity
 */
const OverviewTab: React.FC = () => {
  // TODO: Replace with useAdminStatsQuery() hook
  const alerts = [
    {
      count: 12,
      text: "litiges en attente de résolution",
      bgColor: "bg-orange-50",
      borderColor: "border-l-orange-500",
      textColor: "text-orange-700",
      iconColor: "text-orange-600",
    },
    {
      count: 3,
      text: "paiements bloqués depuis +48h",
      bgColor: "bg-red-50",
      borderColor: "border-l-red-500",
      textColor: "text-red-700",
      iconColor: "text-red-600",
    },
    {
      count: 8,
      text: "vérifications KYC en attente",
      bgColor: "bg-blue-50",
      borderColor: "border-l-blue-500",
      textColor: "text-blue-700",
      iconColor: "text-blue-600",
    },
    {
      count: null,
      text: "Pic d'activité inhabituel détecté (Nigeria +340%)",
      bgColor: "bg-green-50",
      borderColor: "border-l-green-500",
      textColor: "text-green-700",
      iconColor: "text-green-600",
    },
  ];

  const todayStats = [
    {
      label: "NOUVEAUX UTILISATEURS",
      value: 127,
      trend: "+23% vs hier",
      icon: FiUsers,
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
    },
    {
      label: "NOUVEAUX PROJETS",
      value: 45,
      trend: "+18% vs hier",
      icon: FiBriefcase,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "COMMISSIONS",
      value: "124,500 F",
      trend: "+12% vs hier",
      icon: FiDollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "SATISFACTION",
      value: "4.8/5",
      trend: "Stable",
      icon: FiStar,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  const monthStats = [
    {
      label: "UTILISATEURS ACTIFS",
      value: "2,340",
      subtitle: "78% du quota",
      icon: FiUsers,
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
    },
    {
      label: "PROJETS CRÉÉS",
      value: 890,
      subtitle: "+45% vs mois dernier",
      icon: FiBriefcase,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "VOLUME TOTAL",
      value: "3.2M F",
      subtitle: "Record historique",
      icon: FiDollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "CONTRATS SIGNÉS",
      value: 234,
      subtitle: "+32% vs mois dernier",
      icon: FiActivity,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
  ];

  const platformHealth = [
    { label: "Taux de conversion", value: 68 },
    { label: "Taux de matching", value: 82 },
    { label: "Taux de succès", value: 75 },
  ];

  const recentTransactions = [
    { id: "T-8821", amount: "250,000 F", status: "VALIDÉ" },
    { id: "T-8820", amount: "125,000 F", status: "EN COURS" },
    { id: "T-8819", amount: "450,000 F", status: "VALIDÉ" },
  ];

  const pendingKYC = [
    { name: "Ibrahim Mohammed", time: "48h", priority: "high", label: "🔴 Urgent" },
    { name: "Aïcha Bah", time: "12h", priority: "medium", label: "🟡 Normal" },
    { name: "Kofi Asante", time: "2h", priority: "low", label: "🟢 Faible" },
  ];

  const activeDisputes = [
    { title: "Travail non conforme", time: "7 jours", priority: "high", label: "🔴 Urgent" },
    { title: "Problème de qualité", time: "3 jours", priority: "medium", label: "🟡 Moyen" },
    { title: "Retard de livraison", time: "1 jour", priority: "low", label: "🟢 Faible" },
  ];

  return (
    <div className="admin-overview space-y-6">
      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`${alert.bgColor} border-l-4 ${alert.borderColor} rounded-lg p-4`}
          >
            <div className="flex items-start gap-3">
              <FiAlertTriangle className={`${alert.iconColor} flex-shrink-0`} size={20} />
              <div className={`${alert.textColor} text-sm font-medium leading-tight`}>
                {alert.count && (
                  <span className="font-bold">{alert.count} </span>
                )}
                {alert.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AUJOURD'HUI Section */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          AUJOURD'HUI
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {todayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl border border-zinc-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.iconBg} w-12 h-12 rounded-full flex items-center justify-center`}>
                    <Icon className={stat.iconColor} size={24} />
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-xs text-slate-500 font-medium mb-2">
                    {stat.label}
                  </div>
                  <div className="text-3xl font-bold text-slate-900">
                    {stat.value}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {stat.trend}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CE MOIS Section */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          CE MOIS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {monthStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl border border-zinc-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.iconBg} w-12 h-12 rounded-full flex items-center justify-center`}>
                    <Icon className={stat.iconColor} size={24} />
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-xs text-slate-500 font-medium mb-2">
                    {stat.label}
                  </div>
                  <div className="text-3xl font-bold text-slate-900">
                    {stat.value}
                  </div>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  {stat.subtitle.includes("+") ? (
                    <>
                      <FiTrendingUp size={12} className="text-green-600" />
                      <span className="text-green-600 font-medium">{stat.subtitle}</span>
                    </>
                  ) : (
                    <span>{stat.subtitle}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Three Column Layout - Charts and Platform Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart Placeholder */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h4 className="text-sm font-semibold text-slate-900 mb-4">
            Activité des 7 derniers jours
          </h4>
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg h-48 flex items-center justify-center border border-dashed border-zinc-300">
            <div className="text-center">
              <FiActivity className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-xs text-slate-500">Graphique des inscriptions quotidiennes</p>
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h4 className="text-sm font-semibold text-slate-900 mb-4">
            Répartition par pays
          </h4>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg h-48 flex items-center justify-center border border-dashed border-zinc-300">
            <div className="text-center">
              <FiGlobe className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-xs text-slate-500">Distribution géographique des utilisateurs</p>
            </div>
          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h4 className="text-sm font-semibold text-slate-900 mb-4">
            Santé de la plateforme
          </h4>
          <div className="space-y-4">
            {platformHealth.map((metric) => (
              <div key={metric.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">{metric.label}</span>
                  <span className="text-sm font-bold text-slate-900">{metric.value}%</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-full transition-all"
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Three Column Layout - Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-900">Transactions récentes</h4>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                <div>
                  <div className="text-sm font-medium text-slate-900">{tx.id}</div>
                  <div className="text-xs text-slate-500">{tx.amount}</div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    tx.status === "VALIDÉ"
                      ? "bg-green-100 text-green-700"
                      : "bg-cyan-100 text-cyan-700"
                  }`}
                >
                  {tx.status}
                </span>
              </div>
            ))}
          </div>
          <button className="text-xs text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1 mt-4">
            Voir tout <FiArrowRight size={14} />
          </button>
        </div>

        {/* Pending KYC */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-900">KYC en attente</h4>
          </div>
          <div className="space-y-3">
            {pendingKYC.map((kyc) => (
              <div key={kyc.name} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">{kyc.name}</div>
                  <div className="text-xs text-slate-500">{kyc.time}</div>
                </div>
                <span className={`text-xs font-medium ${
                  kyc.priority === 'high' ? 'text-red-600' : 
                  kyc.priority === 'medium' ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {kyc.label}
                </span>
              </div>
            ))}
          </div>
          <button className="text-xs text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1 mt-4">
            Traiter <FiArrowRight size={14} />
          </button>
        </div>

        {/* Active Disputes */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-900">Litiges actifs</h4>
          </div>
          <div className="space-y-3">
            {activeDisputes.map((dispute) => (
              <div key={dispute.title} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">{dispute.title}</div>
                  <div className="text-xs text-slate-500">{dispute.time}</div>
                </div>
                <span className={`text-xs font-medium ${
                  dispute.priority === 'high' ? 'text-red-600' : 
                  dispute.priority === 'medium' ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {dispute.label}
                </span>
              </div>
            ))}
          </div>
          <button className="text-xs text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1 mt-4">
            Résoudre <FiArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
