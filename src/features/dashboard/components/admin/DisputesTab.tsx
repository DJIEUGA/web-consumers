import React, { useState } from "react";
import { FiSearch, FiLoader, FiX, FiCheck } from "react-icons/fi";
import {
  useAdminDisputes,
  useResolveDispute,
  useCloseDispute,
  useDeleteDispute,
} from "../../hooks/useAdminData";
import type { AdminDisputesFilter, DisputeStatus, DisputeResponse } from "@/api/adminEndpoints";

const STATUS_LABELS: Record<DisputeStatus, string> = {
  OPEN: "Ouvert",
  IN_INVESTIGATION: "En investigation",
  RESOLVED: "Résolu",
  CLOSED: "Clôturé",
};

const STATUS_COLORS: Record<DisputeStatus, string> = {
  OPEN: "#F44336",
  IN_INVESTIGATION: "#FF9800",
  RESOLVED: "#4CAF50",
  CLOSED: "#9E9E9E",
};

function DisputeStatusBadge({ status }: { status: DisputeStatus }) {
  const color = STATUS_COLORS[status] ?? "#9E9E9E";
  return (
    <span
      className="admin-badge"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

/** Inline resolution form shown when admin clicks "Résoudre" */
function ResolveForm({
  disputeId,
  onCancel,
}: {
  disputeId: string;
  onCancel: () => void;
}) {
  const resolveDispute = useResolveDispute();
  const [decision, setDecision] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision.trim()) return;
    resolveDispute.mutate(
      {
        disputeId,
        arbitrationDecision: decision,
        refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
        paymentAmount: paymentAmount ? parseFloat(paymentAmount) : undefined,
      },
      { onSuccess: onCancel }
    );
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <textarea
        className="admin-filter-select"
        placeholder="Décision d'arbitrage *"
        value={decision}
        onChange={(e) => setDecision(e.target.value)}
        rows={3}
        style={{ resize: "vertical", fontSize: 12 }}
        required
      />
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="number"
          className="admin-filter-select"
          placeholder="Montant remboursement (F)"
          value={refundAmount}
          onChange={(e) => setRefundAmount(e.target.value)}
          min={0}
          style={{ flex: 1, fontSize: 12 }}
        />
        <input
          type="number"
          className="admin-filter-select"
          placeholder="Montant paiement (F)"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          min={0}
          style={{ flex: 1, fontSize: 12 }}
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="submit"
          className="dash-btn-primary"
          disabled={resolveDispute.isPending || !decision.trim()}
        >
          <FiCheck /> Confirmer la résolution
        </button>
        <button type="button" className="dash-btn-secondary" onClick={onCancel}>
          <FiX /> Annuler
        </button>
      </div>
    </form>
  );
}

const DisputesTab: React.FC = () => {
  const [filters, setFilters] = useState<AdminDisputesFilter>({});
  const [search, setSearch] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const { data: disputes = [], isLoading, isError } = useAdminDisputes(filters);
  const closeDispute = useCloseDispute();
  const deleteDispute = useDeleteDispute();

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as DisputeStatus | "";
    setFilters((f) => ({ ...f, status: value || undefined }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: search || undefined }));
  };

  const handleClose = (dispute: DisputeResponse) => {
    if (!confirm(`Clôturer le litige "${dispute.reason}" ?`)) return;
    closeDispute.mutate(dispute.id);
  };

  const handleDelete = (dispute: DisputeResponse) => {
    if (!confirm(`Supprimer définitivement ce litige ?`)) return;
    deleteDispute.mutate(dispute.id);
  };

  return (
    <div className="admin-disputes-section">
      <div className="admin-section-header">
        <div>
          <h2>Gestion des litiges</h2>
          <p className="admin-section-subtitle">
            {isLoading ? "Chargement…" : `${disputes.length} litiges`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <select className="admin-filter-select" onChange={handleStatusFilter}>
          <option value="">Tous les statuts</option>
          {(Object.keys(STATUS_LABELS) as DisputeStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <form className="admin-search-box" onSubmit={handleSearch}>
          <FiSearch />
          <input
            type="text"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {/* States */}
      {isLoading && (
        <div className="admin-empty-state">
          <FiLoader className="admin-spinner" /> Chargement des litiges…
        </div>
      )}
      {isError && (
        <div className="admin-alert admin-alert-danger">
          Impossible de charger les litiges.
        </div>
      )}

      {/* Dispute cards */}
      {!isLoading && !isError && (
        <div className="admin-disputes-queue">
          {disputes.length === 0 ? (
            <div className="admin-dispute-card">
              <div className="admin-dispute-info">
                <h3>Aucun litige</h3>
                <p>Il n'y a aucun litige correspondant aux filtres sélectionnés.</p>
              </div>
            </div>
          ) : (
            disputes.map((dispute) => (
              <div key={dispute.id} className="admin-dispute-card">
                <div className="admin-dispute-header">
                  <div className="admin-dispute-info">
                    <h3>{dispute.reason}</h3>
                    <p>
                      {dispute.initiatorName} vs {dispute.respondentName}
                    </p>
                    <small className="admin-text-muted">
                      Ouvert le{" "}
                      {new Date(dispute.createdAt).toLocaleDateString("fr-FR")}
                      {dispute.resolvedAt &&
                        ` · Résolu le ${new Date(dispute.resolvedAt).toLocaleDateString("fr-FR")}`}
                    </small>
                  </div>
                  <div className="admin-dispute-meta">
                    <DisputeStatusBadge status={dispute.status} />
                  </div>
                </div>

                {/* Resolution details if resolved */}
                {dispute.arbitrationDecision && (
                  <div
                    className="admin-dispute-details"
                    style={{ flexDirection: "column", gap: 4 }}
                  >
                    <strong style={{ fontSize: 12 }}>Décision :</strong>
                    <span style={{ fontSize: 12 }}>{dispute.arbitrationDecision}</span>
                    {dispute.refundAmount != null && (
                      <span style={{ fontSize: 12 }}>
                        Remboursement : {dispute.refundAmount.toLocaleString()} F
                      </span>
                    )}
                  </div>
                )}

                {/* Resolve inline form */}
                {resolvingId === dispute.id ? (
                  <ResolveForm
                    disputeId={dispute.id}
                    onCancel={() => setResolvingId(null)}
                  />
                ) : (
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    {dispute.status === "OPEN" || dispute.status === "IN_INVESTIGATION" ? (
                      <>
                        <button
                          className="dash-btn-primary"
                          onClick={() => setResolvingId(dispute.id)}
                        >
                          Résoudre
                        </button>
                        <button
                          className="dash-btn-secondary"
                          onClick={() => handleClose(dispute)}
                          disabled={closeDispute.isPending}
                        >
                          Clôturer
                        </button>
                      </>
                    ) : null}
                    <button
                      className="dash-btn-secondary"
                      onClick={() => handleDelete(dispute)}
                      disabled={deleteDispute.isPending}
                      style={{ color: "#F44336", borderColor: "#F44336", marginLeft: "auto" }}
                    >
                      Supprimer
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

export default DisputesTab;
