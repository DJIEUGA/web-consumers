import React, { useState } from "react";
import {
  FiSearch,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiCheck,
  FiX,
  FiCopy,
  FiEye,
  FiEdit2,
  FiMoreVertical,
  FiMapPin,
  FiStar,
  FiClock,
} from "react-icons/fi";
import {
  useAdminUsers,
  useUpdateUserRole,
  useUpdateUserVerification,
} from "../../hooks/useAdminData";
import type { AdminUserResponse, AdminUsersFilter, UserRole } from "@/api/adminEndpoints";

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const ROLE_LABELS: Record<UserRole, string> = {
  ROLE_CUSTOMER: "Client",
  ROLE_PRO: "Professionnel",
  ROLE_ENTERPRISE: "Entreprise",
  ROLE_ADMIN: "Admin",
  ROLE_MODERATOR: "Modérateur",
};

const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  ROLE_PRO:         { bg: "#E0F2F1", text: "#00796B" },
  ROLE_ENTERPRISE:  { bg: "#E3F2FD", text: "#1976D2" },
  ROLE_CUSTOMER:    { bg: "#F5F5F5", text: "#616161" },
  ROLE_MODERATOR:   { bg: "#F3E5F5", text: "#7B1FA2" },
  ROLE_ADMIN:       { bg: "#FFF9C4", text: "#FBC02D" },
};

const ALL_ROLES = Object.keys(ROLE_LABELS) as UserRole[];

/* ─── Sub-components ────────────────────────────────────────────────────────── */

function RoleBadge({ role }: { role: UserRole }) {
  const color = ROLE_COLORS[role] ?? { bg: "#F5F5F7", text: "#4B5563" };
  return (
    <span className="admin-badge" style={{ backgroundColor: color.bg, color: color.text }}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

/** Inline role editor: replaces the badge with a <select> + confirm/cancel */
function RoleEditor({
  user,
  onDone,
}: {
  user: AdminUserResponse;
  onDone: () => void;
}) {
  const updateRole = useUpdateUserRole();
  const [selected, setSelected] = useState<UserRole>(user.role);

  const confirm = () => {
    if (selected === user.role) { onDone(); return; }
    updateRole.mutate({ userId: user.userId, role: selected }, { onSuccess: onDone });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <select
        className="admin-filter-select"
        value={selected}
        onChange={(e) => setSelected(e.target.value as UserRole)}
        style={{ fontSize: 12, padding: "4px 8px", minWidth: 140 }}
        autoFocus
      >
        {ALL_ROLES.map((r) => (
          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
        ))}
      </select>
      <button
        className="admin-action-btn"
        onClick={confirm}
        disabled={updateRole.isPending}
        title="Confirmer"
        style={{ color: "#4CAF50" }}
      >
        {updateRole.isPending ? <FiLoader /> : <FiCheck />}
      </button>
      <button
        className="admin-action-btn"
        onClick={onDone}
        disabled={updateRole.isPending}
        title="Annuler"
      >
        <FiX />
      </button>
    </div>
  );
}

/** Expanded detail panel rendered as a second <tr> below the user row */
function UserDetailRow({
  user,
  colSpan,
}: {
  user: AdminUserResponse;
  colSpan: number;
}) {
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(user.userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <tr>
      <td
        colSpan={colSpan}
        style={{ padding: "0 16px 16px", background: "#F8F9FF" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px 32px",
            padding: "16px",
            background: "white",
            borderRadius: 8,
            border: "1px solid #E0E0E0",
            fontSize: 13,
          }}
        >
          {/* User ID */}
          <div>
            <span style={{ color: "#9E9E9E", fontSize: 11, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.3px" }}>
              ID utilisateur
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <code style={{ fontSize: 11, color: "#4B5563", background: "#F5F5F7", padding: "2px 6px", borderRadius: 4 }}>
                {user.userId}
              </code>
              <button
                className="admin-action-btn"
                onClick={copyId}
                title="Copier l'ID"
                style={{ width: 24, height: 24, color: copied ? "#4CAF50" : undefined }}
              >
                {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
              </button>
            </div>
          </div>

          {/* Username */}
          {user.username && (
            <div>
              <span style={{ color: "#9E9E9E", fontSize: 11, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.3px" }}>
                Nom d'utilisateur
              </span>
              <span style={{ color: "#4B5563" }}>@{user.username}</span>
            </div>
          )}

          {/* Permissions */}
          <div style={{ gridColumn: "1 / -1" }}>
            <span style={{ color: "#9E9E9E", fontSize: 11, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.3px" }}>
              Permissions ({user.permissions.length})
            </span>
            {user.permissions.length === 0 ? (
              <span style={{ color: "#BDBDBD", fontStyle: "italic" }}>Aucune permission assignée</span>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {user.permissions.map((perm) => (
                  <span key={perm} className="admin-tag" style={{ fontSize: 11 }}>
                    {perm}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span className="admin-status-pill" style={{
      backgroundColor: active ? "#E8F5E9" : "#FFF3E0",
      color: active ? "#2E7D32" : "#EF6C00",
    }}>
      {active ? "ACTIF" : "SUSPENDU"}
    </span>
  );
}

function KycBadge({ verified }: { verified: boolean }) {
  return (
    <span className={`admin-kyc-badge-pill ${verified ? "verified" : "rejected"}`}>
      {verified ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
      {verified ? "Vérifié" : "Non vérifié"}
    </span>
  );
}

/* ─── Main component ────────────────────────────────────────────────────────── */

const UsersTab: React.FC = () => {
  const [filters, setFilters] = useState<AdminUsersFilter>({});
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: users = [], isLoading, isError } = useAdminUsers(filters);
  const updateVerification = useUpdateUserVerification();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: search || undefined }));
  };

  const handleRoleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as UserRole | "";
    setFilters((f) => ({ ...f, role: value || undefined }));
  };

  const handleVerifiedFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters((f) => ({
      ...f,
      verified: value === "" ? undefined : value === "true",
    }));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u.userId));
    }
  };

  const toggleSelect = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleVerification = (user: AdminUserResponse) => {
    updateVerification.mutate({ userId: user.userId, verified: !user.verified });
  };

  const toggleExpand = (userId: string) => {
    setExpandedId((id) => (id === userId ? null : userId));
  };

  // 6 columns: checkbox, user, type, statut, kyc, actions
  const COL_SPAN = 6;

  return (
    <div className="admin-users-section">
      <div className="admin-section-header">
        <div>
          <h2>Gestion des utilisateurs</h2>
          <p className="admin-section-subtitle">
            {isLoading ? "Chargement…" : `${users.length} utilisateurs`}
          </p>
        </div>
        <button className="dash-btn-primary">
          <FiPlus /> Inviter un utilisateur
        </button>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <select className="admin-filter-select" onChange={handleRoleFilter}>
          <option value="">Tous les rôles</option>
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>

        <select className="admin-filter-select" onChange={handleVerifiedFilter}>
          <option value="">Vérification : tous</option>
          <option value="true">Vérifiés</option>
          <option value="false">Non vérifiés</option>
        </select>

        <form className="admin-search-box" onSubmit={handleSearch}>
          <FiSearch />
          <input
            type="text"
            placeholder="Nom, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {/* Loading / error */}
      {isLoading && (
        <div className="admin-empty-state">
          <FiLoader className="admin-spinner" /> Chargement des utilisateurs…
        </div>
      )}
      {isError && (
        <div className="admin-alert admin-alert-danger">
          Impossible de charger les utilisateurs. Vérifiez votre connexion.
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedIds.length === users.length}
                    onChange={toggleSelectAll}
                    className="admin-checkbox"
                  />
                </th>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>KYC</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={COL_SPAN} style={{ textAlign: "center", padding: 32 }}>
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <React.Fragment key={user.userId}>
                    <tr className={selectedIds.includes(user.userId) ? "selected" : ""}>
                      {/* Checkbox */}
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(user.userId)}
                          onChange={() => toggleSelect(user.userId)}
                          className="admin-checkbox"
                        />
                      </td>

                      {/* Identity */}
                      <td>
                        <div className="admin-user-cell">
                          <img
                            src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random&color=fff`}
                            alt=""
                            className="admin-avatar"
                          />
                          <div>
                            <strong>{user.firstName} {user.lastName}</strong>
                            <small>{user.email}</small>
                            <span className="admin-inscribed-date">
                              Inscrit: {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td>
                        <div className="admin-user-type">
                          {editingRoleId === user.userId ? (
                            <RoleEditor
                              user={user}
                              onDone={() => setEditingRoleId(null)}
                            />
                          ) : (
                            <span style={{ fontWeight: 600 }}>
                              {ROLE_LABELS[user.role]}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Statut */}
                      <td>
                        <StatusPill active={user.verified} />
                      </td>

                      {/* KYC */}
                      <td>
                        <KycBadge verified={user.verified} />
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div className="admin-actions" style={{ justifyContent: "flex-end" }}>
                          <button 
                            className="admin-action-btn-circle" 
                            title="Voir l'ID et les permissions"
                            onClick={() => toggleExpand(user.userId)}
                            style={{
                              color: expandedId === user.userId ? "var(--turquoise)" : undefined,
                              borderColor: expandedId === user.userId ? "var(--turquoise)" : undefined,
                              backgroundColor: expandedId === user.userId ? "var(--turquoise-light)" : undefined,
                            }}
                          >
                            <FiEye size={14} />
                          </button>
                          <button
                            className="admin-action-btn-circle"
                            title="Modifier le rôle"
                            onClick={() => setEditingRoleId(user.userId === editingRoleId ? null : user.userId)}
                            style={{
                              color: editingRoleId === user.userId ? "var(--turquoise)" : undefined,
                              borderColor: editingRoleId === user.userId ? "var(--turquoise)" : undefined,
                              backgroundColor: editingRoleId === user.userId ? "var(--turquoise-light)" : undefined,
                            }}
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button className="admin-action-btn-circle" title="Plus">
                            <FiMoreVertical size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable detail row */}
                    {expandedId === user.userId && (
                      <UserDetailRow user={user} colSpan={COL_SPAN} />
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
