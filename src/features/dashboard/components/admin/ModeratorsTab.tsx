import React, { useState } from "react";
import { FiPlus, FiEdit3, FiTrash2, FiX, FiCheck, FiLoader } from "react-icons/fi";
import { FaUserShield } from "react-icons/fa";
import {
  useAdminModerators,
  useCreateModerator,
  useUpdateModerator,
  useDeleteModerator,
} from "../../hooks/useAdminData";
import type {
  ModeratorResponse,
  ModeratorCreateRequest,
  ModeratorUpdateRequest,
} from "@/api/adminEndpoints";

/* ─── Create form ───────────────────────────────────────────────────────────── */

function CreateModeratorForm({ onCancel }: { onCancel: () => void }) {
  const createModerator = useCreateModerator();
  const [form, setForm] = useState<ModeratorCreateRequest>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const set = (field: keyof ModeratorCreateRequest, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createModerator.mutate(form, { onSuccess: onCancel });
  };

  return (
    <div className="admin-config-card">
      <h3>
        <FiPlus /> Nouveau modérateur
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="admin-config-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="admin-config-item">
            <label>Prénom *</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              required
            />
          </div>
          <div className="admin-config-item">
            <label>Nom *</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              required
            />
          </div>
          <div className="admin-config-item">
            <label>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </div>
          <div className="admin-config-item">
            <label>Mot de passe *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="admin-config-actions">
          <button
            type="submit"
            className="dash-btn-primary"
            disabled={createModerator.isPending}
          >
            <FiCheck /> Créer le compte
          </button>
          <button type="button" className="dash-btn-secondary" onClick={onCancel}>
            <FiX /> Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Edit form ─────────────────────────────────────────────────────────────── */

function EditModeratorForm({
  moderator,
  onCancel,
}: {
  moderator: ModeratorResponse;
  onCancel: () => void;
}) {
  const updateModerator = useUpdateModerator();
  const [form, setForm] = useState<ModeratorUpdateRequest>({
    firstName: moderator.firstName,
    lastName: moderator.lastName,
    email: moderator.email,
    active: moderator.active,
  });

  const set = (field: keyof ModeratorUpdateRequest, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateModerator.mutate({ id: moderator.id, body: form }, { onSuccess: onCancel });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
      <div className="admin-config-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="admin-config-item">
          <label>Prénom *</label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            required
          />
        </div>
        <div className="admin-config-item">
          <label>Nom *</label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            required
          />
        </div>
        <div className="admin-config-item">
          <label>Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
        </div>
        <div className="admin-config-item" style={{ justifyContent: "center" }}>
          <label className="admin-toggle" style={{ marginTop: 20 }}>
            <input
              type="checkbox"
              checked={form.active ?? true}
              onChange={(e) => set("active", e.target.checked)}
            />
            <span className="admin-toggle-slider" />
            <span>Compte actif</span>
          </label>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          type="submit"
          className="dash-btn-primary"
          disabled={updateModerator.isPending}
        >
          <FiCheck /> Enregistrer
        </button>
        <button type="button" className="dash-btn-secondary" onClick={onCancel}>
          <FiX /> Annuler
        </button>
      </div>
    </form>
  );
}

/* ─── Main tab ──────────────────────────────────────────────────────────────── */

const ModeratorsTab: React.FC = () => {
  const { data: moderators = [], isLoading, isError } = useAdminModerators();
  const deleteModerator = useDeleteModerator();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDelete = (mod: ModeratorResponse) => {
    if (!confirm(`Supprimer le compte de ${mod.firstName} ${mod.lastName} ?`)) return;
    deleteModerator.mutate(mod.id);
  };

  return (
    <div className="admin-moderators-section">
      <div className="admin-section-header">
        <div>
          <h2>Équipe de modération</h2>
          <p className="admin-section-subtitle">
            {isLoading ? "Chargement…" : `${moderators.length} modérateur(s)`}
          </p>
        </div>
        {!showCreate && (
          <button className="dash-btn-primary" onClick={() => setShowCreate(true)}>
            <FiPlus /> Ajouter un modérateur
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && <CreateModeratorForm onCancel={() => setShowCreate(false)} />}

      {/* States */}
      {isLoading && (
        <div className="admin-empty-state">
          <FiLoader className="admin-spinner" /> Chargement des modérateurs…
        </div>
      )}
      {isError && (
        <div className="admin-alert admin-alert-danger">
          Impossible de charger les modérateurs.
        </div>
      )}

      {/* Moderator cards */}
      {!isLoading && !isError && (
        <div className="admin-moderators-grid">
          {moderators.length === 0 && !showCreate ? (
            <div className="admin-moderator-card" style={{ gridColumn: "1 / -1", textAlign: "center" }}>
              <FaUserShield style={{ fontSize: 32, color: "#BDBDBD", marginBottom: 8 }} />
              <p style={{ color: "#9E9E9E" }}>Aucun modérateur actif</p>
            </div>
          ) : (
            moderators.map((mod) => (
              <div key={mod.id} className="admin-moderator-card">
                <div className="admin-mod-header">
                  <div className="admin-mod-info">
                    <h3>
                      {mod.firstName} {mod.lastName}
                    </h3>
                    <p>Modérateur</p>
                    <small>
                      Créé le{" "}
                      {new Date(mod.createdAt).toLocaleDateString("fr-FR")}
                    </small>
                  </div>
                  <span
                    className="admin-badge"
                    style={{
                      backgroundColor: mod.active ? "#4CAF5020" : "#9E9E9E20",
                      color: mod.active ? "#4CAF50" : "#9E9E9E",
                    }}
                  >
                    {mod.active ? "Actif" : "Inactif"}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: "#6B7280", margin: "8px 0" }}>
                  {mod.email}
                </p>

                {/* Edit form inline */}
                {editingId === mod.id ? (
                  <EditModeratorForm
                    moderator={mod}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="admin-mod-actions">
                    <button
                      className="dash-btn-secondary"
                      onClick={() => setEditingId(mod.id)}
                    >
                      <FiEdit3 /> Éditer
                    </button>
                    <button
                      className="dash-btn-secondary"
                      onClick={() => handleDelete(mod)}
                      disabled={deleteModerator.isPending}
                      style={{ color: "#F44336", borderColor: "#F44336" }}
                    >
                      <FiTrash2 /> Supprimer
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ModeratorsTab;
