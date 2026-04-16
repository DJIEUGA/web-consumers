import React from "react";
import { FaUserShield } from "react-icons/fa";
import { FiPlus, FiMoreVertical } from "react-icons/fi";

/**
 * Admin Moderators Management Tab
 * Manage moderator accounts and permissions
 */
const ModeratorsTab: React.FC = () => {
  // TODO: Replace with useAdminModeratorsQuery() hook
  const moderators = [
    {
      id: 1,
      name: "Alice Bernard",
      email: "alice@jobty.com",
      permissions: ["users", "projects", "disputes"],
      status: "active",
      joinDate: "2025-06-15",
    },
    {
      id: 2,
      name: "Bob Rousseau",
      email: "bob@jobty.com",
      permissions: ["kyc", "projects"],
      status: "active",
      joinDate: "2025-08-20",
    },
  ];

  return (
    <div className="admin-moderators">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Gestion des modérateurs
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
          <FiPlus size={18} />
          Ajouter un modérateur
        </button>
      </div>

      {/* Moderators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {moderators.map((moderator) => (
          <div
            key={moderator.id}
            className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FaUserShield className="text-indigo-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {moderator.name}
                  </h3>
                  <p className="text-sm text-slate-500">{moderator.email}</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <FiMoreVertical size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-slate-500">
                  Permissions:
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {moderator.permissions.map((permission, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-200">
                <div>
                  <span className="text-xs text-slate-400">Membre depuis</span>
                  <p className="text-sm text-slate-600">{moderator.joinDate}</p>
                </div>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    moderator.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {moderator.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {moderators.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-12 text-center">
          <FaUserShield className="mx-auto text-zinc-300 mb-4" size={48} />
          <p className="text-slate-500">Aucun modérateur actif</p>
        </div>
      )}
    </div>
  );
};

export default ModeratorsTab;
