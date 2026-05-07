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
  ROLE_PRO:         { bg: "#EEF2FF", text: "#4338CA" },
  ROLE_ENTERPRISE:  { bg: "#EFF6FF", text: "#1D4ED8" },
  ROLE_CUSTOMER:    { bg: "#F5F5F7", text: "#4B5563" },
  ROLE_MODERATOR:   { bg: "#F3E8FF", text: "#7C3AED" },
  ROLE_ADMIN:       { bg: "#FEF3C7", text: "#92400E" },
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

/* ─── Main component ────────────────────────────────────────────────────────── */

const UsersTab: React.FC = () => {
  const [filters, setFilters] = useState<AdminUsersFilter>({});
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

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

  const toggleExpand = (userId: string) => {
    setExpandedId((id) => (id === userId ? null : userId));
    // Close role editor if opening details for a different row
    if (editingRoleId !== userId) setEditingRoleId(null);
  };

  const toggleVerification = (user: AdminUserResponse) => {
    updateVerification.mutate({ userId: user.userId, verified: !user.verified });
  };

  // 5 columns: user, role, verified, date, actions
  const COL_SPAN = 5;

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
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Vérification</th>
                <th>Inscrit le</th>
                <th>Actions</th>
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
                    <tr style={{ background: expandedId === user.userId ? "#F8F9FF" : undefined }}>
                      {/* Identity */}
                      <td>
                        <div className="admin-user-cell">
                          <div>
                            <strong>{user.firstName} {user.lastName}</strong>
                            <small>{user.email}</small>
                          </div>
                        </div>
                      </td>

                      {/* Role — shows editor when editing, badge otherwise */}
                      <td>
                        {editingRoleId === user.userId ? (
                          <RoleEditor
                            user={user}
                            onDone={() => setEditingRoleId(null)}
                          />
                        ) : (
                          <RoleBadge role={user.role} />
                        )}
                      </td>

                      {/* Verified toggle */}
                      <td>
                        <button
                          onClick={() => toggleVerification(user)}
                          disabled={updateVerification.isPending}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          title={user.verified ? "Retirer la vérification" : "Marquer comme vérifié"}
                        >
                          {user.verified ? (
                            <span className="admin-kyc-badge verified">
                              <FiCheckCircle /> Vérifié
                            </span>
                          ) : (
                            <span className="admin-kyc-badge rejected">
                              <FiXCircle /> Non vérifié
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="admin-text-muted">
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="admin-actions">
                          {/* Expand / collapse details */}
                          <button
                            className="admin-action-btn"
                            title={expandedId === user.userId ? "Masquer les détails" : "Voir les détails"}
                            onClick={() => toggleExpand(user.userId)}
                          >
                            {expandedId === user.userId ? <FiChevronUp /> : <FiChevronDown />}
                          </button>

                          {/* Edit role inline */}
                          <button
                            className="admin-action-btn"
                            title="Changer le rôle"
                            onClick={() =>
                              setEditingRoleId((id) =>
                                id === user.userId ? null : user.userId
                              )
                            }
                            style={{
                              color: editingRoleId === user.userId ? "#4338CA" : undefined,
                              background: editingRoleId === user.userId ? "#EEF2FF" : undefined,
                            }}
                          >
                            <span style={{ fontSize: 11, fontWeight: 600 }}>RÔLE</span>
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
