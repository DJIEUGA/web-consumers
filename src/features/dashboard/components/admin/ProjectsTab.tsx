import React, { useState } from "react";
import {
  FiSearch,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiLoader,
  FiCheck,
  FiX,
} from "react-icons/fi";
import {
  useAdminProjects,
  useUpdateProjectStatus,
  useDeleteProject,
} from "../../hooks/useAdminData";
import type {
  AdminProjectsFilter,
  AdminProjectStatus,
  CollaborationSpaceResponse,
} from "@/api/adminEndpoints";

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const STATUS_LABELS: Record<AdminProjectStatus, string> = {
  OPEN:        "Ouvert",
  IN_PROGRESS: "En cours",
  COMPLETED:   "Terminé",
  CANCELLED:   "Annulé",
  DISPUTED:    "Litige",
};

const STATUS_COLORS: Record<AdminProjectStatus, string> = {
  OPEN:        "#4CAF50",
  IN_PROGRESS: "#3DC7C9",
  COMPLETED:   "#28a745",
  CANCELLED:   "#F44336",
  DISPUTED:    "#FF9800",
};

const ALL_STATUSES = Object.keys(STATUS_LABELS) as AdminProjectStatus[];

/* ─── Sub-components ────────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: AdminProjectStatus }) {
  const color = STATUS_COLORS[status] ?? "#9E9E9E";
  return (
    <span className="admin-badge" style={{ backgroundColor: `${color}20`, color }}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

/** Inline status editor: replaces the badge with a <select> + confirm/cancel */
function StatusEditor({
  project,
  onDone,
}: {
  project: CollaborationSpaceResponse;
  onDone: () => void;
}) {
  const updateStatus = useUpdateProjectStatus();
  const [selected, setSelected] = useState<AdminProjectStatus>(project.status);

  const confirm = () => {
    if (selected === project.status) { onDone(); return; }
    updateStatus.mutate({ projectId: project.id, status: selected }, { onSuccess: onDone });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <select
        className="admin-filter-select"
        value={selected}
        onChange={(e) => setSelected(e.target.value as AdminProjectStatus)}
        style={{ fontSize: 12, padding: "4px 8px", minWidth: 130 }}
        autoFocus
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>
      <button
        className="admin-action-btn"
        onClick={confirm}
        disabled={updateStatus.isPending}
        title="Confirmer"
        style={{ color: "#4CAF50" }}
      >
        {updateStatus.isPending ? <FiLoader /> : <FiCheck />}
      </button>
      <button
        className="admin-action-btn"
        onClick={onDone}
        disabled={updateStatus.isPending}
        title="Annuler"
      >
        <FiX />
      </button>
    </div>
  );
}

/** Expanded detail panel rendered as a second <tr> below the project row */
function ProjectDetailRow({
  project,
  colSpan,
}: {
  project: CollaborationSpaceResponse;
  colSpan: number;
}) {
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
            padding: 16,
            background: "white",
            borderRadius: 8,
            border: "1px solid #E0E0E0",
            fontSize: 13,
          }}
        >
          {/* Brief */}
          {project.brief && (
            <div style={{ gridColumn: "1 / -1" }}>
              <span style={{ color: "#9E9E9E", fontSize: 11, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.3px" }}>
                Résumé
              </span>
              <p style={{ margin: 0, color: "#4B5563", lineHeight: 1.5 }}>{project.brief}</p>
            </div>
          )}

          {/* Customer details */}
          <div>
            <span style={{ color: "#9E9E9E", fontSize: 11, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.3px" }}>
              Client
            </span>
            <span style={{ fontWeight: 600 }}>{project.customerDetails.fullName}</span>
            <code style={{ display: "block", fontSize: 11, color: "#9E9E9E", marginTop: 2 }}>
              {project.customerDetails.userId}
            </code>
          </div>

          {/* Pro details */}
          <div>
            <span style={{ color: "#9E9E9E", fontSize: 11, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.3px" }}>
              Professionnel
            </span>
            <span style={{ fontWeight: 600 }}>{project.proDetails.fullName}</span>
            <code style={{ display: "block", fontSize: 11, color: "#9E9E9E", marginTop: 2 }}>
              {project.proDetails.userId}
            </code>
          </div>

          {/* Timestamps */}
          <div>
            <span style={{ color: "#9E9E9E", fontSize: 11, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.3px" }}>
              Créé le
            </span>
            <span style={{ color: "#4B5563" }}>
              {new Date(project.createdAt).toLocaleString("fr-FR")}
            </span>
          </div>

          <div>
            <span style={{ color: "#9E9E9E", fontSize: 11, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.3px" }}>
              Dernière mise à jour
            </span>
            <span style={{ color: "#4B5563" }}>
              {new Date(project.updatedAt).toLocaleString("fr-FR")}
            </span>
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ─── Main component ────────────────────────────────────────────────────────── */

const ProjectsTab: React.FC = () => {
  const [filters, setFilters] = useState<AdminProjectsFilter>({});
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);

  const { data: projects = [], isLoading, isError } = useAdminProjects(filters);
  const deleteProject = useDeleteProject();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: search || undefined }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as AdminProjectStatus | "";
    setFilters((f) => ({ ...f, status: value || undefined }));
  };

  const toggleExpand = (id: string) => {
    setExpandedId((curr) => (curr === id ? null : id));
    if (editingStatusId !== id) setEditingStatusId(null);
  };

  const handleDelete = (project: CollaborationSpaceResponse) => {
    if (!confirm(`Supprimer le projet "${project.title}" ? Cette action est irréversible.`)) return;
    deleteProject.mutate(project.id);
  };

  const COL_SPAN = 6;

  return (
    <div className="admin-projects-section">
      <div className="admin-section-header">
        <div>
          <h2>Gestion des projets</h2>
          <p className="admin-section-subtitle">
            {isLoading ? "Chargement…" : `${projects.length} projets`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <select className="admin-filter-select" onChange={handleStatusFilter}>
          <option value="">Tous les statuts</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>

        <form className="admin-search-box" onSubmit={handleSearch}>
          <FiSearch />
          <input
            type="text"
            placeholder="Titre du projet…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {/* Loading / error */}
      {isLoading && (
        <div className="admin-empty-state">
          <FiLoader className="admin-spinner" /> Chargement des projets…
        </div>
      )}
      {isError && (
        <div className="admin-alert admin-alert-danger">
          Impossible de charger les projets.
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Client</th>
                <th>Professionnel</th>
                <th>Statut</th>
                <th>Créé le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={COL_SPAN} style={{ textAlign: "center", padding: 32 }}>
                    Aucun projet trouvé
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <React.Fragment key={project.id}>
                    <tr style={{ background: expandedId === project.id ? "#F8F9FF" : undefined }}>
                      {/* Title */}
                      <td>
                        <strong>{project.title}</strong>
                      </td>

                      {/* Participants */}
                      <td>{project.customerDetails.fullName}</td>
                      <td>{project.proDetails.fullName}</td>

                      {/* Status — shows editor when editing, badge otherwise */}
                      <td>
                        {editingStatusId === project.id ? (
                          <StatusEditor
                            project={project}
                            onDone={() => setEditingStatusId(null)}
                          />
                        ) : (
                          <StatusBadge status={project.status} />
                        )}
                      </td>

                      {/* Date */}
                      <td className="admin-text-muted">
                        {new Date(project.createdAt).toLocaleDateString("fr-FR")}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="admin-actions">
                          {/* Expand / collapse details */}
                          <button
                            className="admin-action-btn"
                            title={expandedId === project.id ? "Masquer les détails" : "Voir les détails"}
                            onClick={() => toggleExpand(project.id)}
                          >
                            {expandedId === project.id ? <FiChevronUp /> : <FiChevronDown />}
                          </button>

                          {/* Edit status inline */}
                          <button
                            className="admin-action-btn"
                            title="Changer le statut"
                            onClick={() =>
                              setEditingStatusId((id) =>
                                id === project.id ? null : project.id
                              )
                            }
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: editingStatusId === project.id ? "#3DC7C9" : undefined,
                              background: editingStatusId === project.id ? "#E0F7FA" : undefined,
                            }}
                          >
                            <span style={{ fontSize: 10, fontWeight: 700 }}>STATUT</span>
                          </button>

                          {/* Delete */}
                          <button
                            className="admin-action-btn"
                            title="Supprimer le projet"
                            onClick={() => handleDelete(project)}
                            disabled={deleteProject.isPending}
                            style={{ color: "#F44336" }}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable detail row */}
                    {expandedId === project.id && (
                      <ProjectDetailRow project={project} colSpan={COL_SPAN} />
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="admin-legend">
        {ALL_STATUSES.map((s) => (
          <span key={s} className="admin-legend-item">
            <span
              style={{
                display: "inline-block",
                width: 8, height: 8,
                borderRadius: "50%",
                background: STATUS_COLORS[s],
                marginRight: 4,
              }}
            />
            {STATUS_LABELS[s]}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProjectsTab;
