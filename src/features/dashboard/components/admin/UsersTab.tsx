import React, { useState } from "react";
import { FiSearch, FiUserPlus, FiMoreVertical } from "react-icons/fi";

/**
 * Admin Users Management Tab
 * Browse, search, filter, and manage platform users
 */
const UsersTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // TODO: Replace with useAdminUsersQuery() hook
  const users = [
    {
      id: 1,
      name: "Jean Dupont",
      email: "jean@example.com",
      role: "ROLE_PRO",
      status: "active",
      joinDate: "2025-01-15",
    },
    {
      id: 2,
      name: "Marie Martin",
      email: "marie@example.com",
      role: "ROLE_ENTERPRISE",
      status: "active",
      joinDate: "2025-02-20",
    },
    {
      id: 3,
      name: "Pierre Dubois",
      email: "pierre@example.com",
      role: "ROLE_CUSTOMER",
      status: "inactive",
      joinDate: "2024-12-10",
    },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ROLE_PRO":
        return "bg-indigo-100 text-indigo-700";
      case "ROLE_ENTERPRISE":
        return "bg-blue-100 text-blue-700";
      case "ROLE_CUSTOMER":
        return "bg-zinc-100 text-zinc-700";
      case "ROLE_MODERATOR":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-zinc-100 text-zinc-700";
    }
  };

  return (
    <div className="admin-users">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            Gestion des utilisateurs
          </h2>
          <p className="text-sm text-slate-500">{users.length} utilisateur(s) au total</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
          <FiUserPlus size={16} />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-zinc-200 mb-6 p-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Tous les rôles</option>
            <option value="ROLE_PRO">Professionnels</option>
            <option value="ROLE_ENTERPRISE">Entreprises</option>
            <option value="ROLE_CUSTOMER">Clients</option>
            <option value="ROLE_MODERATOR">Modérateurs</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Email
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Rôle
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Statut
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Inscription
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user.id}
                className={index !== users.length - 1 ? "border-b border-zinc-100" : ""}
              >
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-slate-900">{user.name}</div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role.replace("ROLE_", "")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                      user.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{user.joinDate}</td>
                <td className="px-4 py-3">
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <FiMoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTab;
