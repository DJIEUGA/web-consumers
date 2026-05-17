import React, { useState } from "react";
import {
  FiShield,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiFileText,
  FiExternalLink,
} from "react-icons/fi";
import { useAdminKycProfiles, useUpdateKycStatus } from "../../hooks/useAdminData";
import { adminApi } from "../../services/adminApi";
import type { ProProfileKycResponse, KycStatus } from "@/api/adminEndpoints";
import AdminConfirmModal from "./AdminConfirmModal";

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const KYC_STATUS_LABELS: Record<KycStatus, string> = {
  PENDING:       "En attente",
  VERIFIED:      "Vérifié",
  REJECTED:      "Refusé",
  NOT_SUBMITTED: "Non soumis",
};

const KYC_STATUS_COLORS: Record<KycStatus, { bg: string; text: string }> = {
  PENDING:       { bg: "#FFF3E0", text: "#E65100" }, // Orange
  VERIFIED:      { bg: "#E8F5E9", text: "#2E7D32" }, // Vert
  REJECTED:      { bg: "#FFEBEE", text: "#B71C1C" }, // Rouge
  NOT_SUBMITTED: { bg: "#F5F5F7", text: "#616161" }, // Gris
};

/* ─── Sub-components ────────────────────────────────────────────────────────── */

function KycStatusBadge({ status }: { status: KycStatus }) {
  const color = KYC_STATUS_COLORS[status] ?? { bg: "#F5F5F7", text: "#616161" };
  return (
    <span className="admin-status-pill" style={{ backgroundColor: color.bg, color: color.text }}>
      {(KYC_STATUS_LABELS[status] ?? status).toUpperCase()}
    </span>
  );
}

/**
 * Downloads the KYC document as a blob and opens it in a new browser tab.
 * Works for images (JPEG/PNG) and PDF — the browser determines display.
 */
function useOpenKycDocument() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const open = async (userId: string) => {
    setLoadingId(userId);
    setErrorId(null);
    try {
      const blob = await adminApi.getKycDocument(userId);
      const url = URL.createObjectURL(blob);
      const tab = window.open(url, "_blank");
      // Revoke the object URL after the tab has had time to load the resource
      if (tab) {
        tab.addEventListener("load", () => URL.revokeObjectURL(url), { once: true });
      } else {
        // Popup blocked — let the URL live a bit longer then clean up
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }
    } catch {
      setErrorId(userId);
    } finally {
      setLoadingId(null);
    }
  };

  return { open, loadingId, errorId };
}

/** Rejection form shown in expanded row or inline */
function RejectionForm({ 
  profile, 
  onCancel, 
  onSuccess 
}: { 
  profile: ProProfileKycResponse;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [comment, setComment] = useState("");
  const updateKyc = useUpdateKycStatus();

  const handleReject = () => {
    updateKyc.mutate({
      userId: profile.userId,
      status: "REJECTED",
      comment: comment || undefined,
    }, { onSuccess });
  };

  return (
    <div className="admin-rejection-form">
      <input
        type="text"
        placeholder="Motif du refus (ex: Photo floue, document expiré...)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        autoFocus
      />
      <div className="admin-rejection-actions">
        <button className="admin-btn-confirm" onClick={handleReject} disabled={updateKyc.isPending}>
          {updateKyc.isPending ? <FiLoader className="admin-spinner" /> : "Confirmer le rejet"}
        </button>
        <button className="admin-btn-cancel" onClick={onCancel}>Annuler</button>
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────────── */

const KYCVerificationTab: React.FC = () => {
  const { data: profiles = [], isLoading, isError } = useAdminKycProfiles();
  const updateKyc = useUpdateKycStatus();
  const { open, loadingId } = useOpenKycDocument();
  
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const pendingCount = profiles.filter((p) => p.kycStatus === "PENDING").length;

  const confirmApprove = () => {
    if (!approvingId) return;
    updateKyc.mutate(
      { userId: approvingId, status: "VERIFIED" },
      { onSuccess: () => setApprovingId(null) }
    );
  };

  const COL_SPAN = 5;

  return (
    <div className="admin-kyc-section">
      <div className="admin-section-header">
        <div>
          <h2>Vérification KYC</h2>
          <p className="admin-section-subtitle">
            {isLoading ? "Chargement…" : `${pendingCount} demandes en attente`}
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="dash-stats-grid" style={{ marginBottom: 24 }}>
        {(["PENDING", "VERIFIED", "REJECTED"] as KycStatus[]).map((status) => {
          const count = profiles.filter((p) => p.kycStatus === status).length;
          const icons: Record<KycStatus, React.ReactNode> = {
            PENDING:       <FiClock />,
            VERIFIED:      <FiCheckCircle />,
            REJECTED:      <FiXCircle />,
            NOT_SUBMITTED: <FiShield />,
          };
          const color = KYC_STATUS_COLORS[status];
          return (
            <div key={status} className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: color.bg, color: color.text }}>
                {icons[status]}
              </div>
              <div className="dash-stat-content">
                <span className="dash-stat-label">{KYC_STATUS_LABELS[status]}</span>
                <span className="dash-stat-value">{count}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading / error */}
      {isLoading && (
        <div className="admin-empty-state">
          <FiLoader className="admin-spinner" /> Chargement de la file KYC…
        </div>
      )}
      {isError && (
        <div className="admin-alert admin-alert-danger">
          Impossible de charger les demandes KYC.
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Document</th>
                <th>Date de soumission</th>
                <th>Statut</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan={COL_SPAN} style={{ textAlign: "center", padding: 32 }}>
                    Aucune demande KYC trouvée
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => (
                  <React.Fragment key={profile.userId}>
                    <tr className={rejectingId === profile.userId ? "selected" : ""}>
                      {/* User */}
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-user-avatar">
                            {profile.firstName[0]}{profile.lastName[0]}
                          </div>
                          <div className="admin-user-info">
                            <strong>{profile.firstName} {profile.lastName}</strong>
                            <small>{profile.email}</small>
                          </div>
                        </div>
                      </td>

                      {/* Document */}
                      <td>
                        <div className="admin-document-cell">
                          <FiFileText size={16} />
                          <span>{profile.documentType || "N/A"}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td>
                        <div className="admin-date-cell">
                          {profile.submittedAt ? (
                            <>
                              <FiClock size={12} />
                              <span>{new Date(profile.submittedAt).toLocaleDateString("fr-FR")}</span>
                            </>
                          ) : "—"}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <KycStatusBadge status={profile.kycStatus} />
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div className="admin-actions" style={{ justifyContent: "flex-end" }}>
                          {profile.kycStatus !== "NOT_SUBMITTED" && (
                            <button
                              className="admin-action-btn-circle"
                              title="Voir le document"
                              onClick={() => open(profile.userId)}
                              disabled={loadingId === profile.userId}
                            >
                              {loadingId === profile.userId ? <FiLoader className="admin-spinner" /> : <FiExternalLink size={14} />}
                            </button>
                          )}

                          {profile.kycStatus === "PENDING" && (
                            <>
                              <button
                                className="admin-action-btn-circle"
                                title="Approuver"
                                onClick={() => setApprovingId(profile.userId)}
                                style={{ color: "var(--success)" }}
                              >
                                <FiCheckCircle size={14} />
                              </button>
                              <button
                                className="admin-action-btn-circle"
                                title="Rejeter"
                                onClick={() => setRejectingId(rejectingId === profile.userId ? null : profile.userId)}
                                style={{ 
                                  color: rejectingId === profile.userId ? "var(--danger)" : "var(--danger)",
                                  backgroundColor: rejectingId === profile.userId ? "#FEF2F2" : undefined,
                                  borderColor: rejectingId === profile.userId ? "var(--danger)" : undefined
                                }}
                              >
                                <FiXCircle size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Rejection Form Row */}
                    {rejectingId === profile.userId && (
                      <tr>
                        <td colSpan={COL_SPAN} style={{ padding: "0 16px 16px", background: "#FDF2F2" }}>
                          <div style={{ background: "white", padding: 16, borderRadius: 8, border: "1px solid #FEE2E2" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--danger)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>
                              Motif du rejet
                            </span>
                            <RejectionForm 
                              profile={profile} 
                              onCancel={() => setRejectingId(null)}
                              onSuccess={() => setRejectingId(null)}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      <AdminConfirmModal
        isOpen={approvingId !== null}
        title="Approuver le document KYC"
        message="Êtes-vous sûr de vouloir approuver ce document ? Le statut du professionnel passera à Vérifié."
        confirmLabel="Approuver"
        cancelLabel="Annuler"
        pendingLabel="Approbation..."
        confirmStyle="primary"
        isPending={updateKyc.isPending && !!approvingId}
        onConfirm={confirmApprove}
        onCancel={() => setApprovingId(null)}
      />
    </div>
  );
};

export default KYCVerificationTab;
